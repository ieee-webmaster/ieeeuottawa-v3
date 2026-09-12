// @vitest-environment node
// Run with STATIC_PUBLISHING_DB_TESTS=1; requires the project's local Docker Postgres.
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { sql, vercelPostgresAdapter, type MigrateUpArgs } from '@payloadcms/db-vercel-postgres'
import {
  BasePayload,
  buildConfig,
  createLocalReq,
  type CollectionAfterChangeHook,
  type Config,
  type Plugin,
} from 'payload'
import pg from 'pg'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Media } from '@/payload-types'
import { staticPublishingPlugin } from '@/plugins/staticPublishing'
import { readArchivedOriginal, type StaticMediaManifest } from '@/utilities/staticMediaArchive'
import {
  directDatabaseURL,
  publishingDDL,
  publishingLock,
  withProductionEditor,
} from '@/utilities/staticPublishing'

const enabled = process.env.STATIC_PUBLISHING_DB_TESTS === '1'
const databaseName = `publishing_test_${process.pid}_${randomUUID().replaceAll('-', '').slice(0, 12)}`
// Deliberately independent of POSTGRES_URL/.env: this suite can never select a remote or payload DB.
const adminURL = 'postgresql://postgres@127.0.0.1:54320/postgres'
const fixtureURL = `postgresql://postgres@127.0.0.1:54320/${databaseName}`
const version = 'publishing-integration-v1'
let admin: pg.Client | undefined
let database: pg.Client
let createdDatabase = false
let temporary: string
let archiveRoot: string
let payload: BasePayload
const instances: BasePayload[] = []
let capturedBeforeStorage = 0

const digest = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')
const picture = (background: string) =>
  sharp({ create: { width: 40, height: 40, channels: 3, background } })
    .png()
    .toBuffer()
const upload = (buffer: Buffer, filename: string) => ({
  data: buffer,
  name: filename,
  mimetype: 'image/png',
  size: buffer.length,
})
const revision = async () => {
  const result = await database.query<{ revision: string }>(
    'SELECT revision FROM static_publishing.state WHERE id',
  )
  return Number(result.rows[0]?.revision)
}
const committedManifest = async (filename: string) => {
  const result = await database.query<{ manifest: StaticMediaManifest }>(
    'SELECT manifest FROM static_publishing.media WHERE collection = $1 AND filename = $2',
    ['media', filename],
  )
  const manifest = result.rows[0]?.manifest
  if (!manifest) throw new Error(`Missing committed fixture manifest: ${filename}`)
  return manifest
}

// This reproduces cloud-storage's nested metadata save and req.file clearing without
// involving a shared Blob store. Upload processing, SQL and transactions remain real.
const clearUploadLikeCloudStorage: CollectionAfterChangeHook<Media> = async ({ doc, req }) => {
  if (req.context.skipCloudStorage || !req.file) return doc
  const transactionID = await req.transactionID
  if (!transactionID) throw new Error('Missing fixture upload transaction')
  const transaction = req.payload.db.sessions[String(transactionID)]
  if (!transaction) throw new Error('Missing fixture upload session')
  const result = await transaction.db.execute(sql`
    SELECT manifest FROM static_publishing.media
    WHERE collection = 'media' AND filename = ${doc.filename}
  `)
  expect(result.rows[0]?.manifest).toMatchObject({ sha256: digest(req.file.data) })
  capturedBeforeStorage += 1
  req.context.skipCloudStorage = true
  req.file = undefined
  req.payloadUploadSizes = undefined
  try {
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: { alt: doc.alt },
      overrideAccess: true,
      req,
    })
  } finally {
    delete req.context.skipCloudStorage
  }
  return doc
}

// Failing AFTER the publishing hooks proves revision/outbox writes roll back too.
const failAfterPublication: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => ({
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        ({ req }) => {
          if (req.context.fixtureFailAfterQueue && !req.context.skipCloudStorage) {
            throw new Error('Fixture failure after publication was queued')
          }
        },
      ],
    },
  })),
})

const fixtureConfig = (upgraded = false): Config => ({
  secret: 'isolated-static-publishing-fixture-secret',
  telemetry: false,
  admin: { disable: true, importMap: { autoGenerate: false } },
  typescript: { autoGenerate: false },
  graphQL: { disable: true },
  sharp,
  db: vercelPostgresAdapter({
    pool: { connectionString: fixtureURL, max: 5 },
    disableCreateDatabase: true,
    push: !upgraded,
    blocksAsJSON: true,
    migrationDir: path.join(temporary, 'migrations'),
  }),
  collections: [
    { slug: 'users', auth: true, fields: [] },
    { slug: 'people', fields: [{ name: 'fullName', type: 'text', required: true }] },
    {
      slug: 'media',
      fields: [{ name: 'alt', type: 'text' }],
      upload: { disableLocalStorage: true, imageSizes: [] },
      hooks: { afterChange: [clearUploadLikeCloudStorage] },
    },
    {
      slug: 'pages',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text' },
        {
          name: 'hero',
          type: 'group',
          fields: [
            { name: 'type', type: 'text', defaultValue: 'none' },
            ...(upgraded
              ? ([{ name: 'media', type: 'upload', relationTo: 'media' }] satisfies NonNullable<
                  Config['collections']
                >[number]['fields'])
              : []),
          ],
        },
        ...(upgraded
          ? ([
              {
                name: 'layout',
                type: 'blocks',
                blocks: [
                  {
                    slug: 'mediaBlock',
                    fields: [
                      { name: 'media', type: 'upload', relationTo: 'media', required: true },
                    ],
                  },
                ],
              },
            ] satisfies NonNullable<Config['collections']>[number]['fields'])
          : []),
      ],
    },
  ],
  globals: [
    {
      slug: 'header',
      fields: [{ name: 'showSocialLinkLabels', type: 'checkbox', defaultValue: false }],
    },
  ],
  plugins: [staticPublishingPlugin, failAfterPublication],
})

const initPayload = async (upgraded = false) => {
  const instance = new BasePayload()
  instances.push(instance)
  await instance.init({ config: buildConfig(fixtureConfig(upgraded)) })
  return instance
}

function isMigrationArgs(args: unknown): args is MigrateUpArgs {
  return (
    typeof args === 'object' &&
    args !== null &&
    'db' in args &&
    typeof args.db === 'object' &&
    args.db !== null &&
    'execute' in args.db &&
    typeof args.db.execute === 'function'
  )
}

function hasClosableClient(value: unknown): value is { $client: { end(): Promise<void> } } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$client' in value &&
    typeof value.$client === 'object' &&
    value.$client !== null &&
    'end' in value.$client &&
    typeof value.$client.end === 'function'
  )
}

describe('direct publishing database connection', () => {
  it('removes Neon transaction pooling while preserving the selected database and connection options', () => {
    expect(
      directDatabaseURL(
        'postgresql://fixture:p%40ss@ep-fixture-pooler.us-east-1.aws.neon.tech:5432/editor?sslmode=require&channel_binding=require',
      ),
    ).toBe(
      'postgresql://fixture:p%40ss@ep-fixture.us-east-1.aws.neon.tech:5432/editor?sslmode=require&channel_binding=require',
    )
  })

  it.each([
    'postgresql://postgres@127.0.0.1:54320/fixture',
    'postgresql://fixture@ep-fixture.us-east-1.aws.neon.tech/editor',
    'postgresql://fixture@db-pooler.example.test/editor',
    'postgresql://fixture@ep-fixture-pooler.neon.tech.example.test/editor',
  ])('does not redirect other selected endpoints: %s', (connectionString) => {
    expect(directDatabaseURL(connectionString)).toBe(connectionString)
  })
})

describe.runIf(enabled).sequential('static publishing with isolated local Postgres', () => {
  beforeAll(async () => {
    if (!/^publishing_test_\d+_[a-f0-9]{12}$/.test(databaseName))
      throw new Error('Unsafe fixture DB name')
    temporary = await mkdtemp(path.join(os.tmpdir(), 'static-publishing-db-'))
    archiveRoot = path.join(temporary, 'archive')
    vi.stubEnv('PRODUCTION_EDITOR', '1')
    vi.stubEnv('POSTGRES_URL', fixtureURL)
    vi.stubEnv('STATIC_MEDIA_ARCHIVE_DIR', archiveRoot)
    vi.stubEnv('STATIC_EDITOR_CODE_VERSION', version)
    vi.stubEnv('PAYLOAD_DROP_DATABASE', 'false')
    vi.stubEnv('PAYLOAD_MIGRATING', 'false')
    vi.stubEnv('PAYLOAD_FORCE_DRIZZLE_PUSH', 'true')
    admin = new pg.Client({ connectionString: adminURL, connectionTimeoutMillis: 3000 })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${databaseName}"`)
    createdDatabase = true
    database = new pg.Client({ connectionString: fixtureURL, connectionTimeoutMillis: 3000 })
    await database.connect()
    payload = await initPayload()
    await database.query(publishingDDL)
  }, 60000)

  beforeEach(async () => {
    capturedBeforeStorage = 0
    vi.stubEnv('STATIC_EDITOR_CODE_VERSION', version)
    await database.query(
      "UPDATE static_publishing.state SET revision = 0, phase = 'ready', code_version = $1 WHERE id",
      [version],
    )
  })

  afterAll(async () => {
    try {
      for (const instance of instances) {
        // This adapter's destroy clears Drizzle metadata but does not close its pg pool.
        if (hasClosableClient(instance.db?.drizzle)) await instance.db.drizzle.$client.end()
        await instance.destroy()
      }
      if (database) await database.end()
    } finally {
      if (createdDatabase && admin) {
        // Never drop an existing DB: this name was generated and created by this suite.
        await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`)
      }
      await admin?.end()
      if (temporary) await rm(temporary, { recursive: true, force: true })
      vi.unstubAllEnvs()
    }
  })

  it('commits collection creates, updates, deletes and global edits with one revision each', async () => {
    const person = await withProductionEditor(() =>
      payload.create({ collection: 'people', data: { fullName: 'Fixture coordinator' } }),
    )
    expect(await revision()).toBe(1)
    await withProductionEditor(() =>
      payload.update({
        collection: 'people',
        id: person.id,
        data: { fullName: 'Updated coordinator' },
      }),
    )
    expect(await revision()).toBe(2)
    expect((await payload.findByID({ collection: 'people', id: person.id })).fullName).toBe(
      'Updated coordinator',
    )
    await withProductionEditor(() =>
      payload.updateGlobal({ slug: 'header', data: { showSocialLinkLabels: true } }),
    )
    expect(await revision()).toBe(3)
    expect((await payload.findGlobal({ slug: 'header' })).showSocialLinkLabels).toBe(true)
    await withProductionEditor(() => payload.delete({ collection: 'people', id: person.id }))
    expect(await revision()).toBe(4)
  })

  it('rolls back both a failed content save and the revision written by its afterChange hook', async () => {
    await expect(
      withProductionEditor(() =>
        payload.create({
          collection: 'people',
          data: { fullName: 'Must never commit' },
          context: { fixtureFailAfterQueue: true },
        }),
      ),
    ).rejects.toThrow('Fixture failure after publication was queued')
    expect(await revision()).toBe(0)
    expect(
      (
        await payload.find({
          collection: 'people',
          where: { fullName: { equals: 'Must never commit' } },
        })
      ).totalDocs,
    ).toBe(0)
  })

  it('archives the original before storage clears req.file and suppresses nested metadata revisions', async () => {
    const bytes = await picture('#ff0000')
    const document = await withProductionEditor(() =>
      payload.create({
        collection: 'media',
        data: { alt: 'Fixture portrait' },
        file: upload(bytes, 'captured.png'),
      }),
    )
    expect(capturedBeforeStorage).toBe(1)
    expect(await revision()).toBe(1)
    expect(document.filename).toBe('captured.png')
    const manifest = await committedManifest('captured.png')
    expect(manifest.sha256).toBe(digest(bytes))
    expect(
      await readArchivedOriginal({
        root: archiveRoot,
        collection: 'media',
        filename: 'captured.png',
      }),
    ).toEqual(bytes)
  })

  it('keeps the committed same-name original authoritative when a later replacement rolls back', async () => {
    const first = await picture('#ff0000')
    const replacement = await picture('#0000ff')
    const rejected = await picture('#00ff00')
    const document = await withProductionEditor(() =>
      payload.create({
        collection: 'media',
        data: { alt: 'First photo' },
        file: upload(first, 'replacement.png'),
      }),
    )
    await withProductionEditor(() =>
      payload.update({
        collection: 'media',
        id: document.id,
        data: { alt: 'Committed replacement' },
        overwriteExistingFiles: true,
        file: upload(replacement, 'replacement.png'),
      }),
    )
    const committed = await committedManifest('replacement.png')
    expect(committed.sha256).toBe(digest(replacement))
    expect(await revision()).toBe(2)
    await expect(
      withProductionEditor(() =>
        payload.update({
          collection: 'media',
          id: document.id,
          data: { alt: 'Rejected replacement' },
          overwriteExistingFiles: true,
          file: upload(rejected, 'replacement.png'),
          context: { fixtureFailAfterQueue: true },
        }),
      ),
    ).rejects.toThrow('Fixture failure after publication was queued')
    expect(await revision()).toBe(2)
    expect(await committedManifest('replacement.png')).toEqual(committed)
    expect(await readFile(path.join(archiveRoot, committed.object))).toEqual(replacement)
    expect((await payload.findByID({ collection: 'media', id: document.id })).alt).toBe(
      'Committed replacement',
    )
    // The publisher intentionally reads the transaction's manifest, not this mutable spool pointer.
    expect(
      await readArchivedOriginal({
        root: archiveRoot,
        collection: 'media',
        filename: 'replacement.png',
      }),
    ).toEqual(rejected)
  })

  it('blocks edits under the build lock and rejects code mismatches without calling the operation', async () => {
    const operation = vi.fn(async () => 'saved')
    await database.query('SELECT pg_advisory_lock($1, $2)', [...publishingLock])
    try {
      await expect(withProductionEditor(operation)).rejects.toThrow('Production is rebuilding')
      expect(operation).not.toHaveBeenCalled()
    } finally {
      await database.query('SELECT pg_advisory_unlock($1, $2)', [...publishingLock])
    }
    vi.stubEnv('STATIC_EDITOR_CODE_VERSION', 'different-code')
    await expect(withProductionEditor(operation)).rejects.toThrow('matching code')
    expect(operation).not.toHaveBeenCalled()
    vi.stubEnv('STATIC_EDITOR_CODE_VERSION', version)
    await expect(withProductionEditor(operation)).resolves.toBe('saved')
  })

  it('holds the shared editor lock until the content transaction actually commits', async () => {
    let release: () => void = () => {}
    let entered: () => void = () => {}
    const barrier = new Promise<void>((resolve) => {
      release = resolve
    })
    const started = new Promise<void>((resolve) => {
      entered = resolve
    })
    const saving = withProductionEditor(async () => {
      const transactionID = await payload.db.beginTransaction()
      if (!transactionID) throw new Error('Fixture requires transactions')
      try {
        const req = await createLocalReq({ req: { transactionID } }, payload)
        await payload.create({ collection: 'people', data: { fullName: 'Held until commit' }, req })
        entered()
        await barrier
        await payload.db.commitTransaction(transactionID)
      } catch (error) {
        entered()
        await payload.db.rollbackTransaction(transactionID)
        throw error
      }
    })
    await started
    try {
      expect(await revision()).toBe(0)
      const lock = await database.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1, $2) AS locked',
        [...publishingLock],
      )
      expect(lock.rows[0]?.locked).toBe(false)
    } finally {
      release()
      await saving
    }
    expect(await revision()).toBe(1)
    const lock = await database.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock($1, $2) AS locked',
      [...publishingLock],
    )
    try {
      expect(lock.rows[0]?.locked).toBe(true)
    } finally {
      await database.query('SELECT pg_advisory_unlock($1, $2)', [...publishingLock])
    }
  })

  it.each(['uninitialized', 'building', 'failed'])(
    'rejects edits in phase %s even without a held build lock',
    async (phase) => {
      await database.query('UPDATE static_publishing.state SET phase = $1 WHERE id', [phase])
      const operation = vi.fn(async () => 'saved')
      await expect(withProductionEditor(operation)).rejects.toThrow('matching code')
      expect(operation).not.toHaveBeenCalled()
    },
  )

  it('keeps the actual write transaction locked after the outer guard connection is lost', async () => {
    let transactionPID: number | undefined
    let release: () => void = () => {}
    let entered: () => void = () => {}
    const barrier = new Promise<void>((resolve) => {
      release = resolve
    })
    const started = new Promise<void>((resolve) => {
      entered = resolve
    })
    const saving = withProductionEditor(async () => {
      const transactionID = await payload.db.beginTransaction()
      if (!transactionID) throw new Error('Fixture requires transactions')
      try {
        const req = await createLocalReq({ req: { transactionID } }, payload)
        const person = await payload.create({
          collection: 'people',
          data: { fullName: 'Before guard disconnect' },
          req,
        })
        const session = payload.db.sessions[String(transactionID)]
        if (!session) throw new Error('Fixture transaction disappeared')
        const backend = await session.db.execute<{ pid: number }>(
          sql`SELECT pg_backend_pid() AS pid`,
        )
        transactionPID = backend.rows[0]?.pid
        entered()
        await barrier
        // This write occurs after the independent outer connection has been terminated.
        await payload.update({
          collection: 'people',
          id: person.id,
          data: { fullName: 'Saved after guard disconnect' },
          req,
        })
        await payload.db.commitTransaction(transactionID)
        return person.id
      } catch (error) {
        entered()
        await payload.db.rollbackTransaction(transactionID)
        throw error
      }
    })
    await started
    let personID: number
    try {
      expect(transactionPID).toBeTypeOf('number')
      const guards = await database.query<{ pid: number }>(
        `SELECT locks.pid FROM pg_locks locks
         JOIN pg_stat_activity activity ON activity.pid = locks.pid
         WHERE activity.datname = current_database() AND locks.locktype = 'advisory'
           AND locks.mode = 'ShareLock' AND locks.granted
           AND locks.classid = $1::oid AND locks.objid = $2::oid AND locks.pid <> $3`,
        [...publishingLock, transactionPID],
      )
      expect(guards.rows).toHaveLength(1)
      const outerPID = guards.rows[0]?.pid
      if (!outerPID || outerPID === transactionPID)
        throw new Error('Cannot identify isolated outer guard')
      // The DB predicate additionally prevents terminating any connection outside this fixture.
      const terminated = await database.query<{ terminated: boolean }>(
        'SELECT pg_terminate_backend(pid) AS terminated FROM pg_stat_activity WHERE datname = current_database() AND pid = $1',
        [outerPID],
      )
      expect(terminated.rows[0]?.terminated).toBe(true)
      await expect
        .poll(
          async () =>
            (
              await database.query('SELECT 1 FROM pg_locks WHERE pid = $1 AND locktype = $2', [
                outerPID,
                'advisory',
              ])
            ).rowCount,
        )
        .toBe(0)
      const lock = await database.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1, $2) AS locked',
        [...publishingLock],
      )
      if (lock.rows[0]?.locked) {
        await database.query('SELECT pg_advisory_unlock($1, $2)', [...publishingLock])
      }
      expect(lock.rows[0]?.locked).toBe(false)
      expect(await revision()).toBe(0)
    } finally {
      release()
      personID = await saving
    }
    expect(await revision()).toBe(2)
    expect((await payload.findByID({ collection: 'people', id: personID })).fullName).toBe(
      'Saved after guard disconnect',
    )
    const lock = await database.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock($1, $2) AS locked',
      [...publishingLock],
    )
    try {
      expect(lock.rows[0]?.locked).toBe(true)
    } finally {
      await database.query('SELECT pg_advisory_unlock($1, $2)', [...publishingLock])
    }
  })

  it('reads a new block and image field after a real migration, retaining pre-migration content', async () => {
    const oldPage = await withProductionEditor(() =>
      payload.create({
        collection: 'pages',
        data: {
          title: 'Before schema change',
          slug: 'before-schema-change',
          hero: { type: 'none' },
          layout: [],
        },
      }),
    )
    const bytes = await picture('#999999')
    const image = await withProductionEditor(() =>
      payload.create({
        collection: 'media',
        data: { alt: 'Migrated image' },
        file: upload(bytes, 'migration.png'),
      }),
    )
    const before = await revision()
    const upgraded = await initPayload(true)
    // Only remove the dev-push marker from this newly-created fixture DB; no data/schema reset.
    await database.query('DELETE FROM payload_migrations WHERE batch = -1')
    await upgraded.db.migrate({
      migrations: [
        {
          name: '20260911_000001_fixture_image_block',
          up: async (args) => {
            if (!isMigrationArgs(args)) throw new Error('Missing migration transaction')
            await args.db.execute(
              sql`ALTER TABLE pages ADD COLUMN hero_media_id integer REFERENCES media(id), ADD COLUMN layout jsonb`,
            )
          },
          down: async (args) => {
            if (!isMigrationArgs(args)) throw new Error('Missing migration transaction')
            await args.db.execute(
              sql`ALTER TABLE pages DROP COLUMN hero_media_id, DROP COLUMN layout`,
            )
          },
        },
      ],
    })
    expect(await revision()).toBe(before)
    expect((await upgraded.findByID({ collection: 'pages', id: oldPage.id })).title).toBe(
      'Before schema change',
    )
    await withProductionEditor(() =>
      upgraded.update({
        collection: 'pages',
        id: oldPage.id,
        data: { hero: { media: image.id }, layout: [{ blockType: 'mediaBlock', media: image.id }] },
      }),
    )
    const saved = await upgraded.findByID({ collection: 'pages', id: oldPage.id, depth: 1 })
    expect(saved.hero.media).toMatchObject({ id: image.id, filename: 'migration.png' })
    expect(saved.layout?.[0]).toMatchObject({
      blockType: 'mediaBlock',
      media: { id: image.id, filename: 'migration.png' },
    })
    expect(await revision()).toBe(before + 1)
    const migrations = await database.query<{ name: string }>('SELECT name FROM payload_migrations')
    expect(migrations.rows.map((row) => row.name)).toContain('20260911_000001_fixture_image_block')
  })
})

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import pg from 'pg'

// A separate schema keeps operational state outside Payload's generated schema.
export const publishingDDL = `
  CREATE SCHEMA IF NOT EXISTS static_publishing;
  CREATE TABLE IF NOT EXISTS static_publishing.state (
    id boolean PRIMARY KEY DEFAULT true CHECK (id),
    revision bigint NOT NULL DEFAULT 0,
    published_revision bigint NOT NULL DEFAULT -1,
    code_version text NOT NULL DEFAULT '',
    commit_sha text NOT NULL DEFAULT '',
    phase text NOT NULL DEFAULT 'uninitialized'
  );
  INSERT INTO static_publishing.state (id) VALUES (true) ON CONFLICT DO NOTHING;
  CREATE TABLE IF NOT EXISTS static_publishing.media (
    collection text NOT NULL, filename text NOT NULL, manifest jsonb NOT NULL,
    PRIMARY KEY (collection, filename)
  );
`

export const publishingLock = [194951, 20261001] as const

export class PublishingUnavailable extends Error {}

export function directDatabaseURL(connectionString: string): string {
  const url = new URL(connectionString)
  // Neon transaction pooling cannot preserve session advisory locks. Derive the
  // direct endpoint from the SAME selected DB, rather than falling back to an
  // unrelated DATABASE_URL/backup credential from the surrounding environment.
  if (url.hostname.endsWith('.neon.tech')) url.hostname = url.hostname.replace('-pooler.', '.')
  return url.toString()
}

export function codeVersion(root = process.cwd()): string {
  const walk = (directory: string): string[] =>
    readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(directory, entry.name)
      if (relative === 'scripts/import-legacy-content/data') return []
      return entry.isDirectory() ? walk(relative) : entry.isFile() ? [relative] : []
    })
  // Vercel source archives need not contain .git. Released editor clones and
  // cloud builds hash the same source files; media-only commits keep this stable.
  const files = [
    ...walk('src'),
    ...walk('scripts'),
    ...walk('messages'),
    'package.json',
    'pnpm-lock.yaml',
    'next.config.js',
    'tsconfig.json',
    'tsconfig.static.json',
    'vercel.json',
    'next-sitemap.config.cjs',
  ].sort()
  const hash = createHash('sha256')
  for (const file of files)
    hash
      .update(file)
      .update('\0')
      .update(readFileSync(path.join(root, file)))
      .update('\0')
  return hash.digest('hex')
}

export async function publishingClient() {
  if (!process.env.POSTGRES_URL)
    throw new Error('POSTGRES_URL must explicitly select the publishing database')
  const client = new pg.Client({
    connectionString: directDatabaseURL(process.env.POSTGRES_URL),
    connectionTimeoutMillis: 15000,
  })
  // Avoid an unhandled event if the database drops a long-running build's lock.
  client.on('error', () => {})
  await client.connect()
  return client
}

/** Hold the lock through the complete operation, including Payload's commit. */
export async function withProductionEditor<T>(operation: () => Promise<T>): Promise<T> {
  if (process.env.PRODUCTION_EDITOR !== '1') return operation()
  const client = await publishingClient()
  try {
    const lock = await client.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock_shared($1, $2) AS locked',
      [...publishingLock],
    )
    if (!lock.rows[0]?.locked)
      throw new PublishingUnavailable(
        'Production is rebuilding. Please retry this edit when the release finishes.',
      )
    const state = await client.query<{ phase: string; code_version: string }>(
      'SELECT phase, code_version FROM static_publishing.state WHERE id',
    )
    if (
      state.rows[0]?.phase !== 'ready' ||
      state.rows[0].code_version !== process.env.STATIC_EDITOR_CODE_VERSION
    ) {
      throw new PublishingUnavailable(
        'Production editor is waiting for a successful release of matching code. Check the publisher terminal.',
      )
    }
    return await operation()
  } finally {
    await client.end()
  }
}

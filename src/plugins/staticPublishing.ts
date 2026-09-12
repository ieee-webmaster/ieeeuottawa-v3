import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
  Plugin,
} from 'payload'
import { archiveOriginal } from '@/utilities/staticMediaArchive'
import { publishingLock } from '@/utilities/staticPublishing'

async function transactionDB(req: PayloadRequest) {
  const transactionID = await req.transactionID
  if (!transactionID)
    throw new Error('Static publication must be recorded inside the content transaction')
  const session = req.payload.db.sessions[String(transactionID)]
  if (!session) throw new Error('Missing content transaction')
  return session.db
}

async function changed(req: PayloadRequest) {
  if (req.context.skipCloudStorage) return
  const db = await transactionDB(req)
  await db.execute(sql`UPDATE static_publishing.state SET revision = revision + 1 WHERE id`)
}

async function guardTransaction(req: PayloadRequest) {
  const db = await transactionDB(req)
  // This lock belongs to the actual content transaction. It survives loss of
  // the HTTP guard's separate connection and is released only on commit/rollback.
  const lock = await db.execute<{ locked: boolean }>(
    sql`SELECT pg_try_advisory_xact_lock_shared(${publishingLock[0]}, ${publishingLock[1]}) AS locked`,
  )
  if (!lock.rows[0]?.locked)
    throw new APIError('Production is publishing. Please retry saving after the release.', 503)
  const state = await db.execute<{ phase: string; code_version: string }>(
    sql`SELECT phase, code_version FROM static_publishing.state WHERE id`,
  )
  if (
    state.rows[0]?.phase !== 'ready' ||
    state.rows[0].code_version !== process.env.STATIC_EDITOR_CODE_VERSION
  ) {
    throw new APIError('Production editor is waiting for a matching successful release.', 503)
  }
}

// Runs BEFORE cloud storage's afterChange hook, which clears req.file during its
// nested metadata update. The archive bytes are durable before the DB commit;
// only this transaction's manifest becomes visible to the publisher.
const captureOriginal: CollectionAfterChangeHook<{
  id: string | number
  filename?: string
  mimeType?: string
}> = async ({ doc, req, collection }) => {
  if (
    !req.context.skipCloudStorage &&
    req.file &&
    typeof doc.filename === 'string' &&
    typeof doc.mimeType === 'string'
  ) {
    const manifest = await archiveOriginal({
      root: process.env.STATIC_MEDIA_ARCHIVE_DIR,
      collection: collection.slug,
      filename: doc.filename,
      mimeType: doc.mimeType,
      buffer: req.file.data,
    })
    const db = await transactionDB(req)
    await db.execute(sql`
      INSERT INTO static_publishing.media (collection, filename, manifest)
      VALUES (${collection.slug}, ${doc.filename}, ${JSON.stringify(manifest)}::jsonb)
      ON CONFLICT (collection, filename) DO UPDATE SET manifest = EXCLUDED.manifest
    `)
  }
  return doc
}

const collectionChanged: CollectionAfterChangeHook = async ({ req }) => {
  await changed(req)
}
const globalChanged: GlobalAfterChangeHook = async ({ req }) => {
  await changed(req)
}

export const staticPublishingPlugin: Plugin = (config) => {
  if (process.env.PRODUCTION_EDITOR !== '1') return config
  if (!process.env.STATIC_MEDIA_ARCHIVE_DIR || !process.env.STATIC_EDITOR_CODE_VERSION) {
    throw new Error('Start the production editor with pnpm cms:production')
  }
  return {
    ...config,
    collections: config.collections?.map((collection) => {
      const guarded = {
        ...collection,
        hooks: {
          ...collection.hooks,
          beforeValidate: [
            async ({ req }: { req: PayloadRequest }) => {
              await guardTransaction(req)
            },
            ...(collection.hooks?.beforeValidate ?? []),
          ],
          beforeDelete: [
            async ({ req }: { req: PayloadRequest }) => {
              await guardTransaction(req)
            },
            ...(collection.hooks?.beforeDelete ?? []),
          ],
        },
      }
      if (
        collection.auth ||
        collection.slug.startsWith('payload-') ||
        collection.custom?.staticPublishing === false
      )
        return guarded
      return {
        ...guarded,
        hooks: {
          ...guarded.hooks,
          afterChange: [
            ...(collection.slug === 'media' ? [captureOriginal] : []),
            ...(collection.hooks?.afterChange ?? []),
            collectionChanged,
          ],
          afterDelete: [
            ...(collection.hooks?.afterDelete ?? []),
            async ({ req }) => {
              await changed(req)
            },
          ],
        },
      }
    }),
    globals: config.globals?.map((global) => ({
      ...global,
      hooks: {
        ...global.hooks,
        beforeValidate: [
          async ({ req }) => {
            await guardTransaction(req)
          },
          ...(global.hooks?.beforeValidate ?? []),
        ],
        afterChange: [...(global.hooks?.afterChange ?? []), globalChanged],
      },
    })),
  }
}

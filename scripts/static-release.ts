import { spawn } from 'node:child_process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import {
  codeVersion,
  publishingClient,
  publishingDDL,
  publishingLock,
} from '../src/utilities/staticPublishing'
import { readArchivedOriginal, type StaticMediaManifest } from '../src/utilities/staticMediaArchive'

const client = await publishingClient()
let locked = false
let startedBuild = false
try {
  await client.query('SELECT pg_advisory_lock($1, $2)', [...publishingLock])
  locked = true
  await client.query(publishingDDL)
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    const remote = await promisify(execFile)('git', [
      'ls-remote',
      'https://github.com/ieee-webmaster/ieeeuottawa-v3.git',
      'refs/heads/infra/static-compilation',
    ])
    if (remote.stdout.split(/\s/)[0] !== process.env.VERCEL_GIT_COMMIT_SHA) {
      throw new Error(
        'A newer production commit exists; this obsolete build will not migrate or publish',
      )
    }
  }
  const version = codeVersion()
  const state = await client.query<{ revision: string }>(
    'SELECT revision FROM static_publishing.state WHERE id',
  )
  const revision = z.string().parse(state.rows[0]?.revision)
  // A code push may race a new upload. Stop before touching the schema if this
  // commit doesn't yet contain the committed originals; the publisher will retry.
  const media = await client.query<{ manifest: StaticMediaManifest }>(
    'SELECT manifest FROM static_publishing.media',
  )
  const archiveRoot = process.env.STATIC_MEDIA_ARCHIVE_DIR || path.resolve('public-cms-media')
  for (const { manifest } of media.rows) {
    const saved = z
      .object({ sha256: z.string() })
      .parse(
        JSON.parse(
          await readFile(
            path.join(
              archiveRoot,
              'index',
              manifest.collection,
              `${encodeURIComponent(manifest.filename)}.json`,
            ),
            'utf8',
          ),
        ),
      )
    if (saved.sha256 !== manifest.sha256)
      throw new Error(`Pending media has not reached Git: ${manifest.filename}`)
    await readArchivedOriginal({
      root: archiveRoot,
      collection: manifest.collection,
      filename: manifest.filename,
    })
  }
  await client.query("UPDATE static_publishing.state SET phase = 'building' WHERE id")
  startedBuild = true
  const code = await new Promise<number>((resolve, reject) => {
    const child = spawn('node', ['scripts/build-static.mjs', '--migrate'], {
      stdio: 'inherit',
      detached: true,
      env: { ...process.env, STATIC_RELEASE_LOCKED: '1' },
    })
    // If the lock connection dies, terminate the build rather than export while
    // edits/migrations can run concurrently.
    const stopBuild = () => {
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGKILL')
        } catch (error) {
          if (!(error instanceof Error) || !('code' in error) || error.code !== 'ESRCH') throw error
        }
      }
    }
    client.once('error', stopBuild)
    process.once('SIGINT', stopBuild)
    process.once('SIGTERM', stopBuild)
    child.on('error', reject)
    child.on('exit', (code) => {
      client.off('error', stopBuild)
      process.off('SIGINT', stopBuild)
      process.off('SIGTERM', stopBuild)
      resolve(code ?? 1)
    })
  })
  if (code !== 0) throw new Error(`Static release failed with exit ${code}`)
  await client.query(
    "UPDATE static_publishing.state SET phase = 'built', code_version = $1, commit_sha = $2, published_revision = $3 WHERE id",
    [
      version,
      process.env.VERCEL_GIT_COMMIT_SHA || process.env.STATIC_RELEASE_COMMIT || '',
      revision,
    ],
  )
  console.log(`Static release built at content revision ${revision}`)
} catch (error) {
  if (locked && startedBuild)
    await client
      .query("UPDATE static_publishing.state SET phase = 'failed' WHERE id")
      .catch(() => {})
  throw error
} finally {
  await client.end()
}

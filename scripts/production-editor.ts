import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'dotenv'
import { z } from 'zod'
import { archiveOriginal, type StaticMediaManifest } from '../src/utilities/staticMediaArchive'
import { codeVersion, publishingClient, publishingDDL } from '../src/utilities/staticPublishing'
import { commitStagedChanges } from './github-signed-commit'

const exec = promisify(execFile)
const root = process.cwd()
const stateRoot = path.join(root, '.production-editor')
const archiveRoot = path.join(stateRoot, 'archive')
const mediaRoot = path.join(stateRoot, 'media')
const publisherRoot = path.join(stateRoot, 'publisher')
const editorRoot = path.join(stateRoot, 'editor')
const branch = 'infra/static-compilation'
const scope = 'ieee-uottawa-webmaster'
const project = 'ieeeuottawa-v3'
const port = 3010
const production = parse(await readFile(path.join(root, '.env.vercel.production.local')))
if (
  !production.POSTGRES_URL ||
  !production.PAYLOAD_SECRET ||
  production.POSTGRES_URL === production.BACKUP_POSTGRES_URL
) {
  throw new Error(
    'Production editor requires the primary POSTGRES_URL and PAYLOAD_SECRET in .env.vercel.production.local',
  )
}
process.env.POSTGRES_URL = production.POSTGRES_URL
let client = await publishingClient()
let connectionLost = false
let editor: ChildProcess | undefined
let editorVersion = ''
let closing = false
let wake: (() => void) | undefined
let lastMessage = ''
let retryAt = 0
const safeError = (error: unknown) => {
  const message =
    error instanceof Error ? (error.message.split('\n')[0] ?? error.name) : 'Unknown error'
  return message.replace(/(?:postgres(?:ql)?|https?):\/\/[^\s]+/g, '[connection]')
}
const log = (message: string) => {
  if (message !== lastMessage) console.log(`[publisher] ${message}`)
  lastMessage = message
}
const run = async (command: string, args: string[], cwd = root) =>
  (await exec(command, args, { cwd, maxBuffer: 16 * 1024 * 1024 })).stdout.trim()
const git = (cwd: string, ...args: string[]) => run('git', args, cwd)
const exists = async (filename: string) => {
  try {
    await access(filename)
    return true
  } catch {
    return false
  }
}

async function ensureClone(directory: string) {
  if (await exists(path.join(directory, '.git'))) return
  const remote = await git(root, 'remote', 'get-url', 'origin')
  await run('git', ['clone', '--no-checkout', remote, directory])
  for (const key of ['user.name', 'user.email']) {
    const value = await git(root, 'config', key)
    if (!value) throw new Error(`Configure git ${key} before starting the publisher`)
    await git(directory, 'config', key, value)
  }
}

async function stopEditor() {
  const child = editor
  editor = undefined
  if (!child?.pid || child.exitCode !== null) return
  const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()))
  process.kill(-child.pid, 'SIGTERM')
  await exited
}

async function readyCommit(): Promise<string | undefined> {
  const response = z
    .object({
      deployments: z
        .array(z.object({ meta: z.object({ githubCommitSha: z.string().optional() }).optional() }))
        .optional(),
    })
    .parse(
      JSON.parse(
        await run('vercel', [
          'api',
          `/v6/deployments?projectId=${project}&target=production&state=READY&limit=1`,
          '--scope',
          scope,
        ]),
      ),
    )
  return response.deployments?.[0]?.meta?.githubCommitSha
}

async function startReleasedEditor(commit: string, version: string) {
  if (editor && editorVersion === version) return
  await stopEditor()
  await ensureClone(editorRoot)
  await git(editorRoot, 'fetch', 'origin', branch)
  await git(editorRoot, 'checkout', '--detach', commit)
  if (codeVersion(editorRoot) !== version)
    throw new Error(
      'Ready deployment does not match the database release; waiting for the next release',
    )
  log('Installing the released editor dependencies…')
  await run('pnpm', ['install', '--frozen-lockfile'], editorRoot)
  log('Preparing the released media for the production editor…')
  await exec('node', ['--import', 'tsx', 'scripts/build-static-media.ts'], {
    cwd: editorRoot,
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      ...production,
      NODE_ENV: 'production',
      PRODUCTION_EDITOR: '0',
      STATIC_EXPORT: '1',
      STATIC_MEDIA_OUTPUT_DIR: mediaRoot,
      STATIC_MEDIA_ARCHIVE_DIR: path.join(editorRoot, 'public-cms-media'),
    },
  })
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...production,
    NODE_ENV: 'development',
    PRODUCTION_EDITOR: '1',
    NEXT_PUBLIC_PRODUCTION_EDITOR: '1',
    STATIC_EXPORT: '0',
    STATIC_EDITOR_CODE_VERSION: version,
    STATIC_MEDIA_ARCHIVE_DIR: archiveRoot,
    STATIC_MEDIA_RUNTIME_DIR: mediaRoot,
    NEXT_PUBLIC_SERVER_URL: `http://localhost:${port}`,
  }
  delete env.PAYLOAD_DROP_DATABASE
  delete env.VERCEL_ENV
  editor = spawn(
    'pnpm',
    ['exec', 'next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    { cwd: editorRoot, env, stdio: 'inherit', detached: true },
  )
  editor.once('exit', () => {
    editor = undefined
  })
  editorVersion = version
  log(
    `Production editor: http://localhost:${port}/admin — saves publish automatically. Keep this process running.`,
  )
}

async function queuePublication(revision: string) {
  await ensureClone(publisherRoot)
  await git(publisherRoot, 'fetch', 'origin', branch)
  // This clone is exclusively owned by the publisher. The user's checkout is
  // never checked out, staged, reset, or committed by this process.
  await git(publisherRoot, 'reset', '--hard', `origin/${branch}`)
  const remoteMarker = path.join(publisherRoot, 'public-cms-media', 'revision.json')
  if (await exists(remoteMarker)) {
    const marker = z
      .object({ revision: z.string() })
      .parse(JSON.parse(await readFile(remoteMarker, 'utf8')))
    if (marker.revision === revision) return
  }
  const media = await client.query<{ manifest: StaticMediaManifest }>(
    'SELECT manifest FROM static_publishing.media ORDER BY collection, filename',
  )
  for (const { manifest } of media.rows) {
    // Use the manifest from the COMMITTED transaction, never the mutable spool
    // index: a rolled-back replacement can leave unused bytes in that spool.
    if (!/^objects\/[a-f0-9]{64}\.[a-z0-9]{1,16}$/.test(manifest.object))
      throw new Error('Invalid queued media object')
    const buffer = await readFile(path.join(archiveRoot, manifest.object)).catch(
      (error: unknown) => {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          // A new editor checkout can recover already published originals from
          // Git. Only genuinely pending uploads require the local durable spool.
          return readFile(path.join(publisherRoot, 'public-cms-media', manifest.object))
        }
        throw error
      },
    )
    const saved = await archiveOriginal({
      root: path.join(publisherRoot, 'public-cms-media'),
      collection: manifest.collection,
      filename: manifest.filename,
      mimeType: manifest.mimeType,
      buffer,
    })
    if (saved.sha256 !== manifest.sha256)
      throw new Error(`Corrupt queued original: ${manifest.filename}`)
  }
  await mkdir(path.dirname(remoteMarker), { recursive: true })
  await writeFile(remoteMarker, JSON.stringify({ version: 1, revision }, null, 2) + '\n')
  await git(publisherRoot, 'add', '--', 'public-cms-media')
  await commitStagedChanges({
    directory: publisherRoot,
    repository: 'ieee-webmaster/ieeeuottawa-v3',
    branch,
    expectedHeadOid: await git(publisherRoot, 'rev-parse', 'HEAD'),
    headline: `chore(content): publish CMS revision ${revision}`,
  })
  log(`Queued revision ${revision}; Vercel will migrate, build, and validate it.`)
}

await mkdir(archiveRoot, { recursive: true })
// A session lock prevents two local publishers from racing commits or editors.
async function reservePublisher() {
  client.once('error', () => {
    connectionLost = true
  })
  const singleton = await client.query<{ locked: boolean }>(
    'SELECT pg_try_advisory_lock(194951, 3010) AS locked',
  )
  if (!singleton.rows[0]?.locked) {
    await client.end()
    throw new Error('Another production publisher is already running')
  }
  await client.query(publishingDDL)
}
await reservePublisher()
const shutdown = () => {
  closing = true
  wake?.()
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
try {
  while (!closing) {
    try {
      if (connectionLost) {
        await stopEditor()
        await client.end().catch(() => {})
        client = await publishingClient()
        await reservePublisher()
        connectionLost = false
      }
      const result = await client.query<{
        revision: string
        published_revision: string
        code_version: string
        commit_sha: string
        phase: string
      }>('SELECT * FROM static_publishing.state WHERE id')
      const state = result.rows[0]
      if (!state) throw new Error('Publishing state is missing')
      // Flush committed originals before hydrating an editor from released Git.
      // Otherwise a restart with pending uploads can fail hydration forever and
      // never reach the queue that would publish those missing originals.
      if (state.revision !== state.published_revision && Date.now() >= retryAt) {
        await queuePublication(state.revision)
        retryAt = Date.now() + 60_000
      }
      if (
        (state.phase === 'ready' || state.phase === 'built') &&
        state.commit_sha &&
        (await readyCommit()) === state.commit_sha
      ) {
        if (state.phase === 'built') {
          await client.query(
            "UPDATE static_publishing.state SET phase = 'ready' WHERE id AND phase = 'built' AND commit_sha = $1",
            [state.commit_sha],
          )
        }
        await startReleasedEditor(state.commit_sha, state.code_version)
      }
      if (state.phase === 'failed')
        log(
          'Release failed. The previous static site remains live; fix the build and push the code. Editor writes remain paused.',
        )
      if (state.phase === 'uninitialized')
        log('Waiting for the first successful production release of this publishing workflow.')
    } catch (error) {
      // No raw subprocess stderr: database/CLI failures can contain credentials.
      log(
        `Publication needs attention: ${safeError(error)}. Retrying in 30 seconds; queued content is retained.`,
      )
      retryAt = Date.now() + 30_000
    }
    if (process.argv.includes('--once')) break
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 30_000)
      wake = () => {
        clearTimeout(timer)
        resolve()
      }
      if (closing) wake()
    })
  }
} finally {
  await stopEditor()
  await client.end()
}

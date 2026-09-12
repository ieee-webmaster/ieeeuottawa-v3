import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { link, lstat, mkdir, open, rename, unlink } from 'node:fs/promises'
import path from 'node:path'

import { z } from 'zod'

const manifestSchema = z
  .object({
    version: z.literal(1),
    collection: z.string(),
    filename: z.string(),
    object: z.string(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    mimeType: z.string().regex(/^[a-zA-Z0-9][\w!#$&^.+-]*\/[a-zA-Z0-9][\w!#$&^.+-]*$/),
  })
  .strict()

export type StaticMediaManifest = z.infer<typeof manifestSchema>

type ArchiveKey = {
  /** The archive directory itself, not the project directory. */
  root?: string
  collection: string
  filename: string
}

export const validateMediaFilename = (filename: string): void => {
  if (
    !filename ||
    filename === '.' ||
    filename === '..' ||
    /[\x00-\x1f\x7f/\\<>:"|?*]/.test(filename) ||
    /[. ]$/.test(filename) ||
    Buffer.byteLength(`${encodeURIComponent(filename)}.json`) > 255
  ) {
    throw new Error(`Unsafe Media filename: ${filename}`)
  }
}

const archivePaths = ({ root, collection, filename }: ArchiveKey) => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(collection)) {
    throw new Error(`Unsafe Media collection: ${collection}`)
  }
  validateMediaFilename(filename)
  const extension = path.extname(filename).slice(1).toLowerCase() || 'bin'
  if (!/^[a-z0-9]{1,16}$/.test(extension)) throw new Error('Unsafe Media extension')
  const archiveRoot = path.resolve(root ?? path.join(process.cwd(), 'public-cms-media'))
  return {
    root: archiveRoot,
    extension,
    manifest: path.join(archiveRoot, 'index', collection, `${encodeURIComponent(filename)}.json`),
  }
}

const hasCode = (error: unknown, code: string) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === code
const isMissing = (error: unknown) => hasCode(error, 'ENOENT')
const isExisting = (error: unknown) => hasCode(error, 'EEXIST')

// Reject symlinked archive directories rather than letting a manifest reach outside the archive.
const checkDirectories = async (root: string, segments: string[], create = false) => {
  let directory = root
  for (const segment of ['', ...segments]) {
    directory = path.join(directory, segment)
    if (create)
      await mkdir(directory, { recursive: segment === '' }).catch((error: unknown) => {
        if (!isExisting(error)) throw error
      })
    const info = await lstat(directory).catch((error: unknown) => {
      if (isMissing(error) && !create) return undefined
      throw error
    })
    if (!info) return false
    if (!info.isDirectory() || info.isSymbolicLink()) {
      throw new Error(`Unsafe archive directory: ${directory}`)
    }
  }
  return true
}

const readFile = async (filename: string): Promise<Buffer | undefined> => {
  const handle = await open(
    filename,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  ).catch((error: unknown) => {
    if (isMissing(error)) return undefined
    throw error
  })
  if (!handle) return undefined
  try {
    if (!(await handle.stat()).isFile()) throw new Error(`Unsafe archive file: ${filename}`)
    return await handle.readFile()
  } finally {
    await handle.close()
  }
}

const hash = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')

const writeAtomic = async (filename: string, bytes: Buffer, immutable: boolean) => {
  const temporary = path.join(path.dirname(filename), `.${randomUUID()}.tmp`)
  const handle = await open(temporary, 'wx', 0o644)
  try {
    try {
      await handle.writeFile(bytes)
      await handle.sync()
    } finally {
      await handle.close()
    }
    if (immutable) {
      await link(temporary, filename).catch(async (error: unknown) => {
        if (!isExisting(error)) throw error
        const existing = await readFile(filename)
        if (!existing?.equals(bytes)) throw new Error(`Corrupt archive object: ${filename}`)
      })
    } else {
      await rename(temporary, filename)
    }
  } finally {
    await unlink(temporary).catch((error: unknown) => {
      if (!isMissing(error)) throw error
    })
  }
}

/** Publish bytes first, then atomically point the filename at them. Old objects are retained. */
export async function archiveOriginal({
  buffer,
  mimeType,
  ...key
}: ArchiveKey & { mimeType: string; buffer: Buffer }): Promise<StaticMediaManifest> {
  const paths = archivePaths(key)
  const sha256 = hash(buffer)
  const manifest = manifestSchema.parse({
    version: 1,
    collection: key.collection,
    filename: key.filename,
    object: `objects/${sha256}.${paths.extension}`,
    sha256,
    mimeType,
  })
  await checkDirectories(paths.root, ['objects'], true)
  await checkDirectories(paths.root, ['index', key.collection], true)
  await writeAtomic(path.join(paths.root, manifest.object), buffer, true)
  const serialized = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)
  if (!(await readFile(paths.manifest))?.equals(serialized)) {
    await writeAtomic(paths.manifest, serialized, false)
  }
  return manifest
}

/** Only a missing manifest permits legacy fallback; damaged managed originals fail closed. */
export async function readArchivedOriginal(key: ArchiveKey): Promise<Buffer | undefined> {
  const paths = archivePaths(key)
  if (!(await checkDirectories(paths.root, ['index', key.collection]))) return undefined
  const serialized = await readFile(paths.manifest)
  if (!serialized) return undefined
  const manifest = manifestSchema.parse(JSON.parse(serialized.toString('utf8')))
  if (
    manifest.collection !== key.collection ||
    manifest.filename !== key.filename ||
    manifest.object !== `objects/${manifest.sha256}.${paths.extension}`
  ) {
    throw new Error(`Invalid archive manifest: ${key.collection}/${key.filename}`)
  }
  if (!(await checkDirectories(paths.root, ['objects']))) {
    throw new Error(`Missing archive object: ${manifest.object}`)
  }
  const buffer = await readFile(path.join(paths.root, manifest.object))
  if (!buffer) throw new Error(`Missing archive object: ${manifest.object}`)
  if (hash(buffer) !== manifest.sha256) {
    throw new Error(`Archive hash mismatch: ${manifest.object}`)
  }
  return buffer
}

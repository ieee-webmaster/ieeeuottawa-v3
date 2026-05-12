import fs from 'node:fs/promises'
import path from 'node:path'

import type { Media } from '@/payload-types'
import { del, list } from '@vercel/blob'
import { type Payload } from 'payload'

const IMPORT_CONTEXT = { disableRevalidate: true }

export function createImportContext() {
  return { ...IMPORT_CONTEXT }
}

const forceMediaUpload =
  process.argv.includes('--force-media') || process.env.IMPORT_FORCE_MEDIA === '1'
const verifyMediaStorage = process.env.IMPORT_VERIFY_MEDIA !== '0'

const MIME_TYPES = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
} as const

export async function findLocalAssetsBySlug(directory: string) {
  const assets = new Map<string, string>()

  let entries: string[]
  try {
    entries = await fs.readdir(directory)
  } catch {
    return assets
  }

  for (const entry of entries) {
    const extension = path.extname(entry).toLowerCase()
    if (!(extension in MIME_TYPES)) continue
    assets.set(slugify(path.basename(entry, extension)), path.join(directory, entry))
  }

  return assets
}

export async function upsertMediaFromLocalFile(payload: Payload, filePath: string, alt: string) {
  const extension = path.extname(filePath).toLowerCase()
  const baseName = path.basename(filePath, extension)
  const uploadName = `${slugify(baseName)}${extension}`
  const fileStats = await fs.stat(filePath)
  const existing = (
    await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      where: { filename: { equals: uploadName } },
    })
  ).docs[0]

  if (existing && existing.filesize === fileStats.size && !forceMediaUpload) {
    const missingFiles = verifyMediaStorage ? await findMissingMediaFiles(existing) : []

    if (missingFiles.length) {
      console.warn(
        `media: ${uploadName} is in Payload but missing ${missingFiles.length} blob file${
          missingFiles.length === 1 ? '' : 's'
        }; re-uploading`,
      )
    } else {
      if (existing.alt !== alt) {
        await payload.update({
          collection: 'media',
          context: createImportContext(),
          data: { alt },
          id: existing.id,
        })
        console.log(`media: updated alt for ${uploadName}`)
      } else {
        console.log(`media: using existing ${uploadName}`)
      }

      return existing.id
    }
  }

  const blobAlreadyStored = !forceMediaUpload && (await isBlobStored(uploadName))

  if (forceMediaUpload) {
    await deleteStoredMediaFiles(uploadName, existing)
  }

  const file = await fs.readFile(filePath)
  const uploadFile = {
    data: file,
    mimetype: MIME_TYPES[extension as keyof typeof MIME_TYPES] || 'application/octet-stream',
    name: uploadName,
    size: file.byteLength,
  }

  if (blobAlreadyStored) {
    // The blob is already in storage. Run Payload's upload pipeline anyway so
    // the row gets correct filename / sizes / dimensions metadata (sharp runs
    // locally), then suppress the actual blob write via the cloud-storage
    // plugin's internal `skipCloudStorage` context flag.
    //
    // HACK: skipCloudStorage is the flag @payloadcms/plugin-cloud-storage
    // sets on its own afterChange hook to break recursion when it self-updates
    // a doc with upload metadata. We piggyback on it to skip the upload while
    // keeping metadata generation intact. If the plugin renames/removes the
    // flag in a future version, this fast path silently regresses to spending
    // blob writes again — same cost as a full re-upload, no correctness loss.
    const skipUploadContext = { ...createImportContext(), skipCloudStorage: true }
    if (existing) {
      const updated = await payload.update({
        collection: 'media',
        context: skipUploadContext,
        data: { alt },
        file: uploadFile,
        id: existing.id,
        overwriteExistingFiles: true,
      })
      console.log(`media: rehydrated metadata for ${uploadName} (blob reused)`)
      return updated.id
    }
    const created = await payload.create({
      collection: 'media',
      context: skipUploadContext,
      data: { alt },
      file: uploadFile,
      overwriteExistingFiles: true,
    })
    console.log(`media: rehydrated ${uploadName} from existing blob`)
    return created.id
  }

  if (existing) {
    const updated = await writeMediaWithRetry(uploadName, existing, () => {
      console.log(`media: replacing ${uploadName}`)
      return payload.update({
        collection: 'media',
        context: createImportContext(),
        data: { alt },
        file: uploadFile,
        id: existing.id,
        overwriteExistingFiles: true,
      })
    })

    return updated.id
  }

  const created = await writeMediaWithRetry(uploadName, existing, () => {
    console.log(`media: uploading ${uploadName}`)
    return payload.create({
      collection: 'media',
      context: createImportContext(),
      data: { alt },
      file: uploadFile,
      overwriteExistingFiles: true,
    })
  })

  return created.id
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function findMissingMediaFiles(media: Media) {
  const baseUrl = getBlobBaseUrl()
  if (!baseUrl) return []

  const missing: string[] = []

  await Promise.all(
    getMediaFilenames(media).map(async (filename) => {
      if (!(await blobFileExists(baseUrl, filename))) missing.push(filename)
    }),
  )

  return missing
}

async function isBlobStored(filename: string) {
  const baseUrl = getBlobBaseUrl()
  if (!baseUrl) return false
  return blobFileExists(baseUrl, filename)
}

async function deleteStoredMediaFiles(filename: string, existing?: Media) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return

  const filenames = new Set(existing ? getMediaFilenames(existing) : [])
  const filenamePattern = getMediaFilenamePattern(filename)
  let cursor: string | undefined

  do {
    const result = await list({ cursor, limit: 1000, prefix: getFilenameBase(filename), token })

    for (const blob of result.blobs) {
      if (filenamePattern.test(path.posix.basename(blob.pathname))) {
        filenames.add(blob.pathname)
      }
    }

    cursor = result.cursor
  } while (cursor)

  if (!filenames.size) return

  console.log(`media: deleting ${filenames.size} stored blob file(s) for ${filename}`)
  await del(Array.from(filenames), { token })
}

async function writeMediaWithRetry(
  filename: string,
  existing: Media | undefined,
  write: () => Promise<Media>,
) {
  const maxAttempts = forceMediaUpload ? 3 : 1

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await write()
    } catch (error) {
      if (attempt === maxAttempts || !isBlobUploadError(error)) throw error

      console.warn(
        `media: retrying ${filename} after blob upload failure (${attempt}/${maxAttempts})`,
      )
      await sleep(1500 * attempt)
      await deleteStoredMediaFiles(filename, existing)
    }
  }

  throw new Error(`media: failed to write ${filename}`)
}

function isBlobUploadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const cause = error.cause

  return (
    error.message.includes('Vercel Blob') || (cause instanceof Error && isBlobUploadError(cause))
  )
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function getMediaFilenamePattern(filename: string) {
  const extension = path.extname(filename).toLowerCase()
  const baseName = getFilenameBase(filename)
  const extensionPattern =
    extension === '.jpeg' || extension === '.jpg' ? '\\.jpe?g' : escapeRegExp(extension)

  return new RegExp(
    `^(?:${escapeRegExp(baseName)}${extensionPattern}|${escapeRegExp(baseName)}-\\d+x\\d+\\.[a-z0-9]+)$`,
    'i',
  )
}

function getFilenameBase(filename: string) {
  return path.basename(filename, path.extname(filename))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getMediaFilenames(media: Media) {
  const filenames = new Set<string>()

  if (media.filename) filenames.add(media.filename)

  for (const size of Object.values(media.sizes ?? {})) {
    if (size?.filename) filenames.add(size.filename)
  }

  return Array.from(filenames)
}

async function blobFileExists(baseUrl: string, filename: string) {
  const response = await fetch(`${baseUrl}/${encodeBlobPath(filename)}`, { method: 'HEAD' })

  if (response.status === 404) return false
  if (!response.ok) throw new Error(`Unable to verify blob ${filename}: ${response.status}`)

  return true
}

function getBlobBaseUrl() {
  if (process.env.STORAGE_VERCEL_BLOB_BASE_URL) {
    return process.env.STORAGE_VERCEL_BLOB_BASE_URL.replace(/\/$/, '')
  }

  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(
    /^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i,
  )?.[1]?.toLowerCase()

  return storeId ? `https://${storeId}.public.blob.vercel-storage.com` : undefined
}

function encodeBlobPath(filename: string) {
  return filename.split('/').map(encodeURIComponent).join('/')
}

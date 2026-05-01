import fs from 'node:fs/promises'
import path from 'node:path'

import type { Media } from '@/payload-types'
import { type Payload } from 'payload'

export const IMPORT_CONTEXT = { disableRevalidate: true }

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

  const file = await fs.readFile(filePath)
  const uploadFile = {
    data: file,
    mimetype: MIME_TYPES[extension as keyof typeof MIME_TYPES] || 'application/octet-stream',
    name: uploadName,
    size: file.byteLength,
  }

  if (existing) {
    console.log(`media: replacing ${uploadName}`)
    const updated: Media = await payload.update({
      collection: 'media',
      context: createImportContext(),
      data: { alt },
      file: uploadFile,
      id: existing.id,
      overwriteExistingFiles: true,
    })

    return updated.id
  }

  console.log(`media: uploading ${uploadName}`)
  const created: Media = await payload.create({
    collection: 'media',
    context: createImportContext(),
    data: { alt },
    file: uploadFile,
  })

  return created.id
}

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => {
      if (['ceg', 'elg', 'mdd', 'seg', 'vp', 'wie'].includes(part)) return part.toUpperCase()
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

export function cleanText(value?: string | null) {
  if (!value) return undefined
  const cleaned = value
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return cleaned || undefined
}

export function plainTextToLexical(value: string) {
  return {
    root: {
      children: value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
        .filter(Boolean)
        .map((paragraph) => ({
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text: paragraph,
              type: 'text' as const,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          type: 'paragraph' as const,
          version: 1,
        })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

export function truncateText(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}...`
}

export function normalizeOldSiteUrl(url: string | null | undefined) {
  if (!url) return undefined
  return url.startsWith('/') ? `https://ieeeuottawa.ca${url}` : url
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


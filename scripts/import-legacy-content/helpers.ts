import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Media } from '@/payload-types'
import { type Payload } from 'payload'

export const IMPORT_CONTEXT = { disableRevalidate: true }

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

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function upsertMediaFromLocalFile(payload: Payload, filePath: string, alt: string) {
  const file = await fs.readFile(filePath)
  const extension = path.extname(filePath).toLowerCase()
  const baseName = path.basename(filePath, extension)
  const pathHash = crypto.createHash('sha1').update(filePath).digest('hex').slice(0, 12)
  const uploadName = `${slugify(baseName)}-${pathHash}${extension}`
  const existing = (
    await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      where: { filename: { equals: uploadName } },
    })
  ).docs[0]

  if (existing) return existing.id

  const created: Media = await payload.create({
    collection: 'media',
    context: IMPORT_CONTEXT,
    data: { alt },
    file: {
      data: file,
      mimetype: MIME_TYPES[extension as keyof typeof MIME_TYPES] || 'application/octet-stream',
      name: uploadName,
      size: file.byteLength,
    },
  })

  return created.id
}

export async function upsertMediaFromUrl(payload: Payload, url: string, alt: string) {
  const response = await fetch(url)
  if (!response.ok) {
    console.warn(`Unable to download media asset: ${url}`)
    return undefined
  }

  const file = Buffer.from(await response.arrayBuffer())
  const parsedUrl = new URL(url)
  const extension = path.extname(parsedUrl.pathname).toLowerCase()
  const baseName = path.basename(parsedUrl.pathname, extension) || 'legacy-asset'
  const pathHash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12)
  const uploadName = `${slugify(decodeURIComponent(baseName))}-${pathHash}${extension}`
  const existing = (
    await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      where: { filename: { equals: uploadName } },
    })
  ).docs[0]

  if (existing) return existing.id

  const created: Media = await payload.create({
    collection: 'media',
    context: IMPORT_CONTEXT,
    data: { alt },
    file: {
      data: file,
      mimetype:
        response.headers.get('content-type') ||
        MIME_TYPES[extension as keyof typeof MIME_TYPES] ||
        'application/octet-stream',
      name: uploadName,
      size: file.byteLength,
    },
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

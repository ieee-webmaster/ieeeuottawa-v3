import fs from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'
import sharp, { type Sharp } from 'sharp'

import { MEDIA_IMAGE_SIZES } from '@/collections/Media'
import config from '@/payload.config'
import type { Media } from '@/payload-types'

const ASSETS_ROOT = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')
const OUTPUT_ROOT = path.resolve(process.cwd(), 'out/media')
const LEGACY_PREFIX = /^legacy-[a-f0-9]{10}-/
const SUPPORTED_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const ANIMATED_MIME_TYPES = new Set(['image/gif', 'image/webp'])
const RASTER_MIME_TYPES = new Set(['image/gif', 'image/jpeg', 'image/png', 'image/webp'])

sharp.cache(false)

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const walkFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return walkFiles(absolutePath)
      if (!entry.isFile()) return []
      return SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [absolutePath] : []
    }),
  )

  return nested.flat().sort()
}

class LocalAssetIndex {
  readonly #byFilename = new Map<string, string[]>()
  readonly #bySlug = new Map<string, string[]>()

  constructor(files: string[]) {
    for (const file of files) {
      const filename = path.basename(file).toLowerCase()
      const extension = path.extname(filename)
      const slug = slugify(path.basename(filename, extension))

      this.#byFilename.set(filename, [...(this.#byFilename.get(filename) ?? []), file])
      this.#bySlug.set(slug, [...(this.#bySlug.get(slug) ?? []), file])
    }
  }

  match(media: Media): string {
    if (!media.filename) throw new Error(`Media ${media.id} has no filename`)

    const exact = this.#byFilename.get(media.filename.toLowerCase()) ?? []
    if (exact.length === 1 && exact[0] !== undefined) return exact[0]
    if (exact.length > 1) {
      throw new Error(`Multiple local files have the exact filename ${media.filename}`)
    }

    const extension = path.extname(media.filename).toLowerCase()
    const baseName = path.basename(media.filename, extension).replace(LEGACY_PREFIX, '')
    const candidates = this.#bySlug.get(slugify(baseName)) ?? []
    const sameExtension = candidates.filter(
      (candidate) => path.extname(candidate).toLowerCase() === extension,
    )

    if (sameExtension.length === 1 && sameExtension[0] !== undefined) return sameExtension[0]
    if (candidates.length === 1 && candidates[0] !== undefined) return candidates[0]

    const relativeCandidates = candidates.map((candidate) => path.relative(ASSETS_ROOT, candidate))
    throw new Error(
      candidates.length === 0
        ? `No local source matches Media ${media.id} (${media.filename})`
        : `Media ${media.id} (${media.filename}) has ambiguous sources: ${relativeCandidates.join(', ')}`,
    )
  }
}

const shouldUseFocalResize = (
  source: { height: number; width: number },
  size: (typeof MEDIA_IMAGE_SIZES)[number],
) => {
  if (!('height' in size) || !size.height || !size.width) return false
  if (source.width / source.height === size.width / size.height) return false
  if (size.withoutEnlargement && (source.width < size.width || source.height < size.height)) {
    return false
  }
  return true
}

const resizeWithFocalPoint = async (
  source: Sharp,
  sourceDimensions: { height: number; width: number },
  target: { height: number; width: number },
  focalPoint: { x: number; y: number },
) => {
  const prioritizeHeight =
    target.width / target.height < sourceDimensions.width / sourceDimensions.height
  const intermediate = source.resize({
    fastShrinkOnLoad: false,
    height: prioritizeHeight ? target.height : undefined,
    width: prioritizeHeight ? undefined : target.width,
  })
  const { info } = await intermediate.clone().toBuffer({ resolveWithObject: true })
  const intermediateHeight = info.height
  const intermediateWidth = info.width
  const left = Math.max(
    0,
    Math.min(
      intermediateWidth * (focalPoint.x / 100) - target.width / 2,
      intermediateWidth - target.width,
    ),
  )
  const top = Math.max(
    0,
    Math.min(
      intermediateHeight * (focalPoint.y / 100) - target.height / 2,
      intermediateHeight - target.height,
    ),
  )

  return intermediate.extract({
    height: target.height,
    left: Math.floor(left),
    top: Math.floor(top),
    width: target.width,
  })
}

const extensionForFormat = (format: string, fallback: string) => {
  if (format === 'jpeg') return 'jpg'
  if (format === 'gif' || format === 'png' || format === 'webp') return format
  return fallback.replace(/^\./, '')
}

const outputPath = (filename: string) => {
  if (filename !== path.basename(filename)) {
    throw new Error(`Unsafe Media filename: ${filename}`)
  }

  return path.join(OUTPUT_ROOT, filename)
}

const materializeMedia = async (media: Media, sourcePath: string) => {
  if (!media.filename) throw new Error(`Media ${media.id} has no filename`)

  const bytes = await fs.readFile(sourcePath)
  await fs.writeFile(outputPath(media.filename), bytes)

  if (!media.mimeType || !RASTER_MIME_TYPES.has(media.mimeType)) return 1

  const animated = ANIMATED_MIME_TYPES.has(media.mimeType)
  const sharpBase = sharp(bytes, animated ? { animated: true } : undefined).rotate()
  const metadata = await sharpBase.metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read image dimensions for ${sourcePath}`)
  }

  const sourceDimensions = [5, 6, 7, 8].includes(metadata.orientation ?? 0)
    ? { height: metadata.width, width: metadata.height }
    : { height: metadata.height, width: metadata.width }
  if (media.width !== sourceDimensions.width || media.height !== sourceDimensions.height) {
    throw new Error(
      `Media ${media.id} source is ${sourceDimensions.width}x${sourceDimensions.height}, expected ${media.width}x${media.height}`,
    )
  }
  const parsedFilename = path.parse(media.filename)
  const focalPoint = { x: media.focalX ?? 50, y: media.focalY ?? 50 }

  let writtenSizes = 0

  for (const size of MEDIA_IMAGE_SIZES) {
    const storedSize = media.sizes?.[size.name]
    if (!storedSize?.filename) continue

    const resized =
      shouldUseFocalResize(sourceDimensions, size) && 'height' in size && size.height
        ? await resizeWithFocalPoint(
            sharpBase.clone(),
            sourceDimensions,
            { height: size.height, width: size.width },
            focalPoint,
          )
        : sharpBase.clone().resize(size)
    const { data, info } = await resized.toBuffer({ resolveWithObject: true })
    const extension = extensionForFormat(info.format, parsedFilename.ext)
    const storedExtension = path.extname(storedSize.filename).replace(/^\./, '')

    if (extension !== storedExtension) {
      throw new Error(
        `Media ${media.id} ${size.name} generated .${extension}, expected .${storedExtension}`,
      )
    }
    await fs.writeFile(outputPath(storedSize.filename), data)
    writtenSizes += 1
  }

  return 1 + writtenSizes
}

const main = async () => {
  const assetIndex = new LocalAssetIndex(await walkFiles(ASSETS_ROOT))
  await fs.rm(OUTPUT_ROOT, { force: true, recursive: true })
  await fs.mkdir(OUTPUT_ROOT, { recursive: true })

  const payload = await getPayload({ config })

  try {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 500,
      locale: 'en',
      overrideAccess: true,
      pagination: false,
      sort: 'id',
    })
    let fileCount = 0

    for (const media of result.docs) {
      fileCount += await materializeMedia(media, assetIndex.match(media))
    }

    console.log(`Static media: wrote ${fileCount} files for ${result.docs.length} Media documents`)
  } finally {
    await payload.destroy()
  }
}

await main()

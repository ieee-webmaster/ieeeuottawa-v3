import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { ImageSize } from 'payload'
import sharp, { type Sharp } from 'sharp'

import type { Media } from '@/payload-types'
import { readArchivedOriginal, validateMediaFilename } from '@/utilities/staticMediaArchive'

const ASSETS_ROOT = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')
const OUTPUT_ROOT = path.resolve(process.cwd(), 'out/media')
const mediaOutputRoot = () => path.resolve(process.env.STATIC_MEDIA_OUTPUT_DIR || OUTPUT_ROOT)
const LEGACY_PREFIX = /^legacy-[a-f0-9]{10}-/
const SUPPORTED_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])
const ANIMATED_MIME_TYPES = new Set(['image/gif', 'image/webp'])
const RASTER_MIME_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

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

export class LocalAssetIndex {
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
    validateMediaFilename(media.filename)

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

export const resolveMediaOriginal = async (
  media: Media,
  assetIndex: LocalAssetIndex,
  archiveRoot?: string,
): Promise<Buffer> => {
  if (!media.filename) throw new Error(`Media ${media.id} has no filename`)
  const managed = await readArchivedOriginal({
    root: archiveRoot ?? (process.env.STATIC_MEDIA_ARCHIVE_DIR || undefined),
    collection: 'media',
    filename: media.filename,
  })
  return managed ?? fs.readFile(assetIndex.match(media))
}

const shouldUseFocalResize = (source: { height: number; width: number }, size: ImageSize) => {
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
  if (format === 'heif' && fallback.toLowerCase() === '.avif') return 'avif'
  return fallback.replace(/^\./, '')
}

const outputPath = (filename: string, root: string) => {
  validateMediaFilename(filename)
  return path.join(root, filename)
}

export const materializeMedia = async (
  media: Media,
  source: Buffer | string,
  {
    outputRoot = mediaOutputRoot(),
    imageSizes,
  }: { outputRoot?: string; imageSizes?: ImageSize[] } = {},
) => {
  if (!media.filename) throw new Error(`Media ${media.id} has no filename`)

  const bytes = typeof source === 'string' ? await fs.readFile(source) : source
  const originalPath = outputPath(media.filename, outputRoot)
  const referencedSizes = Object.entries(media.sizes ?? {}).filter(([, size]) => size?.filename)
  for (const [, size] of referencedSizes) {
    if (!size?.filename) continue
    const destination = outputPath(size.filename, outputRoot)
    if (destination === originalPath)
      throw new Error(`Duplicate Media output filename: ${size.filename}`)
  }

  if (!media.mimeType || !RASTER_MIME_TYPES.has(media.mimeType)) {
    if (referencedSizes.length) {
      throw new Error(
        `Cannot generate referenced renditions for Media ${media.id} (${media.mimeType})`,
      )
    }
    await fs.writeFile(originalPath, bytes)
    return 1
  }

  const sizes: readonly ImageSize[] =
    imageSizes ?? (await import('@/collections/Media')).MEDIA_IMAGE_SIZES
  for (const [name] of referencedSizes) {
    if (!sizes.some((size) => size.name === name)) {
      throw new Error(`Media ${media.id} references an unconfigured rendition: ${name}`)
    }
  }

  const animated = ANIMATED_MIME_TYPES.has(media.mimeType)
  const sharpBase = sharp(bytes, animated ? { animated: true } : undefined).rotate()
  const metadata = await sharpBase.metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read image dimensions for Media ${media.id} (${media.filename})`)
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
  await fs.writeFile(originalPath, bytes)

  let writtenSizes = 0
  const writtenRenditions = new Set<string>()

  for (const [name, storedSize] of referencedSizes) {
    if (!storedSize?.filename) continue
    const configuredSize = sizes.find((candidate) => candidate.name === name)
    if (!configuredSize)
      throw new Error(`Media ${media.id} references an unconfigured rendition: ${name}`)
    for (const dimension of [storedSize.width, storedSize.height]) {
      if (dimension != null && (!Number.isInteger(dimension) || dimension <= 0)) {
        throw new Error(`Media ${media.id} ${name} has invalid stored rendition dimensions`)
      }
    }
    // Existing filenames refer to the renditions generated when the CMS saved them.
    // Today's size defaults must not change those dimensions or prevent historical enlargement.
    const size: ImageSize = {
      ...configuredSize,
      width: storedSize.width ?? configuredSize.width,
      height: storedSize.height ?? configuredSize.height,
      withoutEnlargement:
        storedSize.width != null || storedSize.height != null
          ? false
          : configuredSize.withoutEnlargement,
    }

    const resized =
      shouldUseFocalResize(sourceDimensions, size) && size.height && size.width
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
    if (
      (storedSize.width != null && storedSize.width !== info.width) ||
      (storedSize.height != null && storedSize.height !== info.height)
    ) {
      throw new Error(
        `Media ${media.id} ${size.name} generated ${info.width}x${info.height}, expected ${storedSize.width}x${storedSize.height}`,
      )
    }
    const destination = outputPath(storedSize.filename, outputRoot)
    if (writtenRenditions.has(storedSize.filename)) {
      if (!(await fs.readFile(destination)).equals(data)) {
        throw new Error(`Conflicting Media renditions share filename: ${storedSize.filename}`)
      }
      continue
    }
    await fs.writeFile(destination, data)
    writtenRenditions.add(storedSize.filename)
    writtenSizes += 1
  }

  return 1 + writtenSizes
}

const main = async () => {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@/payload.config'),
  ])
  const assetIndex = new LocalAssetIndex(await walkFiles(ASSETS_ROOT))
  const outputRoot = mediaOutputRoot()
  await fs.rm(outputRoot, { force: true, recursive: true })
  await fs.mkdir(outputRoot, { recursive: true })

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
      fileCount += await materializeMedia(media, await resolveMediaOriginal(media, assetIndex), {
        outputRoot,
      })
    }

    console.log(`Static media: wrote ${fileCount} files for ${result.docs.length} Media documents`)
  } finally {
    await payload.destroy()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main()
}

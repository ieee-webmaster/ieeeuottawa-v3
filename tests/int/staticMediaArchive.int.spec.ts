// @vitest-environment node
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { ImageSize } from 'payload'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Media } from '@/payload-types'
import { archiveOriginal, readArchivedOriginal } from '@/utilities/staticMediaArchive'
import {
  LocalAssetIndex,
  materializeMedia,
  resolveMediaOriginal,
} from '../../scripts/build-static-media'

let temporary: string
let root: string
let outputRoot: string

beforeEach(async () => {
  temporary = await mkdtemp(path.join(os.tmpdir(), 'cms-media-archive-'))
  root = path.join(temporary, 'archive')
  outputRoot = path.join(temporary, 'output')
  await mkdir(outputRoot)
})

afterEach(async () => {
  await rm(temporary, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

const key = (filename = 'photo.png', collection = 'media') => ({ root, collection, filename })
const put = (buffer: Buffer, filename = 'photo.png', collection = 'media') =>
  archiveOriginal({ ...key(filename, collection), buffer, mimeType: 'image/png' })
const manifestPath = (filename = 'photo.png') =>
  path.join(root, 'index', 'media', `${encodeURIComponent(filename)}.json`)
const media = (overrides: Partial<Media> = {}): Media => ({
  id: 1,
  filename: 'photo.png',
  mimeType: 'image/png',
  width: 1000,
  height: 600,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})
const imageSizes: ImageSize[] = [
  { name: 'square', width: 500, height: 500, withoutEnlargement: true },
  { name: 'small', width: 600, withoutEnlargement: true },
]
const picture = (background = '#ff0000') =>
  sharp({ create: { width: 1000, height: 600, channels: 3, background } })
    .png()
    .toBuffer()

describe('managed original archive', () => {
  it('archives a new original with an encoded filename and verified content address', async () => {
    const buffer = await picture()
    const filename = 'équipe portrait.png'
    const manifest = await put(buffer, filename)
    const sha256 = createHash('sha256').update(buffer).digest('hex')
    expect(manifest).toEqual({
      version: 1,
      collection: 'media',
      filename,
      object: `objects/${sha256}.png`,
      sha256,
      mimeType: 'image/png',
    })
    expect(JSON.parse(await readFile(manifestPath(filename), 'utf8'))).toEqual(manifest)
    expect(await readArchivedOriginal(key(filename))).toEqual(buffer)
  })

  it('keeps identical writes idempotent, including simultaneous uploads', async () => {
    const bytes = await picture()
    const original = await put(bytes)
    const before = await stat(manifestPath())
    const manifests = await Promise.all(Array.from({ length: 6 }, () => put(bytes)))
    expect(manifests.every((manifest) => manifest.sha256 === original.sha256)).toBe(true)
    expect((await stat(manifestPath())).mtimeMs).toBe(before.mtimeMs)
    expect(await readdir(path.join(root, 'objects'))).toEqual([path.basename(original.object)])
    expect(await readdir(path.join(root, 'index', 'media'))).toEqual(['photo.png.json'])
  })

  it('replaces a filename atomically while retaining its previous original for rollback', async () => {
    const oldBytes = await picture()
    const newBytes = await picture('#0000ff')
    const oldManifest = await put(oldBytes)
    const newManifest = await put(newBytes)
    expect(newManifest.sha256).not.toBe(oldManifest.sha256)
    expect(await readArchivedOriginal(key())).toEqual(newBytes)
    expect(await readFile(path.join(root, oldManifest.object))).toEqual(oldBytes)
    await rm(manifestPath())
    expect(await readArchivedOriginal(key())).toBeUndefined()
    expect(await readFile(path.join(root, newManifest.object))).toEqual(newBytes)
  })

  it('isolates filenames across collections and supports non-image originals', async () => {
    await put(Buffer.from('media bytes'))
    await put(Buffer.from('other bytes'), 'photo.png', 'other-uploads')
    const document = Buffer.from('%PDF-1.7 example')
    await archiveOriginal({
      ...key('guide.pdf', 'documents'),
      buffer: document,
      mimeType: 'application/pdf',
    })
    expect(await readArchivedOriginal(key())).toEqual(Buffer.from('media bytes'))
    expect(await readArchivedOriginal(key('photo.png', 'other-uploads'))).toEqual(
      Buffer.from('other bytes'),
    )
    expect(await readArchivedOriginal(key('guide.pdf', 'documents'))).toEqual(document)
  })

  it('returns undefined for a genuinely absent manifest without creating directories', async () => {
    expect(await readArchivedOriginal(key())).toBeUndefined()
    expect(await readdir(temporary)).toEqual(['output'])
  })

  it('rejects missing or tampered objects instead of treating them as an absent archive', async () => {
    const manifest = await put(Buffer.from('original'))
    await writeFile(path.join(root, manifest.object), 'tampered')
    await expect(readArchivedOriginal(key())).rejects.toThrow('Archive hash mismatch')
    await expect(put(Buffer.from('original'))).rejects.toThrow('Corrupt archive object')
    await rm(path.join(root, manifest.object))
    await expect(readArchivedOriginal(key())).rejects.toThrow('Missing archive object')
  })

  it.each([
    { object: '../../outside.png' },
    { collection: 'different' },
    { filename: 'different.png' },
    { sha256: 'not-a-hash' },
    { version: 2 },
    { mimeType: '../bad' },
  ])('rejects an invalid manifest: %j', async (change) => {
    const manifest = await put(Buffer.from('original'))
    await writeFile(manifestPath(), JSON.stringify({ ...manifest, ...change }))
    await expect(readArchivedOriginal(key())).rejects.toThrow()
  })

  it('rejects truncated JSON rather than falling back', async () => {
    await put(Buffer.from('original'))
    await writeFile(manifestPath(), '{')
    await expect(readArchivedOriginal(key())).rejects.toThrow()
  })

  it.each([
    '',
    '.',
    '..',
    '../photo.png',
    'dir/photo.png',
    'dir\\photo.png',
    '/photo.png',
    'C:\\photo.png',
    'photo\0.png',
    'photo.png.',
    'photo.png ',
    `${'x'.repeat(256)}.png`,
  ])('rejects unsafe filenames on writes and reads: %j', async (filename) => {
    await expect(put(Buffer.from('original'), filename)).rejects.toThrow('Unsafe Media filename')
    await expect(readArchivedOriginal(key(filename))).rejects.toThrow('Unsafe Media filename')
  })

  it.each(['../media', 'a/b', 'a\\b', '', '.', '..'])(
    'rejects unsafe collection names: %j',
    async (collection) => {
      await expect(put(Buffer.from('original'), 'photo.png', collection)).rejects.toThrow(
        'Unsafe Media collection',
      )
      await expect(readArchivedOriginal(key('photo.png', collection))).rejects.toThrow(
        'Unsafe Media collection',
      )
    },
  )

  it('rejects object and index directory symlinks', async () => {
    const manifest = await put(Buffer.from('original'))
    const outside = path.join(temporary, 'outside.png')
    await writeFile(outside, 'original')
    await rm(path.join(root, manifest.object))
    await symlink(outside, path.join(root, manifest.object))
    await expect(readArchivedOriginal(key())).rejects.toThrow()
    await rm(path.join(root, 'index', 'media'), { recursive: true })
    await symlink(outputRoot, path.join(root, 'index', 'media'))
    await expect(readArchivedOriginal(key())).rejects.toThrow('Unsafe archive directory')
    await expect(put(Buffer.from('replacement'))).rejects.toThrow('Unsafe archive directory')
    expect(await readdir(outputRoot)).toEqual([])
  })
})

describe('managed originals in the static exporter', () => {
  it('hydrates the environment-selected runtime directory from the selected managed archive', async () => {
    const bytes = await picture()
    await put(bytes)
    vi.stubEnv('STATIC_MEDIA_ARCHIVE_DIR', root)
    vi.stubEnv('STATIC_MEDIA_OUTPUT_DIR', outputRoot)
    const original = await resolveMediaOriginal(media(), new LocalAssetIndex([]))
    expect(await materializeMedia(media(), original, { imageSizes })).toBe(1)
    expect(await readFile(path.join(outputRoot, 'photo.png'))).toEqual(bytes)
  })

  it('lets explicit helper paths override environment paths', async () => {
    const bytes = await picture()
    await put(bytes)
    vi.stubEnv('STATIC_MEDIA_ARCHIVE_DIR', path.join(temporary, 'unused-archive'))
    vi.stubEnv('STATIC_MEDIA_OUTPUT_DIR', path.join(temporary, 'unused-output'))
    const original = await resolveMediaOriginal(media(), new LocalAssetIndex([]), root)
    expect(await materializeMedia(media(), original, { outputRoot, imageSizes })).toBe(1)
    expect(await readFile(path.join(outputRoot, 'photo.png'))).toEqual(bytes)
    await expect(stat(path.join(temporary, 'unused-output'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('exports the latest managed replacement even when legacy filename and dimensions still match', async () => {
    const oldBytes = await picture()
    const replacement = await picture('#0000ff')
    const legacy = path.join(temporary, 'photo.png')
    await writeFile(legacy, oldBytes)
    await put(oldBytes)
    await put(replacement)
    const original = await resolveMediaOriginal(media(), new LocalAssetIndex([legacy]), root)
    expect(await materializeMedia(media(), original, { outputRoot, imageSizes })).toBe(1)
    expect(await readFile(path.join(outputRoot, 'photo.png'))).toEqual(replacement)
  })

  it('exports a new managed upload without any legacy file', async () => {
    const bytes = await picture()
    await put(bytes)
    const original = await resolveMediaOriginal(media(), new LocalAssetIndex([]), root)
    expect(await materializeMedia(media(), original, { outputRoot, imageSizes })).toBe(1)
    expect(await readFile(path.join(outputRoot, 'photo.png'))).toEqual(bytes)
  })

  it('uses legacy matching only when no managed manifest exists', async () => {
    const legacy = path.join(temporary, 'photo.png')
    const bytes = await picture()
    await writeFile(legacy, bytes)
    expect(
      await resolveMediaOriginal(
        media({ filename: 'legacy-0123456789-photo.png' }),
        new LocalAssetIndex([legacy]),
        root,
      ),
    ).toEqual(bytes)
    await expect(resolveMediaOriginal(media(), new LocalAssetIndex([]), root)).rejects.toThrow(
      'No local source matches',
    )
    await put(bytes)
    await writeFile(manifestPath(), '{')
    await expect(
      resolveMediaOriginal(media(), new LocalAssetIndex([legacy]), root),
    ).rejects.toThrow()
  })

  it('preserves CMS focal points and emits every referenced rendition with correct dimensions', async () => {
    const blueHalf = await sharp({
      create: { width: 500, height: 600, channels: 3, background: '#0000ff' },
    })
      .png()
      .toBuffer()
    const bytes = await sharp(await picture())
      .composite([{ input: blueHalf, left: 500, top: 0 }])
      .png()
      .toBuffer()
    const document = media({
      focalX: 0,
      focalY: 50,
      sizes: {
        square: { filename: 'photo-square.png', width: 500, height: 500 },
        small: { filename: 'photo-small.png', width: 600, height: 360 },
      },
    })
    await put(bytes)
    const original = await resolveMediaOriginal(document, new LocalAssetIndex([]), root)
    expect(await materializeMedia(document, original, { outputRoot, imageSizes })).toBe(3)
    const center = () =>
      sharp(path.join(outputRoot, 'photo-square.png'))
        .extract({ left: 250, top: 250, width: 1, height: 1 })
        .removeAlpha()
        .raw()
        .toBuffer()
    expect([...(await center())]).toEqual([255, 0, 0])
    const small = await sharp(path.join(outputRoot, 'photo-small.png')).metadata()
    expect([small.width, small.height]).toEqual([600, 360])
    await materializeMedia({ ...document, focalX: 100 }, original, { outputRoot, imageSizes })
    expect([...(await center())]).toEqual([0, 0, 255])
  })

  it('rejects original dimension mismatches and invalid stored rendition dimensions', async () => {
    const bytes = await picture()
    await expect(
      materializeMedia(media({ width: 800 }), bytes, { outputRoot, imageSizes }),
    ).rejects.toThrow('source is 1000x600, expected 800x600')
    await expect(
      materializeMedia(
        media({ sizes: { small: { filename: 'small.png', width: 0, height: 600 } } }),
        bytes,
        { outputRoot, imageSizes },
      ),
    ).rejects.toThrow('small has invalid stored rendition dimensions')
  })

  it('reproduces historical rendition dimensions even when current defaults prevent enlargement', async () => {
    const bytes = await sharp({
      create: { width: 1170, height: 630, channels: 3, background: '#ff0000' },
    })
      .png()
      .toBuffer()
    const document = media({
      width: 1170,
      height: 630,
      sizes: {
        og: { filename: 'historical-og.png', width: 1200, height: 630 },
        small: { filename: 'historical-small.png', width: 320, height: 172 },
      },
    })
    expect(
      await materializeMedia(document, bytes, {
        outputRoot,
        imageSizes: [
          ...imageSizes,
          { name: 'og', width: 1200, height: 630, withoutEnlargement: true },
        ],
      }),
    ).toBe(3)
    const og = await sharp(path.join(outputRoot, 'historical-og.png')).metadata()
    const small = await sharp(path.join(outputRoot, 'historical-small.png')).metadata()
    expect([og.width, og.height]).toEqual([1200, 630])
    expect([small.width, small.height]).toEqual([320, 172])
    expect(await readFile(path.join(outputRoot, 'photo.png'))).toEqual(bytes)
  })

  it('allows identical rendition aliases but rejects different content sharing a filename', async () => {
    const bytes = await picture()
    expect(
      await materializeMedia(
        media({
          sizes: {
            small: { filename: 'shared.png', width: 500, height: 500 },
            square: { filename: 'shared.png', width: 500, height: 500 },
          },
        }),
        bytes,
        { outputRoot, imageSizes },
      ),
    ).toBe(2)
    expect((await sharp(path.join(outputRoot, 'shared.png')).metadata()).width).toBe(500)
    await expect(
      materializeMedia(
        media({
          sizes: {
            small: { filename: 'shared.png', width: 600, height: 360 },
            square: { filename: 'shared.png', width: 500, height: 500 },
          },
        }),
        bytes,
        { outputRoot, imageSizes },
      ),
    ).rejects.toThrow('Conflicting Media renditions share filename')
  })

  it('rejects unsafe or unconfigured referenced renditions and mismatched formats', async () => {
    const bytes = await picture()
    await expect(
      materializeMedia(media({ sizes: { small: { filename: '../escape.png' } } }), bytes, {
        outputRoot,
        imageSizes,
      }),
    ).rejects.toThrow('Unsafe Media filename')
    await expect(
      materializeMedia(media({ sizes: { small: { filename: 'small.png' } } }), bytes, {
        outputRoot,
        imageSizes: [],
      }),
    ).rejects.toThrow('unconfigured rendition: small')
    await expect(
      materializeMedia(media({ sizes: { small: { filename: 'small.jpg' } } }), bytes, {
        outputRoot,
        imageSizes,
      }),
    ).rejects.toThrow('generated .png, expected .jpg')
  })

  it('exports AVIF renditions and rejects filename collisions before writing originals', async () => {
    const bytes = await sharp(await picture())
      .avif()
      .toBuffer()
    const document = media({
      filename: 'photo.avif',
      mimeType: 'image/avif',
      sizes: { small: { filename: 'small.avif', width: 600, height: 360 } },
    })
    expect(await materializeMedia(document, bytes, { outputRoot, imageSizes })).toBe(2)
    const rendition = await sharp(path.join(outputRoot, 'small.avif')).metadata()
    expect([rendition.width, rendition.height]).toEqual([600, 360])
    await expect(
      materializeMedia(media({ sizes: { small: { filename: 'photo.png' } } }), await picture(), {
        outputRoot,
        imageSizes,
      }),
    ).rejects.toThrow('Duplicate Media output filename')
    await expect(stat(path.join(outputRoot, 'photo.png'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('copies non-raster managed originals but cannot silently omit their referenced renditions', async () => {
    const document = media({ filename: 'logo.svg', mimeType: 'image/svg+xml' })
    const bytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')
    await archiveOriginal({ ...key('logo.svg'), mimeType: 'image/svg+xml', buffer: bytes })
    const original = await resolveMediaOriginal(document, new LocalAssetIndex([]), root)
    expect(await materializeMedia(document, original, { outputRoot, imageSizes })).toBe(1)
    expect(await readFile(path.join(outputRoot, 'logo.svg'))).toEqual(bytes)
    await expect(
      materializeMedia({ ...document, sizes: { small: { filename: 'small.png' } } }, original, {
        outputRoot,
        imageSizes,
      }),
    ).rejects.toThrow('Cannot generate referenced renditions')
  })
})

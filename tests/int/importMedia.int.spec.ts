// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BasePayload, type PaginatedDocs } from 'payload'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { Media } from '@/payload-types'

vi.mock('@vercel/blob', () => ({
  del: vi.fn(() => {
    throw new Error('Unexpected storage deletion')
  }),
  list: vi.fn(() => {
    throw new Error('Unexpected storage listing')
  }),
}))

const image = Buffer.from('local image bytes')
const media: Media = {
  id: 7,
  alt: 'Portrait',
  filename: 'portrait.jpg',
  filesize: image.length,
  mimeType: 'image/jpeg',
  sizes: { small: { filename: 'portrait-600x400.jpg', mimeType: 'image/jpeg' } },
  createdAt: '',
  updatedAt: '',
}
const temporaryDirectories: string[] = []

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('IMPORT_FORCE_MEDIA', '0')
  vi.stubEnv('IMPORT_VERIFY_MEDIA', '1')
  vi.stubEnv('STORAGE_VERCEL_BLOB_BASE_URL', 'https://example.test')
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  await Promise.all(temporaryDirectories.splice(0).map((dir) => fs.rm(dir, { recursive: true })))
})

describe('legacy media upload decisions', () => {
  it.each([
    { name: 'a missing derivative', existing: media, missingDerivative: true, write: 'update' },
    {
      name: 'changed local bytes',
      existing: { ...media, filesize: 1 },
      missingDerivative: false,
      write: 'update',
    },
    {
      name: 'an existing original without a media row',
      existing: undefined,
      missingDerivative: false,
      write: 'create',
    },
    {
      name: 'unchanged media with all files present',
      existing: media,
      missingDerivative: false,
      write: undefined,
    },
  ])(
    'handles $name without skipping required file uploads',
    async ({ existing, missingDerivative, write }) => {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ieee-import-media-'))
      temporaryDirectories.push(directory)
      const filename = path.join(directory, 'portrait.jpg')
      await fs.writeFile(filename, image)

      vi.stubGlobal(
        'fetch',
        vi.fn<typeof globalThis.fetch>(
          async (input) =>
            new Response(null, {
              status: missingDerivative && String(input).endsWith('-600x400.jpg') ? 404 : 200,
            }),
        ),
      )
      const payload = new BasePayload()
      const result: PaginatedDocs<Media> = {
        docs: existing ? [existing] : [],
        totalDocs: existing ? 1 : 0,
        totalPages: 1,
        limit: 1,
        pagingCounter: 1,
        hasNextPage: false,
        hasPrevPage: false,
      }
      vi.spyOn(payload, 'find').mockResolvedValue(result)
      const create = vi.spyOn(payload, 'create').mockResolvedValue(media)
      const update = vi.spyOn(payload, 'update').mockResolvedValue(media)
      const { upsertMediaFromLocalFile } =
        await import('../../scripts/import-legacy-content/helpers')

      expect(await upsertMediaFromLocalFile(payload, filename, 'Portrait')).toBe(media.id)

      if (write) {
        const operation = write === 'create' ? create : update
        const otherOperation = write === 'create' ? update : create
        expect(otherOperation).not.toHaveBeenCalled()
        expect(operation).toHaveBeenCalledExactlyOnceWith({
          collection: 'media',
          context: { disableRevalidate: true },
          data: { alt: 'Portrait' },
          file: { data: image, mimetype: 'image/jpeg', name: 'portrait.jpg', size: image.length },
          ...(write === 'update' ? { id: media.id } : {}),
          overwriteExistingFiles: true,
        })
      } else {
        expect(create).not.toHaveBeenCalled()
        expect(update).not.toHaveBeenCalled()
      }
    },
  )
})

// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { BasePayload, buildConfig, getPayload } from 'payload'
import type { PayloadRequest } from 'payload'
import { testConfig } from '../helpers/payload'

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async () => Buffer.from('local test image')),
}))
vi.mock('payload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('payload')>()),
  getPayload: vi.fn(),
}))

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('isolates concurrent seed uploads before Payload consumes the request file', async () => {
  const requests: PayloadRequest[] = []
  const filenames: (string | undefined)[] = []
  const payload = new BasePayload()
  payload.config = await buildConfig({
    ...testConfig,
    collections: [
      { slug: 'users', auth: true, fields: [] },
      {
        slug: 'media',
        upload: { disableLocalStorage: true },
        fields: [{ name: 'alt', type: 'text' }],
        hooks: {
          beforeOperation: [
            async ({ req }) => {
              await Promise.resolve()
              requests.push(req)
              filenames.push(req.file?.name)
              throw new Error('Stop before file processing and database writes')
            },
          ],
        },
      },
    ],
  })
  const media = payload.config.collections.find(({ slug }) => slug === 'media')
  if (!media) throw new Error('Missing media configuration')
  payload.collections.media = { config: media, customIDType: 'number' }
  // No adapter is initialized: only transaction creation is reached before the hook stops writes.
  const beginTransaction = vi.fn(async () => null)
  Object.defineProperties(payload, {
    db: { value: { beginTransaction }, configurable: true },
    logger: { value: { info: vi.fn() }, configurable: true },
  })
  vi.mocked(getPayload).mockResolvedValue(payload)
  vi.spyOn(payload, 'find').mockResolvedValue({
    docs: [],
    totalDocs: 0,
    totalPages: 1,
    limit: 1,
    pagingCounter: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Unexpected network request')
    }),
  )
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('Script stopped')
  })

  await expect(import('../../scripts/seed-blocks')).rejects.toThrow('Script stopped')

  expect(filenames).toEqual([
    'image-post1.webp',
    'image-post2.webp',
    'image-post3.webp',
    'image-hero1.webp',
    'discord-light.svg',
    'linkedin-light.svg',
    'instagram-light.svg',
  ])
  expect(new Set(requests).size).toBe(7)
  expect(beginTransaction).toHaveBeenCalledTimes(7)
  expect(requests.every(({ context }) => context.disableRevalidate === true)).toBe(true)
})

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { afterReadPromise, buildConfig, getDataLoader, type BasePayload } from 'payload'
import type { Redirect } from '@/payload-types'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { createRequest, testConfig } from '../helpers/payload'

let payload: BasePayload
let redirects: Redirect[]

vi.mock('payload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('payload')>()),
  getPayload: async () => payload,
}))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('next/cache', () => ({ unstable_cache: (callback: () => unknown) => callback }))
vi.mock('@/utilities/getRedirects', () => ({ getCachedRedirects: () => async () => redirects }))
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

import { PayloadRedirects } from '@/components/PayloadRedirects'

beforeEach(async () => {
  const { req } = await createRequest(null)
  payload = req.payload
  payload.config = await buildConfig({
    ...testConfig,
    collections: [
      { slug: 'users', auth: true, fields: [] },
      {
        slug: 'pages',
        access: { read: authenticatedOrPublished },
        fields: [{ name: 'slug', type: 'text' }],
        versions: { drafts: true },
      },
    ],
  })
  for (const config of payload.config.collections) {
    payload.collections[config.slug] = { config }
  }
  // No adapter initialization or connection: mock only the database lookup used by the real Local API.
  payload.db = { ...payload.db, defaultIDType: 'number', findOne: vi.fn(async () => null) }
  req.payloadDataLoader = getDataLoader(req)
  const reference = { relationTo: 'pages', value: 7 } satisfies NonNullable<
    NonNullable<Redirect['to']>['reference']
  >
  const target = { reference }
  const populationPromises: Promise<void>[] = []
  await afterReadPromise({
    collection: null,
    context: req.context,
    currentDepth: 1,
    depth: 1,
    doc: target,
    draft: false,
    fallbackLocale: null,
    field: { name: 'reference', type: 'relationship', relationTo: ['pages', 'posts'] },
    fieldDepth: 0,
    fieldIndex: 0,
    fieldPromises: [],
    findMany: false,
    flattenLocales: true,
    global: null,
    locale: 'en',
    overrideAccess: false,
    parentIndexPath: '',
    parentPath: '',
    parentSchemaPath: '',
    populationPromises,
    req,
    showHiddenFields: false,
    siblingDoc: target,
  })
  await Promise.all(populationPromises)
  expect(target.reference.value).toBe(7)
  redirects = [{ id: 1, from: '/old-page', to: target, createdAt: '', updatedAt: '' }]
})

afterEach(() => vi.restoreAllMocks())

describe('redirect targets with unresolved relationships', () => {
  it('uses Next notFound when an unpublished or missing target stays an ID after population', async () => {
    await expect(PayloadRedirects({ url: '/old-page' })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(payload.db.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { and: [{ id: { equals: '7' } }, { _status: { equals: 'published' } }] },
      }),
    )
  })

  it('preserves unexpected database errors', async () => {
    vi.mocked(payload.db.findOne).mockRejectedValue(new Error('Database unavailable'))
    await expect(PayloadRedirects({ url: '/old-page' })).rejects.toThrow('Database unavailable')
  })

  it('redirects when the numeric reference resolves to a public document', async () => {
    const page = {
      id: 7,
      slug: 'new-page',
      _status: 'published',
    }
    vi.mocked(payload.db.findOne).mockResolvedValue(page)
    await expect(PayloadRedirects({ url: '/old-page' })).rejects.toThrow(
      'NEXT_REDIRECT:/en/new-page',
    )
  })

  it('keeps explicit URL redirects', async () => {
    redirects = [
      {
        id: 1,
        from: '/old-page',
        to: { url: 'https://example.test/new-page' },
        createdAt: '',
        updatedAt: '',
      },
    ]
    await expect(PayloadRedirects({ url: '/old-page' })).rejects.toThrow(
      'NEXT_REDIRECT:https://example.test/new-page',
    )
    expect(payload.db.findOne).not.toHaveBeenCalled()
  })
})

// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { SanitizedConfig } from 'payload'
import { createRequest } from '../helpers/payload'

let config: SanitizedConfig

beforeAll(async () => {
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_audit_placeholder')
  vi.stubEnv('PAYLOAD_SECRET', 'test-only')
  vi.stubEnv('POSTGRES_URL', 'postgres://test:test@127.0.0.1:9/test')
  try {
    config = await (await import('@/payload.config')).default
  } finally {
    vi.unstubAllEnvs()
  }
})

async function prepareRequest(accessTags: unknown, draft = true) {
  const { req } = await createRequest({ roles: [10] }, [
    {
      collectionPermissions: [{ collection: 'pages', actions: ['create', 'update'] }],
      tagPermissions: [
        { tag: 1, effect: 'allow', actions: ['create', 'update'] },
        { tag: 2, effect: 'deny', actions: ['create', 'update'] },
      ],
    },
  ])
  const payload = req.payload
  payload.config = config
  for (const collection of config.collections) {
    payload.collections[collection.slug] = { config: collection }
  }
  const stopBeforeWrite = new Error('Stop before database writes')
  const create = vi.fn(async (_args: { data: unknown }) => {
    throw stopBeforeWrite
  })
  payload.db = {
    ...payload.db,
    defaultIDType: 'number',
    beginTransaction: vi.fn(async () => null),
    create,
  }
  req.routeParams = { collection: 'pages' }
  req.query = { draft: String(draft) }
  req.data = {
    title: 'Draft boundary test',
    slug: 'draft-boundary-test',
    hero: { type: 'none' },
    layout: [],
    accessTags,
  }
  const pages = payload.collections.pages.config
  const endpoint =
    pages.endpoints && pages.endpoints.find(({ method, path }) => method === 'post' && path === '/')
  if (!endpoint) throw new Error('Missing native pages create endpoint')
  return { create, endpoint, pages, req, stopBeforeWrite }
}

describe('RBAC numeric tag IDs at the native draft boundary', () => {
  it.each(['02', ' 2'])('denies alternate spelling %j of a denied tag', async (id) => {
    const { create, endpoint, pages, req } = await prepareRequest([1, id])

    await expect(endpoint.handler(req)).rejects.toMatchObject({ status: 403 })
    expect(create).not.toHaveBeenCalled()
    expect(await pages.access.update({ req, data: req.data })).toBe(false)
  })

  it.each([false, [1, null], [1, { id: null }], [1, 'invalid']].map((value) => ({ value })))(
    'denies malformed tags before draft writes: $value',
    async ({ value }) => {
      const { create, endpoint, pages, req } = await prepareRequest(value)

      await expect(endpoint.handler(req)).rejects.toMatchObject({ status: 403 })
      expect(create).not.toHaveBeenCalled()
      expect(await pages.access.update({ req, data: req.data })).toBe(false)
    },
  )

  it.each([[1], ['01']])('preserves allowed tag input %j for native draft writes', async (id) => {
    const { create, endpoint, req, stopBeforeWrite } = await prepareRequest([id])

    await expect(endpoint.handler(req)).rejects.toBe(stopBeforeWrite)
    expect(create).toHaveBeenCalledOnce()
    expect(create.mock.calls[0]?.[0].data).toMatchObject({ accessTags: [id], _status: 'draft' })
  })

  it.each([1, '01'])('preserves native scalar relationship input %j', async (id) => {
    const { create, endpoint, req, stopBeforeWrite } = await prepareRequest(id)

    await expect(endpoint.handler(req)).rejects.toBe(stopBeforeWrite)
    expect(create.mock.calls[0]?.[0].data).toMatchObject({ accessTags: id })
  })

  it.each([null, '', 'none', 'null'])('preserves native clearing input %j', async (value) => {
    const { create, endpoint, req, stopBeforeWrite } = await prepareRequest(value)

    await expect(endpoint.handler(req)).rejects.toBe(stopBeforeWrite)
    expect(create.mock.calls[0]?.[0].data).toMatchObject({ accessTags: [] })
  })

  it('leaves ordinary relationship validation enabled when publishing', async () => {
    const { create, endpoint, req } = await prepareRequest(['01'], false)

    const response = endpoint.handler(req)
    await expect(response).rejects.toMatchObject({ status: 400 })
    await expect(response).rejects.toHaveProperty(
      'data.errors',
      expect.arrayContaining([expect.objectContaining({ path: 'accessTags' })]),
    )
    expect(create).not.toHaveBeenCalled()
  })
})

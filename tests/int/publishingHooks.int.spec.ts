import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FieldHook } from 'payload'
import type { Page, Post, User } from '@/payload-types'
import { populateAuthors } from '@/collections/Posts/hooks/populateAuthors'
import { populatePostPublishedAt } from '@/collections/Posts'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { createRequest } from '../helpers/payload'

const post: Post = {
  id: 1,
  title: 'Article',
  slug: 'article',
  content: {
    root: { type: 'root', version: 1, children: [], direction: null, format: '', indent: 0 },
  },
  createdAt: '',
  updatedAt: '',
}
const author: User = {
  id: 7,
  collection: 'users',
  name: 'Ada',
  email: 'private@example.com',
  superAdmin: true,
  roles: [9],
  createdAt: '',
  updatedAt: '',
}
const publishedAt = '2025-01-02T03:04:05.000Z'
const page: Page = {
  id: 2,
  title: 'Page',
  slug: 'page',
  hero: { type: 'none' },
  layout: [],
  publishedAt,
  createdAt: '',
  updatedAt: '',
}

async function hookContext() {
  const { req } = await createRequest(null)
  const collection = req.payload.config.collections[0]
  if (!collection) throw new Error('Missing sanitized test collection')
  return { req, collection, context: req.context }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('public author bylines', () => {
  it('reads only author names in the original request and exposes no private fields', async () => {
    const context = await hookContext()
    const findByID = vi.spyOn(context.req.payload, 'findByID').mockResolvedValue(author)
    const doc = { ...post, authors: [author.id] }
    const result = await populateAuthors({ ...context, doc })

    expect(findByID).toHaveBeenCalledExactlyOnceWith({
      collection: 'users',
      id: author.id,
      depth: 0,
      req: context.req,
      select: { name: true },
      overrideAccess: true,
    })
    expect(result.populatedAuthors).toEqual([{ id: '7', name: 'Ada' }])
  })

  it('keeps readable authors in order when another author is missing', async () => {
    const context = await hookContext()
    vi.spyOn(context.req.payload, 'findByID')
      .mockResolvedValueOnce(author)
      .mockRejectedValueOnce(new Error('Author removed'))
      .mockResolvedValueOnce({ ...author, id: 8, name: 'Grace' })
    const result = await populateAuthors({ ...context, doc: { ...post, authors: [author, 99, 8] } })
    expect(result.populatedAuthors).toEqual([
      { id: '7', name: 'Ada' },
      { id: '8', name: 'Grace' },
    ])
  })

  it('leaves an existing byline intact if all author lookups fail', async () => {
    const context = await hookContext()
    vi.spyOn(context.req.payload, 'findByID').mockRejectedValue(new Error('Author removed'))
    const populatedAuthors = [{ id: '7', name: 'Ada' }]
    const result = await populateAuthors({
      ...context,
      doc: { ...post, authors: [7], populatedAuthors },
    })
    expect(result.populatedAuthors).toEqual(populatedAuthors)
  })

  it('does not query users when there are no authors', async () => {
    const context = await hookContext()
    const findByID = vi.spyOn(context.req.payload, 'findByID')
    const result = await populateAuthors({ ...context, doc: post })
    expect(result).toEqual(post)
    expect(findByID).not.toHaveBeenCalled()
  })
})

describe('page publication dates', () => {
  it('uses ISO strings for Local API creates without a request body', async () => {
    const context = await hookContext()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(publishedAt)
    const result = populatePublishedAt({ ...context, operation: 'create', data: { title: 'New' } })
    expect(result).toEqual({ title: 'New', publishedAt })
  })

  it('preserves the original date on unrelated partial updates', async () => {
    const result = populatePublishedAt({
      ...(await hookContext()),
      operation: 'update',
      originalDoc: page,
      data: { title: 'Renamed' },
    })
    expect({ ...page, ...result }).toEqual({ ...page, title: 'Renamed' })
  })

  it('preserves an explicitly supplied date', async () => {
    const result = populatePublishedAt({
      ...(await hookContext()),
      operation: 'create',
      data: { title: 'New', publishedAt },
    })
    expect(result.publishedAt).toBe(publishedAt)
  })
})

describe('post publication dates', () => {
  it.each([
    { status: 'published', value: undefined, originalDate: undefined, expected: publishedAt },
    { status: 'draft', value: undefined, originalDate: undefined, expected: undefined },
    { status: 'published', value: publishedAt, originalDate: undefined, expected: publishedAt },
    { status: undefined, value: undefined, originalDate: publishedAt, expected: publishedAt },
    { status: 'published', value: null, originalDate: publishedAt, expected: publishedAt },
    { status: 'draft', value: null, originalDate: publishedAt, expected: null },
  ] as const)(
    'preserves publication state for %j',
    async ({ status, value, originalDate, expected }) => {
      const { req } = await createRequest(null)
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(publishedAt)
      const args: Parameters<FieldHook<Post, Post['publishedAt'], Post>>[0] = {
        blockData: undefined,
        collection: null,
        context: req.context,
        field: { name: 'publishedAt', type: 'date' },
        global: null,
        indexPath: [],
        operation: 'update',
        originalDoc: { ...post, publishedAt: originalDate },
        path: ['publishedAt'],
        req,
        schemaPath: ['publishedAt'],
        siblingData: { _status: status },
        siblingFields: [],
        value,
      }
      expect(await populatePostPublishedAt(args)).toBe(expected)
    },
  )
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { Category } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { createRequest } from '../helpers/payload'

const searchDoc = {
  doc: { relationTo: 'posts', value: '1' },
  title: 'Post title',
  priority: 5,
}
const sourcePost = { id: 1, slug: 'post-slug', title: 'Post title' }

afterEach(() => vi.restoreAllMocks())

describe('search index source boundary', () => {
  it('indexes populated and ID-only categories without losing request or index fields', async () => {
    const { req } = await createRequest()
    const category: Category = {
      id: 2,
      title: 'Robotics',
      slug: 'robotics',
      createdAt: '',
      updatedAt: '',
    }
    const findByID = vi.spyOn(req.payload, 'findByID').mockResolvedValue(category)

    const result = await beforeSyncWithSearch({
      req,
      payload: req.payload,
      collectionSlug: 'posts',
      searchDoc,
      originalDoc: {
        ...sourcePost,
        categories: [2, null, { id: 3, title: 'Electronics', slug: 'electronics' }],
        meta: { title: 'SEO title', image: { id: 7, url: '/image.jpg' }, description: 'Summary' },
        content: { unrelated: 'not part of the consumed schema' },
      },
    })

    expect(result).toEqual({
      ...searchDoc,
      slug: 'post-slug',
      meta: { title: 'SEO title', image: 7, description: 'Summary' },
      categories: [
        { relationTo: 'categories', categoryID: '2', title: 'Robotics' },
        { relationTo: 'categories', categoryID: '3', title: 'Electronics' },
      ],
    })
    expect(findByID).toHaveBeenCalledExactlyOnceWith({
      collection: 'categories',
      id: 2,
      disableErrors: true,
      depth: 0,
      select: { title: true },
      req,
    })
  })

  it('keeps numeric image IDs and falls back to the post title', async () => {
    const { req } = await createRequest()
    const findByID = vi.spyOn(req.payload, 'findByID')
    const result = await beforeSyncWithSearch({
      req,
      payload: req.payload,
      collectionSlug: 'posts',
      searchDoc,
      originalDoc: { ...sourcePost, meta: { title: '', image: 7 } },
    })

    expect(result.meta).toEqual({ title: 'Post title', image: 7, description: undefined })
    expect(result.categories).toEqual([])
    expect(findByID).not.toHaveBeenCalled()
  })

  it('accepts incomplete autosaved drafts', async () => {
    const { req } = await createRequest()
    const result = await beforeSyncWithSearch({
      req,
      payload: req.payload,
      collectionSlug: 'posts',
      searchDoc,
      originalDoc: { id: 1, _status: 'draft' },
    })

    expect(result.slug).toBeUndefined()
    expect(result.meta.title).toBeUndefined()
    expect(result.categories).toEqual([])
  })

  it('skips missing categories and retains the existing diagnostic', async () => {
    const { req } = await createRequest()
    const categoryReader: {
      findByID: typeof req.payload.findByID<'categories', true, { title: true }>
    } = req.payload
    vi.spyOn(categoryReader, 'findByID').mockResolvedValue(null)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await beforeSyncWithSearch({
      req,
      payload: req.payload,
      collectionSlug: 'posts',
      searchDoc,
      originalDoc: { ...sourcePost, categories: [99] },
    })

    expect(result.categories).toEqual([])
    expect(error).toHaveBeenCalledWith(
      "Failed. Category not found when syncing collection 'posts' with id: '1' to search.",
    )
  })

  it.each([
    ['object title', { title: { en: 'Title' } }],
    ['object slug', { slug: { value: 'post-slug' } }],
    ['non-array categories', { categories: { id: 2, title: 'Robotics' } }],
    ['malformed populated category', { categories: [{ id: 2, title: { en: 'Robotics' } }] }],
    ['non-ID image object', { meta: { image: { url: '/image.jpg' } } }],
    ['object description', { meta: { description: { html: 'Summary' } } }],
  ])('rejects %s before reading categories', async (_name, invalidFields) => {
    const { req } = await createRequest()
    const findByID = vi.spyOn(req.payload, 'findByID')

    await expect(
      beforeSyncWithSearch({
        req,
        payload: req.payload,
        collectionSlug: 'posts',
        searchDoc,
        originalDoc: { ...sourcePost, categories: [2], ...invalidFields },
      }),
    ).rejects.toBeInstanceOf(ZodError)
    expect(findByID).not.toHaveBeenCalled()
  })
})

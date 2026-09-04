// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { buildConfig, type Config } from 'payload'
import type { Category } from '@/payload-types'
import { Categories } from '@/collections/Categories'
import { plugins } from '@/plugins'
import { createRequest, testConfig } from '../helpers/payload'

async function categoryHookArgs(data: Record<string, unknown>) {
  let configured: Config = { ...testConfig, collections: [Categories] }
  for (const plugin of plugins) configured = await plugin(configured)
  const category = configured.collections?.find(({ slug }) => slug === 'categories')
  if (!category) throw new Error('Missing categories configuration')
  const config = await buildConfig({
    ...testConfig,
    collections: [{ slug: 'users', auth: true, fields: [] }, category],
  })
  const collection = config.collections.find(({ slug }) => slug === 'categories')
  if (!collection) throw new Error('Missing sanitized categories configuration')
  const { req } = await createRequest()
  req.payload.config = config
  return { collection, context: req.context, data, operation: 'create' as const, req }
}

describe('category breadcrumbs before slug generation', () => {
  it('accepts a title-only create before Payload runs slugField beforeChange', async () => {
    const data: Partial<Category> = { title: 'New category' }
    const args = await categoryHookArgs(data)
    for (const hook of args.collection.hooks.beforeChange ?? []) await hook(args)
    expect(data.title).toBe('New category')
    expect(data.slug).toBeUndefined()
    expect(data.breadcrumbs).toEqual([{ doc: undefined, label: 'New category', url: '' }])
  })

  it('builds the final parent/child URL once generated slugs are available', async () => {
    const data: Partial<Category> = { title: 'Child category', slug: 'child-category', parent: 9 }
    const args = await categoryHookArgs(data)
    const parent: Category = {
      id: 9,
      title: 'Parent category',
      slug: 'parent-category',
      parent: null,
      createdAt: '',
      updatedAt: '',
    }
    vi.spyOn(args.req.payload, 'findByID').mockResolvedValue(parent)
    for (const hook of args.collection.hooks.beforeChange ?? []) await hook(args)
    expect(data.breadcrumbs?.map(({ url }) => url)).toEqual([
      '/parent-category',
      '/parent-category/child-category',
    ])
  })

  it('rejects an object slug instead of stringifying it into a URL', async () => {
    const args = await categoryHookArgs({ title: 'Invalid category', slug: { value: 'bad' } })
    const hook = args.collection.hooks.beforeChange?.[0]
    if (!hook) throw new Error('Missing breadcrumb hook')
    await expect(hook(args)).rejects.toThrow()
  })
})

// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { validations } from 'payload'
import { createRequest } from '../helpers/payload'
import { Archive } from '@/blocks/ArchiveBlock/config'

const { getArchivePosts } = vi.hoisted(() => ({
  getArchivePosts: vi.fn(async () => []),
}))
vi.mock('@/utilities/publicCms', () => ({ getCachedArchivePosts: getArchivePosts }))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/components/CollectionArchive', () => ({ CollectionArchive: () => null }))
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }))

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'

afterEach(() => vi.clearAllMocks())

it.each([-1, 0.5])('bounds a CMS-valid limit of %s before issuing the query', async (limit) => {
  const field = Archive.fields.find((field) => field.type === 'number' && field.name === 'limit')
  if (!field || field.type !== 'number') throw new Error('Missing archive limit field')
  const { req } = await createRequest(null)
  expect(
    await validations.number(limit, {
      ...field,
      blockData: {},
      data: {},
      siblingData: {},
      path: ['limit'],
      preferences: { fields: {} },
      req,
    }),
  ).toBe(true)

  await ArchiveBlock({ blockType: 'archive', populateBy: 'collection', limit })
  expect(getArchivePosts).toHaveBeenCalledWith({ categoryIDs: [], limit: 3, locale: 'en' })
})

it.each([
  [undefined, 3],
  [null, 3],
  [0, 3],
  [1, 1],
  [10, 10],
  [Number.MAX_SAFE_INTEGER + 1, 3],
])('uses limit %s as %s', async (limit, expected) => {
  await ArchiveBlock({ blockType: 'archive', populateBy: 'collection', limit })
  expect(getArchivePosts).toHaveBeenCalledWith({ categoryIDs: [], limit: expected, locale: 'en' })
})

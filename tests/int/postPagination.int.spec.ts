import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Locale } from '@/i18n/routing'

const { getPosts, notFound } = vi.hoisted(() => ({
  getPosts: vi.fn<
    (
      locale: Locale,
      page: number,
    ) => Promise<{
      docs: []
      totalDocs: number
      totalPages: number
      page: number
    }>
  >(),
  notFound: vi.fn<() => never>(() => {
    throw new Error('NOT_FOUND')
  }),
}))

vi.mock('@/utilities/publicCms', () => ({
  getCachedPostList: getPosts,
  getCachedPostTotalPages: async () => 2,
}))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('@/components/CollectionArchive', () => ({ CollectionArchive: () => null }))
vi.mock('@/components/Pagination', () => ({ Pagination: () => null }))
vi.mock('@/utilities/generateMeta', () => ({ generateStaticMeta: vi.fn() }))

import PostsPage from '@/app/(frontend)/[locale]/posts/page/[pageNumber]/page'

beforeEach(() => {
  vi.clearAllMocks()
  getPosts.mockImplementation(async (_locale, page) => ({
    docs: [],
    page,
    totalDocs: 0,
    totalPages: 2,
  }))
})

describe('post pagination route input', () => {
  it.each(['-1', '0', '1.5', 'invalid', 'Infinity', '1e100', '9007199254740992'])(
    'rejects page %s before requesting posts',
    async (pageNumber) => {
      await expect(
        PostsPage({ params: Promise.resolve({ locale: 'en', pageNumber }) }),
      ).rejects.toThrow('NOT_FOUND')
      expect(getPosts).not.toHaveBeenCalled()
    },
  )

  it.each(['1', '2'])('requests valid page %s', async (pageNumber) => {
    await PostsPage({ params: Promise.resolve({ locale: 'en', pageNumber }) })
    expect(getPosts).toHaveBeenCalledWith('en', Number(pageNumber))
    expect(notFound).not.toHaveBeenCalled()
  })
})

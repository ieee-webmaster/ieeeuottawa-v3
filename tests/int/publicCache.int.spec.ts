import { beforeEach, describe, expect, it, vi } from 'vitest'

const { cacheOptions, revalidateTag, unstableCache } = vi.hoisted(() => {
  const cacheOptions: Array<{ revalidate?: number; tags?: string[] }> = []

  return {
    cacheOptions,
    revalidateTag: vi.fn(),
    unstableCache: vi.fn(
      (
        _callback: unknown,
        _keyParts?: string[],
        options?: { revalidate?: number; tags?: string[] },
      ) => {
        if (options) cacheOptions.push(options)
        return vi.fn()
      },
    ),
  }
})

vi.mock('next/cache', () => ({ revalidateTag, unstable_cache: unstableCache }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))

import { revalidatePublicCacheTags } from '@/hooks/revalidatePublicContent'
import { PUBLIC_CACHE_TAGS, publicCacheTags } from '@/utilities/publicCache'
import { getCachedPageBySlug } from '@/utilities/publicCms'

describe('public cache tags', () => {
  beforeEach(() => {
    cacheOptions.length = 0
    revalidateTag.mockClear()
    unstableCache.mockClear()
  })

  it('attaches both the global reset tag and specific dependency tags to cache entries', () => {
    expect(publicCacheTags(PUBLIC_CACHE_TAGS.posts, PUBLIC_CACHE_TAGS.media)).toEqual([
      PUBLIC_CACHE_TAGS.all,
      PUBLIC_CACHE_TAGS.posts,
      PUBLIC_CACHE_TAGS.media,
    ])
  })

  it('tracks content types that can be embedded in cached pages', () => {
    getCachedPageBySlug('about', 'en')

    expect(cacheOptions).toEqual([
      {
        revalidate: 86400,
        tags: [
          PUBLIC_CACHE_TAGS.all,
          PUBLIC_CACHE_TAGS.pages,
          PUBLIC_CACHE_TAGS.posts,
          PUBLIC_CACHE_TAGS.events,
          PUBLIC_CACHE_TAGS.media,
        ],
      },
    ])
  })

  it('revalidates only the explicitly requested tags', () => {
    revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.posts])

    expect(revalidateTag).toHaveBeenCalledOnce()
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_CACHE_TAGS.posts, { expire: 0 })
    expect(revalidateTag).not.toHaveBeenCalledWith(PUBLIC_CACHE_TAGS.all, { expire: 0 })
  })

  it('supports an explicit full reset without revalidating duplicate tags', () => {
    revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.all, PUBLIC_CACHE_TAGS.all])

    expect(revalidateTag).toHaveBeenCalledOnce()
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_CACHE_TAGS.all, { expire: 0 })
  })
})

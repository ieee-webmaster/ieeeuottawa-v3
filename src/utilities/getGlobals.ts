import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import {
  PUBLIC_CACHE_TAGS,
  PUBLIC_CACHE_VERSION,
  publicCacheTags,
  STATIC_CONTENT_REVALIDATE_SECONDS,
} from '@/utilities/publicCache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0, locale?: Config['locale']) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
    overrideAccess: false,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale?: Config['locale']) =>
  unstable_cache(
    async () => getGlobal(slug, depth, locale),
    [PUBLIC_CACHE_VERSION, slug, String(depth), locale ?? 'default'],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(
        `global_${slug}`,
        `global_${slug}_${locale ?? 'en'}`,
        PUBLIC_CACHE_TAGS.media,
      ),
    },
  )

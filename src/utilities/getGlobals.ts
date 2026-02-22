import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { defaultLocale, type AppLocale } from '@/i18n/config'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0, locale: AppLocale = defaultLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale: locale as never,
    fallbackLocale: defaultLocale as never,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal =
  (slug: Global, depth = 0) =>
  (locale: AppLocale = defaultLocale) =>
    unstable_cache(async () => getGlobal(slug, depth, locale), [slug, locale], {
      tags: [`global_${slug}`],
    })()

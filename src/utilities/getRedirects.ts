import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { defaultLocale, type AppLocale } from '@/i18n/config'

export async function getRedirects(depth = 1, locale: AppLocale = defaultLocale) {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    depth,
    locale: locale as never,
    fallbackLocale: defaultLocale as never,
    limit: 0,
    pagination: false,
  })

  return redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects =
  () =>
  (locale: AppLocale = defaultLocale) =>
    unstable_cache(async () => getRedirects(1, locale), ['redirects', locale], {
      tags: ['redirects'],
    })()

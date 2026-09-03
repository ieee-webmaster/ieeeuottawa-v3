import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { routing } from '@/i18n/routing'
import { getAbsoluteUrl, prefixLocale } from '@/utilities/routes'
import {
  PUBLIC_CACHE_TAGS,
  PUBLIC_CACHE_VERSION,
  publicCacheTags,
  STATIC_CONTENT_REVALIDATE_SECONDS,
} from '@/utilities/publicCache'

export const dynamic = 'force-static'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = routing.locales.map((locale) => ({
      loc: getAbsoluteUrl(prefixLocale('/posts', locale)),
      lastmod: dateFallback,
    }))

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .flatMap((page) =>
            routing.locales.map((locale) => ({
              loc: getAbsoluteUrl(
                prefixLocale(
                  page.slug === 'home' ? '/' : `/${encodeURIComponent(page.slug)}`,
                  locale,
                ),
              ),
              lastmod: page.updatedAt || dateFallback,
            })),
          )
      : []

    return [...defaultSitemap, ...sitemap]
  },
  [PUBLIC_CACHE_VERSION, 'pages-sitemap'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.pages, 'pages-sitemap'),
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}

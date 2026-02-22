import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { locales } from '@/i18n/config'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      locale: 'all',
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

    const defaultSitemap = locales.flatMap((locale) => [
      {
        loc: `${SITE_URL}/${locale}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/${locale}/posts`,
        lastmod: dateFallback,
      },
    ])

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .flatMap((page) =>
            locales.map((locale) => ({
              loc:
                page?.slug === 'home'
                  ? `${SITE_URL}/${locale}`
                  : `${SITE_URL}/${locale}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            })),
          )
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}

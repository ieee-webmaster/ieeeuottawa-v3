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

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'posts',
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

    const sitemap = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .flatMap((post) =>
            routing.locales.map((locale) => ({
              loc: getAbsoluteUrl(prefixLocale(`/posts/${encodeURIComponent(post.slug)}`, locale)),
              lastmod: post.updatedAt || dateFallback,
            })),
          )
      : []

    return sitemap
  },
  [PUBLIC_CACHE_VERSION, 'posts-sitemap'],
  {
    revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
    tags: publicCacheTags(PUBLIC_CACHE_TAGS.posts, 'posts-sitemap'),
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}

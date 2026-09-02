import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '@/payload-types'
import { routing } from '@/i18n/routing'
import { prefixLocale } from '@/utilities/routes'
import { PUBLIC_CACHE_TAGS } from '@/utilities/publicCache'
import { revalidatePublicCacheTags } from '@/hooks/revalidatePublicContent'

const revalidatePagePaths = (slug?: string | null) => {
  if (!slug) {
    return
  }

  for (const locale of routing.locales) {
    const path = prefixLocale(slug === 'home' ? '/' : `/${encodeURIComponent(slug)}`, locale)
    revalidatePath(path)
  }
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating page at slug: ${doc.slug}`)
      revalidatePagePaths(doc.slug)
      revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.pages], payload.logger)
      revalidateTag('pages-sitemap', { expire: 0 })
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old page at slug: ${previousDoc.slug}`)
      revalidatePagePaths(previousDoc.slug)
      revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.pages], payload.logger)
      revalidateTag('pages-sitemap', { expire: 0 })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePagePaths(doc?.slug)
    revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.pages])
    revalidateTag('pages-sitemap', { expire: 0 })
  }

  return doc
}

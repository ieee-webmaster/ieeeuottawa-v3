import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '@/payload-types'
import { routing } from '@/i18n/routing'
import { prefixLocale } from '@/utilities/routes'

const revalidatePostPaths = (slug?: string | null) => {
  if (!slug) {
    return
  }

  for (const locale of routing.locales) {
    const path = prefixLocale(`/posts/${encodeURIComponent(slug)}`, locale)
    revalidatePath(path)
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating post at slug: ${doc.slug}`)
      revalidatePostPaths(doc.slug)
      revalidateTag('posts-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old post at slug: ${previousDoc.slug}`)
      revalidatePostPaths(previousDoc.slug)
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePostPaths(doc?.slug)
    revalidateTag('posts-sitemap')
  }

  return doc
}

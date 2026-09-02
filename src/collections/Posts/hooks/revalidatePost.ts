import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '@/payload-types'
import { routing } from '@/i18n/routing'
import { prefixLocale } from '@/utilities/routes'
import { PUBLIC_CACHE_TAGS } from '@/utilities/publicCache'
import { revalidatePublicCacheTags } from '@/hooks/revalidatePublicContent'

const revalidatePostPaths = (slug?: string | null) => {
  if (!slug) {
    return
  }

  for (const locale of routing.locales) {
    const path = prefixLocale(`/posts/${encodeURIComponent(slug)}`, locale)
    revalidatePath(path)
  }
}

const revalidatePostIndexPaths = () => {
  for (const locale of routing.locales) {
    revalidatePath(prefixLocale('/posts', locale))
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
      revalidatePostIndexPaths()
      revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.posts], payload.logger)
      revalidateTag('posts-sitemap', { expire: 0 })
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old post at slug: ${previousDoc.slug}`)
      revalidatePostPaths(previousDoc.slug)
      revalidatePostIndexPaths()
      revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.posts], payload.logger)
      revalidateTag('posts-sitemap', { expire: 0 })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePostPaths(doc?.slug)
    revalidatePostIndexPaths()
    revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.posts])
    revalidateTag('posts-sitemap', { expire: 0 })
  }

  return doc
}

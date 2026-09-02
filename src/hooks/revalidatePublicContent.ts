import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import { publicCacheTags } from '@/utilities/publicCache'

type Logger = {
  info: (message: string) => void
}

export const revalidatePublicCacheTags = (tags: string[], logger?: Logger) => {
  const cacheTags = publicCacheTags(...tags)

  logger?.info(`Revalidating public cache tags: ${cacheTags.join(', ')}`)

  for (const tag of cacheTags) {
    revalidateTag(tag, { expire: 0 })
  }
}

export const buildPublicCacheAfterChange = (...tags: string[]): CollectionAfterChangeHook => {
  return ({ doc, req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      revalidatePublicCacheTags(tags, payload.logger)
    }

    return doc
  }
}

export const buildPublicCacheAfterDelete = (...tags: string[]): CollectionAfterDeleteHook => {
  return ({ doc, req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      revalidatePublicCacheTags(tags, payload.logger)
    }

    return doc
  }
}

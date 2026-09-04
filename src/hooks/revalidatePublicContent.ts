import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

type Logger = {
  info: (message: string) => void
}

export const revalidatePublicCacheTags = (tags: string[], logger?: Logger) => {
  const cacheTags = Array.from(new Set(tags))

  logger?.info(`Revalidating public cache tags: ${cacheTags.join(', ')}`)

  for (const tag of cacheTags) {
    revalidateTag(tag, { expire: 0 })
  }
}

export const buildPublicCacheAfterChange = (...tags: string[]): CollectionAfterChangeHook => {
  return ({ req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      revalidatePublicCacheTags(tags, payload.logger)
    }
  }
}

export const buildPublicCacheAfterDelete = (...tags: string[]): CollectionAfterDeleteHook => {
  return ({ req: { context, payload } }) => {
    if (!context.disableRevalidate) {
      revalidatePublicCacheTags(tags, payload.logger)
    }
  }
}

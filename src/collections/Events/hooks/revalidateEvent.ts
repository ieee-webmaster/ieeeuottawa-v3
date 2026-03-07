import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Event } from '@/payload-types'
import { routing } from '@/i18n/routing'
import { prefixLocale } from '@/utilities/routes'

const revalidateEventPaths = (slug?: string | null) => {
  if (!slug) {
    return
  }

  for (const locale of routing.locales) {
    const path = prefixLocale(`/events/${encodeURIComponent(slug)}`, locale)
    revalidatePath(path)
  }
}

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidateEventPaths(doc.slug)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old event at slug: ${previousDoc.slug}`)
      revalidateEventPaths(previousDoc.slug)
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Event> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateEventPaths(doc?.slug)
  }

  return doc
}

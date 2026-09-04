import type { CollectionBeforeChangeHook } from 'payload'
import type { Page } from '@/payload-types'

export const populatePublishedAt = (({ data, originalDoc }) => {
  if (data.publishedAt || originalDoc?.publishedAt) return data

  return { ...data, publishedAt: new Date().toISOString() }
}) satisfies CollectionBeforeChangeHook<Page>

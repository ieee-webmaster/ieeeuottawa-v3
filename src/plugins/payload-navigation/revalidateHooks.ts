import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

type RevalidateOptions = {
  draftsEnabled: boolean
}

type MaybeVersionedDoc = {
  _status?: unknown
}

const tagsForCollection = (slug: string, locale?: string): string[] => {
  const tags = [`nav_auto_${slug}`]
  if (locale) tags.push(`nav_auto_${slug}_${locale}`)
  return tags
}

const getStatus = (doc: unknown): string | null => {
  if (!doc || typeof doc !== 'object') return null

  const status = (doc as MaybeVersionedDoc)._status
  return typeof status === 'string' ? status : null
}

const shouldRevalidate = (
  options: RevalidateOptions,
  doc: unknown,
  previousDoc?: unknown,
): boolean => {
  if (!options.draftsEnabled) return true

  return getStatus(doc) === 'published' || getStatus(previousDoc) === 'published'
}

export const buildAfterChangeRevalidate = (
  slug: string,
  options: RevalidateOptions,
): CollectionAfterChangeHook => {
  return ({ doc, previousDoc, req: { context, locale } }) => {
    if (context?.disableRevalidate) return doc
    if (!shouldRevalidate(options, doc, previousDoc)) return doc

    for (const tag of tagsForCollection(slug, locale)) {
      revalidateTag(tag, { expire: 0 })
    }
    return doc
  }
}

export const buildAfterDeleteRevalidate = (
  slug: string,
  options: RevalidateOptions,
): CollectionAfterDeleteHook => {
  return ({ doc, req: { context, locale } }) => {
    if (context?.disableRevalidate) return doc
    if (!shouldRevalidate(options, doc)) return doc

    for (const tag of tagsForCollection(slug, locale)) {
      revalidateTag(tag, { expire: 0 })
    }
    return doc
  }
}

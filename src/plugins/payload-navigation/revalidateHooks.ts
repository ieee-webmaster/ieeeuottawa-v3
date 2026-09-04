import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionSlug,
  DataFromCollectionSlug,
} from 'payload'

import { revalidateTag } from 'next/cache'

type RevalidateOptions = {
  draftsEnabled: boolean
}

type NavigationDoc = DataFromCollectionSlug<CollectionSlug>

const tagsForCollection = (slug: string, locale?: string): string[] => {
  const tags = [`nav_auto_${slug}`]
  if (locale) tags.push(`nav_auto_${slug}_${locale}`)
  return tags
}

const isPublished = (doc: NavigationDoc | undefined): boolean =>
  Boolean(doc && '_status' in doc && doc._status === 'published')

const shouldRevalidate = (
  options: RevalidateOptions,
  doc: NavigationDoc,
  previousDoc?: NavigationDoc,
): boolean => {
  if (!options.draftsEnabled) return true

  return isPublished(doc) || isPublished(previousDoc)
}

export const buildAfterChangeRevalidate = (
  slug: string,
  options: RevalidateOptions,
): CollectionAfterChangeHook<NavigationDoc> => {
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
): CollectionAfterDeleteHook<NavigationDoc> => {
  return ({ doc, req: { context, locale } }) => {
    if (context?.disableRevalidate) return doc
    if (!shouldRevalidate(options, doc)) return doc

    for (const tag of tagsForCollection(slug, locale)) {
      revalidateTag(tag, { expire: 0 })
    }
    return doc
  }
}

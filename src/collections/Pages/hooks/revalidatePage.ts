import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { getLocalizedDocumentPaths } from '@/utilities/routes'

const revalidatePagePaths = (slug?: string | null) => {
  if (!slug) {
    return
  }

  for (const path of getLocalizedDocumentPaths({ collection: 'pages', slug })) {
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
      revalidateTag('pages-sitemap')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old page at slug: ${previousDoc.slug}`)
      revalidatePagePaths(previousDoc.slug)
      revalidateTag('pages-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePagePaths(doc?.slug)
    revalidateTag('pages-sitemap')
  }

  return doc
}

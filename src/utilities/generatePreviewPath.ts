import type { PayloadRequest } from 'payload'

import { resolveLocale } from '@/i18n/routing'
import { prefixLocale, type RoutedCollection } from '@/utilities/routes'

type Props = {
  collection: RoutedCollection
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, req, slug }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  const locale = resolveLocale(req.locale)
  const path =
    collection === 'pages'
      ? slug === 'home'
        ? '/'
        : `/${encodeURIComponent(slug)}`
      : `/${collection}/${encodeURIComponent(slug)}`

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: prefixLocale(path, locale),
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}

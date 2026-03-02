import type { PayloadRequest } from 'payload'

import { routing, type Locale } from '@/i18n/routing'
import { getLocalizedDocumentPath, type RoutedCollection } from '@/utilities/routes'

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

  const locale =
    typeof req.locale === 'string' && routing.locales.includes(req.locale as Locale)
      ? (req.locale as Locale)
      : routing.defaultLocale

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: getLocalizedDocumentPath({
      collection,
      locale,
      slug,
    }),
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}

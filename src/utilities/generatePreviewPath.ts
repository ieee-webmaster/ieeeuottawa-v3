import type { PayloadRequest } from 'payload'

import { resolveLocale } from '@/i18n/routing'
import { resolveContentPathFromDoc } from '@/routing/resolveContentPath'
import { prefixLocale } from '@/utilities/routes'

type Props = {
  collection: string
  doc: unknown
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, doc, req }: Props) => {
  const locale = resolveLocale(req.locale)
  const path = resolveContentPathFromDoc(collection, doc)
  if (!path) {
    return null
  }

  const encodedParams = new URLSearchParams({
    collection,
    path: prefixLocale(path, locale),
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}

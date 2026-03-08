import type { Metadata } from 'next'
import type { Locale } from '@/i18n/routing'

import type { Config, Media } from '../payload-types'

import { resolveContentPathFromDoc } from '@/routing/resolveContentPath'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getAbsoluteUrl, prefixLocale } from './routes'

type MetaDoc = {
  slug?: string | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: Media | Config['db']['defaultIDType'] | null
  } | null
} | null

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  collection: string
  doc: MetaDoc
  locale: Locale
}): Promise<Metadata> => {
  const { collection, doc, locale } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'
  const path = resolveContentPathFromDoc(collection, doc)

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path ? getAbsoluteUrl(prefixLocale(path, locale)) : undefined,
    }),
    title,
  }
}

import type { Metadata } from 'next'
import type { Locale } from '@/i18n/routing'

import type { Config, Event, Media, Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getAbsoluteLocalizedUrl, type RoutedCollection } from './routes'

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
  collection: RoutedCollection
  doc: Partial<Event> | Partial<Page> | Partial<Post> | null
  locale: Locale
}): Promise<Metadata> => {
  const { collection, doc, locale } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? doc?.meta?.title + ' | Payload Website Template'
    : 'Payload Website Template'

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
      url:
        typeof doc?.slug === 'string'
          ? getAbsoluteLocalizedUrl({
              collection,
              locale,
              slug: doc.slug,
            })
          : undefined,
    }),
    title,
  }
}

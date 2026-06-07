import type { Metadata } from 'next'
import type { Locale } from '@/i18n/routing'

import type { Config, Media } from '../payload-types'

import { resolveContentPathFromDoc } from '@/routing/resolveContentPath'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getAbsoluteUrl, prefixLocale } from './routes'
import {
  DEFAULT_OPEN_GRAPH_IMAGE,
  formatSiteTitle,
  getDefaultOpenGraphImage,
  type OpenGraphImage,
  SITE_DESCRIPTION,
} from './siteMetadata'

type MetaDoc = {
  slug?: string | null
  title?: string | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: Media | Config['db']['defaultIDType'] | null
  } | null
} | null

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    const url = ogUrl || image.url

    if (url) {
      return {
        alt: image.alt || DEFAULT_OPEN_GRAPH_IMAGE.alt,
        height: image.sizes?.og?.height || image.height || DEFAULT_OPEN_GRAPH_IMAGE.height,
        url: getAbsoluteUrl(url),
        width: image.sizes?.og?.width || image.width || DEFAULT_OPEN_GRAPH_IMAGE.width,
      }
    }
  }

  return getDefaultOpenGraphImage()
}

export const generateStaticMeta = (args: {
  description?: string | null
  image?: OpenGraphImage
  locale: Locale
  path?: string | null
  title?: string | null
}): Metadata => {
  const { description, image, locale, path, title } = args

  const metaDescription = description || SITE_DESCRIPTION
  const metaTitle = formatSiteTitle(title)
  const canonicalUrl = path ? getAbsoluteUrl(prefixLocale(path, locale)) : undefined
  const ogImage = image || getDefaultOpenGraphImage()

  return {
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    description: metaDescription,
    openGraph: mergeOpenGraph({
      description: metaDescription,
      images: [ogImage],
      title: metaTitle,
      url: canonicalUrl,
    }),
    title: metaTitle,
    twitter: {
      card: 'summary_large_image',
      description: metaDescription,
      images: [
        {
          alt: ogImage.alt,
          url: ogImage.url,
        },
      ],
      title: metaTitle,
    },
  }
}

export const generateMeta = async (args: {
  collection: string
  doc: MetaDoc
  locale: Locale
}): Promise<Metadata> => {
  const { collection, doc, locale } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const description = doc?.meta?.description || SITE_DESCRIPTION

  const title = doc?.meta?.title || doc?.title
  const path = resolveContentPathFromDoc(collection, doc)

  return generateStaticMeta({
    description,
    image: ogImage,
    locale,
    path,
    title,
  })
}

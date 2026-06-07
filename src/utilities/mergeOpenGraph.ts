import type { Metadata } from 'next'
import { getDefaultOpenGraphImage, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from './siteMetadata'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SITE_DESCRIPTION,
  images: [getDefaultOpenGraphImage()],
  siteName: SITE_NAME,
  title: SITE_NAME,
  url: getSiteUrl(),
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}

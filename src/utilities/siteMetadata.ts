import { getServerSideURL } from './getURL'

export const SITE_NAME = 'IEEE uOttawa'

export const SITE_DESCRIPTION =
  'The official website of the IEEE uOttawa Student Branch, sharing events, resources, documents, and news for University of Ottawa EECS students.'

export const DEFAULT_OPEN_GRAPH_IMAGE = {
  alt: 'IEEE uOttawa Student Branch',
  height: 630,
  path: '/og-default.webp',
  width: 1200,
} as const

export type OpenGraphImage = {
  alt: string
  height: number
  url: string
  width: number
}

export const formatSiteTitle = (title?: string | null): string => {
  const trimmedTitle = title?.trim()

  if (!trimmedTitle || trimmedTitle === SITE_NAME) {
    return SITE_NAME
  }

  if (trimmedTitle.endsWith(`| ${SITE_NAME}`)) {
    return trimmedTitle
  }

  return `${trimmedTitle} | ${SITE_NAME}`
}

export const getSiteUrl = (path = '/'): string => new URL(path, getServerSideURL()).toString()

export const getDefaultOpenGraphImage = (): OpenGraphImage => ({
  alt: DEFAULT_OPEN_GRAPH_IMAGE.alt,
  height: DEFAULT_OPEN_GRAPH_IMAGE.height,
  url: getSiteUrl(DEFAULT_OPEN_GRAPH_IMAGE.path),
  width: DEFAULT_OPEN_GRAPH_IMAGE.width,
})

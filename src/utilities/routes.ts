import { routing, type Locale } from '@/i18n/routing'
import { getServerSideURL } from '@/utilities/getURL'

export const routedCollections = ['pages', 'posts', 'events'] as const

export type RoutedCollection = (typeof routedCollections)[number]
export type RoutedCollectionWithIndex = Exclude<RoutedCollection, 'pages'>

const routedCollectionSet = new Set<string>(routedCollections)

const encodeSegment = (segment: string) => encodeURIComponent(segment)

export const isRoutedCollection = (value: string): value is RoutedCollection =>
  routedCollectionSet.has(value)

export const getDocumentPath = ({
  collection,
  slug,
}: {
  collection: RoutedCollection
  slug: string
}): string => {
  const encodedSlug = encodeSegment(slug)

  if (collection === 'pages') {
    return slug === 'home' ? '/' : `/${encodedSlug}`
  }

  return `/${collection}/${encodedSlug}`
}

export const getCollectionIndexPath = ({
  collection,
  page = 1,
}: {
  collection: RoutedCollectionWithIndex
  page?: number
}): string => {
  if (page <= 1) {
    return `/${collection}`
  }

  return `/${collection}/page/${page}`
}

export const prefixLocale = (path: string, locale: Locale): string => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const alreadyPrefixed = routing.locales.some(
    (candidate) =>
      normalizedPath === `/${candidate}` || normalizedPath.startsWith(`/${candidate}/`),
  )

  if (alreadyPrefixed) {
    return normalizedPath
  }

  if (normalizedPath === '/') {
    return `/${locale}`
  }

  return `/${locale}${normalizedPath}`
}

export const getLocalizedPath = ({ locale, path }: { locale: Locale; path: string }): string =>
  prefixLocale(path, locale)

export const getLocalizedPaths = (path: string): string[] =>
  routing.locales.map((locale) => prefixLocale(path, locale))

export const getLocalizedDocumentPath = ({
  collection,
  locale,
  slug,
}: {
  collection: RoutedCollection
  locale: Locale
  slug: string
}): string =>
  prefixLocale(
    getDocumentPath({
      collection,
      slug,
    }),
    locale,
  )

export const getLocalizedDocumentPaths = ({
  collection,
  slug,
}: {
  collection: RoutedCollection
  slug: string
}): string[] =>
  routing.locales.map((locale) =>
    getLocalizedDocumentPath({
      collection,
      locale,
      slug,
    }),
  )

export const getAbsoluteUrl = (path: string): string => new URL(path, getServerSideURL()).toString()

export const getAbsoluteLocalizedUrl = ({
  collection,
  locale,
  slug,
}: {
  collection: RoutedCollection
  locale: Locale
  slug: string
}): string =>
  getAbsoluteUrl(
    getLocalizedDocumentPath({
      collection,
      locale,
      slug,
    }),
  )

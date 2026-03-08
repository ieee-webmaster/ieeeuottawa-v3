import { routing, type Locale } from '@/i18n/routing'
import { getServerSideURL } from '@/utilities/getURL'

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

export const getAbsoluteUrl = (path: string): string => new URL(path, getServerSideURL()).toString()

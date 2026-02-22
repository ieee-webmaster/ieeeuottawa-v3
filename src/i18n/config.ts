export const locales = ['en', 'fr'] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'en'

export const localeCookieName = 'NEXT_LOCALE'

export const isLocale = (value: string | undefined | null): value is AppLocale => {
  if (!value) return false
  return locales.includes(value as AppLocale)
}

export const getLocaleFromPathname = (pathname: string): AppLocale => {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isLocale(segment) ? segment : defaultLocale
}

export const prefixLocalePath = (locale: AppLocale, path: string) => {
  if (!path.startsWith('/')) return path

  if (path === '/') return `/${locale}`

  const segment = path.split('/').filter(Boolean)[0]
  if (isLocale(segment)) return path

  return `/${locale}${path}`
}

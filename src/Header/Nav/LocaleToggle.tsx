'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { getLocaleFromPathname, isLocale, prefixLocalePath, type AppLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

const getPathWithoutLocale = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] && isLocale(segments[0])) {
    segments.shift()
  }

  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}

const getTargetLocale = (locale: AppLocale): AppLocale => (locale === 'en' ? 'fr' : 'en')

export const LocaleToggle = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const locale = getLocaleFromPathname(pathname)
  const messages = getMessages(locale)
  const targetLocale = getTargetLocale(locale)

  const pathWithoutLocale = getPathWithoutLocale(pathname)
  const targetPath = prefixLocalePath(targetLocale, pathWithoutLocale)
  const query = searchParams.toString()
  const href = query ? `${targetPath}?${query}` : targetPath

  return (
    <Link
      aria-label={
        targetLocale === 'fr' ? messages.common.switchToFrench : messages.common.switchToEnglish
      }
      className="text-sm font-medium text-primary/80 hover:text-primary transition-colors"
      href={href}
    >
      {targetLocale.toUpperCase()}
    </Link>
  )
}

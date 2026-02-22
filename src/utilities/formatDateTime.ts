import type { AppLocale } from '@/i18n/config'

export const formatDateTime = (timestamp: string, locale: AppLocale = 'en'): string => {
  const now = new Date()
  let date = now
  if (timestamp) date = new Date(timestamp)

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

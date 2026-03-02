import type { Locale } from '@/i18n/routing'

export const formatDateTime = (
  timestamp: string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.valueOf())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
    ...options,
  }).format(date)
}

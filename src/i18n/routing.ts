import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  // All locales are always prefixed in the URL (/en/..., /fr/...)
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]

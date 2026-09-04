import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing, type Locale } from './routing'
import type messages from '../../messages/en.json'

const loadMessages = {
  en: () => import('../../messages/en.json').then((messages) => messages.default),
  fr: () => import('../../messages/fr.json').then((messages) => messages.default),
} satisfies Record<Locale, () => Promise<typeof messages>>

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages[locale](),
  }
})

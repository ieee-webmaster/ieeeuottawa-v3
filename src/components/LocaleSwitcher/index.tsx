'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}

export const LocaleSwitcher: React.FC = () => {
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const otherLocale = routing.locales.find((l) => l !== currentLocale) as Locale

  const handleSwitch = () => {
    router.replace(pathname, { locale: otherLocale })
  }

  return (
    <button
      onClick={handleSwitch}
      className="text-sm font-medium text-primary hover:opacity-75 transition-opacity cursor-pointer"
      aria-label={`Switch to ${otherLocale === 'fr' ? 'Français' : 'English'}`}
    >
      {localeLabels[otherLocale]}
    </button>
  )
}

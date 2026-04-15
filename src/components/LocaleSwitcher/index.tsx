'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
}

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}

export const LocaleSwitcher: React.FC<Props> = ({ className }) => {
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const otherLocale = routing.locales.find((l) => l !== currentLocale) as Locale

  const handleSwitch = () => {
    router.replace(pathname, { locale: otherLocale })
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className={cn(
        'cursor-pointer text-sm font-medium text-primary transition-opacity hover:opacity-75',
        className,
      )}
      aria-label={`Switch to ${otherLocale === 'fr' ? 'Français' : 'English'}`}
    >
      {localeLabels[otherLocale]}
    </button>
  )
}

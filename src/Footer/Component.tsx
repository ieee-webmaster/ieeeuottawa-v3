import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import type { Footer } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { prefixLocalePath } from '@/i18n/config'
import { getRequestLocale } from '@/i18n/server'
import { getMessages } from '@/i18n/messages'
const currentYear = new Date().getFullYear()

export async function Footer() {
  const locale = await getRequestLocale()
  const messages = getMessages(locale)
  const footerData: Footer = await getCachedGlobal('footer', 1)(locale)

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-primary bg-primary text-primary-foreground">
      <div className="container py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
          <Link className="flex items-center" href={prefixLocalePath(locale, '/')}>
            <Logo />
          </Link>

          <nav className="flex flex-wrap gap-4 md:justify-end">
            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} locale={locale} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p className="text-xs opacity-70 text-center md:text-left">
            &copy; {currentYear} IEEE UOttawa. {messages.footer.rightsReserved}
          </p>

          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}

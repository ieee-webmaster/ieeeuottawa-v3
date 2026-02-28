import { getCachedGlobal } from '@/utilities/getGlobals'
import { Link } from '@/i18n/navigation'
import React from 'react'
import { getLocale } from 'next-intl/server'
import type { Footer, Config } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
const currentYear = new Date().getFullYear()

export async function Footer() {
  const locale = (await getLocale()) as Config['locale']
  const footerData: Footer = await getCachedGlobal('footer', 1, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-primary bg-primary text-primary-foreground">
      <div className="container py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 w-full">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>

          <nav className="flex flex-wrap gap-4 md:justify-end">
            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p className="text-xs opacity-70 text-center md:text-left">
            &copy; {currentYear} IEEE UOttawa. All rights reserved.
          </p>

          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}

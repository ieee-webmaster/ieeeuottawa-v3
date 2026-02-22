'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { getLocaleFromPathname, prefixLocalePath } from '@/i18n/config'
import { usePathname } from 'next/navigation'
import { getMessages } from '@/i18n/messages'
import { LocaleToggle } from './LocaleToggle'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const messages = getMessages(locale)

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" locale={locale} />
      })}
      <Link href={prefixLocalePath(locale, '/search')}>
        <span className="sr-only">{messages.common.search}</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
      <LocaleToggle />
    </nav>
  )
}

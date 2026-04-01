'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Link } from '@/i18n/navigation'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType; documentYears?: (string | number)[] }> = ({
  data,
  documentYears = [],
}) => {
  const navItems = data?.navItems || []

  return (
    <nav
      className="flex items-center gap-0 flex-wrap"
      style={{ fontFamily: "'Tahoma','MS Sans Serif','Arial',sans-serif" }}
    >
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          appearance="link"
          className="px-2 py-0.5 text-xs text-foreground underline hover:bg-primary hover:text-white focus:outline-none"
        />
      ))}

      <div className="w-px h-4 mx-1" style={{ background: 'var(--win-shadow)' }} aria-hidden="true" />

      <LocaleSwitcher />

      <Link
        href="/search"
        className="win-btn inline-flex items-center gap-1 ml-1 text-xs"
        style={{ padding: '2px 6px' }}
      >
        <SearchIcon className="w-3 h-3" aria-hidden="true" />
        <span className="sr-only">Search</span>
        <span aria-hidden="true">Search</span>
      </Link>
    </nav>
  )
}

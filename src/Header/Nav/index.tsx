'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import type { ResolvedNavItem } from '@/plugins/payload-navigation'

import { cn } from '@/utilities/ui'
import { DropdownItem } from './DropdownItem'
import { LinkItem } from './LinkItem'

interface Props {
  items: ResolvedNavItem[]
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export const HeaderNav: React.FC<Props> = ({ items, orientation = 'horizontal', onNavigate }) => {
  const t = useTranslations('nav')

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'flex-row items-center gap-1'
          : 'flex-col items-stretch gap-2',
      )}
      aria-label={t('primary')}
    >
      {items.map((item, index) => {
        const key = item.id ?? `${item.kind}-${index}`
        if (item.kind === 'dropdown') {
          return (
            <DropdownItem key={key} item={item} orientation={orientation} onNavigate={onNavigate} />
          )
        }
        return <LinkItem key={key} item={item} orientation={orientation} onNavigate={onNavigate} />
      })}
    </nav>
  )
}

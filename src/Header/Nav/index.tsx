'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

interface Props {
  data: HeaderType
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export const HeaderNav: React.FC<Props> = ({ data, orientation = 'horizontal', onNavigate }) => {
  const t = useTranslations('nav')
  const navItems = data?.navItems || []

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
      {navItems.map(({ link, id }, i) => (
        <CMSLink
          key={id ?? i}
          {...link}
          appearance="link"
          onClick={onNavigate}
          className={cn(
            'rounded px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary',
            orientation === 'vertical' && 'w-full px-0 py-3 text-lg font-medium',
          )}
        />
      ))}
    </nav>
  )
}

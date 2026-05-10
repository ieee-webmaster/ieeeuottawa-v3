'use client'

import React from 'react'

import type { ResolvedLinkRow } from '@/plugins/payload-navigation'

import { Link } from '@/i18n/navigation'
import { cn } from '@/utilities/ui'
import { itemBaseClass, itemVerticalClass } from './styles'

type LinkItemProps = {
  item: ResolvedLinkRow
  orientation: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export const LinkItem: React.FC<LinkItemProps> = ({ item, orientation, onNavigate }) => {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(itemBaseClass, orientation === 'vertical' && itemVerticalClass)}
      {...(item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {item.label}
    </Link>
  )
}

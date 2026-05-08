'use client'

import React from 'react'

import type { ResolvedLinkRow } from '@/plugins/payload-navigation'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { itemBaseClass, itemVerticalClass } from './styles'

type LinkItemProps = {
  item: ResolvedLinkRow
  orientation: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export const LinkItem: React.FC<LinkItemProps> = ({ item, orientation, onNavigate }) => {
  const link = (item.link ?? {}) as Parameters<typeof CMSLink>[0]

  return (
    <CMSLink
      {...link}
      appearance="link"
      onClick={onNavigate}
      className={cn(itemBaseClass, orientation === 'vertical' && itemVerticalClass)}
    />
  )
}

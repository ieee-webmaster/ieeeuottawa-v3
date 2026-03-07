import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/navigation'
import type { RoutedCollection } from '@/utilities/routes'
import React from 'react'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: RoutedCollection
    value: { slug?: string } | string | number | null
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value?.slug
      ? reference.relationTo === 'pages'
        ? reference.value.slug === 'home'
          ? '/'
          : `/${encodeURIComponent(reference.value.slug)}`
        : `/${reference.relationTo}/${encodeURIComponent(reference.value.slug)}`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label}
        {children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label}
        {children}
      </Link>
    </Button>
  )
}

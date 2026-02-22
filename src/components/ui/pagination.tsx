'use client'

import type { ButtonProps } from '@/components/ui/button'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import type { AppLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    role="navigation"
    {...props}
  />
)

const PaginationContent: React.FC<
  { ref?: React.Ref<HTMLUListElement> } & React.HTMLAttributes<HTMLUListElement>
> = ({ className, ref, ...props }) => (
  <ul className={cn('flex flex-row items-center gap-1', className)} ref={ref} {...props} />
)

const PaginationItem: React.FC<
  { ref?: React.Ref<HTMLLIElement> } & React.HTMLAttributes<HTMLLIElement>
> = ({ className, ref, ...props }) => <li className={cn('', className)} ref={ref} {...props} />

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'button'>

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <button
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        size,
        variant: isActive ? 'outline' : 'ghost',
      }),
      className,
    )}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  locale = 'en',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { locale?: AppLocale }) => {
  const messages = getMessages(locale)

  return (
    <PaginationLink
      aria-label={messages.pagination.goToPrevious}
      className={cn('gap-1 pl-2.5', className)}
      size="default"
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{messages.pagination.previous}</span>
    </PaginationLink>
  )
}

const PaginationNext = ({
  className,
  locale = 'en',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { locale?: AppLocale }) => {
  const messages = getMessages(locale)

  return (
    <PaginationLink
      aria-label={messages.pagination.goToNext}
      className={cn('gap-1 pr-2.5', className)}
      size="default"
      {...props}
    >
      <span>{messages.pagination.next}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
}

const PaginationEllipsis = ({
  className,
  locale = 'en',
  ...props
}: React.ComponentProps<'span'> & { locale?: AppLocale }) => {
  const messages = getMessages(locale)

  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{messages.pagination.morePages}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

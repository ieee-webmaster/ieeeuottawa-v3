'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import type { ResolvedDropdownRow } from '@/plugins/payload-navigation'

import { Link } from '@/i18n/navigation'
import { cn } from '@/utilities/ui'
import { itemBaseClass, itemVerticalClass } from './styles'

type DropdownItemProps = {
  item: ResolvedDropdownRow
  orientation: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ item, orientation, onNavigate }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const menuId = useId()

  useEffect(() => {
    if (!open || orientation === 'vertical') return
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, orientation])

  if (item.items.length === 0) {
    return (
      <span
        className={cn(
          itemBaseClass,
          'cursor-default opacity-60',
          orientation === 'vertical' && itemVerticalClass,
        )}
      >
        {item.label}
      </span>
    )
  }

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          id={buttonId}
          onClick={() => setOpen((value) => !value)}
          className={cn(itemBaseClass, itemVerticalClass, 'flex items-center justify-between')}
        >
          <span>{item.label}</span>
          <ChevronDownIcon
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
        {open && (
          <ul
            id={menuId}
            aria-labelledby={buttonId}
            className="flex flex-col gap-1 border-l border-border pl-4"
          >
            {item.items.map((entry, idx) => (
              <li key={`${entry.href}-${idx}`}>
                <Link
                  href={entry.href}
                  onClick={onNavigate}
                  className="block py-2 text-base font-medium text-foreground hover:text-primary"
                  {...(entry.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                >
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        id={buttonId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        className={cn(itemBaseClass, 'inline-flex items-center gap-1')}
      >
        <span>{item.label}</span>
        <ChevronDownIcon
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-labelledby={buttonId}
        hidden={!open}
        aria-hidden={!open}
        className={cn(
          'absolute left-0 top-full min-w-[12rem] rounded-md border border-border bg-background py-2 shadow-lg transition-opacity',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {item.items.map((entry, idx) => (
          <Link
            key={`${entry.href}-${idx}`}
            href={entry.href}
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-card hover:text-primary"
            {...(entry.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {entry.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

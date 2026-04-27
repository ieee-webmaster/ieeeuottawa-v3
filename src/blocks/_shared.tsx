import React from 'react'

import { cn } from '@/utilities/ui'
import type { BlockTheme } from '@/blocks/theme'

export type { BlockTheme } from '@/blocks/theme'

export const sectionShellClasses: Record<BlockTheme, string> = {
  default: 'bg-transparent text-foreground',
  muted: 'bg-muted/40 text-foreground',
  accent:
    'text-foreground bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--secondary)/0.10),transparent_55%),linear-gradient(180deg,hsl(var(--primary)/0.06),hsl(var(--primary)/0.02))]',
  dark: 'bg-[#03164f] text-white [--rule:theme(colors.white/15)] [--mute:theme(colors.white/65)]',
}

export const themeRule: Record<BlockTheme, string> = {
  default: 'bg-foreground/15',
  muted: 'bg-foreground/15',
  accent: 'bg-primary/25',
  dark: 'bg-white/15',
}

export const themeMutedText: Record<BlockTheme, string> = {
  default: 'text-muted-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-foreground/70',
  dark: 'text-white/65',
}

export const themeKickerText: Record<BlockTheme, string> = {
  default: 'text-primary',
  muted: 'text-primary',
  accent: 'text-primary',
  dark: 'text-[hsl(208,80%,72%)]',
}

type SectionShellProps = {
  theme: BlockTheme
  children: React.ReactNode
  className?: string
  innerClassName?: string
  /** Disable the inner `container` wrapper (block handles its own width). */
  bare?: boolean
  /** Override default vertical padding on the outer band. */
  padding?: string
  as?: 'section' | 'div' | 'article'
}

export const SectionShell: React.FC<SectionShellProps> = ({
  theme,
  children,
  className,
  innerClassName,
  bare = false,
  padding = 'py-16 md:py-24',
  as: As = 'section',
}) => {
  return (
    <As
      data-block-theme={theme}
      data-theme={theme === 'dark' ? 'dark' : undefined}
      className={cn('relative w-full', sectionShellClasses[theme], padding, className)}
    >
      {bare ? children : <div className={cn('container', innerClassName)}>{children}</div>}
    </As>
  )
}

type EyebrowProps = {
  theme: BlockTheme
  children: React.ReactNode
  className?: string
  withRule?: boolean
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  theme,
  children,
  className,
  withRule = true,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.28em]',
        themeKickerText[theme],
        className,
      )}
    >
      {withRule ? <span aria-hidden="true" className={cn('h-px w-8', themeRule[theme])} /> : null}
      {children}
    </span>
  )
}

type IndexNumberProps = {
  value: number
  total?: number
  theme: BlockTheme
  className?: string
}

export const IndexNumber: React.FC<IndexNumberProps> = ({ value, total, theme, className }) => {
  const formatted = String(value).padStart(2, '0')
  const totalFormatted = total ? `/${String(total).padStart(2, '0')}` : ''

  return (
    <span
      className={cn('font-mono text-[0.7rem] tracking-[0.18em]', themeKickerText[theme], className)}
    >
      {formatted}
      {totalFormatted ? <span className={cn('opacity-50')}>{totalFormatted}</span> : null}
    </span>
  )
}

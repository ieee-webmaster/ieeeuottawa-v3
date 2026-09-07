import React from 'react'

import { cn } from '@/utilities/ui'
import type { BlockTheme } from '@/blocks/theme'

export type { BlockTheme } from '@/blocks/theme'

const sectionShellClasses: Record<BlockTheme, string> = {
  default: 'bg-transparent text-foreground',
  muted: 'bg-muted/50 text-foreground',
  accent: 'bg-background text-foreground',
  dark: 'bg-background text-white [--rule:theme(colors.white/15)] [--mute:theme(colors.white/65)]',
}

export const themeRule: Record<BlockTheme, string> = {
  default: 'bg-foreground/25',
  muted: 'bg-foreground/25',
  accent: 'bg-white/25',
  dark: 'bg-white/25',
}

export const themeMutedText: Record<BlockTheme, string> = {
  default: 'text-muted-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-white/80',
  dark: 'text-white/65',
}

export const themeKickerText: Record<BlockTheme, string> = {
  default: 'text-primary',
  muted: 'text-primary',
  accent: 'text-white/80',
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
  padding = 'py-12 md:py-16',
  as: As = 'section',
}) => {
  return (
    <As
      data-block-theme={theme}
      data-theme={theme === 'dark' || theme === 'accent' ? 'dark' : undefined}
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

import React from 'react'

import type { CTABandBlock as CTABandBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

const themeClasses: Record<NonNullable<CTABandBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-muted/40 text-foreground',
  accent: 'border-primary/20 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

export const CTABandBlock: React.FC<CTABandBlockProps> = ({
  alignment = 'left',
  description,
  eyebrow,
  links,
  theme = 'accent',
  title,
}) => {
  const centered = alignment === 'center'

  return (
    <div className="container">
      <section className={cn('rounded-[1.5rem] border p-6 md:p-8', themeClasses[theme])}>
        <div
          className={cn(
            'flex flex-col gap-6 md:gap-8',
            centered
              ? 'items-center text-center'
              : 'md:flex-row md:items-center md:justify-between',
          )}
        >
          <div className={cn('space-y-4', !centered && 'max-w-3xl')}>
            {eyebrow ? (
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.24em]',
                  theme !== 'dark' && 'text-muted-foreground',
                )}
              >
                {eyebrow}
              </p>
            ) : null}

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
              {description ? (
                <p
                  className={cn(
                    'text-base leading-relaxed',
                    theme !== 'dark' && 'text-muted-foreground',
                    theme === 'dark' && 'text-white/80',
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {links && links.length > 0 ? (
            <div
              className={cn(
                'flex flex-col gap-3 sm:flex-row sm:flex-wrap',
                centered && 'justify-center',
              )}
            >
              {links.map(({ link }, index) => (
                <CMSLink key={index} size="lg" {...link} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

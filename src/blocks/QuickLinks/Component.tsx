import React from 'react'

import type { QuickLinksBlock as QuickLinksBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

const sectionThemeClasses: Record<NonNullable<QuickLinksBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

const itemThemeClasses: Record<NonNullable<QuickLinksBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-background text-foreground',
  accent: 'border-primary/15 bg-background text-foreground',
  dark: 'border-slate-800 bg-slate-900 text-white',
}

export const QuickLinksBlock: React.FC<QuickLinksBlockProps> = ({
  description,
  eyebrow,
  links,
  style = 'cards',
  theme = 'default',
  title,
}) => {
  return (
    <div className="container">
      <section
        className={cn('space-y-8 rounded-[1.5rem] border p-6 md:p-8', sectionThemeClasses[theme])}
      >
        <div className="max-w-3xl space-y-4">
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
              style === 'cards'
                ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
                : 'grid divide-y divide-border overflow-hidden rounded-[1.25rem] border border-border',
            )}
          >
            {links.map((item, index) => (
              <article
                key={index}
                className={cn(
                  'flex flex-col gap-3 p-5',
                  style === 'cards' && ['rounded-[1.25rem] border', itemThemeClasses[theme]],
                  style === 'list' && [
                    'bg-transparent transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-6',
                    theme !== 'dark' && 'hover:bg-card/60',
                    theme === 'dark' && 'hover:bg-slate-900',
                  ],
                )}
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  {item.description ? (
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        theme !== 'dark' && 'text-muted-foreground',
                        theme === 'dark' && 'text-white/75',
                      )}
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className={cn('pt-1', style === 'list' && 'sm:shrink-0')}>
                  <CMSLink {...item.link} />
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

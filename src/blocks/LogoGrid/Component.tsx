import React from 'react'

import type { LogoGridBlock as LogoGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const sectionThemeClasses: Record<NonNullable<LogoGridBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

const itemThemeClasses: Record<NonNullable<LogoGridBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-background text-foreground',
  accent: 'border-primary/15 bg-background text-foreground',
  dark: 'border-slate-800 bg-slate-900 text-white',
}

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  description,
  eyebrow,
  items,
  style = 'grid',
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

        {items && items.length > 0 ? (
          <div
            className={cn(
              'grid gap-5',
              style === 'grid' && 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
              style === 'featured' && 'md:grid-cols-2 xl:grid-cols-3',
            )}
          >
            {items.map((item, index) => (
              <article
                key={index}
                className={cn(
                  'flex h-full flex-col rounded-[1.25rem] border p-5',
                  itemThemeClasses[theme],
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-xl border border-border bg-background/70 p-4',
                    style === 'grid' ? 'aspect-[3/2]' : 'aspect-[16/10]',
                    theme === 'dark' && 'bg-slate-950',
                  )}
                >
                  {item.logo && typeof item.logo === 'object' ? (
                    <Media imgClassName="h-full w-full object-contain" resource={item.logo} />
                  ) : null}
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>

                  {style === 'featured' && item.description ? (
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

                  {item.enableLink ? (
                    <div className="mt-auto pt-2">
                      <CMSLink {...item.link} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

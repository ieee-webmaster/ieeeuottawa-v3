import React from 'react'

import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const sectionThemeClasses: Record<NonNullable<CardGridBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

const cardThemeClasses: Record<NonNullable<CardGridBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-background text-foreground',
  accent: 'border-primary/15 bg-background text-foreground',
  dark: 'border-slate-800 bg-slate-900 text-white',
}

const gridColumnClasses: Record<NonNullable<CardGridBlockProps['columns']>, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 xl:grid-cols-3',
  '4': 'md:grid-cols-2 xl:grid-cols-4',
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({
  cards,
  columns = '3',
  description,
  eyebrow,
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

        {cards && cards.length > 0 ? (
          <div className={cn('grid gap-6', gridColumnClasses[columns])}>
            {cards.map((card, index) => (
              <article
                key={index}
                className={cn(
                  'flex h-full flex-col overflow-hidden rounded-[1.25rem] border',
                  cardThemeClasses[theme],
                )}
              >
                {card.media && typeof card.media === 'object' ? (
                  <Media
                    className="aspect-[4/3] overflow-hidden border-b border-border"
                    imgClassName="h-full w-full object-cover"
                    resource={card.media}
                  />
                ) : null}

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="space-y-2">
                    {card.kicker ? (
                      <p
                        className={cn(
                          'text-xs font-semibold uppercase tracking-[0.22em]',
                          theme !== 'dark' && 'text-muted-foreground',
                        )}
                      >
                        {card.kicker}
                      </p>
                    ) : null}

                    <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>

                    {card.description ? (
                      <p
                        className={cn(
                          'text-sm leading-relaxed',
                          theme !== 'dark' && 'text-muted-foreground',
                          theme === 'dark' && 'text-white/75',
                        )}
                      >
                        {card.description}
                      </p>
                    ) : null}
                  </div>

                  {card.enableLink ? (
                    <div className="mt-auto pt-2">
                      <CMSLink {...card.link} />
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

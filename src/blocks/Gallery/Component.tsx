import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const sectionThemeClasses: Record<NonNullable<GalleryBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

const itemThemeClasses: Record<NonNullable<GalleryBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-background text-foreground',
  accent: 'border-primary/15 bg-background text-foreground',
  dark: 'border-slate-800 bg-slate-900 text-white',
}

export const GalleryBlockComponent: React.FC<GalleryBlockProps> = ({
  description,
  eyebrow,
  items,
  layout = 'grid',
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
              layout === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-4',
            )}
          >
            {items.map((item, index) => {
              const featureMixSpan =
                layout === 'featureMix' && index % 5 === 0
                  ? 'xl:col-span-2 xl:row-span-2'
                  : undefined

              return (
                <article
                  key={index}
                  className={cn(
                    'overflow-hidden rounded-[1.25rem] border',
                    itemThemeClasses[theme],
                    featureMixSpan,
                  )}
                >
                  <Media
                    className={cn(
                      'overflow-hidden',
                      layout === 'grid' ? 'aspect-[4/3]' : 'aspect-[4/3] xl:aspect-[5/4]',
                      featureMixSpan && 'xl:aspect-[4/3]',
                    )}
                    imgClassName="h-full w-full object-cover"
                    resource={item.media}
                  />

                  {(item.caption || item.enableLink) && (
                    <div className="space-y-3 p-4">
                      {item.caption ? (
                        <p
                          className={cn(
                            'text-sm leading-relaxed',
                            theme !== 'dark' && 'text-muted-foreground',
                            theme === 'dark' && 'text-white/75',
                          )}
                        >
                          {item.caption}
                        </p>
                      ) : null}

                      {item.enableLink ? <CMSLink {...item.link} /> : null}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </div>
  )
}

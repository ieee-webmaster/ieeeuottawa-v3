import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'

export const GalleryBlockComponent: React.FC<GalleryBlockProps> = ({
  description,
  eyebrow,
  items,
  layout = 'grid',
  theme = 'default',
  title,
}) => {
  const t = (theme ?? 'default') as BlockTheme
  const total = items?.length ?? 0

  return (
    <SectionShell theme={t}>
      <header className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl space-y-5">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
            {title}
          </h2>
          {description ? (
            <p className={cn('text-base leading-relaxed', themeMutedText[t])}>{description}</p>
          ) : null}
        </div>
        <p className={cn('font-mono text-xs tracking-[0.2em]', themeMutedText[t])}>
          {String(total).padStart(3, '0')} <span className="opacity-60">items</span>
        </p>
      </header>

      <div className={cn('h-px w-full', themeRule[t])} />

      {items && items.length > 0 ? (
        <div
          className={cn(
            'grid gap-3 pt-8 md:gap-4 md:pt-10',
            layout === 'grid' && 'grid-cols-2 md:grid-cols-3',
            layout === 'featureMix' && 'grid-cols-2 md:grid-cols-4 md:grid-rows-2',
          )}
        >
          {items.map((item, index) => {
            const featureSpan =
              layout === 'featureMix' && index === 0 ? 'md:col-span-2 md:row-span-2' : undefined
            const revealOnInteraction = Boolean(item.enableLink)
            const mediaSize =
              layout === 'grid'
                ? '(max-width: 768px) 50vw, 33vw'
                : featureSpan
                  ? '(max-width: 768px) 50vw, 50vw'
                  : '(max-width: 768px) 50vw, 25vw'

            return (
              <figure
                key={item.id ?? index}
                className={cn('group relative overflow-hidden bg-foreground/5', featureSpan)}
              >
                {typeof item.media === 'object' && item.media !== null ? (
                  <Media
                    fill
                    className={cn(
                      'relative overflow-hidden',
                      layout === 'grid' && 'aspect-[4/3]',
                      layout === 'featureMix' && (featureSpan ? 'aspect-[5/4]' : 'aspect-square'),
                    )}
                    imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    pictureClassName="relative block h-full w-full"
                    resource={item.media}
                    size={mediaSize}
                  />
                ) : null}

                {/* Index stamp */}
                <span className="absolute right-3 top-3 rounded-sm bg-black/55 px-2 py-1 font-mono text-[0.65rem] tracking-[0.22em] text-white backdrop-blur-sm">
                  {String(index + 1).padStart(3, '0')}
                </span>

                {(item.caption || item.enableLink) && (
                  <figcaption
                    className={cn(
                      'absolute inset-x-0 bottom-0 translate-y-0 bg-gradient-to-t from-black/85 via-black/65 to-transparent px-4 pb-4 pt-12 text-white transition-transform duration-500 ease-out',
                      revealOnInteraction &&
                        'md:translate-y-full md:group-hover:translate-y-0 md:group-focus-within:translate-y-0',
                    )}
                  >
                    {item.caption ? (
                      <p className="text-sm leading-relaxed text-white/90">{item.caption}</p>
                    ) : null}
                    {item.enableLink ? (
                      <CMSLink
                        {...item.link}
                        appearance="inline"
                        className="mt-3 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white hover:text-[hsl(208,80%,80%)]"
                      >
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </CMSLink>
                    ) : null}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      ) : null}
    </SectionShell>
  )
}

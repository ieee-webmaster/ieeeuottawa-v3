import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, themeRule } from '@/blocks/_shared'

export const GalleryBlockComponent: React.FC<GalleryBlockProps> = ({
  description,
  eyebrow,
  items,
  layout = 'grid',
  theme = 'default',
  title,
}) => {
  const t = theme ?? 'default'

  return (
    <SectionShell theme={t}>
      <header className="mb-8">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="section-title">{title}</h2>
          {description ? (
            <p className={cn('text-base leading-relaxed', themeMutedText[t])}>{description}</p>
          ) : null}
        </div>
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
            const mediaSizesPreset =
              layout === 'grid' ? 'galleryThird' : featureSpan ? 'galleryHalf' : 'galleryQuarter'

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
                    imgClassName="object-cover"
                    pictureClassName="relative block h-full w-full"
                    resource={item.media}
                    sizesPreset={mediaSizesPreset}
                  />
                ) : null}

                {(item.caption || item.enableLink) && (
                  <figcaption className={cn('space-y-2 p-4 text-foreground')}>
                    {item.caption ? (
                      <p className="text-sm leading-relaxed">{item.caption}</p>
                    ) : null}
                    {item.enableLink ? (
                      <CMSLink
                        {...item.link}
                        appearance="inline"
                        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-primary hover:underline"
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

import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeKickerText, themeMutedText, themeRule } from '@/blocks/_shared'

const gridColumnClasses: Record<NonNullable<CardGridBlockProps['columns']>, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

type CardData = NonNullable<CardGridBlockProps['cards']>[number]

const isSvgMedia = (media: CardData['media']) => {
  if (!media || typeof media !== 'object') return false
  return media.mimeType === 'image/svg+xml' || (media.filename ?? '').toLowerCase().endsWith('.svg')
}

export const CardGridBlock: React.FC<CardGridBlockProps> = ({
  cards,
  columns = '3',
  description,
  eyebrow,
  theme = 'default',
  title,
}) => {
  const t = theme ?? 'default'
  // Keep icons compact; reserve the larger image area for photos.
  const hasAnyMedia = (cards ?? []).some((c) => c.media && typeof c.media === 'object')
  const allSvgMedia = hasAnyMedia && (cards ?? []).every((c) => isSvgMedia(c.media))
  const variant: 'photo' | 'icon' | 'text' = !hasAnyMedia ? 'text' : allSvgMedia ? 'icon' : 'photo'

  const mediaSizesPreset = columns === '2' ? 'half' : columns === '4' ? 'quarter' : 'third'

  return (
    <SectionShell theme={t}>
      <header className="mb-8 max-w-3xl space-y-3">
        <div className="space-y-5">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="section-title">{title}</h2>
        </div>
        {description ? (
          <p className={cn('text-base leading-relaxed', themeMutedText[t])}>{description}</p>
        ) : null}
      </header>

      {variant !== 'text' && <div className={cn('h-px w-full', themeRule[t])} />}

      {cards && cards.length > 0 ? (
        <div
          className={cn(
            'grid gap-x-8 gap-y-10',
            variant !== 'text' && 'pt-7',
            gridColumnClasses[columns],
          )}
        >
          {cards.map((card, index) => (
            <article
              key={card.id ?? index}
              className={cn(
                'group flex h-full flex-col',
                variant === 'text'
                  ? cn(
                      'gap-4 border-t pt-6',
                      t === 'dark' ? 'border-white/15' : 'border-foreground/15',
                    )
                  : 'gap-3',
              )}
            >
              {variant === 'photo' && card.media && typeof card.media === 'object' ? (
                <div className="relative overflow-hidden">
                  <Media
                    fill
                    className={cn(
                      'relative aspect-square overflow-hidden bg-foreground/5',
                      t === 'dark' && 'bg-white/5',
                    )}
                    imgClassName="object-cover object-top"
                    pictureClassName="relative block h-full w-full"
                    resource={card.media}
                    sizesPreset={mediaSizesPreset}
                  />
                </div>
              ) : null}

              {variant === 'icon' && card.media && typeof card.media === 'object' ? (
                <div className="flex h-12 w-12 items-center">
                  <Media
                    className="h-10 w-10"
                    imgClassName="h-10 w-10 object-contain dark:invert"
                    pictureClassName="block h-10 w-10"
                    resource={card.media}
                    sizesPreset="icon"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-3">
                {card.kicker ? (
                  <p
                    className={cn(
                      'font-mono text-[0.7rem] uppercase tracking-[0.22em]',
                      themeKickerText[t],
                    )}
                  >
                    {card.kicker}
                  </p>
                ) : null}

                <h3 className="text-balance font-display text-xl font-medium leading-tight tracking-tight md:text-2xl">
                  {card.title}
                </h3>

                {card.description ? (
                  <p className={cn('text-sm leading-relaxed', themeMutedText[t])}>
                    {card.description}
                  </p>
                ) : null}

                {card.enableLink ? (
                  <div className="mt-auto inline-flex items-center gap-2 pt-3">
                    <CMSLink
                      {...card.link}
                      appearance="inline"
                      className={cn(
                        'inline-flex min-h-11 items-center gap-2 font-mono text-sm transition-colors hover:text-[hsl(var(--interactive))]',
                        t === 'dark' ? 'text-white' : 'text-primary',
                      )}
                    >
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </CMSLink>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </SectionShell>
  )
}

import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import {
  Eyebrow,
  SectionShell,
  themeKickerText,
  themeMutedText,
  themeRule,
  type BlockTheme,
} from '@/blocks/_shared'

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
  const t = (theme ?? 'default') as BlockTheme
  const total = cards?.length ?? 0
  // Detect homogeneity so we can pick a layout that fits the content type:
  //   - all photo cards          → original aspect-[4/3] hero treatment
  //   - all SVG / icon cards     → small square chip + text (icons get lost in 4:3)
  //   - all text-only cards      → editorial list with mono index rail
  const hasAnyMedia = (cards ?? []).some((c) => c.media && typeof c.media === 'object')
  const allSvgMedia = hasAnyMedia && (cards ?? []).every((c) => isSvgMedia(c.media))
  const variant: 'photo' | 'icon' | 'text' = !hasAnyMedia
    ? 'text'
    : allSvgMedia
      ? 'icon'
      : 'photo'

  const mediaSize =
    columns === '2'
      ? '(max-width: 768px) 100vw, 50vw'
      : columns === '4'
        ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
        : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'

  const indexLabel = (i: number) => (
    <span
      className={cn(
        'font-mono text-[0.7rem] uppercase tracking-[0.22em]',
        t === 'dark' ? 'text-white/55' : 'text-foreground/45',
      )}
    >
      {String(i + 1).padStart(2, '0')}
      <span className="opacity-60">{` / ${String(total).padStart(2, '0')}`}</span>
    </span>
  )

  return (
    <SectionShell theme={t}>
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
            {title}
          </h2>
        </div>
        <div className="md:col-span-5">
          {description ? (
            <p className={cn('text-base leading-relaxed', themeMutedText[t])}>{description}</p>
          ) : null}
        </div>
      </header>

      <div className={cn('h-px w-full', themeRule[t])} />

      {cards && cards.length > 0 ? (
        <div
          className={cn(
            'grid pt-10 md:pt-14',
            variant === 'text'
              ? 'gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3'
              : cn('gap-x-8 gap-y-14', gridColumnClasses[columns]),
          )}
        >
          {cards.map((card, index) => (
            <article
              key={card.id ?? index}
              className={cn(
                'group flex h-full flex-col',
                variant === 'text'
                  ? cn(
                      'gap-4 border-l pl-6 pt-1',
                      t === 'dark' ? 'border-white/15' : 'border-foreground/15',
                    )
                  : 'gap-5',
              )}
            >
              {variant === 'photo' && card.media && typeof card.media === 'object' ? (
                <div className="relative overflow-hidden">
                  <Media
                    fill
                    className={cn(
                      'relative aspect-[4/3] overflow-hidden bg-foreground/5 transition-transform duration-700 ease-out group-hover:scale-[1.04]',
                      t === 'dark' && 'bg-white/5',
                    )}
                    imgClassName="object-cover"
                    pictureClassName="relative block h-full w-full"
                    resource={card.media}
                    size={mediaSize}
                  />
                  <span className="absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-1 font-mono text-[0.7rem] tracking-[0.2em] text-white backdrop-blur-sm">
                    {String(index + 1).padStart(2, '0')}
                    <span className="opacity-50">{`/${String(total).padStart(2, '0')}`}</span>
                  </span>
                </div>
              ) : null}

              {variant === 'icon' && card.media && typeof card.media === 'object' ? (
                <div className="flex items-center justify-between gap-4">
                  <div
                    className={cn(
                      'relative flex h-14 w-14 items-center justify-center rounded-sm border',
                      t === 'dark' ? 'border-white/15 bg-white/5' : 'border-foreground/15 bg-foreground/[0.03]',
                    )}
                  >
                    <Media
                      className="h-8 w-8"
                      imgClassName="h-8 w-8 object-contain"
                      pictureClassName="relative block h-8 w-8"
                      resource={card.media}
                      size="56px"
                    />
                  </div>
                  {indexLabel(index)}
                </div>
              ) : null}

              {variant === 'text' ? <div className="-ml-px">{indexLabel(index)}</div> : null}

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

                <h3 className="text-balance text-xl font-medium leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary md:text-2xl">
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
                        'inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.22em] transition-colors',
                        t === 'dark'
                          ? 'text-white hover:text-[hsl(208,80%,72%)]'
                          : 'text-primary hover:text-secondary',
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

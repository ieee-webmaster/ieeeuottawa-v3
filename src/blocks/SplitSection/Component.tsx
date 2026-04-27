import React from 'react'

import type { SplitSectionBlock as SplitSectionBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'

const mediaAspectClasses: Record<NonNullable<SplitSectionBlockProps['mediaAspect']>, string> = {
  landscape: 'aspect-[16/9]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
}

export const SplitSectionBlock: React.FC<SplitSectionBlockProps> = ({
  content,
  eyebrow,
  links,
  media,
  mediaAspect = 'landscape',
  mediaPosition = 'right',
  theme = 'default',
  title,
}) => {
  const t = (theme ?? 'default') as BlockTheme
  const mediaLeft = mediaPosition === 'left'
  const caption = media && typeof media === 'object' ? media.caption : null

  return (
    <SectionShell theme={t}>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
        {/* Copy column */}
        <div
          className={cn(
            'flex flex-col gap-8 lg:col-span-5',
            mediaLeft ? 'lg:order-2 lg:col-start-8' : 'lg:order-1',
          )}
        >
          <div className="space-y-5">
            {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}

            <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
              {title}
            </h2>

            <div className={cn('h-px w-12', themeRule[t])} />

            <RichText
              className={cn(
                'max-w-prose [&_p]:text-base [&_p]:leading-relaxed',
                t === 'dark' && '[&_p]:text-white/80 [&_li]:text-white/80',
                t !== 'dark' && '[&_p]:text-muted-foreground [&_li]:text-muted-foreground',
              )}
              data={content}
              enableGutter={false}
            />
          </div>

          {links && links.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {links.map(({ id, link }, index) => (
                <CMSLink key={id ?? index} size="lg" {...link} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Media column */}
        <div className={cn('min-w-0 lg:col-span-7', mediaLeft ? 'lg:order-1' : 'lg:order-2')}>
          {media && typeof media === 'object' ? (
            <figure className="relative">
              <Media
                fill
                className={cn(
                  'relative overflow-hidden bg-foreground/5',
                  mediaAspectClasses[mediaAspect],
                  t === 'dark' && 'bg-white/5',
                )}
                imgClassName="object-cover"
                pictureClassName="relative block h-full w-full"
                resource={media}
                size="(max-width: 1024px) 100vw, 58vw"
              />
              {caption ? (
                <figcaption className={cn('mt-4', themeMutedText[t])}>
                  <RichText data={caption} enableGutter={false} />
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>
    </SectionShell>
  )
}

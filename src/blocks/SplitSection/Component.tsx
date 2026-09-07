import React from 'react'

import type { SplitSectionBlock as SplitSectionBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText } from '@/blocks/_shared'

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
  const t = theme ?? 'default'
  const mediaLeft = mediaPosition === 'left'
  const hasMedia = media && typeof media === 'object'
  const caption = hasMedia ? media.caption : null

  // Keep text-only sections within one readable column.
  if (!hasMedia) {
    return (
      <SectionShell theme={t}>
        <div className="max-w-3xl space-y-4">
          <div className="space-y-3">
            {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
            <h2 className="section-title">{title}</h2>
          </div>

          <div className="space-y-6">
            <RichText
              className={cn(
                'mx-0 max-w-prose [&_p]:text-base [&_p]:leading-relaxed md:[&_p]:text-lg',
                t === 'dark' && '[&_p]:text-white/80 [&_li]:text-white/80',
                t !== 'dark' && '[&_p]:text-muted-foreground [&_li]:text-muted-foreground',
              )}
              data={content}
              enableGutter={false}
            />

            {links && links.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {links.map(({ id, link }, index) => (
                  <CMSLink key={id ?? index} size="lg" {...link} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell theme={t}>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        {/* Copy column */}
        <div
          className={cn(
            'flex flex-col gap-6 lg:col-span-5',
            mediaLeft ? 'lg:order-2 lg:col-start-8' : 'lg:order-1',
          )}
        >
          <div className="space-y-3">
            {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}

            <h2 className="section-title">{title}</h2>

            <RichText
              className={cn(
                'mx-0 max-w-prose [&_p]:text-base [&_p]:leading-relaxed',
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
              sizesPreset="split"
            />
            {caption ? (
              <figcaption className={cn('mt-4', themeMutedText[t])}>
                <RichText data={caption} enableGutter={false} />
              </figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </SectionShell>
  )
}

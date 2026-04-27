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
              {links.map(({ link }, index) => (
                <CMSLink key={index} size="lg" {...link} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Media column */}
        <div className={cn('min-w-0 lg:col-span-7', mediaLeft ? 'lg:order-1' : 'lg:order-2')}>
          {media && typeof media === 'object' ? (
            <figure className="relative">
              <Media
                className={cn(
                  'overflow-hidden bg-foreground/5',
                  mediaAspectClasses[mediaAspect],
                  t === 'dark' && 'bg-white/5',
                )}
                imgClassName="h-full w-full object-cover"
                resource={media}
              />
              {/* Caption strip with media metadata */}
              <figcaption
                className={cn(
                  'mt-3 flex items-center justify-between gap-4 font-mono text-[0.7rem] uppercase tracking-[0.22em]',
                  themeMutedText[t],
                )}
              >
                <span aria-hidden="true" className={cn('h-px flex-1', themeRule[t])} />
                <span>{mediaAspect}</span>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </SectionShell>
  )
}

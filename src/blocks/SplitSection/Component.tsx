import React from 'react'

import type { SplitSectionBlock as SplitSectionBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

const mediaAspectClasses: Record<NonNullable<SplitSectionBlockProps['mediaAspect']>, string> = {
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
}

const themeClasses: Record<NonNullable<SplitSectionBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
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
  return (
    <div className="container">
      <section
        className={cn(
          'grid gap-8 rounded-[1.5rem] border p-6 md:p-8 lg:grid-cols-2 lg:items-center lg:gap-12',
          themeClasses[theme],
        )}
      >
        <div className={cn('space-y-6', mediaPosition === 'left' && 'lg:order-2')}>
          <div className="space-y-4">
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

            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
              <RichText
                className={cn(theme === 'dark' && '[&_p]:text-white/80 [&_li]:text-white/80')}
                data={content}
                enableGutter={false}
              />
            </div>
          </div>

          {links && links.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {links.map(({ link }, index) => (
                <CMSLink key={index} size="lg" {...link} />
              ))}
            </div>
          ) : null}
        </div>

        <div className={cn('min-w-0', mediaPosition === 'left' && 'lg:order-1')}>
          {media && typeof media === 'object' ? (
            <Media
              className={cn(
                'overflow-hidden rounded-[1.25rem] border border-border',
                mediaAspectClasses[mediaAspect],
              )}
              imgClassName="h-full w-full object-cover"
              resource={media}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}

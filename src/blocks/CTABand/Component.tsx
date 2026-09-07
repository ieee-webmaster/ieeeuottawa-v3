import React from 'react'

import type { CTABandBlock as CTABandBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText } from '@/blocks/_shared'

export const CTABandBlock: React.FC<CTABandBlockProps> = ({
  alignment = 'left',
  description,
  eyebrow,
  links,
  theme = 'accent',
  title,
}) => {
  const t = theme ?? 'accent'
  const centered = alignment === 'center'

  return (
    <SectionShell theme={t} padding="py-12 md:py-16" className="cta-band border-y border-border">
      <div
        className={cn(
          'relative grid gap-10',
          centered ? 'place-items-center text-center' : 'md:grid-cols-12 md:items-center md:gap-12',
        )}
      >
        <div className={cn('space-y-4', centered ? 'max-w-2xl' : 'md:col-span-7 lg:col-span-8')}>
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}

          <h2 className="section-title">{title}</h2>

          {description ? (
            <p
              className={cn(
                'max-w-xl text-base leading-relaxed',
                themeMutedText[t],
                centered && 'mx-auto',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {links && links.length > 0 ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-3',
              centered ? 'justify-center' : 'md:col-span-5 md:justify-end lg:col-span-4',
            )}
          >
            {links.map(({ id, link }, index) => (
              <CMSLink key={id ?? index} size="lg" {...link} />
            ))}
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}

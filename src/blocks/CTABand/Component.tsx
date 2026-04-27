import React from 'react'

import type { CTABandBlock as CTABandBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, type BlockTheme } from '@/blocks/_shared'

export const CTABandBlock: React.FC<CTABandBlockProps> = ({
  alignment = 'left',
  description,
  eyebrow,
  links,
  theme = 'accent',
  title,
}) => {
  const t = (theme ?? 'accent') as BlockTheme
  const centered = alignment === 'center'

  return (
    <SectionShell
      theme={t}
      padding="py-20 md:py-28"
      className="overflow-hidden"
      innerClassName="relative"
    >
      {/* Decorative oversized arrow glyph */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute select-none font-mono text-[14rem] font-light leading-none md:text-[20rem]',
          centered ? 'right-2 top-2 md:right-6 md:top-6' : '-right-8 -top-12 md:-right-4 md:-top-8',
          t === 'dark' ? 'text-white/[0.04]' : 'text-primary/[0.06]',
        )}
      >
        →
      </span>

      <div
        className={cn(
          'relative grid gap-10',
          centered ? 'place-items-center text-center' : 'md:grid-cols-12 md:items-end md:gap-12',
        )}
      >
        <div className={cn('space-y-6', centered ? 'max-w-2xl' : 'md:col-span-7 lg:col-span-8')}>
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}

          <h2 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h2>

          {description ? (
            <p
              className={cn(
                'max-w-2xl text-base leading-relaxed md:text-lg',
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
            {links.map(({ link }, index) => (
              <CMSLink
                key={index}
                size="lg"
                {...link}
                className={cn(
                  t === 'dark' &&
                    link.appearance === 'default' &&
                    'bg-white text-primary hover:bg-white/90',
                  t === 'dark' &&
                    link.appearance === 'outline' &&
                    'border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Bottom hairline rule for the default theme to anchor the band */}
      {t === 'default' ? (
        <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/10" />
      ) : null}
    </SectionShell>
  )
}

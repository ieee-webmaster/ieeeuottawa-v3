import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { LogoGridBlock as LogoGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  description,
  eyebrow,
  items,
  style = 'grid',
  theme = 'default',
  title,
}) => {
  const t = (theme ?? 'default') as BlockTheme

  return (
    <SectionShell theme={t}>
      <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl space-y-5">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.5rem]">
            {title}
          </h2>
        </div>
        {description ? (
          <p className={cn('max-w-md text-base leading-relaxed', themeMutedText[t])}>
            {description}
          </p>
        ) : null}
      </header>

      <div className={cn('h-px w-full', themeRule[t])} />

      {items && items.length > 0 ? (
        style === 'grid' ? (
          <div
            className={cn(
              'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
              t === 'dark' ? 'divide-white/10' : 'divide-foreground/10',
              'divide-x divide-y',
            )}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'group relative flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 transition-colors',
                  t === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-foreground/[0.03]',
                )}
              >
                {item.logo && typeof item.logo === 'object' ? (
                  <Media
                    imgClassName={cn(
                      'h-12 w-12 object-contain opacity-70 transition-all duration-500 group-hover:opacity-100',
                      t === 'dark'
                        ? 'invert opacity-60 group-hover:opacity-90'
                        : 'dark:invert dark:opacity-80 dark:group-hover:opacity-100',
                    )}
                    loading="eager"
                    resource={item.logo}
                  />
                ) : null}
                <span
                  className={cn(
                    'text-center font-mono text-[0.65rem] uppercase tracking-[0.2em]',
                    themeMutedText[t],
                  )}
                >
                  {item.name}
                </span>
                {item.enableLink ? (
                  <CMSLink
                    {...item.link}
                    label={undefined}
                    appearance="inline"
                    className="absolute inset-0 z-10"
                  >
                    <span className="sr-only">{item.link?.label ?? item.name}</span>
                  </CMSLink>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-foreground/10 dark:divide-white/10">
            {items.map((item, index) => (
              <li key={index}>
                <article
                  className={cn(
                    'group grid gap-6 py-8 md:grid-cols-12 md:items-center md:gap-10',
                    t === 'dark' ? 'border-white/10' : 'border-foreground/10',
                  )}
                >
                  <div
                    className={cn(
                      'flex aspect-[4/3] items-center justify-center md:col-span-3 md:aspect-square',
                      t === 'dark' ? 'bg-white/5' : 'bg-foreground/5',
                    )}
                  >
                    {item.logo && typeof item.logo === 'object' ? (
                      <Media
                        imgClassName={cn(
                          'h-16 w-16 object-contain',
                          t === 'dark' ? 'invert opacity-90' : 'dark:invert dark:opacity-90',
                        )}
                        loading="eager"
                        resource={item.logo}
                      />
                    ) : null}
                  </div>

                  <div className="space-y-3 md:col-span-7">
                    <h3 className="text-balance text-xl font-medium leading-snug tracking-tight md:text-2xl">
                      {item.name}
                    </h3>
                    {item.description ? (
                      <p className={cn('text-sm leading-relaxed', themeMutedText[t])}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  {item.enableLink ? (
                    <div className="md:col-span-2 md:justify-self-end">
                      <CMSLink
                        {...item.link}
                        appearance="inline"
                        className={cn(
                          'inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.22em] transition-all duration-300 group-hover:translate-x-1',
                          t === 'dark'
                            ? 'text-white hover:text-[hsl(208,80%,72%)]'
                            : 'text-primary hover:text-secondary',
                        )}
                      >
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </CMSLink>
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </SectionShell>
  )
}

import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { QuickLinksBlock as QuickLinksBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeKickerText, themeMutedText, themeRule } from '@/blocks/_shared'

export const QuickLinksBlock: React.FC<QuickLinksBlockProps> = ({
  description,
  eyebrow,
  links,
  style = 'cards',
  theme = 'default',
  title,
}) => {
  const t = theme ?? 'default'

  return (
    <SectionShell theme={t}>
      <header className="mb-8 max-w-3xl space-y-3">
        {eyebrow && <Eyebrow theme={t}>{eyebrow}</Eyebrow>}
        <h2 className="section-title">{title}</h2>
        {description && (
          <p className={cn('text-base leading-relaxed', themeMutedText[t])}>{description}</p>
        )}
      </header>

      <div className={cn('h-px w-full', themeRule[t])} />

      {links && links.length > 0 ? (
        style === 'cards' ? (
          <div className="grid gap-px bg-foreground/10 pt-px md:grid-cols-2 lg:grid-cols-3">
            {links.map((item, index) => (
              <article
                key={item.id ?? index}
                className={cn(
                  'group relative flex flex-col gap-3 p-7 transition-colors duration-300 focus-within:ring-2 focus-within:ring-inset md:p-8',
                  // Use theme bg as tile bg so the gap-px reads as hairlines
                  t === 'dark' && 'bg-[#03164f] hover:bg-[#04205f] focus-within:ring-white/80',
                  t === 'accent' && 'bg-background hover:bg-primary/5 focus-within:ring-primary',
                  t === 'muted' &&
                    'bg-background hover:bg-foreground/[0.03] focus-within:ring-primary',
                  t === 'default' &&
                    'bg-background hover:bg-foreground/[0.03] focus-within:ring-primary',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-balance text-xl font-medium leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {item.title}
                  </h3>
                  <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                      themeKickerText[t],
                    )}
                  />
                </div>

                {item.description ? (
                  <p className={cn('text-sm leading-relaxed', themeMutedText[t])}>
                    {item.description}
                  </p>
                ) : null}

                <CMSLink
                  {...item.link}
                  label={undefined}
                  appearance="inline"
                  className="absolute inset-0 z-10 focus-visible:outline-none"
                >
                  <span className="sr-only">{item.link?.label ?? item.title}</span>
                </CMSLink>
              </article>
            ))}
          </div>
        ) : (
          <ul
            role="list"
            className={cn('divide-y', t === 'dark' ? 'divide-white/20' : 'divide-foreground/20')}
          >
            {links.map((item, index) => (
              <li
                key={item.id ?? index}
                className={cn(
                  'group relative transition-shadow focus-within:ring-2 focus-within:ring-inset',
                  t === 'dark' ? 'focus-within:ring-white/80' : 'focus-within:ring-primary',
                )}
              >
                <CMSLink
                  {...item.link}
                  label={undefined}
                  appearance="inline"
                  className="absolute inset-0 z-10 focus-visible:outline-none"
                >
                  <span className="sr-only">{item.link?.label ?? item.title}</span>
                </CMSLink>
                <div
                  className={cn(
                    'grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 py-5 transition-colors',
                    t === 'dark'
                      ? 'group-hover:bg-white/[0.03]'
                      : 'group-hover:bg-foreground/[0.025]',
                  )}
                >
                  <div className="space-y-1.5">
                    <h3 className="text-balance text-lg font-medium leading-snug transition-colors group-hover:text-primary md:text-xl">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className={cn('max-w-2xl text-sm leading-relaxed', themeMutedText[t])}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                      'h-5 w-5 self-center transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                      themeKickerText[t],
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </SectionShell>
  )
}

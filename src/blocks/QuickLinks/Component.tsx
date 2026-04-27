import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { QuickLinksBlock as QuickLinksBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import {
  Eyebrow,
  IndexNumber,
  SectionShell,
  themeKickerText,
  themeMutedText,
  themeRule,
  type BlockTheme,
} from '@/blocks/_shared'

export const QuickLinksBlock: React.FC<QuickLinksBlockProps> = ({
  description,
  eyebrow,
  links,
  style = 'cards',
  theme = 'default',
  title,
}) => {
  const t = (theme ?? 'default') as BlockTheme
  const total = links?.length ?? 0

  return (
    <SectionShell theme={t}>
      <header className="mb-10 grid gap-6 md:mb-14 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
          <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.5rem]">
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

      {links && links.length > 0 ? (
        style === 'cards' ? (
          <div className="grid gap-px bg-foreground/10 pt-px md:grid-cols-2 lg:grid-cols-3">
            {links.map((item, index) => (
              <article
                key={index}
                className={cn(
                  'group relative flex flex-col gap-6 p-7 transition-colors duration-300 md:p-8',
                  // Use theme bg as tile bg so the gap-px reads as hairlines
                  t === 'dark' && 'bg-[#03164f] hover:bg-[#04205f]',
                  t === 'accent' && 'bg-background hover:bg-primary/5',
                  t === 'muted' && 'bg-background hover:bg-foreground/[0.03]',
                  t === 'default' && 'bg-background hover:bg-foreground/[0.03]',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <IndexNumber value={index + 1} total={total} theme={t} />
                  <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                      'h-5 w-5 -translate-y-0 translate-x-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                      themeKickerText[t],
                    )}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-end gap-3">
                  <h3 className="text-balance text-xl font-medium leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className={cn('text-sm leading-relaxed', themeMutedText[t])}>
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <CMSLink
                  {...item.link}
                  label={undefined}
                  appearance="inline"
                  className="absolute inset-0 z-10"
                >
                  <span className="sr-only">{item.link?.label ?? item.title}</span>
                </CMSLink>
              </article>
            ))}
          </div>
        ) : (
          <ul
            role="list"
            className={cn('divide-y', t === 'dark' ? 'divide-white/10' : 'divide-foreground/10')}
          >
            {links.map((item, index) => (
              <li key={index} className="group relative">
                <CMSLink
                  {...item.link}
                  label={undefined}
                  appearance="inline"
                  className="absolute inset-0 z-10"
                >
                  <span className="sr-only">{item.link?.label ?? item.title}</span>
                </CMSLink>
                <div
                  className={cn(
                    'grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 gap-y-2 py-7 transition-all duration-300 group-hover:pl-3',
                    t === 'dark'
                      ? 'group-hover:bg-white/[0.03]'
                      : 'group-hover:bg-foreground/[0.025]',
                  )}
                >
                  <IndexNumber value={index + 1} total={total} theme={t} className="self-center" />
                  <div className="space-y-1.5">
                    <h3 className="text-balance text-xl font-medium leading-snug tracking-tight transition-colors group-hover:text-primary md:text-2xl">
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

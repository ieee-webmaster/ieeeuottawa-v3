import React from 'react'

import type { AccordionBlock as AccordionBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'

export const AccordionBlockComponent: React.FC<AccordionBlockProps> = ({
  description,
  eyebrow,
  items,
  theme = 'default',
  title,
}) => {
  const t = theme ?? 'default'

  return (
    <SectionShell theme={t}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <header className="lg:col-span-5">
          <div className="space-y-4 lg:sticky lg:top-24">
            {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
            <h2 className="section-title">{title}</h2>
            {description ? (
              <p className={cn('max-w-md text-base leading-relaxed', themeMutedText[t])}>
                {description}
              </p>
            ) : null}
          </div>
        </header>

        {items && items.length > 0 ? (
          <div className="lg:col-span-7">
            <div className={cn('h-px w-full', themeRule[t])} />
            <ul role="list">
              {items.map((item, index) => (
                <li key={item.id ?? index} className={cn('border-b', themeBorderClass(t))}>
                  <details className="group">
                    <summary
                      className={cn(
                        'grid cursor-pointer list-none grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-2 py-6 transition-colors [&::-webkit-details-marker]:hidden',
                        t === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-foreground/[0.02]',
                      )}
                    >
                      <span className="text-balance text-lg font-medium leading-snug tracking-tight md:text-xl">
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-1 inline-flex h-7 w-7 items-center justify-center text-base leading-none transition-transform duration-300 group-open:rotate-45',
                          t === 'dark' ? 'text-white/80' : 'text-foreground/70',
                        )}
                      >
                        +
                      </span>
                    </summary>
                    <div className="grid grid-cols-[1fr_auto] gap-x-5 pb-8">
                      <RichText
                        className={cn(
                          'mx-0 max-w-[58ch] [&_p]:text-[0.95rem] [&_p]:leading-relaxed',
                          t === 'dark' && '[&_p]:text-white/75 [&_li]:text-white/75',
                          t !== 'dark' &&
                            '[&_p]:text-muted-foreground [&_li]:text-muted-foreground',
                        )}
                        data={item.answer}
                        enableGutter={false}
                      />
                      <span aria-hidden="true" />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}

const themeBorderClass = (t: BlockTheme) =>
  t === 'dark' ? 'border-white/10' : 'border-foreground/10'

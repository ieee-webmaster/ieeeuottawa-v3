import React from 'react'

import type { AccordionBlock as AccordionBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import {
  Eyebrow,
  IndexNumber,
  SectionShell,
  themeMutedText,
  themeRule,
  type BlockTheme,
} from '@/blocks/_shared'

export const AccordionBlockComponent: React.FC<AccordionBlockProps> = ({
  description,
  eyebrow,
  items,
  theme = 'default',
  title,
}) => {
  const t = (theme ?? 'default') as BlockTheme
  const total = items?.length ?? 0

  return (
    <SectionShell theme={t}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <header className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            {eyebrow ? <Eyebrow theme={t}>{eyebrow}</Eyebrow> : null}
            <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
              {title}
            </h2>
            {description ? (
              <p className={cn('max-w-md text-base leading-relaxed', themeMutedText[t])}>
                {description}
              </p>
            ) : null}
            {total > 0 ? (
              <p className={cn('font-mono text-xs tracking-[0.18em]', themeMutedText[t])}>
                {String(total).padStart(2, '0')}{' '}
                <span className="opacity-60">{total === 1 ? 'question' : 'questions'}</span>
              </p>
            ) : null}
          </div>
        </header>

        {items && items.length > 0 ? (
          <div className="lg:col-span-7">
            <div className={cn('h-px w-full', themeRule[t])} />
            <ul role="list">
              {items.map((item, index) => (
                <li key={index} className={cn('border-b', themeBorderClass(t))}>
                  <details className="group">
                    <summary
                      className={cn(
                        'grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-baseline gap-x-5 gap-y-2 py-6 transition-colors',
                        t === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-foreground/[0.02]',
                      )}
                    >
                      <IndexNumber value={index + 1} total={total} theme={t} />
                      <span className="text-balance text-lg font-medium leading-snug tracking-tight md:text-xl">
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-base leading-none transition-transform duration-300 group-open:rotate-45',
                          t === 'dark'
                            ? 'border-white/20 text-white/80'
                            : 'border-foreground/15 text-foreground/70',
                        )}
                      >
                        +
                      </span>
                    </summary>
                    <div className="grid grid-cols-[auto_1fr_auto] gap-x-5 pb-8">
                      <span aria-hidden="true" className="font-mono text-[0.7rem] opacity-0">
                        00
                      </span>
                      <RichText
                        className={cn(
                          'max-w-[58ch] [&_p]:text-[0.95rem] [&_p]:leading-relaxed',
                          t === 'dark' && '[&_p]:text-white/75 [&_li]:text-white/75',
                          t !== 'dark' && '[&_p]:text-muted-foreground [&_li]:text-muted-foreground',
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

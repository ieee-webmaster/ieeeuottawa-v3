import React from 'react'

import type { AccordionBlock as AccordionBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

const sectionThemeClasses: Record<NonNullable<AccordionBlockProps['theme']>, string> = {
  default: 'border-transparent bg-transparent text-foreground',
  muted: 'border-border bg-card text-card-foreground',
  accent: 'border-primary/15 bg-primary/5 text-foreground',
  dark: 'border-slate-800 bg-slate-950 text-white',
}

const itemThemeClasses: Record<NonNullable<AccordionBlockProps['theme']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  muted: 'border-border bg-background text-foreground',
  accent: 'border-primary/15 bg-background text-foreground',
  dark: 'border-slate-800 bg-slate-900 text-white',
}

export const AccordionBlockComponent: React.FC<AccordionBlockProps> = ({
  description,
  eyebrow,
  items,
  theme = 'default',
  title,
}) => {
  return (
    <div className="container">
      <section
        className={cn('space-y-8 rounded-[1.5rem] border p-6 md:p-8', sectionThemeClasses[theme])}
      >
        <div className="max-w-3xl space-y-4">
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

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            {description ? (
              <p
                className={cn(
                  'text-base leading-relaxed',
                  theme !== 'dark' && 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {items && items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <details
                key={index}
                className={cn(
                  'group rounded-[1.25rem] border px-5 py-4 open:pb-5',
                  itemThemeClasses[theme],
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="text-lg font-semibold tracking-tight">{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'text-2xl leading-none transition-transform duration-200 group-open:rotate-45',
                      theme !== 'dark' && 'text-muted-foreground',
                      theme === 'dark' && 'text-white/70',
                    )}
                  >
                    +
                  </span>
                </summary>

                <div className="pt-4">
                  <RichText
                    className={cn(theme === 'dark' && '[&_p]:text-white/80 [&_li]:text-white/80')}
                    data={item.answer}
                    enableGutter={false}
                  />
                </div>
              </details>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

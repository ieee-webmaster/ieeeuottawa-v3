import React from 'react'
import { ArrowUpRight } from 'lucide-react'

import type { LogoGridBlock as LogoGridBlockProps } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { Eyebrow, SectionShell, themeMutedText } from '@/blocks/_shared'

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  description,
  eyebrow,
  items,
  style = 'grid',
  theme = 'default',
  title,
}) => {
  const t = theme ?? 'default'
  const featured = style === 'featured'

  return (
    <SectionShell
      theme={t}
      padding={featured ? 'py-5 md:py-6' : undefined}
      className="border-y border-border"
    >
      <div className={cn(featured && 'flex flex-col gap-6 md:flex-row md:items-center md:gap-12')}>
        <header className={cn('space-y-3', featured ? 'shrink-0 md:max-w-xs' : 'mb-10')}>
          {eyebrow && <Eyebrow theme={t}>{eyebrow}</Eyebrow>}
          <h2
            className={
              featured ? 'font-mono text-xs font-medium uppercase tracking-wider' : 'section-title'
            }
          >
            {title}
          </h2>
          {description && (
            <p className={cn('mt-3 max-w-xl text-sm leading-relaxed', themeMutedText[t])}>
              {description}
            </p>
          )}
        </header>
        <ul
          className={cn(
            featured
              ? 'flex min-w-0 flex-1 flex-wrap items-center gap-8'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {items?.map((item, index) => {
            const hasLogo = item.logo && typeof item.logo === 'object'
            const linkLabel = item.link?.label?.trim()
            const distinctLinkLabel =
              linkLabel && linkLabel.toLocaleLowerCase() !== item.name.trim().toLocaleLowerCase()
            const content = (
              <>
                {hasLogo ? (
                  <Media
                    resource={item.logo}
                    alt={item.name}
                    sizesPreset="quarter"
                    className="w-full bg-white px-4 py-3"
                    pictureClassName="block"
                    imgClassName="h-12 w-full object-contain"
                  />
                ) : (
                  <span className="font-display text-xl">{item.name}</span>
                )}
                {hasLogo && (!featured || item.description || distinctLinkLabel) && (
                  <span className="mt-3 block font-display text-xl">{item.name}</span>
                )}
                {item.description && (
                  <p className={cn('mt-3 text-sm leading-relaxed', themeMutedText[t])}>
                    {item.description}
                  </p>
                )}
                {item.enableLink && distinctLinkLabel && (
                  <span className="mt-3 inline-flex min-h-11 items-center gap-2 font-mono text-sm text-primary">
                    {linkLabel}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                )}
              </>
            )
            return (
              <li key={item.id ?? index} className={cn(featured && 'w-64 max-w-full')}>
                {item.enableLink ? (
                  <CMSLink
                    {...item.link}
                    label={undefined}
                    appearance="inline"
                    className="block transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {content}
                  </CMSLink>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </SectionShell>
  )
}

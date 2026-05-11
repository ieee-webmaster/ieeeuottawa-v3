import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { SectionShell } from '@/blocks/_shared'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      links?: never
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, links, richText }) => {
  return (
    <SectionShell theme="default" padding="pt-24 pb-12 md:pt-36 md:pb-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div
          className={[
            'space-y-6 lg:col-span-9',
            '[&_h1]:text-balance [&_h1]:text-5xl [&_h1]:font-medium [&_h1]:leading-[1] [&_h1]:tracking-tight',
            'sm:[&_h1]:text-6xl md:[&_h1]:text-7xl',
            '[&_p]:max-w-2xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground md:[&_p]:text-lg',
          ].join(' ')}
        >
          {children || (richText && <RichText data={richText} enableGutter={false} />)}
        </div>

        {Array.isArray(links) && links.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 lg:col-span-3 lg:justify-end">
            {links.map(({ link }, i) => (
              <CMSLink key={i} {...link} size="lg" />
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  )
}

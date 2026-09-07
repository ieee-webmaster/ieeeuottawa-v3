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
    <SectionShell theme="default">
      <div className="page-copy space-y-4 [&_h1]:mb-4">
        {children ||
          (richText && <RichText className="mx-0" data={richText} enableGutter={false} />)}
      </div>
      {Array.isArray(links) && links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map(({ id, link }, i) => (
            <CMSLink key={id ?? i} {...link} />
          ))}
        </div>
      )}
    </SectionShell>
  )
}

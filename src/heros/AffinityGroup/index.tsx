import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SectionShell } from '@/blocks/_shared'

export const AffinityGroupHero: React.FC<Page['hero']> = ({ links, media, richText, logo }) => {
  return (
    <SectionShell theme="muted">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-start gap-4 md:gap-6">
          {logo && typeof logo === 'object' && (
            <div className="mb-2">
              <Media
                resource={logo}
                imgClassName="w-16 h-16 md:w-20 md:h-20 object-contain"
                sizesPreset="icon"
              />
            </div>
          )}

          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className="page-copy mx-0 space-y-4 [&_h1]:mb-4"
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {media && typeof media === 'object' && (
          <div className="relative flex justify-center md:justify-end">
            <Media
              priority
              resource={media}
              className="w-full max-w-2xl"
              imgClassName="block h-auto w-full max-h-[28rem] object-contain"
              sizesPreset="affinity"
            />
          </div>
        )}
      </div>
    </SectionShell>
  )
}

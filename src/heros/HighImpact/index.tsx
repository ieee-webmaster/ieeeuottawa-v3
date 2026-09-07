import React from 'react'

import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SectionShell } from '@/blocks/_shared'
import { cn } from '@/utilities/ui'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => (
  <SectionShell theme="dark" padding="py-10 md:py-14 lg:py-16" className="overflow-hidden">
    <div
      className={cn(
        'grid items-center gap-10 lg:gap-12',
        media && typeof media === 'object' && 'lg:grid-cols-[1.25fr_1fr]',
      )}
    >
      <div>
        {richText && <RichText className="hero-copy mx-0" data={richText} enableGutter={false} />}
        {links && links.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            {links.map(({ id, link }, index) => (
              <li key={id ?? index}>
                <CMSLink {...link} size="lg" className="w-full sm:w-auto" />
              </li>
            ))}
          </ul>
        )}
      </div>
      {media && typeof media === 'object' && (
        <div className="min-w-0">
          <Media
            className="relative"
            imgClassName="block h-auto w-full"
            pictureClassName="block"
            priority
            resource={media}
            sizesPreset="half"
          />
        </div>
      )}
    </div>
  </SectionShell>
)

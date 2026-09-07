import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SectionShell } from '@/blocks/_shared'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <SectionShell theme="default">
      {richText && (
        <RichText
          className="page-copy mx-0 space-y-4 [&_h1]:mb-4"
          data={richText}
          enableGutter={false}
        />
      )}
      {Array.isArray(links) && links.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-3">
          {links.map(({ id, link }, i) => (
            <li key={id ?? i}>
              <CMSLink {...link} />
            </li>
          ))}
        </ul>
      )}
      {media && typeof media === 'object' && (
        <figure className="mt-8">
          <Media
            resource={media}
            priority
            imgClassName="block h-auto w-full"
            pictureClassName="block"
          />
          {media.caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">
              <RichText data={media.caption} enableGutter={false} />
            </figcaption>
          )}
        </figure>
      )}
    </SectionShell>
  )
}

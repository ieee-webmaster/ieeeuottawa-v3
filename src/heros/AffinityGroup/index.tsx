'use client'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const AffinityGroupHero: React.FC<Page['hero']> = ({ links, media, richText, logo }) => {
  return (
    <section className="relative -mt-16 bg-slate-50 py-8 text-foreground dark:bg-slate-950 md:py-10">
      <div className="container relative z-10 grid items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col items-start gap-4 md:gap-6">
          {logo && typeof logo === 'object' && (
            <div className="mb-2">
              <Media resource={logo} imgClassName="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
          )}

          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className="text-slate-900 dark:text-white"
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
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background"
              imgClassName="w-full max-h-[28rem] object-contain"
            />
          </div>
        )}
      </div>
    </section>
  )
}

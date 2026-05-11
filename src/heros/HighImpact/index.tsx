'use client'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <section
      className="relative isolate flex min-h-[78vh] items-end overflow-hidden text-white"
      data-theme="dark"
    >
      {media && typeof media === 'object' && (
        <Media
          fill
          imgClassName="-z-20 object-cover"
          pictureClassName="absolute inset-0"
          priority
          resource={media}
        />
      )}

      {/* Layered scrim — keeps the photo legible without flattening it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-transparent to-transparent"
      />

      <div className="container relative z-10 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="space-y-7 lg:col-span-8">
            <div
              className={[
                'text-balance font-medium leading-[0.98] tracking-tight text-white',
                '[&_h1]:text-5xl [&_h1]:font-medium [&_h1]:leading-[0.98] [&_h1]:tracking-tight',
                'sm:[&_h1]:text-6xl md:[&_h1]:text-7xl lg:[&_h1]:text-[5.25rem]',
                '[&_p]:mt-6 [&_p]:max-w-xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-white/80 md:[&_p]:text-lg',
              ].join(' ')}
            >
              {richText && <RichText data={richText} enableGutter={false} />}
            </div>

            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap items-center gap-3 pt-2">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink {...link} size="lg" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

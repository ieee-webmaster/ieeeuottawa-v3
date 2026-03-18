'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const AffinityGroupHero: React.FC<Page['hero']> = ({ links, media, richText, logo }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  return (
    <section className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-foreground font-sans flex items-center">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-start gap-6">
          {logo && typeof logo === 'object' && (
            <Media resource={logo} imgClassName="w-20 h-20 object-contain" />
          )}

          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className="
                text-slate-900 dark:text-white
                [&_h1]:text-5xl md:[&_h1]:text-6xl lg:[&_h1]:text-7xl
                [&_h1]:font-heading [&_h1]:font-bold [&_h1]:leading-[1.05]
                [&_h2]:text-3xl [&_h2]:font-semibold
                [&_h3]:text-xl
                [&_p]:text-lg [&_p]:mt-4
                [&_p]:text-slate-600 dark:[&_p]:text-slate-400
              "
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {links.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  className="
                    px-8 py-4 rounded-full
                    bg-slate-900 text-white
                    dark:bg-white dark:text-slate-900
                    font-medium
                    hover:bg-slate-800
                    dark:hover:bg-slate-200
                    transition-all hover:shadow-xl
                  "
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE IMAGE */}
        {media && typeof media === 'object' && (
          <div className="relative flex justify-center">
            <Media resource={media} imgClassName="w-full max-w-3xl object-contain" />
          </div>
        )}
      </div>
    </section>
  )
}

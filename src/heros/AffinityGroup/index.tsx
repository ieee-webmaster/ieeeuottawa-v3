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
    <section className="relative min-h-[80vh] md:min-h-[70vh] w-full bg-slate-50 dark:bg-slate-950 text-foreground font-sans flex items-center py-12 md:py-16">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
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
            <div className="flex flex-wrap gap-4 mt-2">
              {links.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  className={`
                    px-6 py-3 md:px-8 md:py-4 rounded-full font-medium
                    transition-all hover:shadow-lg hover:scale-105
                    ${
                      i === 0
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        : 'bg-transparent border-2 border-slate-900 text-slate-900 dark:border-white dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                />
              ))}
            </div>
          )}
        </div>

        {media && typeof media === 'object' && (
          <div className="relative flex justify-center">
            <Media resource={media} imgClassName="w-full max-w-3xl object-contain" />
          </div>
        )}
      </div>
    </section>
  )
}

'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const AffinityGroupHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  })

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {media && typeof media === 'object' && (
        <Media fill imgClassName="object-cover opacity-60" priority resource={media} />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/60"></div>
      <div className="relative z-10 container mx-auto px-6 md:px-12 pt-32 md:pt-48 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="glass rounded-3xl p-10 md:p-16 max-w-4xl text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm text-primary font-semibold text-sm mb-6 shadow-sm">
            Empowering Future Leaders
          </span>
          {richText && (
            <RichText
              className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.1] tracking-tight mb-6 text-slate-900"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {links.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  className="px-8 py-4 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all hover:shadow-xl"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all hover:shadow-xl">
                Our Mission
              </button>
              <button className="px-8 py-4 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-slate-800 font-medium hover:bg-white transition-all hover:shadow-lg">
                Learn More
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

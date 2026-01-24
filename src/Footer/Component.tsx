import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-primary bg-primary text-primary-foreground">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}

            <a href= "https://www.instagram.com/ieeeuottawa/" className = "text-white">Instagram</a>
            <a href= "https://www.linkedin.com/company/ieeeuottawa/posts/?feedView=all" className = "text-white">LinkedIn</a>
            <a href="https://www.youtube.com/channel/UCSv1Vna97rKa8w2ktRG8wRw/videos" className = "text-white">YouTube</a>
            <a href="https://discord.gg/kyTRZ6Ke6J" className = "text-white">Discord</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

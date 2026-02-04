import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
const currentYear = new Date().getFullYear()

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  

  return (
    <footer className="mt-auto border-t border-primary bg-primary text-primary-foreground">
  <div className="container py-8 flex flex-col gap-6">
    

    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <Link className="flex items-center" href="/">
        <Logo />
      </Link>

      <div className="flex flex-col-reverse md:flex-row gap-4 md:items-center">
        <ThemeSelector />
        <nav className="flex gap-4">
          {navItems.map(({ link }, i) => (
            <CMSLink className="text-white" key={i} {...link} />
          ))}
        </nav>
      </div>
    </div>


    <p className="text-xs text-white/70 text-center md:text-left">
      &copy; {currentYear} IEEE UOttawa. All rights reserved.
    </p>

    </div>
  </footer>
  )
}

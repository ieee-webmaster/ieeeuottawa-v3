'use client'

import React, { useEffect, useState } from 'react'
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { Header } from '@/payload-types'
import type { ResolvedNavItem } from '@/plugins/payload-navigation'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/utilities/ui'
import { Logo } from '@/components/Logo/Logo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { SocialIcons } from '@/components/SocialIcons'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  navItems: ResolvedNavItem[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, navItems }) => {
  const t = useTranslations('nav')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const socialLinks = data?.socialLinks ?? []
  const showSocialLabels = data?.showSocialLinkLabels === true

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors duration-200',
        scrolled
          ? 'border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60'
          : 'border-transparent bg-background',
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md px-1 py-3 lg:justify-self-start"
          aria-label={t('home')}
          onClick={() => setMenuOpen(false)}
        >
          <Logo loading="eager" priority className="w-[7.5rem] sm:w-[8rem] md:w-[9.375rem]" />
        </Link>

        <div className="hidden items-center gap-2 lg:flex lg:justify-self-center">
          <HeaderNav items={navItems} />
        </div>

        <div className="hidden items-center gap-2 lg:flex lg:justify-self-end">
          {socialLinks.length > 0 && (
            <>
              <SocialIcons links={socialLinks} showLabels={showSocialLabels} className="gap-1" />
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
            </>
          )}
          <LocaleSwitcher />
          <Link
            href="/search"
            aria-label={t('search')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LocaleSwitcher className="inline-flex h-10 items-center justify-center rounded-md px-2.5 text-sm font-medium text-primary transition-colors hover:bg-card hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0" />
          <Link
            href="/search"
            aria-label={t('search')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
          >
            <SearchIcon className="h-[1.125rem] w-[1.125rem]" />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 top-20 z-30 lg:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <div
          id="mobile-nav"
          className={cn(
            'absolute inset-0 h-[calc(100vh-5rem)] overflow-y-auto bg-background transition-opacity duration-200',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="container flex h-full flex-col gap-8 py-6">
            <HeaderNav
              items={navItems}
              orientation="vertical"
              onNavigate={() => setMenuOpen(false)}
            />

            <div className="mt-auto flex flex-col gap-5 border-t border-border pt-5">
              {socialLinks.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('followUs')}
                  </span>
                  <SocialIcons links={socialLinks} className="gap-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

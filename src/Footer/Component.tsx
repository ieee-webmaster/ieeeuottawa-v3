import { getCachedGlobal } from '@/utilities/getGlobals'
import { resolveLocale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import type { Footer } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
const currentYear = new Date().getFullYear()

export async function Footer() {
  const locale = resolveLocale(await getLocale())
  const footerData: Footer = await getCachedGlobal('footer', 1, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer
      className="mt-auto w-full"
      style={{ fontFamily: "'Tahoma','MS Sans Serif','Arial',sans-serif", fontSize: '11px' }}
    >
      {/* Win2k panel footer body */}
      <div
        className="px-4 py-4"
        style={{
          backgroundColor: 'var(--win-silver)',
          borderTop: '2px solid var(--win-dark)',
        }}
      >
        <div className="container flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          {/* Logo block with sunken panel */}
          <div
            className="win-sunken p-2 inline-block"
            style={{ backgroundColor: '#fff' }}
          >
            <Link href="/">
              <Logo className="invert-0 dark:invert" />
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                className="text-xs underline text-foreground hover:text-primary"
              />
            ))}
          </nav>

          <ThemeSelector />
        </div>
      </div>

      {/* Win2k status bar */}
      <div
        className="flex items-center justify-between px-4 py-0.5 gap-4"
        style={{
          backgroundColor: 'var(--win-silver)',
          borderTop: '1px solid var(--win-shadow)',
        }}
      >
        {/* Left status segment */}
        <div
          className="flex items-center gap-1 px-2"
          style={{
            borderTop: '1px solid var(--win-dark)',
            borderLeft: '1px solid var(--win-dark)',
            borderRight: '1px solid var(--win-highlight)',
            borderBottom: '1px solid var(--win-highlight)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="#1a5296" strokeWidth="1.5" fill="#d0e8f8" />
            <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="#1a5296" strokeWidth="1" />
            <line x1="2" y1="8" x2="14" y2="8" stroke="#1a5296" strokeWidth="1" />
          </svg>
          <span className="text-xs" style={{ fontSize: '10px' }}>Done</span>
        </div>

        <p className="text-center flex-1" style={{ fontSize: '10px' }}>
          &copy; {currentYear} IEEE UOttawa. All rights reserved.
        </p>

        {/* Internet zone indicator */}
        <div
          className="flex items-center gap-1 px-2"
          style={{
            borderTop: '1px solid var(--win-dark)',
            borderLeft: '1px solid var(--win-dark)',
            borderRight: '1px solid var(--win-highlight)',
            borderBottom: '1px solid var(--win-highlight)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5" stroke="#5588cc" strokeWidth="1.5" fill="none" />
            <path d="M8 3 L9 7 L13 7 L10 10 L11 14 L8 11 L5 14 L6 10 L3 7 L7 7 Z" fill="#5588cc" />
          </svg>
          <span style={{ fontSize: '10px' }}>Internet</span>
        </div>
      </div>
    </footer>
  )
}

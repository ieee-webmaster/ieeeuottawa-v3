'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { Link, usePathname } from '@/i18n/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="relative z-20 w-full"
      style={{ fontFamily: "'Tahoma','MS Sans Serif','Arial',sans-serif" }}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      {/* Windows 2000 title bar */}
      <div
        className="win-titlebar flex items-center justify-between px-2 py-1 select-none"
        style={{
          background: 'linear-gradient(to right, #0a246a 0%, #a6caf0 100%)',
          minHeight: '22px',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Globe icon like IE */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="#7ab8e8" strokeWidth="1.5" fill="#1a5296" />
            <ellipse cx="8" cy="8" rx="3" ry="7" stroke="#7ab8e8" strokeWidth="1" />
            <line x1="1" y1="8" x2="15" y2="8" stroke="#7ab8e8" strokeWidth="1" />
            <line x1="8" y1="1" x2="8" y2="15" stroke="#7ab8e8" strokeWidth="1" />
          </svg>
          <span className="text-white font-bold text-xs">IEEE UOttawa — Microsoft Internet Explorer</span>
        </div>
        {/* Win chrome buttons */}
        <div className="flex items-center gap-1" aria-hidden="true">
          {['_', '□', '✕'].map((ch) => (
            <span
              key={ch}
              className="win-btn inline-flex items-center justify-center text-black font-bold"
              style={{ width: '16px', height: '14px', fontSize: '9px', lineHeight: 1, padding: 0 }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Menu bar */}
      <div
        className="win-menubar flex items-center gap-0 px-1"
        style={{ backgroundColor: 'var(--win-silver)', borderBottom: '1px solid var(--win-shadow)' }}
      >
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((item) => (
          <button
            key={item}
            className="px-2 py-0.5 text-xs hover:bg-primary hover:text-white focus:outline-none"
            style={{ fontFamily: "'Tahoma',sans-serif", fontSize: '11px', background: 'transparent' }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Address / nav toolbar */}
      <div
        className="flex items-center gap-2 px-2 py-1"
        style={{
          backgroundColor: 'var(--win-silver)',
          borderBottom: '1px solid var(--win-shadow)',
        }}
      >
        {/* Back / Forward / Refresh / Home */}
        <div className="flex items-center gap-1">
          {['◄', '►', '↺', '⌂'].map((icon) => (
            <button key={icon} className="win-btn text-xs px-2 py-0.5" aria-label={icon}>
              {icon}
            </button>
          ))}
        </div>

        {/* Address bar */}
        <div className="flex items-center gap-1 flex-1">
          <span className="text-xs font-bold" style={{ fontFamily: "'Tahoma',sans-serif" }}>Address</span>
          <div
            className="flex-1 flex items-center gap-1 px-1"
            style={{
              background: '#fff',
              border: '2px solid',
              borderColor: 'var(--win-dark) var(--win-highlight) var(--win-highlight) var(--win-dark)',
              height: '22px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="#1a5296" strokeWidth="1.5" fill="#d0e8f8" />
              <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="#1a5296" strokeWidth="1" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="#1a5296" strokeWidth="1" />
            </svg>
            <span className="text-xs" style={{ fontFamily: "'Tahoma',sans-serif", color: '#000' }}>
              http://www.ieee.uottawa.ca/en
            </span>
          </div>
          <button className="win-btn text-xs px-3 py-0.5">Go</button>
        </div>

        {/* Logo */}
        <Link href="/">
          <Logo loading="eager" priority={true} className="invert dark:invert-0" />
        </Link>
      </div>

      {/* Links toolbar (main nav) */}
      <div
        className="flex items-center gap-0 px-2 py-0.5"
        style={{
          backgroundColor: 'var(--win-silver)',
          borderBottom: '2px solid var(--win-shadow)',
        }}
      >
        <span className="text-xs font-bold mr-2" style={{ fontFamily: "'Tahoma',sans-serif" }}>Links</span>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--win-shadow)' }} aria-hidden="true" />
        <HeaderNav data={data} />
      </div>
    </header>
  )
}

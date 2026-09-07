import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import React from 'react'
import { headers } from 'next/headers'

import { InitTheme } from '@/providers/Theme/InitTheme'
import { resolveLocale } from '@/i18n/routing'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import './[locale]/globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getDefaultOpenGraphImage, SITE_DESCRIPTION, SITE_NAME } from '@/utilities/siteMetadata'

type Props = {
  children: React.ReactNode
}

const displayFont = localFont({
  src: '../../fonts/SpaceGrotesk.ttf',
  weight: '300 700',
  variable: '--font-display',
  display: 'swap',
})

export default async function FrontendRootLayout({ children }: Props) {
  // Avoid initializing next-intl before [locale] establishes its static rendering context.
  const locale = resolveLocale((await headers()).get('x-next-intl-locale'))

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, displayFont.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  title: SITE_NAME,
  twitter: {
    card: 'summary_large_image',
    description: SITE_DESCRIPTION,
    images: [
      {
        alt: getDefaultOpenGraphImage().alt,
        url: getDefaultOpenGraphImage().url,
      },
    ],
    title: SITE_NAME,
  },
}

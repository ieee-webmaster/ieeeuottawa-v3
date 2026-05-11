import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { getLocale } from 'next-intl/server'

import { InitTheme } from '@/providers/Theme/InitTheme'
import { resolveLocale } from '@/i18n/routing'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './[locale]/globals.css'
import { getServerSideURL } from '@/utilities/getURL'

type Props = {
  children: React.ReactNode
}

export default async function FrontendRootLayout({ children }: Props) {
  const locale = resolveLocale(await getLocale())

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
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
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}

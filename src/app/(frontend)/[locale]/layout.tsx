import type { Metadata } from 'next'

import React from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import localFont from 'next/font/local'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getDefaultOpenGraphImage, SITE_DESCRIPTION, SITE_NAME } from '@/utilities/siteMetadata'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

// Generate one static path per supported locale so Next.js pre-renders
// /en/... and /fr/... (and any future locale) at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const dynamicParams = false

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const displayFont = localFont({
  src: '../../../fonts/SpaceGrotesk.ttf',
  weight: '300 700',
  variable: '--font-display',
  display: 'swap',
})

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages({ locale })

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
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            {children}
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
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

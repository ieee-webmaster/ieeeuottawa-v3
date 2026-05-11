import React from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { HtmlLang } from '@/components/HtmlLang'
import { Providers } from '@/providers'
import { draftMode } from 'next/headers'
import { routing } from '@/i18n/routing'

// Generate one static path per supported locale so Next.js pre-renders
// /en/... and /fr/... (and any future locale) at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  const { isEnabled } = await draftMode()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang />
      <Providers>
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />

        <Header />
        {children}
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  )
}

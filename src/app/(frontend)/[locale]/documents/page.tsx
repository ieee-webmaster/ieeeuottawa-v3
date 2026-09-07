import type { Metadata } from 'next'

import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { SectionShell } from '@/blocks/_shared'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Link } from '@/i18n/navigation'
import { getCachedDocsList } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 86400

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function DocumentsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  setRequestLocale(locale)

  const docs = await getCachedDocsList(locale)

  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'docs',
  })

  return (
    <SectionShell theme="default">
      <header className="mb-10 space-y-4">
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-intro">{t('landingDescription')}</p>
      </header>
      {docs.length === 0 ? (
        <p className="py-8 text-base text-muted-foreground">{t('noYears')}</p>
      ) : (
        <ul role="list" className="grid gap-x-10 sm:grid-cols-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="border-b border-border first:border-t sm:[&:nth-child(2)]:border-t"
            >
              <Link
                href={`/documents/${encodeURIComponent(doc.year)}`}
                className="group flex items-center justify-between gap-4 py-6 transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <span className="font-display text-2xl font-medium sm:text-3xl">{doc.year}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'docs',
  })

  return generateStaticMeta({
    description: t('description'),
    locale,
    path: '/documents',
    title: t('title'),
  })
}

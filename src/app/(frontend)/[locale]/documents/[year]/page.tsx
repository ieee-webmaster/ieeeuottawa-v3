import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { YearlyDocument } from '../_components/YearlyDocument'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { getCachedDocByYear, getDocYears } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 86400

export async function generateStaticParams() {
  return getDocYears()
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    year?: string
  }>
}

export default async function DocsPage({ params: paramsPromise }: Args) {
  const { locale, year = '' } = await paramsPromise

  const doc = await getCachedDocByYear(year, locale)

  if (!doc) {
    return notFound()
  }

  return await YearlyDocument(doc, locale)
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, year = '' } = await paramsPromise
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'docs',
  })

  return generateStaticMeta({
    description: t('description'),
    locale,
    path: `/documents/${year}`,
    title: `${year} ${t('title')}`,
  })
}

import type { Metadata } from 'next'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { YearlyDocument } from '../_components/YearlyDocument'
import { generateStaticMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection: 'docs',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      year: true,
    },
  })

  const params = docs.docs.map(({ year }) => {
    return { year }
  })

  return params
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    year?: string
  }>
}

export default async function DocsPage({ params: paramsPromise }: Args) {
  const { locale, year = '' } = await paramsPromise

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'docs',
    locale,
    overrideAccess: false,
    where: {
      year: {
        equals: year,
      },
    },
    limit: 1,
  })

  const doc = result.docs[0]

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

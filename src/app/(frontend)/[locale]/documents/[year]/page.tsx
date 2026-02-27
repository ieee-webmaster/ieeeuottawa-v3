import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Doc, Config } from '@/payload-types'
import { YearlyDocument } from '../_components/YearlyDocument'

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
    where: {
      year: {
        equals: year,
      },
    },
    limit: 1,
  })

  const docs = result.docs[0] as Doc

  if (!docs) {
    return notFound()
  }

  return YearlyDocument(docs)
}

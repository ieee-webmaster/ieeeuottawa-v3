import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Doc } from '@/payload-types'
import { YearlyDocument } from '../_components/YearlyDocument'

export default async function DocsPage({ params }: { params: { year: string } }) {
  const year = (await params).year

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'docs',
    where: { year: { equals: year } },
    depth: 1,
    limit: 1,
  })

  const docs = result.docs[0] as Doc

  if (!docs) {
    return notFound()
  }

  return YearlyDocument(docs)
}

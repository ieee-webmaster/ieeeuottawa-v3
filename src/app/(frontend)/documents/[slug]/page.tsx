import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Doc } from '@/payload-types'

type DocItem = {
  name: string
  description?: string
  fileUrl: string
}

type DocsType = {
  year: string
  generalDocuments?: DocItem[]
  meetingMinutes?: (DocItem & { meetingDate?: string })[]
  otherDocuments?: DocItem[]
}

export default async function DocsPage({ params }: { params: { slug: string } }) {
  const year = params.slug

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'docs',
    where: { year: { equals: year } },
    depth: 1,
    limit: 1,
  })

  const docs = result.docs[0] as DocsType

  if (!docs) {
    return notFound()
  }

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">{docs.year} Documents</h1>
    </main>
  )
}

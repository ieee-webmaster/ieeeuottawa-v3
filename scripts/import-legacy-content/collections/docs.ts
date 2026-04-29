import fs from 'node:fs/promises'
import path from 'node:path'

import { type Payload } from 'payload'

import { IMPORT_CONTEXT } from '../helpers'

type DocData = {
  description?: string
  descriptionFr?: string
  meetingDate?: string
  name: string
  nameFr?: string
  url: string
}
type DocsData = {
  generalDocuments: DocData[]
  years: Array<{
    meetingMinutes: DocData[]
    otherDocuments: DocData[]
    year: string
  }>
}

export async function importDocs(payload: Payload, dataDir: string) {
  const docs = JSON.parse(await fs.readFile(path.join(dataDir, 'docs.json'), 'utf8')) as DocsData

  for (const yearDocs of docs.years) {
    const existing = (
      await payload.find({
        collection: 'docs',
        limit: 1,
        pagination: false,
        where: { year: { equals: yearDocs.year } },
      })
    ).docs[0]

    const englishData = {
      generalDocuments: docs.generalDocuments.map((doc, index) => mapDoc(doc, `general-${index}`)),
      meetingMinutes: yearDocs.meetingMinutes.map((doc, index) => mapDoc(doc, `meeting-${index}`)),
      otherDocuments: yearDocs.otherDocuments.map((doc, index) => mapDoc(doc, `other-${index}`)),
      year: yearDocs.year,
    }
    const doc = existing
      ? await payload.update({
          collection: 'docs',
          context: IMPORT_CONTEXT,
          data: englishData,
          id: existing.id,
          locale: 'en',
        })
      : await payload.create({
          collection: 'docs',
          context: IMPORT_CONTEXT,
          data: englishData,
          locale: 'en',
        })

    await payload.update({
      collection: 'docs',
      context: IMPORT_CONTEXT,
      data: {
        generalDocuments: docs.generalDocuments.map((entry, index) =>
          mapDoc(entry, `general-${index}`, 'fr'),
        ),
        meetingMinutes: yearDocs.meetingMinutes.map((entry, index) =>
          mapDoc(entry, `meeting-${index}`, 'fr'),
        ),
        otherDocuments: yearDocs.otherDocuments.map((entry, index) =>
          mapDoc(entry, `other-${index}`, 'fr'),
        ),
      },
      id: doc.id,
      locale: 'fr',
    })
  }
}

function mapDoc(doc: DocData, id: string, locale: 'en' | 'fr' = 'en') {
  return {
    description: locale === 'fr' ? doc.descriptionFr || doc.description : doc.description,
    googleDocsUrl: doc.url,
    id,
    meetingDate: doc.meetingDate,
    name: locale === 'fr' ? doc.nameFr || doc.name : doc.name,
  }
}

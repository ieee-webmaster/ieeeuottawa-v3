import fs from 'node:fs/promises'
import path from 'node:path'

import { type Payload } from 'payload'

import { createImportContext } from '../helpers'
import { docsSchema, type DocData, type DocsData } from '../schemas'

export async function loadDocs(dataDir: string) {
  return docsSchema.parse(JSON.parse(await fs.readFile(path.join(dataDir, 'docs.json'), 'utf8')))
}

export async function importDocs(payload: Payload, docs: DocsData) {
  console.log(`docs: importing ${docs.years.length} years`)

  for (const yearDocs of docs.years) {
    try {
      const existing = (
        await payload.find({
          collection: 'docs',
          limit: 1,
          pagination: false,
          where: { year: { equals: yearDocs.year } },
        })
      ).docs[0]

      const englishData = {
        generalDocuments: docs.generalDocuments.map((doc, index) =>
          mapDoc(doc, existing?.generalDocuments?.[index]?.id),
        ),
        meetingMinutes: yearDocs.meetingMinutes.map((doc, index) =>
          mapDoc(doc, existing?.meetingMinutes?.[index]?.id),
        ),
        otherDocuments: yearDocs.otherDocuments.map((doc, index) =>
          mapDoc(doc, existing?.otherDocuments?.[index]?.id),
        ),
        year: yearDocs.year,
      }
      const doc = existing
        ? await payload.update({
            collection: 'docs',
            context: createImportContext(),
            data: englishData,
            id: existing.id,
            locale: 'en',
          })
        : await payload.create({
            collection: 'docs',
            context: createImportContext(),
            data: englishData,
            locale: 'en',
          })

      await payload.update({
        collection: 'docs',
        context: createImportContext(),
        data: {
          generalDocuments: docs.generalDocuments.map((entry, index) =>
            mapDoc(entry, doc.generalDocuments?.[index]?.id, 'fr'),
          ),
          meetingMinutes: yearDocs.meetingMinutes.map((entry, index) =>
            mapDoc(entry, doc.meetingMinutes?.[index]?.id, 'fr'),
          ),
          otherDocuments: yearDocs.otherDocuments.map((entry, index) =>
            mapDoc(entry, doc.otherDocuments?.[index]?.id, 'fr'),
          ),
        },
        id: doc.id,
        locale: 'fr',
      })

      console.log(`docs: ${existing ? 'updated' : 'created'} ${yearDocs.year}`)
    } catch (error) {
      throw new Error(`docs: failed to import ${yearDocs.year}`, { cause: error })
    }
  }
}

function mapDoc(doc: DocData, id?: string | null, locale: 'en' | 'fr' = 'en') {
  return {
    description: locale === 'fr' ? doc.descriptionFr || doc.description : doc.description,
    googleDocsUrl: doc.url,
    id,
    meetingDate: doc.meetingDate,
    name: locale === 'fr' ? doc.nameFr || doc.name : doc.name,
  }
}

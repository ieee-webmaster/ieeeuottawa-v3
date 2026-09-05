// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BasePayload, type PaginatedDocs } from 'payload'
import type { Doc } from '@/payload-types'
import { importDocs } from '../../scripts/import-legacy-content/collections/docs'
import type { DocsData } from '../../scripts/import-legacy-content/schemas'

const entry = { name: 'Minutes', nameFr: 'Procès-verbal', url: 'https://example.test/minutes' }
const source: DocsData = {
  generalDocuments: [entry],
  years: ['2024-2025', '2025-2026'].map((year) => ({
    year,
    meetingMinutes: [entry],
    otherDocuments: [entry],
  })),
}
const storedDocs: Doc[] = source.years.map(({ year }, index) => ({
  id: index + 1,
  year,
  createdAt: '',
  updatedAt: '',
  generalDocuments: [{ id: `${year}-general`, name: entry.name, googleDocsUrl: entry.url }],
  meetingMinutes: [{ id: `${year}-minutes`, name: entry.name, googleDocsUrl: entry.url }],
  otherDocuments: [{ id: `${year}-other`, name: entry.name, googleDocsUrl: entry.url }],
}))

afterEach(() => vi.restoreAllMocks())

describe('document import array identities', () => {
  it.each([false, true])(
    'uses Payload row identities for two years and both locales (existing: %s)',
    async (existing) => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
      const payload = new BasePayload()
      const find = vi.spyOn(payload, 'find')
      const create = vi.spyOn(payload, 'create')
      const update = vi.spyOn(payload, 'update')
      for (const doc of storedDocs) {
        const result: PaginatedDocs<Doc> = {
          docs: existing ? [doc] : [],
          totalDocs: existing ? 1 : 0,
          totalPages: 1,
          limit: 1,
          pagingCounter: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
        find.mockResolvedValueOnce(result)
        if (existing) update.mockResolvedValueOnce(doc)
        else create.mockResolvedValueOnce(doc)
        update.mockResolvedValueOnce(doc)
      }

      await importDocs(payload, source)

      storedDocs.forEach((doc, index) => {
        const arrays = (locale: 'en' | 'fr') => ({
          generalDocuments: [
            {
              id: locale === 'fr' || existing ? doc.generalDocuments?.[0]?.id : undefined,
              name: locale === 'fr' ? entry.nameFr : entry.name,
            },
          ],
          meetingMinutes: [
            {
              id: locale === 'fr' || existing ? doc.meetingMinutes?.[0]?.id : undefined,
              name: locale === 'fr' ? entry.nameFr : entry.name,
            },
          ],
          otherDocuments: [
            {
              id: locale === 'fr' || existing ? doc.otherDocuments?.[0]?.id : undefined,
              name: locale === 'fr' ? entry.nameFr : entry.name,
            },
          ],
        })
        expect(
          (existing ? update : create).mock.calls[existing ? index * 2 : index]?.[0],
        ).toMatchObject({
          collection: 'docs',
          locale: 'en',
          data: { year: doc.year, ...arrays('en') },
        })
        expect(update.mock.calls[existing ? index * 2 + 1 : index]?.[0]).toMatchObject({
          collection: 'docs',
          id: doc.id,
          locale: 'fr',
          data: arrays('fr'),
        })
      })
    },
  )
})

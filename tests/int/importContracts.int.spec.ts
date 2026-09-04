// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { loadCommittees } from '../../scripts/import-legacy-content/collections/committee'
import { loadDocs } from '../../scripts/import-legacy-content/collections/docs'
import { loadPeople } from '../../scripts/import-legacy-content/collections/people'
import { loadTeams } from '../../scripts/import-legacy-content/collections/teams'
import { extractDocs } from '../../scripts/import-legacy-content/extract-live-site-data'

const dataDir = path.resolve('scripts/import-legacy-content/data')
const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((dir) => fs.rm(dir, { recursive: true })))
})

describe('legacy import contracts', () => {
  it.each([
    { file: 'people.json', load: loadPeople },
    { file: 'teams.json', load: loadTeams },
    { file: 'committee.json', load: loadCommittees },
    { file: 'docs.json', load: loadDocs },
  ])('preserves all existing $file data', async ({ file, load }) => {
    const expected: unknown = JSON.parse(await fs.readFile(path.join(dataDir, file), 'utf8'))
    const result = await load(dataDir)
    expect(result instanceof Map ? [...result.values()] : result).toEqual(expected)
  })

  it.each([
    { file: 'people.json', load: loadPeople, data: [{ name: 42, slug: 'person' }] },
    {
      file: 'people.json',
      load: loadPeople,
      data: [{ name: 'Person', slug: 'person', linkedin: false }],
    },
    {
      file: 'teams.json',
      load: loadTeams,
      data: [
        { name: 'IEEE', positions: [{ role: 'admin', title: { en: 'Chair', fr: 'Président' } }] },
      ],
    },
    {
      file: 'teams.json',
      load: loadTeams,
      data: [{ name: 'IEEE', positions: [{ role: 'exec', title: { en: 'Chair' } }] }],
    },
    {
      file: 'committee.json',
      load: loadCommittees,
      data: [
        {
          year: '2025-2026',
          teams: [{ name: 'IEEE', members: [{ personSlug: 42, roleTitle: 'Chair' }] }],
        },
      ],
    },
    {
      file: 'docs.json',
      load: loadDocs,
      data: { generalDocuments: [{ name: 'Constitution', url: 42 }], years: [] },
    },
  ])('rejects malformed $file before returning import data', async ({ file, load, data }) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ieee-import-contract-'))
    temporaryDirectories.push(directory)
    await fs.writeFile(path.join(directory, file), JSON.stringify(data))
    await expect(load(directory)).rejects.toThrow()
  })
})

function pageHtml(page: unknown) {
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { page } } })}</script>`
}

describe('legacy page extraction', () => {
  it('keeps legacy null fields compatible with existing fallbacks', () => {
    expect(extractDocs(pageHtml({ sections: null }))).toEqual({ generalDocuments: [], years: [] })
    const docs = extractDocs(
      pageHtml({
        sections: [
          { type: 'FeaturedItemsSection', title: null, items: null },
          {
            type: 'FeaturedItemsSection',
            title: 'General Documents',
            items: [
              { title: null, actions: null },
              {
                title: 'Constitution',
                subtitle: null,
                titleFr: null,
                actions: [{ url: null }, { url: '/constitution.pdf' }],
              },
            ],
          },
        ],
      }),
    )
    expect(docs).toEqual({
      generalDocuments: [
        {
          name: 'Constitution',
          nameFr: 'Constitution',
          url: 'https://ieeeuottawa.ca/constitution.pdf',
        },
      ],
      years: [],
    })
  })

  it('preserves document grouping, translation fallback, relative links and dates', () => {
    const docs = extractDocs(
      pageHtml({
        sections: [
          { type: 'HeroSection', items: 42 },
          {
            type: 'FeaturedItemsSection',
            title: 'General Documents',
            items: [
              {
                title: 'Constitution',
                text: '  [Policy](/policy)\r\n\n\nMore  ',
                actions: [{ url: '/constitution.pdf' }],
              },
              { title: 'No link' },
            ],
          },
          {
            type: 'FeaturedItemsSection',
            title: '2025-2026 Meeting Minutes',
            items: [
              {
                title: 'Meeting',
                titleFr: 'Réunion',
                subtitle: 'Meeting: 9/4/2025',
                actions: [{ url: 'https://example.com/minutes' }],
              },
            ],
          },
          {
            type: 'FeaturedItemsSection',
            title: 'Other Documents',
            items: [{ title: 'Budget', subtitle: '2025-09-04', actions: [{ url: '/budget' }] }],
          },
        ],
      }),
    )

    expect(docs).toEqual({
      generalDocuments: [
        {
          name: 'Constitution',
          nameFr: 'Constitution',
          url: 'https://ieeeuottawa.ca/constitution.pdf',
          description: 'Policy (/policy)\n\nMore',
        },
      ],
      years: [
        {
          year: '2025-2026',
          meetingMinutes: [
            {
              name: 'Meeting',
              nameFr: 'Réunion',
              meetingDate: '2025-09-04',
              url: 'https://example.com/minutes',
            },
          ],
          otherDocuments: [
            {
              name: 'Budget',
              nameFr: 'Budget',
              meetingDate: '2025-09-04',
              url: 'https://ieeeuottawa.ca/budget',
            },
          ],
        },
      ],
    })
  })

  it.each([
    '<html>No embedded data</html>',
    '<script id="__NEXT_DATA__" type="application/json">{}</script>',
    pageHtml({
      sections: [
        { type: 'FeaturedItemsSection', items: [{ title: 'Document', actions: [{ url: 42 }] }] },
      ],
    }),
  ])('rejects malformed embedded data', (html) => {
    expect(() => extractDocs(html)).toThrow()
  })
})

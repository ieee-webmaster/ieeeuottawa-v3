import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'

import type { DocData, DocsData } from './schemas'

const SITE_URL = 'https://ieeeuottawa.ca'
const DATA_DIR = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')

const oldItemSchema = z.object({
  actions: z.array(z.object({ url: z.string().nullish() })).nullish(),
  subtitle: z.string().nullish(),
  text: z.string().nullable().optional(),
  textFr: z.string().nullable().optional(),
  title: z.string().nullish(),
  titleFr: z.string().nullish(),
})
const oldSectionSchema = z.object({
  title: z.string().nullish(),
  items: z.array(oldItemSchema).nullish(),
})
const nextDataSchema = z.object({
  props: z.object({
    pageProps: z.object({
      page: z.object({ sections: z.array(z.unknown()).nullish() }),
    }),
  }),
})
const sectionTypeSchema = z.object({ type: z.string().nullish() })

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  const docs = await fetchOldDocuments('/documents/')

  await writeJson('docs.json', docs)
}

async function fetchOldDocuments(route: string) {
  const response = await fetch(`${SITE_URL}${route}`)
  if (!response.ok) throw new Error(`Unable to fetch ${route}: ${response.status}`)

  return extractDocs(await response.text())
}

export function extractDocs(html: string): DocsData {
  const pageData = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1]
  if (!pageData) throw new Error('Unable to find Next.js page data')

  const page = nextDataSchema.parse(JSON.parse(pageData)).props.pageProps.page
  const generalDocuments: DocData[] = []
  const years: DocsData['years'] = []
  let currentYear: DocsData['years'][number] | undefined

  for (const rawSection of page.sections ?? []) {
    const sectionType = sectionTypeSchema.safeParse(rawSection)
    if (!sectionType.success || sectionType.data.type !== 'FeaturedItemsSection') continue
    const section = oldSectionSchema.parse(rawSection)

    const title = section.title || ''
    const year = title.match(/(\d{4}-\d{4})/)?.[1]
    const docs = (section.items ?? []).map(docFromOldItem).filter((doc) => doc !== undefined)

    if (title.toLowerCase().includes('general documents')) {
      generalDocuments.push(...docs)
      continue
    }

    if (year && title.toLowerCase().includes('meeting minutes')) {
      currentYear = { meetingMinutes: docs, otherDocuments: [], year }
      years.push(currentYear)
      continue
    }

    if (currentYear) currentYear.otherDocuments.push(...docs)
  }

  return { generalDocuments, years }
}

function docFromOldItem(item: z.infer<typeof oldItemSchema>): DocData | undefined {
  const url = normalizeOldSiteUrl(item.actions?.find((action) => action.url)?.url)
  if (!item.title || !url) return undefined

  return {
    description: cleanText(item.text),
    descriptionFr: cleanText(item.textFr),
    meetingDate: parseMeetingDate(item.subtitle),
    name: item.title,
    nameFr: item.titleFr || item.title,
    url,
  }
}

function parseMeetingDate(value?: string | null) {
  if (!value) return undefined
  const iso = value.match(/(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  const slashed = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  const [, month, day, year] = slashed ?? []
  if (month && day && year) return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function cleanText(value?: string | null) {
  if (!value) return undefined
  const cleaned = value
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return cleaned || undefined
}

function normalizeOldSiteUrl(url: string | null | undefined) {
  if (!url) return undefined
  return url.startsWith('/') ? `https://ieeeuottawa.ca${url}` : url
}

async function writeJson(fileName: string, data: unknown) {
  await fs.writeFile(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}

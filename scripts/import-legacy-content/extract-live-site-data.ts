import fs from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = 'https://ieeeuottawa.ca'
const DATA_DIR = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')

type OldAction = { url?: string }
type OldFeaturedItem = {
  actions?: OldAction[]
  featuredImage?: { altText?: string; url?: string }
  subtitle?: string
  subtitleFr?: string
  text?: string | null
  textFr?: string | null
  title?: string
  titleFr?: string
}
type OldSection = {
  actions?: OldAction[]
  items?: OldFeaturedItem[]
  title?: string
  type?: string
}
type OldPage = {
  sections?: OldSection[]
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  const docsPage = await fetchOldPage('/documents/')

  await writeJson('docs.json', docsFromOldData(docsPage))
}

async function fetchOldPage(route: string): Promise<OldPage> {
  const response = await fetch(`${SITE_URL}${route}`)
  if (!response.ok) throw new Error(`Unable to fetch ${route}: ${response.status}`)

  const html = await response.text()
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )
  if (!match) throw new Error(`Unable to find Next.js page data for ${route}`)

  return JSON.parse(match[1]).props.pageProps.page
}

function docsFromOldData(page: OldPage) {
  const generalDocuments = []
  const years = []
  let currentYear:
    | { meetingMinutes: unknown[]; otherDocuments: unknown[]; year: string }
    | undefined

  for (const section of page.sections ?? []) {
    if (section.type !== 'FeaturedItemsSection') continue

    const title = section.title || ''
    const year = title.match(/(\d{4}-\d{4})/)?.[1]
    const docs = (section.items ?? []).map(docFromOldItem).filter(Boolean)

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

function docFromOldItem(item: OldFeaturedItem) {
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
  if (slashed) return `${slashed[3]}-${slashed[1].padStart(2, '0')}-${slashed[2].padStart(2, '0')}`
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

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

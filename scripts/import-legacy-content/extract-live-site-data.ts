import fs from 'node:fs/promises'
import path from 'node:path'

import { cleanText, normalizeOldSiteUrl } from './helpers'

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
  backgroundImage?: { url?: string }
  items?: OldFeaturedItem[]
  media?: { url?: string }
  subtitle?: string
  subtitleFr?: string
  text?: string | null
  textFr?: string | null
  title?: string
  titleFr?: string
  type?: string
}
type OldPage = {
  sections?: OldSection[]
  socialImage?: string
  title?: string
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  const docsPage = await fetchOldPage('/documents/')
  const pages = await Promise.all(
    ['/', '/about/', '/mcnaughton-centre/', '/office-hours/'].map(async (route) =>
      pageFromOldData(route, await fetchOldPage(route)),
    ),
  )

  await Promise.all([
    writeJson('docs.json', docsFromOldData(docsPage)),
    writeJson('pages.json', pages),
  ])
}

async function fetchOldPage(route: string): Promise<OldPage> {
  const response = await fetch(`${SITE_URL}${route}`)
  if (!response.ok) throw new Error(`Unable to fetch ${route}: ${response.status}`)

  const html = await response.text()
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (!match) throw new Error(`Unable to find Next.js page data for ${route}`)

  return JSON.parse(match[1]).props.pageProps.page
}

function docsFromOldData(page: OldPage) {
  const generalDocuments = []
  const years = []
  let currentYear: { meetingMinutes: unknown[]; otherDocuments: unknown[]; year: string } | undefined

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

function pageFromOldData(route: string, page: OldPage) {
  const heroSection = (page.sections ?? []).find((section) => section.type === 'HeroSection')

  return {
    hero: sectionText(heroSection),
    heroFr: sectionText(heroSection, 'fr'),
    imageUrl: normalizeOldSiteUrl(page.socialImage || heroSection?.backgroundImage?.url),
    layout: (page.sections ?? [])
      .filter((section) => section !== heroSection)
      .map((section) => ({ content: sectionText(section), contentFr: sectionText(section, 'fr') }))
      .filter((section) => section.content || section.contentFr),
    slug: route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, ''),
    title: page.title || 'Untitled',
    titleFr: heroSection?.titleFr || page.title || 'Untitled',
  }
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

function sectionText(section: OldSection | undefined, locale: 'en' | 'fr' = 'en') {
  if (!section) return ''
  const title = locale === 'fr' ? section.titleFr || section.title : section.title
  const subtitle = locale === 'fr' ? section.subtitleFr || section.subtitle : section.subtitle
  const text = cleanText(locale === 'fr' ? section.textFr || section.text : section.text)
  const items = (section.items ?? [])
    .map((item) => {
      const itemTitle = locale === 'fr' ? item.titleFr || item.title : item.title
      const itemSubtitle = locale === 'fr' ? item.subtitleFr || item.subtitle : item.subtitle
      const itemText = cleanText(locale === 'fr' ? item.textFr || item.text : item.text)
      return [itemTitle, itemSubtitle, itemText].filter(Boolean).join('\n')
    })
    .filter(Boolean)

  return [title, subtitle, text, ...items].filter(Boolean).join('\n\n')
}

function parseMeetingDate(value?: string | null) {
  if (!value) return undefined
  const iso = value.match(/(\d{4}-\d{2}-\d{2})/)
  if (iso) return iso[1]
  const slashed = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashed) return `${slashed[3]}-${slashed[1].padStart(2, '0')}-${slashed[2].padStart(2, '0')}`
}

async function writeJson(fileName: string, data: unknown) {
  await fs.writeFile(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

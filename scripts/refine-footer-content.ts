/** Restore office-hours labels in the footer and homepage. Local-only, dry run by default. */
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Config, Footer, Page } from '@/payload-types'

let payload: Payload | undefined
try {
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.POSTGRES_URL ?? '').hostname)
  ) {
    throw new Error('This content script only supports a local database.')
  }
  payload = await getPayload({ config })
  const directory = `/tmp/ieee-footer-label-${Date.now()}`
  await mkdir(directory)
  const changes: { locale: Config['locale']; data: Pick<Footer, 'navItems'> }[] = []
  const homeChanges: {
    id: number
    locale: Config['locale']
    data: Pick<Page, 'hero'>
    publishedAt: Page['publishedAt']
  }[] = []

  for (const locale of ['en', 'fr'] as const) {
    const footer = await payload.findGlobal({ slug: 'footer', locale, depth: 0 })
    const oldLabel = locale === 'en' ? 'Visit the office' : 'Visitez le bureau'
    const label = locale === 'en' ? 'Office Hours' : 'Heures de bureau'
    const matches = footer.navItems?.filter(
      (item) => item.link?.label === oldLabel || item.link?.label === label,
    )
    if (matches?.length !== 1) throw new Error('The office link changed; review the patch.')
    const item = matches[0]
    const link = item?.link
    if (link?.type !== 'reference' || link.reference?.relationTo !== 'pages')
      throw new Error('Unexpected office link type; review the patch.')
    const reference = link.reference.value
    const page = await payload.findByID({
      collection: 'pages',
      id: typeof reference === 'number' ? reference : reference.id,
      depth: 0,
    })
    if (page.slug !== 'mcnaughton-centre') throw new Error('Unexpected office destination.')
    const data = {
      navItems: footer.navItems?.map((entry) =>
        entry === item ? { ...entry, link: { ...link, label } } : entry,
      ),
    }
    await writeFile(`${directory}/before-${locale}.json`, JSON.stringify(footer, null, 2))
    await writeFile(`${directory}/after-${locale}.json`, JSON.stringify(data, null, 2))
    if (link.label !== label) changes.push({ locale, data })

    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      locale,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const home = docs[0]
    if (!home) throw new Error(`Missing ${locale} homepage.`)
    const officeLinks = home.hero.links?.filter(
      (entry) => entry.link.type === 'custom' && entry.link.url === '/mcnaughton-centre',
    )
    const officeLink = officeLinks?.[0]
    const acceptedLabels = [label, oldLabel, 'Visitez notre bureau']
    if (officeLinks?.length !== 1 || !officeLink || !acceptedLabels.includes(officeLink.link.label))
      throw new Error(`The ${locale} homepage office link changed; review the patch.`)
    const homeData: Pick<Page, 'hero'> = {
      hero: {
        ...home.hero,
        links: home.hero.links?.map((entry) =>
          entry === officeLink ? { ...entry, link: { ...entry.link, label } } : entry,
        ),
      },
    }
    await writeFile(`${directory}/before-home-${locale}.json`, JSON.stringify(home, null, 2))
    await writeFile(`${directory}/after-home-${locale}.json`, JSON.stringify(homeData, null, 2))
    if (officeLink.link.label !== label)
      homeChanges.push({ id: home.id, locale, data: homeData, publishedAt: home.publishedAt })
  }

  const apply = process.env.APPLY_FOOTER_DESIGN === '1'
  if (apply) {
    for (const change of changes)
      await payload.updateGlobal({
        slug: 'footer',
        ...change,
        context: { disableRevalidate: true },
      })
    for (const { publishedAt, ...change } of homeChanges) {
      const updated = await payload.update({
        collection: 'pages',
        ...change,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      // The page hook fills an empty publication date even for a label-only edit.
      if (publishedAt == null && updated.publishedAt != null)
        await payload.update({
          collection: 'pages',
          id: change.id,
          data: { publishedAt: null },
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
    }
  }
  console.log(
    `${apply ? 'Applied locally' : 'Dry run'}: ${changes.length} footer and ${homeChanges.length} homepage label changes. Backups: ${directory}`,
  )
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await payload?.destroy()
}

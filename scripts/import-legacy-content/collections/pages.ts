import fs from 'node:fs/promises'
import path from 'node:path'

import type { Page } from '@/payload-types'
import { type Payload } from 'payload'

import { IMPORT_CONTEXT, plainTextToLexical, truncateText, upsertMediaFromUrl } from '../helpers'

type PageData = {
  hero?: string
  heroFr?: string
  imageUrl?: string
  layout: Array<{ content: string; contentFr?: string }>
  slug: string
  title: string
  titleFr?: string
}

export async function importPages(payload: Payload, dataDir: string) {
  const pages = JSON.parse(await fs.readFile(path.join(dataDir, 'pages.json'), 'utf8')) as PageData[]

  for (const page of pages) {
    const heroMedia = page.imageUrl
      ? await upsertMediaFromUrl(payload, page.imageUrl, `${page.title} hero image`)
      : undefined
    const englishData = {
      _status: 'published' as const,
      hero: {
        richText: plainTextToLexical(page.hero || page.title),
        ...(heroMedia ? { media: heroMedia } : {}),
        type: heroMedia ? ('mediumImpact' as const) : ('lowImpact' as const),
      },
      layout: page.layout.map((section) => contentBlock(section.content)),
      meta: {
        description: truncateText(page.hero || page.title, 160),
        title: page.title,
      },
      slug: page.slug,
      title: page.title,
    }
    const existing = (
      await payload.find({
        collection: 'pages',
        limit: 1,
        pagination: false,
        where: { slug: { equals: page.slug } },
      })
    ).docs[0]
    const doc: Page = existing
      ? await payload.update({
          collection: 'pages',
          context: IMPORT_CONTEXT,
          data: englishData,
          id: existing.id,
          locale: 'en',
        })
      : await payload.create({
          collection: 'pages',
          context: IMPORT_CONTEXT,
          data: englishData,
          locale: 'en',
        })

    await payload.update({
      collection: 'pages',
      context: IMPORT_CONTEXT,
      data: {
        hero: {
          richText: plainTextToLexical(page.heroFr || page.hero || page.titleFr || page.title),
          ...(heroMedia ? { media: heroMedia } : {}),
          type: heroMedia ? ('mediumImpact' as const) : ('lowImpact' as const),
        },
        layout: page.layout.map((section) => contentBlock(section.contentFr || section.content)),
        meta: {
          description: truncateText(page.heroFr || page.hero || page.titleFr || page.title, 160),
          title: page.titleFr || page.title,
        },
        title: page.titleFr || page.title,
      },
      id: doc.id,
      locale: 'fr',
    })
  }
}

function contentBlock(content: string) {
  return {
    blockType: 'content' as const,
    columns: [
      {
        richText: plainTextToLexical(content),
        size: 'full' as const,
      },
    ],
  }
}

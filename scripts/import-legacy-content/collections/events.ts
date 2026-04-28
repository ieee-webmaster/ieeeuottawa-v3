import fs from 'node:fs/promises'
import path from 'node:path'

import type { Event, Team } from '@/payload-types'
import { type Payload } from 'payload'

import {
  IMPORT_CONTEXT,
  plainTextToLexical,
  truncateText,
  upsertMediaFromUrl,
} from '../helpers'

type EventData = {
  actionUrl?: string
  date: string
  description: string
  descriptionFr?: string
  imageAlt?: string
  imageUrl?: string
  location: string
  locationFr?: string
  slug: string
  title: string
  titleFr?: string
}

export async function importEvents(payload: Payload, dataDir: string, hostedByTeamId: Team['id']) {
  const events = JSON.parse(await fs.readFile(path.join(dataDir, 'events.json'), 'utf8')) as EventData[]

  for (const event of events) {
    const heroImage = event.imageUrl
      ? await upsertMediaFromUrl(payload, event.imageUrl, event.imageAlt || event.title)
      : undefined
    const frenchDescription = event.descriptionFr || event.description
    const englishData = {
      'hosted-by': [hostedByTeamId],
      MediaLink: event.actionUrl,
      SignupLink: event.actionUrl,
      _status: 'published' as const,
      content: plainTextToLexical(event.description),
      date: event.date,
      heroImage,
      location: event.location,
      meta: {
        description: truncateText(event.description, 160),
        image: heroImage,
        title: event.title,
      },
      slug: event.slug,
      title: event.title,
    }
    const existing = (
      await payload.find({
        collection: 'events',
        limit: 1,
        pagination: false,
        where: { slug: { equals: event.slug } },
      })
    ).docs[0]
    const doc: Event = existing
      ? await payload.update({
          collection: 'events',
          context: IMPORT_CONTEXT,
          data: englishData,
          id: existing.id,
          locale: 'en',
        })
      : await payload.create({
          collection: 'events',
          context: IMPORT_CONTEXT,
          data: englishData,
          locale: 'en',
        })

    await payload.update({
      collection: 'events',
      context: IMPORT_CONTEXT,
      data: {
        content: plainTextToLexical(frenchDescription),
        location: event.locationFr || event.location,
        meta: {
          description: truncateText(frenchDescription, 160),
          image: heroImage,
          title: event.titleFr || event.title,
        },
        title: event.titleFr || event.title,
      },
      id: doc.id,
      locale: 'fr',
    })
  }
}

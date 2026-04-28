import fs from 'node:fs/promises'
import path from 'node:path'

import type { Person } from '@/payload-types'
import { type Payload } from 'payload'

import {
  findLocalAssetsBySlug,
  IMPORT_CONTEXT,
  slugify,
  titleFromSlug,
  upsertMediaFromLocalFile,
} from '../helpers'

const PERSON_ALIASES: Record<string, string> = {
  'abigail-wilson': 'abby-wilson',
  'ishaaq-ahamed': 'is-haaq-ahamed',
  'vladislav-jidkov': 'vlad-jidkov',
}

export type PersonData = { linkedin?: string | null; name: string; slug: string }

export async function loadPeople(dataDir: string) {
  const people = new Map<string, PersonData>()
  const entries = JSON.parse(
    await fs.readFile(path.join(dataDir, 'people-linkedin.json'), 'utf8'),
  ) as Array<{
    linkedin?: string | null
    name: string
  }>

  for (const entry of entries) {
    const slug = resolvePersonSlug(entry.name)
    people.set(slug, { linkedin: entry.linkedin, name: entry.name, slug })
  }

  return people
}

export function ensurePerson(people: Map<string, PersonData>, personSlug: string) {
  if (people.has(personSlug)) return undefined

  const name = titleFromSlug(personSlug)
  people.set(personSlug, { name, slug: personSlug })
  return name
}

export function resolvePersonSlug(value: string) {
  const slug = slugify(value)
  return PERSON_ALIASES[slug] || slug
}

export async function importPeople(
  payload: Payload,
  dataDir: string,
  people: Map<string, PersonData>,
) {
  const ids = new Map<string, Person['id']>()
  const headshots = await findLocalAssetsBySlug(path.join(dataDir, 'headshots'))

  for (const person of Array.from(people.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const headshotPath = headshots.get(person.slug)
    const headshot = headshotPath
      ? await upsertMediaFromLocalFile(payload, headshotPath, person.name)
      : undefined
    const existing = (
      await payload.find({
        collection: 'people',
        limit: 1,
        pagination: false,
        where: { fullName: { equals: person.name } },
      })
    ).docs[0]
    const data = {
      'Linkedin Profile': person.linkedin || undefined,
      fullName: person.name,
      ...(headshot ? { headshot } : {}),
    }
    const doc = existing
      ? await payload.update({
          collection: 'people',
          context: IMPORT_CONTEXT,
          data,
          id: existing.id,
        })
      : await payload.create({ collection: 'people', context: IMPORT_CONTEXT, data })

    ids.set(person.slug, doc.id)
  }

  return ids
}

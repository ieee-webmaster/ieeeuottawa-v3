import fs from 'node:fs/promises'
import path from 'node:path'

import type { Person } from '@/payload-types'
import { type Payload } from 'payload'

import { findLocalAssetsBySlug, createImportContext, upsertMediaFromLocalFile } from '../helpers'

export type PersonData = { linkedin?: string | null; name: string; slug: string }

export async function loadPeople(dataDir: string) {
  const people = new Map<string, PersonData>()
  const entries = JSON.parse(
    await fs.readFile(path.join(dataDir, 'people.json'), 'utf8'),
  ) as PersonData[]

  for (const entry of entries) {
    people.set(entry.slug, entry)
  }

  return people
}

export async function importPeople(
  payload: Payload,
  dataDir: string,
  people: Map<string, PersonData>,
) {
  const ids = new Map<string, Person['id']>()
  const headshots = await findLocalAssetsBySlug(path.join(dataDir, 'headshots'))
  const sortedPeople = Array.from(people.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  )
  console.log(`people: importing ${sortedPeople.length} people`)

  for (const person of sortedPeople) {
    try {
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
            context: createImportContext(),
            data,
            id: existing.id,
          })
        : await payload.create({ collection: 'people', context: createImportContext(), data })

      ids.set(person.slug, doc.id)
      console.log(`people: ${existing ? 'updated' : 'created'} ${person.name}`)
    } catch (error) {
      throw new Error(`people: failed to import ${person.name}`, { cause: error })
    }
  }

  return ids
}

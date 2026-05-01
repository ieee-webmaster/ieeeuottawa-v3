import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Committee, Person, Team } from '@/payload-types'
import { type Payload } from 'payload'

import { createImportContext, upsertMediaFromLocalFile } from '../helpers'

export type CommitteeData = {
  coverImageFile?: string
  teams: Array<{
    members: Array<{ personSlug: string; roleTitle: string }>
    name: string
  }>
  year: string
}

export async function loadCommittees(dataDir: string) {
  return JSON.parse(
    await fs.readFile(path.join(dataDir, 'committee.json'), 'utf8'),
  ) as CommitteeData[]
}

export async function importCommittees(
  payload: Payload,
  dataDir: string,
  committees: CommitteeData[],
  peopleBySlug: Map<string, Person['id']>,
  teamIds: Map<string, Team['id']>,
) {
  console.log(`committees: importing ${committees.length} committees`)

  for (const committee of committees) {
    try {
      const coverImagePath = committee.coverImageFile
        ? path.join(dataDir, 'committee-covers', committee.coverImageFile)
        : undefined
      let coverImage: Committee['coverImage'] | undefined
      if (coverImagePath && existsSync(coverImagePath)) {
        coverImage = await upsertMediaFromLocalFile(
          payload,
          coverImagePath,
          `${committee.year} committee cover`,
        )
      } else if (committee.coverImageFile) {
        console.warn(
          `committees: missing cover image for ${committee.year}: ${committee.coverImageFile}`,
        )
      }

      const teams: NonNullable<Committee['teams']> = committee.teams.flatMap((team) => {
        const teamId = teamIds.get(team.name)
        if (!teamId) {
          console.warn(`committees: ${committee.year} skipped missing team ${team.name}`)
          return []
        }

        const members = team.members.flatMap((member) => {
          const personId = peopleBySlug.get(member.personSlug)
          if (!personId) {
            console.warn(
              `committees: ${committee.year} skipped missing person ${member.personSlug}`,
            )
            return []
          }

          return [{ person: personId, role: member.roleTitle }]
        })

        return members.length ? [{ members, team: teamId }] : []
      })
      const existing = (
        await payload.find({
          collection: 'committee',
          limit: 1,
          pagination: false,
          where: { Year: { equals: committee.year } },
        })
      ).docs[0]

      await (existing
        ? payload.update({
            collection: 'committee',
            context: createImportContext(),
            data: { Year: committee.year, coverImage, teams },
            id: existing.id,
          })
        : payload.create({
            collection: 'committee',
            context: createImportContext(),
            data: { Year: committee.year, coverImage, teams },
          }))

      console.log(`committees: ${existing ? 'updated' : 'created'} ${committee.year}`)
    } catch (error) {
      throw new Error(`committees: failed to import ${committee.year}`, { cause: error })
    }
  }
}

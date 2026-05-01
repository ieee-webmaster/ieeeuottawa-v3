import fs from 'node:fs/promises'
import path from 'node:path'

import type { Team } from '@/payload-types'
import { type Payload } from 'payload'

import { createImportContext } from '../helpers'

export type RoleValue = 'commish' | 'coord' | 'exec'
export type TeamPosition = {
  positionEmail?: string
  role: RoleValue
  title: { en: string; fr: string }
}
export type TeamData = {
  name: string
  positions: TeamPosition[]
}

export async function loadTeams(dataDir: string) {
  const teams = JSON.parse(
    await fs.readFile(path.join(dataDir, 'teams.json'), 'utf8'),
  ) as TeamData[]
  const teamsByName = new Map<string, TeamData>()

  for (const team of teams) teamsByName.set(team.name, team)

  return teamsByName
}

export async function importTeams(payload: Payload, teams: TeamData[]) {
  const ids = new Map<string, Team['id']>()
  console.log(`teams: importing ${teams.length} teams`)

  for (const team of teams) {
    try {
      const positions = mapTeamPositions(team, 'en')
      const existing = (
        await payload.find({
          collection: 'teams',
          limit: 1,
          locale: 'en',
          pagination: false,
          where: { name: { equals: team.name } },
        })
      ).docs[0]
      const doc: Team = existing
        ? await payload.update({
            collection: 'teams',
            context: createImportContext(),
            data: { name: team.name, positions },
            id: existing.id,
            locale: 'en',
          })
        : await payload.create({
            collection: 'teams',
            context: createImportContext(),
            data: { name: team.name, positions },
            locale: 'en',
          })

      const positionIds = doc.positions?.map((position) => position?.id) ?? []

      await payload.update({
        collection: 'teams',
        context: createImportContext(),
        data: {
          name: team.name,
          positions: mapTeamPositions(team, 'fr', positionIds),
        },
        id: doc.id,
        locale: 'fr',
      })

      ids.set(team.name, doc.id)
      console.log(`teams: ${existing ? 'updated' : 'created'} ${team.name}`)
    } catch (error) {
      throw new Error(`teams: failed to import ${team.name}`, { cause: error })
    }
  }

  return ids
}

function mapTeamPositions(
  team: TeamData,
  locale: 'en' | 'fr',
  ids: Array<string | null | undefined> = [],
) {
  return team.positions.map((position, index) => ({
    ...(ids[index] ? { id: ids[index] } : {}),
    positionEmail: position.positionEmail,
    positionTitle: position.title[locale],
    role: position.role,
  }))
}

import fs from 'node:fs/promises'
import path from 'node:path'

import type { Committee, Person, Team } from '@/payload-types'
import { type Payload } from 'payload'

import {
  fileExists,
  IMPORT_CONTEXT,
  slugify,
  titleFromSlug,
  upsertMediaFromLocalFile,
} from '../helpers'
import { ensurePerson, resolvePersonSlug, type PersonData } from './people'
import {
  addTeamPosition,
  findPosition,
  inferRoleValue,
  type TeamData,
} from './teams'

const ROLE_TITLE_OVERRIDES: Record<string, string> = {
  mcnaughton: 'McNaughton Centre Director',
  mmcnaughton: 'McNaughton Centre Director',
}

export type CommitteeData = {
  teams: Array<{
    members: Array<{ personSlug: string; roleTitle: string }>
    name: string
  }>
  year: string
}

export function parseCommittees(
  raw: string,
  teams: Map<string, TeamData>,
  people: Map<string, PersonData>,
) {
  const sectionStart = raw.indexOf('List of committees:')
  if (sectionStart === -1) throw new Error('Missing committee data in structure.txt')

  const committees: CommitteeData[] = []
  const fallbackPeople: string[] = []
  let currentCommittee: CommitteeData | undefined
  let currentTeam: CommitteeData['teams'][number] | undefined
  let currentTeamData: TeamData | undefined

  for (const line of raw
    .slice(sectionStart + 'List of committees:'.length)
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    if (line === '-----') continue

    const year = normalizeYear(line)
    if (year) {
      currentCommittee = { teams: [], year }
      currentTeam = undefined
      currentTeamData = undefined
      committees.push(currentCommittee)
      continue
    }

    const team = teams.get(line)
    if (team && currentCommittee) {
      currentTeam = { members: [], name: team.name }
      currentTeamData = team
      currentCommittee.teams.push(currentTeam)
      continue
    }

    if (!currentCommittee || !currentTeam || !currentTeamData || !line.includes(',')) continue

    const [rawRole, rawPerson] = line.split(',', 2).map((value) => value.trim())
    const personSlug = resolvePersonSlug(rawPerson)
    const inferredName = ensurePerson(people, personSlug)
    if (inferredName) fallbackPeople.push(inferredName)

    const position = findPosition(currentTeamData, rawRole) ||
      addTeamPosition(currentTeamData, {
        en: titleFromRole(rawRole),
        fr: titleFromRole(rawRole),
        role: inferRoleValue(rawRole),
      })

    currentTeam.members.push({ personSlug, roleTitle: position.en })
  }

  return {
    committees: committees.sort((left, right) => right.year.localeCompare(left.year)),
    fallbackPeople,
  }
}

export async function importCommittees(
  payload: Payload,
  dataDir: string,
  committees: CommitteeData[],
  peopleBySlug: Map<string, Person['id']>,
  teamIds: Map<string, Team['id']>,
) {
  const coverImages = await loadCommitteeCoverImages(dataDir)

  for (const committee of committees) {
    const coverImagePath = coverImages.get(committee.year)
    const coverImage = coverImagePath
      ? await upsertMediaFromLocalFile(payload, coverImagePath, `${committee.year} committee cover`)
      : undefined
    const teams: NonNullable<Committee['teams']> = committee.teams.flatMap((team) => {
      const teamId = teamIds.get(team.name)
      if (!teamId) return []

      const members = team.members.flatMap((member) => {
        const personId = peopleBySlug.get(member.personSlug)
        return personId ? [{ person: personId, role: member.roleTitle }] : []
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
          context: IMPORT_CONTEXT,
          data: { Year: committee.year, coverImage, teams },
          id: existing.id,
        })
      : payload.create({
          collection: 'committee',
          context: IMPORT_CONTEXT,
          data: { Year: committee.year, coverImage, teams },
        }))
  }
}

async function loadCommitteeCoverImages(dataDir: string) {
  const covers = new Map<string, string>()
  const entries = JSON.parse(
    await fs.readFile(path.join(dataDir, 'committee-covers.json'), 'utf8'),
  ) as Array<{ file: string; year: string }>

  for (const entry of entries) {
    const filePath = path.join(dataDir, 'committee-covers', entry.file)
    if (await fileExists(filePath)) {
      covers.set(entry.year, filePath)
      continue
    }

    console.warn(`Missing committee cover image for ${entry.year}: ${entry.file}`)
  }

  return covers
}

function normalizeYear(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/)
  return match ? `${match[1]}-20${match[2]}` : undefined
}

function titleFromRole(value: string) {
  const slug = slugify(value)
  return ROLE_TITLE_OVERRIDES[slug] || titleFromSlug(slug)
}

import type { Team } from '@/payload-types'
import { type Payload } from 'payload'

import { IMPORT_CONTEXT, slugify } from '../helpers'

const ROLE_VALUES = {
  executives: 'exec',
  commissioners: 'commish',
  coordinators: 'coord',
} as const
const ROLE_LABELS = {
  Executive: 'executives',
  Commissioner: 'commissioners',
  Coordinator: 'coordinators',
} as const

type RoleBucket = keyof typeof ROLE_VALUES
export type RoleValue = (typeof ROLE_VALUES)[RoleBucket]
export type TeamPosition = { en: string; fr: string; positionEmail?: string; role: RoleValue }
export type TeamData = {
  name: string
  positionLookup: Map<string, TeamPosition>
  positions: TeamPosition[]
}

export function parseTeams(raw: string) {
  const sectionStart = raw.indexOf('List of teams:')
  const sectionEnd = raw.indexOf('-----', sectionStart)
  if (sectionStart === -1 || sectionEnd === -1) throw new Error('Missing team data in structure.txt')

  const teams = new Map<string, TeamData>()
  const blocks = raw
    .slice(sectionStart, sectionEnd)
    .split(/\n\s*-\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && line !== 'List of teams:')
    const teamName = lines.shift()?.replace(/:$/, '')
    if (!teamName) continue

    const rawPositions: Record<RoleBucket, { en: string[]; fr: string[] }> = {
      executives: { en: [], fr: [] },
      commissioners: { en: [], fr: [] },
      coordinators: { en: [], fr: [] },
    }
    let locale: 'en' | 'fr' = 'en'

    for (const line of lines) {
      if (line === 'English:') {
        locale = 'en'
        continue
      }
      if (line === 'French:') {
        locale = 'fr'
        continue
      }

      const match = line.match(/^(Executive|Commissioner|Coordinator):\s*(.+)$/)
      if (!match) continue

      const bucket = ROLE_LABELS[match[1] as keyof typeof ROLE_LABELS]
      rawPositions[bucket][locale] = splitList(match[2])
    }

    const team: TeamData = { name: teamName, positionLookup: new Map(), positions: [] }
    for (const bucket of Object.keys(rawPositions) as RoleBucket[]) {
      rawPositions[bucket].en.forEach((title, index) => {
        addTeamPosition(team, {
          en: title,
          fr: rawPositions[bucket].fr[index] || title,
          role: ROLE_VALUES[bucket],
        })
      })
    }
    teams.set(team.name, team)
  }

  return teams
}

export function applyPositionEmails(raw: string, teams: Map<string, TeamData>) {
  const sectionStart = raw.indexOf('Emails:')
  if (sectionStart === -1) return

  let currentTeam: TeamData | undefined

  for (const line of raw
    .slice(sectionStart + 'Emails:'.length)
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    if (/^-+$/.test(line)) continue

    const team = teams.get(line.replace(/:$/, ''))
    if (team) {
      currentTeam = team
      continue
    }

    if (!currentTeam) continue

    const entry = parsePositionEmail(line)
    if (!entry) continue

    const position = findPosition(currentTeam, entry.position)
    if (!position) {
      console.warn(
        `Position email did not match a team position: ${currentTeam.name} / ${entry.position}`,
      )
      continue
    }

    position.positionEmail = entry.email
  }
}

export async function importTeams(payload: Payload, teams: TeamData[]) {
  const ids = new Map<string, Team['id']>()

  for (const team of teams) {
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
          context: IMPORT_CONTEXT,
          data: { name: team.name, positions },
          id: existing.id,
          locale: 'en',
        })
      : await payload.create({
          collection: 'teams',
          context: IMPORT_CONTEXT,
          data: { name: team.name, positions },
          locale: 'en',
        })

    await payload.update({
      collection: 'teams',
      context: IMPORT_CONTEXT,
      data: {
        name: team.name,
        positions: mapTeamPositions(team, 'fr'),
      },
      id: doc.id,
      locale: 'fr',
    })

    ids.set(team.name, doc.id)
  }

  return ids
}

function mapTeamPositions(team: TeamData, locale: 'en' | 'fr') {
  return team.positions.map((position) => ({
    positionEmail: position.positionEmail,
    positionTitle: locale === 'fr' ? position.fr : position.en,
    role: position.role,
  }))
}

export function addTeamPosition(team: TeamData, position: TeamPosition) {
  const existing = findPosition(team, position.en)
  if (existing) return existing

  team.positions.push(position)
  for (const key of roleKeys(position.en)) team.positionLookup.set(key, position)
  return position
}

export function findPosition(team: TeamData, rawRole: string) {
  for (const key of roleKeys(rawRole)) {
    const position = team.positionLookup.get(key)
    if (position) return position
  }
}

export function inferRoleValue(value: string): RoleValue {
  const normalized = value.toLowerCase()
  if (normalized.includes('commissioner')) return 'commish'
  if (normalized.includes('coordinator')) return 'coord'
  return 'exec'
}

function roleKeys(value: string) {
  const keys = new Set<string>()
  const normalized = value.trim().toLowerCase()
  const slug = slugify(normalized)
  keys.add(slug)
  keys.add(slugify(normalized.replace(/^vp\s+/, '')))
  keys.add(slugify(normalized.replace(/\s+commissioner$/, '')))
  keys.add(slugify(normalized.replace(/\s+coordinator$/, '')))
  if (slug === 'mdd-commissioner') keys.add('bmdes')
  if (slug === 'software-technical-coordinator') keys.add('software-tech')
  if (slug === 'pathway-commissioner-sustainability-art') {
    keys.add('pathway-commissioner-sustainability-arts')
  }
  if (normalized.includes('mcnaughton')) {
    keys.add('mcnaughton')
    keys.add('mmcnaughton')
  }

  return keys
}

function splitList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parsePositionEmail(line: string) {
  const parts = line.split(',').map((entry) => entry.trim())
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { email: parts[1], position: parts[0] }
  }

  if (!line.includes('@')) return undefined

  return {
    email: line,
    position: line.split('@', 1)[0],
  }
}

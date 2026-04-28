import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { importCommittees, parseCommittees } from './collections/committee'
import { importDocs } from './collections/docs'
import { importEvents } from './collections/events'
import { importPages } from './collections/pages'
import { importPeople, loadPeople } from './collections/people'
import { applyPositionEmails, importTeams, parseTeams } from './collections/teams'

const DATA_DIR = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')

async function main() {
  const structure = await fs.readFile(path.join(DATA_DIR, 'structure.txt'), 'utf8')
  const people = await loadPeople(DATA_DIR)
  const teamsByName = parseTeams(structure)
  const { committees, fallbackPeople } = parseCommittees(structure, teamsByName, people)
  applyPositionEmails(structure, teamsByName)
  const teams = Array.from(teamsByName.values())

  console.log('Loaded local import data:')
  console.log(`- Teams: ${teams.length}`)
  console.log(`- Team positions: ${teams.reduce((sum, team) => sum + team.positions.length, 0)}`)
  console.log(`- Committees: ${committees.length}`)
  console.log(`- People: ${people.size}`)
  if (fallbackPeople.length) {
    console.warn(`- People inferred without LinkedIn data: ${fallbackPeople.join(', ')}`)
  }

  const payload = await getPayload({ config })
  const peopleBySlug = await importPeople(payload, DATA_DIR, people)
  const teamIds = await importTeams(payload, teams)
  await importCommittees(payload, DATA_DIR, committees, peopleBySlug, teamIds)
  await importDocs(payload, DATA_DIR)
  await importPages(payload, DATA_DIR)

  const eventHostTeamId = teamIds.get('IEEE')
  if (!eventHostTeamId) throw new Error('Missing IEEE team for event hosting relationship')
  await importEvents(payload, DATA_DIR, eventHostTeamId)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

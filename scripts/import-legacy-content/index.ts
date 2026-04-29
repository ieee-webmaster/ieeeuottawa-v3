import 'dotenv/config'

import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { importCommittees, loadCommittees } from './collections/committee'
import { importDocs } from './collections/docs'
import { importPeople, loadPeople } from './collections/people'
import { importTeams, loadTeams } from './collections/teams'

const DATA_DIR = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')

async function main() {
  assertRequiredEnv(['BLOB_READ_WRITE_TOKEN', 'PAYLOAD_SECRET', 'POSTGRES_URL'])

  const [people, teamsByName, committees] = await Promise.all([
    loadPeople(DATA_DIR),
    loadTeams(DATA_DIR),
    loadCommittees(DATA_DIR),
  ])
  const teams = Array.from(teamsByName.values())

  console.log('Loaded local import data:')
  console.log(`- Teams: ${teams.length}`)
  console.log(`- Team positions: ${teams.reduce((sum, team) => sum + team.positions.length, 0)}`)
  console.log(`- Committees: ${committees.length}`)
  console.log(`- People: ${people.size}`)

  const payload = await getPayload({ config })
  const peopleBySlug = await importPeople(payload, DATA_DIR, people)
  const teamIds = await importTeams(payload, teams)
  await importCommittees(payload, DATA_DIR, committees, peopleBySlug, teamIds)
  await importDocs(payload, DATA_DIR)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})

function assertRequiredEnv(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing required import environment variables: ${missing.join(', ')}`)
  }
}

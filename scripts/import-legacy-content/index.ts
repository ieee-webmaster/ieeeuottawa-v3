import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { importCommittees, loadCommittees } from './collections/committee'
import { importDocs } from './collections/docs'
import { importNavbar } from './collections/navbar'
import { importPeople, loadPeople } from './collections/people'
import { importTeams, loadTeams } from './collections/teams'

const DATA_DIR = path.resolve(process.cwd(), 'scripts/import-legacy-content/data')
const CLEAR_DATABASE_SQL = path.resolve(process.cwd(), 'scripts/clear-database.sql')
const shouldResetDatabase = process.argv.includes('--reset') || process.env.IMPORT_RESET === '1'

async function main() {
  console.log('Checking import environment')
  assertRequiredEnv(['BLOB_READ_WRITE_TOKEN', 'PAYLOAD_SECRET', 'POSTGRES_URL'])

  console.log(`Loading local data from ${DATA_DIR}`)
  const [people, teamsByName, committees] = await Promise.all([
    loadPeople(DATA_DIR),
    loadTeams(DATA_DIR),
    loadCommittees(DATA_DIR),
  ])
  const teams = Array.from(teamsByName.values())

  console.log(
    `Loaded local import data: ${teams.length} teams, ${teams.reduce(
      (sum, team) => sum + team.positions.length,
      0,
    )} team positions, ${committees.length} committees, ${people.size} people`,
  )

  console.log('Initializing Payload')
  const payload = await getPayload({ config })

  if (shouldResetDatabase) {
    await resetDatabase(payload)
  }

  const peopleBySlug = await importPeople(payload, DATA_DIR, people)
  const teamIds = await importTeams(payload, teams)
  await importCommittees(payload, DATA_DIR, committees, peopleBySlug, teamIds)
  await importDocs(payload, DATA_DIR)
  await importNavbar(payload, DATA_DIR)
  console.log('Import complete')
}

void main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })

function assertRequiredEnv(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing required import environment variables: ${missing.join(', ')}`)
  }
}

async function resetDatabase(payload: Payload) {
  console.log(`Resetting database with ${CLEAR_DATABASE_SQL}`)

  await payload.db.execute({
    drizzle: payload.db.drizzle,
    raw: await fs.readFile(CLEAR_DATABASE_SQL, 'utf8'),
  })
}

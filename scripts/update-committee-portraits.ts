/** Targeted committee content update. Preview by default; uses Payload for all CMS writes. */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isDeepStrictEqual, parseArgs } from 'node:util'
import dotenv from 'dotenv'
import { z } from 'zod'
import type { Payload } from 'payload'
import type { Committee, Person, Team } from '@/payload-types'

const portraits = [
  {
    name: 'Mohamed Boustta',
    profile: 'https://www.linkedin.com/in/mohamed-boustta/',
    file: 'mohamed-boustta-linkedin.png',
    role: null,
  },
  {
    name: 'Inès Bouchama',
    profile: 'https://www.linkedin.com/in/inesbouchama-creative-software-engineer/',
    file: 'ines-bouchama-linkedin.jpg',
    role: 'Design Coordinator',
  },
  {
    name: 'Waaberi Ibrahim',
    profile: 'https://www.linkedin.com/in/waaberi/',
    file: 'waaberi-ibrahim-linkedin.png',
    role: 'Software Technical Coordinator',
  },
] as const
const assetRoot = path.resolve('scripts/import-legacy-content/data/committee-portraits')
const context = { disableRevalidate: true }

const { values } = parseArgs({
  options: {
    target: { type: 'string', default: 'local' },
    apply: { type: 'boolean', default: false },
  },
})
const target = z.enum(['local', 'production', 'static']).parse(values.target)
const env = dotenv.parse(
  await readFile(target === 'local' ? '.env' : '.env.vercel.production.local', 'utf8'),
)
const databaseURL = z.url().parse(target === 'static' ? env.BACKUP_POSTGRES_URL : env.POSTGRES_URL)
const host = new URL(databaseURL).hostname
if (target === 'local' ? !['localhost', '127.0.0.1'].includes(host) : !host.endsWith('.neon.tech'))
  throw new Error('Unexpected database target.')

for (const name of Object.keys(process.env)) {
  if (/BLOB|^POSTGRES|^DATABASE_URL|^PG[A-Z_]|^PAYLOAD_|^VERCEL|^STATIC_EXPORT/.test(name))
    delete process.env[name]
}
Object.assign(process.env, {
  POSTGRES_URL: databaseURL,
  PAYLOAD_SECRET: z.string().min(1).parse(env.PAYLOAD_SECRET),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).parse(env.BLOB_READ_WRITE_TOKEN),
  PAYLOAD_TELEMETRY_DISABLED: '1',
  NODE_ENV: 'production',
  NEXT_PUBLIC_SERVER_URL: target === 'local' ? 'http://localhost:3000' : 'https://ieeeuottawa.ca',
  ...(target === 'static' ? { STATIC_EXPORT: '1' } : {}),
  ...(target === 'local'
    ? {
        VERCEL_BLOB_API_URL: env.VERCEL_BLOB_API_URL,
        STORAGE_VERCEL_BLOB_BASE_URL: env.STORAGE_VERCEL_BLOB_BASE_URL,
      }
    : {}),
})

const [{ createLocalReq, getPayload }, { vercelPostgresAdapter }, { default: config }] =
  await Promise.all([
    import('payload'),
    import('@payloadcms/db-vercel-postgres'),
    import('@payload-config'),
  ])
const sanitized = await config
sanitized.db = {
  ...vercelPostgresAdapter({
    pool: { connectionString: databaseURL },
    push: false,
    disableCreateDatabase: true,
  }),
  allowIDOnCreate: false,
  name: sanitized.db.name,
}
sanitized.telemetry = false

const directory = `/tmp/ieee-committee-${target}-${Date.now()}`
await mkdir(directory, { mode: 0o700 })
const save = (name: string, data: unknown) =>
  writeFile(path.join(directory, name), JSON.stringify(data, null, 2), { mode: 0o600 })
let payload: Payload | undefined
let transactionID: string | number | undefined
try {
  const cms = await getPayload({ config: sanitized, disableOnInit: true })
  payload = cms
  const [committees, teams, people] = await Promise.all([
    cms.find({ collection: 'committee', depth: 0, pagination: false, overrideAccess: true }),
    cms.find({ collection: 'teams', depth: 0, pagination: false, overrideAccess: true }),
    cms.find({
      collection: 'people',
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: {
        or: ['Waaberi', 'Bouchama', 'Boustta'].map((name) => ({ fullName: { contains: name } })),
      },
    }),
  ])
  const before = { committees: committees.docs, teams: teams.docs, people: people.docs }
  await save('before.json', before)
  const committee = committees.docs.find((doc) => doc.Year === '2025-2026')
  const team = teams.docs.find((doc) => doc.name === 'IEEE')
  if (
    !committee ||
    !team ||
    committee.teams?.filter((entry) => entry.team === team.id).length !== 1
  )
    throw new Error('Expected the 2025-2026 committee with one IEEE team.')
  for (const portrait of portraits) {
    const matches = people.docs.filter(
      (person) =>
        person.fullName === portrait.name || person['Linkedin Profile'] === portrait.profile,
    )
    if (matches.length > 1 || (!portrait.role && matches.length !== 1))
      throw new Error(`Missing or ambiguous person: ${portrait.name}`)
  }
  if (
    !team.positions?.some(
      (position) =>
        position.positionTitle === 'Software Technical Coordinator' && position.role === 'coord',
    )
  )
    throw new Error('Expected the existing Software Technical Coordinator position.')
  const planned = { target, year: committee.Year, team: team.name, portraits }
  await save('planned.json', planned)
  console.log(JSON.stringify({ directory, ...planned }, null, 2))
  if (values.apply) {
    // Each upload owns its transaction. A suspended Blob store must not prevent roster edits.
    const photoIDs = new Map<string, number>()
    let suspended = false
    for (const portrait of portraits) {
      const existing = await cms.find({
        collection: 'media',
        where: { filename: { equals: portrait.file } },
        depth: 0,
        limit: 2,
        overrideAccess: true,
      })
      if (existing.totalDocs > 1) throw new Error(`Ambiguous media: ${portrait.file}`)
      if (existing.docs[0]) {
        photoIDs.set(portrait.name, existing.docs[0].id)
        continue
      }
      if (suspended) continue
      try {
        // STATIC_EXPORT disables Blob hooks; the static exporter materializes these files
        // from assetRoot, while Payload still generates the canonical media/rendition metadata.
        const media = await cms.create({
          collection: 'media',
          data: { alt: portrait.name },
          filePath: path.join(assetRoot, portrait.file),
          overrideAccess: true,
          context,
        })
        photoIDs.set(portrait.name, media.id)
        await save(`media-${media.id}.json`, media)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (target !== 'production' || !/suspend/i.test(message)) throw error
        suspended = true
        await save('blob-failure.json', { filename: portrait.file, message })
        console.log(
          'Production Blob is suspended; continuing with names and roles, preserving existing headshots.',
        )
      }
    }

    const id = await cms.db.beginTransaction({ isolationLevel: 'serializable' })
    if (!id) throw new Error('A transaction is required for roster edits.')
    transactionID = id
    const req = await createLocalReq({ req: { transactionID }, context }, cms)
    const currentCommittee = await cms.findByID({
      collection: 'committee',
      id: committee.id,
      depth: 0,
      req,
      overrideAccess: true,
    })
    const currentTeam = await cms.findByID({
      collection: 'teams',
      id: team.id,
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (!isDeepStrictEqual(currentCommittee, committee) || !isDeepStrictEqual(currentTeam, team))
      throw new Error(
        'Committee or positions changed since preview; rerun to review current content.',
      )

    const positions: Team['positions'] = [...(team.positions ?? [])]
    const design = positions.find((position) => position.positionTitle === 'Design Coordinator')
    if (design && design.role !== 'coord')
      throw new Error('Design Coordinator has an unexpected rank.')
    if (!design) {
      positions.push({ role: 'coord', positionTitle: 'Design Coordinator' })
      await cms.update({
        collection: 'teams',
        id: team.id,
        data: { positions },
        locale: 'en',
        req,
        overrideAccess: true,
        context,
      })
    }

    const changedPeople: Person[] = []
    const committeeTeams: Committee['teams'] = structuredClone(committee.teams)
    const members = committeeTeams?.find((entry) => entry.team === team.id)?.members
    if (!members) throw new Error('Missing IEEE members array.')
    for (const portrait of portraits) {
      const previous = people.docs.find(
        (person) =>
          person.fullName === portrait.name || person['Linkedin Profile'] === portrait.profile,
      )
      const headshot = photoIDs.get(portrait.name)
      const data = {
        fullName: portrait.name,
        'Linkedin Profile': portrait.profile,
        ...(headshot ? { headshot } : {}),
      }
      const person = previous
        ? headshot && previous.headshot !== headshot
          ? await cms.update({
              collection: 'people',
              id: previous.id,
              data: { headshot },
              req,
              overrideAccess: true,
              context,
            })
          : previous
        : await cms.create({ collection: 'people', data, req, overrideAccess: true, context })
      changedPeople.push(person)
      if (portrait.role) {
        const memberships = members.filter((member) => member.person === person.id)
        if (memberships.some((member) => member.role !== portrait.role) || memberships.length > 1)
          throw new Error(`Unexpected existing membership for ${portrait.name}.`)
        if (!memberships.length) members.push({ person: person.id, role: portrait.role })
      }
    }
    if (!isDeepStrictEqual(committeeTeams, committee.teams))
      await cms.update({
        collection: 'committee',
        id: committee.id,
        data: { teams: committeeTeams },
        req,
        overrideAccess: true,
        context,
      })
    await cms.db.commitTransaction(transactionID)
    transactionID = undefined

    const readback = await cms.findByID({
      collection: 'committee',
      id: committee.id,
      depth: 2,
      overrideAccess: true,
    })
    const result = { target, suspended, people: changedPeople, committee: readback }
    await save('after.json', result)
    for (const portrait of portraits) {
      const person = changedPeople.find((doc) => doc.fullName === portrait.name)
      if (!person) throw new Error(`Missing person after update: ${portrait.name}`)
      const members =
        readback.teams?.find((entry) => typeof entry.team === 'object' && entry.team.id === team.id)
          ?.members ?? []
      if (
        portrait.role &&
        members.filter(
          (member) =>
            typeof member.person === 'object' &&
            member.person.id === person.id &&
            member.role === portrait.role,
        ).length !== 1
      )
        throw new Error(`Membership readback failed: ${portrait.name}`)
      const verified = await cms.findByID({
        collection: 'people',
        id: person.id,
        depth: 1,
        overrideAccess: true,
      })
      if (
        photoIDs.has(portrait.name) &&
        (typeof verified.headshot !== 'object' || verified.headshot?.filename !== portrait.file)
      )
        throw new Error(`Headshot readback failed: ${portrait.name}`)
    }
    console.log(
      JSON.stringify({
        target,
        applied: true,
        suspended,
        photos: Object.fromEntries(photoIDs),
        directory,
      }),
    )
  }
} catch (error) {
  if (payload && transactionID) await payload.db.rollbackTransaction(transactionID)
  throw error
} finally {
  await payload?.destroy()
}

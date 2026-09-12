import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { parse } from 'dotenv'

const productionEnvPath = fileURLToPath(new URL('../.env.vercel.production.local', import.meta.url))
const productionEnv = existsSync(productionEnvPath) ? parse(readFileSync(productionEnvPath)) : {}

const projectProductionURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

/** @type {NodeJS.ProcessEnv} */
const env = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_PUBLIC_SERVER_URL:
    process.env.STATIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    projectProductionURL ||
    'https://ieeeuottawa.ca',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || productionEnv.PAYLOAD_SECRET,
  POSTGRES_URL: process.env.POSTGRES_URL || productionEnv.POSTGRES_URL,
  STATIC_BUILD_ID: new Date().toISOString(),
  STATIC_EXPORT: '1',
}

/** @type {(command: string, args: string[]) => Promise<void>} */
const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' })

    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) resolve()
      else
        reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`))
    })
  })

if (!env.POSTGRES_URL || !env.PAYLOAD_SECRET) {
  throw new Error(
    'Static builds require explicit POSTGRES_URL and PAYLOAD_SECRET, or .env.vercel.production.local',
  )
}

// Only production releases mutate the shared publishing state. Local tests and
// previews keep their explicitly selected DB and never impersonate a release.
if (
  (process.env.VERCEL_ENV === 'production' || process.argv.includes('--release')) &&
  process.env.STATIC_RELEASE_LOCKED !== '1'
) {
  await run('node', ['--import', 'tsx', 'scripts/static-release.ts'])
  process.exit(0)
}

// Deployment builds must apply the committed schema before reading CMS content.
if (process.argv.includes('--migrate')) {
  await run('pnpm', ['exec', 'payload', 'migrate'])
  await run('node', ['--import', 'tsx', 'scripts/verify-migrations.ts'])
}

// Never let media/sitemap checks validate leftovers if Next changes its export
// destination or exits without producing an export.
await rm(fileURLToPath(new URL('../out', import.meta.url)), { recursive: true, force: true })
await run('pnpm', ['exec', 'next', 'build'])
await run('node', ['--import', 'tsx', 'scripts/build-static-media.ts'])
await run('pnpm', ['exec', 'next-sitemap', '--config', 'next-sitemap.config.cjs'])
await run('node', ['--import', 'tsx', 'scripts/verify-static-media.ts'])

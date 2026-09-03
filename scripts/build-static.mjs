import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parse } from 'dotenv'

const productionEnvPath = fileURLToPath(new URL('../.env.vercel.production.local', import.meta.url))
const productionEnv = existsSync(productionEnvPath) ? parse(readFileSync(productionEnvPath)) : {}

const projectProductionURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

const env = {
  ...process.env,
  NEXT_PUBLIC_SERVER_URL:
    process.env.STATIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    projectProductionURL ||
    'https://ieeeuottawa.ca',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || productionEnv.PAYLOAD_SECRET,
  POSTGRES_URL:
    process.env.POSTGRES_URL || productionEnv.BACKUP_POSTGRES_URL || productionEnv.POSTGRES_URL,
  STATIC_BUILD_ID: new Date().toISOString(),
  STATIC_EXPORT: '1',
}

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

await run('pnpm', ['exec', 'next', 'build'])
await run('node', ['--import', 'tsx', 'scripts/build-static-media.ts'])
await run('pnpm', ['exec', 'next-sitemap', '--config', 'next-sitemap.config.cjs'])

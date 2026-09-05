// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { SanitizedConfig } from 'payload'
import { createRequest } from '../helpers/payload'

let config: SanitizedConfig

beforeAll(async () => {
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_audit_placeholder')
  vi.stubEnv('PAYLOAD_SECRET', 'test-only')
  vi.stubEnv('POSTGRES_URL', 'postgres://test:test@127.0.0.1:9/test')
  config = await (await import('@/payload.config')).default
  vi.unstubAllEnvs()
})

afterEach(() => vi.unstubAllEnvs())

describe('scheduled job access', () => {
  it.each([
    { secret: undefined, authorization: 'Bearer undefined', authenticated: false, allowed: false },
    { secret: '', authorization: 'Bearer ', authenticated: false, allowed: false },
    { secret: 'test-cron-secret', authorization: null, authenticated: false, allowed: false },
    {
      secret: 'test-cron-secret',
      authorization: 'Bearer wrong',
      authenticated: false,
      allowed: false,
    },
    {
      secret: 'test-cron-secret',
      authorization: 'Bearer test-cron-secret',
      authenticated: false,
      allowed: true,
    },
    { secret: undefined, authorization: null, authenticated: true, allowed: true },
  ])('checks $secret / $authorization / authenticated=$authenticated', async (testCase) => {
    vi.stubEnv('CRON_SECRET', testCase.secret)
    const { req } = await createRequest(testCase.authenticated ? {} : null)
    req.headers = new Headers()
    if (testCase.authorization !== null) req.headers.set('authorization', testCase.authorization)
    const access = config.jobs.access?.run
    if (!access) throw new Error('Missing job access callback')

    expect(config.jobs.tasks?.some(({ slug }) => slug === 'schedulePublish')).toBe(true)
    expect(await access({ req })).toBe(testCase.allowed)
  })
})

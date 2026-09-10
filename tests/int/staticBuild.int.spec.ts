// @vitest-environment node
import { ChildProcess, spawn } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:child_process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:child_process')>()),
  spawn: vi.fn(),
}))
vi.mock('node:fs', () => ({
  existsSync: () => false,
  readFileSync: vi.fn(),
}))

const originalArgv = process.argv
const exportCommands = [
  ['pnpm', ['exec', 'next', 'build']],
  ['node', ['--import', 'tsx', 'scripts/build-static-media.ts']],
  ['pnpm', ['exec', 'next-sitemap', '--config', 'next-sitemap.config.cjs']],
  ['node', ['--import', 'tsx', 'scripts/verify-static-media.ts']],
]

beforeEach(() => {
  vi.resetModules()
  vi.mocked(spawn).mockReset()
  process.argv = [process.execPath, 'scripts/build-static.mjs']
  vi.stubEnv('POSTGRES_URL', 'postgres://localhost/static-build-fixture')
  vi.stubEnv('PAYLOAD_SECRET', 'static-build-fixture')
  vi.mocked(spawn).mockImplementation(() => {
    const child = new ChildProcess()
    queueMicrotask(() => child.emit('exit', 0, null))
    return child
  })
})

afterEach(() => {
  process.argv = originalArgv
  vi.unstubAllEnvs()
})

describe('static build migrations', () => {
  it('keeps ordinary local exports free of migration commands', async () => {
    await import('../../scripts/build-static.mjs')

    expect(vi.mocked(spawn).mock.calls.map(([command, args]) => [command, args])).toEqual(
      exportCommands,
    )
  })

  it('migrates before prerendering using the same database and static configuration', async () => {
    process.argv.push('--migrate')
    await import('../../scripts/build-static.mjs')

    expect(vi.mocked(spawn).mock.calls.map(([command, args]) => [command, args])).toEqual([
      ['pnpm', ['exec', 'payload', 'migrate']],
      ...exportCommands,
    ])
    for (const [, , options] of vi.mocked(spawn).mock.calls) {
      expect(options?.env).toMatchObject({
        NODE_ENV: 'production',
        POSTGRES_URL: 'postgres://localhost/static-build-fixture',
        PAYLOAD_SECRET: 'static-build-fixture',
        STATIC_EXPORT: '1',
      })
    }
  })

  it('stops the export when migration fails', async () => {
    process.argv.push('--migrate')
    vi.mocked(spawn).mockImplementationOnce(() => {
      const child = new ChildProcess()
      queueMicrotask(() => child.emit('exit', 1, null))
      return child
    })

    await expect(import('../../scripts/build-static.mjs')).rejects.toThrow(
      'pnpm exited with code 1',
    )
    expect(spawn).toHaveBeenCalledTimes(1)
    expect(spawn).toHaveBeenCalledWith('pnpm', ['exec', 'payload', 'migrate'], expect.any(Object))
  })
})

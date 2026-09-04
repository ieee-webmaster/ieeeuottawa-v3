import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { User } from '@/payload-types'

const { auth, enable, disable, redirect } = vi.hoisted(() => ({
  auth: vi.fn<() => Promise<{ user: User | null }>>(),
  enable: vi.fn(),
  disable: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`)
  }),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ auth, logger: { error: vi.fn() } }) }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ enable, disable }) }))
vi.mock('next/navigation', () => ({ redirect }))

import { GET } from '@/app/(frontend)/next/preview/route'

const request = (path = '/en/example', secret = 'preview-test') =>
  new NextRequest(
    `http://localhost/next/preview?${new URLSearchParams({ collection: 'pages', path, previewSecret: secret })}`,
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('PREVIEW_SECRET', 'preview-test')
  auth.mockResolvedValue({ user: null })
})
afterEach(() => vi.unstubAllEnvs())

describe('preview authentication', () => {
  it('rejects an unauthenticated auth result even with the right preview secret', async () => {
    expect((await GET(request())).status).toBe(403)
    expect(disable).toHaveBeenCalledOnce()
    expect(enable).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('authenticates using headers and enables a local preview for a signed-in user', async () => {
    auth.mockResolvedValue({
      user: {
        id: 1,
        email: 'editor@example.com',
        collection: 'users',
        createdAt: '',
        updatedAt: '',
      },
    })
    const req = request()
    await expect(GET(req)).rejects.toThrow('redirect:/en/example')
    expect(auth).toHaveBeenCalledWith({ headers: req.headers })
    expect(enable).toHaveBeenCalledOnce()
    expect(disable).not.toHaveBeenCalled()
  })

  it('rejects invalid secrets before authenticating', async () => {
    expect((await GET(request('/en/example', 'wrong'))).status).toBe(403)
    expect(auth).not.toHaveBeenCalled()
  })

  it.each(['//example.com', '/\\example.com', 'https://example.com'])(
    'rejects an external redirect: %s',
    async (path) => {
      expect((await GET(request(path))).status).toBe(500)
      expect(auth).not.toHaveBeenCalled()
      expect(enable).not.toHaveBeenCalled()
    },
  )
})

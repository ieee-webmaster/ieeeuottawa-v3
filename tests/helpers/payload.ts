import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { BasePayload, buildConfig, createLocalReq, type Config, type PaginatedDocs } from 'payload'
import { vi } from 'vitest'
import type { Role, User } from '@/payload-types'

// Configuration is sanitized, but Payload is never initialized or connected to a database.
export const testConfig: Config = {
  secret: 'test-only',
  db: vercelPostgresAdapter({
    pool: { connectionString: 'postgres://test:test@127.0.0.1:9/test' },
  }),
  collections: [{ slug: 'users', auth: true, fields: [] }],
}
const config = buildConfig(testConfig)

export async function createRequest(
  user: Partial<User> | null = {},
  roles: Pick<Role, 'collectionPermissions' | 'tagPermissions'>[] = [],
  totalDocs = roles.length,
) {
  const payload = new BasePayload()
  payload.config = await config
  const docs = roles.map(
    (role, index): Role => ({
      id: index + 10,
      name: 'Test role',
      createdAt: '',
      updatedAt: '',
      ...role,
    }),
  )
  const result: PaginatedDocs<Role> = {
    docs,
    totalDocs,
    totalPages: 1,
    page: 1,
    limit: 10,
    pagingCounter: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  }
  const find = vi.spyOn(payload, 'find').mockResolvedValue(result)
  const req = await createLocalReq(
    {
      user:
        user === null
          ? undefined
          : {
              id: 1,
              email: 'test@example.com',
              collection: 'users',
              createdAt: '',
              updatedAt: '',
              superAdmin: false,
              roles: [10],
              ...user,
            },
    },
    payload,
  )
  return { req, find }
}

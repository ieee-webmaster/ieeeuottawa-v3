import { describe, expect, it } from 'vitest'
import type { Page, User } from '@/payload-types'
import { fieldAffectsData } from 'payload/shared'
import { createRequest, testConfig } from '../helpers/payload'

import {
  buildCollectionAccess,
  buildGlobalAccess,
  buildTagWhere,
  canAccessTags,
  getAccessTagsFromValue,
  getRoleIds,
  hasCollectionPermission,
  isSuperAdmin,
  type RolePermission,
} from '../../src/plugins/payload-rbac/access'
import { ensureFirstUserIsSuperAdmin, rbacPlugin } from '../../src/plugins/payload-rbac'

describe('RBAC: id normalization', () => {
  it('extracts numeric role ids from a populated user', () => {
    expect(
      getRoleIds({ roles: [1, 2, { id: 3, name: 'Editor', createdAt: '', updatedAt: '' }] }),
    ).toEqual([1, 2, 3])
  })

  it('accepts string tag IDs at the input boundary', () => {
    expect(getAccessTagsFromValue(['a', { id: 'b' }])).toEqual(['a', 'b'])
  })

  it('handles mixed numeric and string ids', () => {
    expect(getAccessTagsFromValue([1, 'b', { id: 'c' }, { id: 4 }])).toEqual([1, 'b', 'c', 4])
  })

  it('drops null/undefined and unrecognized shapes', () => {
    expect(getAccessTagsFromValue([null, undefined, {}, { id: null }, true, 5])).toEqual([5])
  })

  it('returns [] when user has no roles', () => {
    expect(getRoleIds({})).toEqual([])
    expect(getRoleIds(null)).toEqual([])
  })

  it('extracts numeric tag ids from a populated relationship value', () => {
    expect(getAccessTagsFromValue([1, { id: 2 }, 'three'])).toEqual([1, 2, 'three'])
  })
})

describe('RBAC: super admin', () => {
  it('recognizes the generated superAdmin flag', () => {
    expect(isSuperAdmin({ superAdmin: true })).toBe(true)
  })

  it('does not treat a falsy field as super admin', () => {
    expect(isSuperAdmin({ superAdmin: false })).toBe(false)
    expect(isSuperAdmin({})).toBe(false)
    expect(isSuperAdmin(null)).toBe(false)
  })
})

describe('RBAC: collection permissions (no admin wildcard)', () => {
  const roleWithUpdateOnly: RolePermission = {
    collectionPermissions: [{ collection: 'pages', actions: ['update'] }],
  }

  const roleWithUpdateAndDelete: RolePermission = {
    collectionPermissions: [{ collection: 'pages', actions: ['update', 'delete'] }],
  }

  it('grants only the explicitly listed action', () => {
    expect(hasCollectionPermission([roleWithUpdateOnly], 'pages', 'update')).toBe(true)
    expect(hasCollectionPermission([roleWithUpdateOnly], 'pages', 'delete')).toBe(false)
    expect(hasCollectionPermission([roleWithUpdateOnly], 'pages', 'create')).toBe(false)
  })

  it('handles multiple actions on the same role', () => {
    expect(hasCollectionPermission([roleWithUpdateAndDelete], 'pages', 'update')).toBe(true)
    expect(hasCollectionPermission([roleWithUpdateAndDelete], 'pages', 'delete')).toBe(true)
    expect(hasCollectionPermission([roleWithUpdateAndDelete], 'pages', 'create')).toBe(false)
  })

  it('returns false for collections not matched on any role', () => {
    expect(hasCollectionPermission([roleWithUpdateOnly], 'posts', 'update')).toBe(false)
  })
})

describe('RBAC: read access behavior', () => {
  it('allows admin collection access for authenticated users by default', async () => {
    const { req, find } = await createRequest({ id: 1, superAdmin: false, roles: [] })

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    await expect(access.admin({ req })).resolves.toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('allows authenticated read without collection permissions', async () => {
    const { req, find } = await createRequest({ id: 1, superAdmin: false, roles: [] })

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.read({ req })
    expect(result).toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('preserves base access for unauthenticated reads', async () => {
    const baseAccess = {
      read: () => ({ _status: { equals: 'published' } }),
    }

    const access = buildCollectionAccess({
      collection: 'posts',
      baseAccess,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.read({ req: (await createRequest(null)).req })
    expect(result).toMatchObject({ _status: { equals: 'published' } })
  })

  it('preserves explicit public create access for unauthenticated users', async () => {
    const baseAccess = {
      create: () => true,
    }
    const { req, find } = await createRequest(null)

    const access = buildCollectionAccess({
      collection: 'form-submissions',
      baseAccess,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.create({ req })
    expect(result).toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('denies unauthenticated create when the collection does not explicitly allow it', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.create({ req: (await createRequest(null)).req })
    expect(result).toBe(false)
  })

  it('denies updates when the user has no matching collection permissions', async () => {
    const { req } = await createRequest({ id: 1, superAdmin: false, roles: [10] })

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.update({ req, data: {} })
    expect(result).toBe(false)
  })

  it('falls back to a self-id where clause when selfUpdateField is set', async () => {
    const { req } = await createRequest({ id: 42, superAdmin: false, roles: [10] })

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
      selfUpdateField: 'id',
    })

    const result = await access.update({ req, data: {} })
    expect(result).toEqual({ id: { equals: 42 } })
  })

  it('still grants full update when the user has users:update permission', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'users', actions: ['update'] }],
    }
    const { req } = await createRequest({ id: 42, superAdmin: false, roles: [10] }, [role])

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
      selfUpdateField: 'id',
    })

    const result = await access.update({ req, data: {} })
    expect(result).toBe(true)
  })
})

describe('RBAC: tag permissions', () => {
  const role: RolePermission = {
    tagPermissions: [
      { tag: 1, effect: 'allow', actions: ['update', 'delete'] },
      {
        tag: { id: 2, name: 'Private', slug: 'private', createdAt: '', updatedAt: '' },
        effect: 'deny',
        actions: ['update'],
      },
    ],
  }

  it('allows when one of the data tags matches an allow rule', () => {
    expect(canAccessTags([role], [1], 'update', false)).toBe(true)
    expect(canAccessTags([role], [1, 99], 'update', false)).toBe(true)
  })

  it('denies when any data tag is in the deny set', () => {
    expect(canAccessTags([role], [1, 2], 'update', false)).toBe(false)
  })

  it('denies when no allow rules match', () => {
    expect(canAccessTags([role], [99], 'update', false)).toBe(false)
  })

  it('honors requireTags=false for empty data tags', () => {
    expect(canAccessTags([role], [], 'update', false)).toBe(true)
  })

  it('honors requireTags=true for empty data tags', () => {
    expect(canAccessTags([role], [], 'update', true)).toBe(false)
  })

  it('treats numeric and string tag ids as equivalent in lookups', () => {
    const numericRole: RolePermission = {
      tagPermissions: [{ tag: 7, effect: 'allow', actions: ['update'] }],
    }
    expect(canAccessTags([numericRole], ['7'], 'update', false)).toBe(true)
    expect(canAccessTags([numericRole], [7], 'update', false)).toBe(true)
  })
})

describe('RBAC: tag where filters', () => {
  const role: RolePermission = {
    tagPermissions: [
      { tag: 1, effect: 'allow', actions: ['update'] },
      { tag: 2, effect: 'deny', actions: ['update'] },
    ],
  }

  it('returns null when there are no rules and tags are not required', () => {
    expect(buildTagWhere('accessTags', [], 'update', false)).toBeNull()
  })

  it('returns false when there are no rules and tags are required', () => {
    expect(buildTagWhere('accessTags', [], 'update', true)).toBe(false)
  })

  it('builds a permissive where with no required tags', () => {
    const where = buildTagWhere('accessTags', [role], 'update', false)
    expect(where).toMatchObject({
      and: [
        {
          or: [{ accessTags: { exists: false } }, { accessTags: { in: [1] } }],
        },
        { accessTags: { not_in: [2] } },
      ],
    })
  })

  it('builds a restrictive where when tags are required', () => {
    const where = buildTagWhere('accessTags', [role], 'update', true)
    expect(where).toMatchObject({
      and: [{ accessTags: { in: [1] } }, { accessTags: { not_in: [2] } }],
    })
  })

  it('uses numeric ids in where clauses', () => {
    expect(buildTagWhere('accessTags', [role], 'update', true)).toMatchObject({
      and: [{ accessTags: { in: [1] } }, { accessTags: { not_in: [2] } }],
    })
  })
})

describe('RBAC: ensureFirstUserIsSuperAdmin', () => {
  const buildArgs = async (
    totalDocs: number,
    data: Partial<User>,
    operation: 'create' | 'update' = 'create',
    user: Partial<User> | null = null,
  ) => {
    const { req, find } = await createRequest(user, [], totalDocs)
    const collection = req.payload.config.collections.find(({ slug }) => slug === 'users')
    if (!collection) throw new Error('Missing users collection')
    return { args: { collection, context: req.context, data, operation, req }, find }
  }

  it('promotes when no users exist', async () => {
    const { args } = await buildArgs(0, { email: 'first@example.com' })
    expect(await ensureFirstUserIsSuperAdmin(args)).toMatchObject({ superAdmin: true })
  })

  it('does not promote on subsequent users', async () => {
    const { args } = await buildArgs(1, { email: 'second@example.com' })
    expect(await ensureFirstUserIsSuperAdmin(args)).not.toMatchObject({ superAdmin: true })
  })

  it('counts all users in the same request transaction (prevents privilege escalation)', async () => {
    const { args, find } = await buildArgs(1, { email: 'attacker@example.com' }, 'create', {})
    await ensureFirstUserIsSuperAdmin(args)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'users', overrideAccess: true, req: args.req }),
    )
  })

  it('skips on non-create operations', async () => {
    const data = { email: 'someone@example.com' }
    const { args, find } = await buildArgs(0, data, 'update')
    expect(await ensureFirstUserIsSuperAdmin(args)).toBe(data)
    expect(find).not.toHaveBeenCalled()
  })
})

describe('RBAC: superAdmin/roles field-level access', () => {
  const getCreateAccess = async (fieldName: string) => {
    const result = await rbacPlugin({ collections: ['pages'] })(testConfig)
    const users = result.collections?.find(({ slug }) => slug === 'users')
    const field = users?.fields.find((field) => fieldAffectsData(field) && field.name === fieldName)
    if (!field || !('access' in field) || !field.access?.create) {
      throw new Error(`Missing create access for ${fieldName}`)
    }
    return field.access.create
  }

  it('forbids non-super-admins from setting superAdmin on create', async () => {
    const create = await getCreateAccess('superAdmin')
    const { req } = await createRequest({ superAdmin: false })
    expect(create({ req })).toBe(false)
  })

  it('allows super-admins to set superAdmin on create', async () => {
    const create = await getCreateAccess('superAdmin')
    const { req } = await createRequest({ superAdmin: true })
    expect(create({ req })).toBe(true)
  })

  it('forbids non-super-admins from setting roles on create', async () => {
    const create = await getCreateAccess('roles')
    const { req } = await createRequest({ superAdmin: false })
    expect(create({ req })).toBe(false)
  })
})

describe('RBAC: update tag check (empty array enforcement)', () => {
  const buildArgs = async (roles: RolePermission[], data: { accessTags?: unknown }) => {
    const { req, find } = await createRequest({}, roles)
    return { args: { req, data }, find }
  }

  const role: RolePermission = {
    collectionPermissions: [{ collection: 'pages', actions: ['update'] }],
    tagPermissions: [{ tag: 7, effect: 'allow', actions: ['update'] }],
  }

  it('denies clearing accessTags when requireTagsForWrite=true', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: true,
      includeTagAccess: true,
    })
    const { args } = await buildArgs([role], { accessTags: [] })
    expect(await access.update(args)).toBe(false)
  })

  it('allows clearing accessTags when requireTagsForWrite=false', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: true,
    })
    const { args } = await buildArgs([role], { accessTags: [] })
    const result = await access.update(args)
    expect(result).not.toBe(false)
  })

  it('skips the data check when accessTags is omitted from the patch', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: true,
      includeTagAccess: true,
    })
    const data: Partial<Page> = { title: 'Patch without tags' }
    const { args } = await buildArgs([role], data)
    const result = await access.update(args)
    expect(result).not.toBe(false)
  })
})

describe('RBAC: loadRoles per-request cache', () => {
  it('only queries roles once per request across multiple access checks', async () => {
    const role: RolePermission = {
      collectionPermissions: [
        { collection: 'pages', actions: ['update'] },
        { collection: 'pages', actions: ['delete'] },
      ],
    }
    const { req, find } = await createRequest({ id: 1, superAdmin: false, roles: [10] }, [role])

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    await access.update({ req, data: {} })
    await access.delete({ req })
    await access.update({ req, data: {} })

    expect(find).toHaveBeenCalledTimes(1)
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: true }))
  })
})

describe('RBAC: globals', () => {
  it('delegates read to base access', async () => {
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: { read: () => true },
    })
    await expect(access.read({ req: (await createRequest(null)).req })).resolves.toBe(true)
  })

  it('denies update for unauthenticated requests', async () => {
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
    })
    await expect(access.update({ req: (await createRequest(null)).req })).resolves.toBe(false)
  })

  it('denies update for authenticated users without the matching permission', async () => {
    const { req } = await createRequest({ id: 1, superAdmin: false, roles: [10] })
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
    })
    await expect(access.update({ req, data: {} })).resolves.toBe(false)
  })

  it('allows update when a role grants update on the global slug', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'header', actions: ['update'] }],
    }
    const { req } = await createRequest({ id: 1, superAdmin: false, roles: [10] }, [role])
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
    })
    await expect(access.update({ req, data: {} })).resolves.toBe(true)
  })

  it('always allows update for super admins', async () => {
    const { req, find } = await createRequest({ id: 1, superAdmin: true, roles: [] })
    const access = buildGlobalAccess({
      globalSlug: 'footer',
      baseAccess: undefined,
    })
    await expect(access.update({ req, data: {} })).resolves.toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('treats `create` and `delete` actions on a global row as no-ops', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'header', actions: ['create', 'delete'] }],
    }
    const { req } = await createRequest({ id: 1, superAdmin: false, roles: [10] }, [role])
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
    })
    await expect(access.update({ req, data: {} })).resolves.toBe(false)
  })
})

describe('RBAC: rbacPlugin global walk', () => {
  it('wraps named globals with RBAC update access and leaves others alone', async () => {
    const baseConfig = {
      ...testConfig,
      collections: [{ slug: 'users', auth: true, fields: [] }],
      globals: [
        { slug: 'header', access: { read: () => true }, fields: [] },
        { slug: 'footer', access: { read: () => true }, fields: [] },
        { slug: 'unmanaged', fields: [] },
      ],
    }
    const plugin = rbacPlugin({
      collections: ['pages'],
      globals: ['header', 'footer'],
    })
    const result = await plugin(baseConfig)
    const header = result.globals?.find((g) => g.slug === 'header')
    const footer = result.globals?.find((g) => g.slug === 'footer')
    const unmanaged = result.globals?.find((g) => g.slug === 'unmanaged')

    expect(typeof header?.access?.update).toBe('function')
    expect(typeof footer?.access?.update).toBe('function')
    expect(unmanaged?.access).toBeUndefined()
  })

  it('adds global slugs to the role-editor collection dropdown', async () => {
    const baseConfig = {
      ...testConfig,
      collections: [{ slug: 'users', auth: true, fields: [] }],
      globals: [
        { slug: 'header', fields: [] },
        { slug: 'footer', fields: [] },
      ],
    }
    const plugin = rbacPlugin({
      collections: ['pages'],
      globals: ['header', 'footer'],
    })
    const result = await plugin(baseConfig)
    const roles = result.collections?.find((c) => c.slug === 'roles')
    const collectionPermissions = roles?.fields.find(
      (field) => fieldAffectsData(field) && field.name === 'collectionPermissions',
    )
    if (collectionPermissions?.type !== 'array') throw new Error('Missing collection permissions')
    const collectionField = collectionPermissions.fields.find(
      (field) => fieldAffectsData(field) && field.name === 'collection',
    )
    if (collectionField?.type !== 'select') throw new Error('Missing collection options')
    const values = collectionField.options.map((option) =>
      typeof option === 'string' ? option : option.value,
    )

    expect(values).toContain('pages')
    expect(values).toContain('users')
    expect(values).toContain('header')
    expect(values).toContain('footer')
  })
})

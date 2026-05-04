import { describe, expect, it, vi } from 'vitest'

import {
  buildCollectionAccess,
  buildGlobalAccess,
  buildTagWhere,
  canAccessTags,
  getAccessTagsFromValue,
  getRoleIds,
  hasAnyPermission,
  hasAnyCollectionPermission,
  hasCollectionPermission,
  isSuperAdmin,
  type RolePermission,
} from '../../src/plugins/payload-rbac/access'
import { ensureFirstUserIsSuperAdmin, rbacPlugin } from '../../src/plugins/payload-rbac'

describe('RBAC: id normalization', () => {
  it('extracts numeric role ids from a populated user', () => {
    expect(getRoleIds({ roles: [1, 2, { id: 3 }] })).toEqual([1, 2, 3])
  })

  it('extracts string role ids', () => {
    expect(getRoleIds({ roles: ['a', { id: 'b' }] })).toEqual(['a', 'b'])
  })

  it('handles mixed numeric and string ids', () => {
    expect(getRoleIds({ roles: [1, 'b', { id: 'c' }, { id: 4 }] })).toEqual([1, 'b', 'c', 4])
  })

  it('drops null/undefined and unrecognized shapes', () => {
    expect(getRoleIds({ roles: [null, undefined, {}, { id: null }, true, 5] })).toEqual([5])
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
  it('treats a truthy superAdminField as super admin', () => {
    expect(isSuperAdmin({ superAdmin: true }, 'superAdmin')).toBe(true)
  })

  it('does not treat a falsy field as super admin', () => {
    expect(isSuperAdmin({ superAdmin: false }, 'superAdmin')).toBe(false)
    expect(isSuperAdmin({}, 'superAdmin')).toBe(false)
    expect(isSuperAdmin(null, 'superAdmin')).toBe(false)
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

  it('returns true for hasAnyCollectionPermission when any action is granted', () => {
    expect(hasAnyCollectionPermission([roleWithUpdateOnly], 'pages')).toBe(true)
    expect(hasAnyCollectionPermission([roleWithUpdateOnly], 'posts')).toBe(false)
  })

  it('returns true for hasAnyPermission when any collection action is granted', () => {
    expect(hasAnyPermission([roleWithUpdateOnly])).toBe(true)
    expect(hasAnyPermission([{ collectionPermissions: [] }])).toBe(false)
  })

  it('returns false for collections not matched on any role', () => {
    expect(hasCollectionPermission([roleWithUpdateOnly], 'posts', 'update')).toBe(false)
  })
})

describe('RBAC: read access behavior', () => {
  it('allows admin collection access for authenticated users by default', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    await expect(access.admin({ req } as never)).resolves.toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('can still scope admin access to the matching collection when configured', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'pages', actions: ['update'] }],
    }
    const find = vi.fn().mockResolvedValue({ docs: [role] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'posts',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
      adminAccess: 'collection',
    })

    await expect(access.admin({ req } as never)).resolves.toBe(false)
  })

  it('allows authenticated read without collection permissions', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.read({ req } as never)
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
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.read({ req: { user: undefined } } as never)
    expect(result).toMatchObject({ _status: { equals: 'published' } })
  })

  it('preserves explicit public create access for unauthenticated users', async () => {
    const baseAccess = {
      create: () => true,
    }
    const find = vi.fn()

    const access = buildCollectionAccess({
      collection: 'form-submissions',
      baseAccess,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.create({ req: { user: undefined, payload: { find } } } as never)
    expect(result).toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('denies unauthenticated create when the collection does not explicitly allow it', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.create({ req: { user: undefined } } as never)
    expect(result).toBe(false)
  })

  it('denies updates when the user has no matching collection permissions', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    const result = await access.update({ req, data: { title: 'update' } } as never)
    expect(result).toBe(false)
  })

  it('falls back to a self-id where clause when selfUpdateField is set', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const req = {
      user: { id: 42, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
      selfUpdateField: 'id',
    })

    const result = await access.update({ req, data: { firstName: 'Self' } } as never)
    expect(result).toEqual({ id: { equals: 42 } })
  })

  it('still grants full update when the user has users:update permission', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'users', actions: ['update'] }],
    }
    const find = vi.fn().mockResolvedValue({ docs: [role] })
    const req = {
      user: { id: 42, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'users',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
      selfUpdateField: 'id',
    })

    const result = await access.update({ req, data: { firstName: 'Other' } } as never)
    expect(result).toBe(true)
  })
})

describe('RBAC: tag permissions', () => {
  const role: RolePermission = {
    tagPermissions: [
      { tag: 1, effect: 'allow', actions: ['update', 'delete'] },
      { tag: { id: 2 }, effect: 'deny', actions: ['update'] },
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
    const where = buildTagWhere('accessTags', [role], 'update', true) as {
      and: [{ accessTags: { in: number[] } }]
    }
    expect(where.and[0].accessTags.in).toEqual([1])
    expect(typeof where.and[0].accessTags.in[0]).toBe('number')
  })
})

describe('RBAC: ensureFirstUserIsSuperAdmin', () => {
  const buildReq = (totalDocs: number) => {
    const find = vi.fn().mockResolvedValue({ totalDocs })
    const req: Record<string, unknown> = { payload: { find } }
    return { req, find }
  }

  it('promotes when no users exist', async () => {
    const hook = ensureFirstUserIsSuperAdmin('users', 'superAdmin')
    const { req } = buildReq(0)
    const result = await hook({
      data: { email: 'first@example.com' },
      req,
      operation: 'create',
    } as never)
    expect(result).toMatchObject({ superAdmin: true })
  })

  it('does not promote on subsequent users', async () => {
    const hook = ensureFirstUserIsSuperAdmin('users', 'superAdmin')
    const { req } = buildReq(1)
    const result = await hook({
      data: { email: 'second@example.com' },
      req,
      operation: 'create',
    } as never)
    expect(result).not.toMatchObject({ superAdmin: true })
  })

  it('always uses overrideAccess to count existing users (prevents privilege escalation)', async () => {
    const hook = ensureFirstUserIsSuperAdmin('users', 'superAdmin')
    const { req, find } = buildReq(1)
    await hook({
      data: { email: 'attacker@example.com' },
      req: { ...req, user: { id: 1 } } as never,
      operation: 'create',
    } as never)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'users', overrideAccess: true }),
    )
  })

  it('skips on non-create operations', async () => {
    const hook = ensureFirstUserIsSuperAdmin('users', 'superAdmin')
    const { req, find } = buildReq(0)
    const data = { email: 'someone@example.com' }
    const result = await hook({ data, req, operation: 'update' } as never)
    expect(result).toBe(data)
    expect(find).not.toHaveBeenCalled()
  })
})

describe('RBAC: superAdmin/roles field-level access', () => {
  const buildUsersCollection = () => {
    const baseConfig = {
      collections: [
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
    } as never

    const plugin = rbacPlugin({ collections: ['pages'], userCollectionSlug: 'users' })
    const result = plugin(baseConfig) as {
      collections: Array<{
        slug: string
        fields: Array<{ name?: string; access?: Record<string, (args: never) => unknown> }>
      }>
    }
    return result.collections.find((c) => c.slug === 'users')!
  }

  it('forbids non-super-admins from setting superAdmin on create', () => {
    const users = buildUsersCollection()
    const field = users.fields.find((f) => f.name === 'superAdmin')!
    const args = { req: { user: { id: 1, superAdmin: false } } } as never
    expect(field.access!.create(args)).toBe(false)
  })

  it('allows super-admins to set superAdmin on create', () => {
    const users = buildUsersCollection()
    const field = users.fields.find((f) => f.name === 'superAdmin')!
    const args = { req: { user: { id: 1, superAdmin: true } } } as never
    expect(field.access!.create(args)).toBe(true)
  })

  it('forbids non-super-admins from setting roles on create', () => {
    const users = buildUsersCollection()
    const field = users.fields.find((f) => f.name === 'roles')!
    const args = { req: { user: { id: 1, superAdmin: false } } } as never
    expect(field.access!.create(args)).toBe(false)
  })
})

describe('RBAC: update tag check (empty array enforcement)', () => {
  const buildArgs = (roles: RolePermission[], data: unknown) => {
    const find = vi.fn().mockResolvedValue({ docs: roles })
    return {
      args: {
        req: {
          user: { id: 1, superAdmin: false, roles: [10] },
          payload: { find },
          context: {},
        },
        data,
      } as never,
      find,
    }
  }

  const role: RolePermission = {
    collectionPermissions: [{ collection: 'pages', actions: ['update'] }],
    tagPermissions: [{ tag: 7, effect: 'allow', actions: ['update'] }],
  }

  it('denies clearing accessTags when requireTagsForWrite=true', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: true,
      includeTagAccess: true,
    })
    const { args } = buildArgs([role], { accessTags: [] })
    expect(await access.update(args)).toBe(false)
  })

  it('allows clearing accessTags when requireTagsForWrite=false', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: true,
    })
    const { args } = buildArgs([role], { accessTags: [] })
    const result = await access.update(args)
    expect(result).not.toBe(false)
  })

  it('skips the data check when accessTags is omitted from the patch', async () => {
    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: true,
      includeTagAccess: true,
    })
    const { args } = buildArgs([role], { title: 'patch only' })
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
    const find = vi.fn().mockResolvedValue({ docs: [role] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }

    const access = buildCollectionAccess({
      collection: 'pages',
      baseAccess: undefined,
      options: {
        rolesCollectionSlug: 'roles',
        accessTagsCollectionSlug: 'access-tags',
        superAdminField: 'superAdmin',
      },
      requireTagsForWrite: false,
      includeTagAccess: false,
    })

    await access.update({ req, data: {} } as never)
    await access.delete({ req } as never)
    await access.update({ req, data: {} } as never)

    expect(find).toHaveBeenCalledTimes(1)
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: true }))
  })
})

describe('RBAC: globals', () => {
  const rbacOptions = {
    rolesCollectionSlug: 'roles',
    accessTagsCollectionSlug: 'access-tags',
    superAdminField: 'superAdmin',
  }

  it('delegates read to base access', async () => {
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: { read: () => true },
      options: rbacOptions,
    })
    await expect(access.read({ req: { user: undefined } } as never)).resolves.toBe(true)
  })

  it('denies update for unauthenticated requests', async () => {
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
      options: rbacOptions,
    })
    await expect(access.update({ req: { user: undefined } } as never)).resolves.toBe(false)
  })

  it('denies update for authenticated users without the matching permission', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
      options: rbacOptions,
    })
    await expect(access.update({ req, data: {} } as never)).resolves.toBe(false)
  })

  it('allows update when a role grants update on the global slug', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'header', actions: ['update'] }],
    }
    const find = vi.fn().mockResolvedValue({ docs: [role] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
      options: rbacOptions,
    })
    await expect(access.update({ req, data: {} } as never)).resolves.toBe(true)
  })

  it('always allows update for super admins', async () => {
    const find = vi.fn()
    const req = {
      user: { id: 1, superAdmin: true, roles: [] },
      payload: { find },
      context: {},
    }
    const access = buildGlobalAccess({
      globalSlug: 'footer',
      baseAccess: undefined,
      options: rbacOptions,
    })
    await expect(access.update({ req, data: {} } as never)).resolves.toBe(true)
    expect(find).not.toHaveBeenCalled()
  })

  it('treats `create` and `delete` actions on a global row as no-ops', async () => {
    const role: RolePermission = {
      collectionPermissions: [{ collection: 'header', actions: ['create', 'delete'] }],
    }
    const find = vi.fn().mockResolvedValue({ docs: [role] })
    const req = {
      user: { id: 1, superAdmin: false, roles: [10] },
      payload: { find },
      context: {},
    }
    const access = buildGlobalAccess({
      globalSlug: 'header',
      baseAccess: undefined,
      options: rbacOptions,
    })
    await expect(access.update({ req, data: {} } as never)).resolves.toBe(false)
  })
})

describe('RBAC: rbacPlugin global walk', () => {
  it('wraps named globals with RBAC update access and leaves others alone', () => {
    const baseConfig = {
      collections: [{ slug: 'users', auth: true, fields: [] }],
      globals: [
        { slug: 'header', access: { read: () => true }, fields: [] },
        { slug: 'footer', access: { read: () => true }, fields: [] },
        { slug: 'unmanaged', fields: [] },
      ],
    } as never
    const plugin = rbacPlugin({
      collections: ['pages'],
      globals: ['header', 'footer'],
      userCollectionSlug: 'users',
    })
    const result = plugin(baseConfig) as {
      globals: Array<{
        slug: string
        access?: { read?: unknown; update?: unknown }
      }>
    }
    const header = result.globals.find((g) => g.slug === 'header')!
    const footer = result.globals.find((g) => g.slug === 'footer')!
    const unmanaged = result.globals.find((g) => g.slug === 'unmanaged')!

    expect(typeof header.access?.update).toBe('function')
    expect(typeof footer.access?.update).toBe('function')
    expect(unmanaged.access).toBeUndefined()
  })

  it('adds global slugs to the role-editor collection dropdown', () => {
    const baseConfig = {
      collections: [{ slug: 'users', auth: true, fields: [] }],
      globals: [
        { slug: 'header', fields: [] },
        { slug: 'footer', fields: [] },
      ],
    } as never
    const plugin = rbacPlugin({
      collections: ['pages'],
      globals: ['header', 'footer'],
      userCollectionSlug: 'users',
    })
    const result = plugin(baseConfig) as {
      collections: Array<{
        slug: string
        fields: Array<{
          name?: string
          fields?: Array<{ name?: string; options?: { value: string }[] }>
        }>
      }>
    }
    const roles = result.collections.find((c) => c.slug === 'roles')!
    const collectionPermissions = roles.fields.find((f) => f.name === 'collectionPermissions')!
    const collectionField = collectionPermissions.fields!.find((f) => f.name === 'collection')!
    const values = collectionField.options!.map((o) => o.value)

    expect(values).toContain('pages')
    expect(values).toContain('users')
    expect(values).toContain('header')
    expect(values).toContain('footer')
  })
})

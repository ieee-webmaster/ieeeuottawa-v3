import type { Access, CollectionConfig, GlobalConfig, Field, PayloadRequest, Where } from 'payload'

import { isSuperAdmin } from './identity'
import { hasCollectionPermission, loadRoles } from './roles'
import { buildTagWhere, canAccessTags, getAccessTagsFromValue } from './tags'
import { accessTagsFieldName, type RolePermission, type TagAction } from './types'
import { combineWhere, resolveBaseAccess } from './where'

const allowWithBaseWhere = (baseResult: boolean | Where): boolean | Where =>
  typeof baseResult !== 'boolean' ? baseResult : true

const resolveMutationWhere = ({
  baseResult,
  includeTagAccess,
  roles,
  action,
  requireTagsForWrite,
}: {
  baseResult: boolean | Where
  includeTagAccess: boolean
  roles: RolePermission[]
  action: Exclude<TagAction, 'create'>
  requireTagsForWrite: boolean
}): boolean | Where => {
  const tagWhere = includeTagAccess
    ? buildTagWhere(accessTagsFieldName, roles, action, requireTagsForWrite)
    : null

  if (tagWhere === false) {
    return false
  }

  const baseWhere = typeof baseResult !== 'boolean' ? baseResult : null
  const combined = combineWhere(baseWhere, tagWhere ?? null)
  return combined ?? true
}

export const buildAccessTagsField = (): Field => ({
  name: accessTagsFieldName,
  label: 'Access tags',
  type: 'relationship',
  relationTo: 'access-tags',
  hasMany: true,
  admin: {
    position: 'sidebar',
    description:
      'Tags used to scope create, update, and delete permissions. If empty, only collection permissions apply.',
  },
})

export type AdminAccess = ({ req }: { req: PayloadRequest }) => boolean | Promise<boolean>

type BaseAccess = NonNullable<CollectionConfig['access']>

type BuildAccessParams = {
  collection: string
  baseAccess: BaseAccess | undefined
  requireTagsForWrite: boolean
  includeTagAccess: boolean
  selfUpdateField?: string
}

export const buildCollectionAccess = ({
  collection,
  baseAccess,
  requireTagsForWrite,
  includeTagAccess,
  selfUpdateField,
}: BuildAccessParams) => {
  const admin: AdminAccess = async ({ req }) => {
    const baseResult = await baseAccess?.admin?.({ req })
    if (baseResult === false) {
      return false
    }

    if (!req.user) {
      return false
    }

    return true
  }

  const read: Access = (args) => resolveBaseAccess(baseAccess?.read, args)

  const create: Access<{ accessTags?: unknown }> = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.create, args)
    if (baseResult === false) {
      return false
    }

    if (!args.req.user) {
      return baseAccess?.create && (baseResult === true || typeof baseResult !== 'boolean')
        ? baseResult
        : false
    }

    if (isSuperAdmin(args.req.user)) {
      return true
    }

    const roles = await loadRoles(args.req)
    if (!hasCollectionPermission(roles, collection, 'create')) {
      return false
    }

    if (!includeTagAccess) {
      return true
    }

    const dataTags = getAccessTagsFromValue(args.data?.accessTags)
    return canAccessTags(roles, dataTags, 'create', requireTagsForWrite)
  }

  const update: Access<{ accessTags?: unknown }> = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.update, args)
    if (baseResult === false) {
      return false
    }

    if (!args.req.user) {
      return false
    }

    if (isSuperAdmin(args.req.user)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req)
    if (!hasCollectionPermission(roles, collection, 'update')) {
      if (selfUpdateField) {
        const userId = args.req.user.id
        if (userId !== undefined) {
          const selfWhere: Where = { [selfUpdateField]: { equals: userId } }
          const baseWhere = typeof baseResult !== 'boolean' ? baseResult : null
          return combineWhere(baseWhere, selfWhere) ?? selfWhere
        }
      }
      return false
    }

    if (includeTagAccess && args.data?.accessTags !== undefined) {
      const dataTags = getAccessTagsFromValue(args.data.accessTags)
      if (!canAccessTags(roles, dataTags, 'update', requireTagsForWrite)) {
        return false
      }
    }

    return resolveMutationWhere({
      baseResult,
      includeTagAccess,
      roles,
      action: 'update',
      requireTagsForWrite,
    })
  }

  const del: Access = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.delete, args)
    if (baseResult === false) {
      return false
    }

    if (!args.req.user) {
      return false
    }

    if (isSuperAdmin(args.req.user)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req)
    if (!hasCollectionPermission(roles, collection, 'delete')) {
      return false
    }

    return resolveMutationWhere({
      baseResult,
      includeTagAccess,
      roles,
      action: 'delete',
      requireTagsForWrite,
    })
  }

  return {
    admin,
    create,
    read,
    update,
    delete: del,
  }
}

type GlobalBaseAccess = NonNullable<GlobalConfig['access']>

type BuildGlobalAccessParams = {
  globalSlug: string
  baseAccess: GlobalBaseAccess | undefined
}

export const buildGlobalAccess = ({ globalSlug, baseAccess }: BuildGlobalAccessParams) => {
  const read: Access = (args) => resolveBaseAccess(baseAccess?.read, args)

  const update: Access = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.update, args)
    if (baseResult === false) return false
    if (!args.req.user) return false
    if (isSuperAdmin(args.req.user)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req)
    if (!hasCollectionPermission(roles, globalSlug, 'update')) {
      return false
    }
    return allowWithBaseWhere(baseResult)
  }

  return { read, update }
}

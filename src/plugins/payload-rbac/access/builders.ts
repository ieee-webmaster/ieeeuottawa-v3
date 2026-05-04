import type { Access, CollectionSlug, Field, PayloadRequest, Where } from 'payload'

import { isSuperAdmin } from './identity'
import {
  hasAnyCollectionPermission,
  hasAnyPermission,
  hasCollectionPermission,
  loadRoles,
} from './roles'
import { buildTagWhere, canAccessTags, getAccessTagsFromValue } from './tags'
import {
  accessTagsFieldName,
  type RbacAccessOptions,
  type RbacId,
  type RolePermission,
  type TagAction,
} from './types'
import { combineWhere, isWhere, resolveBaseAccess } from './where'

const allowWithBaseWhere = (baseResult: boolean | Where): boolean | Where =>
  isWhere(baseResult) ? baseResult : true

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

  const baseWhere = isWhere(baseResult) ? baseResult : null
  const combined = combineWhere(baseWhere, tagWhere ?? null)
  return combined ?? true
}

export const buildAccessTagsField = (accessTagsCollectionSlug: string): Field => ({
  name: accessTagsFieldName,
  label: 'Access tags',
  type: 'relationship',
  relationTo: accessTagsCollectionSlug as CollectionSlug,
  hasMany: true,
  admin: {
    position: 'sidebar',
    description:
      'Tags used to scope create, update, and delete permissions. If empty, only collection permissions apply.',
  },
})

export type AdminAccess = ({ req }: { req: PayloadRequest }) => boolean | Promise<boolean>

export type BaseAccess = {
  admin?: AdminAccess
  create?: Access
  read?: Access
  update?: Access
  delete?: Access
}

type BuildAccessParams = {
  collection: string
  baseAccess: BaseAccess | undefined
  options: RbacAccessOptions
  requireTagsForWrite: boolean
  includeTagAccess: boolean
  adminAccess?: 'authenticated' | 'collection' | 'any'
  selfUpdateField?: string
}

export const buildCollectionAccess = ({
  collection,
  baseAccess,
  options,
  requireTagsForWrite,
  includeTagAccess,
  adminAccess = 'authenticated',
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

    if (isSuperAdmin(req.user, options.superAdminField)) {
      return true
    }

    if (adminAccess === 'authenticated') {
      return true
    }

    const roles = await loadRoles(req, options, req.user)
    if (adminAccess === 'any') {
      return hasAnyPermission(roles)
    }

    return hasAnyCollectionPermission(roles, collection)
  }

  const read: Access = (args) => resolveBaseAccess(baseAccess?.read, args)

  const create: Access = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.create, args)
    if (baseResult === false) {
      return false
    }

    if (!args.req.user) {
      return baseAccess?.create && (baseResult === true || isWhere(baseResult)) ? baseResult : false
    }

    if (isSuperAdmin(args.req.user, options.superAdminField)) {
      return true
    }

    const roles = await loadRoles(args.req, options, args.req.user)
    if (!hasCollectionPermission(roles, collection, 'create')) {
      return false
    }

    if (!includeTagAccess) {
      return true
    }

    const dataTags = getAccessTagsFromValue(
      (args.data as { accessTags?: unknown } | undefined)?.accessTags,
    )
    return canAccessTags(roles, dataTags, 'create', requireTagsForWrite)
  }

  const update: Access = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.update, args)
    if (baseResult === false) {
      return false
    }

    if (!args.req.user) {
      return false
    }

    if (isSuperAdmin(args.req.user, options.superAdminField)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req, options, args.req.user)
    if (!hasCollectionPermission(roles, collection, 'update')) {
      if (selfUpdateField) {
        const userId = (args.req.user as { id?: RbacId }).id
        if (userId !== undefined) {
          const selfWhere: Where = { [selfUpdateField]: { equals: userId } }
          const baseWhere = isWhere(baseResult) ? baseResult : null
          return combineWhere(baseWhere, selfWhere) ?? selfWhere
        }
      }
      return false
    }

    if (
      includeTagAccess &&
      (args.data as { accessTags?: unknown } | undefined)?.accessTags !== undefined
    ) {
      const dataTags = getAccessTagsFromValue((args.data as { accessTags?: unknown }).accessTags)
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

    if (isSuperAdmin(args.req.user, options.superAdminField)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req, options, args.req.user)
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

export type GlobalBaseAccess = {
  read?: Access
  update?: Access
}

type BuildGlobalAccessParams = {
  globalSlug: string
  baseAccess: GlobalBaseAccess | undefined
  options: RbacAccessOptions
}

export const buildGlobalAccess = ({ globalSlug, baseAccess, options }: BuildGlobalAccessParams) => {
  const read: Access = (args) => resolveBaseAccess(baseAccess?.read, args)

  const update: Access = async (args) => {
    const baseResult = await resolveBaseAccess(baseAccess?.update, args)
    if (baseResult === false) return false
    if (!args.req.user) return false
    if (isSuperAdmin(args.req.user, options.superAdminField)) {
      return allowWithBaseWhere(baseResult)
    }

    const roles = await loadRoles(args.req, options, args.req.user)
    if (!hasCollectionPermission(roles, globalSlug, 'update')) {
      return false
    }
    return allowWithBaseWhere(baseResult)
  }

  return { read, update }
}

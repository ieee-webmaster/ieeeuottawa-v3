import type { CollectionSlug, PayloadRequest } from 'payload'

import { getRoleIds } from './identity'
import type { CollectionAction, RbacAccessOptions, RolePermission } from './types'

const rolesCacheKey = '__rbacRoles' as const

type CollectionPermission = NonNullable<RolePermission['collectionPermissions']>[number]

export const loadRoles = async (
  req: PayloadRequest,
  options: RbacAccessOptions,
  user: unknown,
): Promise<RolePermission[]> => {
  const roleIds = getRoleIds(user)

  if (roleIds.length === 0) {
    return []
  }

  const context = (req.context ?? {}) as Record<string, unknown>
  const cached = context[rolesCacheKey]
  if (Array.isArray(cached)) {
    return cached as RolePermission[]
  }

  const reqForRoles: PayloadRequest = { ...req, user: null }

  const result = await req.payload.find({
    collection: options.rolesCollectionSlug as CollectionSlug,
    where: {
      id: {
        in: roleIds,
      },
    },
    depth: 0,
    limit: roleIds.length,
    overrideAccess: true,
    req: reqForRoles,
  })

  const roles = result.docs as RolePermission[]
  if (req.context) {
    context[rolesCacheKey] = roles
  }
  return roles
}

const hasCollectionPermissionEntry = (
  roles: RolePermission[],
  matches: (permission: CollectionPermission) => boolean,
): boolean => roles.some((role) => role.collectionPermissions?.some(matches) ?? false)

export const hasCollectionPermission = (
  roles: RolePermission[],
  collection: string,
  action: CollectionAction,
): boolean => {
  return hasCollectionPermissionEntry(roles, (permission) => {
    return permission.collection === collection && (permission.actions ?? []).includes(action)
  })
}

export const hasAnyCollectionPermission = (
  roles: RolePermission[],
  collection: string,
): boolean => {
  return hasCollectionPermissionEntry(roles, (permission) => {
    return permission.collection === collection && Boolean(permission.actions?.length)
  })
}

export const hasAnyPermission = (roles: RolePermission[]): boolean => {
  return hasCollectionPermissionEntry(roles, (permission) => {
    return Boolean(permission.collection && permission.actions?.length)
  })
}

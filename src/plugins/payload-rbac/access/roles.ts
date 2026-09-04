import type { PayloadRequest } from 'payload'

import { getRoleIds } from './identity'
import type { CollectionAction, RolePermission } from './types'

declare module 'payload' {
  interface RequestContext {
    __rbacRoles?: RolePermission[]
  }
}

export const loadRoles = async (req: PayloadRequest): Promise<RolePermission[]> => {
  const roleIds = getRoleIds(req.user)

  if (roleIds.length === 0) {
    return []
  }

  if (req.context.__rbacRoles) return req.context.__rbacRoles

  const reqForRoles: PayloadRequest = { ...req, user: null }

  const result = await req.payload.find({
    collection: 'roles',
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

  req.context.__rbacRoles = result.docs
  return result.docs
}

export const hasCollectionPermission = (
  roles: RolePermission[],
  collection: string,
  action: CollectionAction,
): boolean =>
  roles.some(
    (role) =>
      role.collectionPermissions?.some(
        (permission) => permission.collection === collection && permission.actions.includes(action),
      ) ?? false,
  )

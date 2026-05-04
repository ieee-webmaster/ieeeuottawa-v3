import type { Where } from 'payload'

import { getIdsFromValue, idKey } from './identity'
import type { RbacId, RolePermission, TagAction } from './types'

export const getAccessTagsFromValue = (value: unknown): RbacId[] => getIdsFromValue(value)

type TagPermissionMaps = {
  allowed: Map<string, RbacId>
  denied: Map<string, RbacId>
}

const collectTagPermissions = (roles: RolePermission[], action: TagAction): TagPermissionMaps => {
  const allowed = new Map<string, RbacId>()
  const denied = new Map<string, RbacId>()

  roles.forEach((role) => {
    role.tagPermissions?.forEach((permission) => {
      if (!permission?.actions?.includes(action)) {
        return
      }

      const tagId = getAccessTagsFromValue(permission.tag)[0]
      if (tagId === undefined) {
        return
      }

      if (permission.effect === 'deny') {
        denied.set(idKey(tagId), tagId)
        return
      }

      allowed.set(idKey(tagId), tagId)
    })
  })

  return { allowed, denied }
}

export const canAccessTags = (
  roles: RolePermission[],
  tagIds: RbacId[],
  action: TagAction,
  requireTags: boolean,
): boolean => {
  if (tagIds.length === 0) {
    return !requireTags
  }

  const { allowed, denied } = collectTagPermissions(roles, action)

  if (tagIds.some((tagId) => denied.has(idKey(tagId)))) {
    return false
  }

  if (allowed.size === 0) {
    return false
  }

  return tagIds.some((tagId) => allowed.has(idKey(tagId)))
}

export const buildTagWhere = (
  tagField: string,
  roles: RolePermission[],
  action: TagAction,
  requireTags: boolean,
): Where | null | false => {
  const { allowed, denied } = collectTagPermissions(roles, action)

  if (allowed.size === 0 && denied.size === 0) {
    return requireTags ? false : null
  }

  const allowedIds = Array.from(allowed.values())
  const deniedIds = Array.from(denied.values())

  let base: Where | null = null

  if (allowedIds.length > 0) {
    base = requireTags
      ? { [tagField]: { in: allowedIds } }
      : {
          or: [{ [tagField]: { exists: false } }, { [tagField]: { in: allowedIds } }],
        }
  } else if (!requireTags && deniedIds.length > 0) {
    base = {
      or: [{ [tagField]: { exists: false } }, { [tagField]: { not_in: deniedIds } }],
    }
  }

  if (!base) {
    return false
  }

  if (deniedIds.length > 0) {
    return {
      and: [base, { [tagField]: { not_in: deniedIds } }],
    }
  }

  return base
}

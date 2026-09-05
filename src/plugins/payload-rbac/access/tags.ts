import type { Where } from 'payload'
import { z } from 'zod'
import type { AccessTag } from '@/payload-types'

import type { RolePermission, TagAction } from './types'

// Access runs before native relationship validation, which draft writes can skip.
const tagIdSchema = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .regex(/^[+-]?\d+$/),
  ])
  .pipe(z.coerce.number<string | number>().int())
export const accessTagsSchema = z
  .union([
    z.array(z.union([tagIdSchema, z.object({ id: tagIdSchema }).transform(({ id }) => id)])),
    tagIdSchema.transform((id) => [id]),
    z.enum(['', 'none', 'null']).transform(() => []),
  ])
  .nullish()
  .transform((ids) => ids ?? [])

const collectTagPermissions = (roles: RolePermission[], action: TagAction) => {
  const allowed = new Set<AccessTag['id']>()
  const denied = new Set<AccessTag['id']>()

  roles.forEach((role) => {
    role.tagPermissions?.forEach((permission) => {
      if (!permission.actions.includes(action)) {
        return
      }

      const tagId = typeof permission.tag === 'number' ? permission.tag : permission.tag.id

      if (permission.effect === 'deny') {
        denied.add(tagId)
        return
      }

      allowed.add(tagId)
    })
  })

  return { allowed, denied }
}

export const canAccessTags = (
  roles: RolePermission[],
  tagIds: AccessTag['id'][],
  action: TagAction,
  requireTags: boolean,
): boolean => {
  if (tagIds.length === 0) {
    return !requireTags
  }

  const { allowed, denied } = collectTagPermissions(roles, action)

  if (tagIds.some((tagId) => denied.has(tagId))) {
    return false
  }

  if (allowed.size === 0) {
    return false
  }

  return tagIds.some((tagId) => allowed.has(tagId))
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

  const allowedIds = Array.from(allowed)
  const deniedIds = Array.from(denied)

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

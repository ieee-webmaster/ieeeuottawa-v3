import type { RbacId } from './types'

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isRbacId = (value: unknown): value is RbacId =>
  typeof value === 'string' || typeof value === 'number'

export const idKey = (id: RbacId): string => String(id)

export const isSuperAdmin = (user: unknown, superAdminField: string): boolean => {
  return isRecord(user) && Boolean(user[superAdminField])
}

export const getIdsFromValue = (value: unknown): RbacId[] => {
  if (!value) {
    return []
  }

  const rawValues = Array.isArray(value) ? value : [value]

  return rawValues
    .map((entry): RbacId | null => {
      if (isRbacId(entry)) {
        return entry
      }

      if (isRecord(entry) && isRbacId(entry.id)) {
        return entry.id
      }

      return null
    })
    .filter((id): id is RbacId => id !== null)
}

export const getRoleIds = (user: unknown): RbacId[] => {
  if (!isRecord(user) || !user.roles) {
    return []
  }

  return getIdsFromValue(user.roles)
}

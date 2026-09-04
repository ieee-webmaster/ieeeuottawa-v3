import type { User } from '@/payload-types'
import type { RbacId } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isRbacId = (value: unknown): value is RbacId =>
  typeof value === 'string' || typeof value === 'number'

export const idKey = (id: RbacId): string => String(id)

export const isSuperAdmin = (user: Pick<User, 'superAdmin'> | null | undefined): boolean =>
  user?.superAdmin === true

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

export const getRoleIds = (user: Pick<User, 'roles'> | null | undefined): RbacId[] =>
  user?.roles?.map((role) => (typeof role === 'number' ? role : role.id)) ?? []

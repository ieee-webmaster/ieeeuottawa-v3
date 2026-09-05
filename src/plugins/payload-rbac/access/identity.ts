import type { Role, User } from '@/payload-types'

export const isSuperAdmin = (user: Pick<User, 'superAdmin'> | null | undefined): boolean =>
  user?.superAdmin === true

export const getRoleIds = (user: Pick<User, 'roles'> | null | undefined): Role['id'][] =>
  user?.roles?.map((role) => (typeof role === 'number' ? role : role.id)) ?? []

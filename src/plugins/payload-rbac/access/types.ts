import type { Role } from '@/payload-types'

export const permissionActions = ['create', 'update', 'delete'] as const

export type PermissionAction = (typeof permissionActions)[number]
export type CollectionAction = PermissionAction
export type TagAction = PermissionAction

export type RolePermission = Pick<Role, 'collectionPermissions' | 'tagPermissions'>

export const accessTagsFieldName = 'accessTags'

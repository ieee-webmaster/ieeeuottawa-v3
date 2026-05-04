export const permissionActions = ['create', 'update', 'delete'] as const

export type PermissionAction = (typeof permissionActions)[number]
export type CollectionAction = PermissionAction
export type TagAction = PermissionAction

export type RbacId = string | number

export type TagEffect = 'allow' | 'deny'

export type RolePermission = {
  collectionPermissions?:
    | {
        collection?: string | null
        actions?: CollectionAction[] | null
      }[]
    | null
  tagPermissions?:
    | {
        tag?: RbacId | { id?: RbacId | null } | null
        actions?: TagAction[] | null
        effect?: TagEffect | null
      }[]
    | null
}

export type RbacAccessOptions = {
  rolesCollectionSlug: string
  accessTagsCollectionSlug: string
  superAdminField: string
}

export const accessTagsFieldName = 'accessTags'

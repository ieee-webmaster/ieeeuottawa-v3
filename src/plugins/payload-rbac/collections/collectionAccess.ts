import type { Access, CollectionConfig } from 'payload'

import { isSuperAdmin } from '../access'

type CollectionAccess = NonNullable<CollectionConfig['access']>
type CollectionAdminAccess = NonNullable<CollectionAccess['admin']>

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const buildSuperAdminCollectionAccess = (
  superAdminField: string,
  overrides: Partial<CollectionAccess> = {},
): CollectionAccess => {
  const superAdminAccess: Access = ({ req }) => isSuperAdmin(req.user, superAdminField)
  const superAdminAdminAccess: CollectionAdminAccess = ({ req }) =>
    isSuperAdmin(req.user, superAdminField)

  return {
    admin: superAdminAdminAccess,
    create: superAdminAccess,
    delete: superAdminAccess,
    read: superAdminAccess,
    update: superAdminAccess,
    ...overrides,
  }
}

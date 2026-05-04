import type { CollectionConfig, CollectionSlug, Option } from 'payload'

import { permissionActions, type PermissionAction } from '../access'
import { buildSuperAdminCollectionAccess } from './collectionAccess'

type RolesCollectionOptions = {
  slug: string
  accessTagsCollectionSlug: string
  collectionOptions: Option[]
  superAdminField: string
}

const actionLabels: Record<PermissionAction, string> = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
}

const actionOptions: Option[] = permissionActions.map((value) => ({
  label: actionLabels[value],
  value,
}))

export const buildRolesCollection = ({
  slug,
  accessTagsCollectionSlug,
  collectionOptions,
  superAdminField,
}: RolesCollectionOptions): CollectionConfig => ({
  slug,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
  },
  access: buildSuperAdminCollectionAccess(superAdminField),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'collectionPermissions',
      type: 'array',
      label: 'Collection & global permissions',
      admin: {
        initCollapsed: true,
        description:
          'Grant create, update, and delete access per collection. Authenticated users can read by default. Globals appear in the same list — only "update" applies to them; "create" and "delete" are no-ops.',
      },
      fields: [
        {
          name: 'collection',
          label: 'Collection or global',
          type: 'select',
          required: true,
          options: collectionOptions,
        },
        {
          name: 'actions',
          type: 'select',
          required: true,
          hasMany: true,
          options: actionOptions,
        },
      ],
    },
    {
      name: 'tagPermissions',
      type: 'array',
      label: 'Tag permissions',
      admin: {
        initCollapsed: true,
        description:
          'Allow or deny create, update, and delete actions for documents tagged with access tags.',
      },
      fields: [
        {
          name: 'tag',
          type: 'relationship',
          relationTo: accessTagsCollectionSlug as CollectionSlug,
          required: true,
        },
        {
          name: 'effect',
          type: 'select',
          required: true,
          defaultValue: 'allow',
          options: [
            { label: 'Allow', value: 'allow' },
            { label: 'Deny', value: 'deny' },
          ],
        },
        {
          name: 'actions',
          type: 'select',
          required: true,
          hasMany: true,
          options: actionOptions,
        },
      ],
    },
  ],
  timestamps: true,
})

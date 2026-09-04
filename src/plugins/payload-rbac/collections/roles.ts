import type { CollectionConfig, Option } from 'payload'

import { permissionActions, type PermissionAction } from '../access'
import { buildSuperAdminCollectionAccess } from './collectionAccess'

type RolesCollectionOptions = {
  collectionOptions: Option[]
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
  collectionOptions,
}: RolesCollectionOptions): CollectionConfig => ({
  slug: 'roles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
  },
  access: buildSuperAdminCollectionAccess(),
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
          relationTo: 'access-tags',
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

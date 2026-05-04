import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated, buildSuperAdminCollectionAccess } from './collectionAccess'

type AccessTagsCollectionOptions = {
  slug: string
  superAdminField: string
}

export const buildAccessTagsCollection = ({
  slug,
  superAdminField,
}: AccessTagsCollectionOptions): CollectionConfig => ({
  slug,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: 'Tags used to scope document mutation access.',
  },
  access: buildSuperAdminCollectionAccess(superAdminField, { read: authenticated }),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
    },
    slugField({
      fieldToUse: 'name',
    }),
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Optional notes to clarify what this tag is for.',
      },
    },
  ],
  timestamps: true,
})

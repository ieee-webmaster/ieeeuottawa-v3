import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated, buildSuperAdminCollectionAccess } from './collectionAccess'

export const buildAccessTagsCollection = (): CollectionConfig => ({
  slug: 'access-tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: 'Tags used to scope document mutation access.',
  },
  access: buildSuperAdminCollectionAccess({ read: authenticated }),
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

import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'googleId',
      type: 'text',
      unique: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}

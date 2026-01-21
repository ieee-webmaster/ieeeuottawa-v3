import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      label: 'Team Name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
        name: 'coverImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Cover Image',
    },
    {
      name: 'positions',
      label: 'Positions',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'exec' },
            { label: 'Commissioner', value: 'commish' },
            { label: 'Coordinator', value: 'coord' },
          ],
        },
        {
          name: 'positionTitle',
          type: 'text',
          required: true,
          label: 'Position Title',
        },
      ],
    },
  ],
}
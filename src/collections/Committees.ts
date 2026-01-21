import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const Committees: CollectionConfig = {
  slug: 'committee',
  admin: {
    useAsTitle: 'Year',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'Year',
      type: 'text',
      required: true,
    },
    {
      name: 'teams',
      type: 'array',
      label: 'Teams',
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: 'Team',
        },
        {
          name: 'members',
          type: 'array',
          label: 'Members',
          fields: [
            {
              name: 'role',
              type: 'text',
              required: true,
              label: 'Position Title',
              admin: {
                description: 'Select a position from the selected team',
                components: {
                  Field: '/components/CommitteePositionSelect#CommitteePositionSelect',
                },
              },
            },
            {
              name: 'person',
              type: 'relationship',
              relationTo: 'people',
              required: true,
              label: 'Person',
            },
          ],
        },
      ],
    },
  ],
}

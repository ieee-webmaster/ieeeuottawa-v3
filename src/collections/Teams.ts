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
      label: {
        en: 'Team Name',
        fr: 'Nom de l equipe',
      },
      type: 'text',
      localized: true,
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
          label: {
            en: 'Role',
            fr: 'Role',
          },
          options: [
            {
              label: {
                en: 'Executive',
                fr: 'Executif',
              },
              value: 'exec',
            },
            {
              label: {
                en: 'Commissioner',
                fr: 'Commissaire',
              },
              value: 'commish',
            },
            {
              label: {
                en: 'Coordinator',
                fr: 'Coordonnateur',
              },
              value: 'coord',
            },
          ],
        },
        {
          name: 'positionTitle',
          type: 'text',
          localized: true,
          required: true,
          label: {
            en: 'Position Title',
            fr: 'Titre du poste',
          },
        },
      ],
    },
  ],
}

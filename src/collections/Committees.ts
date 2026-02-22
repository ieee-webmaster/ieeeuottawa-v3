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
      unique: true, // ensures its unique
      index: true, // perf boost
      label: {
        en: 'Year',
        fr: 'Annee',
      },
    },
    {
      name: 'teams',
      type: 'array',
      label: {
        en: 'Teams',
        fr: 'Equipes',
      },
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: {
            en: 'Team',
            fr: 'Equipe',
          },
        },
        {
          name: 'members',
          type: 'array',
          label: {
            en: 'Members',
            fr: 'Membres',
          },
          fields: [
            {
              name: 'role',
              type: 'text',
              localized: true,
              required: true,
              label: {
                en: 'Position Title',
                fr: 'Titre du poste',
              },
              admin: {
                description: {
                  en: 'Select a position from the selected team',
                  fr: 'Selectionnez un poste de l equipe choisie',
                },
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
              label: {
                en: 'Person',
                fr: 'Personne',
              },
            },
          ],
        },
      ],
    },
  ],
}

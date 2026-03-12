import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

const getTeamName = (
  value: null | Record<string, string> | string | undefined,
  locale?: string,
): null | string => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (locale && value[locale]) {
    return value[locale]
  }

  return Object.values(value)[0] ?? null
}

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
    },
    {
      name: 'teams',
      type: 'array',
      label: 'Teams',
      admin: {
        components: {
          RowLabel: '@/components/CommitteeTeamRowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          label: 'Team',
          hooks: {
            beforeChange: [
              async ({ req, siblingData, value }) => {
                if (!value) {
                  siblingData.teamLabel = ''
                  return value
                }

                const team = await req.payload.findByID({
                  collection: 'teams',
                  id: String(value),
                  depth: 0,
                  overrideAccess: false,
                  req,
                })

                siblingData.teamLabel = getTeamName(team.name, req.locale) || ''

                return value
              },
            ],
          },
        },
        {
          name: 'teamLabel',
          type: 'text',
          admin: {
            hidden: true,
            readOnly: true,
          },
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

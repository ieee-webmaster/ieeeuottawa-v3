import type { Block } from 'payload'

export const CommitteeTeamMembers: Block = {
  slug: 'committeeTeamMembers',
  interfaceName: 'CommitteeTeamMembersBlock',
  imageURL: '/admin/block-previews/committee-team-members.svg',
  imageAltText: 'Committee Team Members block preview',
  fields: [
    {
      name: 'committee',
      type: 'relationship',
      relationTo: 'committee',
      required: true,
      label: 'Committee Year',
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      label: 'Team',
    },
  ],
  labels: {
    plural: 'Committee Team Members',
    singular: 'Committee Team Members',
  },
}

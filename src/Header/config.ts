import type { GlobalConfig } from 'payload'

import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'socialLinks',
      type: 'relationship',
      relationTo: 'socialLinks',
      hasMany: true,
      admin: {
        description: 'Choose which social links to show in the header.',
      },
    },
    {
      name: 'showSocialLinkLabels',
      type: 'checkbox',
      label: 'Show social labels in header',
      defaultValue: false,
      admin: {
        description: 'Show each social platform name next to its icon on desktop.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}

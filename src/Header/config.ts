import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
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

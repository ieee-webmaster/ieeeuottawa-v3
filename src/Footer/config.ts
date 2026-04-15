import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
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
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'socialLinks',
      type: 'relationship',
      relationTo: 'socialLinks',
      hasMany: true,
      admin: {
        description: 'Choose which social links to show in the footer.',
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      localized: true,
      admin: {
        description: 'Phone number shown in the footer.',
      },
    },
    {
      name: 'contactLocation',
      type: 'text',
      label: 'Address / Location',
      localized: true,
      admin: {
        description: 'Address or location text shown in the footer.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}

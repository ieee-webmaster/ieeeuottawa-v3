import type { GlobalConfig } from 'payload'

import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
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

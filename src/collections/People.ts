import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const People: CollectionConfig = {
  slug: 'people',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'First Name',
      type: 'text',
      required: true,
    },
    {
      name: 'Last Name',
      type: 'text',
      required: true,
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'Contact Email',
      type: 'email',
    },
    {
      name: 'Linkedin Profile',
      type: 'text',
    },
  ],
}

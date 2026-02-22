import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const People: CollectionConfig = {
  slug: 'people',
  folders: true,
  admin: {
    useAsTitle: 'fullName',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'fullName',
      label: {
        en: 'Full Name',
        fr: 'Nom complet',
      },
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
      label: {
        en: 'Contact Email',
        fr: 'Courriel de contact',
      },
    },
    {
      name: 'Linkedin Profile',
      type: 'text',
      label: {
        en: 'LinkedIn Profile',
        fr: 'Profil LinkedIn',
      },
    },
  ],
}

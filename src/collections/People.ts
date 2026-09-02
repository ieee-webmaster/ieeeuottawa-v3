import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import {
  buildPublicCacheAfterChange,
  buildPublicCacheAfterDelete,
} from '@/hooks/revalidatePublicContent'
import { PUBLIC_CACHE_TAGS } from '@/utilities/publicCache'

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
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'Linkedin Profile',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [buildPublicCacheAfterChange(PUBLIC_CACHE_TAGS.committee)],
    afterDelete: [buildPublicCacheAfterDelete(PUBLIC_CACHE_TAGS.committee)],
  },
}

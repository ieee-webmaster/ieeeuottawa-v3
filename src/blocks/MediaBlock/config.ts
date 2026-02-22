import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    singular: {
      en: 'Media Block',
      fr: 'Bloc media',
    },
    plural: {
      en: 'Media Blocks',
      fr: 'Blocs media',
    },
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

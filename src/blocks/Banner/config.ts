import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      options: [
        {
          label: {
            en: 'Info',
            fr: 'Info',
          },
          value: 'info',
        },
        {
          label: {
            en: 'Warning',
            fr: 'Avertissement',
          },
          value: 'warning',
        },
        {
          label: {
            en: 'Error',
            fr: 'Erreur',
          },
          value: 'error',
        },
        {
          label: {
            en: 'Success',
            fr: 'Succes',
          },
          value: 'success',
        },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}

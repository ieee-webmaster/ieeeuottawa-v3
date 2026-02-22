import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: {
          en: 'One Third',
          fr: 'Un tiers',
        },
        value: 'oneThird',
      },
      {
        label: {
          en: 'Half',
          fr: 'Moitie',
        },
        value: 'half',
      },
      {
        label: {
          en: 'Two Thirds',
          fr: 'Deux tiers',
        },
        value: 'twoThirds',
      },
      {
        label: {
          en: 'Full',
          fr: 'Plein',
        },
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    localized: true,
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: {
      en: 'Content',
      fr: 'Contenu',
    },
    plural: {
      en: 'Content Blocks',
      fr: 'Blocs de contenu',
    },
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}

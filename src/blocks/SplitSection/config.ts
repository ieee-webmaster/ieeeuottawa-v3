import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const SplitSection: Block = {
  slug: 'splitSection',
  interfaceName: 'SplitSectionBlock',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
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
      required: true,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'right',
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
          required: true,
        },
        {
          name: 'mediaAspect',
          type: 'select',
          defaultValue: 'landscape',
          options: [
            {
              label: 'Portrait',
              value: 'portrait',
            },
            {
              label: 'Square',
              value: 'square',
            },
            {
              label: 'Landscape',
              value: 'landscape',
            },
            {
              label: 'Wide',
              value: 'wide',
            },
          ],
          required: true,
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'default',
          options: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Muted',
              value: 'muted',
            },
            {
              label: 'Accent',
              value: 'accent',
            },
            {
              label: 'Dark',
              value: 'dark',
            },
          ],
          required: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'Split Sections',
    singular: 'Split Section',
  },
}

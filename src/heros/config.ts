import type { Field, GroupField } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

const imageFraming = (name: 'desktop' | 'mobile', label: string): GroupField => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'x',
          type: 'number',
          label: 'Horizontal position (%)',
          defaultValue: 50,
          min: 0,
          max: 100,
          admin: { width: '33%', step: 1, description: '0 = left, 50 = centre, 100 = right.' },
        },
        {
          name: 'y',
          type: 'number',
          label: 'Vertical position (%)',
          defaultValue: 50,
          min: 0,
          max: 100,
          admin: { width: '33%', step: 1, description: '0 = top, 50 = centre, 100 = bottom.' },
        },
        {
          name: 'zoom',
          type: 'number',
          label: 'Zoom (%)',
          defaultValue: 100,
          min: 100,
          max: 200,
          admin: {
            width: '33%',
            step: 1,
            description: '100 = fill the frame. Zoom in to give positioning more room.',
          },
        },
      ],
    },
  ],
})

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Affinity Group',
          value: 'affinityGroup',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      localized: true,
    },
    linkGroup({
      overrides: {
        maxRows: 4,
      },
    }),
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (Affinity Group Only)',
      admin: {
        condition: (_, { type } = {}) => type === 'affinityGroup',
      },
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) =>
          type === 'highImpact' || type === 'mediumImpact' || type === 'affinityGroup',
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'group',
      label: 'Image framing',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'highImpact',
        description:
          'Adjust this hero without changing the original media. Check both Desktop and Mobile in Live Preview; positioning moves the part of the image that is cropped.',
      },
      fields: [imageFraming('desktop', 'Desktop'), imageFraming('mobile', 'Mobile')],
    },
  ],
  label: false,
}

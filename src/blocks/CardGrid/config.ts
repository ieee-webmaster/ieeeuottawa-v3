import type { Block, Field } from 'payload'

import { link } from '@/fields/link'

const cardFields: Field[] = [
  {
    name: 'kicker',
    type: 'text',
  },
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.enableLink),
      },
    },
  }),
]

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
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
      name: 'description',
      type: 'textarea',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          options: [
            {
              label: 'Two',
              value: '2',
            },
            {
              label: 'Three',
              value: '3',
            },
            {
              label: 'Four',
              value: '4',
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
    {
      name: 'cards',
      type: 'array',
      fields: cardFields,
      minRows: 1,
      required: true,
    },
  ],
  labels: {
    plural: 'Card Grids',
    singular: 'Card Grid',
  },
}

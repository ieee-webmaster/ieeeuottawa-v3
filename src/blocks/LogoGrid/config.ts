import type { Block, Field } from 'payload'

import { link } from '@/fields/link'

const logoItemFields: Field[] = [
  {
    name: 'name',
    type: 'text',
    required: true,
  },
  {
    name: 'logo',
    type: 'upload',
    relationTo: 'media',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
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

export const LogoGrid: Block = {
  slug: 'logoGrid',
  interfaceName: 'LogoGridBlock',
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
          name: 'style',
          type: 'select',
          defaultValue: 'grid',
          options: [
            {
              label: 'Grid',
              value: 'grid',
            },
            {
              label: 'Featured',
              value: 'featured',
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
      name: 'items',
      type: 'array',
      fields: logoItemFields,
      minRows: 1,
      required: true,
    },
  ],
  labels: {
    plural: 'Logo Grids',
    singular: 'Logo Grid',
  },
}

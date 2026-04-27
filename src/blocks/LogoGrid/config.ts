import type { Block, Field } from 'payload'

import { themeField } from '@/blocks/theme'
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
        themeField(),
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

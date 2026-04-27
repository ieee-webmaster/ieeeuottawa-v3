import type { Block, Field } from 'payload'

import { themeField } from '@/blocks/theme'
import { link } from '@/fields/link'

const quickLinkFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  link(),
]

export const QuickLinks: Block = {
  slug: 'quickLinks',
  interfaceName: 'QuickLinksBlock',
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
          defaultValue: 'cards',
          options: [
            {
              label: 'Cards',
              value: 'cards',
            },
            {
              label: 'List',
              value: 'list',
            },
          ],
          required: true,
        },
        themeField(),
      ],
    },
    {
      name: 'links',
      type: 'array',
      fields: quickLinkFields,
      minRows: 1,
      required: true,
    },
  ],
  labels: {
    plural: 'Quick Links',
    singular: 'Quick Links',
  },
}

import type { Block, Field } from 'payload'

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

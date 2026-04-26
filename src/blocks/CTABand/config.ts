import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'

export const CTABand: Block = {
  slug: 'ctaBand',
  interfaceName: 'CTABandBlock',
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
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
    {
      type: 'row',
      fields: [
        {
          name: 'alignment',
          type: 'select',
          defaultValue: 'left',
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Center',
              value: 'center',
            },
          ],
          required: true,
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'accent',
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
    plural: 'CTA Bands',
    singular: 'CTA Band',
  },
}

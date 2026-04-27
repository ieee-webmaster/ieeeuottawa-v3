import type { Block } from 'payload'

import { themeField } from '@/blocks/theme'
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
        themeField('accent'),
      ],
    },
  ],
  labels: {
    plural: 'CTA Bands',
    singular: 'CTA Band',
  },
}

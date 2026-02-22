import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      options: [
        {
          label: {
            en: 'Typescript',
            fr: 'Typescript',
          },
          value: 'typescript',
        },
        {
          label: {
            en: 'Javascript',
            fr: 'Javascript',
          },
          value: 'javascript',
        },
        {
          label: {
            en: 'CSS',
            fr: 'CSS',
          },
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
  labels: {
    singular: {
      en: 'Code',
      fr: 'Code',
    },
    plural: {
      en: 'Code Blocks',
      fr: 'Blocs de code',
    },
  },
}

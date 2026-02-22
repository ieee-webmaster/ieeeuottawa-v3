import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: {
        en: 'Enable Intro Content',
        fr: 'Activer le contenu d introduction',
      },
    },
    {
      name: 'introContent',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
      label: {
        en: 'Intro Content',
        fr: 'Contenu d introduction',
      },
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: {
      en: 'Form Blocks',
      fr: 'Blocs de formulaire',
    },
    singular: {
      en: 'Form Block',
      fr: 'Bloc de formulaire',
    },
  },
}

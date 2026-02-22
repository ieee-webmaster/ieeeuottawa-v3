import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      localized: true,
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
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: {
            en: 'Collection',
            fr: 'Collection',
          },
          value: 'collection',
        },
        {
          label: {
            en: 'Individual Selection',
            fr: 'Selection individuelle',
          },
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: {
        en: 'Collections To Show',
        fr: 'Collections a afficher',
      },
      options: [
        {
          label: {
            en: 'Posts',
            fr: 'Articles',
          },
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: {
        en: 'Categories To Show',
        fr: 'Categories a afficher',
      },
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: {
        en: 'Limit',
        fr: 'Limite',
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        en: 'Selection',
        fr: 'Selection',
      },
      relationTo: ['posts'],
    },
  ],
  labels: {
    plural: {
      en: 'Archives',
      fr: 'Archives',
    },
    singular: {
      en: 'Archive',
      fr: 'Archive',
    },
  },
}

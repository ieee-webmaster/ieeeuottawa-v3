import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const Docs: CollectionConfig = {
  slug: 'docs',
  admin: {
    useAsTitle: 'year',
    defaultColumns: ['year', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'year',
      label: {
        en: 'Year',
        fr: 'Année',
      },
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'The academic year for these documents (e.g., 2024-2025)',
          fr: "L'année académique pour ces documents (ex. : 2024-2025)",
        },
      },
    },
    {
      name: 'generalDocuments',
      type: 'array',
      label: {
        en: 'General Documents',
        fr: 'Documents généraux',
      },
      admin: {
        description: {
          en: 'General documents, bylaws, constitutions, etc.',
          fr: 'Documents généraux, règlements, constitutions, etc.',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: {
            en: 'Document Name',
            fr: 'Nom du document',
          },
          required: true,
          admin: {
            description: {
              en: 'Name of the document (e.g., "IEEE Constitution")',
              fr: 'Nom du document (ex.: "Constitution IEEE")',
            },
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Description',
            fr: 'Description',
          },
          admin: {
            description: {
              en: 'Optional description of the document',
              fr: 'Description optionnelle du document',
            },
          },
        },
        {
          name: 'googleDocsUrl',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'meetingMinutes',
      type: 'array',
      label: {
        en: 'Meeting Minutes',
        fr: 'Procès-verbaux',
      },
      admin: {
        description: {
          en: 'Meeting minutes and agendas',
          fr: 'Procès-verbaux et ordres du jour',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: {
            en: 'Meeting Name',
            fr: 'Nom de la réunion',
          },
          required: true,
          admin: {
            description: {
              en: 'Name of the meeting (e.g., "General Meeting - October 2024")',
              fr: 'Nom de la réunion (ex. : "Réunion générale - Octobre 2024")',
            },
          },
        },
        {
          name: 'meetingDate',
          type: 'date',
          label: {
            en: 'Meeting Date',
            fr: 'Date de réunion',
          },
          admin: {
            description: {
              en: 'Date the meeting took place',
              fr: 'Date de la réunion',
            },
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Description',
            fr: 'Description',
          },
          admin: {
            description: {
              en: 'Optional description or summary of the meeting',
              fr: 'Description ou résumé optionnel de la réunion',
            },
          },
        },
        {
          name: 'googleDocsUrl',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'otherDocuments',
      type: 'array',
      label: {
        en: 'Other Documents',
        fr: 'Autres documents',
      },
      admin: {
        description: {
          en: "Any other documents that don't fit into the above categories",
          fr: 'Tout autre document qui ne correspond pas aux catégories ci-dessus',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: {
            en: 'Document Name',
            fr: 'Nom du document',
          },
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Description',
            fr: 'Description',
          },
          admin: {
            description: {
              en: 'Optional description of the document',
              fr: 'Description optionnelle du document',
            },
          },
        },
        {
          name: 'googleDocsUrl',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

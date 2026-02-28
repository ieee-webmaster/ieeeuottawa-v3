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
      label: 'Year',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'The academic year for these documents (e.g., 2024-2025)',
      },
    },
    {
      name: 'generalDocuments',
      type: 'array',
      label: 'General Documents',
      admin: {
        description: 'General documents, bylaws, constitutions, etc.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Document Name',
          required: true,
          localized: true,
          admin: {
            description: 'Name of the document (e.g., "IEEE Constitution")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
          admin: {
            description: 'Optional description of the document',
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
      label: 'Meeting Minutes',
      admin: {
        description: 'Meeting minutes and agendas',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Meeting Name',
          required: true,
          localized: true,
          admin: {
            description: 'Name of the meeting (e.g., "General Meeting - October 2024")',
          },
        },
        {
          name: 'meetingDate',
          type: 'date',
          label: 'Meeting Date',
          admin: {
            description: 'Date the meeting took place',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
          admin: {
            description: 'Optional description or summary of the meeting',
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
      label: 'Other Documents',
      admin: {
        description: "Any other documents that don't fit into the above categories",
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Document Name',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
          admin: {
            description: 'Optional description of the document',
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

import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const Committees: CollectionConfig = {
  slug: 'committee',
  admin: {
    useAsTitle: 'Year',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'Year',
      type: 'text',
      required: true,
    },
    {
      name: 'ieeePositions',
      type: 'array',
      label: 'IEEE Positions',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'exec' },
            { label: 'Commissioner', value: 'commish' },
            { label: 'Coordinator', value: 'coord' },
          ],
        },
        {
          name: 'positionTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'exec',
          },
          options: [
            { label: 'Chair', value: 'chair' },
            { label: 'Co-Chair', value: 'cochair' },
            { label: 'Vice-Chair', value: 'vicechair' },
            { label: 'Treasurer', value: 'treasurer' },
            { label: 'McNaughton Centre Director', value: 'mcndirector' },
            { label: 'Secretary', value: 'secretary' },
            { label: 'VP External', value: 'external' },
            { label: 'VP Academic', value: 'academic' },
            { label: 'VP Social', value: 'social' },
            { label: 'VP Equity', value: 'equity' },
            { label: 'VP Merchandising', value: 'merch' },
            { label: 'VP Communications', value: 'comms' },
            { label: 'Webmaster', value: 'webmaster' },
          ],
        },
        {
          name: 'commissionerTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'commish',
          },
          options: [
            { label: 'Commissioner of Electrical Engineering', value: 'ieee-elg-commish' },
            { label: 'Commissioner of Computer Engineering', value: 'ieee-ceg-commish' },
            { label: 'Commissioner of Software Engineering', value: 'ieee-seg-commish' },
            { label: 'Commissioner of Multidisciplinary Design', value: 'ieee-mdsc-commish' },
            { label: 'Commissioner of Computing Technology', value: 'ieee-comptech-commish' },
            { label: 'Commissioner of Design', value: 'ieee-design-commish' },
            { label: 'Commissioner of Translations', value: 'ieee-translations-commish' },
          ],
        },
        {
          name: 'coordinatorTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'coord',
          },
          options: [
            { label: 'First-Year Coordinator', value: 'ieee-first-year-coord' },
            { label: 'Media and Content Coordinator', value: 'ieee-media-coord' },
            { label: 'Industry Coordinator', value: 'ieee-industry-coord' },
            { label: 'Technical Coordinator', value: 'ieee-tech-coord' },
            { label: 'Software Technical Coordinator', value: 'ieee-sw-tech-coord' },
          ],
        },
        {
          name: 'people',
          type: 'relationship',
          relationTo: 'people',
          hasMany: true,
          label: 'People',
          admin: {
            description: 'Assign people to this position',
          },
        },
      ],
    },
    {
      name: 'mdscPositions',
      type: 'array',
      label: 'MDSC Positions',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'exec' },
            { label: 'Commissioner', value: 'commish' },
            { label: 'Coordinator', value: 'coord' },
          ],
        },
        {
          name: 'positionTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'exec',
          },
          options: [
            { label: 'Chair', value: 'mdsc-chair' },
            { label: 'Co-Chair', value: 'mdsc-cochair' },
            { label: 'Vice-Chair', value: 'mdsc-vicechair' },
            { label: 'VP Events', value: 'mdsc-events' },
            { label: 'VP Communications', value: 'mdsc-comms' },
          ],
        },
        {
          name: 'commissionerTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'commish',
          },
          options: [
            { label: 'Commissioner of Project Management', value: 'mdsc-pm' },
            { label: 'Commissioner of Education and Public Policy', value: 'mdsc-epp' },
            { label: 'Commissioner of Software Design', value: 'mdsc-swd' },
            { label: 'Commissioner of Sustainability', value: 'mdsc-sustain' },
            { label: 'First-Year Representative', value: 'mdsc-first-year-rep' },
          ],
        },
        {
          name: 'people',
          type: 'relationship',
          relationTo: 'people',
          hasMany: true,
          label: 'People',
          admin: {
            description: 'Assign people to this position',
          },
        },
      ],
    },
    {
      name: 'wiePositions',
      type: 'array',
      label: 'WIE Positions',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'exec' },
            { label: 'Commissioner', value: 'commish' },
            { label: 'Coordinator', value: 'coord' },
          ],
        },
        {
          name: 'positionTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'exec',
          },
          options: [
            { label: 'Chair', value: 'wie-chair' },
            { label: 'Co-Chair', value: 'wie-cochair' },
            { label: 'Vice-Chair', value: 'wie-vicechair' },
            { label: 'VP Finance', value: 'wie-finance' },
            { label: 'VP External', value: 'wie-external' },
            { label: 'VP Internal', value: 'wie-internal' },
          ],
        },
        {
          name: 'commissionerTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'commish',
          },
          options: [
            { label: 'Commissioner of Design', value: 'wie-design-commish' },
          ],
        },
        {
          name: 'people',
          type: 'relationship',
          relationTo: 'people',
          hasMany: true,
          label: 'People',
          admin: {
            description: 'Assign people to this position',
          },
        },
      ],
    },
    {
      name: 'cegscPositions',
      type: 'array',
      label: 'CEGSC Positions',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Executive', value: 'exec' },
            { label: 'Commissioner', value: 'commish' },
            { label: 'Coordinator', value: 'coord' },
          ],
        },
        {
          name: 'positionTitle',
          type: 'select',
          required: true,
          label: 'Position Title',
          admin: {
            condition: (_, siblingData) => siblingData?.role === 'exec',
          },
          options: [
            { label: 'Chair', value: 'cegsc-chair' },
            { label: 'Co-Chair', value: 'cegsc-cochair' },
            { label: 'Vice-Chair', value: 'cegsc-vicechair' },
            { label: 'VP Events', value: 'cegsc-events' },
            { label: 'VP Communications', value: 'cegsc-comms' },
          ],
        },
        {
          name: 'people',
          type: 'relationship',
          relationTo: 'people',
          hasMany: true,
          label: 'People',
          admin: {
            description: 'Assign people to this position',
          },
        },
      ],
    },
  ],
}

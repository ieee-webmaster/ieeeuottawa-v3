import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const Execs: CollectionConfig = {
  slug: 'execs',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'team',
      type: 'select',
      options: [
        {
          label: 'IEEE Executives',
          value: 'ieee',
        },
        {
          label: 'MDSC',
          value: 'mdsc',
        },
        {
          label: 'WIE',
          value: 'wie',
        },
        {
          label: 'CEGSC',
          value: 'cegsc',
        },
      ],
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Executive',
          value: 'exec',
        },
        {
          label: 'Commissioner',
          value: 'commish',
        },
        {
          label: 'Coordinator',
          value: 'coord',
        },
      ],
    },
    {
      name: 'IEEE Exec Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'ieee' && role === 'exec',
      },
      options: [
        {
          label: 'Chair',
          value: 'chair',
        },
        {
          label: 'Co-Chair',
          value: 'cochair',
        },
        {
          label: 'Vice-Chair',
          value: 'vicechair',
        },
        {
          label: 'Treasurer',
          value: 'treasurer',
        },
        {
          label: 'McNaughton Centre Director',
          value: 'mcndirector',
        },
        {
          label: 'Secretary',
          value: 'secretary',
        },
        {
          label: 'VP External',
          value: 'external',
        },
        {
          label: 'VP Academic',
          value: 'academic',
        },
        {
          label: 'VP Social',
          value: 'social',
        },
        {
          label: 'VP Equity',
          value: 'equity',
        },
        {
          label: 'VP Merchandising',
          value: 'merch',
        },
        { label: 'VP Communications', value: 'comms' },
        {
          label: 'Webmaster',
          value: 'webmaster',
        },
      ],
    },
    {
      name: 'IEEE Commissioner Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'ieee' && role === 'commish',
      },
      options: [
        {
          label: 'Commissioner of Electrical Engineering',
          value: 'ieee-elg-commish',
        },
        {
          label: 'Commissioner of Computer Engineering',
          value: 'ieee-ceg-commish',
        },
        {
          label: 'Commissioner of Software Engineering',
          value: 'ieee-seg-commish',
        },
        {
          label: 'Commissioner of Multidisciplinary Design',
          value: 'ieee-mdsc-commish',
        },
        {
          label: 'Commissioner of Computing Technology',
          value: 'ieee-comptech-commish',
        },
        {
          label: 'Commissioner of Design',
          value: 'ieee-design-commish',
        },
        {
          label: 'Commissioner of Translations',
          value: 'ieee-translations-commish',
        },
      ],
    },
    {
      name: 'IEEE Coordinator Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'ieee' && role === 'coord',
      },
      options: [
        {
          label: 'First-Year Coordinator',
          value: 'ieee-first-year-coord',
        },
        {
          label: 'Media and Content Coordinator',
          value: 'ieee-media-coord',
        },
        {
          label: 'Industry Coordinator',
          value: 'ieee-industry-coord',
        },
        {
          label: 'Technical Coordinator',
          value: 'ieee-tech-coord',
        },
        {
          label: 'Software Technical Coordinator',
          value: 'ieee-sw-tech-coord',
        },
      ],
    },
    {
      name: 'WIE Exec Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'wie' && role === 'exec',
      },
      options: [
        {
          label: 'Chair',
          value: 'wie-chair',
        },
        {
          label: 'Co-Chair',
          value: 'wie-cochair',
        },
        {
          label: 'Vice-Chair',
          value: 'wie-vicechair',
        },
        {
          label: 'VP Finance',
          value: 'wie-finance',
        },
        {
          label: 'VP External',
          value: 'wie-external',
        },
        {
          label: 'VP Internal',
          value: 'wie-internal',
        },
      ],
    },
    {
      name: 'WIE Commissioner Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'wie' && role === 'commish',
      },
      options: [
        {
          label: 'Commissioner of Design',
          value: 'wie-design-commish',
        },
      ],
    },
    {
      name: 'MDSC Exec Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'mdsc' && role === 'exec',
      },
      options: [
        {
          label: 'Chair',
          value: 'mdsc-chair',
        },
        {
          label: 'Co-Chair',
          value: 'mdsc-cochair',
        },
        {
          label: 'Vice-Chair',
          value: 'mdsc-vicechair',
        },
        {
          label: 'VP Events',
          value: 'mdsc-events',
        },

        {
          label: 'VP Communications',
          value: 'mdsc-comms',
        },
      ],
    },
    {
      name: 'MDSC Commissioner Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'mdsc' && role === 'commish',
      },
      options: [
        {
          label: 'Commissioner of Project Management',
          value: 'mdsc-pm',
        },
        {
          label: 'Commissioner of Education and Public Policy',
          value: 'mdsc-epp',
        },
        {
          label: 'Commissioner of Software Design',
          value: 'mdsc-swd',
        },
        {
          label: 'Commissioner of Sustainability ',
          value: 'mdsc-sustain',
        },
        {
          label: 'First-Year Representative',
          value: 'mdsc-first-year-rep',
        },
      ],
    },
    {
      name: 'CEGSC Exec Position',
      type: 'select',
      admin: {
        condition: (_, { team, role }) => team === 'cegsc' && role === 'exec',
      },
      options: [
        {
          label: 'Chair',
          value: 'cegsc-chair',
        },
        {
          label: 'Co-Chair',
          value: 'cegsc-cochair',
        },
        {
          label: 'Vice-Chair',
          value: 'cegsc-vicechair',
        },
        {
          label: 'VP Events',
          value: 'cegsc-events',
        },

        {
          label: 'VP Communications',
          value: 'cegsc-comms',
        },
      ],
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'Contact Email',
      type: 'email',
    },
    {
      name: 'Linkedin Profile',
      type: 'text',
    },
  ],
}

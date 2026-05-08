import type { ArrayField, Field } from 'payload'

import { link } from '@/fields/link'

const COMPONENT_PATH = '@/plugins/payload-navigation/components'

type BuildArgs = {
  allowedCollections: string[]
}

const toTitleCase = (value: string): string =>
  value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const isLinkRow = (sib: { kind?: unknown }) => sib?.kind !== 'dropdown'
const isDropdownRow = (sib: { kind?: unknown }) => sib?.kind === 'dropdown'
const isManualDropdown = (sib: { kind?: unknown; dropdownMode?: unknown }) =>
  sib?.kind === 'dropdown' && sib?.dropdownMode !== 'automatic'
const isAutoDropdown = (sib: { kind?: unknown; dropdownMode?: unknown }) =>
  sib?.kind === 'dropdown' && sib?.dropdownMode === 'automatic'

const linkField = (): Field => {
  const base = link({ appearances: false }) as Field & {
    admin?: Record<string, unknown>
  }
  return {
    ...base,
    admin: {
      ...(base.admin ?? {}),
      condition: (_, sib) => isLinkRow(sib as { kind?: unknown }),
    },
  } as Field
}

export const buildNavItemsField = ({ allowedCollections }: BuildArgs): ArrayField => {
  const collectionOptions = allowedCollections.map((slug) => ({
    label: toTitleCase(slug),
    value: slug,
  }))

  const urlDescription = {
    components: {
      Description: `${COMPONENT_PATH}/UrlInferenceHint#UrlInferenceDescription`,
    },
  }

  return {
    name: 'navItems',
    type: 'array',
    maxRows: 6,
    admin: {
      initCollapsed: true,
      components: {
        RowLabel: `${COMPONENT_PATH}/NavItemRowLabel#NavItemRowLabel`,
      },
    },
    fields: [
      {
        name: 'kind',
        type: 'radio',
        defaultValue: 'link',
        options: [
          { label: 'Link', value: 'link' },
          { label: 'Dropdown', value: 'dropdown' },
        ],
        admin: { layout: 'horizontal' },
      },
      linkField(),
      {
        name: 'dropdownLabel',
        type: 'text',
        localized: true,
        required: true,
        admin: {
          description: 'Label shown for the dropdown trigger.',
          condition: (_, sib) => isDropdownRow(sib as { kind?: unknown }),
        },
      },
      {
        name: 'dropdownMode',
        type: 'radio',
        defaultValue: 'manual',
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Automatic', value: 'automatic' },
        ],
        admin: {
          layout: 'horizontal',
          condition: (_, sib) => isDropdownRow(sib as { kind?: unknown }),
        },
      },
      {
        name: 'manualItems',
        type: 'array',
        labels: { singular: 'Dropdown link', plural: 'Dropdown links' },
        admin: {
          initCollapsed: true,
          condition: (_, sib) =>
            isManualDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
        },
        fields: [link({ appearances: false })],
      },
      {
        name: 'collection',
        type: 'select',
        options: collectionOptions,
        admin: {
          description: 'Collection to scan for dropdown values.',
          condition: (_, sib) => isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
        },
      },
      {
        name: 'field',
        type: 'text',
        admin: {
          description: 'Field whose distinct values become the dropdown entries.',
          condition: (_, sib) =>
            isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }) &&
            Boolean((sib as { collection?: unknown }).collection),
          components: {
            Field: `${COMPONENT_PATH}/AutoFieldSelect#AutoFieldSelect`,
          },
        },
      },
      {
        name: 'order',
        type: 'radio',
        defaultValue: 'asc',
        options: [
          { label: 'Original', value: 'asc' },
          { label: 'Reversed', value: 'desc' },
        ],
        admin: {
          layout: 'horizontal',
          condition: (_, sib) => isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
        },
      },
      {
        type: 'row',
        admin: {
          condition: (_, sib) => isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
        },
        fields: [
          {
            name: 'baseUrl',
            label: 'Base URL',
            type: 'text',
            admin: {
              width: '50%',
              ...urlDescription,
            },
          },
          {
            name: 'specificUrl',
            label: 'Specific URL',
            type: 'text',
            admin: {
              width: '50%',
              ...urlDescription,
            },
          },
        ],
      },
      {
        name: 'autoNewTab',
        type: 'ui',
        admin: {
          condition: (_, sib) => isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
          components: {
            Field: `${COMPONENT_PATH}/AutoFieldSelect#AutoNewTabCheckbox`,
          },
        },
      },
      {
        name: 'includeAll',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'Include an "All" link as the first dropdown entry.',
          condition: (_, sib) => isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }),
        },
      },
      {
        name: 'allLabel',
        type: 'text',
        localized: true,
        defaultValue: 'All',
        admin: {
          description: 'Label for the "All" link.',
          condition: (_, sib) =>
            isAutoDropdown(sib as { kind?: unknown; dropdownMode?: unknown }) &&
            Boolean((sib as { includeAll?: unknown }).includeAll),
        },
      },
    ],
  }
}

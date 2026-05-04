import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { createElement } from 'react'

import { autoArrayRowLabelsPlugin } from '../../src/plugins/payload-row-labels'

const rowLabelHookState: {
  path: string
  rowNumber: number
  fields: Record<string, { value: unknown }>
} = {
  path: '',
  rowNumber: 0,
  fields: {},
}

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useFormFields: (selector: (state: [Record<string, { value: unknown }>]) => unknown) =>
    selector([rowLabelHookState.fields]),
  useLocale: () => ({ code: 'en' }),
  useRowLabel: () => ({
    path: rowLabelHookState.path,
    rowNumber: rowLabelHookState.rowNumber,
    data: {},
  }),
}))

type RowLabelConfig = {
  clientProps?: {
    candidates?: Array<Record<string, unknown>>
    fallbackPrefix?: string
  }
  exportName?: string
  path?: string
}

type TestField = {
  admin?: {
    components?: {
      RowLabel?: RowLabelConfig | string
    }
  }
  fields?: TestField[]
  label?: string
  name?: string
  type: string
}

type TestCollection = {
  admin?: {
    useAsTitle?: string
  }
  fields: TestField[]
  labels?: {
    singular?: string
  }
  slug: string
}

const applyPlugin = (collections: TestCollection[]) => {
  const plugin = autoArrayRowLabelsPlugin()
  return plugin({ collections } as never) as { collections: TestCollection[] }
}

const getRowLabel = (field: TestField): RowLabelConfig => {
  const rowLabel = field.admin?.components?.RowLabel
  expect(rowLabel).toBeTypeOf('object')
  return rowLabel as RowLabelConfig
}

describe('autoArrayRowLabelsPlugin', () => {
  it('adds a reusable RowLabel component to array fields with value labels', () => {
    const result = applyPlugin([
      {
        slug: 'teams',
        fields: [
          {
            name: 'positions',
            type: 'array',
            label: 'Positions',
            fields: [{ name: 'positionTitle', type: 'text' }],
          },
        ],
      },
    ])

    const positions = result.collections[0].fields[0]
    const rowLabel = getRowLabel(positions)

    expect(rowLabel.path).toBe('@/plugins/payload-row-labels/AutoArrayRowLabel')
    expect(rowLabel.exportName).toBe('AutoArrayRowLabel')
    expect(rowLabel.clientProps?.fallbackPrefix).toBe('Position')
    expect(rowLabel.clientProps?.candidates?.[0]).toMatchObject({
      kind: 'value',
      path: 'positionTitle',
    })
  })

  it('uses relationship labels before scalar fields for nested array rows', () => {
    const result = applyPlugin([
      {
        slug: 'people',
        labels: { singular: 'Person' },
        admin: { useAsTitle: 'fullName' },
        fields: [{ name: 'fullName', type: 'text' }],
      },
      {
        slug: 'committee',
        fields: [
          {
            name: 'teams',
            type: 'array',
            fields: [
              {
                name: 'members',
                type: 'array',
                fields: [
                  { name: 'role', type: 'text' },
                  { name: 'person', type: 'relationship', relationTo: 'people' } as TestField,
                ],
              },
            ],
          },
        ],
      },
    ])

    const members = result.collections[1].fields[0].fields?.[0]
    expect(members).toBeDefined()

    const rowLabel = getRowLabel(members as TestField)
    expect(rowLabel.clientProps?.candidates?.[0]).toMatchObject({
      fallbackPrefix: 'Person',
      kind: 'relationship',
      labelField: 'fullName',
      path: 'person',
      relationTo: 'people',
    })
  })

  it('passes select option labels for enum-like array rows', () => {
    const result = applyPlugin([
      {
        slug: 'roles',
        fields: [
          {
            name: 'collectionPermissions',
            type: 'array',
            fields: [
              {
                name: 'collection',
                type: 'select',
                options: [{ label: 'People', value: 'people' }],
              } as TestField,
              { name: 'actions', type: 'select', options: ['create', 'update'] } as TestField,
            ],
          },
        ],
      },
    ])

    const rowLabel = getRowLabel(result.collections[0].fields[0])
    expect(rowLabel.clientProps?.candidates?.[0]).toMatchObject({
      kind: 'value',
      options: { people: 'People' },
      path: 'collection',
    })
  })

  it('preserves manually configured row labels by default', () => {
    const result = applyPlugin([
      {
        slug: 'teams',
        fields: [
          {
            name: 'positions',
            type: 'array',
            admin: { components: { RowLabel: '@/custom/RowLabel#RowLabel' } },
            fields: [{ name: 'positionTitle', type: 'text' }],
          },
        ],
      },
    ])

    expect(result.collections[0].fields[0].admin?.components?.RowLabel).toBe(
      '@/custom/RowLabel#RowLabel',
    )
  })
})

describe('AutoArrayRowLabel render', () => {
  beforeEach(() => {
    rowLabelHookState.path = 'committees.0.teams.0.members.0'
    rowLabelHookState.rowNumber = 0
    rowLabelHookState.fields = {}
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('falls back to the active relationship candidate prefix while the remote label is loading', async () => {
    rowLabelHookState.fields = {
      'committees.0.teams.0.members.0.person': { value: 42 },
    }
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    const { AutoArrayRowLabel } = await import(
      '../../src/plugins/payload-row-labels/AutoArrayRowLabel'
    )

    const { container } = render(
      createElement(AutoArrayRowLabel, {
        candidates: [
          {
            kind: 'relationship',
            path: 'person',
            relationTo: 'people',
            fallbackPrefix: 'Person',
            labelField: 'fullName',
          },
        ],
        fallbackPrefix: 'Member',
        path: 'committees.0.teams.0.members.0',
      }),
    )

    expect(container.textContent).toBe('Person 01')
  })

  it('falls back to the array prefix when no candidate matches', async () => {
    rowLabelHookState.fields = {}
    vi.stubGlobal('fetch', vi.fn())

    const { AutoArrayRowLabel } = await import(
      '../../src/plugins/payload-row-labels/AutoArrayRowLabel'
    )

    const { container } = render(
      createElement(AutoArrayRowLabel, {
        candidates: [
          {
            kind: 'relationship',
            path: 'person',
            relationTo: 'people',
            fallbackPrefix: 'Person',
          },
        ],
        fallbackPrefix: 'Member',
        path: 'committees.0.teams.0.members.0',
      }),
    )

    expect(container.textContent).toBe('Member 01')
  })

  it('uses the remote label once the fetch resolves', async () => {
    rowLabelHookState.fields = {
      'committees.0.teams.0.members.0.person': { value: 42 },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ fullName: 'Ada Lovelace' }),
      })),
    )

    const { AutoArrayRowLabel } = await import(
      '../../src/plugins/payload-row-labels/AutoArrayRowLabel'
    )

    const { container } = render(
      createElement(AutoArrayRowLabel, {
        candidates: [
          {
            kind: 'relationship',
            path: 'person',
            relationTo: 'people',
            fallbackPrefix: 'Person',
            labelField: 'fullName',
          },
        ],
        fallbackPrefix: 'Member',
        path: 'committees.0.teams.0.members.0',
      }),
    )

    await waitFor(() => expect(container.textContent).toBe('Ada Lovelace'))
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'

import type { CollectionConfig, Field } from 'payload'
import { testConfig } from '../helpers/payload'

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

const applyPlugin = async (collections: CollectionConfig[]) => {
  const result = await autoArrayRowLabelsPlugin()({ ...testConfig, collections })
  return result.collections ?? []
}

const getArray = (field: Field | undefined) => {
  if (field?.type !== 'array') throw new Error('Expected an array field')
  return field
}

const getRowLabel = (field: Field | undefined) => {
  const rowLabel = getArray(field).admin?.components?.RowLabel
  if (!rowLabel || typeof rowLabel !== 'object') throw new Error('Expected RowLabel configuration')
  return rowLabel
}

describe('autoArrayRowLabelsPlugin', () => {
  it('adds a reusable RowLabel component to array fields with value labels', async () => {
    const result = await applyPlugin([
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

    const positions = result[0]?.fields[0]
    const rowLabel = getRowLabel(positions)

    expect(rowLabel.path).toBe('@/plugins/payload-row-labels/AutoArrayRowLabel')
    expect(rowLabel.exportName).toBe('AutoArrayRowLabel')
    expect(rowLabel.clientProps).toMatchObject({
      fallbackPrefix: 'Position',
      candidates: [{ kind: 'value', path: 'positionTitle' }],
    })
  })

  it('uses relationship labels before scalar fields for nested array rows', async () => {
    const result = await applyPlugin([
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
                  { name: 'person', type: 'relationship', relationTo: 'people' },
                ],
              },
            ],
          },
        ],
      },
    ])

    const members = getArray(result[1]?.fields[0]).fields[0]
    expect(members).toBeDefined()

    const rowLabel = getRowLabel(members)
    expect(rowLabel.clientProps).toMatchObject({
      candidates: [
        {
          fallbackPrefix: 'Person',
          kind: 'relationship',
          labelField: 'fullName',
          path: 'person',
          relationTo: 'people',
        },
        { kind: 'value', path: 'role' },
      ],
    })
  })

  it('passes select option labels for enum-like array rows', async () => {
    const result = await applyPlugin([
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
              },
              { name: 'actions', type: 'select', options: ['create', 'update'] },
            ],
          },
        ],
      },
    ])

    const rowLabel = getRowLabel(result[0]?.fields[0])
    expect(rowLabel.clientProps).toMatchObject({
      candidates: [
        {
          kind: 'value',
          options: { people: 'People' },
          path: 'collection',
        },
        { kind: 'value', path: 'actions', options: { create: 'create', update: 'update' } },
      ],
    })
  })

  it('preserves manually configured row labels by default', async () => {
    const result = await applyPlugin([
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

    expect(getArray(result[0]?.fields[0]).admin?.components?.RowLabel).toBe(
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
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof globalThis.fetch>(() => new Promise(() => {})),
    )

    const { AutoArrayRowLabel } =
      await import('../../src/plugins/payload-row-labels/AutoArrayRowLabel')

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
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>())

    const { AutoArrayRowLabel } =
      await import('../../src/plugins/payload-row-labels/AutoArrayRowLabel')

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
      vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(Response.json({ fullName: 'Ada Lovelace' })),
    )

    const { AutoArrayRowLabel } =
      await import('../../src/plugins/payload-row-labels/AutoArrayRowLabel')

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

  it.each([
    ['a localized label', '{"fullName":{"fr":"Adèle","en":"Ada"}}', 'Ada'],
    ['a fallback locale', '{"fullName":{"fr":"Adèle"}}', 'Adèle'],
    ['a nested object label', '{"fullName":{"en":{"unexpected":"Ada"}}}', 'Person 01'],
    ['a boolean label', '{"fullName":false}', 'false'],
    ['a numeric label', '{"fullName":42}', '42'],
    ['an array label', '{"fullName":["Ada"]}', 'Person 01'],
    ['a null document', 'null', 'Person 01'],
    ['an array document', '[]', 'Person 01'],
    ['invalid JSON', '<html>Bad gateway</html>', 'Person 01'],
  ])('handles %s from the relationship endpoint', async (_name, body, label) => {
    rowLabelHookState.fields = {
      'committees.0.teams.0.members.0.person': { value: 42 },
    }
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body)))
    const { AutoArrayRowLabel } =
      await import('../../src/plugins/payload-row-labels/AutoArrayRowLabel')
    await act(async () => {
      render(
        createElement(AutoArrayRowLabel, {
          candidates: [
            {
              kind: 'relationship',
              path: 'person',
              relationTo: 'people',
              labelField: 'fullName',
              fallbackPrefix: 'Person',
            },
          ],
          path: rowLabelHookState.path,
        }),
      )
    })
    expect(screen.getByText(label)).toBeDefined()
  })
})

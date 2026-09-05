import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import type { CheckboxInput, SelectInput } from '@payloadcms/ui'
import { afterReadPromise, buildConfig, createClientField } from 'payload'
import {
  AutoFieldSelect,
  AutoNewTabCheckbox,
} from '@/plugins/payload-navigation/components/AutoFieldSelect'
import { CommitteePositionSelect } from '@/components/CommitteePositionSelect'
import { Teams } from '@/collections/Teams'
import { Committees } from '@/collections/Committees'
import { buildNavItemsField } from '@/plugins/payload-navigation/fields'
import { createRequest, testConfig } from '../helpers/payload'

const setValue = vi.fn<(value: unknown) => void>()
const selectInputs = new Map<string, ComponentProps<typeof SelectInput>>()
const fieldState: { disabled: boolean; value: string | null } = { disabled: false, value: null }

const fields: Record<string, { value: unknown }> = {
  'navItems.0.collection': { value: 'teams' },
  'teams.0.team': { value: 1 },
}

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useField: () => ({ ...fieldState, setValue }),
  useFormFields: (selector: (state: [typeof fields]) => unknown) => selector([fields]),
  SelectInput: (props: ComponentProps<typeof SelectInput>) => {
    selectInputs.set(props.name, props)
    return createElement(
      'select',
      { 'aria-label': props.name, disabled: props.readOnly },
      props.options?.map(({ label, value }) =>
        createElement('option', { key: value, value }, typeof label === 'string' ? label : value),
      ),
    )
  },
  CheckboxInput: (props: ComponentProps<typeof CheckboxInput>) =>
    createElement('input', { type: 'checkbox', disabled: props.readOnly }),
}))

beforeEach(() => {
  fields['navItems.0.collection'] = { value: 'teams' }
  fields['teams.0.team'] = { value: 1 }
  setValue.mockClear()
  fieldState.disabled = false
  fieldState.value = null
  selectInputs.clear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('preserves actual collection field labels and descriptions through the client field boundary', async () => {
  const { req } = await createRequest()
  const teams = Committees.fields.find((field) => 'name' in field && field.name === 'teams')
  if (teams?.type !== 'array') throw new Error('Missing committee teams')
  const members = teams.fields.find((field) => 'name' in field && field.name === 'members')
  if (members?.type !== 'array') throw new Error('Missing committee members')
  const role = members.fields.find((field) => 'name' in field && field.name === 'role')
  const navField = buildNavItemsField({ allowedCollections: ['teams'] }).fields.find(
    (field) => 'name' in field && field.name === 'field',
  )
  if (!role || !navField) throw new Error('Missing custom text fields')
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof globalThis.fetch>(async () => Response.json({ positions: [], fields: [] })),
  )
  for (const [field, component, path] of [
    [role, CommitteePositionSelect, 'teams.0.members.0.role'],
    [navField, AutoFieldSelect, 'navItems.0.field'],
  ] as const) {
    const clientField = createClientField({
      defaultIDType: 'number',
      field,
      i18n: req.i18n,
      importMap: {},
    })
    if (clientField.type !== 'text') throw new Error('Custom select must store a text field')
    await act(async () => {
      render(createElement(component, { field: clientField, path }))
    })
    expect(selectInputs.get(clientField.name)).toMatchObject({
      label: clientField.label ?? 'Field',
      required: clientField.required,
      description: clientField.admin?.description,
    })
  }
})

describe('admin select HTTP responses', () => {
  it.each([
    [
      'valid fields',
      '{"fields":[{"name":"name","type":"text","label":"Team name","extra":true}]}',
      ['Team name (name)'],
    ],
    [
      'a malformed field label',
      '{"fields":[{"name":"name","type":"text","label":{"en":"Name"}}]}',
      [],
    ],
    ['a non-array field list', '{"fields":{}}', []],
    ['null', 'null', []],
    ['invalid JSON', '<html>Bad gateway</html>', []],
  ])('navigation fields handle %s', async (_name, body, labels) => {
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body)))
    await act(async () => {
      render(
        createElement(AutoFieldSelect, {
          path: 'navItems.0.field',
          field: { name: 'field', type: 'text' },
        }),
      )
    })
    expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual(labels)
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(false)
  })

  it.each([
    [
      'valid positions',
      '{"positions":[{"positionTitle":"Chair","role":"exec","id":"one"}]}',
      ['Chair'],
    ],
    ['absent positions', '{}', []],
    ['null positions', '{"positions":null}', []],
    ['a malformed position title', '{"positions":[{"positionTitle":{"en":"Chair"}}]}', []],
    ['a missing position title', '{"positions":[{"role":"exec"}]}', []],
    ['null', 'null', []],
    ['invalid JSON', '<html>Bad gateway</html>', []],
  ])('team positions handle %s', async (_name, body, labels) => {
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body)))
    await act(async () => {
      render(
        createElement(CommitteePositionSelect, {
          path: 'teams.0.members.0.role',
          field: { name: 'role', type: 'text' },
        }),
      )
    })
    expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual(labels)
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(false)
  })

  it.each([undefined, null])(
    'retains translated positions when Payload returns a %s title for another position',
    async (title) => {
      const { req } = await createRequest()
      req.payload.config = await buildConfig({
        ...testConfig,
        collections: [{ slug: 'users', auth: true, fields: [] }],
        localization: { locales: ['en', 'fr'], defaultLocale: 'en', fallback: true },
      })
      const positionsField = Teams.fields.find(
        (field) => 'name' in field && field.name === 'positions',
      )
      if (!positionsField || positionsField.type !== 'array') {
        throw new Error('Missing team positions field')
      }
      const field = positionsField.fields.find(
        (field) => 'name' in field && field.name === 'positionTitle',
      )
      if (!field) throw new Error('Missing position title field')
      const positions: Record<string, unknown>[] = [
        { positionTitle: { en: title, fr: 'Trésorier' } },
        { positionTitle: { en: 'Chair', fr: 'Présidence' } },
      ]
      for (const position of positions) {
        await afterReadPromise({
          collection: null,
          context: req.context,
          currentDepth: 1,
          depth: 0,
          doc: position,
          draft: false,
          fallbackLocale: 'en',
          field,
          fieldDepth: 0,
          fieldIndex: 0,
          fieldPromises: [],
          findMany: false,
          flattenLocales: true,
          global: null,
          locale: 'en',
          overrideAccess: true,
          parentIndexPath: '',
          parentPath: '',
          parentSchemaPath: '',
          populationPromises: [],
          req,
          showHiddenFields: false,
          siblingDoc: position,
        })
      }
      expect(positions).toEqual([{ positionTitle: title }, { positionTitle: 'Chair' }])
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json({ positions })),
      )
      await act(async () => {
        render(
          createElement(CommitteePositionSelect, {
            path: 'teams.0.members.0.role',
            field: { name: 'role', type: 'text' },
          }),
        )
      })
      expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual(['Chair'])
      expect(console.error).not.toHaveBeenCalled()
    },
  )
})

const selects = [
  {
    name: 'navigation field',
    render: (readOnly = false, fieldReadOnly = false) =>
      createElement(AutoFieldSelect, {
        path: 'navItems.0.field',
        field: { name: 'field', type: 'text', admin: { readOnly: fieldReadOnly } },
        readOnly,
      }),
    sibling: 'navItems.0.collection',
    input: 'field',
    next: 'people',
    firstBody: { fields: [{ name: 'old', type: 'text', label: 'Old' }] },
    nextBody: { fields: [{ name: 'new', type: 'text', label: 'New' }] },
    nextLabel: 'New (new)',
    selected: 'new',
  },
  {
    name: 'committee position',
    render: (readOnly = false, fieldReadOnly = false) =>
      createElement(CommitteePositionSelect, {
        path: 'teams.0.members.0.role',
        field: {
          name: 'role',
          type: 'text',
          admin: { readOnly: fieldReadOnly },
        },
        readOnly,
      }),
    sibling: 'teams.0.team',
    input: 'role',
    next: 2,
    firstBody: { positions: [{ positionTitle: 'Old' }] },
    nextBody: { positions: [{ positionTitle: 'New' }] },
    nextLabel: 'New',
    selected: 'New',
  },
]

describe.each(selects)('$name dependent options', (select) => {
  it.each(['parent', 'field', 'disabled'])(
    'preserves %s read-only state after options load',
    async (source) => {
      fieldState.disabled = source === 'disabled'
      fieldState.value = 'Saved value absent from current options'
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(select.nextBody)),
      )
      await act(async () => {
        render(select.render(source === 'parent', source === 'field'))
      })
      expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(true)
      expect(setValue).not.toHaveBeenCalled()
    },
  )

  it.each([null, undefined, false, {}, ['teams']])(
    'does not fetch for an invalid sibling %j',
    async (value) => {
      fields[select.sibling] = { value }
      const fetch = vi.fn<typeof globalThis.fetch>()
      vi.stubGlobal('fetch', fetch)
      await act(async () => {
        render(select.render())
      })
      expect(fetch).not.toHaveBeenCalled()
      expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(true)
    },
  )

  it('discards old responses after the sibling changes', async () => {
    let completeFirst: (response: Response) => void = () => {
      throw new Error('First request did not start')
    }
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            completeFirst = resolve
          }),
      )
      .mockResolvedValueOnce(Response.json(select.nextBody))
    vi.stubGlobal('fetch', fetch)
    const view = render(select.render())
    expect(fetch).toHaveBeenCalledTimes(1)
    fields[select.sibling] = { value: select.next }
    await act(async () => {
      view.rerender(select.render())
    })
    expect(screen.getByRole('option').textContent).toBe(select.nextLabel)
    await act(async () => {
      completeFirst(Response.json(select.firstBody))
    })
    expect(screen.getByRole('option').textContent).toBe(select.nextLabel)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('clears visible options when the sibling is cleared', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(select.nextBody)),
    )
    const view = render(select.render())
    await act(async () => {})
    expect(screen.getByRole('option').textContent).toBe(select.nextLabel)
    fields[select.sibling] = { value: null }
    view.rerender(select.render())
    expect(screen.queryAllByRole('option')).toEqual([])
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(true)
  })

  it('stores only a single string selection and allows clearing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json(select.nextBody)),
    )
    await act(async () => {
      render(select.render())
    })
    const onChange = selectInputs.get(select.input)?.onChange
    if (!onChange) throw new Error('Missing select change handler')
    onChange({ value: select.selected })
    expect(setValue).toHaveBeenLastCalledWith(select.selected)
    onChange([])
    expect(setValue).toHaveBeenLastCalledWith(null)
    onChange({ value: { unexpected: 'object' } })
    expect(setValue).toHaveBeenLastCalledWith(null)
  })
})

it.each(['parent', 'disabled'])(
  'preserves %s read-only state on the automatic new-tab checkbox',
  (source) => {
    fieldState.disabled = source === 'disabled'
    render(
      createElement(AutoNewTabCheckbox, {
        path: 'navItems.0.autoNewTab',
        field: { name: 'autoNewTab', type: 'ui', admin: {} },
        readOnly: source === 'parent',
      }),
    )
    expect(screen.getByRole('checkbox').hasAttribute('disabled')).toBe(true)
  },
)

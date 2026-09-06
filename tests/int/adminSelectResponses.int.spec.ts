import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import type { SelectInput } from '@payloadcms/ui'
import { AutoFieldSelect } from '@/plugins/payload-navigation/components/AutoFieldSelect'
import { CommitteePositionSelect } from '@/components/CommitteePositionSelect'

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
    'omits a %s title without losing other team positions',
    async (title) => {
      const positions = [{ positionTitle: title }, { positionTitle: 'Chair' }]
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

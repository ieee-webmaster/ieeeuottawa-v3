import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { AutoFieldSelect } from '@/plugins/payload-navigation/components/AutoFieldSelect'
import { CommitteePositionSelect } from '@/components/CommitteePositionSelect'

const fields: Record<string, { value: unknown }> = {
  'navItems.0.collection': { value: 'teams' },
  'teams.0.team': { value: 1 },
}

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useField: () => ({ value: null, setValue: vi.fn() }),
  useFormFields: (selector: (state: [typeof fields]) => unknown) => selector([fields]),
  SelectInput: ({
    name,
    options,
    readOnly,
  }: {
    name: string
    options: { label: string; value: string }[]
    readOnly: boolean
  }) =>
    createElement(
      'select',
      { 'aria-label': name, disabled: readOnly },
      options.map(({ label, value }) => createElement('option', { key: value, value }, label)),
    ),
}))

beforeEach(() => {
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
          field: { name: 'role', type: 'select', options: [] },
        }),
      )
    })
    expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual(labels)
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(false)
  })
})

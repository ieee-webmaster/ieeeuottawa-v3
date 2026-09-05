import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { createElement, Fragment } from 'react'
import type { Form, FormBlock as FormBlockProps } from '@/payload-types'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/components/RichText', () => ({ default: () => null }))

import { FormBlock } from '@/blocks/Form/Component'
import { getFormDefaultValues } from '@/blocks/Form/types'

const form: Form = {
  id: 4,
  title: 'Contact',
  createdAt: '',
  updatedAt: '',
  submitButtonLabel: 'Send',
  fields: [
    { blockType: 'message', message: null },
    { blockType: 'text', name: 'name', label: 'Name', required: true, defaultValue: 'Ada' },
    { blockType: 'number', name: 'guests', label: 'Guests', defaultValue: 2 },
    {
      blockType: 'checkbox',
      name: 'consent',
      label: 'Consent',
      required: true,
      defaultValue: false,
    },
    {
      blockType: 'select',
      name: 'topic',
      label: 'Topic',
      defaultValue: 'events',
      options: [{ label: 'Events', value: 'events' }],
    },
    { blockType: 'country', name: 'country', label: 'Country' },
    { blockType: 'state', name: 'state', label: 'State' },
  ],
}
const props: FormBlockProps = { blockType: 'formBlock', form }

// jsdom does not lay out the Radix checkbox/select controls.
beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('CMS form values', () => {
  it('derives scalar defaults from generated field definitions, excluding message blocks', () => {
    expect(getFormDefaultValues(form.fields, 'test')).toEqual({
      test_field_1: 'Ada',
      test_field_2: 2,
      test_field_3: false,
      test_field_4: 'events',
      test_field_5: '',
      test_field_6: '',
    })
  })

  it('validates consent and submits edited named values without leaking field definitions', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    const view = render(createElement(FormBlock, props))
    expect(view.getAllByRole('combobox')).toHaveLength(3)
    const input = view.getByRole('textbox', { name: /Name/ })
    fireEvent.change(input, { target: { value: 'Grace' } })
    fireEvent.click(view.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(view.getByText('This field is required')).toBeDefined())
    expect(fetch).not.toHaveBeenCalled()
    fireEvent.click(view.getByRole('checkbox', { name: /Consent/ }))
    fireEvent.click(view.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/form-submissions'),
      expect.objectContaining({
        body: JSON.stringify({
          form: 4,
          submissionData: [
            { field: 'name', value: 'Grace' },
            { field: 'guests', value: '2' },
            { field: 'consent', value: 'true' },
            { field: 'topic', value: 'events' },
            { field: 'country', value: '' },
            { field: 'state', value: '' },
          ],
        }),
      }),
    )
    await waitFor(() => expect(view.queryByRole('button', { name: 'Send' })).toBeNull())
  })

  it('preserves literal CMS names, defaults and errors when names resemble object paths', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    const view = render(
      createElement(FormBlock, {
        ...props,
        form: {
          ...form,
          fields: [
            {
              blockType: 'text',
              name: 'contact',
              label: 'Contact',
              defaultValue: 'Initial contact',
            },
            { blockType: 'email', name: 'contact.email', label: 'Email', required: true },
            { blockType: 'text', name: 'people[0].name', label: 'Person', defaultValue: 'Ada' },
            { blockType: 'text', name: '__proto__', label: 'Extra', defaultValue: 'Original' },
            { blockType: 'checkbox', name: 'consent.accepted', label: 'Consent', required: true },
          ],
        },
      }),
    )

    expect(view.getByDisplayValue('Initial contact')).toBe(
      view.getByRole('textbox', { name: 'Contact' }),
    )
    expect(view.getByDisplayValue('Ada')).toBe(view.getByRole('textbox', { name: 'Person' }))
    fireEvent.click(view.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(view.getAllByText('This field is required')).toHaveLength(2))
    expect(fetch).not.toHaveBeenCalled()

    fireEvent.change(view.getByRole('textbox', { name: 'Contact' }), { target: { value: 'IEEE' } })
    fireEvent.change(view.getByRole('textbox', { name: /Email/ }), {
      target: { value: 'ada@example.com' },
    })
    fireEvent.change(view.getByRole('textbox', { name: 'Person' }), { target: { value: 'Grace' } })
    fireEvent.change(view.getByRole('textbox', { name: 'Extra' }), { target: { value: 'Updated' } })
    fireEvent.click(view.getByRole('checkbox', { name: /Consent/ }))
    fireEvent.click(view.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/form-submissions'),
      expect.objectContaining({
        body: JSON.stringify({
          form: form.id,
          submissionData: [
            { field: 'contact', value: 'IEEE' },
            { field: 'contact.email', value: 'ada@example.com' },
            { field: 'people[0].name', value: 'Grace' },
            { field: '__proto__', value: 'Updated' },
            { field: 'consent.accepted', value: 'true' },
          ],
        }),
      }),
    )
  })

  it('keeps labels associated with their own controls when the same form appears twice', () => {
    const view = render(
      createElement(
        Fragment,
        null,
        ...['First consent', 'Second consent'].map((label) =>
          createElement(FormBlock, {
            ...props,
            key: label,
            form: { ...form, fields: [{ blockType: 'checkbox', name: 'consent', label }] },
          }),
        ),
      ),
    )
    const first = view.getByRole('checkbox', { name: 'First consent' })
    const second = view.getByRole('checkbox', { name: 'Second consent' })
    expect(first.id).not.toBe(second.id)
    fireEvent.click(view.getByText('Second consent'))
    expect(second.getAttribute('aria-checked')).toBe('true')
    expect(first.getAttribute('aria-checked')).toBe('false')
  })

  it('keeps the form usable after a failed request and clears the delayed loading indicator', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error('offline')))
    const view = render(createElement(FormBlock, { ...props, form: { ...form, fields: [] } }))
    fireEvent.click(view.getByRole('button', { name: 'Send' }))
    await waitFor(() =>
      expect(view.getByRole('alert').textContent).toContain('Something went wrong.'),
    )
    await new Promise((resolve) => setTimeout(resolve, 1100))
    expect(view.queryByText('Loading, please wait...')).toBeNull()
    expect(view.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(false)
  })

  it('safely handles an unpopulated form relationship', () => {
    const view = render(createElement(FormBlock, { ...props, form: 4 }))
    expect(view.container.innerHTML).toBe('')
  })

  it.each([
    [
      'a Payload error',
      '{"errors":[{"message":"Please supply an email address","name":"ValidationError"}]}',
      'Please supply an email address',
    ],
    ['an invalid message', '{"errors":[{"message":{"text":"Invalid"}}]}', 'Internal Server Error'],
    ['an empty error list', '{"errors":[]}', 'Internal Server Error'],
    ['a null response', 'null', 'Internal Server Error'],
    ['an HTML error page', '<html>Bad gateway</html>', 'Internal Server Error'],
  ])('handles %s without accepting unvalidated error data', async (_name, body, message) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body, { status: 400 })),
    )
    const view = render(createElement(FormBlock, { ...props, form: { ...form, fields: [] } }))
    fireEvent.click(view.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(view.getByRole('alert').textContent).toBe(`400: ${message}`))
    expect(view.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(false)
  })
})

import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import { DropdownItem } from '@/Header/Nav/DropdownItem'

vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))

afterEach(cleanup)

it('closes the custom dropdown for a window mouse event', () => {
  render(
    createElement(DropdownItem, {
      orientation: 'horizontal',
      item: { kind: 'dropdown', label: 'Explore', items: [{ href: '/events', label: 'Events' }] },
    }),
  )
  const button = screen.getByRole('button', { name: 'Explore' })
  fireEvent.click(button)
  expect(button.getAttribute('aria-expanded')).toBe('true')
  fireEvent.mouseDown(window)
  expect(button.getAttribute('aria-expanded')).toBe('false')
})

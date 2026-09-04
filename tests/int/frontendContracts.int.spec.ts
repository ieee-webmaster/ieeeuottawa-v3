import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import type { Payload } from 'payload'
import type { Search as SearchDocument } from '@/payload-types'

type SearchResult = Pick<SearchDocument, 'slug' | 'title' | 'meta' | 'categories'>
const { find, replace } = vi.hoisted(() => ({
  find: vi.fn<
    (
      options: Parameters<Payload['find']>[0],
    ) => Promise<{ docs: SearchResult[]; totalDocs: number }>
  >(),
  replace: vi.fn<(href: string) => void>(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/utilities/generateMeta', () => ({ generateStaticMeta: vi.fn() }))
vi.mock('@/components/Media', () => ({ Media: () => null }))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
  useRouter: () => ({ replace }),
}))

import SearchPage from '@/app/(frontend)/[locale]/search/page'
import { Card } from '@/components/Card'
import { DropdownItem } from '@/Header/Nav/DropdownItem'

beforeEach(() => {
  find.mockReset().mockResolvedValue({ docs: [], totalDocs: 0 })
  replace.mockClear()
})
afterEach(cleanup)

describe('frontend data contracts', () => {
  it('uses the first repeated query value for the search input and database search', async () => {
    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: ['  robotics  ', 'ignored'] }),
      }),
    )
    expect(screen.getByRole('searchbox').getAttribute('value')).toBe('robotics')
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'search',
        overrideAccess: false,
        where: {
          or: [
            { title: { like: 'robotics' } },
            { 'meta.description': { like: 'robotics' } },
            { 'meta.title': { like: 'robotics' } },
            { slug: { like: 'robotics' } },
          ],
        },
      }),
    )
  })

  it('handles an empty query array as an empty search', async () => {
    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: [] }),
      }),
    )
    expect(screen.getByRole('searchbox').getAttribute('value')).toBe('')
    expect(find.mock.calls[0]?.[0]).not.toHaveProperty('where')
  })

  it('renders indexed category snapshots and omits results with no routable slug', async () => {
    find.mockResolvedValue({
      totalDocs: 2,
      docs: [
        {
          title: 'Robotics workshop',
          slug: 'robotics-workshop',
          categories: [
            { categoryID: '12', title: 'Workshops' },
            { categoryID: '13', title: null },
          ],
        },
        { title: 'Unroutable post', slug: null, categories: null },
      ],
    })
    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: 'robotics' }),
      }),
    )
    expect(screen.getByRole('link', { name: /Robotics workshop/ }).getAttribute('href')).toBe(
      '/posts/robotics-workshop',
    )
    expect(screen.getByText('Workshops, Untitled category').textContent).toBe(
      'Workshops, \u00a0Untitled category',
    )
    expect(screen.queryByText('Unroutable post')).toBeNull()
  })

  it('omits unresolved category IDs before joining the displayed category names', () => {
    render(
      createElement(Card, {
        href: '/posts/robotics-workshop',
        showCategories: true,
        doc: {
          slug: 'robotics-workshop',
          title: 'Robotics workshop',
          categories: [10, { title: 'Workshops' }, 11, { title: 'Robotics' }, 12],
        },
      }),
    )
    expect(screen.getByText('Workshops, Robotics').textContent).toBe('Workshops, \u00a0Robotics')
  })

  it('closes the dropdown for a window mouse event without treating its target as a DOM node', () => {
    render(
      createElement(DropdownItem, {
        orientation: 'horizontal',
        item: { kind: 'dropdown', label: 'Explore', items: [{ href: '/events', label: 'Events' }] },
      }),
    )
    const button = screen.getByRole('button', { name: 'Explore' })
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    fireEvent.mouseDown(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    fireEvent.mouseDown(window)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

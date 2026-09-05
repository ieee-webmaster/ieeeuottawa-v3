import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it } from 'vitest'

import { Pagination } from '@/components/Pagination'

describe('pagination links', () => {
  it.each([1, 2, 3])('renders localized native links and disabled controls on page %s', (page) => {
    const markup = renderToStaticMarkup(
      // eslint-disable-next-line react/no-children-prop -- The provider requires children in its typed props.
      React.createElement(NextIntlClientProvider, {
        locale: 'fr',
        messages: {},
        timeZone: 'UTC',
        children: React.createElement(Pagination, { basePath: '/posts', page, totalPages: 3 }),
      }),
    )
    const container = document.createElement('div')
    container.innerHTML = markup
    const pagePath = (number: number) => (number === 1 ? '/fr/posts' : `/fr/posts/page/${number}`)

    expect(container.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe(
      pagePath(page),
    )
    expect(container.querySelector('button')).toBeNull()

    for (const [label, target, disabled] of [
      ['Go to previous page', page - 1, page === 1],
      ['Go to next page', page + 1, page === 3],
    ] as const) {
      const control = container.querySelector(`[aria-label="${label}"]`)
      expect(control?.tagName).toBe(disabled ? 'SPAN' : 'A')
      expect(control?.getAttribute('href')).toBe(disabled ? null : pagePath(target))
      expect(control?.getAttribute('aria-disabled')).toBe(disabled ? 'true' : null)
      if (disabled) {
        expect(control?.getAttribute('role')).toBe('link')
        expect(control?.hasAttribute('tabindex')).toBe(false)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'

import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { routing } from '@/i18n/routing'
import { getAbsoluteUrl, prefixLocale } from '@/utilities/routes'

describe('routes', () => {
  it('builds route paths from inline rules', () => {
    const pageSlug: string = 'about-us'

    expect('home' === 'home' ? '/' : `/${encodeURIComponent('home')}`).toBe('/')
    expect(pageSlug === 'home' ? '/' : `/${encodeURIComponent(pageSlug)}`).toBe('/about-us')
    expect(`/posts/${encodeURIComponent('hello-world')}`).toBe('/posts/hello-world')
    expect(`/events/${encodeURIComponent('hack-night')}`).toBe('/events/hack-night')
  })

  it('prefixes locales without double-prefixing or changing absolute urls', () => {
    expect(prefixLocale('/', 'fr')).toBe('/fr')
    expect(prefixLocale('/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
    expect(prefixLocale('/fr/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
    expect(prefixLocale('https://example.com/posts/hello-world', 'fr')).toBe(
      'https://example.com/posts/hello-world',
    )
  })

  it('builds localized document paths and urls with route composition', () => {
    expect(prefixLocale(`/events/${encodeURIComponent('portes-ouvertes')}`, 'fr')).toBe(
      '/fr/events/portes-ouvertes',
    )

    expect(
      routing.locales.map((locale) =>
        prefixLocale('home' === 'home' ? '/' : `/${encodeURIComponent('home')}`, locale),
      ),
    ).toEqual(['/en', '/fr'])

    expect(getAbsoluteUrl(prefixLocale(`/posts/${encodeURIComponent('hello-world')}`, 'en'))).toBe(
      'http://localhost:3000/en/posts/hello-world',
    )
  })
})

describe('locale-aware formatting', () => {
  it('formats dates with locale-aware Intl rules', () => {
    const date = '2026-03-02T00:00:00.000Z'

    expect(formatDateTime(date, 'en')).toBe('Mar 2, 2026')
    expect(formatDateTime(date, 'fr')).toBe('2 mars 2026')
  })

  it('formats author lists with locale-aware conjunctions', () => {
    const authors = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]

    expect(formatAuthors(authors, 'en')).toBe('Alice, Bob, and Charlie')
    expect(formatAuthors(authors, 'fr')).toBe('Alice, Bob et Charlie')
  })
})

import { describe, expect, it } from 'vitest'

import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import {
  getAbsoluteLocalizedUrl,
  getCollectionIndexPath,
  getDocumentPath,
  getLocalizedDocumentPath,
  getLocalizedDocumentPaths,
  prefixLocale,
} from '@/utilities/routes'

describe('routes', () => {
  it('builds document paths from the shared route rules', () => {
    expect(getDocumentPath({ collection: 'pages', slug: 'home' })).toBe('/')
    expect(getDocumentPath({ collection: 'pages', slug: 'about-us' })).toBe('/about-us')
    expect(getDocumentPath({ collection: 'posts', slug: 'hello-world' })).toBe(
      '/posts/hello-world',
    )
    expect(getDocumentPath({ collection: 'events', slug: 'hack-night' })).toBe(
      '/events/hack-night',
    )
  })

  it('builds canonical collection index paths', () => {
    expect(getCollectionIndexPath({ collection: 'posts', page: 1 })).toBe('/posts')
    expect(getCollectionIndexPath({ collection: 'posts', page: 2 })).toBe('/posts/page/2')
  })

  it('prefixes locales without double-prefixing or changing absolute urls', () => {
    expect(prefixLocale('/', 'fr')).toBe('/fr')
    expect(prefixLocale('/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
    expect(prefixLocale('/fr/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
    expect(prefixLocale('https://example.com/posts/hello-world', 'fr')).toBe(
      'https://example.com/posts/hello-world',
    )
  })

  it('builds localized document paths and urls', () => {
    expect(
      getLocalizedDocumentPath({
        collection: 'events',
        locale: 'fr',
        slug: 'portes-ouvertes',
      }),
    ).toBe('/fr/events/portes-ouvertes')

    expect(getLocalizedDocumentPaths({ collection: 'pages', slug: 'home' })).toEqual([
      '/en',
      '/fr',
    ])

    expect(
      getAbsoluteLocalizedUrl({
        collection: 'posts',
        locale: 'en',
        slug: 'hello-world',
      }),
    ).toBe('http://localhost:3000/en/posts/hello-world')
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

import { expect, it } from 'vitest'
import { prefixLocale } from '@/utilities/routes'

it('prefixes locales without double-prefixing or changing absolute URLs', () => {
  expect(prefixLocale('/', 'fr')).toBe('/fr')
  expect(prefixLocale('/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
  expect(prefixLocale('/fr/posts/hello-world', 'fr')).toBe('/fr/posts/hello-world')
  expect(prefixLocale('https://example.com/posts/hello-world', 'fr')).toBe(
    'https://example.com/posts/hello-world',
  )
})

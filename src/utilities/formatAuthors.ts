import type { Locale } from '@/i18n/routing'
import type { Post } from '@/payload-types'

/**
 * Formats an array of populatedAuthors from Posts into a prettified string.
 * @param authors - The populatedAuthors array from a Post.
 * @returns A prettified string of authors.
 * @example
 *
 * [Author1, Author2] becomes 'Author1 and Author2'
 * [Author1, Author2, Author3] becomes 'Author1, Author2, and Author3'
 *
 */
export const formatAuthors = (
  authors: NonNullable<NonNullable<Post['populatedAuthors']>[number]>[],
  locale: Locale,
) => {
  // Ensure we don't have any authors without a name
  const authorNames = authors
    .map((author) => author.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)

  if (authorNames.length === 0) return ''

  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  }).format(authorNames)
}

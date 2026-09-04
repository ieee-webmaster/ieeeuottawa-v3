export const resolvePostPath = (doc: unknown): string | null => {
  if (typeof doc !== 'object' || doc === null || !('slug' in doc)) {
    return null
  }

  const { slug } = doc
  if (typeof slug !== 'string') {
    return null
  }

  return `/posts/${encodeURIComponent(slug)}`
}

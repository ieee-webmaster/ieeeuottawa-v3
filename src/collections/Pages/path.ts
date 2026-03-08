export const resolvePagePath = (doc: unknown): string | null => {
  if (typeof doc !== 'object' || doc === null) {
    return null
  }

  const slug = (doc as { slug?: unknown }).slug
  if (typeof slug !== 'string') {
    return null
  }

  return slug === 'home' ? '/' : `/${encodeURIComponent(slug)}`
}

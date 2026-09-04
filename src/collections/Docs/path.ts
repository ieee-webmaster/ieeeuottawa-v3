export const resolveDocsPath = (doc: unknown): string | null => {
  if (typeof doc !== 'object' || doc === null || !('year' in doc)) {
    return null
  }

  const { year } = doc
  if (typeof year !== 'string') {
    return null
  }

  return `/documents/${encodeURIComponent(year)}`
}

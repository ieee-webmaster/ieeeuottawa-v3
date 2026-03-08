export const resolveDocsPath = (doc: unknown): string | null => {
  if (typeof doc !== 'object' || doc === null) {
    return null
  }

  const year = (doc as { year?: unknown }).year
  if (typeof year !== 'string') {
    return null
  }

  return `/documents/${encodeURIComponent(year)}`
}

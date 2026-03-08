import { resolveDocsPath } from '@/collections/Docs/path'
import { resolveEventPath } from '@/collections/Events/path'
import { resolvePagePath } from '@/collections/Pages/path'
import { resolvePostPath } from '@/collections/Posts/path'

const contentPathResolvers: Partial<Record<string, (doc: unknown) => string | null>> = {
  pages: resolvePagePath,
  posts: resolvePostPath,
  events: resolveEventPath,
  docs: resolveDocsPath,
}

export const resolveContentPathFromDoc = (collection: string, doc: unknown): string | null => {
  const resolver = contentPathResolvers[collection]
  return resolver ? resolver(doc) : null
}

export const resolveContentPathFromReference = (
  relationTo: string,
  value: unknown,
): string | null => resolveContentPathFromDoc(relationTo, value)

import type { Media } from '@/payload-types'
import type { CollectionAfterReadHook } from 'payload'

const getStaticMediaURL = (filename: null | string | undefined) =>
  filename ? `/media/${encodeURIComponent(filename)}` : null

export const populateStaticMediaURLs: CollectionAfterReadHook<Media> = ({ doc }) => {
  if (process.env.STATIC_EXPORT !== '1') return doc

  doc.url = getStaticMediaURL(doc.filename)

  for (const size of Object.values(doc.sizes ?? {})) {
    if (size) size.url = getStaticMediaURL(size.filename)
  }

  doc.thumbnailURL = doc.sizes?.thumbnail?.url ?? doc.url

  return doc
}

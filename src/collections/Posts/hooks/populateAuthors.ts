import type { CollectionAfterReadHook } from 'payload'
import type { Post, User } from '@/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors = (async ({ doc, req }) => {
  if (doc.authors?.length) {
    const authorDocs: Pick<User, 'id' | 'name'>[] = []

    for (const author of doc.authors) {
      try {
        const authorDoc = await req.payload.findByID({
          id: typeof author === 'number' ? author : author.id,
          collection: 'users',
          depth: 0,
          req,
          select: { name: true },
          // Public bylines expose only names, while User access remains private.
          overrideAccess: true,
        })

        if (authorDoc) {
          authorDocs.push(authorDoc)
        }
      } catch {
        // Keep the remaining byline when an author has been removed or cannot be read.
      }
    }

    if (authorDocs.length > 0) {
      doc.populatedAuthors = authorDocs.map(({ id, name }) => ({ id: String(id), name }))
    }
  }

  return doc
}) satisfies CollectionAfterReadHook<Post>

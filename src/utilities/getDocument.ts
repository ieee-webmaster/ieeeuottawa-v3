import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

async function getDocument(
  collection: Collection,
  slug: string,
  depth = 0,
  locale?: Config['locale'],
) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    locale,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

async function getDocumentByID(
  collection: Collection,
  id: string,
  depth = 0,
  locale?: Config['locale'],
) {
  const payload = await getPayload({ config: configPromise })

  return payload.findByID({
    collection,
    depth,
    id,
    locale,
    overrideAccess: false,
  })
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (
  collection: Collection,
  slug: string,
  locale?: Config['locale'],
) =>
  unstable_cache(
    async () => getDocument(collection, slug, 0, locale),
    [collection, slug, locale ?? ''],
    {
      tags: [`${collection}_${slug}`],
    },
  )

export const getCachedDocumentByID = (
  collection: Collection,
  id: string,
  locale?: Config['locale'],
) =>
  unstable_cache(
    async () => getDocumentByID(collection, id, 0, locale),
    [collection, 'id', id, locale ?? ''],
    {
      tags: [`${collection}_${id}`],
    },
  )

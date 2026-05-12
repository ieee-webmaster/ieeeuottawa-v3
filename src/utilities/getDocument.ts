import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

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

export const getCachedDocumentByID = (
  collection: Collection,
  id: string,
  locale?: Config['locale'],
) =>
  unstable_cache(
    async () => getDocumentByID(collection, id, 0, locale),
    [collection, 'id', id, locale ?? ''],
    {
      tags: [`${collection}_${id}_${locale ?? 'en'}`],
    },
  )

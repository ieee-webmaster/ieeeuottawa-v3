import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import {
  PUBLIC_CACHE_VERSION,
  publicCacheTags,
  STATIC_CONTENT_REVALIDATE_SECONDS,
} from '@/utilities/publicCache'

type Collection = keyof Config['collections']

async function getDocumentByID<T extends Collection>(
  collection: T,
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

export const getCachedDocumentByID = <T extends Collection>(
  collection: T,
  id: string,
  locale?: Config['locale'],
) =>
  unstable_cache(
    async () => getDocumentByID(collection, id, 0, locale),
    [PUBLIC_CACHE_VERSION, collection, 'id', id, locale ?? ''],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(`${collection}_${id}_${locale ?? 'en'}`),
    },
  )

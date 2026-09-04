import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({ req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', { expire: 0 })
}

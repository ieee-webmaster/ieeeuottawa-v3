import type React from 'react'
import type { Page, Post, Config } from '@/payload-types'

import { getCachedDocumentByID } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { getDocumentPath, isRoutedCollection, prefixLocale } from '@/utilities/routes'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

interface Props {
  disableNotFound?: boolean
  url: string
}

function resolveRedirectUrl(
  redirectItem: Awaited<ReturnType<ReturnType<typeof getCachedRedirects>>>[number],
): string | null {
  if (redirectItem.to?.url) return redirectItem.to.url

  const ref = redirectItem.to?.reference
  if (!ref) return null
  if (!isRoutedCollection(ref.relationTo)) return null

  const slug = typeof ref.value === 'object' ? ref.value?.slug : undefined
  if (!slug) return null

  return getDocumentPath({
    collection: ref.relationTo,
    slug,
  })
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirectsList = await getCachedRedirects()()
  const locale = (await getLocale()) as Config['locale']

  const redirectItem = redirectsList.find((r) => r.from === url)

  if (redirectItem) {
    // For numeric references we need to fetch the document to get the slug
    if (
      !redirectItem.to?.url &&
      redirectItem.to?.reference &&
      typeof redirectItem.to.reference.value !== 'object'
    ) {
      const { relationTo, value: id } = redirectItem.to.reference
      if (isRoutedCollection(relationTo)) {
        const document = (await getCachedDocumentByID(relationTo, String(id), locale)()) as
          | Page
          | Post
          | null

        if (document?.slug) {
          const redirectUrl = getDocumentPath({
            collection: relationTo,
            slug: document.slug,
          })

          redirect(prefixLocale(redirectUrl, locale))
        }
      }
    }

    const resolvedUrl = resolveRedirectUrl(redirectItem)
    if (resolvedUrl) redirect(prefixLocale(resolvedUrl, locale))
  }

  if (disableNotFound) return null

  notFound()
}

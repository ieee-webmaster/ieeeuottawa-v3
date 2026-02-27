import type React from 'react'
import type { Page, Post, Config } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirectsList = await getCachedRedirects()()
  const locale = await getLocale() as Config['locale']

  const redirectItem = redirectsList.find((r) => r.from === url)

  if (redirectItem) {
    // Prefix the destination with the current locale so the redirect lands on
    // the correct locale-prefixed URL (e.g. /en/new-slug).
    const withLocale = (path: string) => `/${locale}${path.startsWith('/') ? '' : '/'}${path}`

    if (redirectItem.to?.url) {
      redirect(withLocale(redirectItem.to.url))
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      const document = (await getCachedDocument(collection, id, locale)()) as Page | Post
      redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
        document?.slug
      }`
    } else {
      redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
        typeof redirectItem.to?.reference?.value === 'object'
          ? redirectItem.to?.reference?.value?.slug
          : ''
      }`
    }

    if (redirectUrl) redirect(withLocale(redirectUrl))
  }

  if (disableNotFound) return null

  notFound()
}

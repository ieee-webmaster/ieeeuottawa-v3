import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'
import { type AppLocale, defaultLocale, prefixLocalePath } from '@/i18n/config'

interface Props {
  disableNotFound?: boolean
  url: string
  locale?: AppLocale
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({
  disableNotFound,
  url,
  locale = defaultLocale,
}) => {
  const redirects = await getCachedRedirects()(locale)

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      const localizedURL = redirectItem.to.url.startsWith('/')
        ? prefixLocalePath(locale, redirectItem.to.url)
        : redirectItem.to.url

      redirect(localizedURL)
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      const document = (await getCachedDocument(collection, id)(locale)) as Page | Post
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

    if (redirectUrl) redirect(prefixLocalePath(locale, redirectUrl))
  }

  if (disableNotFound) return null

  notFound()
}

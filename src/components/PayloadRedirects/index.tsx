import type React from 'react'
import type { Page, Post, Config } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

interface Props {
  disableNotFound?: boolean
  url: string
}

/** Prefix a path with the current locale, skipping absolute URLs and already-prefixed paths. */
function withLocale(path: string, locale: Config['locale']): string {
  if (/^https?:\/\//i.test(path)) return path

  const normalised = path.startsWith('/') ? path : `/${path}`

  const alreadyPrefixed = routing.locales.some(
    (l) => normalised === `/${l}` || normalised.startsWith(`/${l}/`),
  )
  if (alreadyPrefixed) return normalised

  return `/${locale}${normalised}`
}

function resolveRedirectUrl(
  redirectItem: Awaited<ReturnType<ReturnType<typeof getCachedRedirects>>>[number],
): string | null {
  if (redirectItem.to?.url) return redirectItem.to.url

  const ref = redirectItem.to?.reference
  if (!ref) return null

  const slug = typeof ref.value === 'object' ? ref.value?.slug : undefined
  if (!slug) return null

  const prefix = ref.relationTo !== 'pages' ? `/${ref.relationTo}` : ''
  return `${prefix}/${slug}`
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirectsList = await getCachedRedirects()()
  const locale = (await getLocale()) as Config['locale']

  const redirectItem = redirectsList.find((r) => r.from === url)

  if (redirectItem) {
    // For numeric references we need to fetch the document to get the slug
    if (!redirectItem.to?.url && typeof redirectItem.to?.reference?.value === 'number') {
      const { relationTo, value: id } = redirectItem.to.reference
      const document = (await getCachedDocument(relationTo, String(id), locale)()) as Page | Post

      const prefix = relationTo !== 'pages' ? `/${relationTo}` : ''
      const redirectUrl = `${prefix}/${document?.slug}`

      if (redirectUrl) redirect(withLocale(redirectUrl, locale))
    }

    const resolvedUrl = resolveRedirectUrl(redirectItem)
    if (resolvedUrl) redirect(withLocale(resolvedUrl, locale))
  }

  if (disableNotFound) return null

  notFound()
}

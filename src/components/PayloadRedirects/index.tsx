import { resolveLocale } from '@/i18n/routing'
import {
  resolveContentPathFromDoc,
  resolveContentPathFromReference,
} from '@/routing/resolveContentPath'
import { getCachedDocumentByID } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { prefixLocale } from '@/utilities/routes'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

interface Props {
  disableNotFound?: boolean
  url: string
}

type RedirectItem = Awaited<ReturnType<ReturnType<typeof getCachedRedirects>>>[number]

function resolveRedirectUrl(redirectItem: RedirectItem): string | null {
  if (redirectItem.to?.url) return redirectItem.to.url

  const reference = redirectItem.to?.reference
  return reference ? resolveContentPathFromReference(reference.relationTo, reference.value) : null
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects = async ({ disableNotFound, url }: Props) => {
  const redirectsList = await getCachedRedirects()()
  const locale = resolveLocale(await getLocale())

  const redirectItem = redirectsList.find((r) => r.from === url)
  if (!redirectItem) {
    if (disableNotFound) return null
    notFound()
  }

  // For numeric references we need to fetch the document to get the slug
  if (
    !redirectItem.to?.url &&
    redirectItem.to?.reference &&
    typeof redirectItem.to.reference.value !== 'object'
  ) {
    const { relationTo, value: id } = redirectItem.to.reference

    const document = await getCachedDocumentByID(relationTo, String(id), locale)()
    const path = resolveContentPathFromDoc(relationTo, document)
    if (path) {
      redirect(prefixLocale(path, locale))
    }
  }

  const resolvedUrl = resolveRedirectUrl(redirectItem)
  if (resolvedUrl) redirect(prefixLocale(resolvedUrl, locale))

  notFound()
}

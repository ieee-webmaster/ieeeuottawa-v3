import { HeaderClient } from './Component.client'
import { resolveLocale } from '@/i18n/routing'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Header } from '@/payload-types'

import { resolveNavItems, type RawNavItem } from '@/plugins/payload-navigation'
import { resolveContentPathFromReference } from '@/routing/resolveContentPath'

export async function Header() {
  const locale = resolveLocale(await getLocale())
  const headerData: Header = await getCachedGlobal('header', 2, locale)()
  const payload = await getPayload({ config: configPromise })

  const navItems = await resolveNavItems(headerData?.navItems as RawNavItem[] | null, payload, {
    locale,
    resolveLinkHref: (link) => {
      if (link.type === 'reference' && link.reference) {
        return (
          resolveContentPathFromReference(link.reference.relationTo, link.reference.value) ??
          link.url ??
          null
        )
      }
      return link.url ?? null
    },
  })

  return <HeaderClient data={headerData} navItems={navItems} />
}

import { HeaderClient } from './Component.client'
import { resolveLocale } from '@/i18n/routing'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'

import type { Header } from '@/payload-types'

export async function Header() {
  const locale = resolveLocale(await getLocale())
  const headerData: Header = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}

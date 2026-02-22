import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getRequestLocale } from '@/i18n/server'

import type { Header } from '@/payload-types'

export async function Header() {
  const locale = await getRequestLocale()
  const headerData: Header = await getCachedGlobal('header', 1)(locale)

  return <HeaderClient data={headerData} />
}

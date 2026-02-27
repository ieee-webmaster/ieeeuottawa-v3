import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getLocale } from 'next-intl/server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Header, Config } from '@/payload-types'

export async function Header() {
  const locale = (await getLocale()) as Config['locale']
  const headerData: Header = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}

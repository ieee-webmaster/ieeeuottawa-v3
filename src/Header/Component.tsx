import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Header } from '@/payload-types'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'docs',
    depth: 0,
    limit: 1000,
  })

  const uniqueYears = Array.from(new Set(docs.map((doc) => doc.year)))
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a))

  return <HeaderClient data={headerData} documentYears={uniqueYears} />
}

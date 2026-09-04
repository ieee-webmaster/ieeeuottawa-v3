import type { Payload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Header } from '@/payload-types'
import type { Locale } from '@/i18n/routing'
import { resolveContentPathFromReference } from '@/routing/resolveContentPath'

import { fillSpecificUrl, inferUrls } from './inferUrls'
import type { AutoOrder, ResolvedLeafLink, ResolvedNavItem } from './types'
import {
  PUBLIC_CACHE_VERSION,
  publicCacheTags,
  STATIC_CONTENT_REVALIDATE_SECONDS,
} from '@/utilities/publicCache'

type RawNavItem = NonNullable<Header['navItems']>[number]
type LinkInput = NonNullable<RawNavItem['link']>
type NavigationCollection = NonNullable<RawNavItem['collection']>

const resolveLinkHref = (link: LinkInput): string | null =>
  link.type === 'reference' && link.reference
    ? (resolveContentPathFromReference(link.reference.relationTo, link.reference.value) ??
      link.url ??
      null)
    : (link.url ?? null)

const compareValues = (a: string, b: string): number => {
  const numA = Number(a)
  const numB = Number(b)
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB
  return a.localeCompare(b)
}

const fetchDistinctValues = async (
  payload: Payload,
  collectionSlug: NavigationCollection,
  fieldName: string,
  locale: Locale,
): Promise<string[]> => {
  const result = await payload.find({
    collection: collectionSlug,
    limit: 0,
    depth: 0,
    locale,
    overrideAccess: false,
    pagination: false,
    select: { [fieldName]: true },
  })

  const values = new Set<string>()
  for (const doc of result.docs) {
    const raw: unknown = Object.entries(doc).find(([key]) => key === fieldName)?.[1]
    if (raw === null || raw === undefined || raw === '') continue
    if (raw instanceof Date) {
      values.add(raw.toISOString().slice(0, 10))
      continue
    }
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      values.add(String(raw))
      continue
    }
  }
  return Array.from(values)
}

const cachedFetchDistinctValues = (
  collectionSlug: NavigationCollection,
  fieldName: string,
  order: AutoOrder,
  locale: Locale,
  payload: Payload,
) =>
  unstable_cache(
    async () => {
      const values = await fetchDistinctValues(payload, collectionSlug, fieldName, locale)
      values.sort(compareValues)
      if (order === 'desc') values.reverse()
      return values
    },
    [PUBLIC_CACHE_VERSION, 'payload-navigation', 'auto', collectionSlug, fieldName, order, locale],
    {
      revalidate: STATIC_CONTENT_REVALIDATE_SECONDS,
      tags: publicCacheTags(`nav_auto_${collectionSlug}`, `nav_auto_${collectionSlug}_${locale}`),
    },
  )

const resolveAutomaticDropdown = async (
  row: RawNavItem,
  payload: Payload,
  locale: Locale,
): Promise<ResolvedLeafLink[]> => {
  if (!row.collection || !row.field) return []

  const order: AutoOrder = row.order ?? 'asc'
  const values = await cachedFetchDistinctValues(
    row.collection,
    row.field,
    order,
    locale,
    payload,
  )()

  const { baseUrl, specificUrl } = inferUrls({
    collection: row.collection,
    base: row.baseUrl ?? null,
    specific: row.specificUrl ?? null,
  })
  const newTab = row.link?.newTab ?? undefined

  const items: ResolvedLeafLink[] = values.map((value) => ({
    label: value,
    href: fillSpecificUrl(specificUrl, value),
    newTab,
  }))

  if (row.includeAll) {
    items.unshift({
      label: row.allLabel ?? 'All',
      href: baseUrl,
      newTab,
    })
  }

  return items
}

const resolveManualDropdown = (row: RawNavItem): ResolvedLeafLink[] => {
  const items: ResolvedLeafLink[] = []
  for (const entry of row.manualItems ?? []) {
    const link = entry?.link
    if (!link) continue
    const href = resolveLinkHref(link)
    if (!href) continue
    const label = link.label
    if (!label) continue
    items.push({ label, href, newTab: link.newTab ?? undefined })
  }
  return items
}

export const resolveNavItems = async (
  rawItems: RawNavItem[] | null | undefined,
  payload: Payload,
  { locale }: { locale: Locale },
): Promise<ResolvedNavItem[]> => {
  if (!rawItems || rawItems.length === 0) return []

  const resolved: ResolvedNavItem[] = []
  for (const row of rawItems) {
    if (row.kind === 'dropdown') {
      const label = row.dropdownLabel ?? ''
      const items =
        row.dropdownMode === 'automatic'
          ? await resolveAutomaticDropdown(row, payload, locale)
          : resolveManualDropdown(row)

      resolved.push({
        id: row.id ?? null,
        kind: 'dropdown',
        label,
        items,
      })
      continue
    }

    const link = row.link
    if (!link) continue
    const href = resolveLinkHref(link)
    const label = link.label
    if (!href || !label) continue

    resolved.push({
      id: row.id ?? null,
      kind: 'link',
      href,
      label,
      newTab: link.newTab ?? undefined,
    })
  }

  return resolved
}

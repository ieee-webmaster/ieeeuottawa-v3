import type { CollectionSlug, Payload } from 'payload'
import { unstable_cache } from 'next/cache'

import { fillSpecificUrl, inferUrls } from './inferUrls'
import type { AutoOrder, ResolvedLeafLink, ResolvedNavItem } from './types'

type Localized<T> = T | { [locale: string]: T | undefined } | null | undefined

type LinkInput = {
  label?: Localized<string>
  newTab?: boolean | null
  type?: 'reference' | 'custom' | null
  url?: string | null
  reference?: { relationTo: string; value: unknown } | null
}

type ManualItemInput = {
  id?: string | null
  link?: LinkInput | null
}

export type RawNavItem = {
  id?: string | null
  kind?: 'link' | 'dropdown' | null
  link?: LinkInput | null
  dropdownLabel?: Localized<string>
  dropdownMode?: 'manual' | 'automatic' | null
  manualItems?: ManualItemInput[] | null
  collection?: string | null
  field?: string | null
  order?: AutoOrder | null
  baseUrl?: string | null
  specificUrl?: string | null
  includeAll?: boolean | null
  allLabel?: Localized<string>
}

type ResolveOptions = {
  resolveLinkHref: (link: LinkInput) => string | null
  locale: string
}

const pickLocalized = (value: Localized<string>, locale: string): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const direct = (value as Record<string, string | undefined>)[locale]
    if (typeof direct === 'string' && direct.length > 0) return direct
    const first = Object.values(value as Record<string, string | undefined>).find(
      (entry) => typeof entry === 'string' && entry.length > 0,
    )
    return typeof first === 'string' ? first : null
  }
  return null
}

const compareValues = (a: string, b: string): number => {
  const numA = Number(a)
  const numB = Number(b)
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB
  return a.localeCompare(b)
}

const fetchDistinctValues = async (
  payload: Payload,
  collectionSlug: string,
  fieldName: string,
  locale: string,
): Promise<string[]> => {
  const result = await payload.find({
    collection: collectionSlug as CollectionSlug,
    limit: 0,
    depth: 0,
    locale: locale as Parameters<Payload['find']>[0]['locale'],
    overrideAccess: false,
    pagination: false,
    select: { [fieldName]: true } as Record<string, true>,
  })

  const values = new Set<string>()
  for (const doc of result.docs as unknown as Record<string, unknown>[]) {
    const raw = doc[fieldName]
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
  collectionSlug: string,
  fieldName: string,
  order: AutoOrder,
  locale: string,
  payload: Payload,
) =>
  unstable_cache(
    async () => {
      const values = await fetchDistinctValues(payload, collectionSlug, fieldName, locale)
      values.sort(compareValues)
      if (order === 'desc') values.reverse()
      return values
    },
    ['payload-navigation', 'auto', collectionSlug, fieldName, order, locale],
    {
      tags: [`nav_auto_${collectionSlug}`, `nav_auto_${collectionSlug}_${locale}`],
    },
  )

const resolveAutomaticDropdown = async (
  row: RawNavItem,
  payload: Payload,
  locale: string,
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
      label: pickLocalized(row.allLabel, locale) ?? 'All',
      href: baseUrl,
      newTab,
    })
  }

  return items
}

const resolveManualDropdown = (
  row: RawNavItem,
  resolveLinkHref: ResolveOptions['resolveLinkHref'],
  locale: string,
): ResolvedLeafLink[] => {
  const items: ResolvedLeafLink[] = []
  for (const entry of row.manualItems ?? []) {
    const link = entry?.link
    if (!link) continue
    const href = resolveLinkHref(link)
    if (!href) continue
    const label = pickLocalized(link.label, locale)
    if (!label) continue
    items.push({ label, href, newTab: link.newTab ?? undefined })
  }
  return items
}

export const resolveNavItems = async (
  rawItems: RawNavItem[] | null | undefined,
  payload: Payload,
  options: ResolveOptions,
): Promise<ResolvedNavItem[]> => {
  if (!rawItems || rawItems.length === 0) return []

  const resolved: ResolvedNavItem[] = []
  for (const row of rawItems) {
    if (row.kind === 'dropdown') {
      const label = pickLocalized(row.dropdownLabel, options.locale) ?? ''
      const items =
        row.dropdownMode === 'automatic'
          ? await resolveAutomaticDropdown(row, payload, options.locale)
          : resolveManualDropdown(row, options.resolveLinkHref, options.locale)

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
    const href = options.resolveLinkHref(link)
    const label = pickLocalized(link.label, options.locale)
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

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Config,
  Field,
  GlobalConfig,
  Plugin,
} from 'payload'

import { buildCollectionFieldsEndpoint } from './endpoints'
import { buildNavItemsField } from './fields'
import { buildAfterChangeRevalidate, buildAfterDeleteRevalidate } from './revalidateHooks'
import type { NavigationPluginOptions } from './types'

const NAV_ITEMS_FIELD_NAME = 'navItems'

const isNamedField = (field: Field): field is Field & { name: string } =>
  'name' in field && typeof (field as { name?: unknown }).name === 'string'

const replaceNavItemsField = (fields: Field[] | undefined, replacement: Field): Field[] => {
  const existing = fields ?? []
  const index = existing.findIndex(
    (field) => isNamedField(field) && field.name === NAV_ITEMS_FIELD_NAME,
  )
  if (index === -1) return [replacement, ...existing]
  const next = [...existing]
  next[index] = replacement
  return next
}

const applyToGlobal = (global: GlobalConfig, navItemsField: Field): GlobalConfig => ({
  ...global,
  fields: replaceNavItemsField(global.fields, navItemsField),
})

const attachRevalidationHooks = (collection: CollectionConfig): CollectionConfig => {
  const slug = collection.slug
  const revalidateOptions = {
    draftsEnabled: Boolean(typeof collection.versions === 'object' && collection.versions?.drafts),
  }
  const afterChange: CollectionAfterChangeHook[] = [
    ...((collection.hooks?.afterChange as CollectionAfterChangeHook[]) ?? []),
    buildAfterChangeRevalidate(slug, revalidateOptions),
  ]
  const afterDelete: CollectionAfterDeleteHook[] = [
    ...((collection.hooks?.afterDelete as CollectionAfterDeleteHook[]) ?? []),
    buildAfterDeleteRevalidate(slug, revalidateOptions),
  ]
  return {
    ...collection,
    hooks: {
      ...(collection.hooks ?? {}),
      afterChange,
      afterDelete,
    },
  }
}

export const navigationPlugin = (options: NavigationPluginOptions): Plugin => {
  const allowedCollections = Array.from(new Set(options.collections ?? []))
  const targetGlobals = new Set(options.globals ?? [])

  return (config: Config): Config => {
    if (allowedCollections.length === 0 && targetGlobals.size === 0) {
      return config
    }

    const navItemsField = buildNavItemsField({ allowedCollections })

    const updatedGlobals = (config.globals ?? []).map((global) =>
      targetGlobals.has(global.slug) ? applyToGlobal(global, navItemsField) : global,
    )

    const allowedSet = new Set(allowedCollections)
    const updatedCollections = (config.collections ?? []).map((collection) =>
      allowedSet.has(collection.slug) ? attachRevalidationHooks(collection) : collection,
    )

    const endpoints = [
      ...(config.endpoints ?? []),
      buildCollectionFieldsEndpoint(allowedCollections),
    ]

    return {
      ...config,
      collections: updatedCollections,
      globals: updatedGlobals,
      endpoints,
    }
  }
}

export type { NavigationPluginOptions } from './types'
export { resolveNavItems } from './resolveNavItems'
export type { RawNavItem } from './resolveNavItems'
export type {
  ResolvedDropdownRow,
  ResolvedLeafLink,
  ResolvedLinkRow,
  ResolvedNavItem,
} from './types'

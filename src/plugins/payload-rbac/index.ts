import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Config,
  Field,
  GlobalConfig,
  Plugin,
} from 'payload'

import {
  accessTagsFieldName,
  buildAccessTagsField,
  buildCollectionAccess,
  buildGlobalAccess,
  isSuperAdmin,
  type BaseAccess,
  type GlobalBaseAccess,
  type RbacAccessOptions,
} from './access'
import { buildAccessTagsCollection } from './collections/accessTags'
import { buildRolesCollection } from './collections/roles'

type RbacPluginOptions = {
  collections: string[]
  /**
   * Subset of `collections` that should also receive the `accessTags` relationship
   * field and have their writes scoped by tag rules. Defaults to all `collections`.
   * Set explicitly to exclude collections where a public-facing tag field would be
   * confusing (e.g. `form-submissions`, `redirects`).
   */
  tagAccessCollections?: string[]
  /**
   * Globals to gate by RBAC. Each named global gets `update` access restricted to
   * super admins or roles whose `collectionPermissions` grant `'update'` on a row
   * matching the global's slug. `read` is delegated to the global's existing
   * `access.read`. Globals share the role editor's `collection` dropdown with
   * collections; assigning `'create'` or `'delete'` on a global row is a no-op.
   */
  globals?: string[]
  userCollectionSlug?: string
  rolesCollectionSlug?: string
  accessTagsCollectionSlug?: string
  superAdminField?: string
  requireTagsForWrite?: string[]
}

type UserCollectionOptions = {
  userCollectionSlug: string
  rolesCollectionSlug: string
  superAdminField: string
}

const isNamedField = (field: Field): field is Field & { name: string } => {
  return 'name' in field && typeof (field as { name?: unknown }).name === 'string'
}

const ensureField = (fields: Field[] | undefined, field: Field): Field[] => {
  const existingFields = fields ?? []
  const fieldName = isNamedField(field) ? field.name : null

  if (
    fieldName &&
    existingFields.some(
      (existingField) => isNamedField(existingField) && existingField.name === fieldName,
    )
  ) {
    return existingFields
  }

  return [...existingFields, field]
}

const buildCollectionLabel = (slug: string): string => {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const buildCollectionOptions = (slugs: string[]): { label: string; value: string }[] => {
  const unique = Array.from(new Set(slugs))

  return unique.map((slug) => ({
    label: buildCollectionLabel(slug),
    value: slug,
  }))
}

export const ensureFirstUserIsSuperAdmin = (
  userCollectionSlug: string,
  superAdminField: string,
): CollectionBeforeChangeHook => {
  return async ({ data, req, operation }) => {
    if (operation !== 'create') {
      return data
    }

    const existingUsers = await req.payload.find({
      collection: userCollectionSlug as CollectionSlug,
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existingUsers.totalDocs > 0) {
      return data
    }

    return {
      ...data,
      [superAdminField]: true,
    }
  }
}

const applyUserFields = (
  collection: CollectionConfig,
  { rolesCollectionSlug, superAdminField }: UserCollectionOptions,
): Field[] => {
  const fields = collection.fields ?? []

  const restrictToSuperAdmin = ({ req }: { req: { user?: unknown } }) =>
    isSuperAdmin(req.user, superAdminField)
  const writeAccess = {
    create: restrictToSuperAdmin,
    update: restrictToSuperAdmin,
  }

  const superAdminFieldConfig: Field = {
    name: superAdminField,
    type: 'checkbox',
    defaultValue: false,
    saveToJWT: true,
    access: writeAccess,
    admin: {
      description: 'Grants full RBAC access across collections. Base access rules still apply.',
    },
  }

  const rolesFieldConfig: Field = {
    name: 'roles',
    type: 'relationship',
    relationTo: rolesCollectionSlug as CollectionSlug,
    hasMany: true,
    saveToJWT: true,
    access: writeAccess,
    admin: {
      description: 'Roles that grant collection and tag permissions.',
    },
  }

  const withSuperAdmin = ensureField(fields, superAdminFieldConfig)
  return ensureField(withSuperAdmin, rolesFieldConfig)
}

const applyUserCollection = (
  collection: CollectionConfig,
  options: RbacAccessOptions & UserCollectionOptions,
): CollectionConfig => {
  const baseAccess = collection.access as BaseAccess | undefined
  const rbacAccess = buildCollectionAccess({
    collection: options.userCollectionSlug,
    baseAccess,
    options,
    requireTagsForWrite: false,
    includeTagAccess: false,
    adminAccess: 'authenticated',
    selfUpdateField: 'id',
  })

  return {
    ...collection,
    fields: applyUserFields(collection, options),
    access: {
      ...(baseAccess ?? {}),
      ...rbacAccess,
    },
    hooks: {
      ...(collection.hooks ?? {}),
      beforeChange: [
        ...((collection.hooks?.beforeChange as CollectionBeforeChangeHook[]) ?? []),
        ensureFirstUserIsSuperAdmin(options.userCollectionSlug, options.superAdminField),
      ],
    },
  }
}

const applyRbacToCollection = (
  collection: CollectionConfig,
  options: RbacAccessOptions,
  requireTagsForWrite: boolean,
  includeTagAccess: boolean,
): CollectionConfig => {
  const baseAccess = collection.access as BaseAccess | undefined

  return {
    ...collection,
    fields: includeTagAccess
      ? ensureField(collection.fields ?? [], buildAccessTagsField(options.accessTagsCollectionSlug))
      : collection.fields,
    access: {
      ...(baseAccess ?? {}),
      ...buildCollectionAccess({
        collection: collection.slug,
        baseAccess,
        options,
        requireTagsForWrite,
        includeTagAccess,
      }),
    },
  }
}

const applyRbacToGlobal = (global: GlobalConfig, options: RbacAccessOptions): GlobalConfig => {
  const baseAccess = global.access as GlobalBaseAccess | undefined

  return {
    ...global,
    access: {
      ...(baseAccess ?? {}),
      ...buildGlobalAccess({
        globalSlug: global.slug,
        baseAccess,
        options,
      }),
    },
  }
}

export const rbacPlugin = (options: RbacPluginOptions): Plugin => {
  return (config: Config): Config => {
    const userCollectionSlug = options.userCollectionSlug ?? 'users'
    const rolesCollectionSlug = options.rolesCollectionSlug ?? 'roles'
    const accessTagsCollectionSlug = options.accessTagsCollectionSlug ?? 'access-tags'
    const superAdminField = options.superAdminField ?? 'superAdmin'
    const rawCollectionSlugs = options.collections ?? []
    const requireTagsForWrite = new Set(options.requireTagsForWrite ?? [])

    if (rawCollectionSlugs.length === 0) {
      return config
    }

    const reservedSlugs = new Set([rolesCollectionSlug, accessTagsCollectionSlug])
    const collectionSlugs = rawCollectionSlugs.filter((slug) => !reservedSlugs.has(slug))
    const tagAccessCollections = new Set(
      options.tagAccessCollections
        ? options.tagAccessCollections.filter((slug) => collectionSlugs.includes(slug))
        : collectionSlugs,
    )
    const globalSlugs = options.globals ?? []

    const accessOptions: RbacAccessOptions = {
      rolesCollectionSlug,
      accessTagsCollectionSlug,
      superAdminField,
    }

    const collectionOptions = buildCollectionOptions([
      ...collectionSlugs,
      userCollectionSlug,
      ...globalSlugs,
    ])

    const updatedCollections = (config.collections ?? []).map((collection) => {
      if (collection.slug === rolesCollectionSlug || collection.slug === accessTagsCollectionSlug) {
        return collection
      }

      if (collection.slug === userCollectionSlug) {
        return applyUserCollection(collection, {
          ...accessOptions,
          userCollectionSlug,
          rolesCollectionSlug,
          superAdminField,
        })
      }

      if (collectionSlugs.includes(collection.slug)) {
        return applyRbacToCollection(
          collection,
          accessOptions,
          requireTagsForWrite.has(collection.slug),
          tagAccessCollections.has(collection.slug),
        )
      }

      return collection
    })

    if (!updatedCollections.some((collection) => collection.slug === rolesCollectionSlug)) {
      updatedCollections.push(
        buildRolesCollection({
          slug: rolesCollectionSlug,
          accessTagsCollectionSlug,
          collectionOptions,
          superAdminField,
        }),
      )
    }

    if (!updatedCollections.some((collection) => collection.slug === accessTagsCollectionSlug)) {
      updatedCollections.push(
        buildAccessTagsCollection({
          slug: accessTagsCollectionSlug,
          superAdminField,
        }),
      )
    }

    const updatedGlobals = (config.globals ?? []).map((global) =>
      globalSlugs.includes(global.slug) ? applyRbacToGlobal(global, accessOptions) : global,
    )

    return {
      ...config,
      collections: updatedCollections,
      globals: updatedGlobals,
    }
  }
}

export type { RbacPluginOptions }
export { accessTagsFieldName }

import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  Config,
  Field,
  FieldAccess,
  GlobalConfig,
  Plugin,
} from 'payload'
import { Forbidden } from 'payload'
import type { User } from '@/payload-types'

import {
  buildAccessTagsField,
  buildCollectionAccess,
  buildGlobalAccess,
  isSuperAdmin,
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
  requireTagsForWrite?: string[]
}

const isNamedField = (field: Field): field is Field & { name: string } => {
  return 'name' in field && typeof field.name === 'string'
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

export const ensureFirstUserIsSuperAdmin: CollectionBeforeChangeHook<User> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') {
    return data
  }

  const transactionID = await req.transactionID
  const session = transactionID ? req.payload.db.sessions[transactionID] : undefined
  if (!session) throw new Error('User creation requires a database transaction')

  // Hold the bootstrap lock until Payload commits or rolls back the user creation.
  await req.payload.db.execute({
    db: session.db,
    raw: "SELECT pg_advisory_xact_lock(hashtext('payload-rbac:first-user'))",
  })

  const existingUsers = await req.payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (existingUsers.totalDocs > 0) {
    // A concurrent first-register request may have passed Payload's earlier empty-user check.
    if (!req.user && req.payloadAPI !== 'local') throw new Forbidden(req.t)
    return data
  }

  return {
    ...data,
    superAdmin: true,
  }
}

const applyUserFields = (collection: CollectionConfig): Field[] => {
  const fields = collection.fields ?? []

  const restrictToSuperAdmin: FieldAccess = ({ req }) => isSuperAdmin(req.user)
  const writeAccess = {
    create: restrictToSuperAdmin,
    update: restrictToSuperAdmin,
  }

  const superAdminFieldConfig: Field = {
    name: 'superAdmin',
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
    relationTo: 'roles',
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

const applyUserCollection = (collection: CollectionConfig): CollectionConfig => {
  const baseAccess = collection.access
  const rbacAccess = buildCollectionAccess({
    collection: 'users',
    baseAccess,
    requireTagsForWrite: false,
    includeTagAccess: false,
    selfUpdateField: 'id',
  })

  return {
    ...collection,
    fields: applyUserFields(collection),
    access: {
      ...(baseAccess ?? {}),
      ...rbacAccess,
    },
    hooks: {
      ...(collection.hooks ?? {}),
      beforeChange: [...(collection.hooks?.beforeChange ?? []), ensureFirstUserIsSuperAdmin],
    },
  }
}

const applyRbacToCollection = (
  collection: CollectionConfig,
  requireTagsForWrite: boolean,
  includeTagAccess: boolean,
): CollectionConfig => {
  const baseAccess = collection.access

  return {
    ...collection,
    fields: includeTagAccess
      ? ensureField(collection.fields ?? [], buildAccessTagsField())
      : collection.fields,
    access: {
      ...(baseAccess ?? {}),
      ...buildCollectionAccess({
        collection: collection.slug,
        baseAccess,
        requireTagsForWrite,
        includeTagAccess,
      }),
    },
  }
}

const applyRbacToGlobal = (global: GlobalConfig): GlobalConfig => {
  const baseAccess = global.access

  return {
    ...global,
    access: {
      ...(baseAccess ?? {}),
      ...buildGlobalAccess({
        globalSlug: global.slug,
        baseAccess,
      }),
    },
  }
}

export const rbacPlugin = (options: RbacPluginOptions): Plugin => {
  return (config: Config): Config => {
    const rawCollectionSlugs = options.collections ?? []
    const requireTagsForWrite = new Set(options.requireTagsForWrite ?? [])

    if (rawCollectionSlugs.length === 0) {
      return config
    }

    const reservedSlugs = new Set(['roles', 'access-tags'])
    const collectionSlugs = rawCollectionSlugs.filter((slug) => !reservedSlugs.has(slug))
    const tagAccessCollections = new Set(
      options.tagAccessCollections
        ? options.tagAccessCollections.filter((slug) => collectionSlugs.includes(slug))
        : collectionSlugs,
    )
    const globalSlugs = options.globals ?? []

    const collectionOptions = buildCollectionOptions([...collectionSlugs, 'users', ...globalSlugs])

    const updatedCollections = (config.collections ?? []).map((collection) => {
      if (collection.slug === 'roles' || collection.slug === 'access-tags') {
        return collection
      }

      if (collection.slug === 'users') {
        return applyUserCollection(collection)
      }

      if (collectionSlugs.includes(collection.slug)) {
        return applyRbacToCollection(
          collection,
          requireTagsForWrite.has(collection.slug),
          tagAccessCollections.has(collection.slug),
        )
      }

      return collection
    })

    if (!updatedCollections.some((collection) => collection.slug === 'roles')) {
      updatedCollections.push(buildRolesCollection({ collectionOptions }))
    }

    if (!updatedCollections.some((collection) => collection.slug === 'access-tags')) {
      updatedCollections.push(buildAccessTagsCollection())
    }

    const updatedGlobals = (config.globals ?? []).map((global) =>
      globalSlugs.includes(global.slug) ? applyRbacToGlobal(global) : global,
    )

    return {
      ...config,
      collections: updatedCollections,
      globals: updatedGlobals,
    }
  }
}

export type { RbacPluginOptions }

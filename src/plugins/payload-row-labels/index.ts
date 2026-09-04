import type { ArrayField, CollectionConfig, Field, Option, Plugin } from 'payload'
import { fieldAffectsData, fieldHasSubFields } from 'payload/shared'

import type { AutoArrayRowLabelCandidate } from './AutoArrayRowLabel'

type AutoArrayRowLabelsPluginOptions = {
  excludePaths?: string[]
}

const defaultPreferredFields = [
  'title',
  'name',
  'label',
  'heading',
  'collection',
  'tag',
  'team',
  'person',
  'member',
  'positionTitle',
  'role',
  'year',
  'date',
]

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toLabelString = (label: unknown): string | null => {
  if (typeof label === 'string') {
    return label
  }

  if (isRecord(label)) {
    const firstValue = Object.values(label).find((value) => typeof value === 'string')
    return typeof firstValue === 'string' ? firstValue : null
  }

  return null
}

const toTitleCase = (value: string): string => {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const singularize = (value: string): string => {
  if (/ies$/i.test(value)) {
    return value.replace(/ies$/i, 'y')
  }

  if (/s$/i.test(value) && !/ss$/i.test(value)) {
    return value.slice(0, -1)
  }

  return value
}

const getFallbackPrefix = (field: ArrayField): string =>
  singularize(
    toLabelString(field.labels?.singular) ?? toLabelString(field.label) ?? toTitleCase(field.name),
  )

const getOptionLabel = (option: Option): { label: string; value: string } | null => {
  if (typeof option === 'string') {
    return { label: option, value: option }
  }

  const value = 'value' in option ? option.value : null
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  return {
    label: toLabelString(option.label) ?? String(value),
    value: String(value),
  }
}

const getSelectOptions = (field: Field): Record<string, string> | undefined => {
  if (field.type !== 'select' || !Array.isArray(field.options)) {
    return undefined
  }

  return field.options.reduce<Record<string, string>>((options, option) => {
    const normalized = getOptionLabel(option)
    if (normalized) {
      options[normalized.value] = normalized.label
    }
    return options
  }, {})
}

const getRelationCollection = (field: Field): string | null => {
  if (field.type !== 'relationship' && field.type !== 'upload') {
    return null
  }

  const relationTo = field.relationTo
  return typeof relationTo === 'string' ? relationTo : null
}

const getCollection = (collections: CollectionConfig[] | undefined, slug: string) => {
  return collections?.find((collection) => collection.slug === slug)
}

const isValueCandidateField = (field: Field): boolean => {
  return ['checkbox', 'date', 'email', 'number', 'radio', 'select', 'text', 'textarea'].includes(
    field.type,
  )
}

const getFieldRank = (fieldName: string, preferredFields: string[]): number => {
  const rank = preferredFields.indexOf(fieldName)
  return rank === -1 ? preferredFields.length : rank
}

const buildCandidates = (
  fields: Field[],
  collections: CollectionConfig[] | undefined,
  preferredFields: string[],
): AutoArrayRowLabelCandidate[] => {
  const relationshipCandidates = fields
    .filter(fieldAffectsData)
    .map((field): AutoArrayRowLabelCandidate | null => {
      const relationTo = getRelationCollection(field)
      if (!relationTo) {
        return null
      }

      const collection = getCollection(collections, relationTo)
      return {
        kind: 'relationship',
        fallbackPrefix:
          toLabelString(collection?.labels?.singular) ??
          toLabelString(collection?.admin?.useAsTitle) ??
          toTitleCase(relationTo),
        labelField: collection?.admin?.useAsTitle,
        path: field.name,
        relationTo,
      }
    })
    .filter((candidate): candidate is AutoArrayRowLabelCandidate => Boolean(candidate))

  const valueCandidates = fields
    .filter(fieldAffectsData)
    .filter(isValueCandidateField)
    .sort((left, right) => {
      return getFieldRank(left.name, preferredFields) - getFieldRank(right.name, preferredFields)
    })
    .map((field): AutoArrayRowLabelCandidate => {
      return {
        kind: 'value',
        options: getSelectOptions(field),
        path: field.name,
      }
    })

  return [...relationshipCandidates, ...valueCandidates]
}

const withRowLabel = (field: ArrayField, candidates: AutoArrayRowLabelCandidate[]): ArrayField => ({
  ...field,
  admin: {
    ...field.admin,
    components: {
      ...field.admin?.components,
      RowLabel: {
        path: '@/plugins/payload-row-labels/AutoArrayRowLabel',
        exportName: 'AutoArrayRowLabel',
        clientProps: { candidates, fallbackPrefix: getFallbackPrefix(field) },
      },
    },
  },
})

const transformFields = (
  fields: Field[],
  collections: CollectionConfig[],
  excludePaths: string[],
  pathPrefix: string,
): Field[] =>
  fields.map((field) => {
    const fieldPath = fieldAffectsData(field) ? `${pathPrefix}.${field.name}` : pathPrefix
    let nextField = field

    if (fieldHasSubFields(nextField)) {
      nextField = {
        ...nextField,
        fields: transformFields(nextField.fields, collections, excludePaths, fieldPath),
      }
    }
    if (nextField.type === 'tabs') {
      nextField = {
        ...nextField,
        tabs: nextField.tabs.map((tab, index) => ({
          ...tab,
          fields: transformFields(
            tab.fields,
            collections,
            excludePaths,
            `${fieldPath}.tabs.${index}`,
          ),
        })),
      }
    }
    if (nextField.type === 'blocks') {
      nextField = {
        ...nextField,
        blocks: nextField.blocks.map((block) => ({
          ...block,
          fields: transformFields(
            block.fields,
            collections,
            excludePaths,
            `${fieldPath}.${block.slug}`,
          ),
        })),
      }
    }
    if (
      nextField.type !== 'array' ||
      excludePaths.includes(fieldPath) ||
      nextField.admin?.components?.RowLabel
    ) {
      return nextField
    }
    const candidates = buildCandidates(nextField.fields, collections, defaultPreferredFields)
    return candidates.length ? withRowLabel(nextField, candidates) : nextField
  })

export const autoArrayRowLabelsPlugin =
  ({ excludePaths = [] }: AutoArrayRowLabelsPluginOptions = {}): Plugin =>
  (config) => {
    const collections = config.collections ?? []
    return {
      ...config,
      collections: collections.map((collection) => ({
        ...collection,
        fields: transformFields(collection.fields, collections, excludePaths, collection.slug),
      })),
      globals: config.globals?.map((global) => ({
        ...global,
        fields: transformFields(global.fields, collections, excludePaths, global.slug),
      })),
    }
  }

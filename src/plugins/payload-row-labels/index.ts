import type { CollectionConfig, Config, Field, GlobalConfig, Option, Plugin } from 'payload'

import type { AutoArrayRowLabelCandidate } from './AutoArrayRowLabel'

type AutoArrayRowLabelsPluginOptions = {
  componentExportName?: string
  componentPath?: string
  excludePaths?: string[]
  overrideExisting?: boolean
  preferredFields?: string[]
}

type FieldWithName = Field & { name: string }
type FieldWithFields = Field & { fields: Field[] }
type FieldWithTabs = Field & { tabs: { fields?: Field[] }[] }
type FieldWithBlocks = Field & { blocks: { fields: Field[] }[] }

const defaultComponentPath = '@/plugins/payload-row-labels/AutoArrayRowLabel'
const defaultComponentExportName = 'AutoArrayRowLabel'

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

const hasName = (field: Field): field is FieldWithName => {
  return 'name' in field && typeof field.name === 'string'
}

const hasFields = (field: Field): field is FieldWithFields => {
  return 'fields' in field && Array.isArray(field.fields)
}

const hasTabs = (field: Field): field is FieldWithTabs => {
  return 'tabs' in field && Array.isArray(field.tabs)
}

const hasBlocks = (field: Field): field is FieldWithBlocks => {
  return 'blocks' in field && Array.isArray(field.blocks)
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

const getFallbackPrefix = (field: Field): string => {
  const labels = isRecord((field as { labels?: unknown }).labels)
    ? ((field as { labels?: Record<string, unknown> }).labels ?? {})
    : {}
  const label =
    toLabelString(labels.singular) ??
    toLabelString((field as { label?: unknown }).label) ??
    (hasName(field) ? toTitleCase(field.name) : 'Item')

  return singularize(label)
}

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

  const relationTo = (field as { relationTo?: unknown }).relationTo
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
    .filter(hasName)
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
    .filter(hasName)
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

const hasRowLabel = (field: Field): boolean => {
  return Boolean(
    isRecord((field as { admin?: unknown }).admin) &&
    isRecord((field as { admin?: { components?: unknown } }).admin?.components) &&
    (field as { admin?: { components?: { RowLabel?: unknown } } }).admin?.components?.RowLabel,
  )
}

const withRowLabel = (
  field: Field,
  candidates: AutoArrayRowLabelCandidate[],
  componentExportName: string,
  componentPath: string,
): Field => {
  return {
    ...field,
    admin: {
      ...(isRecord((field as { admin?: unknown }).admin)
        ? (field as { admin?: object }).admin
        : {}),
      components: {
        ...((field as { admin?: { components?: object } }).admin?.components ?? {}),
        RowLabel: {
          path: componentPath,
          exportName: componentExportName,
          clientProps: {
            candidates,
            fallbackPrefix: getFallbackPrefix(field),
          },
        },
      },
    },
  } as Field
}

const transformFields = (
  fields: Field[] | undefined,
  options: Required<
    Pick<
      AutoArrayRowLabelsPluginOptions,
      'componentExportName' | 'componentPath' | 'preferredFields'
    >
  > &
    Pick<AutoArrayRowLabelsPluginOptions, 'excludePaths' | 'overrideExisting'>,
  collections: CollectionConfig[] | undefined,
  pathPrefix: string,
): Field[] | undefined => {
  return fields?.map((field) => {
    const fieldPath = hasName(field) ? `${pathPrefix}.${field.name}` : pathPrefix
    let nextField = field

    if (hasFields(nextField)) {
      nextField = {
        ...nextField,
        fields:
          transformFields(nextField.fields, options, collections, fieldPath) ?? nextField.fields,
      } as Field
    }

    if (hasTabs(nextField)) {
      nextField = {
        ...nextField,
        tabs: nextField.tabs.map((tab, index) => ({
          ...tab,
          fields: transformFields(tab.fields, options, collections, `${fieldPath}.tabs.${index}`),
        })),
      } as Field
    }

    if (hasBlocks(nextField)) {
      nextField = {
        ...nextField,
        blocks: nextField.blocks.map((block, index) => {
          const blockPath = 'slug' in block ? block.slug : String(index)

          return {
            ...block,
            fields:
              transformFields(block.fields, options, collections, `${fieldPath}.${blockPath}`) ??
              [],
          }
        }),
      } as Field
    }

    if (nextField.type !== 'array' || !hasFields(nextField)) {
      return nextField
    }

    if (options.excludePaths?.includes(fieldPath)) {
      return nextField
    }

    if (!options.overrideExisting && hasRowLabel(nextField)) {
      return nextField
    }

    const candidates = buildCandidates(nextField.fields, collections, options.preferredFields)
    if (candidates.length === 0) {
      return nextField
    }

    return withRowLabel(nextField, candidates, options.componentExportName, options.componentPath)
  })
}

const transformCollection = (
  collection: CollectionConfig,
  options: Required<
    Pick<
      AutoArrayRowLabelsPluginOptions,
      'componentExportName' | 'componentPath' | 'preferredFields'
    >
  > &
    Pick<AutoArrayRowLabelsPluginOptions, 'excludePaths' | 'overrideExisting'>,
  collections: CollectionConfig[] | undefined,
): CollectionConfig => ({
  ...collection,
  fields:
    transformFields(collection.fields, options, collections, collection.slug) ?? collection.fields,
})

const transformGlobal = (
  global: GlobalConfig,
  options: Required<
    Pick<
      AutoArrayRowLabelsPluginOptions,
      'componentExportName' | 'componentPath' | 'preferredFields'
    >
  > &
    Pick<AutoArrayRowLabelsPluginOptions, 'excludePaths' | 'overrideExisting'>,
  collections: CollectionConfig[] | undefined,
): GlobalConfig => ({
  ...global,
  fields: transformFields(global.fields, options, collections, global.slug) ?? global.fields,
})

export const autoArrayRowLabelsPlugin = (
  pluginOptions: AutoArrayRowLabelsPluginOptions = {},
): Plugin => {
  return (config: Config): Config => {
    const options = {
      componentExportName: pluginOptions.componentExportName ?? defaultComponentExportName,
      componentPath: pluginOptions.componentPath ?? defaultComponentPath,
      excludePaths: pluginOptions.excludePaths,
      overrideExisting: pluginOptions.overrideExisting,
      preferredFields: pluginOptions.preferredFields ?? defaultPreferredFields,
    }

    return {
      ...config,
      collections: config.collections?.map((collection) =>
        transformCollection(collection, options, config.collections),
      ),
      globals: config.globals?.map((global) =>
        transformGlobal(global, options, config.collections),
      ),
    }
  }
}

export type { AutoArrayRowLabelsPluginOptions }

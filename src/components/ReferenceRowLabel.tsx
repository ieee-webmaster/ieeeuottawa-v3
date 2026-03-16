'use client'

import { useEffect, useState } from 'react'
import { useConfig, useFormFields, useLocale, useRowLabel } from '@payloadcms/ui'
import type { RowLabelProps } from '@payloadcms/ui'
import type { CollectionSlug } from 'payload'

type LocalizedValue = Record<string, string>

type ReferenceValue =
  | number
  | string
  | { id?: number | string | null; value?: number | string | null }
  | null
  | undefined

export type ReferenceRowLabelConfig = {
  collection: CollectionSlug
  fallbackPrefix?: string
  labelField?: string
  referenceField: string
}

const getReferenceId = (value: ReferenceValue): null | string => {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value)
  }

  if (value?.id != null) {
    return String(value.id)
  }

  if (value?.value != null) {
    return String(value.value)
  }

  return null
}

const getLabel = (
  value: LocalizedValue | null | string | undefined,
  locale?: string,
): null | string => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (locale && value[locale]) {
    return value[locale]
  }

  return Object.values(value)[0] ?? null
}

export const createReferenceRowLabel = ({
  collection,
  fallbackPrefix,
  labelField,
  referenceField,
}: ReferenceRowLabelConfig): React.FC<RowLabelProps> => {
  const ReferenceRowLabel: React.FC<RowLabelProps> = () => {
    const { config, getEntityConfig } = useConfig()
    const { path, rowNumber } = useRowLabel()
    const locale = useLocale()?.code
    const referenceValue = useFormFields(
      ([fields]) => fields[`${path}.${referenceField}`]?.value as ReferenceValue,
    )
    const referenceId = getReferenceId(referenceValue)
    const [label, setLabel] = useState<null | string>(null)

    const entityConfig = getEntityConfig({ collectionSlug: collection })
    const resolvedLabelField = labelField ?? entityConfig?.admin?.useAsTitle ?? 'id'
    const resolvedFallbackPrefix = fallbackPrefix ?? entityConfig?.labels?.singular ?? 'Item'
    const apiRoute = config.routes.api.replace(/\/$/, '')

    useEffect(() => {
      let cancelled = false

      if (!referenceId) {
        setLabel(null)
        return
      }

      setLabel(null)

      const loadLabel = async () => {
        try {
          const search = new URLSearchParams({ depth: '0' })

          if (locale) {
            search.set('locale', locale)
          }

          const response = await fetch(
            `${apiRoute}/${collection}/${referenceId}?${search.toString()}`,
          )

          if (!response.ok) {
            throw new Error('Failed to load referenced document')
          }

          const doc = (await response.json()) as Record<
            string,
            LocalizedValue | null | string | undefined
          >

          if (!cancelled) {
            setLabel(getLabel(doc[resolvedLabelField], locale))
          }
        } catch {
          if (!cancelled) {
            setLabel(null)
          }
        }
      }

      void loadLabel()

      return () => {
        cancelled = true
      }
    }, [apiRoute, collection, locale, referenceId, resolvedLabelField])

    return (
      <div>
        {label || `${resolvedFallbackPrefix} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}
      </div>
    )
  }

  return ReferenceRowLabel
}

'use client'

import { useEffect, useState } from 'react'
import { useConfig, useFormFields, useLocale, useRowLabel } from '@payloadcms/ui'
import type { RowLabelProps } from '@payloadcms/ui'

export type AutoArrayRowLabelCandidate =
  | {
      kind: 'relationship'
      fallbackPrefix?: string
      labelField?: string
      path: string
      relationTo: string
    }
  | {
      kind: 'value'
      options?: Record<string, string>
      path: string
    }

export type AutoArrayRowLabelProps = RowLabelProps & {
  candidates?: AutoArrayRowLabelCandidate[]
  fallbackPrefix?: string
}

type LocalizedValue = Record<string, unknown>

const getLocalizedLabel = (value: unknown, locale?: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const localized = value as LocalizedValue
  const localeValue = locale ? localized[locale] : undefined
  if (localeValue !== undefined) {
    return getLocalizedLabel(localeValue, locale)
  }

  for (const nextValue of Object.values(localized)) {
    const label = getLocalizedLabel(nextValue, locale)
    if (label) {
      return label
    }
  }

  return null
}

const getValueLabel = (
  value: unknown,
  candidate: Extract<AutoArrayRowLabelCandidate, { kind: 'value' }>,
  locale?: string,
): string | null => {
  if (Array.isArray(value)) {
    const labels = value
      .map((entry) => getValueLabel(entry, candidate, locale))
      .filter((label): label is string => Boolean(label))

    return labels.length > 0 ? labels.join(', ') : null
  }

  const label = getLocalizedLabel(value, locale)
  if (!label) {
    return null
  }

  return candidate.options?.[label] ?? label
}

const getReferenceId = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') {
    return String(value)
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as { id?: unknown; value?: unknown }
  if (typeof record.id === 'number' || typeof record.id === 'string') {
    return String(record.id)
  }

  if (typeof record.value === 'number' || typeof record.value === 'string') {
    return String(record.value)
  }

  return null
}

const resolveRowLabel = (
  candidates: AutoArrayRowLabelCandidate[],
  fieldValues: Record<string, unknown>,
  locale?: string,
):
  | { label: string; lookup?: never }
  | {
      label?: never
      lookup: Extract<AutoArrayRowLabelCandidate, { kind: 'relationship' }> & { id: string }
    }
  | null => {
  for (const candidate of candidates) {
    const value = fieldValues[candidate.path]

    if (candidate.kind === 'value') {
      const label = getValueLabel(value, candidate, locale)
      if (label) {
        return { label }
      }

      continue
    }

    const id = getReferenceId(value)
    if (id) {
      return { lookup: { ...candidate, id } }
    }
  }

  return null
}

export const AutoArrayRowLabel: React.FC<AutoArrayRowLabelProps> = ({
  candidates = [],
  fallbackPrefix = 'Item',
}) => {
  const { config } = useConfig()
  const { path, rowNumber } = useRowLabel<Record<string, unknown>>()
  const locale = useLocale()?.code
  const fieldValues = useFormFields(([fields]) => {
    return candidates.reduce<Record<string, unknown>>((values, candidate) => {
      values[candidate.path] = fields[`${path}.${candidate.path}`]?.value
      return values
    }, {})
  })
  const resolvedLabel = resolveRowLabel(candidates, fieldValues, locale)
  const lookup = resolvedLabel && 'lookup' in resolvedLabel ? resolvedLabel.lookup : null
  const directLabel = resolvedLabel && 'label' in resolvedLabel ? resolvedLabel.label : null
  const [remoteLabel, setRemoteLabel] = useState<string | null>(null)
  const apiRoute = config.routes.api.replace(/\/$/, '')
  const lookupId = lookup?.id
  const lookupLabelField = lookup?.labelField
  const lookupRelationTo = lookup?.relationTo

  useEffect(() => {
    let cancelled = false

    if (!lookupId || !lookupRelationTo) {
      setRemoteLabel(null)
      return
    }

    setRemoteLabel(null)

    const loadLabel = async () => {
      try {
        const search = new URLSearchParams({ depth: '0' })

        if (locale) {
          search.set('locale', locale)
        }

        const response = await fetch(
          `${apiRoute}/${encodeURIComponent(lookupRelationTo)}/${encodeURIComponent(lookupId)}?${search.toString()}`,
        )

        if (!response.ok) {
          throw new Error('Failed to load row label')
        }

        const doc = (await response.json()) as Record<string, unknown>
        const label = getLocalizedLabel(doc[lookupLabelField ?? 'id'], locale)

        if (!cancelled) {
          setRemoteLabel(label)
        }
      } catch {
        if (!cancelled) {
          setRemoteLabel(null)
        }
      }
    }

    void loadLabel()

    return () => {
      cancelled = true
    }
  }, [apiRoute, locale, lookupId, lookupLabelField, lookupRelationTo])

  const activePrefix = lookup?.fallbackPrefix ?? fallbackPrefix
  const fallback = `${activePrefix} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`

  return <div>{directLabel ?? remoteLabel ?? fallback}</div>
}

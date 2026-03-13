'use client'

import { useEffect, useState } from 'react'
import { useFormFields, useLocale, useRowLabel } from '@payloadcms/ui'
import type { RowLabelProps } from '@payloadcms/ui'

type TeamValue =
  | number
  | string
  | { id?: number | string | null; value?: number | string | null }
  | null
  | undefined

const getTeamId = (value: TeamValue): null | string => {
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

const getTeamName = (
  value: Record<string, string> | string | null | undefined,
  locale?: string,
) => {
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

export const RowLabel: React.FC<RowLabelProps> = () => {
  const { path, rowNumber } = useRowLabel()
  const locale = useLocale()?.code
  const teamValue = useFormFields(([fields]) => fields[`${path}.team`]?.value as TeamValue)
  const teamId = getTeamId(teamValue)
  const [label, setLabel] = useState<null | string>(null)

  useEffect(() => {
    let cancelled = false

    if (!teamId) {
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

        const response = await fetch(`/api/teams/${teamId}?${search.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to load team')
        }

        const team = (await response.json()) as { name?: Record<string, string> | string | null }

        if (!cancelled) {
          setLabel(getTeamName(team.name, locale))
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
  }, [locale, teamId])

  return <div>{label || `Team ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</div>
}

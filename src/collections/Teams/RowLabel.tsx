'use client'

import type { Team } from '@/payload-types'
import { useLocale, useRowLabel } from '@payloadcms/ui'
import type { RowLabelProps } from '@payloadcms/ui'

type LocalizedValue = Record<string, string>

type PositionRow = NonNullable<Team['positions']>[number]

type PositionTitle = LocalizedValue | string | null | undefined

const getLabel = (value: PositionTitle, locale?: string): null | string => {
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

export const TeamPositionRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<PositionRow>()
  const locale = useLocale()?.code
  const label = getLabel(data?.positionTitle, locale)
  const fallback = `Position ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`

  return <div>{label ?? fallback}</div>
}

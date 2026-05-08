'use client'

import { useRowLabel } from '@payloadcms/ui'

type LinkData = {
  label?: string | { [locale: string]: string | undefined }
}

type RowData = {
  kind?: 'link' | 'dropdown'
  link?: LinkData
  dropdownLabel?: string | { [locale: string]: string | undefined }
  dropdownMode?: 'manual' | 'automatic'
  collection?: string
  field?: string
}

const stringifyLocalized = (value: unknown): string | null => {
  if (typeof value === 'string') return value || null
  if (value && typeof value === 'object') {
    const first = Object.values(value as Record<string, unknown>).find(
      (entry) => typeof entry === 'string' && entry.length > 0,
    )
    return typeof first === 'string' ? first : null
  }
  return null
}

export const NavItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<RowData>()
  const index = String((rowNumber ?? 0) + 1).padStart(2, '0')

  if (data?.kind === 'dropdown') {
    const label = stringifyLocalized(data.dropdownLabel) ?? 'Dropdown'
    const detail =
      data.dropdownMode === 'automatic'
        ? `auto · ${data.collection ?? '—'}${data.field ? `.${data.field}` : ''}`
        : 'manual'
    return (
      <div>
        Item {index}: {label} <span style={{ opacity: 0.6 }}>({detail})</span>
      </div>
    )
  }

  const linkLabel = stringifyLocalized(data?.link?.label)
  return <div>Item {index}: {linkLabel ?? 'Link'}</div>
}

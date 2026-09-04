'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { Header } from '@/payload-types'

type RowData = NonNullable<Header['navItems']>[number]

export const NavItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<RowData>()
  const index = String((rowNumber ?? 0) + 1).padStart(2, '0')

  if (data?.kind === 'dropdown') {
    const label = data.dropdownLabel || 'Dropdown'
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

  const linkLabel = data?.link?.label
  return (
    <div>
      Item {index}: {linkLabel || 'Link'}
    </div>
  )
}

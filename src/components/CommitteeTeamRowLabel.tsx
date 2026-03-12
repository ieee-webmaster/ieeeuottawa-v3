'use client'

import type { RowLabelProps } from '@payloadcms/ui'
import { useRowLabel } from '@payloadcms/ui'

type TeamRow = {
  teamLabel?: string | null
}

export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<TeamRow>()

  return <div>{data?.teamLabel || `Team ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</div>
}

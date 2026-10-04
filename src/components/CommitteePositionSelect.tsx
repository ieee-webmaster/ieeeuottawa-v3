'use client'

import { useEffect, useState } from 'react'
import { SelectInput, useField, useFormFields, useLocale } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { resolveLocale } from '@/i18n/routing'
import {
  type CommitteePosition,
  getPositionTitle,
  resolveCommitteePosition,
  teamPositionsSchema,
} from '@/utilities/committeePositions'

export const CommitteePositionSelect: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const locale = resolveLocale(useLocale().code)
  const { disabled, value, setValue } = useField<string | null>({ path })
  const readOnly = Boolean(props.readOnly || field.admin?.readOnly || disabled)

  const [loaded, setLoaded] = useState<{
    teamId: string
    positions: CommitteePosition[]
  } | null>(null)

  // Watch the sibling 'team' field (one level up from members array)
  const teamId = useFormFields(([fields]) => {
    const teamPath = [...path.split('.').slice(0, -3), 'team'].join('.')
    const value = fields[teamPath]?.value
    return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined
  })
  const positions = loaded && loaded.teamId === teamId ? loaded.positions : []
  const options = positions.flatMap((position) => {
    const label = getPositionTitle(position, locale)
    return label && position.id ? [{ label, value: position.id }] : []
  })
  const selectedPosition = value ? resolveCommitteePosition(positions, value) : undefined
  // Display legacy selections without rewriting documents merely by opening the editor.
  const selectedValue = selectedPosition?.id || value || ''
  if (
    selectedValue &&
    loaded &&
    loaded.teamId === teamId &&
    !options.some(({ value }) => value === selectedValue)
  ) {
    options.push({ label: value || selectedValue, value: selectedValue })
  }
  const loading = Boolean(teamId && loaded?.teamId !== teamId)

  useEffect(() => {
    if (!teamId) return
    let cancelled = false

    const loadPositions = async () => {
      try {
        const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}?depth=0&locale=all`)

        if (!response.ok) {
          throw new Error('Failed to fetch team')
        }

        const result = teamPositionsSchema.safeParse(await response.json())
        if (!result.success) throw result.error

        if (!cancelled) setLoaded({ teamId, positions: result.data.positions ?? [] })
      } catch (error) {
        console.error('Error loading positions:', error)
        if (!cancelled) setLoaded({ teamId, positions: [] })
      }
    }

    void loadPositions()
    return () => {
      cancelled = true
    }
  }, [teamId])

  return (
    <SelectInput
      name={field.name}
      path={path}
      label={field.label}
      required={field.required}
      localized={field.localized}
      description={field.admin?.description}
      options={options}
      value={selectedValue}
      onChange={(next) =>
        setValue(next && !Array.isArray(next) && typeof next.value === 'string' ? next.value : null)
      }
      readOnly={readOnly || !teamId || loading}
    />
  )
}

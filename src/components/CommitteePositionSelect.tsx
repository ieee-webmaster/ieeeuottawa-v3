'use client'

import { useEffect, useState } from 'react'
import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { z } from 'zod'

const teamPositionsResponseSchema = z.object({
  positions: z.array(z.object({ positionTitle: z.string().nullish() })).nullish(),
})

export const CommitteePositionSelect: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { disabled, value, setValue } = useField<string | null>({ path })
  const readOnly = Boolean(props.readOnly || field.admin?.readOnly || disabled)

  const [loaded, setLoaded] = useState<{
    teamId: string
    options: { label: string; value: string }[]
  } | null>(null)

  // Watch the sibling 'team' field (one level up from members array)
  const teamId = useFormFields(([fields]) => {
    const teamPath = [...path.split('.').slice(0, -3), 'team'].join('.')
    const value = fields[teamPath]?.value
    return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined
  })
  const options = loaded && loaded.teamId === teamId ? loaded.options : []
  const loading = Boolean(teamId && loaded?.teamId !== teamId)

  useEffect(() => {
    if (!teamId) return
    let cancelled = false

    const loadPositions = async () => {
      try {
        const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}?depth=0`)

        if (!response.ok) {
          throw new Error('Failed to fetch team')
        }

        const result = teamPositionsResponseSchema.safeParse(await response.json())
        if (!result.success) throw result.error
        const positionOptions = (result.data.positions ?? []).flatMap(({ positionTitle }) =>
          positionTitle ? [{ label: positionTitle, value: positionTitle }] : [],
        )

        if (!cancelled) setLoaded({ teamId, options: positionOptions })
      } catch (error) {
        console.error('Error loading positions:', error)
        if (!cancelled) setLoaded({ teamId, options: [] })
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
      value={value ?? ''}
      onChange={(next) =>
        setValue(next && !Array.isArray(next) && typeof next.value === 'string' ? next.value : null)
      }
      readOnly={readOnly || !teamId || loading}
    />
  )
}

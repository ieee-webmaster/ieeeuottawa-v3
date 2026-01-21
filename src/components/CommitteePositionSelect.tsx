'use client'

import { useEffect, useState } from 'react'
import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

export const CommitteePositionSelect: SelectFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField({ path })
  
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Watch the sibling 'team' field (one level up from members array)
  const teamId = useFormFields(([fields]) => {
    const pathParts = path.split('.')
    // path: teams.0.members.0.role
    // We need: teams.0.team
    pathParts.pop() // Remove 'role' → [teams, 0, members, 0]
    pathParts.pop() // Remove members index → [teams, 0, members]
    pathParts.pop() // Remove 'members' → [teams, 0]
    pathParts.push('team')
    const teamPath = pathParts.join('.')
    return fields[teamPath]?.value
  })

  useEffect(() => {
    const loadPositions = async () => {
      if (!teamId) {
        setOptions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/teams/${teamId}?depth=0`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch team')
        }

        const team = await response.json()

        const positions = Array.isArray(team?.positions) ? team.positions : []
        const positionOptions = positions.map((pos: { positionTitle?: string; role?: string }) => {
          const label = pos.positionTitle ?? pos.role ?? 'Position'
          const value = pos.positionTitle ?? pos.role ?? label
          return { label, value }
        })

        setOptions(positionOptions)
      } catch (error) {
        console.error('Error loading positions:', error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadPositions()
  }, [teamId])

  const handleChange = (val: unknown) => {
    if (val && typeof val === 'object' && 'value' in val) {
      setValue(val.value || null)
    } else {
      setValue(val)
    }
  }

  return (
    <SelectInput
      {...props}
      name={field.name}
      options={options}
      value={value as string}
      onChange={handleChange}
      readOnly={!teamId || loading}
    />
  )
}

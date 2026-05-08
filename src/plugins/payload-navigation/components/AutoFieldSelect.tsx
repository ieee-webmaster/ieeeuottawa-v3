'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckboxInput, SelectInput, useConfig, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent, UIFieldClientComponent } from 'payload'

type FieldDescriptor = {
  name: string
  type: string
  label: string
}

const siblingPath = (path: string, name: string): string => {
  const parts = path.split('.')
  parts[parts.length - 1] = name
  return parts.join('.')
}

export const AutoFieldSelect: TextFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string | null>({ path })
  const { config } = useConfig()
  const apiRoute = config.routes.api.replace(/\/$/, '')

  const collectionPath = useMemo(() => siblingPath(path, 'collection'), [path])
  const collection = useFormFields(
    ([fields]) => fields[collectionPath]?.value as string | undefined,
  )

  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!collection) return

    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${apiRoute}/payload-navigation/collection-fields?slug=${encodeURIComponent(collection)}`,
        )
        if (!response.ok) throw new Error('Failed to load collection fields')
        const data = (await response.json()) as { fields?: FieldDescriptor[] }
        if (cancelled) return
        const next = (data.fields ?? []).map((entry) => ({
          label: entry.label === entry.name ? entry.name : `${entry.label} (${entry.name})`,
          value: entry.name,
        }))
        setOptions(next)
      } catch {
        if (!cancelled) setOptions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [apiRoute, collection])

  useEffect(() => {
    if (!value) return
    if (options.length === 0) return
    if (!options.some((option) => option.value === value)) {
      setValue(null)
    }
  }, [options, value, setValue])

  const handleChange = (next: unknown) => {
    if (next && typeof next === 'object' && 'value' in next) {
      setValue((next as { value: string | null }).value ?? null)
      return
    }
    setValue(typeof next === 'string' ? next : null)
  }

  return (
    <SelectInput
      {...props}
      name={field.name}
      path={path}
      label={field.label ?? 'Field'}
      options={collection ? options : []}
      value={value ?? ''}
      onChange={handleChange}
      readOnly={!collection || loading}
    />
  )
}

export const AutoNewTabCheckbox: UIFieldClientComponent = ({ path }) => {
  const newTabPath = useMemo(() => siblingPath(path, 'link.newTab'), [path])
  const { value, setValue } = useField<boolean | null>({ path: newTabPath })

  return (
    <CheckboxInput
      checked={value === true}
      label="Open generated links in new tab"
      name={newTabPath}
      onToggle={(event) => setValue(event.target.checked)}
    />
  )
}

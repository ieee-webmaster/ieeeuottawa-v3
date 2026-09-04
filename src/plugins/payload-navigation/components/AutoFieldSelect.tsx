'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckboxInput, SelectInput, useConfig, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent, UIFieldClientComponent } from 'payload'
import { collectionFieldsResponseSchema } from '../schemas'

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

  const collectionPath = siblingPath(path, 'collection')
  const collection = useFormFields(([fields]) => {
    const value = fields[collectionPath]?.value
    return typeof value === 'string' ? value : undefined
  })

  const [loaded, setLoaded] = useState<{
    collection: string
    options: { label: string; value: string }[]
  } | null>(null)
  const options = useMemo(
    () => (loaded && loaded.collection === collection ? loaded.options : []),
    [loaded, collection],
  )
  const loading = Boolean(collection && loaded?.collection !== collection)

  useEffect(() => {
    let cancelled = false

    if (!collection) return

    const load = async () => {
      try {
        const response = await fetch(
          `${apiRoute}/payload-navigation/collection-fields?slug=${encodeURIComponent(collection)}`,
        )
        if (!response.ok) throw new Error('Failed to load collection fields')
        const result = collectionFieldsResponseSchema.safeParse(await response.json())
        if (!result.success) throw result.error
        if (cancelled) return
        const next = result.data.fields.map((entry) => ({
          label: entry.label === entry.name ? entry.name : `${entry.label} (${entry.name})`,
          value: entry.name,
        }))
        setLoaded({ collection, options: next })
      } catch {
        if (!cancelled) setLoaded({ collection, options: [] })
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

  return (
    <SelectInput
      {...props}
      name={field.name}
      path={path}
      label={field.label ?? 'Field'}
      options={options}
      value={value ?? ''}
      onChange={(next) =>
        setValue(next && !Array.isArray(next) && typeof next.value === 'string' ? next.value : null)
      }
      readOnly={!collection || loading}
    />
  )
}

export const AutoNewTabCheckbox: UIFieldClientComponent = ({ path }) => {
  const newTabPath = siblingPath(path, 'link.newTab')
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

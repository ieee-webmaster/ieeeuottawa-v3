'use client'

import { useMemo } from 'react'
import { useFormFields } from '@payloadcms/ui'
import type { FieldDescriptionClientComponent } from 'payload'

import { inferUrls } from '../inferUrls'

const replaceLast = (path: string, name: string): string => {
  const parts = path.split('.')
  parts[parts.length - 1] = name
  return parts.join('.')
}

export const UrlInferenceDescription: FieldDescriptionClientComponent = ({ path }) => {
  const collectionPath = useMemo(() => replaceLast(path, 'collection'), [path])
  const basePath = useMemo(() => replaceLast(path, 'baseUrl'), [path])
  const specificPath = useMemo(() => replaceLast(path, 'specificUrl'), [path])

  const values = useFormFields(([fields]) => ({
    collection: fields[collectionPath]?.value as string | undefined,
    base: fields[basePath]?.value as string | undefined,
    specific: fields[specificPath]?.value as string | undefined,
  }))

  const inferred = inferUrls({
    collection: values.collection,
    base: values.base,
    specific: values.specific,
  })

  const isBase = path.split('.').pop() === 'baseUrl'
  const resolved = isBase ? inferred.baseUrl : inferred.specificUrl
  const purpose = isBase
    ? 'Listing/All link.'
    : 'Per-value entry. Use [value] as the placeholder for the field value.'

  return (
    <span>
      {purpose} Resolves to <code>{resolved}</code>.
    </span>
  )
}

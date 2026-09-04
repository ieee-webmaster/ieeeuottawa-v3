'use client'

import { useFormFields } from '@payloadcms/ui'
import type { FieldDescriptionClientComponent } from 'payload'

import { inferUrls } from '../inferUrls'

const replaceLast = (path: string, name: string): string => {
  const parts = path.split('.')
  parts[parts.length - 1] = name
  return parts.join('.')
}

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

export const UrlInferenceDescription: FieldDescriptionClientComponent = ({ path }) => {
  const collectionPath = replaceLast(path, 'collection')
  const basePath = replaceLast(path, 'baseUrl')
  const specificPath = replaceLast(path, 'specificUrl')

  const values = useFormFields(([fields]) => ({
    collection: stringValue(fields[collectionPath]?.value),
    base: stringValue(fields[basePath]?.value),
    specific: stringValue(fields[specificPath]?.value),
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

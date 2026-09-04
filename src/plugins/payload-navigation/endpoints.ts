import type { Endpoint, Field, PayloadRequest } from 'payload'
import { fieldAffectsData } from 'payload/shared'
import type { FieldDescriptor } from './schemas'

const SCANNABLE_FIELD_TYPES = new Set([
  'text',
  'textarea',
  'email',
  'number',
  'date',
  'select',
  'radio',
  'checkbox',
])

const labelOf = (field: Field, fallback: string): string => {
  const label = 'label' in field ? field.label : undefined
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    const first = Object.values(label).find((entry) => typeof entry === 'string')
    if (typeof first === 'string') return first
  }
  return fallback
}

const collectScannableFields = (fields: Field[] | undefined): FieldDescriptor[] => {
  const out: FieldDescriptor[] = []
  if (!fields) return out

  for (const field of fields) {
    if (field.type === 'row' || field.type === 'collapsible') {
      out.push(...collectScannableFields(field.fields))
      continue
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        out.push(...collectScannableFields(tab.fields))
      }
      continue
    }
    if (!fieldAffectsData(field)) continue
    if (!SCANNABLE_FIELD_TYPES.has(field.type)) continue
    out.push({ name: field.name, type: field.type, label: labelOf(field, field.name) })
  }

  return out
}

export const buildCollectionFieldsEndpoint = (allowedCollections: string[]): Endpoint => {
  const allowed = new Set(allowedCollections)

  return {
    path: '/payload-navigation/collection-fields',
    method: 'get',
    handler: async (req: PayloadRequest) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const slug = typeof req.query.slug === 'string' ? req.query.slug : ''

      if (!slug || !allowed.has(slug)) {
        return Response.json({ fields: [] satisfies FieldDescriptor[] })
      }

      const collection = req.payload.config.collections.find((entry) => entry.slug === slug)
      if (!collection) {
        return Response.json({ fields: [] satisfies FieldDescriptor[] })
      }

      const fields = collectScannableFields(collection.fields)
      return Response.json({ fields })
    },
  }
}

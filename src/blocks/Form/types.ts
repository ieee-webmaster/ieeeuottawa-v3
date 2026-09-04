import type { Form } from '@/payload-types'

export type FormField = NonNullable<Form['fields']>[number]
export type FormValues = Record<string, string | number | boolean>

export const getFormDefaultValues = (fields: Form['fields']): FormValues => {
  const values: FormValues = {}
  for (const field of fields ?? []) {
    if (field.blockType === 'message') continue
    values[field.name] =
      field.blockType === 'checkbox'
        ? (field.defaultValue ?? false)
        : 'defaultValue' in field
          ? (field.defaultValue ?? '')
          : ''
  }
  return values
}

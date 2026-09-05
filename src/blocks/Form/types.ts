import type { Form } from '@/payload-types'

export type FormField = NonNullable<Form['fields']>[number]
export type FormValues = Record<string, string | number | boolean>

// CMS names are literal labels; RHF interprets dots and brackets as object paths.
export const getFormFieldName = (formID: string, index: number): string =>
  `${formID}_field_${index}`

export const getFormDefaultValues = (fields: Form['fields'], formID: string): FormValues => {
  const values: FormValues = {}
  for (const [index, field] of (fields ?? []).entries()) {
    if (field.blockType === 'message') continue
    values[getFormFieldName(formID, index)] =
      field.blockType === 'checkbox'
        ? (field.defaultValue ?? false)
        : 'defaultValue' in field
          ? (field.defaultValue ?? '')
          : ''
  }
  return values
}

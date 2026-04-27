import type { Field } from 'payload'

export const blockThemeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Muted', value: 'muted' },
  { label: 'Accent', value: 'accent' },
  { label: 'Dark', value: 'dark' },
] as const

export type BlockTheme = (typeof blockThemeOptions)[number]['value']

export const themeField = (defaultValue: BlockTheme = 'default'): Field => ({
  name: 'theme',
  type: 'select',
  defaultValue,
  options: [...blockThemeOptions],
  required: true,
})

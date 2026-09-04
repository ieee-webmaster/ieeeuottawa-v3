import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const getImplicitPreference = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

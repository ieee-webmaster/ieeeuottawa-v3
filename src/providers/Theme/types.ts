export type Theme = 'dark' | 'light'
export type ThemePreference = Theme | 'auto'

export interface ThemeContextType {
  preference?: ThemePreference
  setTheme: (theme: Theme | null) => void
  theme?: Theme | null
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light'].includes(string) : false
}

'use client'

// Source: Payload CMS `with-vercel-website` template.
// https://github.com/payloadcms/payload/tree/main/templates/with-vercel-website/src/providers/Theme
// Local changes: keep the resolved theme and the user's preference available in context.

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType, ThemePreference } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  preference: undefined,
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )
  const [preference, setPreference] = useState<ThemePreference | undefined>(undefined)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      if (implicitPreference) setThemeState(implicitPreference)
      setPreference('auto')
    } else {
      setThemeState(themeToSet)
      setPreference(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
  }, [])

  useEffect(() => {
    let themeToSet: Theme = defaultTheme
    const storedPreference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(storedPreference)) {
      themeToSet = storedPreference
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Local storage is client-only, so this must synchronize after hydration.
      setPreference(storedPreference)
    } else {
      const implicitPreference = getImplicitPreference()
      setPreference('auto')

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ preference, setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)

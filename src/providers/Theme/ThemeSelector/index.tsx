'use client'

// Source: Payload CMS `with-vercel-website` template.
// https://github.com/payloadcms/payload/tree/main/templates/with-vercel-website/src/providers/Theme/ThemeSelector
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import React, { useRef } from 'react'

import type { ThemePreference } from '../types'

import { useTheme } from '..'

type Props = {
  className?: string
}

export const ThemeSelector: React.FC<Props> = ({ className }) => {
  const t = useTranslations('nav')
  const { preference, setTheme } = useTheme()
  const pointerInteractionRef = useRef(false)

  const onThemeChange = (themeToSet: ThemePreference) => {
    if (themeToSet === 'auto') {
      setTheme(null)
    } else {
      setTheme(themeToSet)
    }
  }

  return (
    <Select onValueChange={onThemeChange} value={preference ?? ''}>
      <SelectTrigger
        aria-label={t('selectTheme')}
        className={cn(
          'w-auto gap-2 border-none bg-transparent pl-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 md:pl-3',
          className,
        )}
        onKeyDown={() => {
          pointerInteractionRef.current = false
        }}
        onPointerDown={() => {
          pointerInteractionRef.current = true
        }}
      >
        <SelectValue placeholder={t('theme')} />
      </SelectTrigger>
      <SelectContent
        data-theme-selector-content
        onCloseAutoFocus={(event) => {
          if (pointerInteractionRef.current) event.preventDefault()
        }}
        onKeyDown={() => {
          pointerInteractionRef.current = false
        }}
        onPointerDown={() => {
          pointerInteractionRef.current = true
        }}
      >
        <SelectItem value="auto">{t('themeAuto')}</SelectItem>
        <SelectItem value="light">{t('themeLight')}</SelectItem>
        <SelectItem value="dark">{t('themeDark')}</SelectItem>
      </SelectContent>
    </Select>
  )
}

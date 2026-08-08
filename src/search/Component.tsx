'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type Props = {
  initialValue?: string
}

export const Search: React.FC<Props> = ({ initialValue = '' }) => {
  const [value, setValue] = useState(initialValue)
  const router = useRouter()
  const t = useTranslations('search')

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.replace(`/search${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {t('title')}
        </Label>
        <Input
          id="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={t('placeholder')}
          className="h-12 border-x-0 border-t-0 border-b border-foreground/25 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        />
        <button type="submit" className="sr-only">
          {t('submit')}
        </button>
      </form>
    </div>
  )
}

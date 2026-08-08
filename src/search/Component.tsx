'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchIcon, XIcon } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
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

  const updateRoute = useCallback(
    (nextValue: string) => {
      const normalizedValue = nextValue.trim()
      const currentValue = new URLSearchParams(window.location.search).get('q')?.trim() ?? ''

      if (normalizedValue === currentValue) return

      router.replace(`/search${normalizedValue ? `?q=${encodeURIComponent(normalizedValue)}` : ''}`)
    },
    [router],
  )

  useEffect(() => {
    updateRoute(debouncedValue)
  }, [debouncedValue, updateRoute])

  return (
    <form
      className="group flex min-h-16 items-center gap-4 border border-[hsl(var(--interactive)/0.3)] bg-[hsl(var(--interactive)/0.055)] px-4 transition-[border-color,box-shadow,background-color] focus-within:border-[hsl(var(--interactive))] focus-within:bg-[hsl(var(--interactive)/0.09)] focus-within:ring-1 focus-within:ring-[hsl(var(--interactive))] md:min-h-20 md:px-6"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        updateRoute(value)
      }}
    >
      <SearchIcon
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-foreground md:h-6 md:w-6"
      />

      <div className="min-w-0 flex-1">
        <Label htmlFor="search" className="sr-only">
          {t('title')}
        </Label>
        <Input
          autoComplete="off"
          id="search"
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={t('placeholder')}
          className="h-16 rounded-none border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:h-20 md:text-xl [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>

      {value ? (
        <button
          type="button"
          aria-label={t('clear')}
          onClick={() => setValue('')}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--interactive))]"
        >
          <XIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      ) : null}

      <button type="submit" className="sr-only">
        {t('submit')}
      </button>
    </form>
  )
}

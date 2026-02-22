'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { usePathname, useRouter } from 'next/navigation'
import { getLocaleFromPathname, prefixLocalePath } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const messages = getMessages(locale)

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(
      `${prefixLocalePath(locale, '/search')}${debouncedValue ? `?q=${debouncedValue}` : ''}`,
    )
  }, [debouncedValue, locale, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {messages.common.search}
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={messages.common.search}
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}

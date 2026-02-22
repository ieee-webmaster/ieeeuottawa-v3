import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { prefixLocalePath } from '@/i18n/config'
import { getRequestLocale } from '@/i18n/server'
import { getMessages } from '@/i18n/messages'

export default async function NotFound() {
  const locale = await getRequestLocale()
  const messages = getMessages(locale)

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">{messages.notFound.description}</p>
      </div>
      <Button asChild variant="default">
        <Link href={prefixLocalePath(locale, '/')}>{messages.common.goHome}</Link>
      </Button>
    </div>
  )
}

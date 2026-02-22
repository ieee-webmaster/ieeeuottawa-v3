'use client'

import React from 'react'
import { useLocale } from '@payloadcms/ui'
import { getMessages } from '@/i18n/messages'

const BeforeLogin: React.FC = () => {
  const locale = useLocale()
  const messages = getMessages(locale.code)

  return (
    <div>
      <p>
        <b>{messages.admin.welcomeTitle}</b> {messages.admin.beforeLoginBody}
      </p>
    </div>
  )
}

export default BeforeLogin

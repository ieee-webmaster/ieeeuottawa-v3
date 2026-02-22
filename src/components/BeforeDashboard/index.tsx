'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import { useLocale } from '@payloadcms/ui'
import { getMessages } from '@/i18n/messages'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const locale = useLocale()
  const messages = getMessages(locale.code)

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>{messages.admin.welcomeTitle}</h4>
      </Banner>
      {messages.admin.nextSteps}
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton /> {messages.admin.seedLead}{' '}
          <a href="/" target="_blank">
            {messages.admin.visitWebsite}
          </a>{' '}
          {messages.admin.seedTail}
        </li>
        <li>
          {messages.admin.modifyPrefix}{' '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            {messages.admin.collections}
          </a>{' '}
          {messages.admin.modifyMiddle}{' '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            {messages.admin.fields}
          </a>{' '}
          {messages.admin.modifySuffix}{' '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            {messages.admin.gettingStarted}
          </a>{' '}
          {messages.admin.docsSuffix}
        </li>
        <li>{messages.admin.commitHint}</li>
      </ul>
      {messages.admin.proTipPrefix}{' '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        {messages.admin.customComponent}
      </a>
      {messages.admin.proTipSuffix} <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard

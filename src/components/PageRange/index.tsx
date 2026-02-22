import React from 'react'
import { defaultLocale, type AppLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

const defaultCollectionLabels = {
  posts: {
    en: {
      plural: 'Posts',
      singular: 'Post',
    },
    fr: {
      plural: 'Articles',
      singular: 'Article',
    },
  },
}

export const PageRange: React.FC<{
  className?: string
  collection?: keyof typeof defaultCollectionLabels
  collectionLabels?: {
    plural?: string
    singular?: string
  }
  currentPage?: number
  limit?: number
  locale?: AppLocale
  totalDocs?: number
}> = (props) => {
  const {
    className,
    collection,
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    limit,
    locale = defaultLocale,
    totalDocs,
  } = props
  const messages = getMessages(locale)

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1
  if (totalDocs && indexStart > totalDocs) indexStart = 0

  let indexEnd = (currentPage || 1) * (limit || 1)
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs

  const defaultLabelsByLocale = {
    plural: messages.pagination.defaultDocPlural,
    singular: messages.pagination.defaultDocSingular,
  }
  const defaultCollectionByLocale = collection
    ? defaultCollectionLabels[collection][locale]
    : undefined

  const { plural, singular } =
    collectionLabelsFromProps || defaultCollectionByLocale || defaultLabelsByLocale || {}

  return (
    <div className={[className, 'font-semibold'].filter(Boolean).join(' ')}>
      {(typeof totalDocs === 'undefined' || totalDocs === 0) && messages.pagination.noResults}
      {typeof totalDocs !== 'undefined' &&
        totalDocs > 0 &&
        messages.pagination.showing(
          indexStart,
          indexEnd,
          totalDocs,
          (totalDocs > 1 ? plural : singular) || messages.pagination.defaultDocSingular,
        )}
    </div>
  )
}

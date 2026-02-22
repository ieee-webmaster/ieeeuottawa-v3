import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { defaultLocale } from '@/i18n/config'
import { getRequestLocale } from '@/i18n/server'
import { getMessages } from '@/i18n/messages'

export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const locale = await getRequestLocale()
  const messages = getMessages(locale)

  const posts = await payload.find({
    collection: 'posts',
    locale: locale as never,
    fallbackLocale: defaultLocale as never,
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{messages.postsPage.title}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          locale={locale}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination locale={locale} page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const messages = getMessages(locale)

  return {
    title: messages.postsPage.metadataTitle,
  }
}

import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Search } from '@/search/Component'
import type { Config } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { SectionShell } from '@/blocks/_shared'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}
export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise
  const { q: rawQuery } = await searchParamsPromise
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? ''
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'search' })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  const cardPosts = posts.docs.flatMap(({ slug, title, meta, categories }) =>
    slug
      ? [
          {
            slug,
            title: title ?? '',
            meta,
            categories: categories?.map(({ title }) => ({ title: title || 'Untitled category' })),
          },
        ]
      : [],
  )

  return (
    <SectionShell theme="default">
      <header className="mb-6 space-y-4">
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-intro">{t('description')}</p>
      </header>
      <div className="max-w-3xl">
        <Search initialValue={query} />
      </div>
      {posts.totalDocs > 0 ? (
        <>
          <div className="mb-6 mt-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-display text-2xl font-medium">
              {query ? t('resultsFor', { query }) : t('results')}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {t('resultCount', { count: posts.totalDocs })}
            </span>
          </div>
          <CollectionArchive bare posts={cardPosts} />
        </>
      ) : (
        <p className="mt-6 text-base text-muted-foreground">
          {query ? t('noResults', { query }) : t('prompt')}
        </p>
      )}
    </SectionShell>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'search' })

  return generateStaticMeta({
    description: t('description'),
    locale,
    path: '/search',
    title: t('title'),
  })
}

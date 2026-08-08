import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Search } from '@/search/Component'
import { CardPostData } from '@/components/Card'
import type { Config } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'
import { SearchXIcon } from 'lucide-react'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: Args) {
  const { locale } = await paramsPromise
  const { q: rawQuery } = await searchParamsPromise
  const query = rawQuery?.trim() ?? ''
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

  return (
    <SectionShell theme="default" padding="pt-20 pb-20 md:pt-28 md:pb-28">
      <header className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="space-y-6 lg:col-span-9">
          <Eyebrow theme="default">{t('eyebrow')}</Eyebrow>
          <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('description')}
          </p>
        </div>
      </header>

      <div className={`mt-12 h-px w-full md:mt-16 ${themeRule.default}`} />

      <div className="py-8 md:py-10">
        <Search initialValue={query} />
      </div>

      {posts.totalDocs > 0 ? (
        <>
          <div className="mb-10 flex items-end justify-between gap-6 border-t border-foreground/20 pt-10 md:mb-14 md:pt-12">
            <div>
              <Eyebrow theme="default" withRule={false}>
                {t('results')}
              </Eyebrow>
              <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                {t('resultsFor', { query })}
              </h2>
            </div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t('resultCount', { count: posts.totalDocs })}
            </span>
          </div>
          <CollectionArchive bare posts={posts.docs as CardPostData[]} />
        </>
      ) : (
        <div className="border-y border-foreground/20 py-10 md:py-12">
          <div className="grid max-w-3xl grid-cols-[auto_1fr] items-start gap-5">
            <span className="inline-flex h-11 w-11 items-center justify-center border border-[hsl(var(--interactive)/0.25)] bg-[hsl(var(--interactive)/0.08)] text-foreground">
              <SearchXIcon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.22em] text-foreground">
                {query ? t('resultCount', { count: 0 }) : t('results')}
              </span>
              <p className="text-base leading-relaxed text-muted-foreground">
                {query ? t('noResults', { query }) : t('prompt')}
              </p>
            </div>
          </div>
        </div>
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

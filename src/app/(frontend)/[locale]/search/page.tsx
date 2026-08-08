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
    <SectionShell theme="default" padding="pt-24 pb-20 md:pt-36 md:pb-28">
      <header className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          <Eyebrow theme="default">{t('eyebrow')}</Eyebrow>
          <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
            {t('title')}
          </h1>
        </div>
        <div className="md:col-span-5">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('description')}
          </p>
        </div>
      </header>

      <div className={`h-px w-full ${themeRule.default}`} />

      <div className="max-w-3xl py-10 md:py-14">
        <Search initialValue={query} />
      </div>

      {posts.totalDocs > 0 ? (
        <>
          <div className="mb-10 flex items-end justify-between gap-6 border-t border-foreground/20 pt-10 md:mb-14">
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{t('results')}</h2>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t('resultCount', { count: posts.totalDocs })}
            </span>
          </div>
          <CollectionArchive bare posts={posts.docs as CardPostData[]} />
        </>
      ) : (
        <p className="border-t border-foreground/20 pt-10 text-sm leading-relaxed text-muted-foreground">
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

import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Eyebrow, SectionShell } from '@/blocks/_shared'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'posts' })

  const posts = await payload.find({
    collection: 'posts',
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
  })

  return (
    <>
      <SectionShell theme="default" padding="pt-24 pb-12 md:pt-36 md:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="space-y-6 lg:col-span-9">
            <Eyebrow theme="default">{t('eyebrow')}</Eyebrow>
            <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('description')}
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell theme="default" padding="py-12 md:py-20">
        <header className="mb-8 flex items-end justify-between gap-6">
          <div>
            <Eyebrow theme="default">{t('latest')}</Eyebrow>
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{t('latest')}</h2>
          </div>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t('postCount', { count: posts.totalDocs })}
          </span>
        </header>

        <div className="h-px w-full bg-foreground/20" />

        {posts.totalDocs > 0 ? (
          <CollectionArchive bare className="pt-10 md:pt-14" posts={posts.docs} />
        ) : (
          <p className="pt-10 text-sm leading-relaxed text-muted-foreground">{t('empty')}</p>
        )}

        {posts.totalPages > 1 && posts.page ? (
          <Pagination basePath="/posts" page={posts.page} totalPages={posts.totalPages} />
        ) : null}
      </SectionShell>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'posts' })
  return generateStaticMeta({
    description: t('description'),
    locale,
    path: '/posts',
    title: t('title'),
  })
}

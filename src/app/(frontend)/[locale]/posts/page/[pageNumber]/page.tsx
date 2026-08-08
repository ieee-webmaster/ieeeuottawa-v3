import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Eyebrow, SectionShell } from '@/blocks/_shared'

export const revalidate = 600

type Args = {
  params: Promise<{
    locale: Config['locale']
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'posts' })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    locale,
    page: sanitizedPageNumber,
    overrideAccess: false,
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
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
              {t('page', { page: sanitizedPageNumber })}
            </h2>
          </div>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t('postCount', { count: posts.totalDocs })}
          </span>
        </header>

        <div className="h-px w-full bg-foreground/20" />
        <CollectionArchive bare className="pt-10 md:pt-14" posts={posts.docs} />

        {posts?.page && posts?.totalPages > 1 ? (
          <Pagination basePath="/posts" page={posts.page} totalPages={posts.totalPages} />
        ) : null}
      </SectionShell>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'posts' })

  return generateStaticMeta({
    description: t('description'),
    locale,
    path: `/posts/page/${pageNumber}`,
    title: `${t('title')} - Page ${pageNumber}`,
  })
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}

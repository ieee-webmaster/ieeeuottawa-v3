import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { SectionShell } from '@/blocks/_shared'
import { getCachedPostList, getCachedPostTotalPages } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 86400

type Args = {
  params: Promise<{
    locale: Config['locale']
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'posts' })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isSafeInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  const posts = await getCachedPostList(locale, sanitizedPageNumber)

  return (
    <SectionShell theme="default">
      <header className="mb-10 space-y-4">
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-intro">{t('description')}</p>
      </header>
      {posts.totalDocs > 0 ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 font-mono text-sm text-muted-foreground">
            <span>{t('page', { page: sanitizedPageNumber })}</span>
            <span>{t('postCount', { count: posts.totalDocs })}</span>
          </div>
          <CollectionArchive bare posts={posts.docs} />
        </>
      ) : (
        <p className="border-t border-border py-8 text-base text-muted-foreground">{t('empty')}</p>
      )}
      {posts.totalPages > 1 && posts.page ? (
        <Pagination basePath="/posts" page={posts.page} totalPages={posts.totalPages} />
      ) : null}
    </SectionShell>
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
  const totalPages = await getCachedPostTotalPages()

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}

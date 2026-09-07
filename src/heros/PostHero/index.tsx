import type { Locale } from '@/i18n/routing'
import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

import type { getPostBySlug } from '@/utilities/publicCms'

import { Eyebrow, SectionShell } from '@/blocks/_shared'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  locale: Locale
  post: NonNullable<Awaited<ReturnType<typeof getPostBySlug<true>>>>
}> = async ({ locale, post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post
  const t = await getTranslations({ locale, namespace: 'posts' })

  const authors = formatAuthors(populatedAuthors ?? [], locale)
  const categoryLabel = categories
    ?.flatMap((category) => (typeof category === 'number' ? [] : [category.title]))
    .join(', ')

  return (
    <SectionShell theme="default" as="div">
      <Link href="/posts" className="back-link mb-4">
        <ArrowLeft
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        />
        {t('backToPosts')}
      </Link>

      <header className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-10">
          {categoryLabel && <Eyebrow theme="default">{categoryLabel}</Eyebrow>}
          <h1 className="page-title max-w-4xl">{title}</h1>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
        {authors ? (
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">{t('author')}</p>
            <p className="text-base leading-relaxed">{authors}</p>
          </div>
        ) : null}
        {publishedAt ? (
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">{t('datePublished')}</p>
            <time className="block text-base leading-relaxed" dateTime={publishedAt}>
              {formatDateTime(publishedAt, locale)}
            </time>
          </div>
        ) : null}
      </div>

      {heroImage && typeof heroImage !== 'number' ? (
        <div className="mt-8">
          <Media
            priority
            imgClassName="block h-auto max-h-[36rem] w-full object-contain"
            pictureClassName="block"
            resource={heroImage}
          />
        </div>
      ) : null}
    </SectionShell>
  )
}

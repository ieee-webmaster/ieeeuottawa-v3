import type { Locale } from '@/i18n/routing'
import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

import type { Post } from '@/payload-types'

import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  locale: Locale
  post: Post
}> = async ({ locale, post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post
  const t = await getTranslations({ locale, namespace: 'posts' })

  const hasAuthors =
    populatedAuthors &&
    populatedAuthors.length > 0 &&
    formatAuthors(populatedAuthors, locale) !== ''
  const categoryLabel = categories
    ?.filter(
      (category): category is NonNullable<(typeof categories)[number]> & { title: string } =>
        typeof category === 'object' &&
        category !== null &&
        'title' in category &&
        typeof category.title === 'string',
    )
    .map((category) => category.title)
    .join(', ')

  return (
    <SectionShell theme="default" padding="pt-20 pb-12 md:pt-28 md:pb-16" as="div">
      <Link
        href="/posts"
        className="group mb-10 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-secondary md:mb-14"
      >
        <ArrowLeft
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        />
        {t('backToPosts')}
      </Link>

      <header className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-10">
          <Eyebrow theme="default">{categoryLabel || t('eyebrow')}</Eyebrow>
          <h1 className="max-w-5xl text-balance text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
        </div>
      </header>

      <div className={`my-10 h-px w-full md:my-14 ${themeRule.default}`} />

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {hasAuthors ? (
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t('author')}
            </p>
            <p className="text-base leading-relaxed">{formatAuthors(populatedAuthors, locale)}</p>
          </div>
        ) : null}
        {publishedAt ? (
          <div className="space-y-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t('datePublished')}
            </p>
            <time className="block text-base leading-relaxed" dateTime={publishedAt}>
              {formatDateTime(publishedAt, locale)}
            </time>
          </div>
        ) : null}
      </div>

      {heroImage && typeof heroImage !== 'string' ? (
        <div className="relative mt-12 aspect-[4/3] overflow-hidden bg-foreground/[0.04] sm:aspect-video md:mt-16 lg:aspect-[21/9]">
          <Media
            fill
            priority
            imgClassName="object-cover"
            pictureClassName="absolute inset-0"
            resource={heroImage}
          />
        </div>
      ) : null}
    </SectionShell>
  )
}

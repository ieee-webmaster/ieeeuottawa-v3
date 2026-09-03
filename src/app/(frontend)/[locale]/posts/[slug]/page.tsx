import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { SectionShell, themeRule } from '@/blocks/_shared'
import { notFound } from 'next/navigation'
import RichText from '@/components/RichText'

import type { Config, Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getTranslations } from 'next-intl/server'
import { getCachedPostBySlug, getPublishedPostSlugs } from '@/utilities/publicCms'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs()

  // Next static export requires at least one param for a dynamic route.
  return slugs.length > 0 ? slugs : [{ slug: '__no-published-posts__' }]
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { locale, slug = '' } = await paramsPromise
  const post = await getCachedPostBySlug(slug, locale)
  const t = await getTranslations({ locale, namespace: 'posts' })

  if (!post) notFound()

  return (
    <article>
      <PostHero locale={locale} post={post} />

      <SectionShell theme="default" padding="py-12 md:py-20">
        {post.content && (
          <RichText className="mx-auto max-w-3xl" data={post.content} enableGutter={false} />
        )}
      </SectionShell>

      {post.relatedPosts && post.relatedPosts.length > 0 ? (
        <SectionShell theme="muted" padding="py-14 md:py-20">
          <header className="mb-8">
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{t('related')}</h2>
          </header>
          <div className={`h-px w-full ${themeRule.muted}`} />
          <RelatedPosts
            className="mt-10 md:mt-14"
            docs={post.relatedPosts.filter((post) => typeof post !== 'number')}
          />
        </SectionShell>
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  const post = await getCachedPostBySlug(slug, locale)

  return generateMeta({ collection: 'posts', doc: post, locale })
}

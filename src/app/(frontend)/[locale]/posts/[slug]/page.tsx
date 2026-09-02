import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post, Config } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getTranslations } from 'next-intl/server'
import { getCachedPostBySlug, getPostBySlug, getPublishedPostSlugs } from '@/utilities/publicCms'
import { STATIC_CONTENT_REVALIDATE_SECONDS } from '@/utilities/publicCache'

export const revalidate = STATIC_CONTENT_REVALIDATE_SECONDS

export async function generateStaticParams() {
  return getPublishedPostSlugs()
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/posts/${encodeURIComponent(decodedSlug)}`
  const post = await queryPostBySlug({ slug: decodedSlug, locale })
  const t = await getTranslations({ locale, namespace: 'posts' })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article>
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero locale={locale} post={post} />

      <SectionShell theme="default" padding="py-12 md:py-20">
        <RichText className="mx-auto max-w-3xl" data={post.content} enableGutter={false} />
      </SectionShell>

      {post.relatedPosts && post.relatedPosts.length > 0 ? (
        <SectionShell theme="muted" padding="py-14 md:py-20">
          <header className="mb-8">
            <Eyebrow theme="muted">{t('related')}</Eyebrow>
            <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">{t('related')}</h2>
          </header>
          <div className={`h-px w-full ${themeRule.muted}`} />
          <RelatedPosts
            className="mt-10 md:mt-14"
            docs={post.relatedPosts.filter((post) => typeof post === 'object')}
          />
        </SectionShell>
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  return generateMeta({ collection: 'posts', doc: post, locale })
}

const queryPostBySlug = cache(
  async ({ slug, locale }: { slug: string; locale: Config['locale'] }) => {
    const { isEnabled: draft } = await draftMode()

    if (draft) {
      return getPostBySlug({ draft, locale, slug })
    }

    return getCachedPostBySlug(slug, locale)
  },
)

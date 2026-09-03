import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import type { Config } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedPageBySlug, getPublishedPageSlugs } from '@/utilities/publicCms'

export const dynamicParams = false

export async function generateStaticParams() {
  return getPublishedPageSlugs()
}

type Args = {
  params: Promise<{
    locale: Config['locale']
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale, slug = 'home' } = await paramsPromise
  const page = await getCachedPageBySlug(slug, locale)

  if (!page) notFound()

  const { hero, layout } = page

  return (
    <article>
      {hero && <RenderHero {...hero} isHomePage={slug === 'home'} />}
      {layout && <RenderBlocks blocks={layout} />}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = 'home' } = await paramsPromise
  const page = await getCachedPageBySlug(slug, locale)

  return generateMeta({ collection: 'pages', doc: page, locale })
}

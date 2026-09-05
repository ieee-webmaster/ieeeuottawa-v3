// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { getRouteMatcher } from 'next/dist/shared/lib/router/utils/route-matcher'
import { getRouteRegex } from 'next/dist/shared/lib/router/utils/route-regex'
import type { Locale } from '@/i18n/routing'

const { draftModeState, cachedLookup, draftLookup, generateMeta } = vi.hoisted(() => ({
  draftModeState: { enabled: false },
  cachedLookup: vi.fn<(slug: string, locale: Locale) => Promise<null>>(async () => null),
  draftLookup: vi.fn<(args: { slug: string; locale: Locale; draft: boolean }) => Promise<null>>(
    async () => null,
  ),
  generateMeta: vi.fn(async () => ({})),
}))

vi.mock('@/utilities/publicCms', () => ({
  getCachedPageBySlug: cachedLookup,
  getCachedPostBySlug: cachedLookup,
  getCachedEventBySlug: cachedLookup,
  getPageBySlug: draftLookup,
  getPostBySlug: draftLookup,
  getEventBySlug: draftLookup,
  getPublishedPageSlugs: async () => [],
  getPublishedPostSlugs: async () => [],
  getPublishedEventSlugs: async () => [],
}))
vi.mock('next/headers', () => ({
  draftMode: async () => ({ isEnabled: draftModeState.enabled }),
}))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({ Link: () => null }))
vi.mock('@/utilities/generateMeta', () => ({ generateMeta }))
vi.mock('@/blocks/RenderBlocks', () => ({ RenderBlocks: () => null }))
vi.mock('@/blocks/RelatedPosts/Component', () => ({ RelatedPosts: () => null }))
vi.mock('@/heros/RenderHero', () => ({ RenderHero: () => null }))
vi.mock('@/heros/PostHero', () => ({ PostHero: () => null }))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/components/PayloadRedirects', () => ({ PayloadRedirects: () => null }))

import Page, { generateMetadata as pageMetadata } from '@/app/(frontend)/[locale]/[slug]/page'
import Post, { generateMetadata as postMetadata } from '@/app/(frontend)/[locale]/posts/[slug]/page'
import Event, {
  generateMetadata as eventMetadata,
} from '@/app/(frontend)/[locale]/events/[slug]/page'
import { PayloadRedirects } from '@/components/PayloadRedirects'

beforeEach(() => vi.clearAllMocks())

const routes = [
  { collection: 'pages', prefix: '', render: Page, metadata: pageMetadata },
  { collection: 'posts', prefix: '/posts', render: Post, metadata: postMetadata },
  { collection: 'events', prefix: '/events', render: Event, metadata: eventMetadata },
]

describe.each(routes)(
  '$collection route parameters',
  ({ collection, prefix, render, metadata }) => {
    it.each(['ordinary-slug', '100%', '%2F', 'café & robotics'])(
      'preserves Next-decoded slug %s for rendering, metadata, and redirect URLs',
      async (slug) => {
        const url = `${prefix}/${encodeURIComponent(slug)}`
        const matched = getRouteMatcher(getRouteRegex(`/[locale]${prefix}/[slug]`))(`/en${url}`)
        if (!matched || matched.locale !== 'en' || typeof matched.slug !== 'string') {
          throw new Error('Next did not match the test URL')
        }
        expect(matched.slug).toBe(slug)
        const params = Promise.resolve<{ locale: Locale; slug: string }>({
          locale: matched.locale,
          slug: matched.slug,
        })

        for (const draft of [false, true]) {
          draftModeState.enabled = draft
          expect(await render({ params })).toEqual(createElement(PayloadRedirects, { url }))
          await metadata({ params })
          if (draft) {
            expect(draftLookup).toHaveBeenLastCalledWith({ draft: true, locale: 'en', slug })
          } else {
            expect(cachedLookup).toHaveBeenLastCalledWith(slug, 'en')
          }
          expect(generateMeta).toHaveBeenLastCalledWith({ collection, doc: null, locale: 'en' })
        }
      },
    )
  },
)

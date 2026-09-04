import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'

type DraftPage = NonNullable<Awaited<ReturnType<typeof getPageBySlug<true>>>>
type DraftPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug<true>>>>

const { pageQuery, postQuery } = vi.hoisted(() => ({
  pageQuery: vi.fn<() => Promise<DraftPage | null>>(),
  postQuery: vi.fn<() => Promise<DraftPost | null>>(),
}))

vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: true }) }))
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => key,
}))
vi.mock('@/utilities/publicCms', () => ({
  getPageBySlug: pageQuery,
  getPostBySlug: postQuery,
  getCachedPageBySlug: vi.fn(),
  getCachedPostBySlug: vi.fn(),
  getPublishedPageSlugs: vi.fn(),
  getPublishedPostSlugs: vi.fn(),
  getCachedCommitteeByID: vi.fn(),
  getCachedTeamByID: vi.fn(),
}))
vi.mock('@/components/PayloadRedirects', () => ({ PayloadRedirects: () => null }))
vi.mock('@/components/LivePreviewListener', () => ({
  LivePreviewListener: () => createElement('div', { 'data-testid': 'live-preview' }),
}))
vi.mock('@/utilities/generateMeta', () => ({ generateMeta: vi.fn() }))
vi.mock('@/heros/RenderHero', () => ({
  RenderHero: () => createElement('div', { 'data-testid': 'page-hero' }),
}))
vi.mock('@/blocks/RenderBlocks', () => ({
  RenderBlocks: () => createElement('div', { 'data-testid': 'page-blocks' }),
}))
vi.mock('@/heros/PostHero', () => ({
  PostHero: () => createElement('div', { 'data-testid': 'post-hero' }),
}))
vi.mock('@/components/RichText', () => ({
  default: () => createElement('div', { 'data-testid': 'rich-text' }),
}))
vi.mock('@/components/Media', () => ({ Media: () => null }))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
  useRouter: () => ({ push: vi.fn() }),
}))

import Page from '@/app/(frontend)/[locale]/[slug]/page'
import PostPage from '@/app/(frontend)/[locale]/posts/[slug]/page'
import { FormBlock } from '@/blocks/Form/Component'
import { CommitteeTeamMembersBlock } from '@/blocks/CommitteeTeamMembers/Component'
import {
  type getPageBySlug,
  type getPostBySlug,
  getCachedCommitteeByID,
  getCachedTeamByID,
} from '@/utilities/publicCms'

beforeEach(() => {
  pageQuery.mockReset()
  postQuery.mockReset()
})
afterEach(cleanup)

describe('incomplete CMS draft previews', () => {
  it('keeps page previews alive before the hero or layout has been entered', async () => {
    pageQuery.mockResolvedValue({ id: 1, slug: 'draft-page', _status: 'draft' })
    render(await Page({ params: Promise.resolve({ locale: 'en', slug: 'draft-page' }) }))

    expect(screen.getByTestId('live-preview')).toBeTruthy()
    expect(screen.queryByTestId('page-hero')).toBeNull()
    expect(screen.queryByTestId('page-blocks')).toBeNull()
    expect(pageQuery).toHaveBeenCalledWith({ draft: true, locale: 'en', slug: 'draft-page' })
  })

  it('keeps post previews alive before rich-text content has been entered', async () => {
    postQuery.mockResolvedValue({ id: 1, slug: 'draft-post', _status: 'draft' })
    render(await PostPage({ params: Promise.resolve({ locale: 'en', slug: 'draft-post' }) }))

    expect(screen.getByTestId('live-preview')).toBeTruthy()
    expect(screen.getByTestId('post-hero')).toBeTruthy()
    expect(screen.queryByTestId('rich-text')).toBeNull()
  })

  it('renders the post hero with only the fields available in an initial draft', async () => {
    const { PostHero } =
      await vi.importActual<typeof import('@/heros/PostHero')>('@/heros/PostHero')
    render(
      await PostHero({ locale: 'en', post: { id: 1, _status: 'draft', title: 'Working title' } }),
    )

    expect(screen.getByRole('heading', { name: 'Working title' })).toBeTruthy()
    expect(screen.queryByText('author')).toBeNull()
    expect(screen.queryByText('datePublished')).toBeNull()
  })

  it.each([undefined, null, 1])('omits a form block before its form is populated (%s)', (form) => {
    const { container } = render(createElement(FormBlock, { blockType: 'formBlock', form }))
    expect(container.innerHTML).toBe('')
  })

  it.each([{}, { committee: 1 }, { team: 1 }, { committee: null, team: 1 }])(
    'omits a committee block with incomplete relationships: %j',
    async (relationships) => {
      const result = await CommitteeTeamMembersBlock({
        blockType: 'committeeTeamMembers',
        ...relationships,
      })
      expect(result).toBeNull()
      expect(getCachedCommitteeByID).not.toHaveBeenCalled()
      expect(getCachedTeamByID).not.toHaveBeenCalled()
    },
  )
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes, type ComponentProps } from 'react'
import type { getEventBySlug } from '@/utilities/publicCms'
import type { Media } from '@/components/Media'

type DraftEvent = NonNullable<Awaited<ReturnType<typeof getEventBySlug<true>>>>
const { getEvent, media } = vi.hoisted(() => ({
  getEvent: vi.fn<() => Promise<DraftEvent>>(),
  media: vi.fn<(props: ComponentProps<typeof Media>) => void>(),
}))

vi.mock('@/utilities/publicCms', () => ({
  getEventBySlug: getEvent,
  getCachedEventBySlug: getEvent,
  getPublishedEventSlugs: async () => [],
}))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: true }) }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@/components/RichText', () => ({ default: () => null }))
vi.mock('@/utilities/generateMeta', () => ({ generateMeta: vi.fn() }))
vi.mock('@/components/PayloadRedirects', () => ({ PayloadRedirects: () => null }))
vi.mock('@/components/LivePreviewListener', () => ({ LivePreviewListener: () => null }))
vi.mock('@/components/Media', () => ({
  Media: (props: ComponentProps<typeof Media>) => {
    media(props)
    return createElement('div', { 'data-testid': 'event-media' })
  },
}))

import EventPage from '@/app/(frontend)/[locale]/events/[slug]/page'

const draft: DraftEvent = { id: 1, title: 'Draft event', slug: 'draft-event', _status: 'draft' }
const params = Promise.resolve({ locale: 'en' as const, slug: 'draft-event' })

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('event rendering', () => {
  it('uses the IEEE host fallback when an event has no hosting team', async () => {
    getEvent.mockResolvedValue(draft)
    render(await EventPage({ params }))
    expect(screen.getByRole('heading', { name: 'Draft event' })).toBeDefined()
    expect(screen.getByText('IEEE uOttawa')).toBeDefined()
  })

  it('omits an unpopulated hero image', async () => {
    getEvent.mockResolvedValue({ ...draft, heroImage: 7 })
    render(await EventPage({ params }))
    expect(media).not.toHaveBeenCalled()
  })

  it('renders populated hosts and media alongside unresolved team IDs', async () => {
    const event: DraftEvent = {
      ...draft,
      'hosted-by': [3, { id: 4, name: 'Robotics team', createdAt: '', updatedAt: '' }],
      heroImage: { id: 7, alt: 'Workshop', url: '/workshop.jpg', createdAt: '', updatedAt: '' },
    }
    getEvent.mockResolvedValue(event)
    render(await EventPage({ params }))
    expect(screen.getByText('Robotics team')).toBeDefined()
    expect(media.mock.calls[0]?.[0].resource).toEqual(event.heroImage)
  })

  it.each([1000, 1001])(
    'shows the repeated signup link only for a long event (%i characters)',
    async (length) => {
      getEvent.mockResolvedValue({
        ...draft,
        SignupLink: 'https://example.test/signup',
        content: {
          root: {
            type: 'root',
            version: 1,
            direction: null,
            format: '',
            indent: 0,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ type: 'text', version: 1, text: 'x'.repeat(length), format: 1 }],
              },
            ],
          },
        },
      })
      render(await EventPage({ params }))
      expect(screen.getAllByRole('link', { name: 'signUp' })).toHaveLength(length > 1000 ? 2 : 1)
    },
  )
})

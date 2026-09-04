import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes, type ComponentProps } from 'react'
import type { getEventBySlug } from '@/utilities/publicCms'
import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import type { Media } from '@/components/Media'

type DraftEvent = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>
// Payload's native draft type is shallow; nested rich text can also be incomplete at runtime.
type EventResponse = Omit<DraftEvent, 'content'> & { content?: unknown }
const { getEvent, media, adminBar, segments } = vi.hoisted(() => ({
  getEvent: vi.fn<() => Promise<EventResponse>>(),
  media: vi.fn<(props: ComponentProps<typeof Media>) => void>(),
  adminBar: vi.fn<(props: PayloadAdminBarProps) => void>(),
  segments: { value: ['posts', 'example'] },
}))

vi.mock('@/utilities/publicCms', () => ({
  getEventBySlug: getEvent,
  getCachedEventBySlug: getEvent,
  getPublishedEventSlugs: async () => [],
}))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: true }) }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('next/navigation', () => ({ useSelectedLayoutSegments: () => segments.value }))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
  usePathname: () => '/posts/example',
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))
vi.mock('@/utilities/generateMeta', () => ({ generateMeta: vi.fn() }))
vi.mock('@/components/PayloadRedirects', () => ({ PayloadRedirects: () => null }))
vi.mock('@/components/LivePreviewListener', () => ({ LivePreviewListener: () => null }))
vi.mock('@/components/Media', () => ({
  Media: (props: ComponentProps<typeof Media>) => {
    media(props)
    return createElement('div', { 'data-testid': 'event-media' })
  },
}))
vi.mock('@payloadcms/admin-bar', () => ({
  PayloadAdminBar: (props: PayloadAdminBarProps) => {
    adminBar(props)
    return null
  },
}))
vi.mock('@/components/AdminBar/index.scss', () => ({}))

import EventPage from '@/app/(frontend)/[locale]/events/[slug]/page'
import { AdminBar } from '@/components/AdminBar'

const draft: DraftEvent = { id: 1, title: 'Draft event', slug: 'draft-event', _status: 'draft' }
const params = Promise.resolve({ locale: 'en' as const, slug: 'draft-event' })

beforeEach(() => {
  vi.clearAllMocks()
  segments.value = ['posts', 'example']
})
afterEach(cleanup)

describe('event draft rendering', () => {
  it.each([
    ['missing content', undefined],
    ['an empty content object', {}],
    [
      'a root without children',
      { root: { type: 'root', version: 1, direction: null, format: '', indent: 0 } },
    ],
  ])('renders an unfinished draft with %s and no host relationship', async (_name, content) => {
    getEvent.mockResolvedValue({ ...draft, content })
    render(await EventPage({ params }))
    expect(screen.getByRole('heading', { name: 'Draft event' })).toBeDefined()
    expect(screen.getByText('IEEE uOttawa')).toBeDefined()
    expect(document.querySelector('.payload-richtext')?.textContent ?? '').toBe('')
  })

  it('omits an unpopulated hero image instead of rendering a numeric relationship ID', async () => {
    getEvent.mockResolvedValue({ ...draft, heroImage: 7 })
    render(await EventPage({ params }))
    expect(media).not.toHaveBeenCalled()
    expect(screen.queryByTestId('event-media')).toBeNull()
  })

  it('retains populated hosts, media, and complete editor content', async () => {
    const event: DraftEvent = {
      ...draft,
      'hosted-by': [3, { id: 4, name: 'Robotics team', createdAt: '', updatedAt: '' }],
      heroImage: { id: 7, alt: 'Workshop', url: '/workshop.jpg', createdAt: '', updatedAt: '' },
      content: {
        root: {
          type: 'root',
          version: 1,
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Draft body content',
                  format: 0,
                  detail: 0,
                  mode: 'normal',
                  style: '',
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
        },
      },
    }
    getEvent.mockResolvedValue(event)
    render(await EventPage({ params }))
    expect(screen.getByText('Robotics team')).toBeDefined()
    expect(screen.getByTestId('event-media')).toBeDefined()
    expect(screen.getByText('Draft body content')).toBeDefined()
    expect(media.mock.calls[0]?.[0].resource).toEqual(event.heroImage)
  })
})

describe('localized admin collection routing', () => {
  it.each([
    [['posts', 'example'], 'posts'],
    [['about'], 'pages'],
    [[], 'pages'],
  ])('uses the child layout segments %j for collection %s', (selectedSegments, collection) => {
    segments.value = selectedSegments
    render(createElement(AdminBar))
    expect(adminBar.mock.calls[0]?.[0].collectionSlug).toBe(collection)
  })
})

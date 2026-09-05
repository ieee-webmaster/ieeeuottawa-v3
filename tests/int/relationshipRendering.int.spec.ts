import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import type { DefaultTypedEditorState, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { Committee, Person, Team } from '@/payload-types'

const { getCommittee, getTeam } = vi.hoisted(() => ({
  getCommittee: vi.fn<() => Promise<Committee>>(),
  getTeam: vi.fn<() => Promise<Team>>(),
}))

vi.mock('@/utilities/publicCms', () => ({
  getCachedCommitteeByID: getCommittee,
  getCachedCommitteeByYear: getCommittee,
  getCachedTeamByID: getTeam,
  getCommitteeYears: async () => [],
}))
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => key,
}))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@/utilities/generateMeta', () => ({ generateStaticMeta: vi.fn() }))
vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))

import RichText from '@/components/RichText'
import { CommitteeTeamMembersBlock } from '@/blocks/CommitteeTeamMembers/Component'
import CommitteePage from '@/app/(frontend)/[locale]/committee/[year]/page'

const editorWithLink = (fields: SerializedLinkNode['fields']): DefaultTypedEditorState => ({
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: null,
    children: [
      {
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: null,
        textFormat: 0,
        children: [
          {
            type: 'link',
            version: 3,
            format: '',
            indent: 0,
            direction: null,
            fields,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Read this page',
                format: 1,
                detail: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
        ],
      },
    ],
  },
})

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('RichText relationship rendering', () => {
  it.each([undefined, null, { relationTo: 'pages', value: 123 }])(
    'preserves formatted link text when the internal reference is %j',
    (doc) => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      try {
        const view = render(
          createElement(RichText, {
            data: editorWithLink({ linkType: 'internal', newTab: false, doc }),
          }),
        )
        expect(view.container.querySelector('strong')?.textContent).toBe('Read this page')
        expect(screen.queryByRole('link')).toBeNull()
        expect(errors).not.toHaveBeenCalled()
      } finally {
        errors.mockRestore()
      }
    },
  )

  it.each([
    {
      fields: {
        linkType: 'internal',
        newTab: true,
        doc: { relationTo: 'events', value: { id: 1, slug: 'robotics workshop' } },
      },
      href: '/events/robotics%20workshop',
    },
    {
      fields: { linkType: 'custom', newTab: true, url: 'https://example.com/workshop' },
      href: 'https://example.com/workshop',
    },
  ] satisfies { fields: SerializedLinkNode['fields']; href: string }[])(
    'retains native link attributes for $href',
    ({ fields, href }) => {
      render(createElement(RichText, { data: editorWithLink(fields) }))
      const link = screen.getByRole('link', { name: 'Read this page' })
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      expect(link.querySelector('strong')?.textContent).toBe('Read this page')
    },
  )
})

describe('committee relationship rendering', () => {
  it.each([
    [
      'spotlight block',
      () =>
        CommitteeTeamMembersBlock({ committee: 8, team: 12, blockType: 'committeeTeamMembers' }),
    ],
    [
      'committee archive',
      () => CommitteePage({ params: Promise.resolve({ locale: 'en', year: '2026' }) }),
    ],
  ] as const)(
    'renders populated members in the %s alongside unpopulated relationships',
    async (_name, component) => {
      const team: Team = { id: 12, name: 'Robotics', positions: [], createdAt: '', updatedAt: '' }
      const person: Person = { id: 4, fullName: 'Surviving member', createdAt: '', updatedAt: '' }
      const committee: Committee = {
        id: 8,
        Year: '2026',
        createdAt: '',
        updatedAt: '',
        teams: [
          { team: 99, members: [] },
          {
            team,
            members: [
              { id: 'unpopulated', role: 'Unpopulated member role', person: 3 },
              { id: 'surviving', role: 'Coordinator', person },
            ],
          },
        ],
      }
      const storedRows = structuredClone(committee)
      getCommittee.mockResolvedValue(committee)
      getTeam.mockResolvedValue(team)

      render(await component())

      expect(screen.getByText('Surviving member')).toBeDefined()
      expect(screen.queryByText('Unpopulated member role')).toBeNull()
      expect(committee).toEqual(storedRows)
    },
  )
})

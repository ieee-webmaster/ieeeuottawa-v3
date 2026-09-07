import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
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
  setRequestLocale: vi.fn(),
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => key,
}))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@/utilities/generateMeta', () => ({ generateStaticMeta: vi.fn() }))

import { CommitteeTeamMembersBlock } from '@/blocks/CommitteeTeamMembers/Component'
import CommitteePage from '@/app/(frontend)/[locale]/committee/[year]/page'

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('committee relationship rendering', () => {
  it.each([{}, { committee: 1 }, { team: 1 }, { committee: null, team: 1 }])(
    'omits a committee block with incomplete relationships: %j',
    async (relationships) => {
      expect(
        await CommitteeTeamMembersBlock({ blockType: 'committeeTeamMembers', ...relationships }),
      ).toBeNull()
      expect(getCommittee).not.toHaveBeenCalled()
      expect(getTeam).not.toHaveBeenCalled()
    },
  )

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
      const team: Team = {
        id: 12,
        name: 'Robotics',
        positions: [
          { positionTitle: 'Workshop Lead', role: 'coord', positionEmail: 'team@example.test' },
        ],
        createdAt: '',
        updatedAt: '',
      }
      const person: Person = {
        id: 4,
        fullName: 'Surviving member',
        'Linkedin Profile': 'https://example.test/profile',
        createdAt: '',
        updatedAt: '',
      }
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
              { id: 'surviving', role: 'Workshop Lead', person },
            ],
          },
        ],
      }
      const storedRows = structuredClone(committee)
      getCommittee.mockResolvedValue(committee)
      getTeam.mockResolvedValue(team)

      render(await component())

      expect(screen.getByText('Surviving member')).toBeDefined()
      expect(screen.getByText('Workshop Lead')).toBeDefined()
      if (_name === 'committee archive') expect(screen.getByText('coordinator')).toBeDefined()
      expect(screen.queryByText('Unpopulated member role')).toBeNull()
      expect(screen.getByRole('link', { name: 'emailMember' }).getAttribute('href')).toBe(
        'mailto:team@example.test',
      )
      expect(screen.getByRole('link', { name: 'linkedinProfile' }).getAttribute('href')).toBe(
        'https://example.test/profile',
      )
      expect(committee).toEqual(storedRows)
    },
  )
})

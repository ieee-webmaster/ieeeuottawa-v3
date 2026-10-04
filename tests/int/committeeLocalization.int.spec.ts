import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import { createTranslator } from 'next-intl'

import en from '../../messages/en.json'
import fr from '../../messages/fr.json'
import type { Committee, Team } from '@/payload-types'
import type { CommitteePosition } from '@/utilities/committeePositions'
import type { Locale } from '@/i18n/routing'

const { getCommittee, getTeam, getPositions, getYears, request } = vi.hoisted(() => ({
  getCommittee: vi.fn<() => Promise<Committee>>(),
  getTeam: vi.fn<() => Promise<Team>>(),
  getPositions: vi.fn<() => Promise<CommitteePosition[]>>(),
  getYears: vi.fn<() => Promise<{ year: string }[]>>(),
  request: { locale: 'en' as Locale },
}))
vi.mock('@/utilities/publicCms', () => ({
  getCachedCommitteeByID: getCommittee,
  getCachedCommitteeByYear: getCommittee,
  getCachedTeamByID: getTeam,
  getCachedTeamPositions: getPositions,
  getCommitteeYears: getYears,
}))
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getLocale: async () => request.locale,
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: keyof typeof en }) =>
    createTranslator({ locale, namespace, messages: locale === 'fr' ? fr : en }),
}))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@/components/Media', () => ({
  Media: ({ alt }: { alt: string }) => createElement('img', { alt }),
}))

import CommitteePage, {
  generateMetadata as committeeMetadata,
} from '@/app/(frontend)/[locale]/committee/[year]/page'
import { CommitteeTeamMembersBlock } from '@/blocks/CommitteeTeamMembers/Component'
import { YearlyDocument } from '@/app/(frontend)/[locale]/documents/_components/YearlyDocument'
import { generateMetadata as docMetadata } from '@/app/(frontend)/[locale]/documents/[year]/page'
import { generateMetadata as postMetadata } from '@/app/(frontend)/[locale]/posts/page/[pageNumber]/page'

type FixturePosition = Omit<NonNullable<Team['positions']>[number], 'positionTitle' | 'id'> & {
  id: string
  positionTitle: { en: string; fr?: string }
}

const positions: FixturePosition[] = [
  {
    id: 'workshops',
    positionTitle: { en: 'Workshop Lead', fr: 'Responsable des ateliers' },
    role: 'coord',
    positionEmail: 'workshops@example.test',
  },
  {
    id: 'chair',
    positionTitle: { en: 'Chair', fr: 'Président(e)' },
    role: 'exec',
    positionEmail: 'chair@example.test',
  },
  {
    id: 'events',
    positionTitle: { en: 'Events Commissioner', fr: 'Commissaire aux événements' },
    role: 'commish',
    positionEmail: 'events@example.test',
  },
  { id: 'social', positionTitle: { en: 'VP Social', fr: 'VP Social' }, role: 'exec' },
  { id: 'volunteering', positionTitle: { en: 'VP Volunteering' }, role: 'exec' },
]

function fixture(locale: Locale, savedAs: 'en' | 'fr' | 'id' = 'en') {
  const team: Team = {
    id: 12,
    name: 'IEEE',
    createdAt: '',
    updatedAt: '',
    positions: positions.map((position) => {
      const titles = position.positionTitle
      return { ...position, role: position.role, positionTitle: titles[locale] || titles.en }
    }),
  }
  const committee: Committee = {
    id: 8,
    Year: '2026-2027',
    createdAt: '',
    updatedAt: '',
    coverImage: { id: 20, alt: '', url: '/cover.jpg', createdAt: '', updatedAt: '' },
    teams: [
      {
        team,
        members: positions.map((position, index) => {
          const titles = position.positionTitle
          return {
            id: `member-${index}`,
            role: savedAs === 'id' ? position.id : titles[savedAs] || titles.en,
            person: { id: index + 1, fullName: `Member ${index}`, createdAt: '', updatedAt: '' },
          }
        }),
      },
    ],
  }
  getCommittee.mockResolvedValue(committee)
  getTeam.mockResolvedValue(team)
  getPositions.mockResolvedValue(positions)
  return committee
}

beforeEach(() => {
  vi.clearAllMocks()
  getYears.mockResolvedValue([{ year: '2026-2027' }])
})
afterEach(cleanup)

describe.each(['en', 'fr'] as const)('%s committee rendering', (locale) => {
  it.each(['en', 'fr', 'id'] as const)(
    'uses localized titles and ranks for selections saved as %s',
    async (savedAs) => {
      const committee = fixture(locale, savedAs)
      const original = structuredClone(committee)
      render(await CommitteePage({ params: Promise.resolve({ locale, year: committee.Year }) }))

      const titles =
        locale === 'fr'
          ? [
              'Responsable des ateliers',
              'Président(e)',
              'Commissaire aux événements',
              'VP Social',
              'VP Volunteering',
            ]
          : ['Workshop Lead', 'Chair', 'Events Commissioner', 'VP Social', 'VP Volunteering']
      const ranks =
        locale === 'fr'
          ? ['Coordonnateur ou coordonnatrice', "Membre de l'exécutif", 'Commissaire']
          : ['Coordinator', 'Executive', 'Commissioner']
      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(5)
      cards.forEach((card, index) => {
        const title = titles[index]
        if (!title) throw new Error(`Missing expected title for member ${index}`)
        expect(within(card).getByText(title)).toBeDefined()
        const rank = ranks[index]
        if (rank) expect(within(card).getByText(rank)).toBeDefined()
      })
      expect(
        screen
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href')?.startsWith('mailto:')),
      ).toHaveLength(3)
      expect(committee).toEqual(original)
    },
  )

  it('keeps team block titles and rank ordering consistent across languages', async () => {
    request.locale = locale
    fixture(locale)
    render(
      await CommitteeTeamMembersBlock({
        committee: 8,
        team: 12,
        blockType: 'committeeTeamMembers',
      }),
    )
    const cards = screen.getAllByRole('article')
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Member 1',
      'Member 3',
      'Member 4',
      'Member 2',
      'Member 0',
    ])
    expect(screen.getByText(locale === 'fr' ? 'Président(e)' : 'Chair')).toBeDefined()
    expect(
      screen.getByText(locale === 'fr' ? 'Responsable des ateliers' : 'Workshop Lead'),
    ).toBeDefined()
    expect(
      screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('mailto:')),
    ).toHaveLength(3)
  })

  it('preserves historic email hiding after resolving translated positions', async () => {
    fixture(locale)
    getYears.mockResolvedValue([{ year: '2027-2028' }])
    render(await CommitteePage({ params: Promise.resolve({ locale, year: '2026-2027' }) }))
    expect(
      screen.getAllByRole('link').some((link) => link.getAttribute('href')?.startsWith('mailto:')),
    ).toBe(false)
  })

  it('uses complete phrases for year headings, cover alt text and metadata', async () => {
    fixture(locale)
    const params = Promise.resolve({ locale, year: '2026-2027' })
    const committeeTitle = locale === 'fr' ? 'Comité 2026-2027' : '2026-2027 Committee'
    render(await CommitteePage({ params }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(committeeTitle)
    expect(screen.getByRole('img').getAttribute('alt')).toBe(committeeTitle)
    const committeeMeta = await committeeMetadata({ params })
    expect(committeeMeta.title).toBe(`${committeeTitle} | IEEE uOttawa`)
    expect(committeeMeta.openGraph?.title).toBe(committeeMeta.title)
    cleanup()

    const docsTitle = locale === 'fr' ? 'Documents 2026-2027' : '2026-2027 Documents'
    render(await YearlyDocument({ id: 1, year: '2026-2027', createdAt: '', updatedAt: '' }, locale))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(docsTitle)
    expect((await docMetadata({ params })).title).toBe(`${docsTitle} | IEEE uOttawa`)
    expect(
      (await postMetadata({ params: Promise.resolve({ locale, pageNumber: '2' }) })).title,
    ).toBe(`${locale === 'fr' ? 'Articles' : 'Posts'} - Page 2 | IEEE uOttawa`)
  })
})

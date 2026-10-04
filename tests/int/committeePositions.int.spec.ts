import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getPositionTitle,
  resolveCommitteePosition,
  teamPositionsSchema,
} from '@/utilities/committeePositions'

const { findByID, cache } = vi.hoisted(() => ({
  findByID: vi.fn(),
  cache: vi.fn((callback: () => unknown, _keys: string[], _options: unknown) => callback),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ findByID }) }))
vi.mock('next/cache', () => ({ unstable_cache: cache }))

import { getCachedTeamPositions } from '@/utilities/publicCms'
import { PUBLIC_CACHE_TAGS } from '@/utilities/publicCache'

const chair = {
  id: 'chair-id',
  positionTitle: { en: 'Chair', fr: 'Présidence' },
  role: 'exec' as const,
  positionEmail: 'chair@example.test',
}
const coordinator = {
  id: 'coordinator-id',
  positionTitle: { en: 'Coordinator' },
  role: 'coord' as const,
}
const positions = [chair, coordinator]

beforeEach(() => vi.clearAllMocks())

describe('committee position identity', () => {
  it.each(['chair-id', 'Chair', 'Présidence'])(
    'resolves a saved selection %s across locales',
    (value) => {
      const position = resolveCommitteePosition(positions, value)
      expect(position).toEqual(chair)
      if (!position) throw new Error('Missing chair position')
      expect(getPositionTitle(position, 'fr')).toBe('Présidence')
      expect(getPositionTitle(position, 'en')).toBe('Chair')
    },
  )

  it('preserves identity through translated title edits and row reordering', () => {
    const renamed = { ...chair, positionTitle: { en: 'President', fr: 'Président(e)' } }
    expect(resolveCommitteePosition([coordinator, renamed], 'chair-id')).toEqual(renamed)
  })

  it('falls back to English for absent or empty French titles', () => {
    expect(getPositionTitle(coordinator, 'fr')).toBe('Coordinator')
    expect(getPositionTitle({ positionTitle: { en: 'Coordinator', fr: '' } }, 'fr')).toBe(
      'Coordinator',
    )
  })

  it('does not guess the rank or email of an unknown or ambiguous legacy title', () => {
    expect(resolveCommitteePosition(positions, 'Retired role')).toBeUndefined()
    const duplicate = { ...chair, id: 'another-chair' }
    expect(resolveCommitteePosition([...positions, duplicate], 'Chair')).toBeUndefined()
    expect(resolveCommitteePosition([...positions, duplicate], 'chair-id')).toEqual(chair)
  })

  it('loads all title translations through the public API and invalidates with team edits', async () => {
    findByID.mockResolvedValue({ positions })
    expect(await getCachedTeamPositions(12)).toEqual(
      teamPositionsSchema.parse({ positions }).positions,
    )
    expect(findByID).toHaveBeenCalledWith({
      collection: 'teams',
      depth: 0,
      id: 12,
      locale: 'all',
      overrideAccess: false,
      select: { positions: true },
    })
    expect(cache).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.arrayContaining(['team-positions', '12']),
      {
        revalidate: 86400,
        tags: [PUBLIC_CACHE_TAGS.all, PUBLIC_CACHE_TAGS.committee],
      },
    )
  })
})

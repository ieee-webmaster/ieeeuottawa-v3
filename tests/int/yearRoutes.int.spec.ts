import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import { getRouteMatcher } from 'next/dist/shared/lib/router/utils/route-matcher'
import { getRouteRegex } from 'next/dist/shared/lib/router/utils/route-regex'
import type { Committee, Doc } from '@/payload-types'
import type { Locale } from '@/i18n/routing'

const { getDocs, getDoc, getCommittee } = vi.hoisted(() => ({
  getDocs: vi.fn<(locale: Locale) => Promise<Doc[]>>(),
  getDoc: vi.fn<(year: string, locale: Locale) => Promise<Doc>>(),
  getCommittee: vi.fn<(year: string, locale: Locale) => Promise<Committee>>(),
}))

vi.mock('@/utilities/publicCms', () => ({
  getCachedDocsList: getDocs,
  getCachedDocByYear: getDoc,
  getCachedCommitteeByYear: getCommittee,
  getDocYears: async () => [],
  getCommitteeYears: async () => [],
}))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))
vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  useTranslations: () => (key: string) => key,
}))
vi.mock('@/i18n/navigation', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', props),
}))
vi.mock('@/components/Media', () => ({ Media: () => null }))

import DocumentsPage from '@/app/(frontend)/[locale]/documents/page'
import DocPage, {
  generateMetadata as docMetadata,
} from '@/app/(frontend)/[locale]/documents/[year]/page'
import CommitteePage, {
  generateMetadata as committeeMetadata,
} from '@/app/(frontend)/[locale]/committee/[year]/page'
import { CommitteeCard } from '@/app/(frontend)/[locale]/committee/_components/CommitteeCard'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('academic year URL segments', () => {
  it.each(['2025-2026', '2025/2026', '100% #?', 'Année 2025'])(
    'round-trips year %s',
    async (year) => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
      const doc: Doc = { id: 1, year, createdAt: '', updatedAt: '' }
      const committee: Committee = { id: 2, Year: year, createdAt: '', updatedAt: '' }
      getDocs.mockResolvedValue([doc])
      getDoc.mockResolvedValue(doc)
      getCommittee.mockResolvedValue(committee)

      render(await DocumentsPage({ params: Promise.resolve({ locale: 'en' }) }))
      render(createElement(CommitteeCard, { committee, index: 0, total: 1 }))

      const links = screen.getAllByRole('link', { name: year })
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        `/documents/${encodeURIComponent(year)}`,
        `/committee/${encodeURIComponent(year)}`,
      ])

      for (const { prefix, page, metadata, lookup } of [
        { prefix: 'documents', page: DocPage, metadata: docMetadata, lookup: getDoc },
        {
          prefix: 'committee',
          page: CommitteePage,
          metadata: committeeMetadata,
          lookup: getCommittee,
        },
      ]) {
        const url = `/en/${prefix}/${encodeURIComponent(year)}`
        const matched = getRouteMatcher(getRouteRegex(`/[locale]/${prefix}/[year]`))(url)
        if (!matched || matched.locale !== 'en' || typeof matched.year !== 'string') {
          throw new Error('Next did not match the year URL')
        }
        expect(matched.year).toBe(year)
        const params = Promise.resolve<{ locale: Locale; year: string }>({
          locale: matched.locale,
          year: matched.year,
        })
        await page({ params })
        expect(lookup).toHaveBeenLastCalledWith(year, 'en')
        expect((await metadata({ params })).alternates?.canonical).toBe(
          `https://example.test${url}`,
        )
      }
    },
  )
})

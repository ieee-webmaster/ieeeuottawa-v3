import type { Metadata } from 'next'

import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { CommitteeCard } from './_components/CommitteeCard'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { SectionShell } from '@/blocks/_shared'
import { getCachedCommitteeList } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 86400

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function CommitteeLanding({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  const committees = await getCachedCommitteeList(locale)

  return (
    <SectionShell theme="default">
      <header className="mb-10 space-y-4">
        <h1 className="page-title">{t('pageTitle')}</h1>
        <p className="page-intro">{t('landingDescription')}</p>
      </header>

      {committees.length === 0 ? (
        <p className="py-8 text-base text-muted-foreground">{t('noRecords')}</p>
      ) : (
        <ul role="list" className="grid gap-x-10 sm:grid-cols-2">
          {committees.map((committee) => (
            <CommitteeCard key={committee.id} committee={committee} />
          ))}
        </ul>
      )}
    </SectionShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  return generateStaticMeta({
    description: t('landingDescription'),
    locale,
    path: '/committee',
    title: t('pageTitle'),
  })
}

import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getTranslations } from 'next-intl/server'
import type { Config } from '@/payload-types'
import { CommitteeCard } from './_components/CommitteeCard'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'

type Args = {
  params: Promise<{ locale: Config['locale'] }>
}

export default async function CommitteeLanding({ params }: Args) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  const { docs: committees } = await payload.find({
    collection: 'committee',
    depth: 1,
    limit: 100,
    locale,
    overrideAccess: false,
    sort: '-Year',
  })

  return (
    <SectionShell theme="default" padding="pt-24 pb-20 md:pt-36 md:pb-28">
      <header className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-7">
          <Eyebrow theme="default">{t('archiveLabel')}</Eyebrow>
          <h1 className="text-balance text-5xl font-medium leading-[1] tracking-tight sm:text-6xl md:text-7xl">
            {t('pageTitle')}
          </h1>
        </div>
        <div className="md:col-span-5">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('landingDescription')}
          </p>
        </div>
      </header>

      <div className={`h-px w-full ${themeRule.default}`} />

      {committees.length === 0 ? (
        <p className="py-20 text-sm text-muted-foreground">{t('noRecords')}</p>
      ) : (
        <ul role="list" className="divide-y divide-foreground/20">
          {committees.map((committee, index) => (
            <CommitteeCard
              key={committee.id}
              committee={committee}
              index={index}
              total={committees.length}
            />
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

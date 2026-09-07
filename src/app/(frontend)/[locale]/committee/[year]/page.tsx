import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import { ArrowLeft, UserRound } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Committee, Person, Team, Config } from '@/payload-types'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Link } from '@/i18n/navigation'
import { SectionShell } from '@/blocks/_shared'
import { PersonCard } from '@/components/PersonCard'
import { Media as MediaComponent } from '@/components/Media'
import { hasRenderableMediaSource } from '@/components/Media/hasRenderableMediaSource'
import { getCachedCommitteeByYear, getCommitteeYears } from '@/utilities/publicCms'

export const dynamic = 'force-static'
export const revalidate = 86400

export async function generateStaticParams() {
  return getCommitteeYears()
}

type Args = {
  params: Promise<{ year: string; locale: Config['locale'] }>
}

type CommitteeMember = NonNullable<NonNullable<Committee['teams']>[number]['members']>[number]
type ResolvedCommitteeMember = Omit<CommitteeMember, 'person'> & {
  person: Person
  positionEmail?: string | null
  rank?: string
}

export default async function CommitteePage({ params }: Args) {
  const { year, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  const committee = await getCachedCommitteeByYear(year, locale)
  if (!committee) notFound()

  const coverImage =
    committee.coverImage &&
    typeof committee.coverImage !== 'number' &&
    hasRenderableMediaSource(committee.coverImage)
      ? committee.coverImage
      : null
  const rankLabels: Record<NonNullable<NonNullable<Team['positions']>[number]['role']>, string> = {
    exec: t('executive'),
    commish: t('commissioner'),
    coord: t('coordinator'),
  }
  const sections = (committee.teams ?? []).flatMap((teamEntry) => {
    if (typeof teamEntry.team === 'number') {
      return []
    }

    const team = teamEntry.team
    const data = (teamEntry.members ?? []).flatMap((member): ResolvedCommitteeMember[] => {
      if (typeof member.person === 'number') {
        return []
      }

      const person = member.person
      const positionDef = team.positions?.find((p) => p.positionTitle === member.role)

      return [
        {
          ...member,
          person,
          positionEmail: positionDef?.positionEmail,
          rank: positionDef?.role ? rankLabels[positionDef.role] : undefined,
        },
      ]
    })

    return data.length > 0 ? [{ title: team.name, data }] : []
  })

  const hasNoData = sections.length === 0
  return (
    <SectionShell theme="default">
      <header className="mb-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Link href="/committee" className="back-link mb-4">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t('backToCommittees')}
          </Link>
          <h1 className="page-title">
            {committee.Year} {t('title')}
          </h1>
          {sections.length > 1 && (
            <nav aria-label={t('teams')} className="mt-6 flex flex-wrap gap-2">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#team-${index + 1}`}
                  className="inline-flex min-h-11 items-center border border-border px-4 font-mono text-sm transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          )}
        </div>
        {coverImage && (
          <MediaComponent
            resource={coverImage}
            alt={coverImage.alt || `${committee.Year} ${t('title')}`}
            priority
            imgClassName="block h-auto w-full"
            pictureClassName="block"
            sizesPreset="half"
          />
        )}
      </header>

      {hasNoData ? (
        <div className="border-t border-border py-10">
          <UserRound className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-2xl font-medium">{t('teamDataPending')}</h2>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
            {t('teamNotFinalized', { year: committee.Year })}
          </p>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {sections.map((section, index) => (
            <section key={section.title} id={`team-${index + 1}`} className="scroll-mt-28">
              <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <h2 className="font-display text-2xl font-medium md:text-3xl">{section.title}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {t('memberCount', { count: section.data.length })}
                </span>
              </header>
              <div className="member-grid">
                {section.data.map((member) => (
                  <PersonCard
                    key={member.id}
                    person={member.person}
                    role={member.role}
                    rank={member.rank}
                    positionEmail={member.positionEmail}
                    emailLabel={t('emailMember', { name: member.person.fullName })}
                    linkedinLabel={t('linkedinProfile', { name: member.person.fullName })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { year, locale } = await params
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  return generateStaticMeta({
    description: t('landingDescription'),
    locale,
    path: `/committee/${encodeURIComponent(year)}`,
    title: `${year} ${t('title')}`,
  })
}

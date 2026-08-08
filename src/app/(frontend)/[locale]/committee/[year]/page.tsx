import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Mail, Linkedin, UserRound } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Committee, Team, Person, Media, Config } from '@/payload-types'
import { generateStaticMeta } from '@/utilities/generateMeta'
import { Link } from '@/i18n/navigation'
import { Eyebrow, SectionShell, themeRule } from '@/blocks/_shared'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type Args = {
  params: Promise<{ year: string; locale: Config['locale'] }>
}

export default async function CommitteePage({ params }: Args) {
  const { year, locale } = await params
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({
    locale: locale ?? 'en',
    namespace: 'committee',
  })

  const result = await payload.find({
    collection: 'committee',
    where: { Year: { equals: year } },
    depth: 2,
    limit: 1,
    locale,
    overrideAccess: false,
  })

  const committee = result.docs[0] as Committee
  if (!committee) notFound()

  const coverImage = committee.coverImage as Media | undefined
  const rankLabels: Record<string, string> = {
    exec: t('executive'),
    commish: t('commissioner'),
    coord: t('coordinator'),
  }

  const sections = (committee.teams ?? [])
    .map((teamEntry) => {
      const team = teamEntry.team as Team
      const data = (teamEntry.members ?? []).map((member) => {
        const positionDef = team.positions?.find((p) => p.positionTitle === member.role)
        const level = positionDef?.role

        return {
          ...member,
          teamName: team.name,
          positionEmail: positionDef?.positionEmail,
          rank: level ? (rankLabels[level] ?? level) : undefined,
        }
      })

      return { title: team.name, data }
    })
    .filter((section) => section.data.length > 0)

  const hasNoData = sections.length === 0
  const coverImageSrc = coverImage?.url
    ? getMediaUrl(coverImage.url, coverImage.updatedAt)
    : undefined

  return (
    <SectionShell theme="default" padding="pt-20 pb-20 md:pt-28 md:pb-28">
      <header className="mb-10 grid gap-8 md:mb-14 md:grid-cols-12 md:items-end md:gap-10">
        <div className="space-y-5 md:col-span-8">
          <Eyebrow theme="default">{t('archiveLabel')}</Eyebrow>
          <h1 className="text-balance text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {committee.Year} {t('title')}
          </h1>
        </div>
        <div className="md:col-span-4 md:flex md:justify-end">
          <Link
            href="/committee"
            className="group inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-[hsl(var(--interactive))]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            {t('backToCommittees')}
          </Link>
        </div>
      </header>

      {coverImageSrc ? (
        <div className="relative mb-16 aspect-[4/3] overflow-hidden bg-foreground/[0.04] sm:aspect-video md:mb-24 lg:aspect-[21/9]">
          <Image
            src={coverImageSrc}
            alt={coverImage?.alt || `${committee.Year} ${t('title')}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1360px"
          />
        </div>
      ) : (
        <div className={`mb-16 h-px w-full md:mb-24 ${themeRule.default}`} />
      )}

      {hasNoData ? (
        <div className="border-y border-foreground/20 py-20 text-center md:py-28">
          <UserRound className="mx-auto mb-6 h-9 w-9 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            {t('teamDataPending')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t('teamNotFinalized', { year: committee.Year })}
          </p>
        </div>
      ) : (
        <div className="space-y-20 md:space-y-28">
          {sections.map((section) => (
            <section key={section.title}>
              <header className="mb-8 grid gap-4 md:grid-cols-12 md:items-end">
                <div className="md:col-span-8">
                  <Eyebrow theme="default">{section.title}</Eyebrow>
                  <h2 className="mt-4 text-3xl font-medium leading-[1.05] tracking-tight md:text-5xl">
                    {section.title}
                  </h2>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                    {t('memberCount', { count: section.data.length })}
                  </span>
                </div>
              </header>

              <div className={`mb-10 h-px w-full md:mb-14 ${themeRule.default}`} />

              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
                {section.data.map((member) => {
                  const person = member.person as Person
                  const headshot = person.headshot as Media | undefined
                  const headshotSrc = headshot?.url
                    ? getMediaUrl(headshot.url, headshot.updatedAt)
                    : undefined

                  return (
                    <article key={member.id} className="group min-w-0">
                      <div className="relative aspect-[4/5] overflow-hidden bg-foreground/[0.04]">
                        {headshotSrc ? (
                          <Image
                            src={headshotSrc}
                            alt={person.fullName}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserRound
                              className="h-10 w-10 text-foreground/25 md:h-12 md:w-12"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <p className="font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.18em] text-primary md:text-[0.68rem]">
                          {member.role}
                        </p>
                        <h3 className="text-base font-medium leading-tight tracking-tight transition-colors group-hover:text-primary md:text-xl">
                          {person.fullName}
                        </h3>
                        {member.rank && (
                          <p className="text-xs text-muted-foreground md:text-sm">{member.rank}</p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-muted-foreground">
                        {member.positionEmail && (
                          <a
                            href={`mailto:${member.positionEmail}`}
                            aria-label={t('emailMember', { name: person.fullName })}
                            className="transition-colors hover:text-primary"
                          >
                            <Mail className="h-4 w-4" aria-hidden="true" />
                          </a>
                        )}
                        {person['Linkedin Profile'] && (
                          <a
                            href={person['Linkedin Profile']}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('linkedinProfile', { name: person.fullName })}
                            className="transition-colors hover:text-primary"
                          >
                            <Linkedin className="h-4 w-4" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
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
    path: `/committee/${year}`,
    title: `${year} ${t('title')}`,
  })
}

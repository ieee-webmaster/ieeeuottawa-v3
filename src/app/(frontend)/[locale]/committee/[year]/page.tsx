import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Linkedin, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Committee, Team, Person, Media, Config } from '@/payload-types'

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
  })

  const committee = result.docs[0] as Committee
  if (!committee) notFound()

  const coverImage = committee.coverImage as Media | undefined
  const executives: any[] = []
  const commissioners: any[] = []
  const coordinators: any[] = []

  committee.teams?.forEach((teamEntry) => {
    const team = teamEntry.team as Team
    teamEntry.members?.forEach((member) => {
      const positionDef = team.positions?.find((p) => p.positionTitle === member.role)
      const level = positionDef?.role

      const personData = {
        ...member,
        teamName: team.name,
        positionEmail: positionDef?.positionEmail,
      }

      if (level === 'exec') executives.push(personData)
      else if (level === 'commish') commissioners.push(personData)
      else coordinators.push(personData)
    })
  })

  const hasNoData =
    executives.length === 0 && commissioners.length === 0 && coordinators.length === 0

  const sections = [
    { title: t('executives'), data: executives },
    { title: t('commissioners'), data: commissioners },
    { title: t('coordinators'), data: coordinators },
  ]

  return (
    <main className="max-w-[1400px] m-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 transition-colors duration-300">
      <div className="mb-12 md:mb-20">
        <Link
          href="/committee"
          className="inline-flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
          {t('backToCommittees')}
        </Link>

        <header className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground">
            {committee.Year} {t('title')}
          </h1>
        </header>

        {coverImage?.url && (
          <div className="max-w-6xl mx-auto">
            <div className="overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-950 shadow-lg shadow-zinc-200/20 dark:shadow-none">
              <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] lg:max-h-[550px]">
                <Image
                  src={coverImage.url}
                  alt={`${committee.Year} Committee Banner`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1152px"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/10 px-6">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
            <User className="h-8 w-8 md:h-10 md:w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            {t('teamDataPending')}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-sm leading-relaxed">
            {t('teamNotFinalized', { year: committee.Year })}
          </p>
        </div>
      ) : (
        <div className="space-y-16 md:space-y-24 max-w-6xl mx-auto">
          {sections.map(
            (section) =>
              section.data.length > 0 && (
                <section key={section.title}>
                  <div className="flex items-center gap-4 mb-8 md:mb-14">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-[0.2em] text-foreground/50 whitespace-nowrap">
                      {section.title}
                    </h2>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-4 md:gap-x-10">
                    {section.data.map((member) => {
                      const person = member.person as Person
                      const headshot = person.headshot as Media | undefined

                      return (
                        <div
                          key={member.id}
                          className="group flex flex-col items-center text-center"
                        >
                          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all">
                            {headshot?.url ? (
                              <Image
                                src={headshot.url}
                                alt={person.fullName}
                                fill
                                className="object-cover transition-transform duration-500"
                                sizes="(max-width: 768px) 128px, 160px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <User className="h-10 w-10 md:h-12 md:w-12 text-zinc-300 dark:text-zinc-700" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5 px-2">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-primary">
                              {member.role}
                            </span>
                            <h3 className="text-base md:text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {person.fullName}
                            </h3>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium opacity-80 line-clamp-1">
                              {member.teamName}
                            </p>
                          </div>

                          <div className="flex gap-1 mt-3">
                            {member.positionEmail && (
                              <a
                                href={`mailto:${member.positionEmail}`}
                                className="p-2 rounded-full text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
                              >
                                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </a>
                            )}
                            {person['Linkedin Profile'] && (
                              <a
                                href={person['Linkedin Profile']}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
                              >
                                <Linkedin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ),
          )}
        </div>
      )}
    </main>
  )
}

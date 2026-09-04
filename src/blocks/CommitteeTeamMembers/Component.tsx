import { getLocale } from 'next-intl/server'
import { Linkedin, Mail, User } from 'lucide-react'
import React from 'react'

import type { CommitteeTeamMembersBlock as CommitteeTeamMembersBlockProps } from '@/payload-types'
import { resolveLocale } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { cn } from '@/utilities/ui'
import { SectionShell, Eyebrow, themeMutedText, themeRule, type BlockTheme } from '@/blocks/_shared'
import { Media } from '@/components/Media'
import { hasRenderableMediaSource } from '@/components/Media/hasRenderableMediaSource'
import { getCachedCommitteeByID, getCachedTeamByID } from '@/utilities/publicCms'

export const CommitteeTeamMembersBlock: React.FC<CommitteeTeamMembersBlockProps> = async ({
  committee,
  id,
  team,
}) => {
  const locale = resolveLocale(await getLocale())
  const t = await getTranslations({ locale, namespace: 'committee' })
  const theme: BlockTheme = 'default'

  const committeeId = typeof committee === 'number' ? committee : committee.id
  const teamId = typeof team === 'number' ? team : team.id

  const committeeDoc = await getCachedCommitteeByID(committeeId, locale)
  const teamDoc = await getCachedTeamByID(teamId, locale)

  const committeeTeamEntry = committeeDoc.teams?.find((entry) => {
    const entryTeamId = typeof entry.team === 'number' ? entry.team : entry.team.id
    return entryTeamId === teamDoc.id
  })

  const members = (committeeTeamEntry?.members ?? []).flatMap((member) => {
    if (typeof member.person === 'number') {
      return []
    }

    const person = member.person
    const positionDef = teamDoc.positions?.find((position) => {
      return position.positionTitle === member.role
    })

    const level = positionDef?.role

    return [
      {
        ...member,
        person,
        teamName: teamDoc.name,
        positionEmail: positionDef?.positionEmail,
        level,
      },
    ]
  })

  const executives = members.filter((member) => member.level === 'exec')
  const commissioners = members.filter((member) => member.level === 'commish')
  const coordinators = members.filter((member) => !member.level || member.level === 'coord')

  const hasNoData =
    executives.length === 0 && commissioners.length === 0 && coordinators.length === 0
  const title = t('teamSpotlightTitle', { team: teamDoc.name })
  const subtitle = t('teamSpotlightSubtitle', {
    team: teamDoc.name,
    year: committeeDoc.Year,
  })

  const sections = [
    { title: t('executives'), data: executives },
    { title: t('commissioners'), data: commissioners },
    { title: t('coordinators'), data: coordinators },
  ]

  return (
    <div id={`block-${id}`}>
      <SectionShell theme={theme}>
        <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
          <div className="space-y-5 md:col-span-7">
            <Eyebrow theme={theme}>{committeeDoc.Year}</Eyebrow>
            <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
              {title}
            </h2>
          </div>

          <div className="md:col-span-5">
            <p className={cn('text-base leading-relaxed', themeMutedText[theme])}>{subtitle}</p>
          </div>
        </div>

        <div className={cn('mt-12 h-px w-full', themeRule[theme])} />

        {hasNoData ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-foreground/10 bg-foreground/[0.02] px-6 py-20 text-center md:mt-14 md:py-28">
            <div className="mb-6 rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm">
              <User className="h-8 w-8 text-primary/20 md:h-10 md:w-10" />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              {t('teamDataPending')}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t('teamNotFinalized', { year: committeeDoc.Year })}
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-14 md:mt-14 md:space-y-20">
            <section>
              <div className="flex items-center gap-4 mb-8 md:mb-14">
                <div className={cn('h-px flex-1', themeRule[theme])} />
                <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.2em] text-foreground/50 whitespace-nowrap">
                  {t('members')}
                </h3>
                <div className={cn('h-px flex-1', themeRule[theme])} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-10 lg:grid-cols-4 xl:grid-cols-5">
                {sections
                  .flatMap((section) => section.data)
                  .map((member) => {
                    const { person } = member
                    const headshot =
                      person.headshot &&
                      typeof person.headshot !== 'number' &&
                      hasRenderableMediaSource(person.headshot)
                        ? person.headshot
                        : null

                    return (
                      <div key={member.id} className="group flex flex-col items-center text-center">
                        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border border-foreground/10 bg-background transition-all md:h-40 md:w-40">
                          {headshot ? (
                            <Media
                              fill
                              htmlElement={null}
                              resource={headshot}
                              alt={person.fullName}
                              imgClassName="object-cover transition-transform duration-500"
                              pictureClassName="absolute inset-0"
                              sizesPreset="avatar"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="h-10 w-10 text-foreground/20 md:h-12 md:w-12" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5 px-2">
                          <span className="text-[8px] font-black uppercase tracking-wider text-primary md:text-[9px]">
                            {member.role}
                          </span>
                          <h4 className="text-base font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
                            {person.fullName}
                          </h4>
                          <p className="text-[10px] font-medium text-muted-foreground opacity-80 md:text-[11px]">
                            {member.teamName}
                          </p>
                        </div>

                        <div className="mt-3 flex gap-1">
                          {member.positionEmail && (
                            <a
                              href={`mailto:${member.positionEmail}`}
                              className="rounded-full p-2 text-foreground/40 transition-all hover:bg-primary/5 hover:text-primary"
                            >
                              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </a>
                          )}
                          {person['Linkedin Profile'] && (
                            <a
                              href={person['Linkedin Profile']}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full p-2 text-foreground/40 transition-all hover:bg-primary/5 hover:text-primary"
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
          </div>
        )}
      </SectionShell>
    </div>
  )
}

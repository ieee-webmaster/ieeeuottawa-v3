import { getLocale } from 'next-intl/server'
import React from 'react'

import type { CommitteeTeamMembersBlock as CommitteeTeamMembersBlockProps } from '@/payload-types'
import { resolveLocale } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/blocks/_shared'
import { PersonCard } from '@/components/PersonCard'
import { getCachedCommitteeByID, getCachedTeamByID } from '@/utilities/publicCms'

type Props = Omit<CommitteeTeamMembersBlockProps, 'committee' | 'team'> & {
  committee?: CommitteeTeamMembersBlockProps['committee'] | null
  team?: CommitteeTeamMembersBlockProps['team'] | null
}

export const CommitteeTeamMembersBlock: React.FC<Props> = async ({ committee, id, team }) => {
  if (!committee || !team) return null

  const locale = resolveLocale(await getLocale())
  const t = await getTranslations({ locale, namespace: 'committee' })

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
        positionEmail: positionDef?.positionEmail,
        level,
      },
    ]
  })

  const executives = members.filter((member) => member.level === 'exec')
  const commissioners = members.filter((member) => member.level === 'commish')
  const coordinators = members.filter((member) => !member.level || member.level === 'coord')

  const orderedMembers = [...executives, ...commissioners, ...coordinators]

  return (
    <div id={`block-${id}`}>
      <SectionShell theme="default">
        <header className="mb-8 space-y-3">
          <p className="font-mono text-sm text-muted-foreground">{committeeDoc.Year}</p>
          <h2 className="section-title">{teamDoc.name}</h2>
        </header>
        {orderedMembers.length === 0 ? (
          <div className="border-t border-border py-8">
            <h3 className="text-xl font-medium">{t('teamDataPending')}</h3>
            <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">
              {t('teamNotFinalized', { year: committeeDoc.Year })}
            </p>
          </div>
        ) : (
          <div className="member-grid">
            {orderedMembers.map((member) => (
              <PersonCard
                key={member.id}
                person={member.person}
                role={member.role}
                positionEmail={member.positionEmail}
                emailLabel={t('emailMember', { name: member.person.fullName })}
                linkedinLabel={t('linkedinProfile', { name: member.person.fullName })}
              />
            ))}
          </div>
        )}
      </SectionShell>
    </div>
  )
}

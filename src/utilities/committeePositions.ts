import { z } from 'zod'

import type { Config, Team } from '@/payload-types'

type Position = NonNullable<Team['positions']>[number]

// Payload's generated types describe one locale; locale=all returns title maps.
export const teamPositionsSchema = z.object({
  positions: z
    .array(
      z.object({
        id: z.string().nullish(),
        positionTitle: z.union([z.string(), z.record(z.string(), z.string().nullish())]).nullish(),
        positionEmail: z.string().nullish(),
        role: z.enum(['exec', 'commish', 'coord'] satisfies Position['role'][]).nullish(),
      }),
    )
    .nullish(),
})

export type CommitteePosition = NonNullable<
  z.infer<typeof teamPositionsSchema>['positions']
>[number]

export const getPositionTitle = (position: CommitteePosition, locale: Config['locale']) => {
  const title = position.positionTitle
  return typeof title === 'string' ? title : title?.[locale] || title?.en || undefined
}

export const resolveCommitteePosition = (positions: CommitteePosition[], savedRole: string) => {
  const byID = positions.find((position) => position.id === savedRole)
  if (byID) return byID

  // Older committee records (and legacy imports) store a title instead of a row ID.
  const matches = positions.filter(({ positionTitle }) =>
    typeof positionTitle === 'string'
      ? positionTitle === savedRole
      : Object.values(positionTitle ?? {}).includes(savedRole),
  )

  // Do not assign another position's rank/email when a legacy title is ambiguous.
  return matches.length === 1 ? matches[0] : undefined
}

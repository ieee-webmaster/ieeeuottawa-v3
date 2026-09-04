import { z } from 'zod'

const personSchema = z.object({
  linkedin: z.string().nullable().optional(),
  name: z.string(),
  slug: z.string(),
})
export const peopleSchema = z.array(personSchema)
export type PersonData = z.infer<typeof personSchema>

const teamSchema = z.object({
  name: z.string(),
  positions: z.array(
    z.object({
      positionEmail: z.string().optional(),
      role: z.enum(['commish', 'coord', 'exec']),
      title: z.object({ en: z.string(), fr: z.string() }),
    }),
  ),
})
export const teamsSchema = z.array(teamSchema)
export type TeamData = z.infer<typeof teamSchema>

const committeeSchema = z.object({
  coverImageFile: z.string().optional(),
  teams: z.array(
    z.object({
      members: z.array(z.object({ personSlug: z.string(), roleTitle: z.string() })),
      name: z.string(),
    }),
  ),
  year: z.string(),
})
export const committeesSchema = z.array(committeeSchema)
export type CommitteeData = z.infer<typeof committeeSchema>

const docSchema = z.object({
  description: z.string().optional(),
  descriptionFr: z.string().optional(),
  meetingDate: z.string().optional(),
  name: z.string(),
  nameFr: z.string().optional(),
  url: z.string(),
})
export const docsSchema = z.object({
  generalDocuments: z.array(docSchema),
  years: z.array(
    z.object({
      meetingMinutes: z.array(docSchema),
      otherDocuments: z.array(docSchema),
      year: z.string(),
    }),
  ),
})
export type DocData = z.infer<typeof docSchema>
export type DocsData = z.infer<typeof docsSchema>

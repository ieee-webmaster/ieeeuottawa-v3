import { z } from 'zod'

export const collectionFieldsResponseSchema = z.object({
  fields: z.array(z.object({ name: z.string(), type: z.string(), label: z.string() })),
})

export type FieldDescriptor = z.infer<typeof collectionFieldsResponseSchema>['fields'][number]

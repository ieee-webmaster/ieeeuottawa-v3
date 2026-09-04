import { z } from 'zod'

export const payloadErrorResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() })),
})

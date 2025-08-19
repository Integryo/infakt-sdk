import { z } from 'zod'

export const MetaInfo = z.object({
  count: z.number().int().nonnegative(),
  total_count: z.number().int().nonnegative(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
})

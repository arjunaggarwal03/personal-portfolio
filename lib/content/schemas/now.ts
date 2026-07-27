import { z } from 'zod'
import { isoDateSchema } from './writing'

export const curatedNowSchema = z.object({
  lastUpdated: isoDateSchema,
  building: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    revised: isoDateSchema,
    href: z.url().optional(),
  }),
  thinking: z.object({
    question: z.string().min(1),
    perspectives: z
      .array(z.object({ label: z.string().min(1), view: z.string().min(1) }))
      .min(2),
    evidence: z.string().min(1).optional(),
  }),
  changedMyMind: z.object({
    previous: z.string().min(1),
    current: z.string().min(1),
    revised: isoDateSchema,
  }),
})

export type CuratedNow = z.infer<typeof curatedNowSchema>

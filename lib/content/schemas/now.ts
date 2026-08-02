import { z } from 'zod'
import { isoDateSchema } from './writing'

export const curatedNowSchema = z
  .object({
    lastUpdated: isoDateSchema,
    workingOn: z
      .object({
        title: z.string().min(1),
        summary: z.string().min(1),
        revised: isoDateSchema,
        href: z.url().optional(),
      })
      .strict(),
    question: z
      .object({
        prompt: z.string().min(1),
        currentView: z.string().min(1),
        counterargument: z.string().min(1),
        wouldChange: z.string().min(1),
      })
      .strict(),
    changedMyMind: z
      .object({
        previous: z.string().min(1),
        changed: z.string().min(1),
        current: z.string().min(1),
        revised: isoDateSchema,
      })
      .strict(),
    rotation: z
      .object({
        logSlugs: z.array(z.string().min(1)).min(1).max(6),
      })
      .strict(),
  })
  .strict()

export type CuratedNow = z.infer<typeof curatedNowSchema>

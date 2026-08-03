import { z } from 'zod'

const linkSchema = z.object({ label: z.string().min(1), url: z.url() }).strict()

export const siteIdentitySchema = z
  .object({
    name: z.string().min(1),
    role: z.string().min(1),
    location: z.string().min(1),
    description: z.string().min(1),
    homeDescription: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()

export const workItemSchema = z
  .object({
    company: z.string().min(1),
    role: z.string().min(1),
    location: z.string().optional(),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    summary: z.string().min(1),
    homeSummary: z.string().optional(),
    context: z.string().optional(),
    ownership: z.string().optional(),
    constraint: z.string().optional(),
    change: z.string().optional(),
    reflection: z.string().optional(),
    details: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    links: z.array(linkSchema).optional(),
  })
  .strict()

export const experimentSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1),
    year: z.string().optional(),
    group: z.enum(['AI / Search', 'Systems', 'Computer Vision', 'Other']),
    summary: z.string().min(1),
    tags: z.array(z.string()).optional(),
    links: z.array(linkSchema).optional(),
  })
  .strict()

export type SiteIdentity = z.infer<typeof siteIdentitySchema>
export type WorkItem = z.infer<typeof workItemSchema>
export type Experiment = z.infer<typeof experimentSchema>
export type ExperimentGroup = Experiment['group']

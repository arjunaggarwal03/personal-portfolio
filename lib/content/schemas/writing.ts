import { z } from 'zod'

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/, 'must start with YYYY-MM-DD')
  .refine((value) => {
    const date = value.slice(0, 10)
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (!Number.isFinite(parsedDate.getTime())) return false
    if (parsedDate.toISOString().slice(0, 10) !== date) return false
    return !value.includes('T') || Number.isFinite(Date.parse(value))
  }, 'must be a real ISO date or datetime')

export const writingFrontmatterSchema = z
  .object({
    slug: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1),
    subtitle: z.string().trim().min(1).optional(),
    date: isoDateSchema,
    updated: isoDateSchema.optional(),
    status: z.enum(['published', 'draft', 'forthcoming']).default('draft'),
    summary: z.string().default(''),
    tags: z.array(z.string().trim().min(1)).default([]),
    featured: z.boolean().optional(),
    canonical: z.boolean().optional(),
    showOnIndex: z.boolean().optional(),
  })
  .strict()

export const writingPostSchema = writingFrontmatterSchema.extend({
  id: z.string().min(1),
  slug: z.string().min(1),
  body: z.string(),
  readingTime: z.string().optional(),
  hasDetailPage: z.boolean(),
})

export type WritingPost = z.infer<typeof writingPostSchema>

import { z } from 'zod'
import { isoDateSchema, routeSegmentSchema } from './shared'

export const writingFrontmatterSchema = z
  .object({
    slug: routeSegmentSchema.optional(),
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
  id: routeSegmentSchema,
  slug: routeSegmentSchema,
  body: z.string(),
  readingTime: z.string().optional(),
  hasDetailPage: z.boolean(),
})

export type WritingPost = z.infer<typeof writingPostSchema>

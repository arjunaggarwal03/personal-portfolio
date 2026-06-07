import { z } from 'zod'

/**
 * Frontmatter schemas for filesystem content. These validate the raw YAML
 * (before slug/readingTime derivation) so malformed content fails the build
 * with a clear message instead of throwing at render time.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'must start with YYYY-MM-DD')

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export const writingFrontmatterSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  date: isoDate,
  updated: isoDate.optional(),
  status: z.enum(['published', 'draft', 'forthcoming']).default('draft'),
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  canonical: z.boolean().optional(),
  showOnIndex: z.boolean().optional(),
})

export type WritingFrontmatter = z.infer<typeof writingFrontmatterSchema>

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

const logType = z.enum([
  'thought',
  'link',
  'tweet',
  'article',
  'playlist',
  'album',
  'song',
  'film',
  'meal',
  'restaurant',
  'city',
  'travel',
  'photo',
  'clip',
  'essay',
  'build',
  'quote',
  'book',
  'note',
])

const mediaItemSchema = z.object({
  kind: z.enum(['image', 'video', 'spotify', 'tweet', 'youtube', 'link-preview']),
  url: z.string().min(1),
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', '3:4', 'auto']).optional(),
})

const ratingSchema = z.object({
  value: z.number().optional(),
  max: z.number().optional(),
  label: z
    .enum(['canon', 'revisit', 'liked', 'skip', 'in rotation', 'still thinking'])
    .optional(),
})

const locationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  venue: z.string().optional(),
  neighborhood: z.string().optional(),
})

const logFlagsSchema = z.object({
  featured: z.boolean().optional(),
  canonical: z.boolean().optional(),
  inRotation: z.boolean().optional(),
  private: z.boolean().optional(),
  draft: z.boolean().optional(),
  detail: z.boolean().optional(),
})

export const logFrontmatterSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  date: isoDate,
  updated: isoDate.optional(),
  type: logType,
  summary: z.string().optional(),
  url: z.url().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
  rating: ratingSchema.optional(),
  media: z.array(mediaItemSchema).optional(),
  location: locationSchema.optional(),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
  flags: logFlagsSchema.default({}),
})

export type LogFrontmatter = z.infer<typeof logFrontmatterSchema>

/**
 * Validate frontmatter against a schema, throwing a readable, file-scoped
 * error when it fails. Runs at content-read time (build/dev).
 */
export function parseFrontmatter<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  source: string
): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid frontmatter in "${source}":\n${issues}`)
  }
  return result.data
}

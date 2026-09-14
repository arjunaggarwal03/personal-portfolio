import { z } from 'zod'
import { assetIdSchema } from './media'
import { isoDateSchema, routeSegmentSchema } from './shared'
import { spotifyUri, youtubeEmbedUrl } from 'lib/media/embed-urls'
import { isAllowedRemoteImageUrl } from 'lib/media/image-sources'

const logTypeSchema = z.enum([
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

const httpsUrlSchema = z
  .string()
  .min(1)
  .superRefine((value, context) => {
    let parsed: URL
    try {
      parsed = new URL(value)
    } catch {
      context.addIssue({
        code: 'custom',
        message: 'must be a valid URL',
      })
      return
    }
    if (parsed.protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        message: 'must use HTTPS',
      })
    }
  })

const embedFields = {
  alt: z.string().optional(),
  caption: z.string().optional(),
  aspectRatio: z.enum(['1:1', '4:3', '16:9', '3:4', 'auto']).optional(),
}

const embedSchema = z.discriminatedUnion('kind', [
  z
    .object({
      ...embedFields,
      kind: z.literal('image'),
      url: httpsUrlSchema.refine(isAllowedRemoteImageUrl, {
        message: 'must use a configured remote image host',
      }),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .strict(),
  z
    .object({ ...embedFields, kind: z.literal('video'), url: httpsUrlSchema })
    .strict(),
  z
    .object({
      ...embedFields,
      kind: z.literal('spotify'),
      url: httpsUrlSchema.refine((url) => spotifyUri(url) !== null, {
        message: 'must use an exact Spotify host and supported resource URL',
      }),
    })
    .strict(),
  z
    .object({ ...embedFields, kind: z.literal('tweet'), url: httpsUrlSchema })
    .strict(),
  z
    .object({
      ...embedFields,
      kind: z.literal('youtube'),
      url: httpsUrlSchema.refine((url) => youtubeEmbedUrl(url) !== null, {
        message: 'must use an exact YouTube host and video URL',
      }),
    })
    .strict(),
  z
    .object({
      ...embedFields,
      kind: z.literal('link-preview'),
      url: httpsUrlSchema,
    })
    .strict(),
])

const ratingSchema = z
  .object({
    label: z
      .enum(['canon', 'in rotation', 'returned to', 'still considering'])
      .optional(),
  })
  .strict()

const locationSchema = z
  .object({
    city: z.string().optional(),
    country: z.string().optional(),
    venue: z.string().optional(),
    neighborhood: z.string().optional(),
  })
  .strict()

const flagsSchema = z
  .object({
    featured: z.boolean().optional(),
    canonical: z.boolean().optional(),
    inRotation: z.boolean().optional(),
    detail: z.boolean().optional(),
  })
  .strict()

export const galleryLayoutSchema = z.enum([
  'wide',
  'standard',
  'portrait',
  'pair',
])

export const logFrontmatterSchema = z
  .object({
    slug: routeSegmentSchema.optional(),
    title: z.string().optional(),
    date: isoDateSchema,
    updated: isoDateSchema.optional(),
    type: logTypeSchema,
    summary: z.string().optional(),
    url: z.url().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
    rating: ratingSchema.optional(),
    media: z.array(embedSchema).optional(),
    cover: assetIdSchema.optional(),
    gallery: z.array(assetIdSchema).default([]),
    layout: galleryLayoutSchema.default('standard'),
    location: locationSchema.optional(),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
    flags: flagsSchema.default({}),
  })
  .strict()

export const logEntrySchema = logFrontmatterSchema.extend({
  id: routeSegmentSchema,
  slug: routeSegmentSchema,
  body: z.string().optional(),
  hasDetailPage: z.boolean(),
})

export type LogEntry = z.infer<typeof logEntrySchema>
export type LogEmbed = z.infer<typeof embedSchema>
export type LogType = z.infer<typeof logTypeSchema>

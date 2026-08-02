import { z } from 'zod'
import { assetIdSchema } from './media'
import { isoDateSchema } from './writing'
import { spotifyUri, youtubeEmbedUrl } from 'lib/media/embed-urls'

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

const embedSchema = z
  .object({
    kind: z.enum([
      'image',
      'video',
      'spotify',
      'tweet',
      'youtube',
      'link-preview',
    ]),
    url: z.string().min(1),
    alt: z.string().optional(),
    caption: z.string().optional(),
    aspectRatio: z.enum(['1:1', '4:3', '16:9', '3:4', 'auto']).optional(),
  })
  .strict()
  .superRefine((embed, context) => {
    let parsed: URL
    try {
      parsed = new URL(embed.url)
    } catch {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'must be a valid URL',
      })
      return
    }
    if (parsed.protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'must use HTTPS',
      })
    }
    if (embed.kind === 'youtube' && !youtubeEmbedUrl(embed.url)) {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'must use an exact YouTube host and video URL',
      })
    }
    if (embed.kind === 'spotify' && !spotifyUri(embed.url)) {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'must use an exact Spotify host and supported resource URL',
      })
    }
  })

const ratingSchema = z
  .object({
    value: z.number().optional(),
    max: z.number().optional(),
    label: z
      .enum([
        'canon',
        'revisit',
        'liked',
        'skip',
        'in rotation',
        'still thinking',
      ])
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
    slug: z.string().trim().min(1).optional(),
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
  id: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().optional(),
  hasDetailPage: z.boolean(),
})

export type LogEntry = z.infer<typeof logEntrySchema>
export type LogEmbed = z.infer<typeof embedSchema>
export type LogType = z.infer<typeof logTypeSchema>
export type Rating = NonNullable<LogEntry['rating']>

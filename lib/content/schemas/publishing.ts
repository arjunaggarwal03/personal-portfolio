import { z } from 'zod'
import { galleryLayoutSchema } from './log'
import { isoDateSchema } from './writing'

const selectionItemSchema = z
  .object({
    id: z.string().min(1),
    selected: z.boolean(),
    order: z.number().int().positive().nullable(),
    cover: z.boolean(),
    kind: z.enum(['image', 'video']),
    sourcePath: z.string().min(1),
    relativePath: z.string().min(1),
    hash: z.string().regex(/^[a-f0-9]{64}$/),
    duplicateOf: z.string().nullable(),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    duration: z.number().positive().nullable(),
    alt: z.string(),
    caption: z.string(),
    takenAt: z.string().datetime({ offset: true }).nullable(),
    orientation: z.unknown().optional(),
    preview: z.string().nullable(),
    livePairId: z.string().nullable(),
  })
  .strict()

export const selectionManifestSchema = z
  .object({
    version: z.literal(1),
    sourceRoot: z.string().min(1),
    entry: z
      .object({
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        title: z.string().min(1),
        date: isoDateSchema,
        summary: z.string(),
        layout: galleryLayoutSchema,
        visibility: z.enum(['public', 'unlisted', 'private']),
      })
      .strict(),
    items: z.array(selectionItemSchema).min(1),
  })
  .strict()

export type SelectionItem = z.infer<typeof selectionItemSchema>

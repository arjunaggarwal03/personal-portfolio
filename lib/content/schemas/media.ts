import { z } from 'zod'

export const assetIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'must be a lowercase kebab-case asset ID',
  )
  .brand<'AssetId'>()

const dimensions = {
  width: z.number().int().positive(),
  height: z.number().int().positive(),
}

const shared = {
  id: assetIdSchema,
  alt: z.string().trim().min(1),
  caption: z.string().trim().min(1).optional(),
  takenAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().date())
    .optional(),
  visibility: z.enum(['public', 'private']).default('public'),
}

export const imageAssetSchema = z
  .object({
    ...shared,
    ...dimensions,
    kind: z.literal('image'),
    provider: z.literal('cloudinary'),
    sourceId: z.string().trim().min(1),
    focalPoint: z
      .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
      .strict()
      .optional(),
    fixturePath: z.string().startsWith('/test-media-fixture/files/').optional(),
  })
  .strict()

export const videoAssetSchema = z
  .object({
    ...shared,
    ...dimensions,
    kind: z.literal('video'),
    provider: z.literal('mux'),
    sourceId: z.string().trim().min(1),
    playbackId: z.string().trim().min(1),
    duration: z.number().positive(),
    posterTime: z.number().nonnegative().optional(),
    fixturePosterPath: z
      .string()
      .startsWith('/test-media-fixture/files/')
      .optional(),
  })
  .strict()

export const mediaAssetSchema = z.discriminatedUnion('kind', [
  imageAssetSchema,
  videoAssetSchema,
])

export const mediaCatalogSchema = z
  .object({
    version: z.literal(1),
    assets: z.array(mediaAssetSchema),
  })
  .strict()

export type ImageAsset = z.infer<typeof imageAssetSchema>
export type VideoAsset = z.infer<typeof videoAssetSchema>
export type MediaAsset = z.infer<typeof mediaAssetSchema>

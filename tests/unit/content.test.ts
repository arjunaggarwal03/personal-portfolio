import assert from 'node:assert/strict'
import test from 'node:test'
import { logEntrySchema } from '../../lib/content/schemas/log'
import { mediaAssetSchema } from '../../lib/content/schemas/media'
import {
  isoDateSchema,
  writingPostSchema,
} from '../../lib/content/schemas/writing'
import { validateContent } from '../../lib/content/validate'
import { paginateLogEntries } from '../../lib/content/queries'

const writing = writingPostSchema.parse({
  id: 'post',
  slug: 'post',
  title: 'Post',
  date: '2026-01-01',
  status: 'published',
  summary: '',
  tags: [],
  body: '',
  hasDetailPage: true,
})
const asset = mediaAssetSchema.parse({
  id: 'cover-one',
  kind: 'image',
  provider: 'cloudinary',
  sourceId: 'cover',
  width: 1200,
  height: 800,
  alt: 'A descriptive cover',
  visibility: 'public',
})
const entry = logEntrySchema.parse({
  id: 'entry',
  slug: 'entry',
  type: 'photo',
  title: 'Entry',
  date: '2026-01-01',
  cover: 'cover-one',
  gallery: ['cover-one'],
  layout: 'standard',
  tags: [],
  visibility: 'public',
  flags: {},
  hasDetailPage: true,
})

test('accepts a valid visual entry and media catalog', () => {
  assert.deepEqual(
    validateContent({ writing: [writing], log: [entry], assets: [asset] }),
    { warnings: [] },
  )
})

test('rejects missing asset references with the Log slug', () => {
  const missing = logEntrySchema.parse({
    ...entry,
    cover: 'missing-cover',
    gallery: ['missing-cover'],
  })
  assert.throws(
    () =>
      validateContent({ writing: [writing], log: [missing], assets: [asset] }),
    /entry: missing asset reference/,
  )
})

test('rejects duplicate slugs and odd pair layouts', () => {
  const paired = logEntrySchema.parse({ ...entry, layout: 'pair' })
  assert.throws(
    () =>
      validateContent({
        writing: [writing, writing],
        log: [paired],
        assets: [asset],
      }),
    /duplicate Writing slug[\s\S]*pair layout/,
  )
})

test('rejects duplicate Now selections', () => {
  const publicEntry = logEntrySchema.parse({
    ...entry,
    visibility: 'public',
  })
  assert.throws(
    () =>
      validateContent({
        writing: [writing],
        log: [publicEntry],
        assets: [asset],
        rotationSlugs: [publicEntry.slug, publicEntry.slug],
      }),
    /duplicate Now selection/,
  )
})

test('reports orphaned assets as warnings', () => {
  const textOnly = logEntrySchema.parse({
    ...entry,
    cover: undefined,
    gallery: [],
    type: 'thought',
    hasDetailPage: false,
  })
  assert.deepEqual(
    validateContent({ writing: [writing], log: [textOnly], assets: [asset] })
      .warnings,
    ['orphaned asset "cover-one"'],
  )
})

test('rejects an unexpected frontmatter field', () => {
  const result = logEntrySchema.safeParse({ ...entry, surprise: true })
  assert.equal(result.success, false)
})

test('requires a visual cover to belong to its gallery', () => {
  const second = mediaAssetSchema.parse({ ...asset, id: 'cover-two' })
  const mismatched = logEntrySchema.parse({
    ...entry,
    gallery: ['cover-two'],
  })
  assert.throws(
    () =>
      validateContent({
        writing: [writing],
        log: [mismatched],
        assets: [asset, second],
      }),
    /cover must also appear in gallery/,
  )
})

test('rejects public entries that reference private media', () => {
  const privateAsset = mediaAssetSchema.parse({
    ...asset,
    visibility: 'private',
  })
  assert.throws(
    () =>
      validateContent({
        writing: [writing],
        log: [entry],
        assets: [privateAsset],
      }),
    /public entry references private asset/,
  )
})

test('rejects impossible dates and lookalike provider embed URLs', () => {
  assert.equal(isoDateSchema.safeParse('2026-02-30').success, false)
  assert.equal(
    logEntrySchema.safeParse({
      ...entry,
      media: [
        {
          kind: 'youtube',
          url: 'https://youtube.com.attacker.example/watch?v=dQw4w9WgXcQ',
        },
      ],
    }).success,
    false,
  )
})

test('rejects incomplete video records', () => {
  assert.equal(
    mediaAssetSchema.safeParse({
      id: 'video-one',
      kind: 'video',
      provider: 'mux',
      sourceId: 'mux-asset',
      width: 1280,
      height: 720,
      duration: 2,
      alt: 'A video without playback configuration',
    }).success,
    false,
  )
})

test('pagination deterministically limits large Log collections', () => {
  const items = Array.from({ length: 45 }, (_, index) => index)
  assert.deepEqual(paginateLogEntries(items, 2), {
    entries: items.slice(20, 40),
    page: 2,
    totalPages: 3,
  })
  assert.equal(paginateLogEntries(items, 99).page, 3)
})

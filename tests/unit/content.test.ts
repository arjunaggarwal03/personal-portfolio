import assert from 'node:assert/strict'
import test from 'node:test'
import { logEntrySchema } from '../../lib/content/schemas/log'
import { mediaAssetSchema } from '../../lib/content/schemas/media'
import { isoDateSchema } from '../../lib/content/schemas/shared'
import { writingPostSchema } from '../../lib/content/schemas/writing'
import { validateContent } from '../../lib/content/validate'
import {
  featuredWritingEntries,
  writingIndexEntries,
} from '../../lib/content/queries'
import { normalizeWriting } from '../../lib/content/normalize'
import { buildLogIndex } from '../../lib/log-index'

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

test('rejects slugs that cannot be one route segment', () => {
  assert.throws(
    () =>
      normalizeWriting({
        id: 'nested/post',
        source: 'content/writing/nested/post.mdx',
        data: { title: 'Nested', date: '2026-01-01' },
        body: '',
      }),
    /lowercase kebab-case route segment/,
  )
  assert.equal(
    writingPostSchema.safeParse({ ...writing, slug: '../about' }).success,
    false,
  )
})

test('image embeds require stable dimensions and a configured host', () => {
  assert.equal(
    logEntrySchema.safeParse({
      ...entry,
      media: [
        {
          kind: 'image',
          url: 'https://attacker.example/image.avif',
          width: 1200,
          height: 800,
        },
      ],
    }).success,
    false,
  )
  assert.equal(
    logEntrySchema.safeParse({
      ...entry,
      media: [
        {
          kind: 'image',
          url: 'https://res.cloudinary.com/demo/image/upload/example.jpg',
          width: 1200,
          height: 800,
        },
      ],
    }).success,
    true,
  )
})

test('requires dimensioned MDX image components outside code examples', () => {
  assert.throws(
    () =>
      validateContent({
        writing: [{ ...writing, body: '![Alt](/image.jpg)' }],
        log: [entry],
        assets: [asset],
      }),
    /ImageWithCaption with width and height/,
  )
  assert.doesNotThrow(() =>
    validateContent({
      writing: [{ ...writing, body: '`![Alt](/example.jpg)`' }],
      log: [entry],
      assets: [asset],
    }),
  )
})

test('forthcoming writing has an index-only variant', () => {
  const forthcoming = writingPostSchema.parse({
    ...writing,
    id: 'coming-soon',
    slug: 'coming-soon',
    status: 'forthcoming',
    showOnIndex: true,
    hasDetailPage: false,
  })
  assert.deepEqual(
    writingIndexEntries([writing, forthcoming]).map((post) => post.slug),
    ['post', 'coming-soon'],
  )
  assert.deepEqual(
    featuredWritingEntries([forthcoming, writing], 1).map((post) => post.slug),
    ['post'],
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

test('the Log index exposes only useful filters and normalizes its query', () => {
  const thought = logEntrySchema.parse({
    ...entry,
    type: 'thought',
    flags: { featured: true },
  })
  const index = buildLogIndex({
    entries: [thought],
    inNowSlugs: [thought.slug],
    searchParams: { type: ['thought', 'film'], page: 'not-a-page' },
  })
  assert.deepEqual(
    index.filters.map((filter) => filter.label),
    ['All', 'Thoughts'],
  )
  assert.deepEqual(index.entries, [{ entry: thought, inNow: true }])
  assert.deepEqual(index.pagination, { page: 1, totalPages: 1 })
  assert.deepEqual(index.seo, {
    title: 'Thoughts · Log',
    canonicalPath: '/log?type=thought',
    allowIndexing: false,
  })
})

test('the Log index clamps pagination and preserves active filters in links', () => {
  const entries = Array.from({ length: 45 }, (_, index) =>
    logEntrySchema.parse({
      ...entry,
      id: `entry-${index}`,
      slug: `entry-${index}`,
      type: 'thought',
    }),
  )
  const index = buildLogIndex({
    entries,
    inNowSlugs: [],
    searchParams: { type: 'thought', page: '99' },
  })
  assert.equal(index.entries.length, 5)
  assert.deepEqual(index.pagination, {
    page: 3,
    totalPages: 3,
    newerHref: '/log?type=thought&page=2',
  })
  assert.equal(index.seo.canonicalPath, '/log?type=thought&page=3')
})

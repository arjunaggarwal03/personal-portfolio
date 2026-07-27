import assert from 'node:assert/strict'
import test from 'node:test'
import { logEntrySchema } from '../../lib/content/schemas/log'
import { mediaAssetSchema } from '../../lib/content/schemas/media'
import { writingPostSchema } from '../../lib/content/schemas/writing'
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

test('pagination deterministically limits large Log collections', () => {
  const items = Array.from({ length: 45 }, (_, index) => index)
  assert.deepEqual(paginateLogEntries(items, 2), {
    entries: items.slice(20, 40),
    page: 2,
    totalPages: 3,
  })
  assert.equal(paginateLogEntries(items, 99).page, 3)
})

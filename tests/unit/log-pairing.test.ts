import assert from 'node:assert/strict'
import test from 'node:test'
import { logEntrySchema, type LogEntry } from '../../lib/content/schemas/log'
import { selectLogPair, utcDayKey } from '../../lib/log/pairing'

function entry(
  slug: string,
  visibility: LogEntry['visibility'] = 'public',
): LogEntry {
  return logEntrySchema.parse({
    id: slug,
    slug,
    title: slug,
    type: 'thought',
    date: `2026-01-${slug.padStart(2, '0')}`,
    gallery: [],
    layout: 'standard',
    tags: [],
    visibility,
    flags: {},
    hasDetailPage: false,
  })
}

const archive = Array.from({ length: 8 }, (_, index) =>
  entry(String(index + 1)),
)

test('returns deterministic pairs for a day and iteration', () => {
  const first = selectLogPair(archive, '2026-08-02', 0)
  const second = selectLogPair([...archive].reverse(), '2026-08-02', 0)
  assert.deepEqual(
    first?.map(({ slug }) => slug),
    second?.map(({ slug }) => slug),
  )
})

test('excludes private and unlisted entries', () => {
  const pair = selectLogPair(
    [entry('1'), entry('2'), entry('3', 'private'), entry('4', 'unlisted')],
    '2026-08-02',
  )
  assert.deepEqual(pair?.map(({ slug }) => slug).toSorted(), ['1', '2'])
})

test('returns null for a small archive and never repeats an entry', () => {
  assert.equal(selectLogPair([entry('1')], '2026-08-02'), null)
  const pair = selectLogPair([entry('1'), entry('2')], '2026-08-02')
  assert.ok(pair)
  assert.notEqual(pair[0].slug, pair[1].slug)
})

test('uses UTC calendar days consistently across timezone representations', () => {
  const instantFromWest = new Date('2026-08-02T20:00:00-07:00')
  const sameInstantFromEast = new Date('2026-08-03T12:00:00+09:00')
  assert.equal(utcDayKey(instantFromWest), utcDayKey(sameInstantFromEast))
  assert.deepEqual(
    selectLogPair(archive, utcDayKey(instantFromWest), 3)?.map(
      ({ slug }) => slug,
    ),
    selectLogPair(archive, utcDayKey(sameInstantFromEast), 3)?.map(
      ({ slug }) => slug,
    ),
  )
})

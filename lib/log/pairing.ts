import type { LogEntry } from 'lib/content/schemas/log'

function hash(value: string): number {
  let result = 2166136261
  for (const character of value) {
    result ^= character.charCodeAt(0)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

/** A UTC calendar key avoids server-local and viewer-local timezone drift. */
export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function selectLogPair(
  entries: readonly LogEntry[],
  dayKey: string,
  iteration = 0,
): readonly [LogEntry, LogEntry] | null {
  const visible = entries
    .filter((entry) => entry.visibility === 'public')
    .toSorted(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    )

  if (visible.length < 2) return null

  // When the archive is large enough, keep the latest observations in the
  // chronological index and let this feature resurface older material.
  const candidates = visible.length > 4 ? visible.slice(2) : visible
  const seed = hash(`${dayKey}:${Math.max(0, iteration)}`)
  const firstIndex = seed % candidates.length
  const offset = 1 + (hash(`${seed}:second`) % (candidates.length - 1))
  const secondIndex = (firstIndex + offset) % candidates.length

  return [candidates[firstIndex], candidates[secondIndex]]
}

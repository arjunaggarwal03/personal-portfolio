import type { LogEntry, LogType } from './types'

export type LogQuery = {
  type?: string
  view?: string
  tag?: string
}

type FilterDef = {
  label: string
  /** Query string appended to /log, or null for "All". */
  query: string | null
  matches: (e: LogEntry) => boolean
}

const typeGroup = (types: LogType[]) => (e: LogEntry) => types.includes(e.type)

export const LOG_FILTERS: FilterDef[] = [
  { label: 'All', query: null, matches: () => true },
  { label: 'Thoughts', query: 'type=thought', matches: typeGroup(['thought', 'note', 'quote']) },
  { label: 'Links', query: 'type=link', matches: typeGroup(['link', 'article', 'tweet']) },
  { label: 'Music', query: 'type=music', matches: typeGroup(['album', 'song', 'playlist']) },
  { label: 'Film', query: 'type=film', matches: typeGroup(['film']) },
  { label: 'Food', query: 'type=food', matches: typeGroup(['restaurant', 'meal']) },
  { label: 'Travel', query: 'type=travel', matches: typeGroup(['travel', 'city', 'photo']) },
  { label: 'Clips', query: 'type=clip', matches: typeGroup(['clip']) },
  { label: 'Essays', query: 'type=essay', matches: typeGroup(['essay']) },
  { label: 'Builds', query: 'type=build', matches: typeGroup(['build']) },
  { label: 'Books', query: 'type=book', matches: typeGroup(['book']) },
  { label: 'Canon', query: 'view=canon', matches: (e) => Boolean(e.flags?.canonical) },
  { label: 'In Rotation', query: 'view=in-rotation', matches: (e) => Boolean(e.flags?.inRotation) },
]

const ALL_FILTER = LOG_FILTERS[0]

function findFilter(query: LogQuery): FilterDef {
  if (query.view) {
    const match = LOG_FILTERS.find((f) => f.query === `view=${query.view}`)
    if (match) return match
  }
  if (query.type) {
    const match = LOG_FILTERS.find((f) => f.query === `type=${query.type}`)
    if (match) return match
  }
  return ALL_FILTER
}

export function applyLogFilter(entries: LogEntry[], query: LogQuery): LogEntry[] {
  let result = entries
  if (query.view || query.type) {
    result = result.filter(findFilter(query).matches)
  }
  const tag = query.tag
  if (tag) {
    result = result.filter((e) => e.tags?.includes(tag))
  }
  return result
}

export function activeFilterLabel(query: LogQuery): string {
  if (query.tag) return `#${query.tag}`
  return findFilter(query).label
}

export function isFilterActive(filter: FilterDef, query: LogQuery): boolean {
  if (query.tag) return false
  return findFilter(query).label === filter.label
}

import type { LogEntry, LogType } from './content/schemas/log'

export type LogSearchParams = Record<string, string | string[] | undefined>

export type LogFilterLink = Readonly<{
  label: string
  href: string
  active: boolean
}>

type FilterDefinition = Readonly<{
  label: string
  parameter?: Readonly<{
    name: 'type' | 'view'
    value: string
  }>
  matches: (entry: LogEntry) => boolean
}>

type NormalizedLogQuery = Readonly<{
  filter: FilterDefinition
  tag?: string
  requestedPage: number
}>

type LogIndexModel = Readonly<{
  entries: readonly Readonly<{
    entry: LogEntry
    inNow: boolean
  }>[]
  filters: readonly LogFilterLink[]
  resultSummary: Readonly<{
    count: number
    label: string
  }> | null
  pagination: Readonly<{
    page: number
    totalPages: number
    newerHref?: string
    olderHref?: string
  }>
  seo: Readonly<{
    title: string
    canonicalPath: string
    allowIndexing: boolean
  }>
}>

const LOG_PAGE_SIZE = 20

const typeGroup = (types: readonly LogType[]) => (entry: LogEntry) =>
  types.includes(entry.type)

const LOG_FILTERS: readonly FilterDefinition[] = [
  { label: 'All', matches: () => true },
  {
    label: 'Thoughts',
    parameter: { name: 'type', value: 'thought' },
    matches: typeGroup(['thought', 'note', 'quote']),
  },
  {
    label: 'Links',
    parameter: { name: 'type', value: 'link' },
    matches: typeGroup(['link', 'article', 'tweet']),
  },
  {
    label: 'Music',
    parameter: { name: 'type', value: 'music' },
    matches: typeGroup(['album', 'song', 'playlist']),
  },
  {
    label: 'Film',
    parameter: { name: 'type', value: 'film' },
    matches: typeGroup(['film']),
  },
  {
    label: 'Food',
    parameter: { name: 'type', value: 'food' },
    matches: typeGroup(['restaurant', 'meal']),
  },
  {
    label: 'Travel',
    parameter: { name: 'type', value: 'travel' },
    matches: typeGroup(['travel', 'city', 'photo']),
  },
  {
    label: 'Clips',
    parameter: { name: 'type', value: 'clip' },
    matches: typeGroup(['clip']),
  },
  {
    label: 'Builds',
    parameter: { name: 'type', value: 'build' },
    matches: typeGroup(['build']),
  },
  {
    label: 'Canon',
    parameter: { name: 'view', value: 'canon' },
    matches: (entry) => Boolean(entry.flags?.canonical),
  },
  {
    label: 'In Rotation',
    parameter: { name: 'view', value: 'in-rotation' },
    matches: (entry) => Boolean(entry.flags?.inRotation),
  },
]

const ALL_FILTER = LOG_FILTERS[0]

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function findFilter(searchParams: LogSearchParams): FilterDefinition {
  const view = firstValue(searchParams.view)
  const type = firstValue(searchParams.type)
  return (
    LOG_FILTERS.find(
      (filter) =>
        filter.parameter?.name === 'view' && filter.parameter.value === view,
    ) ??
    LOG_FILTERS.find(
      (filter) =>
        filter.parameter?.name === 'type' && filter.parameter.value === type,
    ) ??
    ALL_FILTER
  )
}

function requestedPage(value: string | string[] | undefined): number {
  const raw = firstValue(value)
  return raw && /^\d+$/.test(raw) ? Math.max(1, Number(raw)) : 1
}

function normalizeQuery(searchParams: LogSearchParams): NormalizedLogQuery {
  const tag = firstValue(searchParams.tag)?.trim()
  return {
    filter: findFilter(searchParams),
    tag: tag || undefined,
    requestedPage: requestedPage(searchParams.page),
  }
}

function logHref(query: NormalizedLogQuery, page = 1): string {
  const params = new URLSearchParams()
  const parameter = query.filter.parameter
  if (parameter) params.set(parameter.name, parameter.value)
  if (query.tag) params.set('tag', query.tag)
  if (page > 1) params.set('page', String(page))
  const value = params.toString()
  return value ? `/log?${value}` : '/log'
}

function filterHref(filter: FilterDefinition): string {
  const parameter = filter.parameter
  if (!parameter) return '/log'
  return `/log?${new URLSearchParams([[parameter.name, parameter.value]])}`
}

function activeLabel(query: NormalizedLogQuery): string {
  if (!query.tag) return query.filter.label
  return query.filter === ALL_FILTER
    ? `#${query.tag}`
    : `${query.filter.label} · #${query.tag}`
}

export function buildLogIndex({
  entries,
  inNowSlugs,
  searchParams,
}: {
  entries: readonly LogEntry[]
  inNowSlugs: readonly string[]
  searchParams: LogSearchParams
}): LogIndexModel {
  const query = normalizeQuery(searchParams)
  const filtered = entries.filter(
    (entry) =>
      query.filter.matches(entry) &&
      (!query.tag || entry.tags?.includes(query.tag)),
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / LOG_PAGE_SIZE))
  const page = Math.min(query.requestedPage, totalPages)
  const visibleEntries = filtered.slice(
    (page - 1) * LOG_PAGE_SIZE,
    page * LOG_PAGE_SIZE,
  )
  const inNow = new Set(inNowSlugs)
  const label = activeLabel(query)
  const isFiltered = query.filter !== ALL_FILTER || Boolean(query.tag)

  return {
    entries: visibleEntries.map((entry) => ({
      entry,
      inNow: inNow.has(entry.slug),
    })),
    filters: LOG_FILTERS.filter(
      (filter) => filter === ALL_FILTER || entries.some(filter.matches),
    ).map((filter) => ({
      label: filter.label,
      href: filterHref(filter),
      active: !query.tag && query.filter === filter,
    })),
    resultSummary: isFiltered ? { count: filtered.length, label } : null,
    pagination: {
      page,
      totalPages,
      ...(page > 1 ? { newerHref: logHref(query, page - 1) } : {}),
      ...(page < totalPages ? { olderHref: logHref(query, page + 1) } : {}),
    },
    seo: {
      title: `${isFiltered ? `${label} · ` : ''}Log${
        page > 1 ? ` · Page ${page}` : ''
      }`,
      canonicalPath: logHref(query, page),
      allowIndexing: !isFiltered,
    },
  }
}

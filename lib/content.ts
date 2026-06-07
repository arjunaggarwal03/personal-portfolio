import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { LogEntry, WritingPost } from './types'
import { sortByDateDesc } from './dates'
import {
  logFrontmatterSchema,
  parseFrontmatter,
  writingFrontmatterSchema,
} from './schemas'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const WRITING_DIR = path.join(CONTENT_DIR, 'writing')
const LOG_DIR = path.join(CONTENT_DIR, 'log')

const isProd = process.env.NODE_ENV === 'production'

/** A log entry gets its own page once its body exceeds this plain-text length. */
const DETAIL_PAGE_MIN_PLAINTEXT = 280
const DEFAULT_FEATURED_WRITING = 5
const DEFAULT_FEATURED_LOG = 6

type RawEntry = { slug: string; data: unknown; body: string }

function readCollection(dir: string): RawEntry[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data, content } = matter(raw)
      return {
        slug: file.replace(/\.mdx?$/, ''),
        data,
        body: content.trim(),
      }
    })
}

/** Rough plain-text length: strip MDX/markdown so the detail heuristic is stable. */
export function plainTextLength(body?: string): number {
  if (!body) return 0
  const stripped = body
    .replace(/```[\s\S]*?```/g, ' ') // code fences
    .replace(/<[^>]+>/g, ' ') // jsx/html tags
    .replace(/[#>*_`~\-]/g, ' ') // markdown markers
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.length
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

function toWritingPost(entry: RawEntry): WritingPost {
  const d = parseFrontmatter(
    writingFrontmatterSchema,
    entry.data,
    `content/writing/${entry.slug}`
  )
  const body = entry.body
  return {
    slug: d.slug ?? entry.slug,
    title: d.title,
    subtitle: d.subtitle,
    date: d.date,
    updated: d.updated,
    status: d.status,
    summary: d.summary,
    tags: d.tags,
    readingTime: body ? readingTime(body).text : undefined,
    featured: d.featured,
    canonical: d.canonical,
    showOnIndex: d.showOnIndex,
    body,
  }
}

function getAllWriting(): WritingPost[] {
  return sortByDateDesc(readCollection(WRITING_DIR).map(toWritingPost))
}

/** Posts that can appear on the Writing index. */
export function getWritingIndex(): WritingPost[] {
  const all = getAllWriting()
  if (!isProd) return all
  return all.filter(
    (p) => p.status === 'published' || (p.status === 'forthcoming' && p.showOnIndex)
  )
}

/** Posts with viewable detail pages (published only in prod; all in dev). */
export function getPublishedWriting(): WritingPost[] {
  const all = getAllWriting()
  if (!isProd) return all.filter((p) => p.status !== 'forthcoming')
  return all.filter((p) => p.status === 'published')
}

export function getWritingBySlug(slug: string): WritingPost | undefined {
  return getPublishedWriting().find((p) => p.slug === slug)
}

export function getFeaturedWriting(limit = DEFAULT_FEATURED_WRITING): WritingPost[] {
  const index = getWritingIndex()
  const featured = index.filter((p) => p.featured)
  const pool = featured.length > 0 ? featured : index
  return pool.slice(0, limit)
}

// ---------------------------------------------------------------------------
// Log
// ---------------------------------------------------------------------------

function toLogEntry(entry: RawEntry): LogEntry {
  const d = parseFrontmatter(
    logFrontmatterSchema,
    entry.data,
    `content/log/${entry.slug}`
  )
  return {
    id: entry.slug,
    slug: d.slug ?? entry.slug,
    title: d.title,
    date: d.date,
    updated: d.updated,
    type: d.type,
    summary: d.summary,
    body: entry.body || undefined,
    url: d.url,
    source: d.source,
    author: d.author,
    rating: d.rating,
    media: d.media,
    location: d.location,
    tags: d.tags,
    visibility: d.visibility,
    flags: d.flags,
  }
}

function getAllLog(): LogEntry[] {
  return sortByDateDesc(readCollection(LOG_DIR).map(toLogEntry))
}

/** Entries visible at all (excludes drafts + private in prod). */
function getVisibleLog(): LogEntry[] {
  const all = getAllLog()
  if (!isProd) return all
  return all.filter((e) => {
    if (e.flags?.draft) return false
    if (e.visibility === 'private' || e.flags?.private) return false
    return true
  })
}

/** Entries shown in the Log feed/indexes (excludes unlisted). */
export function getLogFeed(): LogEntry[] {
  return getVisibleLog().filter((e) => e.visibility !== 'unlisted')
}

export function getLogBySlug(slug: string): LogEntry | undefined {
  return getVisibleLog().find((e) => e.slug === slug)
}

export function hasDetailPage(entry: LogEntry): boolean {
  return Boolean(
    entry.flags?.detail ||
      entry.type === 'essay' ||
      (entry.media && entry.media.length > 0) ||
      plainTextLength(entry.body) > DETAIL_PAGE_MIN_PLAINTEXT
  )
}

type LogEntryWithSlug = LogEntry & { slug: string }

/** Log entries that should generate a standalone /log/[slug] route. */
export function getLogWithDetailPages(): LogEntryWithSlug[] {
  return getVisibleLog().filter(
    (e): e is LogEntryWithSlug => Boolean(e.slug) && hasDetailPage(e)
  )
}

export function getFeaturedLog(limit = DEFAULT_FEATURED_LOG): LogEntry[] {
  return getLogFeed().slice(0, limit)
}

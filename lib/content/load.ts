import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { mediaCatalogSchema, type MediaAsset } from './schemas/media'
import { curatedNowSchema, type CuratedNow } from './schemas/now'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export type RawContentEntry = {
  id: string
  source: string
  data: unknown
  body: string
}

export function loadMdxCollection(name: 'writing' | 'log'): RawContentEntry[] {
  const directory = path.join(CONTENT_DIR, name)
  if (!fs.existsSync(directory)) return []
  return fs
    .readdirSync(directory)
    .filter((file) => /\.mdx?$/.test(file))
    .sort()
    .map((file) => {
      const source = path.join('content', name, file)
      const raw = fs.readFileSync(path.join(directory, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        id: file.replace(/\.mdx?$/, ''),
        source,
        data,
        body: content.trim(),
      }
    })
}

function readJson(relativeSource: string): unknown {
  const source = path.join('content', relativeSource)
  try {
    return JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, relativeSource), 'utf8'),
    )
  } catch (error) {
    throw new Error(
      `Unable to read ${source}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export function loadMediaCatalog(): MediaAsset[] {
  return parseSource(
    mediaCatalogSchema,
    readJson('media/catalog.json'),
    'content/media/catalog.json',
  ).assets
}

export function loadCuratedNow(): CuratedNow {
  return parseSource(curatedNowSchema, readJson('now.json'), 'content/now.json')
}

export function parseSource<T>(
  schema: {
    safeParse(value: unknown):
      | { success: true; data: T }
      | {
          success: false
          error: { issues: { path: PropertyKey[]; message: string }[] }
        }
  },
  value: unknown,
  source: string,
): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
      )
      .join('\n')
    throw new Error(`Invalid content in "${source}":\n${issues}`)
  }
  return result.data
}

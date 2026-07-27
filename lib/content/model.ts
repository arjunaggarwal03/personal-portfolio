import { cache } from 'react'
import { experiments } from 'content/experiments'
import { work } from 'content/work'
import { site } from 'lib/site'
import { sortByDateDesc } from 'lib/dates'
import {
  experimentSchema,
  siteIdentitySchema,
  workItemSchema,
  type Experiment,
  type SiteIdentity,
  type WorkItem,
} from './schemas/site'
import type { CuratedNow } from './schemas/now'
import type { LogEntry } from './schemas/log'
import type { MediaAsset } from './schemas/media'
import type { WritingPost } from './schemas/writing'
import {
  loadCuratedNow,
  loadMdxCollection,
  loadMediaCatalog,
  parseSource,
} from './load'
import { normalizeLog, normalizeWriting } from './normalize'
import { validateContent } from './validate'

export type SiteModel = Readonly<{
  identity: SiteIdentity
  work: readonly WorkItem[]
  experiments: readonly Experiment[]
  writing: readonly WritingPost[]
  log: readonly LogEntry[]
  assets: Readonly<Record<string, MediaAsset>>
  now: CuratedNow
}>

function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>))
      freeze(child)
  }
  return value
}

export const getSiteModel = cache((): SiteModel => {
  const writing = sortByDateDesc(
    loadMdxCollection('writing').map(normalizeWriting),
  )
  const log = sortByDateDesc(loadMdxCollection('log').map(normalizeLog))
  const assets = loadMediaCatalog()
  validateContent({ writing, log, assets })
  return freeze({
    identity: parseSource(siteIdentitySchema, site, 'lib/site.ts'),
    work: work.map((item, index) =>
      parseSource(workItemSchema, item, `content/work.ts[${index}]`),
    ),
    experiments: experiments.map((item, index) =>
      parseSource(experimentSchema, item, `content/experiments.ts[${index}]`),
    ),
    writing,
    log,
    assets: Object.fromEntries(assets.map((asset) => [asset.id, asset])),
    now: loadCuratedNow(),
  })
})

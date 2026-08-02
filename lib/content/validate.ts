import type { LogEntry } from './schemas/log'
import type { MediaAsset } from './schemas/media'
import type { WritingPost } from './schemas/writing'

export type ValidationResult = { warnings: string[] }

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    else seen.add(value)
  }
  return [...repeated]
}

export function validateContent(input: {
  writing: WritingPost[]
  log: LogEntry[]
  assets: MediaAsset[]
  rotationSlugs?: readonly string[]
}): ValidationResult {
  const errors: string[] = []
  for (const slug of duplicates(input.writing.map((item) => item.slug)))
    errors.push(`duplicate Writing slug "${slug}"`)
  for (const slug of duplicates(input.log.map((item) => item.slug)))
    errors.push(`duplicate Log slug "${slug}"`)
  for (const id of duplicates(input.assets.map((asset) => asset.id)))
    errors.push(`duplicate asset ID "${id}"`)
  const publicLogSlugs = new Set(
    input.log
      .filter((entry) => entry.visibility === 'public')
      .map((entry) => entry.slug),
  )
  for (const slug of input.rotationSlugs ?? []) {
    if (!publicLogSlugs.has(slug))
      errors.push(`Now rotation references missing public Log slug "${slug}"`)
  }
  const assets = new Map(input.assets.map((asset) => [asset.id, asset]))
  const referenced = new Set<string>()
  for (const entry of input.log) {
    const refs = [entry.cover, ...entry.gallery].filter(
      (id): id is NonNullable<typeof id> => Boolean(id),
    )
    for (const id of refs) {
      referenced.add(id)
      const asset = assets.get(id)
      if (!asset) errors.push(`${entry.slug}: missing asset reference "${id}"`)
      else if (entry.visibility === 'public' && asset.visibility === 'private')
        errors.push(
          `${entry.slug}: public entry references private asset "${id}"`,
        )
    }
    if (entry.gallery.length && !entry.cover)
      errors.push(`${entry.slug}: visual entry must declare a cover`)
    if (
      entry.cover &&
      entry.gallery.length &&
      !entry.gallery.includes(entry.cover)
    )
      errors.push(`${entry.slug}: cover must also appear in gallery`)
    if (
      entry.layout === 'pair' &&
      entry.gallery.length > 0 &&
      entry.gallery.length % 2 !== 0
    )
      errors.push(`${entry.slug}: pair layout requires an even gallery length`)
  }
  if (errors.length)
    throw new Error(
      `Content validation failed:\n${errors.map((error) => `  - ${error}`).join('\n')}`,
    )
  return {
    warnings: input.assets
      .filter((asset) => !referenced.has(asset.id))
      .map((asset) => `orphaned asset "${asset.id}"`),
  }
}

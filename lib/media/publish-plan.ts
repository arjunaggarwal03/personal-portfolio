import path from 'node:path'
import type { MediaAsset } from 'lib/content/schemas/media'
import type { SelectionItem } from 'lib/content/schemas/publishing'

export type PublishCheckpoint = {
  complete?: boolean
  stage?: 'created' | 'uploaded'
  muxUploadId?: string
  muxUploadUrl?: string
  uploadedBytes?: number
  record?: MediaAsset
}

export type PublishAction =
  | 'new'
  | 'resumable'
  | 'skip-upload'
  | 'skip-complete'
  | 'conflicting'

export function assetIdFor(item: Pick<SelectionItem, 'hash'>): string {
  return `log-${item.hash.slice(0, 16)}`
}

export function publishAction(
  item: Pick<SelectionItem, 'kind'>,
  checkpoint: PublishCheckpoint | undefined,
  existing: MediaAsset | undefined,
): PublishAction {
  if (existing) {
    return checkpoint?.complete &&
      checkpoint.record?.id === existing.id &&
      JSON.stringify(checkpoint.record) === JSON.stringify(existing)
      ? 'skip-complete'
      : 'conflicting'
  }
  if (checkpoint?.complete && checkpoint.record) return 'skip-upload'
  if (item.kind === 'video' && checkpoint?.muxUploadId) return 'resumable'
  return 'new'
}

export function derivativePath(
  workspace: string,
  item: Pick<SelectionItem, 'hash' | 'kind' | 'sourcePath'>,
): string {
  if (item.kind === 'image') {
    return path.join(workspace, 'publishable', `${item.hash}.webp`)
  }
  const extension = path.extname(item.sourcePath).toLowerCase() || '.mov'
  return path.join(
    workspace,
    'publishable',
    `${item.hash}-metadata-stripped${extension}`,
  )
}

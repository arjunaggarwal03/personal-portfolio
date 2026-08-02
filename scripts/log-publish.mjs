import { execFileSync } from 'node:child_process'
import {
  access,
  mkdir,
  open,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import Mux from '@mux/mux-node'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'
import { stringify as stringifyYaml } from 'yaml'
import { logFrontmatterSchema } from '../lib/content/schemas/log.ts'
import { mediaCatalogSchema } from '../lib/content/schemas/media.ts'
import { selectionManifestSchema } from '../lib/content/schemas/publishing.ts'
import { publishingEnv } from '../lib/env/publishing.ts'
import { uploadCloudinaryWithLookup } from '../lib/media/cloudinary-publish.ts'
import { nextUploadedByte } from '../lib/media/mux-upload.ts'
import {
  assetIdFor,
  derivativePath,
  publishAction,
} from '../lib/media/publish-plan.ts'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const manifestArgument = args.find((argument) => !argument.startsWith('--'))
if (!manifestArgument) {
  throw new Error(
    'Usage: npm run log:publish -- <selection-manifest> [--dry-run]',
  )
}

const repository = process.cwd()
const workspace = path.join(repository, '.log-workspace')
const derivativeDirectory = path.join(workspace, 'publishable')
const checkpointPath = path.join(workspace, 'publish-checkpoints.json')
const catalogPath = path.join(repository, 'content/media/catalog.json')
const manifestPath = path.resolve(manifestArgument)

async function pathExists(target) {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

async function atomicWrite(target, value) {
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, value)
  await rename(temporary, target)
}

const manifest = selectionManifestSchema.parse(
  JSON.parse(await readFile(manifestPath, 'utf8')),
)
const selected = manifest.items
  .filter((item) => item.selected && !item.duplicateOf)
  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
if (!selected.length) throw new Error('Selection contains no publishable items')
if (selected.filter((item) => item.cover).length !== 1) {
  throw new Error('Select exactly one cover item')
}
if (new Set(selected.map((item) => item.order)).size !== selected.length) {
  throw new Error('Selected items must have unique order values')
}
for (const item of selected) {
  if (!item.alt.trim())
    throw new Error(`${item.relativePath}: alt text is required`)
  if (!item.width || !item.height) {
    throw new Error(`${item.relativePath}: dimensions are required`)
  }
  if (item.kind === 'video' && !item.duration) {
    throw new Error(`${item.relativePath}: video duration is required`)
  }
  await access(item.sourcePath)
}

let checkpoints = {}
try {
  checkpoints = JSON.parse(await readFile(checkpointPath, 'utf8'))
} catch {}

const catalog = mediaCatalogSchema.parse(
  JSON.parse(await readFile(catalogPath, 'utf8')),
)
const existingAssets = new Map(catalog.assets.map((asset) => [asset.id, asset]))
const logPath = path.join(
  repository,
  'content/log',
  `${manifest.entry.date}-${manifest.entry.slug}.mdx`,
)
const logExists = await pathExists(logPath)
const coverItem = selected.find((item) => item.cover)
const ids = selected.map(assetIdFor)
const plannedFrontmatter = logFrontmatterSchema.parse({
  type: selected.some((item) => item.kind === 'video') ? 'clip' : 'photo',
  date: manifest.entry.date,
  title: manifest.entry.title,
  summary: manifest.entry.summary,
  cover: assetIdFor(coverItem),
  gallery: ids,
  layout: manifest.entry.layout,
  visibility: manifest.entry.visibility,
  flags: {},
})

const plan = selected.map((item, index) => {
  const id = ids[index]
  const checkpoint = checkpoints[item.hash]
  const existing = existingAssets.get(id)
  return {
    order: item.order,
    cover: item.cover,
    itemId: item.id,
    id,
    kind: item.kind,
    source: item.relativePath,
    provider: item.kind === 'image' ? 'cloudinary' : 'mux',
    providerDestination:
      item.kind === 'image'
        ? `portfolio/log/${item.hash}`
        : 'Mux direct upload',
    derivative: derivativePath(workspace, item),
    action: publishAction(item, checkpoint, existing),
  }
})
const conflicts = [
  ...(logExists ? [`MDX target already exists: ${logPath}`] : []),
  ...plan
    .filter((item) => item.action === 'conflicting')
    .map(
      (item) =>
        `Catalog asset ID already exists without a matching checkpoint: ${item.id}`,
    ),
]

console.log(
  JSON.stringify(
    {
      dryRun,
      manifest: manifestPath,
      entry: plannedFrontmatter,
      cover: assetIdFor(coverItem),
      assets: plan,
      repositoryWrites: [
        {
          path: catalogPath,
          action: plan.some((item) => item.action === 'skip-complete')
            ? 'merge-validated-records'
            : 'add-validated-records',
        },
        { path: logPath, action: logExists ? 'conflicting' : 'new' },
        { path: checkpointPath, action: 'atomic-progress-updates' },
      ],
      conflicts,
    },
    null,
    2,
  ),
)

if (conflicts.length) {
  throw new Error(`Publishing plan has conflicts:\n${conflicts.join('\n')}`)
}
if (dryRun) process.exit(0)

const needsCloudinary = plan.some(
  (item) => item.provider === 'cloudinary' && item.action === 'new',
)
const needsMux = plan.some(
  (item) =>
    item.provider === 'mux' &&
    (item.action === 'new' || item.action === 'resumable'),
)
const providerEnv = publishingEnv()
const missing = []
if (needsCloudinary) {
  if (!providerEnv.cloudinaryCloudName)
    missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!providerEnv.cloudinaryApiKey) missing.push('CLOUDINARY_API_KEY')
  if (!providerEnv.cloudinaryApiSecret) missing.push('CLOUDINARY_API_SECRET')
}
if (needsMux) {
  if (!providerEnv.muxTokenId) missing.push('MUX_TOKEN_ID')
  if (!providerEnv.muxTokenSecret) missing.push('MUX_TOKEN_SECRET')
}
if (missing.length) {
  throw new Error(
    `Publishing credentials are missing: ${missing.join(', ')}. Scan and --dry-run remain available without credentials.`,
  )
}

cloudinary.config({
  cloud_name: providerEnv.cloudinaryCloudName,
  api_key: providerEnv.cloudinaryApiKey,
  api_secret: providerEnv.cloudinaryApiSecret,
  secure: true,
})
const mux = needsMux
  ? new Mux({
      tokenId: providerEnv.muxTokenId,
      tokenSecret: providerEnv.muxTokenSecret,
    })
  : null

await mkdir(derivativeDirectory, { recursive: true })

const retry = async (operation, attempts = 4) => {
  let error
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (caught) {
      error = caught
      if (attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
      }
    }
  }
  throw error
}
const retryFetch = (operation) =>
  retry(async () => {
    const response = await operation()
    if (response.status === 429 || response.status >= 500) {
      throw new Error(`Transient provider response: ${response.status}`)
    }
    return response
  })

let checkpointWrite = Promise.resolve()
const checkpoint = async (hash, record) => {
  checkpoints[hash] = record
  const snapshot = `${JSON.stringify(checkpoints, null, 2)}\n`
  checkpointWrite = checkpointWrite.then(() =>
    atomicWrite(checkpointPath, snapshot),
  )
  await checkpointWrite
}

async function publishImage(item, id) {
  const derivative = derivativePath(workspace, item)
  await sharp(item.sourcePath)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(derivative)
  const publicId = `portfolio/log/${item.hash}`
  const data = await uploadCloudinaryWithLookup({
    upload: () =>
      retry(() =>
        cloudinary.uploader.upload(derivative, {
          public_id: publicId,
          overwrite: false,
          unique_filename: false,
          resource_type: 'image',
        }),
      ),
    lookup: () =>
      retry(() =>
        cloudinary.api.resource(publicId, {
          resource_type: 'image',
          type: 'upload',
        }),
      ),
  })
  return {
    id,
    kind: 'image',
    provider: 'cloudinary',
    sourceId: data.public_id,
    width: data.width,
    height: data.height,
    alt: item.alt.trim(),
    ...(item.caption.trim() ? { caption: item.caption.trim() } : {}),
    ...(item.takenAt ? { takenAt: item.takenAt } : {}),
  }
}

async function publishVideo(item, id) {
  if (!mux) throw new Error('Mux client is not configured')
  const derivative = derivativePath(workspace, item)
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      item.sourcePath,
      '-map_metadata',
      '-1',
      '-c',
      'copy',
      derivative,
    ],
    { stdio: 'ignore' },
  )

  let state = checkpoints[item.hash] ?? {}
  let uploadId = state.muxUploadId
  let uploadUrl = state.muxUploadUrl
  if (!uploadId) {
    const upload = await retry(() =>
      mux.video.uploads.create({
        cors_origin: '*',
        new_asset_settings: {
          playback_policies: ['public'],
          passthrough: item.hash,
        },
      }),
    )
    uploadId = upload.id
    uploadUrl = upload.url
    state = {
      complete: false,
      stage: 'created',
      muxUploadId: uploadId,
      muxUploadUrl: uploadUrl,
    }
    await checkpoint(item.hash, state)
  }

  const uploadStatus = await retry(() => mux.video.uploads.retrieve(uploadId))
  let assetId = uploadStatus.asset_id
  if (!assetId && state.stage !== 'uploaded') {
    if (!uploadUrl)
      throw new Error(`Mux upload ${uploadId} has no resumable URL`)
    const fileSize = (await stat(derivative)).size
    const file = await open(derivative, 'r')
    const chunkSize = 20 * 1024 * 1024
    let uploadedBytes = state.uploadedBytes ?? 0
    try {
      while (uploadedBytes < fileSize) {
        const length = Math.min(chunkSize, fileSize - uploadedBytes)
        const bytes = Buffer.allocUnsafe(length)
        await file.read(bytes, 0, length, uploadedBytes)
        const response = await retryFetch(() =>
          fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Length': String(length),
              'Content-Range': `bytes ${uploadedBytes}-${uploadedBytes + length - 1}/${fileSize}`,
            },
            body: bytes,
          }),
        )
        if (response.status !== 308 && !response.ok) {
          throw new Error(`Mux upload failed (${response.status})`)
        }
        uploadedBytes = nextUploadedByte(
          response.headers.get('range'),
          uploadedBytes + length,
        )
        state = { ...state, uploadedBytes }
        await checkpoint(item.hash, state)
      }
    } finally {
      await file.close()
    }
    state = { ...state, stage: 'uploaded' }
    await checkpoint(item.hash, state)
  }

  for (let attempt = 0; attempt < 90; attempt++) {
    const upload = await retry(() => mux.video.uploads.retrieve(uploadId))
    if (upload.asset_id) {
      assetId = upload.asset_id
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  if (!assetId)
    throw new Error('Mux upload did not create an asset before timeout')

  let asset
  for (let attempt = 0; attempt < 150; attempt++) {
    asset = await retry(() => mux.video.assets.retrieve(assetId))
    if (asset.status === 'ready') break
    if (asset.status === 'errored') {
      throw new Error(`Mux processing failed for ${assetId}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  const playbackId = asset?.playback_ids?.find(
    (playback) => playback.policy === 'public',
  )?.id
  if (asset?.status !== 'ready' || !playbackId) {
    throw new Error('Mux asset was not ready before timeout')
  }
  return {
    id,
    kind: 'video',
    provider: 'mux',
    sourceId: asset.id,
    playbackId,
    width: item.width,
    height: item.height,
    duration: asset.duration ?? item.duration,
    alt: item.alt.trim(),
    ...(item.caption.trim() ? { caption: item.caption.trim() } : {}),
    ...(item.takenAt ? { takenAt: item.takenAt } : {}),
  }
}

const records = Array(selected.length)
let cursor = 0
async function worker() {
  while (cursor < selected.length) {
    const index = cursor++
    const item = selected[index]
    const action = plan[index].action
    if (action === 'skip-upload' || action === 'skip-complete') {
      records[index] = checkpoints[item.hash].record
      continue
    }
    const record =
      item.kind === 'image'
        ? await publishImage(item, ids[index])
        : await publishVideo(item, ids[index])
    await checkpoint(item.hash, { complete: true, record })
    records[index] = record
  }
}
await Promise.all(
  Array.from({ length: Math.min(3, selected.length) }, () => worker()),
)

const proposedCatalog = {
  ...catalog,
  assets: [...existingAssets.values()],
}
const proposedById = new Map(
  proposedCatalog.assets.map((asset) => [asset.id, asset]),
)
for (const record of records) proposedById.set(record.id, record)
proposedCatalog.assets = [...proposedById.values()].sort((a, b) =>
  a.id.localeCompare(b.id),
)
const validatedCatalog = mediaCatalogSchema.parse(proposedCatalog)
const validatedFrontmatter = logFrontmatterSchema.parse(plannedFrontmatter)
for (const id of validatedFrontmatter.gallery) {
  if (!validatedCatalog.assets.some((asset) => asset.id === id)) {
    throw new Error(`Proposed Log entry references missing asset ${id}`)
  }
}
if (!validatedFrontmatter.gallery.includes(validatedFrontmatter.cover)) {
  throw new Error('Proposed Log cover must appear in its gallery')
}

const mdx = `---\n${stringifyYaml(validatedFrontmatter).trimEnd()}\n---\n\n<!-- Add prose here. log:publish will never overwrite this file. -->\n`
if (await pathExists(logPath)) {
  throw new Error(`MDX target appeared during publishing: ${logPath}`)
}
await atomicWrite(catalogPath, `${JSON.stringify(validatedCatalog, null, 2)}\n`)
await atomicWrite(logPath, mdx)

console.log(
  `Published ${records.length} assets in manifest order. Preview /log/${manifest.entry.date}-${manifest.entry.slug}`,
)

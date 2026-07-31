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
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'
import Mux from '@mux/mux-node'
import { stringify as stringifyYaml } from 'yaml'
import { mediaCatalogSchema } from '../lib/content/schemas/media.ts'
import { logFrontmatterSchema } from '../lib/content/schemas/log.ts'
import { selectionManifestSchema } from '../lib/content/schemas/publishing.ts'
import { publishingEnv } from '../lib/env/publishing.ts'
import { nextUploadedByte } from '../lib/media/mux-upload.ts'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const manifestPath = args.find((arg) => !arg.startsWith('--'))
if (!manifestPath)
  throw new Error(
    'Usage: npm run log:publish -- <selection-manifest> [--dry-run]',
  )
const manifest = selectionManifestSchema.parse(
  JSON.parse(await readFile(path.resolve(manifestPath), 'utf8')),
)
const selected = manifest.items
  .filter((item) => item.selected && !item.duplicateOf)
  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
if (!selected.length) throw new Error('Selection contains no publishable items')
if (selected.filter((item) => item.cover).length !== 1)
  throw new Error('Select exactly one cover item')
for (const item of selected) {
  if (!item.hash || !item.sourcePath || !['image', 'video'].includes(item.kind))
    throw new Error(`Malformed item ${item.id ?? '(unknown)'}`)
  if (!item.alt?.trim())
    throw new Error(`${item.relativePath}: alt text is required`)
  if (!item.width || !item.height)
    throw new Error(`${item.relativePath}: dimensions are required`)
  if (item.kind === 'video' && !item.duration)
    throw new Error(`${item.relativePath}: video duration is required`)
  await access(item.sourcePath)
}

const entry = manifest.entry ?? {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? ''))
  throw new Error('entry.date must be YYYY-MM-DD')
if (!/^[a-z0-9-]+$/.test(entry.slug ?? ''))
  throw new Error('entry.slug must be lowercase kebab-case')

const plan = selected.map((item) => ({
  id: `log-${item.hash.slice(0, 16)}`,
  kind: item.kind,
  source: item.relativePath,
  provider: item.kind === 'image' ? 'cloudinary' : 'mux',
}))
console.log(
  JSON.stringify({ dryRun, entry: manifest.entry, uploads: plan }, null, 2),
)
if (dryRun) process.exit(0)

const providerEnv = publishingEnv()
const missing = []
if (selected.some((item) => item.kind === 'image')) {
  if (!providerEnv.cloudinaryCloudName)
    missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!providerEnv.cloudinaryApiKey) missing.push('CLOUDINARY_API_KEY')
  if (!providerEnv.cloudinaryApiSecret) missing.push('CLOUDINARY_API_SECRET')
}
if (selected.some((item) => item.kind === 'video')) {
  if (!providerEnv.muxTokenId) missing.push('MUX_TOKEN_ID')
  if (!providerEnv.muxTokenSecret) missing.push('MUX_TOKEN_SECRET')
}
if (missing.length)
  throw new Error(
    `Publishing credentials are missing: ${missing.join(', ')}. Scan and --dry-run remain available without credentials.`,
  )

cloudinary.config({
  cloud_name: providerEnv.cloudinaryCloudName,
  api_key: providerEnv.cloudinaryApiKey,
  api_secret: providerEnv.cloudinaryApiSecret,
  secure: true,
})
const mux = new Mux({
  tokenId: providerEnv.muxTokenId,
  tokenSecret: providerEnv.muxTokenSecret,
})

const workspace = path.join(process.cwd(), '.log-workspace')
const derivativeDirectory = path.join(workspace, 'publishable')
const checkpointPath = path.join(workspace, 'publish-checkpoints.json')
await mkdir(derivativeDirectory, { recursive: true })
let checkpoints = {}
try {
  checkpoints = JSON.parse(await readFile(checkpointPath, 'utf8'))
} catch {}

const retry = async (operation, attempts = 4) => {
  let error
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (caught) {
      error = caught
      if (attempt + 1 < attempts)
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
    }
  }
  throw error
}
const retryFetch = (operation) =>
  retry(async () => {
    const response = await operation()
    if (response.status === 429 || response.status >= 500)
      throw new Error(`Transient provider response: ${response.status}`)
    return response
  })
let checkpointWrite = Promise.resolve()
const atomicWrite = async (target, value) => {
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, value)
  await rename(temporary, target)
}
const checkpoint = async (hash, record) => {
  checkpoints[hash] = record
  const snapshot = `${JSON.stringify(checkpoints, null, 2)}\n`
  checkpointWrite = checkpointWrite.then(() =>
    atomicWrite(checkpointPath, snapshot),
  )
  await checkpointWrite
}

async function publishImage(item, id) {
  const derivative = path.join(derivativeDirectory, `${item.hash}.webp`)
  await sharp(item.sourcePath)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(derivative)
  const publicId = `portfolio/log/${item.hash}`
  let data
  try {
    data = await retry(() =>
      cloudinary.uploader.upload(derivative, {
        public_id: publicId,
        overwrite: false,
        unique_filename: false,
        resource_type: 'image',
      }),
    )
  } catch (error) {
    const status = error?.http_code ?? error?.error?.http_code
    if (status !== 409) throw error
    data = await retry(() =>
      cloudinary.api.resource(publicId, {
        resource_type: 'image',
        type: 'upload',
      }),
    )
  }
  return {
    id,
    kind: 'image',
    provider: 'cloudinary',
    sourceId: data.public_id,
    width: data.width,
    height: data.height,
    alt: item.alt.trim(),
    ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
    ...(item.takenAt ? { takenAt: item.takenAt } : {}),
  }
}

async function publishVideo(item, id) {
  const extension = path.extname(item.sourcePath).toLowerCase() || '.mov'
  const derivative = path.join(
    derivativeDirectory,
    `${item.hash}-metadata-stripped${extension}`,
  )
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
        const put = await retryFetch(() =>
          fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Length': String(length),
              'Content-Range': `bytes ${uploadedBytes}-${uploadedBytes + length - 1}/${fileSize}`,
            },
            body: bytes,
          }),
        )
        if (put.status !== 308 && !put.ok)
          throw new Error(`Mux upload failed (${put.status})`)
        uploadedBytes = nextUploadedByte(
          put.headers.get('range'),
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
    if (asset.status === 'errored')
      throw new Error(`Mux processing failed for ${assetId}`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  const playbackId = asset?.playback_ids?.find(
    (playback) => playback.policy === 'public',
  )?.id
  if (asset?.status !== 'ready' || !playbackId)
    throw new Error('Mux asset was not ready before timeout')
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
    ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
    ...(item.takenAt ? { takenAt: item.takenAt } : {}),
  }
}

const records = Array(selected.length)
let cursor = 0
async function worker() {
  while (cursor < selected.length) {
    const index = cursor++
    const item = selected[index]
    if (checkpoints[item.hash]?.complete) {
      records[index] = checkpoints[item.hash].record
      continue
    }
    const id = `log-${item.hash.slice(0, 16)}`
    const record =
      item.kind === 'image'
        ? await publishImage(item, id)
        : await publishVideo(item, id)
    await checkpoint(item.hash, { complete: true, record })
    records[index] = record
  }
}
await Promise.all(
  Array.from({ length: Math.min(3, selected.length) }, () => worker()),
)

const catalogPath = path.join(process.cwd(), 'content/media/catalog.json')
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const byId = new Map(catalog.assets.map((asset) => [asset.id, asset]))
for (const record of records) byId.set(record.id, record)
catalog.assets = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id))
mediaCatalogSchema.parse(catalog)

const logPath = path.join(
  process.cwd(),
  'content/log',
  `${entry.date}-${entry.slug}.mdx`,
)
try {
  await access(logPath)
  console.warn(`Draft already exists; preserving prose: ${logPath}`)
} catch {
  const ids = records.map((record) => record.id)
  const coverIndex = selected.findIndex((item) => item.cover)
  const frontmatter = logFrontmatterSchema.parse({
    type: records.some((record) => record.kind === 'video') ? 'clip' : 'photo',
    date: entry.date,
    title: entry.title,
    summary: entry.summary,
    cover: ids[coverIndex],
    gallery: ids,
    layout: entry.layout ?? 'standard',
    visibility: 'private',
    flags: {},
  })
  const mdx = `---\n${stringifyYaml(frontmatter).trimEnd()}\n---\n\n<!-- Add prose here. log:publish will never overwrite this file. -->\n`
  await atomicWrite(logPath, mdx)
}
await atomicWrite(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(
  `Published ${records.length} assets. Preview /log/${entry.date}-${entry.slug}`,
)

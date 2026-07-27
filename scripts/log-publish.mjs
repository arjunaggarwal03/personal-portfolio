import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const manifestPath = args.find((arg) => !arg.startsWith('--'))
if (!manifestPath)
  throw new Error(
    'Usage: npm run log:publish -- <selection-manifest> [--dry-run]',
  )
const manifest = JSON.parse(await readFile(path.resolve(manifestPath), 'utf8'))
if (manifest.version !== 1 || !Array.isArray(manifest.items))
  throw new Error('Unsupported selection manifest')
const selected = manifest.items.filter(
  (item) => item.selected && !item.duplicateOf,
)
if (!selected.length) throw new Error('Selection contains no publishable items')
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

const required = selected.some((item) => item.kind === 'image')
  ? [
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ]
  : []
if (selected.some((item) => item.kind === 'video'))
  required.push('MUX_TOKEN_ID', 'MUX_TOKEN_SECRET')
const missing = required.filter((key) => !process.env[key])
if (missing.length)
  throw new Error(
    `Publishing credentials are missing: ${missing.join(', ')}. Scan and --dry-run remain available without credentials.`,
  )

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
const checkpoint = async (hash, record) => {
  checkpoints[hash] = record
  const snapshot = `${JSON.stringify(checkpoints, null, 2)}\n`
  checkpointWrite = checkpointWrite.then(() =>
    writeFile(checkpointPath, snapshot),
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
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = `portfolio/log/${item.hash}`
  const signature = createHash('sha256')
    .update(
      `overwrite=false&public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`,
    )
    .digest('hex')
  const form = new FormData()
  form.set('file', new Blob([await readFile(derivative)]), `${item.hash}.webp`)
  form.set('api_key', process.env.CLOUDINARY_API_KEY)
  form.set('timestamp', String(timestamp))
  form.set('public_id', publicId)
  form.set('overwrite', 'false')
  form.set('signature', signature)
  const response = await retryFetch(() =>
    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form },
    ),
  )
  let data
  if (response.status === 409) {
    const authorization = Buffer.from(
      `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
    ).toString('base64')
    const existing = await retryFetch(() =>
      fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/image/upload/${encodeURIComponent(publicId)}`,
        { headers: { Authorization: `Basic ${authorization}` } },
      ),
    )
    if (!existing.ok)
      throw new Error(
        `Cloudinary idempotency lookup failed (${existing.status}): ${await existing.text()}`,
      )
    data = await existing.json()
  } else if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed (${response.status}): ${await response.text()}`,
    )
  } else data = await response.json()
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

const muxFetch = (url, init = {}) =>
  fetch(`https://api.mux.com${url}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
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
    const created = await retryFetch(() =>
      muxFetch('/video/v1/uploads', {
        method: 'POST',
        body: JSON.stringify({
          cors_origin: '*',
          new_asset_settings: {
            playback_policy: ['public'],
            passthrough: item.hash,
          },
        }),
      }),
    )
    if (!created.ok)
      throw new Error(
        `Mux upload creation failed (${created.status}): ${await created.text()}`,
      )
    const upload = (await created.json()).data
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

  const uploadStatus = await retryFetch(() =>
    muxFetch(`/video/v1/uploads/${uploadId}`),
  )
  if (!uploadStatus.ok)
    throw new Error(`Mux upload lookup failed (${uploadStatus.status})`)
  let assetId = (await uploadStatus.json()).data.asset_id
  if (!assetId && state.stage !== 'uploaded') {
    if (!uploadUrl)
      throw new Error(`Mux upload ${uploadId} has no resumable URL`)
    const bytes = await readFile(derivative)
    const put = await retryFetch(() =>
      fetch(uploadUrl, { method: 'PUT', body: bytes }),
    )
    if (!put.ok) throw new Error(`Mux upload failed (${put.status})`)
    state = { ...state, stage: 'uploaded' }
    await checkpoint(item.hash, state)
  }
  for (let attempt = 0; attempt < 90; attempt++) {
    const status = await retryFetch(() =>
      muxFetch(`/video/v1/uploads/${uploadId}`),
    )
    const data = (await status.json()).data
    if (data.asset_id) {
      assetId = data.asset_id
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  if (!assetId)
    throw new Error('Mux upload did not create an asset before timeout')
  let asset
  for (let attempt = 0; attempt < 150; attempt++) {
    const status = await retryFetch(() =>
      muxFetch(`/video/v1/assets/${assetId}`),
    )
    asset = (await status.json()).data
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

const records = []
let cursor = 0
async function worker() {
  while (cursor < selected.length) {
    const item = selected[cursor++]
    if (checkpoints[item.hash]?.complete) {
      records.push(checkpoints[item.hash].record)
      continue
    }
    const id = `log-${item.hash.slice(0, 16)}`
    const record =
      item.kind === 'image'
        ? await publishImage(item, id)
        : await publishVideo(item, id)
    await checkpoint(item.hash, { complete: true, record })
    records.push(record)
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
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)

const entry = manifest.entry ?? {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? ''))
  throw new Error('entry.date must be YYYY-MM-DD')
if (!/^[a-z0-9-]+$/.test(entry.slug ?? ''))
  throw new Error('entry.slug must be lowercase kebab-case')
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
  const escaped = (value = '') => String(value).replaceAll('"', '\\"')
  const mdx = `---\ntype: "${records.some((record) => record.kind === 'video') ? 'clip' : 'photo'}"\ndate: "${entry.date}"\ntitle: "${escaped(entry.title)}"\nsummary: "${escaped(entry.summary)}"\ncover: "${ids[0]}"\ngallery: [${ids.map((id) => `"${id}"`).join(', ')}]\nlayout: "${entry.layout ?? 'standard'}"\nvisibility: "${entry.visibility ?? 'private'}"\nflags: { draft: true }\n---\n\n<!-- Add prose here. log:publish will never overwrite this file. -->\n`
  await writeFile(logPath, mdx)
}
console.log(
  `Published ${records.length} assets. Preview /log/${entry.date}-${entry.slug}`,
)

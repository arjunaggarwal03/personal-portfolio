import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.tif',
  '.tiff',
])
const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4', '.m4v'])
const root = process.argv[2] ? path.resolve(process.argv[2]) : null
if (!root)
  throw new Error('Usage: npm run log:scan -- <apple-photos-export-directory>')

const workspace = path.join(process.cwd(), '.log-workspace')
const thumbnailDirectory = path.join(workspace, 'thumbnails')
await mkdir(thumbnailDirectory, { recursive: true })

async function discover(directory) {
  const found = []
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.name.startsWith('.') || item.name === '__MACOSX') continue
    const absolute = path.join(directory, item.name)
    if (item.isDirectory()) found.push(...(await discover(absolute)))
    else if (item.isFile()) {
      const extension = path.extname(item.name).toLowerCase()
      if (IMAGE_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension))
        found.push(absolute)
    }
  }
  return found.sort((a, b) => a.localeCompare(b))
}

async function hashFile(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

function videoMetadata(file) {
  try {
    const raw = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'stream=width,height:format=duration',
        '-of',
        'json',
        file,
      ],
      { encoding: 'utf8' },
    )
    const data = JSON.parse(raw)
    const stream = data.streams?.find(
      (candidate) => candidate.width && candidate.height,
    )
    return {
      width: stream?.width ?? null,
      height: stream?.height ?? null,
      duration: Number(data.format?.duration) || null,
    }
  } catch {
    return { width: null, height: null, duration: null }
  }
}

async function preview(file, kind, hash) {
  const target = path.join(thumbnailDirectory, `${hash.slice(0, 20)}.jpg`)
  try {
    if (kind === 'image')
      await sharp(file)
        .rotate()
        .resize({
          width: 360,
          height: 360,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 72 })
        .toFile(target)
    else
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-ss',
          '0',
          '-i',
          file,
          '-frames:v',
          '1',
          '-vf',
          'scale=360:-2',
          target,
        ],
        { stdio: 'ignore' },
      )
    return path.relative(workspace, target)
  } catch {
    return null
  }
}

const files = await discover(root)
const hashes = new Map()
const items = []
for (const file of files) {
  const extension = path.extname(file).toLowerCase()
  const kind = IMAGE_EXTENSIONS.has(extension) ? 'image' : 'video'
  const hash = await hashFile(file)
  const image =
    kind === 'image'
      ? await sharp(file)
          .metadata()
          .catch(() => ({}))
      : null
  const video = kind === 'video' ? videoMetadata(file) : null
  const duplicateOf = hashes.get(hash) ?? null
  if (!duplicateOf) hashes.set(hash, hash.slice(0, 20))
  items.push({
    id: hash.slice(0, 20),
    selected: false,
    kind,
    sourcePath: file,
    relativePath: path.relative(root, file),
    hash,
    duplicateOf,
    width: image?.width ?? video?.width ?? null,
    height: image?.height ?? video?.height ?? null,
    duration: video?.duration ?? null,
    alt: '',
    caption: '',
    takenAt: null,
    preview: duplicateOf ? null : await preview(file, kind, hash),
    livePairId: null,
  })
}

const stemGroups = new Map()
for (const item of items) {
  const stem = path
    .join(
      path.dirname(item.relativePath),
      path.basename(item.relativePath, path.extname(item.relativePath)),
    )
    .toLowerCase()
  const group = stemGroups.get(stem) ?? []
  group.push(item)
  stemGroups.set(stem, group)
}
for (const group of stemGroups.values()) {
  if (
    group.some((item) => item.kind === 'image') &&
    group.some((item) => item.kind === 'video')
  ) {
    const pairId = `live-${group
      .map((item) => item.hash.slice(0, 8))
      .sort()
      .join('-')}`
    for (const item of group) item.livePairId = pairId
  }
}

const manifest = {
  version: 1,
  sourceRoot: root,
  entry: {
    slug: 'replace-me',
    title: 'Replace me',
    date: '1970-01-01',
    summary: '',
    layout: 'standard',
    visibility: 'private',
  },
  items,
}
await writeFile(
  path.join(workspace, 'selection.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )
const cards = items
  .filter((item) => !item.duplicateOf)
  .map(
    (item) =>
      `<article><div class="preview">${item.preview ? `<img src="${escape(item.preview)}" alt="">` : '<span>preview unavailable</span>'}</div><code>${escape(item.relativePath)}</code><p>${item.kind}${item.livePairId ? ' · Live Photo pair' : ''}</p><label><input type="checkbox" disabled> select in selection.json</label></article>`,
  )
  .join('')
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Log media curation</title><style>body{font:14px system-ui;background:#f4ecd9;color:#181713;margin:2rem}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}article{background:#fffdf8;border:1px solid #cfc4ad;border-radius:10px;padding:12px}.preview{aspect-ratio:1;display:grid;place-items:center;background:#e8dcc2;overflow:hidden}.preview img{width:100%;height:100%;object-fit:contain}code{display:block;margin-top:8px;overflow-wrap:anywhere}p{color:#625c50}</style><h1>Log media curation</h1><p>${items.length} files · ${items.filter((item) => item.duplicateOf).length} exact duplicates hidden. Edit <code>selection.json</code>; originals remain untouched.</p><main>${cards}</main>`
await writeFile(path.join(workspace, 'contact-sheet.html'), html)
console.log(
  `Scanned ${items.length} files (${items.filter((item) => item.duplicateOf).length} exact duplicates).`,
)
console.log(`Selection: ${path.join(workspace, 'selection.json')}`)
console.log(`Contact sheet: ${path.join(workspace, 'contact-sheet.html')}`)

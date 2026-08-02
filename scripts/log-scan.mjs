import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import exifr from 'exifr'
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
const APPLE_SIDECARS = new Set(['.aae', '.xmp', '.json', '.plist', '.xml'])
const SCAN_CONCURRENCY = 4
const { parse: parseExif } = exifr

const root = process.argv[2] ? path.resolve(process.argv[2]) : null
if (!root)
  throw new Error('Usage: npm run log:scan -- <apple-photos-export-directory>')

const workspace = path.join(process.cwd(), '.log-workspace')
const thumbnailDirectory = path.join(workspace, 'thumbnails')
await mkdir(thumbnailDirectory, { recursive: true })

async function atomicWrite(target, value) {
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, value)
  await rename(temporary, target)
}

async function discover(directory, report) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    report.failures.push(
      `${path.relative(root, directory) || '.'}: ${error instanceof Error ? error.message : String(error)}`,
    )
    return []
  }

  const found = []
  for (const item of entries) {
    if (item.name.startsWith('.') || item.name === '__MACOSX') continue
    const absolute = path.join(directory, item.name)
    if (item.isDirectory()) {
      found.push(...(await discover(absolute, report)))
      continue
    }
    if (!item.isFile()) continue
    const extension = path.extname(item.name).toLowerCase()
    if (IMAGE_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension)) {
      found.push(absolute)
    } else if (APPLE_SIDECARS.has(extension)) {
      report.sidecars += 1
    } else {
      report.unsupported += 1
    }
  }
  return found.sort((a, b) => a.localeCompare(b))
}

async function mapLimit(values, limit, operation) {
  const output = Array(values.length)
  let cursor = 0
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++
      output[index] = await operation(values[index], index)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  )
  return output
}

async function hashFile(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

function normalizedDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}

function videoMetadata(file) {
  try {
    const raw = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'stream=width,height:stream_tags=creation_time:format=duration:format_tags=creation_time',
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
      takenAt: normalizedDate(
        data.format?.tags?.creation_time ?? stream?.tags?.creation_time,
      ),
    }
  } catch {
    return { width: null, height: null, duration: null, takenAt: null }
  }
}

async function preview(file, kind, hash, duration) {
  const target = path.join(thumbnailDirectory, `${hash.slice(0, 20)}.jpg`)
  try {
    if (kind === 'image') {
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
    } else {
      const seek = Math.min(3, Math.max(0.5, (duration ?? 10) * 0.1))
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-ss',
          String(seek),
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
    }
    return path.relative(workspace, target)
  } catch {
    return null
  }
}

async function inspectFile(file) {
  const extension = path.extname(file).toLowerCase()
  const kind = IMAGE_EXTENSIONS.has(extension) ? 'image' : 'video'
  try {
    const hash = await hashFile(file)
    const image =
      kind === 'image'
        ? await sharp(file)
            .metadata()
            .catch(() => null)
        : null
    const video = kind === 'video' ? videoMetadata(file) : null
    const exif =
      kind === 'image'
        ? await parseExif(file, {
            pick: ['DateTimeOriginal', 'CreateDate', 'Orientation'],
          }).catch(() => null)
        : null
    const takenAt =
      normalizedDate(exif?.DateTimeOriginal) ??
      normalizedDate(exif?.CreateDate) ??
      video?.takenAt ??
      null
    const previewPath = await preview(file, kind, hash, video?.duration)
    const width = image?.width ?? video?.width ?? null
    const height = image?.height ?? video?.height ?? null
    const issues = []
    if (!width || !height) issues.push('dimensions unavailable')
    if (kind === 'video' && !video?.duration)
      issues.push('duration unavailable')
    if (!previewPath) issues.push('preview unavailable')
    return {
      id: hash.slice(0, 20),
      selected: false,
      order: null,
      cover: false,
      kind,
      sourcePath: file,
      relativePath: path.relative(root, file),
      hash,
      duplicateOf: null,
      width,
      height,
      duration: video?.duration ?? null,
      alt: '',
      caption: '',
      takenAt,
      orientation: exif?.Orientation ?? null,
      preview: previewPath,
      livePairId: null,
      issues,
    }
  } catch (error) {
    return {
      file,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const discovery = { sidecars: 0, unsupported: 0, failures: [] }
const files = await discover(root, discovery)
const inspected = await mapLimit(files, SCAN_CONCURRENCY, inspectFile)
const failures = [
  ...discovery.failures,
  ...inspected.flatMap((result) =>
    'error' in result
      ? [`${path.relative(root, result.file)}: ${result.error}`]
      : result.issues.map((issue) => `${result.relativePath}: ${issue}`),
  ),
]
const items = inspected.filter((result) => !('error' in result))

const hashes = new Map()
for (const item of items) {
  item.duplicateOf = hashes.get(item.hash) ?? null
  if (!item.duplicateOf) hashes.set(item.hash, item.id)
  if (item.duplicateOf) item.preview = null
  delete item.issues
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

await atomicWrite(
  path.join(workspace, 'selection.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

const htmlManifest = JSON.stringify(manifest).replaceAll('<', '\\u003c')
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Log media curation</title><style>
body{font:14px system-ui;background:#f4ecd9;color:#181713;margin:2rem}header{display:flex;gap:1rem;align-items:end;justify-content:space-between;margin-bottom:1rem}#entry{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-bottom:1rem;padding:12px;background:#fffdf8;border:1px solid #cfc4ad;border-radius:10px}#policy,#status{margin:0 0 1rem;color:#625c50}#status.error{color:#8b2f24}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}article{background:#fffdf8;border:1px solid #cfc4ad;border-radius:10px;padding:12px}.preview{aspect-ratio:1;display:grid;place-items:center;background:#e8dcc2;overflow:hidden}.preview img{width:100%;height:100%;object-fit:contain}code{display:block;margin:8px 0;overflow-wrap:anywhere}.meta{min-height:3em;color:#625c50}.controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}.selected{outline:2px solid #89533b}label{display:block;margin-top:8px}input[type=text],input[type=date],textarea,input[type=number],select{box-sizing:border-box;width:100%;margin-top:4px;padding:6px;border:1px solid #cfc4ad;border-radius:4px;background:#fff}textarea{min-height:4rem}button{padding:8px 12px;border:1px solid #89533b;border-radius:6px;background:#fffdf8;color:#633824;cursor:pointer}
</style></head><body><header><div><h1>Log media curation</h1><p>${items.length} supported files, ${items.filter((item) => item.duplicateOf).length} exact duplicates, ${discovery.sidecars} sidecars ignored.</p></div><button id="save">Save selection</button></header><p id="policy">Live Photos share a pair label. Select the still, motion clip, or both deliberately; paired items remain linked in the manifest.</p><section id="entry" aria-label="Log entry"></section><p id="status" role="status"></p><main id="grid"></main><script>
const manifest=${htmlManifest};const items=manifest.items.filter(function(item){return !item.duplicateOf});items.forEach(function(item,index){if(item.order===null)item.order=index+1});
function field(labelText,type,name,value){var wrapper=document.createElement('label');wrapper.append(labelText);var input=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.dataset.field=name;if(type==='checkbox'||type==='radio')input.checked=Boolean(value);else input.value=value??'';wrapper.append(input);return wrapper}
[['Slug','text','slug'],['Title','text','title'],['Date','date','date'],['Summary','text','summary']].forEach(function(config){var control=field(config[0],config[1],config[2],manifest.entry[config[2]]);control.querySelector('input,textarea').dataset.entryField=config[2];document.querySelector('#entry').append(control)});
function selectField(labelText,name,values,current){var label=document.createElement('label');label.append(labelText);var select=document.createElement('select');select.dataset.entryField=name;values.forEach(function(value){var option=document.createElement('option');option.value=value;option.textContent=value;option.selected=value===current;select.append(option)});label.append(select);document.querySelector('#entry').append(label)}
selectField('Layout','layout',['standard','wide','portrait','pair'],manifest.entry.layout);selectField('Visibility','visibility',['private','unlisted','public'],manifest.entry.visibility);
document.querySelector('#entry').addEventListener('change',function(event){manifest.entry[event.target.dataset.entryField]=event.target.value});
function meta(item){var parts=[item.kind,item.width&&item.height?item.width+' x '+item.height:null,item.duration?item.duration.toFixed(1)+' sec':null,item.takenAt?'captured '+item.takenAt:null,item.orientation?'orientation '+item.orientation:null,item.livePairId?'Live Photo '+item.livePairId:null];return parts.filter(Boolean).join(' · ')}
function render(){var grid=document.querySelector('#grid');grid.replaceChildren();var ordered=[...items].sort(function(a,b){if(a.selected!==b.selected)return a.selected?-1:1;return (a.order??Infinity)-(b.order??Infinity)});ordered.forEach(function(item,index){var card=document.createElement('article');card.dataset.id=item.id;if(item.selected)card.className='selected';var preview=document.createElement('div');preview.className='preview';if(item.preview){var image=document.createElement('img');image.src=item.preview;image.alt='';preview.append(image)}else preview.textContent='preview unavailable';var filename=document.createElement('code');filename.textContent=item.relativePath;var details=document.createElement('p');details.className='meta';details.textContent=meta(item);var controls=document.createElement('div');controls.className='controls';var selected=field('Selected','checkbox','selected',item.selected);var cover=field('Cover','radio','cover',item.cover);cover.querySelector('input').name='cover';controls.append(selected,cover);card.append(preview,filename,details,controls,field('Order','number','order',item.order??index+1),field('Alt text','textarea','alt',item.alt),field('Caption','text','caption',item.caption));grid.append(card)})}
document.querySelector('#grid').addEventListener('change',function(event){var card=event.target.closest('article');if(!card)return;var item=items.find(function(candidate){return candidate.id===card.dataset.id});var name=event.target.dataset.field;if(name==='selected')item.selected=event.target.checked;else if(name==='cover'){items.forEach(function(candidate){candidate.cover=false});item.cover=true}else if(name==='order')item.order=Number(event.target.value);else item[name]=event.target.value;render()});
function errors(){var chosen=items.filter(function(item){return item.selected});var problems=[];if(!manifest.entry.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))problems.push('Enter a lowercase kebab-case slug.');if(!manifest.entry.title.trim())problems.push('Enter a title.');if(!manifest.entry.date.match(/^\\d{4}-\\d{2}-\\d{2}$/))problems.push('Enter a date.');if(!chosen.length)problems.push('Select at least one asset.');if(chosen.filter(function(item){return item.cover}).length!==1)problems.push('Choose exactly one selected cover.');chosen.forEach(function(item){if(!item.alt.trim())problems.push(item.relativePath+': alt text is required.');if(!Number.isInteger(item.order)||item.order<1)problems.push(item.relativePath+': order must be a positive integer.')});return problems}
document.querySelector('#save').addEventListener('click',async function(){var status=document.querySelector('#status');var problems=errors();if(problems.length){status.className='error';status.textContent=problems.join(' ');return}status.className='';var text=JSON.stringify(manifest,null,2)+'\\n';if('showSaveFilePicker' in window){var handle=await showSaveFilePicker({suggestedName:'selection.json',types:[{description:'JSON manifest',accept:{'application/json':['.json']}}]});var output=await handle.createWritable();await output.write(text);await output.close();status.textContent='Selection manifest saved.'}else{var link=document.createElement('a');link.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));link.download='selection.json';link.click();URL.revokeObjectURL(link.href);status.textContent='Selection manifest downloaded.'}});render();
</script></body></html>`

await atomicWrite(path.join(workspace, 'contact-sheet.html'), html)

console.log(
  `Scanned ${items.length} supported files (${items.filter((item) => item.duplicateOf).length} exact duplicates).`,
)
console.log(
  `Ignored ${discovery.sidecars} Apple sidecars and ${discovery.unsupported} unsupported files.`,
)
if (failures.length) {
  console.warn(`Inspection warnings (${failures.length}):`)
  for (const failure of failures) console.warn(`  - ${failure}`)
}
console.log(`Selection: ${path.join(workspace, 'selection.json')}`)
console.log(`Contact sheet: ${path.join(workspace, 'contact-sheet.html')}`)

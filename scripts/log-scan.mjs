import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import { parse as parseExif } from 'exifr'

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
          '1',
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
  const exif =
    kind === 'image'
      ? await parseExif(file, {
          pick: ['DateTimeOriginal', 'CreateDate', 'Orientation'],
        }).catch(() => null)
      : null
  items.push({
    id: hash.slice(0, 20),
    selected: false,
    order: null,
    cover: false,
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
    takenAt:
      exif?.DateTimeOriginal?.toISOString?.() ??
      exif?.CreateDate?.toISOString?.() ??
      null,
    orientation: exif?.Orientation ?? null,
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

const htmlManifest = JSON.stringify(manifest).replaceAll('<', '\\u003c')
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Log media curation</title><style>
body{font:14px system-ui;background:#f4ecd9;color:#181713;margin:2rem}header{display:flex;gap:1rem;align-items:end;justify-content:space-between;margin-bottom:1rem}#entry{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-bottom:1.5rem;padding:12px;background:#fffdf8;border:1px solid #cfc4ad;border-radius:10px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}article{background:#fffdf8;border:1px solid #cfc4ad;border-radius:10px;padding:12px}.preview{aspect-ratio:1;display:grid;place-items:center;background:#e8dcc2;overflow:hidden}.preview img{width:100%;height:100%;object-fit:contain}code{display:block;margin:8px 0;overflow-wrap:anywhere}label{display:block;margin-top:8px}input[type=text],input[type=date],textarea,input[type=number],select{box-sizing:border-box;width:100%;margin-top:4px;padding:6px;border:1px solid #cfc4ad;border-radius:4px;background:#fff}textarea{min-height:4rem}.controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}.selected{outline:2px solid #89533b}button{padding:8px 12px;border:1px solid #89533b;border-radius:6px;background:#fffdf8;color:#633824;cursor:pointer}
</style></head><body><header><div><h1>Log media curation</h1><p>${items.length} files, ${items.filter((item) => item.duplicateOf).length} exact duplicates hidden.</p></div><button id="save">Save selection</button></header><section id="entry" aria-label="Log entry"></section><main id="grid"></main><script>
const manifest=${htmlManifest};const items=manifest.items.filter(function(item){return !item.duplicateOf});
function field(label,type,name,value){var wrapper=document.createElement('label');wrapper.append(label);var input=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.dataset.field=name;if(type==='checkbox'||type==='radio')input.checked=Boolean(value);else input.value=value??'';wrapper.prepend(input);return wrapper}
[['Slug','text','slug'],['Title','text','title'],['Date','date','date'],['Summary','text','summary']].forEach(function(config){var control=field(config[0],config[1],config[2],manifest.entry[config[2]]);control.querySelector('input,textarea').dataset.entryField=config[2];document.querySelector('#entry').append(control)});var layout=document.createElement('label');layout.append('Layout');var select=document.createElement('select');select.dataset.entryField='layout';['standard','wide','portrait','pair'].forEach(function(value){var option=document.createElement('option');option.value=value;option.textContent=value;option.selected=value===manifest.entry.layout;select.append(option)});layout.append(select);document.querySelector('#entry').append(layout);document.querySelector('#entry').addEventListener('change',function(event){manifest.entry[event.target.dataset.entryField]=event.target.value});
function render(){var grid=document.querySelector('#grid');grid.replaceChildren();items.forEach(function(item,index){var card=document.createElement('article');card.dataset.id=item.id;if(item.selected)card.className='selected';var preview=document.createElement('div');preview.className='preview';if(item.preview){var image=document.createElement('img');image.src=item.preview;image.alt='';preview.append(image)}else preview.textContent='preview unavailable';var filename=document.createElement('code');filename.textContent=item.relativePath;var controls=document.createElement('div');controls.className='controls';var selected=field(' selected','checkbox','selected',item.selected);var cover=field(' cover','radio','cover',item.cover);cover.querySelector('input').name='cover';controls.append(selected,cover);card.append(preview,filename,controls,field('Order','number','order',item.order??index+1),field('Alt text','textarea','alt',item.alt),field('Caption','text','caption',item.caption));grid.append(card)})}
document.querySelector('#grid').addEventListener('change',function(event){var card=event.target.closest('article');if(!card)return;var item=items.find(function(candidate){return candidate.id===card.dataset.id});var name=event.target.dataset.field;if(name==='selected')item.selected=event.target.checked;else if(name==='cover'){items.forEach(function(candidate){candidate.cover=false});item.cover=true}else if(name==='order')item.order=Number(event.target.value);else item[name]=event.target.value;render()});
document.querySelector('#save').addEventListener('click',async function(){manifest.items.sort(function(a,b){return (a.order??Infinity)-(b.order??Infinity)});var text=JSON.stringify(manifest,null,2)+'\\n';if('showSaveFilePicker' in window){var handle=await showSaveFilePicker({suggestedName:'selection.json'});var output=await handle.createWritable();await output.write(text);await output.close()}else{var link=document.createElement('a');link.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));link.download='selection.json';link.click();URL.revokeObjectURL(link.href)}});render();
</script></body></html>`
await writeFile(path.join(workspace, 'contact-sheet.html'), html)
console.log(
  `Scanned ${items.length} files (${items.filter((item) => item.duplicateOf).length} exact duplicates).`,
)
console.log(`Selection: ${path.join(workspace, 'selection.json')}`)
console.log(`Contact sheet: ${path.join(workspace, 'contact-sheet.html')}`)

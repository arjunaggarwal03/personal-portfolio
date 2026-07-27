import { getSiteModel } from '../lib/content/model'
import { cloudinaryImageUrl } from '../lib/media/cloudinary'
import { muxPosterUrl } from '../lib/media/mux'

const model = getSiteModel()
const urls = new Set<string>()
for (const item of model.work)
  for (const link of item.links ?? []) urls.add(link.url)
for (const item of model.experiments)
  for (const link of item.links ?? []) urls.add(link.url)
for (const entry of model.log) {
  if (entry.url) urls.add(entry.url)
  for (const embed of entry.media ?? [])
    if (/^https?:/.test(embed.url)) urls.add(embed.url)
}
for (const asset of Object.values(model.assets)) {
  if (asset.kind === 'image' && asset.fixturePath) continue
  if (asset.kind === 'video' && asset.fixturePosterPath) continue
  const url =
    asset.kind === 'image'
      ? cloudinaryImageUrl(asset.sourceId, 640)
      : muxPosterUrl(asset, 640)
  if (url) urls.add(url)
}

const failures: string[] = []
let cursor = 0
const list = [...urls].sort()
async function worker() {
  while (cursor < list.length) {
    const url = list[cursor++]
    try {
      let response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
      })
      if (response.status === 405)
        response = await fetch(url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
        })
      if (!response.ok) failures.push(`${response.status} ${url}`)
    } catch (error) {
      failures.push(
        `ERROR ${url}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
await Promise.all(
  Array.from({ length: Math.min(6, list.length) }, () => worker()),
)
console.log(`Checked ${list.length} public media and external references.`)
if (failures.length)
  throw new Error(`Remote health failures:\n${failures.join('\n')}`)

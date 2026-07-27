import { getSiteModel } from '../lib/content/model'
import { validateContent } from '../lib/content/validate'

const model = getSiteModel()
const result = validateContent({
  writing: [...model.writing],
  log: [...model.log],
  assets: Object.values(model.assets),
})

console.log(
  `Validated ${model.writing.length} Writing posts, ${model.log.length} Log entries, and ${Object.keys(model.assets).length} media assets.`,
)
for (const warning of result.warnings) console.warn(`Warning: ${warning}`)

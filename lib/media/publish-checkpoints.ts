import { readFile } from 'node:fs/promises'
import {
  publishCheckpointsSchema,
  type PublishCheckpoint,
} from 'lib/content/schemas/publishing'

export async function loadPublishCheckpoints(
  checkpointPath: string,
): Promise<Record<string, PublishCheckpoint>> {
  try {
    return publishCheckpointsSchema.parse(
      JSON.parse(await readFile(checkpointPath, 'utf8')),
    )
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') return {}
    }
    throw new Error(`Unable to read checkpoint file ${checkpointPath}`, {
      cause: error,
    })
  }
}

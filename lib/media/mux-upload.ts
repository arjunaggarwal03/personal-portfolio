export function nextUploadedByte(
  acknowledgedRange: string | null,
  fallback: number,
): number {
  const match = acknowledgedRange?.match(/^bytes=0-(\d+)$/)
  if (!match) return fallback
  const next = Number(match[1]) + 1
  return Number.isSafeInteger(next) && next >= 0 ? next : fallback
}

type ChunkReader = {
  read(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<{ bytesRead: number }>
}

type Chunk = {
  bytes: Buffer
  start: number
  end: number
  total: number
}

/**
 * Reads and transfers a file in complete chunks. The injected reader and sender
 * are the local-file and Mux adapters; callers observe only durable progress.
 */
export async function uploadResumableChunks(options: {
  reader: ChunkReader
  fileSize: number
  startByte: number
  chunkSize: number
  send: (chunk: Chunk) => Promise<string | null>
  onProgress: (uploadedBytes: number) => Promise<void>
}): Promise<number> {
  let uploadedBytes = options.startByte

  while (uploadedBytes < options.fileSize) {
    const length = Math.min(options.chunkSize, options.fileSize - uploadedBytes)
    const bytes = Buffer.alloc(length)
    let filled = 0

    while (filled < length) {
      const result = await options.reader.read(
        bytes,
        filled,
        length - filled,
        uploadedBytes + filled,
      )
      if (
        !Number.isSafeInteger(result.bytesRead) ||
        result.bytesRead <= 0 ||
        result.bytesRead > length - filled
      ) {
        throw new Error(
          `Unexpected end of upload source at byte ${uploadedBytes + filled}`,
        )
      }
      filled += result.bytesRead
    }

    const fallback = uploadedBytes + filled
    const acknowledgedRange = await options.send({
      bytes,
      start: uploadedBytes,
      end: fallback - 1,
      total: options.fileSize,
    })
    const next = nextUploadedByte(acknowledgedRange, fallback)
    if (next <= uploadedBytes || next > options.fileSize) {
      throw new Error(`Invalid acknowledged upload position ${next}`)
    }
    uploadedBytes = next
    await options.onProgress(uploadedBytes)
  }

  return uploadedBytes
}

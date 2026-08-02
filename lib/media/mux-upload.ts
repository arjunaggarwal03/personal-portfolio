export function nextUploadedByte(
  acknowledgedRange: string | null,
  fallback: number,
): number {
  const match = acknowledgedRange?.match(/^bytes=0-(\d+)$/)
  if (!match) return fallback
  const next = Number(match[1]) + 1
  return Number.isSafeInteger(next) && next >= 0 ? next : fallback
}

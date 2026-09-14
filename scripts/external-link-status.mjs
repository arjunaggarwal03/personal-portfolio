const BOT_BLOCKED_STATUSES = new Set([401, 403, 429, 999])

export function isExternalLinkFailure(status) {
  return status >= 400 && !BOT_BLOCKED_STATUSES.has(status)
}

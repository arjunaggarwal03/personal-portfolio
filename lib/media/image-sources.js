const remoteImagePatterns = [
  { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
  { protocol: 'https', hostname: 'image.mux.com', pathname: '/**' },
  { protocol: 'https', hostname: 'i.scdn.co' },
  { protocol: 'https', hostname: '**.scdn.co' },
  { protocol: 'https', hostname: '**.spotifycdn.com' },
]

function hostnameMatches(pattern, hostname) {
  if (!pattern.startsWith('**.')) return hostname === pattern
  const suffix = pattern.slice(3)
  return hostname.endsWith(`.${suffix}`)
}

function pathnameMatches(pattern, pathname) {
  if (!pattern || pattern === '/**') return true
  if (pattern.endsWith('/**')) return pathname.startsWith(pattern.slice(0, -2))
  return pathname === pattern
}

function isAllowedRemoteImageUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  return remoteImagePatterns.some(
    (pattern) =>
      url.protocol === `${pattern.protocol}:` &&
      hostnameMatches(pattern.hostname, url.hostname) &&
      pathnameMatches(pattern.pathname, url.pathname),
  )
}

function isAllowedImageSource(value) {
  return (
    (value.startsWith('/') && !value.startsWith('//')) ||
    isAllowedRemoteImageUrl(value)
  )
}

module.exports = {
  isAllowedImageSource,
  isAllowedRemoteImageUrl,
  remoteImagePatterns,
}

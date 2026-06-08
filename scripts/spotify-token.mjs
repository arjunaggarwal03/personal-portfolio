#!/usr/bin/env node
/**
 * One-shot Spotify refresh-token minter for the /now dashboard.
 *
 * Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from .env.local (or the
 * environment), runs the Authorization Code flow against a temporary local
 * callback server, and writes SPOTIFY_REFRESH_TOKEN back into .env.local.
 *
 * Prereq: the Spotify app must list this redirect URI:
 *   http://127.0.0.1:3000/callback
 *
 * Usage:  node scripts/spotify-token.mjs
 */

import http from 'node:http'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { exec } from 'node:child_process'

const PORT = 3000
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
].join(' ')

const ENV_PATH = resolve(process.cwd(), '.env.local')

function readEnvFile() {
  const map = new Map()
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) map.set(m[1], m[2])
    }
  }
  return map
}

/** Upsert KEY=value in .env.local, preserving other lines. */
function writeEnvVar(key, value) {
  let lines = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, 'utf8').split('\n')
    : []
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`))
  if (idx >= 0) lines[idx] = `${key}=${value}`
  else lines.push(`${key}=${value}`)
  writeFileSync(ENV_PATH, lines.join('\n'))
}

const fileEnv = readEnvFile()
const clientId =
  process.env.SPOTIFY_CLIENT_ID || fileEnv.get('SPOTIFY_CLIENT_ID')
const clientSecret =
  process.env.SPOTIFY_CLIENT_SECRET || fileEnv.get('SPOTIFY_CLIENT_SECRET')

if (!clientId || !clientSecret) {
  console.error(
    'Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET. Add them to .env.local first.',
  )
  process.exit(1)
}

const state = randomBytes(8).toString('hex')
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
  })

function page(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:ui-monospace,monospace;background:#f4ecd9;color:#181713;display:grid;place-items:center;height:100vh;margin:0">
<div style="text-align:center;max-width:32rem;padding:2rem">
<h1 style="font-family:Georgia,serif">${title}</h1><p>${body}</p></div></body>`
}

async function exchangeCode(code) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })
  if (!res.ok) {
    throw new Error(
      `Token exchange failed (${res.status}): ${await res.text()}`,
    )
  }
  return res.json()
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end()
    return
  }

  const error = url.searchParams.get('error')
  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end(page('Authorization denied', error))
    console.error(`\nAuthorization denied: ${error}`)
    server.close(() => process.exit(1))
    return
  }

  if (url.searchParams.get('state') !== state) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end(page('State mismatch', 'Please re-run the script.'))
    server.close(() => process.exit(1))
    return
  }

  try {
    const token = await exchangeCode(url.searchParams.get('code'))
    writeEnvVar('SPOTIFY_REFRESH_TOKEN', token.refresh_token)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(
      page(
        'Connected ✓',
        'Refresh token saved to .env.local. You can close this tab.',
      ),
    )
    console.log('\n✓ SPOTIFY_REFRESH_TOKEN written to .env.local')
    console.log('  Refresh token:', token.refresh_token)
    server.close(() => process.exit(0))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end(page('Token exchange failed', String(err)))
    console.error(`\n${err}`)
    server.close(() => process.exit(1))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('\nOpen this URL in your browser to authorize:\n')
  console.log(authUrl + '\n')
  console.log('Waiting for the Spotify redirect on', REDIRECT_URI, '…')
  // Best-effort auto-open on macOS; harmless elsewhere.
  exec(`open "${authUrl}"`, () => {})
})

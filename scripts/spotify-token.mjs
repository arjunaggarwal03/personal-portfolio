#!/usr/bin/env node
/**
 * One-shot Spotify refresh-token helper for the /now Listening tile.
 *
 * Runs the Authorization Code flow locally: starts a loopback server, opens
 * Spotify's consent screen, exchanges the returned code for tokens, and writes
 * the long-lived refresh token straight into your .env.
 *
 * Prerequisites (in https://developer.spotify.com/dashboard):
 *   1. Create an app; copy its Client ID + Secret into .env (already done if
 *      you pasted them).
 *   2. Add this exact Redirect URI to the app settings:
 *        http://127.0.0.1:8888/callback
 *
 * Run:
 *   node --env-file=.env scripts/spotify-token.mjs
 */

import { exec } from 'node:child_process'
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const PORT = 8888
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
].join(' ')
const ENV_PATH = '.env'

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error(
    '\n✗ Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\n' +
      '  Put them in .env and run with: node --env-file=.env scripts/spotify-token.mjs\n',
  )
  process.exit(1)
}

const state = randomBytes(8).toString('hex')

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  }).toString()

/** Open a URL in the default browser, cross-platform. */
function openBrowser(url) {
  const cmd =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`
  exec(cmd, (err) => {
    if (err) console.log(`\nOpen this URL manually:\n${url}\n`)
  })
}

/** Escape a string for safe interpolation into HTML text/attribute context. */
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch],
  )
}

/** Replace or append a KEY=value line in .env, preserving the rest. */
function writeEnvValue(key, value) {
  let body = ''
  try {
    body = readFileSync(ENV_PATH, 'utf8')
  } catch {
    // no .env yet — start fresh
  }
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  const next = re.test(body)
    ? body.replace(re, line)
    : `${body}${body.endsWith('\n') || body === '' ? '' : '\n'}${line}\n`
  writeFileSync(ENV_PATH, next)
}

async function exchangeCode(code) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })
  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end('Not found')
    return
  }

  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')

  const done = (status, message) => {
    res.writeHead(status, { 'Content-Type': 'text/html' })
    res.end(
      `<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;padding:3rem;max-width:32rem;margin:auto">${message}</body>`,
    )
  }

  if (error) {
    done(400, `<h2>✗ Authorization denied</h2><p>${escapeHtml(error)}</p>`)
    console.error(`\n✗ Authorization denied: ${error}\n`)
    server.close()
    process.exit(1)
  }
  if (returnedState !== state) {
    done(400, '<h2>✗ State mismatch</h2><p>Possible CSRF — aborting.</p>')
    console.error('\n✗ State mismatch — aborting.\n')
    server.close()
    process.exit(1)
  }

  try {
    const token = await exchangeCode(code)
    if (!token.refresh_token) throw new Error('no refresh_token in response')
    writeEnvValue('SPOTIFY_REFRESH_TOKEN', token.refresh_token)
    done(
      200,
      '<h2>✓ Connected</h2><p>Refresh token saved to <code>.env</code>. You can close this tab and restart the dev server.</p>',
    )
    console.log(
      '\n✓ SPOTIFY_REFRESH_TOKEN written to .env\n' +
        '  Restart the dev server to light up the Listening tile.\n',
    )
    server.close()
    process.exit(0)
  } catch (e) {
    done(
      500,
      `<h2>✗ Token exchange failed</h2><pre>${escapeHtml(e.message)}</pre>`,
    )
    console.error(`\n✗ ${e.message}\n`)
    server.close()
    process.exit(1)
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    `\nSpotify auth — opening your browser to grant access…\n` +
      `If it doesn't open, visit:\n${authUrl}\n\n` +
      `Waiting for the redirect to ${REDIRECT_URI} …\n`,
  )
  openBrowser(authUrl)
})

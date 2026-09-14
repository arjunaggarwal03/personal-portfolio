import { createServer } from 'node:net'

export function parseTestPort(value) {
  const port = Number.parseInt(value, 10)
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid test port: ${value}`)
  }
  return port
}

export async function findAvailablePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    server.close()
    throw new Error('Unable to allocate an isolated test port')
  }
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  return address.port
}

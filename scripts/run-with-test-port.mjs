import { spawn } from 'node:child_process'
import { findAvailablePort } from './test-port.mjs'

const [command, ...args] = process.argv.slice(2)
if (!command) throw new Error('A command is required')

const port = await findAvailablePort()
const child = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
})

const result = await new Promise((resolve, reject) => {
  child.once('error', reject)
  child.once('exit', (code, signal) => resolve({ code, signal }))
})

if (result.signal) {
  throw new Error(`${command} exited after ${result.signal}`)
}
process.exitCode = result.code ?? 1

import process from 'node:process'
import { spawnSync } from 'node:child_process'

// Preserve the original command while keeping all assertions in Playwright Test.
const result = spawnSync('bunx', ['--no-install', 'playwright', 'test'], {
  stdio: 'inherit',
  env: { ...process.env, ...(process.argv[2] && { E2E_BASE_URL: process.argv[2] }) },
})
if (result.error) {
  throw result.error
}
process.exitCode = result.status ?? 1

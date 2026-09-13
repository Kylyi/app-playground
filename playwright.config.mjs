import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const production = process.env.E2E_PRODUCTION === '1'
const port = production ? 3021 : 3020
const externalURL = process.env.E2E_BASE_URL
const baseURL = externalURL ?? `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalURL
    ? undefined
    : {
        command: production
          ? 'bunx --no-install nuxt build && node .output/server/index.mjs'
          : `bunx --no-install nuxt dev --host 127.0.0.1 --port ${port}`,
        env: { PORT: String(port), HOST: '127.0.0.1' },
        url: baseURL,
        reuseExistingServer: false,
        timeout: 180000,
      },
})

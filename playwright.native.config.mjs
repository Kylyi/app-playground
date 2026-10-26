import process from 'node:process'
import { defineConfig } from '@playwright/test'
import mainConfig from './playwright.config.mjs'

const baseURL = process.env.NATIVE_E2E_BASE_URL ?? 'http://127.0.0.1:3022'

export default defineConfig({
  ...mainConfig,
  testDir: './tests/native-e2e',
  use: { ...mainConfig.use, baseURL },
  webServer: process.env.NATIVE_E2E_BASE_URL
    ? undefined
    : {
        command: 'bun run build:native && node tooling/native-consumer/.output/server/index.mjs',
        env: { PORT: '3022', HOST: '127.0.0.1' },
        url: baseURL,
        reuseExistingServer: false,
        timeout: 300000,
      },
})

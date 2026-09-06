import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  // The first run compiles pages on demand, which is slow in development.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    extraHTTPHeaders: {
      // Enquiry rate limiting keys off the forwarded client address, the same
      // way it will behind nginx. A fresh address per run stops repeated local
      // runs inside the ten-minute window from tripping the limit.
      'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
    },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
      testIgnore: /mobile\.e2e\.spec\.ts/,
    },
    {
      // The brief calls out mobile behaviour specifically, so the mobile
      // journeys run on a real mobile viewport rather than a narrow desktop.
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chromium' },
      testMatch: /mobile\.e2e\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    url: baseURL,
    timeout: 120_000,
  },
})

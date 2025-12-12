import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure'
  },
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : [
        {
          command: 'npm run dev --prefix apps/server',
          port: 8080,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000
        },
        {
          command: 'npm run dev --prefix apps/web',
          port: 5173,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000
        }
      ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})

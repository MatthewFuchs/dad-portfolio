import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: false, 
    timeout: 120_000,
    env: { NODE_ENV: 'production' },
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
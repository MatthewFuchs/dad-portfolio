import { defineConfig, devices } from '@playwright/test';
import { randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The signed-in admin, end to end: a production server on port 3100 with a
// test editor account, saving to a throwaway copy of content/ and public/
// (ADMIN_LOCAL_ROOT), never to the working copy. Run: npm run test:e2e:admin

export const ADMIN_EMAIL = 'editor@example.com';
export const ADMIN_PASSWORD = 'e2e-password-123';

// The config is loaded again in each worker: make the copy once.
if (!process.env.ADMIN_E2E_ROOT) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-e2e-'));
  fs.cpSync('content', path.join(root, 'content'), { recursive: true });
  for (const dir of ['projects', 'logos', 'resources', 'presentations']) {
    fs.cpSync(path.join('public', dir), path.join(root, 'public', dir), { recursive: true });
  }
  process.env.ADMIN_E2E_ROOT = root;
}

const salt = Buffer.from('0123456789abcdef');
const hash = `scrypt:16384:8:1:${salt.toString('base64')}:${scryptSync(ADMIN_PASSWORD, salt, 64, { N: 16384, r: 8, p: 1 }).toString('base64')}`;

export default defineConfig({
  testDir: 'tests/e2e-admin',
  webServer: {
    command: 'npx next start -p 3100',
    port: 3100,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NODE_ENV: 'production',
      ADMIN_USERS: JSON.stringify([{ email: ADMIN_EMAIL, name: 'Test Editor', hash }]),
      ADMIN_SESSION_SECRET: randomBytes(32).toString('base64url'),
      ADMIN_LOCAL_ROOT: process.env.ADMIN_E2E_ROOT!,
      GITHUB_TOKEN: '',
      VERCEL: '',
    },
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: { baseURL: 'http://localhost:3100' },
  workers: 1,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
  reporter: [['list']],
});

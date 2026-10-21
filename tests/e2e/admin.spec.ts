import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// The e2e server runs `next start` without ADMIN_USERS or ADMIN_SESSION_SECRET:
// the admin must not exist at all, and never be indexed. The signed-in flow
// is tested in tests/e2e-admin (npm run test:e2e:admin).
test('admin panel is switched off until sign-in is set up', async ({ request }) => {
  for (const path of ['/admin', '/admin/login', '/admin/projects', '/admin/projects/new']) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(404);
    expect(res.headers()['x-robots-tag']).toContain('noindex');
  }
  for (const path of ['/api/admin/login', '/api/admin/save', '/api/admin/upload', '/api/admin/delete']) {
    expect((await request.post(path, { data: {} })).status(), path).toBe(404);
  }
  expect((await request.get('/api/admin/thumb?path=/logos/airfoam/logo.png')).status()).toBe(404);
});

test('robots.txt keeps search engines out of the admin', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin');
  expect(robots).toContain('Disallow: /api/admin');
});

test('old document and photo links redirect to their new files', async ({ request }) => {
  const legacy: Record<string, string> = JSON.parse(fs.readFileSync('lib/legacy-redirects.json', 'utf8'));
  const pick = (re: RegExp) => Object.keys(legacy).find((k) => re.test(k))!;
  const sample = [
    pick(/^\/resources\/abt-drains\//),            // renamed manufacturer folder
    pick(/^\/projects\/east-village-qb\//),         // renamed project folder
    pick(/ .*\.pdf$/),                               // filename with spaces
    '/resources/leviat/2023 Themomass AIA Presentation Flyer.pdf', // once-broken link
  ];
  for (const from of sample) {
    const res = await request.get(encodeURI(from), { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(decodeURI(res.headers().location), from).toBe(legacy[from]);
    expect((await request.get(encodeURI(legacy[from]))).status(), legacy[from]).toBe(200);
  }
});

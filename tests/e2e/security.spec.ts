import { test, expect } from '@playwright/test';

const PAGES = ['/', '/products', '/projects', '/projects/cloverdale-athletic-park-clubhouse', '/presentations', '/resources', '/about', '/contact', '/privacy', '/terms'];

test('security headers are sent and the framework is not advertised', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("frame-ancestors 'self'");
  expect(h['content-security-policy']).toContain("object-src 'none'");
  expect(h['x-frame-options']).toBe('SAMEORIGIN');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['x-powered-by']).toBeUndefined();
});

test('no page trips the Content Security Policy', async ({ page }) => {
  test.setTimeout(90_000);
  const violations: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    // Vercel Analytics scripts only exist on Vercel; locally they 404 as HTML.
    if (text.includes('/_vercel/')) return;
    if (/Content Security Policy|Refused to (load|execute|apply|connect|frame)/i.test(text)) {
      violations.push(`${page.url()}: ${text.slice(0, 160)}`);
    }
  });
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: 'load' });
    await page.waitForTimeout(300);
  }
  expect(violations).toEqual([]);
});

test('the contact API refuses cross-site posts', async ({ request }) => {
  const res = await request.post('/api/contact', {
    headers: { origin: 'https://evil.example' },
    data: { name: 'x', email: 'x@example.com', message: 'x' },
  });
  expect(res.status()).toBe(403);
});

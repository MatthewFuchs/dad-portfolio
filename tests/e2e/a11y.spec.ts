import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function gotoOk(page: import('@playwright/test').Page, url: string) {
  const res = await page.goto(url);
  expect(res, `GET ${url} returned no response`).toBeTruthy();
  expect(res!.ok(), `GET ${url} should be OK, got ${res!.status()}`).toBe(true);
}

test('no CRITICAL a11y violations on key pages', async ({ page }) => {
  const paths = ['/', '/projects', '/products', '/resources', '/contact'];

  for (const path of paths) {
    await gotoOk(page, path);

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(v => v.impact === 'critical');

    expect(critical, `${path} a11y`).toEqual([]);
  }
});
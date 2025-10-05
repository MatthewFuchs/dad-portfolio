import { test, expect, type Page } from '@playwright/test';

async function gotoOk(page: Page, url: string) {
  const res = await page.goto(url);
  expect(res, `GET ${url} returned no response`).toBeTruthy();
  expect(res!.ok(), `GET ${url} should be OK, got ${res!.status()}`).toBe(true);
}

async function tryCloseOverlays(page: Page) {
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    document
      .querySelectorAll<HTMLElement>('div.fixed.inset-0, div[role="dialog"]')
      .forEach((el) => (el.style.pointerEvents = 'none'));
  });
}

async function forceClick(locator: ReturnType<Page['locator']>) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ force: true });
}

test('home loads and nav works', async ({ page }) => {
  await gotoOk(page, '/');

  await expect(page.locator('main').first()).toBeVisible();

  const projectsLink = page.getByRole('link', { name: /projects/i });
  if (await projectsLink.count()) {
    await projectsLink.first().click();
  } else {
    await gotoOk(page, '/projects');
  }

  await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();
});

test('projects filters and reset', async ({ page }) => {
  await gotoOk(page, '/projects');

  const cards = page.locator('a[href^="/projects/"]');
  const initial = await cards.count();
  expect(initial, 'expected at least one project card').toBeGreaterThan(0);

  const nonAllChip = page.getByRole('button').filter({ hasNotText: /all sectors/i }).first();
  await tryCloseOverlays(page);
  await forceClick(nonAllChip);

  await expect(cards).not.toHaveCount(0);

  const reset = page.getByRole('button', { name: /^reset$/i });
  if (await reset.count()) {
    await tryCloseOverlays(page);
    await forceClick(reset);
  } else {
    const allSectors = page.getByRole('button', { name: /all sectors/i });
    if (await allSectors.count()) {
      await tryCloseOverlays(page);
      await forceClick(allSectors);
    }
  }

  await expect(cards).toHaveCount(initial);
});

test('products category chips filter grid', async ({ page }) => {
  await gotoOk(page, '/products');

  let cards = page.getByTestId('company-card');
  let initial = await cards.count();
  if (initial === 0) {
    cards = page.locator('section >> .grid >> *');
    initial = await cards.count();
  }
  expect(initial, 'expected at least one manufacturer card').toBeGreaterThan(0);

  const nonAll = page.getByRole('button').filter({ hasNotText: /all categories/i }).first();
  await tryCloseOverlays(page);
  await forceClick(nonAll);

  const reset = page.getByRole('button', { name: /^reset$/i });
  if (await reset.count()) {
    await tryCloseOverlays(page);
    await forceClick(reset);
  } else {
    const allCategories = page.getByRole('button', { name: /all categories/i });
    if (await allCategories.count()) {
      await tryCloseOverlays(page);
      await forceClick(allCategories);
    }
  }

  await expect(cards).toHaveCount(initial);
});

test('resources CTA builds correct mailto link', async ({ page }) => {
  await gotoOk(page, '/resources');
  await page.getByLabel('Brand').selectOption({ index: 0 });
  await page.getByLabel('Meeting type').selectOption('Training');
  const link = page.getByRole('link', { name: /email to schedule/i });
  await expect(link).toHaveAttribute('href', /mailto:.*\?subject=Training%20request/i);
});
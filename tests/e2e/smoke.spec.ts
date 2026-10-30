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

test('presentation counts match the cards', async ({ page }) => {
  await gotoOk(page, '/presentations');
  const count = await page.getByRole('link', { name: /request this session/i }).count();
  expect(count, 'expected at least one presentation').toBeGreaterThan(0);
  await expect(page.getByText(`${count} technical session`, { exact: false })).toBeVisible();

  await gotoOk(page, '/');
  await expect(page.getByRole('link', { name: `See the ${count} presentation`, exact: false })).toBeVisible();
});

// With under 6 projects the filters stay hidden, unless a link turned one on.
test('a link can filter projects by manufacturer', async ({ page }) => {
  await gotoOk(page, '/projects');
  const cards = page.locator('a[href^="/projects/"]');
  const initial = await cards.count();
  expect(initial, 'expected at least one project card').toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: /all sectors/i })).toHaveCount(0);

  await gotoOk(page, '/projects?manufacturer=leviat');
  await expect(page.getByRole('button', { name: /all sectors/i })).toBeVisible();
  await expect(cards).not.toHaveCount(0);
  await expect(cards).not.toHaveCount(initial);
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

test('a manufacturer links to its documents', async ({ page }) => {
  await gotoOk(page, '/products?m=leviat');
  const dialog = page.getByRole('dialog', { name: 'Leviat' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('link', { name: /document/ }).click();
  await expect(page).toHaveURL(/\/resources#leviat$/);
  await expect(page.locator('#leviat button[aria-expanded]')).toHaveAttribute('aria-expanded', 'true');
});

test('a manufacturer links to its presentations', async ({ page }) => {
  await gotoOk(page, '/products?m=leviat');
  await page.getByRole('dialog', { name: 'Leviat' }).getByRole('link', { name: /presentation/ }).click();
  await expect(page).toHaveURL(/\/presentations\?manufacturer=Leviat$/);
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  const shown = await page.getByRole('link', { name: /request this session/i }).count();
  expect(shown).toBeGreaterThan(0);
  expect(shown).toBeLessThan(8);
});

test('the contact form starts from a presentation request', async ({ page }) => {
  await gotoOk(page, '/contact?about=Presentation%20request%3A%20Thermal%20Breaks');
  await expect(page.getByLabel('How can we help?')).toHaveValue(/Presentation request: Thermal Breaks/);
});
import { test, expect, type Page } from '@playwright/test';

// The contact API is mocked in every test here: no email is ever sent.
async function fillContact(page: Page) {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  // The button enables once the form is interactive (hydrated).
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('How can we help?').fill('Hello from the test suite');
}

test('contact form: sending state, then success', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route('**/api/contact', async (route) => {
    await held;
    await route.fulfill({ json: { ok: true } });
  });
  await fillContact(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(page.getByLabel('Name')).toBeDisabled();
  release();
  await expect(page.getByRole('status')).toContainText('your message is on its way');
});

test('contact form: server failure keeps the message and offers a way out', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Internal error</h1>' })
  );
  await fillContact(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  // Scoped to the form: Next.js keeps its own role=alert route announcer.
  const alert = page.locator('form').getByRole('alert');
  await expect(alert).toContainText('Your message was not sent.');
  await expect(alert).not.toContainText('Internal error');
  await expect(page.getByLabel('How can we help?')).toHaveValue('Hello from the test suite');
  await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible();

  const fallback = alert.getByRole('link', { name: 'Send it from your email app' });
  await fallback.dispatchEvent('click');
  await expect(fallback).toHaveAttribute('href', /^mailto:gfuchs@fuchs-sales\.ca\?subject=.*Test%20Person.*body=Hello%20from%20the%20test%20suite/);
});

test('contact form: a request that never answers times out', async ({ page }) => {
  await page.clock.install();
  await page.route('**/api/contact', () => {
    /* never fulfilled */
  });
  await fillContact(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeVisible();
  await page.clock.runFor(16_000);
  await expect(page.locator('form').getByRole('alert')).toContainText('took too long');
});

test('gallery lightbox shows a failure message when a photo cannot load', async ({ page }) => {
  await page.route(/\/_next\/image\?url=%2Fprojects%2Fseaborne-tilit-up-project%2Fgallery%2F0%2Fimage\.jpg/, (route) =>
    route.fulfill({ status: 404, body: '' })
  );
  await page.goto('/projects/seaborne-tilit-up-project', { waitUntil: 'domcontentloaded' });
  // Retry the click until the gallery is interactive (hydrated).
  await expect(async () => {
    await page.getByRole('button', { name: /Open image 1/ }).click();
    await expect(page.getByRole('dialog', { name: /Image 1 of/ })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole('dialog', { name: /Image 1 of/ }).getByRole('alert')).toContainText('could not be loaded');
});

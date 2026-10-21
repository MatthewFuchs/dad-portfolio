import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../../playwright.admin.config';

// Saves go to the throwaway copy made by playwright.admin.config.ts.
const ROOT = process.env.ADMIN_E2E_ROOT!;
const PHOTO = 'public/projects/the-linx-vancouver/hero.jpg';

async function signIn(page: Page, next = '/admin') {
  await page.goto(next);
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('signed-out visitors are sent to sign in; the API refuses them', async ({ page, request }) => {
  await page.goto('/admin/projects');
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fprojects$/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  const res = await page.request.get('/admin');
  expect(res.headers()['x-robots-tag']).toContain('noindex');

  for (const p of ['/api/admin/save', '/api/admin/delete', '/api/admin/upload']) {
    expect((await request.post(p, { data: {} })).status(), p).toBe(401);
  }
  expect((await request.get('/api/admin/thumb?path=/logos/airfoam/logo.png')).status()).toBe(401);
  // A made-up session cookie doesn't get in either.
  const forged = await request.post('/api/admin/save', {
    data: {},
    headers: { cookie: 'admin_session=eyJlbWFpbCI6ImEiLCJleHAiOjk5OTk5OTk5OTk5OTl9.AAAA' },
  });
  expect(forged.status()).toBe(401);
});

test('a wrong password shows a clear message', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('form [role=alert]')).toContainText("don't match");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('sign-in pauses after 5 wrong tries', async ({ request, baseURL }) => {
  const project = test.info().project.name;
  const attempt = () =>
    request.post('/api/admin/login', {
      data: { email: `lockout-${project}@example.com`, password: 'wrong' },
      headers: { origin: baseURL!, 'x-forwarded-for': `203.0.113.${project === 'mobile' ? 2 : 1}` },
    });
  for (let i = 0; i < 5; i++) expect((await attempt()).status()).toBe(401);
  const locked = await attempt();
  expect(locked.status()).toBe(429);
  expect((await locked.json()).error).toContain('15 minutes');
});

test('login from another site is refused', async ({ request }) => {
  const res = await request.post('/api/admin/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    headers: { origin: 'https://evil.example' },
  });
  expect(res.status()).toBe(403);
});

test('add a project with a photo, then remove it', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('heading', { name: 'Hi Test.' })).toBeVisible();
  await page.getByRole('link', { name: 'Add a project' }).click();
  await expect(page.getByRole('heading', { name: 'Add a project' })).toBeVisible();

  // Saving with nothing filled in points at what's missing.
  await page.getByRole('button', { name: 'Add project to website' }).click();
  await expect(page.getByText('Please fill in the project name.')).toBeVisible();
  await expect(page.getByText('Please add a main photo.')).toBeVisible();

  const name = `E2E Test Project ${test.info().project.name}`;
  await page.getByLabel('Project name').fill(name);
  await page.getByLabel('City and province').fill('Surrey, BC');
  await page.getByLabel('Year').fill('2025');
  await page.getByLabel('About this project').fill('A project made by the admin test.');
  await page.locator('#hero input[type=file]').setInputFiles(PHOTO);
  await page.locator('input[type=file][multiple]').first().setInputFiles([PHOTO, PHOTO]);
  await expect(page.locator('ol li')).toHaveCount(2);
  await page.getByRole('group', { name: 'Products used' }).getByRole('button').first().click();
  await page.getByLabel('Type of work').fill('Testing');
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Add project to website' })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Add project to website' }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/e2e-test-project-[a-z]+(-\d+)?\?saved=new/, { timeout: 30_000 });
  await expect(page.getByRole('status').first()).toContainText('was added');

  const id = new URL(page.url()).pathname.split('/').pop()!;
  const saved = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/projects', `${id}.json`), 'utf8'));
  expect(saved).toMatchObject({ name, location: 'Surrey, BC', year: '2025', sectors: ['Testing'], hero: `/projects/${id}/hero.jpg` });
  expect(saved.gallery).toHaveLength(2);
  expect(saved.manufacturers).toHaveLength(1);
  const hero = fs.readFileSync(path.join(ROOT, 'public', saved.hero));
  expect(hero.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  expect(fs.existsSync(path.join(ROOT, 'public/projects', id, 'gallery/1/image.jpg'))).toBe(true);
  await expect(page.getByText(`fuchs-sales.ca/projects/${id}`)).toBeVisible();

  // The page has just reloaded: retry until its scripts are ready to open the dialog.
  await expect(async () => {
    await page.getByRole('button', { name: 'Remove project' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole('dialog')).toContainText(`Remove “${name}”?`);
  await page.getByRole('button', { name: 'Yes, remove it' }).click();
  await expect(page).toHaveURL(/\/admin\/projects\?removed=/);
  await expect(page.getByRole('status')).toContainText('was removed');
  expect(fs.existsSync(path.join(ROOT, 'content/projects', `${id}.json`))).toBe(false);
  expect(fs.existsSync(path.join(ROOT, 'public/projects', id))).toBe(false);
});

test('change a manufacturer and sign out', async ({ page }) => {
  await signIn(page, '/admin/manufacturers/truefoam');
  await expect(page).toHaveURL(/\/admin\/manufacturers\/truefoam$/);
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  const line = `Updated by the admin test (${test.info().project.name}).`;
  await page.getByLabel('One-line description').fill(line);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.getByLabel('One-line description')).toHaveValue(line);
  const saved = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/manufacturers/truefoam.json'), 'utf8'));
  expect(saved.shortInfo).toBe(line);
  expect(saved.resources).toHaveLength(3); // documents untouched

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login\?signedout=1/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('admin pages fit a 360px phone and pass accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/admin/login');
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((v) => ['critical', 'serious'].includes(v.impact!))).toEqual([]);
  await signIn(page);
  for (const url of ['/admin', '/admin/projects', '/admin/projects/cloverdale-athletic-park-clubhouse', '/admin/manufacturers/truefoam', '/admin/presentations/new']) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${url} scrolls sideways`).toBeLessThanOrEqual(0);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => ['critical', 'serious'].includes(v.impact!));
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`), url).toEqual([]);
  }
});

import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const MANUFACTURER_COUNT = fs.readdirSync('content/manufacturers').filter((f) => f.endsWith('.json')).length;

const WIDTHS = [360, 390, 768, 1024, 1440];
const PAGES = [
  '/',
  '/products',
  '/projects',
  '/projects/cloverdale-athletic-park-clubhouse',
  '/presentations',
  '/resources',
  '/about',
  '/contact',
  '/privacy',
];

// Below this width the nav collapses to the menu button (Tailwind `lg`).
const DESKTOP_NAV_MIN = 1024;

// Layout checks only need the DOM and fonts: every picture box has a fixed
// aspect ratio, so waiting for full-size images to optimize adds nothing.
async function gotoOk(page: Page, url: string) {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(res, `GET ${url} returned no response`).toBeTruthy();
  expect(res!.ok(), `GET ${url} should be OK, got ${res!.status()}`).toBe(true);
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
  );
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('no page scrolls sideways and every h1 fits in two lines', async ({ page }) => {
      // Nine page loads; on a cold server the first image resizes are slow.
      test.setTimeout(60_000);
      for (const path of PAGES) {
        await gotoOk(page, path);

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return { scroll: doc.scrollWidth, client: doc.clientWidth };
        });
        expect(
          overflow.scroll,
          `${path} is ${overflow.scroll}px wide in a ${overflow.client}px viewport`
        ).toBeLessThanOrEqual(overflow.client);

        const lines = await page.locator('h1').first().evaluate((h1) => {
          const lh = parseFloat(getComputedStyle(h1).lineHeight);
          return Math.round(h1.getBoundingClientRect().height / lh);
        });
        expect(lines, `${path} h1 wraps to ${lines} lines`).toBeLessThanOrEqual(2);
      }
    });

    test('navigation is reachable', async ({ page }) => {
      await gotoOk(page, '/projects');
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();

      if (width >= DESKTOP_NAV_MIN) {
        await expect(nav.getByRole('link', { name: 'Presentations' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
      } else {
        await expect(nav.getByRole('link', { name: 'Presentations' })).toBeHidden();
        await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
        await page.getByRole('button', { name: 'Open menu' }).click();
        const drawer = page.getByRole('dialog', { name: 'Menu' });
        await expect(drawer.getByRole('link', { name: 'Resources' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(drawer).toBeHidden();
      }
    });
  });
}

test('home keeps the hero video, poster first', async ({ page }) => {
  await gotoOk(page, '/');
  const hero = page.locator('section').first();
  await expect(hero.locator('img[src*="hero-poster.jpg"]')).toBeVisible();
  // Once the page has loaded, the clip (if this browser can play it) uses the
  // file sized for the screen; a clip that errors is dropped, poster stays.
  const video = hero.locator('video');
  await page.waitForLoadState('load');
  await page.waitForTimeout(300);
  if (await video.count()) {
    await expect(video).toHaveAttribute(
      'src',
      (page.viewportSize()?.width ?? 1280) < 768
        ? '/video/hero-540.mp4'
        : '/video/hero-720.mp4'
    );
  }
  await expect(hero.locator('img[src*="hero-poster.jpg"]')).toBeVisible();
});

test('smooth scrolling is on, and off for reduced motion', async ({ page }) => {
  await gotoOk(page, '/');
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoOk(page, '/');
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
});

test('build sequence steps with buttons, without sideways scrolling', async ({ page }) => {
  await gotoOk(page, '/projects/cloverdale-athletic-park-clubhouse');
  const seq = page.getByRole('list', { name: 'Build sequence' });
  await seq.scrollIntoViewIfNeeded();
  await expect(page.getByRole('slider')).toHaveCount(0);

  await page.getByRole('button', { name: 'Previous step' }).click();
  await expect(page.getByRole('button', { name: /^Finished/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.getByRole('button', { name: /^Control structure/ })).toHaveAttribute('aria-pressed', 'true');

  const fits = await seq.evaluate((el) => el.scrollWidth <= el.clientWidth);
  expect(fits, 'thumbnail row should not scroll sideways').toBe(true);
});

test('home shows three tappable project cards and the partner logos', async ({ page }) => {
  await gotoOk(page, '/');
  const cards = page.locator('section', { has: page.getByRole('heading', { name: 'Recent projects' }) })
    .getByRole('link', { name: /View project/ });
  await expect(cards).toHaveCount(3);
  for (const href of await cards.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
    expect(href).toMatch(/^\/projects\/[a-z0-9-]+$/);
  }
  const logos = page.locator('section', { has: page.getByRole('heading', { name: 'Who we represent' }) })
    .getByRole('link', { name: /see details/ });
  await expect(logos).toHaveCount(MANUFACTURER_COUNT);
  await expect(logos.first()).toHaveAttribute('href', /^\/products\?m=[a-z0-9-]+$/);
});

test.describe('tap targets on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('every standalone link and button is at least 44px tall', async ({ page }) => {
    test.setTimeout(60_000);
    const found: string[] = [];
    for (const path of PAGES) {
      await gotoOk(page, path);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll<HTMLElement>('main a, main button, header a, header button, nav a, nav button').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return; // hidden
          if (el.closest('p, li p, figcaption')) return; // inline text links
          if (el.closest('[aria-label="Breadcrumb"]')) return; // breadcrumb trail
          if (getComputedStyle(el).visibility === 'hidden') return;
          if (r.height < 43.5) out.push(`${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.height)}px`);
        });
        return out;
      });
      found.push(...small.map((t) => `${path}: ${t}`));
    }
    expect(found, 'small tap targets').toEqual([]);
  });
});

for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  test.describe(`build sequence at ${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test('photo, arrows and steps fit on one screen', async ({ page }) => {
      await gotoOk(page, '/projects/cloverdale-athletic-park-clubhouse');
      const photo = page.getByRole('button', { name: 'Next step' }).locator('xpath=..');
      // Put the photo just under the fixed nav and sticky breadcrumbs.
      await photo.evaluate((el) => {
        const offset = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64) + 48;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
      });
      await page.waitForTimeout(400);
      const box = await page.evaluate(() => {
        const q = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        return {
          vh: window.innerHeight,
          prev: q('button[aria-label="Previous step"]'),
          next: q('button[aria-label="Next step"]'),
          steps: q('ol[aria-label="Build sequence"]'),
        };
      });
      for (const r of [box.prev, box.next, box.steps]) {
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.bottom).toBeLessThanOrEqual(box.vh);
      }
    });
  });
}

import { test, expect } from '@playwright/test';

const SITE = 'https://www.fuchs-sales.ca';
const PAGES = ['/', '/products', '/products/leviat', '/projects', '/presentations', '/resources', '/about', '/contact', '/projects/seaborne-tilit-up-project'];

test('every page has one brand in its title, a www canonical and a short description', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    expect(title.match(/Fuchs Sales/g)?.length, `${path} title "${title}"`).toBe(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, `${path} canonical`).toBe(path === '/' ? SITE : `${SITE}${path}`);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0, `${path} description length`).toBeGreaterThan(50);
    expect(description?.length ?? 0, `${path} description length`).toBeLessThanOrEqual(170);

    await expect(page.locator('h1'), `${path} h1`).toHaveCount(1);
  }
});

test('structured data: one organization, breadcrumbs with absolute URLs, projects described', async ({ page }) => {
  const graphs = async () =>
    (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));

  await page.goto('/products', { waitUntil: 'domcontentloaded' });
  let data = await graphs();
  const orgs = data.flatMap((d) => d['@graph'] ?? [d]).filter((d) => d['@type'] === 'ProfessionalService' || d['@type'] === 'Organization');
  expect(orgs).toHaveLength(1);
  expect(orgs[0].logo).toBe(`${SITE}/fuchs.png`);
  const crumbs = data.filter((d) => d['@type'] === 'BreadcrumbList');
  expect(crumbs).toHaveLength(1);
  for (const item of crumbs[0].itemListElement) expect(item.item).toMatch(/^https:\/\//);

  await page.goto('/projects/seaborne-tilit-up-project', { waitUntil: 'domcontentloaded' });
  data = await graphs();
  const work = data.find((d) => d['@type'] === 'CreativeWork');
  expect(work?.locationCreated?.name).toBe('Coquitlam, BC');
  expect(work?.mentions?.length).toBeGreaterThan(0);
});

test('sitemap lists every project and robots points to it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain(`${SITE}/projects/cloverdale-athletic-park-clubhouse`);
  expect(sitemap).toContain(`${SITE}/presentations`);
  expect(sitemap).toContain(`${SITE}/products/leviat`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

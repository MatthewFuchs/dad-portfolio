import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Content edited in the admin panel (content/*.json) must stay consistent:
// every reference resolves and every image/PDF exists in public/.
const ROOT = process.cwd();
const json = (dir: string) =>
  fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.json'))
    .map((f) => ({ slug: f.replace(/\.json$/, ''), data: JSON.parse(fs.readFileSync(path.join(ROOT, dir, f), 'utf8')) }));
const inPublic = (url: string) => fs.existsSync(path.join(ROOT, 'public', url));

describe('content files', () => {
  const manufacturers = json('content/manufacturers');
  const projects = json('content/projects');
  const presentations = json('content/presentations');
  const ids = new Set(manufacturers.map((m) => m.slug));

  it('has the expected collections', () => {
    expect(manufacturers.length).toBeGreaterThan(0);
    expect(projects.length).toBeGreaterThan(0);
    expect(presentations.length).toBeGreaterThan(0);
  });

  it('every manufacturer logo and document exists', () => {
    for (const { slug, data } of manufacturers) {
      expect(inPublic(data.logo), `${slug} logo ${data.logo}`).toBe(true);
      for (const r of data.resources) expect(inPublic(r.file), `${slug}: ${r.file}`).toBe(true);
    }
  });

  it('every project photo exists and every manufacturer reference resolves', () => {
    for (const { slug, data } of projects) {
      expect(inPublic(data.hero), `${slug} hero`).toBe(true);
      for (const g of data.gallery) expect(inPublic(g.image), `${slug}: ${g.image}`).toBe(true);
      for (const id of data.manufacturers) expect(ids.has(id), `${slug} -> ${id}`).toBe(true);
    }
  });

  it('every presentation banner exists and its manufacturer resolves', () => {
    for (const { slug, data } of presentations) {
      expect(inPublic(data.banner), `${slug} banner`).toBe(true);
      if (data.manufacturer) expect(ids.has(data.manufacturer), `${slug} -> ${data.manufacturer}`).toBe(true);
    }
  });
});

describe('content loader', () => {
  it('maps content to the shapes the pages use', async () => {
    const { getManufacturers, getProjects, getPresentations, getSectors } = await import('../lib/content');
    const [m, p, pres, sectors] = await Promise.all([getManufacturers(), getProjects(), getPresentations(), getSectors()]);
    expect(m.find((x) => x.id === 'truefoam')?.resources[0].size).toMatch(/^\d+ KB$/);
    expect(p.every((x, i) => i === 0 || (p[i - 1].year ?? 0) >= (x.year ?? 0))).toBe(true);
    expect(p.find((x) => x.slug === 'cloverdale-athletic-park-clubhouse')?.title).toBe('Cloverdale Athletic Park Soccer Clubhouse | Tree Pits');
    expect(pres.every((x) => x.banner.startsWith('/presentations/'))).toBe(true);
    expect(sectors).toContain('Tilt-Up');
  });

  describe('with a broken entry', () => {
    let tmp: string;
    beforeAll(() => {
      // A tiny site: one good manufacturer, one with a missing logo, and a
      // project that references a manufacturer that doesn't exist.
      tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'));
      const w = (rel: string, body: string) => {
        fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
        fs.writeFileSync(path.join(tmp, rel), body);
      };
      const m = (name: string, logo: string) => JSON.stringify({ name, website: 'https://example.com', logo, logoBackground: 'white', shortInfo: 'x', innovation: '', categories: [], order: 10, resources: [] });
      w('content/manufacturers/good.json', m('Good', '/logos/good/logo.png'));
      w('content/manufacturers/broken.json', m('Broken', '/logos/broken/missing.png'));
      w('public/logos/good/logo.png', 'png');
      w('content/projects/p.json', JSON.stringify({ name: 'P', focus: '', location: 'X', year: '2024', sectors: [], manufacturers: ['good', 'nope'], hero: '/projects/p/h.jpg', summary: 's', gallery: [], tags: [], resources: [] }));
      w('public/projects/p/h.jpg', 'jpg');
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.chdir(tmp);
      vi.resetModules();
    });
    afterAll(() => {
      process.chdir(ROOT);
      fs.rmSync(tmp, { recursive: true, force: true });
    });

    it('skips what is broken instead of failing the build', async () => {
      const { getManufacturers, getProjects } = await import('../lib/content');
      expect((await getManufacturers()).map((m) => m.id)).toEqual(['good']);
      const [project] = await getProjects();
      expect(project.manufacturers).toEqual(['good']);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('manufacturer "broken"'));
    });
  });
});

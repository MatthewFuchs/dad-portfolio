# Fuchs Sales & Consulting — Website

Website for Fuchs Sales & Consulting, technical sales and manufacturer representation for commercial and industrial construction across Canada (tilt-up, precast, building envelope and stormwater products).

**Live site:** https://www.fuchs-sales.ca

---

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the SMTP values (see below)
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev         # Development server (Turbopack)
npm run build       # Production build
npm start           # Serve the production build on port 3000
npm run test:unit   # Vitest: contact API, content files, admin sign-in and saving
npm run test:e2e    # Playwright: builds, starts the server, runs tests/e2e on desktop Chrome + iPhone 12
npm run test:e2e:admin  # Playwright: signed-in admin flow on port 3100, saving to a temporary copy of the content
npm test            # All of them
```

`test:e2e` starts its own server on port 3000, so stop `npm run dev` first. The e2e suite covers responsive layout (360–1440px), tap-target sizes, SEO metadata, security headers / CSP, accessibility (axe) and the contact form's loading and failure states. Contact tests mock the API, so no email is sent.

## Environment variables

The contact form (`app/api/contact/route.ts`) sends mail through iCloud SMTP with nodemailer. Set these in `.env.local` locally and in Vercel → Settings → Environment Variables:

| Variable | Example | Notes |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.mail.me.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | STARTTLS on 587 |
| `SMTP_USER` | `you@icloud.com` | iCloud account |
| `SMTP_PASS` | — | An Apple **app-specific password** (appleid.apple.com → Sign-In and Security). Apple revokes these when the Apple ID password changes; if the form stops sending, Vercel logs show `CONTACT SEND ERROR: EAUTH 535`. Create a new one, update it here and redeploy. |
| `SMTP_FROM` | `Fuchs Sales and Consulting <you@icloud.com>` | Must use the `SMTP_USER` address; iCloud rejects other senders. |
| `SMTP_TO` | `you@icloud.com` | Inbox that receives enquiries (defaults to `fuchsgreg@icloud.com`). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `gfuchs@fuchs-sales.ca` | Address shown in mailto links. |
| `ADMIN_USERS` | `[{"email":…,"name":"Greg","hash":"scrypt:…"}]` | Who can sign in to `/admin`. Make an entry with `node scripts/hash-password.mjs`. |
| `ADMIN_SESSION_SECRET` | 32+ random characters | Signs the sign-in cookie. Changing it signs everyone out. Without this or `ADMIN_USERS`, `/admin` returns 404. |
| `GITHUB_TOKEN` | — | Live site only. Fine-grained token for this repo with **Contents: read and write**; admin saves are commits to `main`. |
| `GITHUB_REPO` / `GITHUB_BRANCH` | `MatthewFuchs/dad-portfolio` / `main` | Where admin saves go. |

Changing a variable in Vercel only takes effect after a redeploy.

## What's inside

- **Next.js 15** (App Router, statically rendered pages), **React 19**, **TypeScript**
- **Tailwind CSS 4**: design tokens in `app/globals.css` (concrete-grey ground, ink, olive accent; `btn`, `btn-light`, `btn-ghost`, `link`, `gutter` utilities)
- **Switzer** typeface, self-hosted in `app/fonts/` via `next/font/local`
- **Lenis** smooth scrolling with a light parallax on large photos (`components/SmoothScroll.tsx`); both are off for `prefers-reduced-motion`
- **Hero video**: re-encoded 720p/540p clips in `public/video/`, poster shown first, loaded after the page; skipped on reduced motion, Data Saver and 2G
- **Contact API**: validation, honeypot, same-origin check, 20 KB body cap and a per-IP rate limit
- **Security headers** (CSP, frame, nosniff, referrer, permissions) in `next.config.ts`
- **SEO**: per-page metadata with `www` canonicals, one Organization/WebSite JSON-LD graph in `app/layout.tsx`, per-page BreadcrumbList, project CreativeWork JSON-LD, `app/sitemap.ts` and `app/robots.ts`
- Error and global-error pages, plus loading and failure states on the form, photos and video

## Project structure

```text
app/
  layout.tsx                 # Shell: fonts, Navbar, Breadcrumbs, Footer, JSON-LD, smooth scroll
  page.tsx                   # Home
  globals.css                # Design tokens and utilities
  error.tsx, global-error.tsx, not-found.tsx
  api/contact/route.ts       # Contact form endpoint (nodemailer)
  admin/, api/admin/         # Website editor: sign-in, dashboard, lists, edit forms; save/upload/delete APIs
  products/                  # Manufacturers (logo cards + details dialog)
  projects/                  # Project index + [slug] detail (gallery or build sequence)
  presentations/             # Technical presentations (manufacturer filter, request by email)
  resources/                 # Downloadable PDFs per manufacturer
  about/, contact/, privacy/, terms/
  fonts/                     # Switzer woff2 files
  sitemap.ts, robots.ts

components/
  admin/                     # Website editor forms (photos, documents, save bar)
  Navbar.tsx, Footer.tsx, Breadcrumbs.tsx, PageHeader.tsx
  Card.tsx                   # Shared tappable card (projects, manufacturers)
  HeroVideo.tsx              # Poster-first hero video with fallbacks
  BuildSequence.tsx          # Step-through photo sequence on project pages
  Gallery.tsx                # Photo grid + lightbox
  FilterBar.tsx              # Filter chips (single swipeable row on phones)
  EmailForm.tsx              # Contact form with sending / sent / error states
  SmoothScroll.tsx, JsonLd.tsx

content/                     # Site content edited in the admin panel (JSON)
  projects/, manufacturers/, presentations/

lib/
  content.ts                 # Reads content/ at build time (types + loaders)
  auth.ts, session.ts        # Admin passwords (scrypt), lock-out, signed session cookie
  admin-content.ts           # Admin: checks fields, names files, builds each save
  admin-store.ts             # Admin: saves to GitHub (live) or disk (local)
  admin-uploads.ts           # Admin: upload tokens and file-type checks
  legacy-redirects.json      # Old asset URLs -> new files

middleware.ts                # Sends signed-out visitors from /admin to sign-in
scripts/hash-password.mjs    # Makes an ADMIN_USERS entry

data/
  team.ts                    # Kept for future team members (not used yet)

public/
  video/                     # Hero clips + poster
  logos/, presentations/, projects/, resources/, team/
  legal/                     # terms.html, privacy.html (shown in iframes)
  fuchs.png, fuchs-grey.png, og.jpg

tests/
  contact-api.spec.ts, content.spec.ts, admin.spec.ts  # Unit tests (Vitest)
  e2e/                       # Playwright: smoke, a11y, responsive, seo, states, security, admin off
  e2e-admin/                 # Playwright: signed-in admin flow (playwright.admin.config.ts)
```

## Editing content (admin panel)

Projects, manufacturers (with their documents) and presentations are edited at **`/admin`**, a simple editor in the site's own style. [ADMIN-GUIDE.md](ADMIN-GUIDE.md) is the guide for editors.

- **Sign-in:** email and password for each person in `ADMIN_USERS` (scrypt hashes), an 8-hour HttpOnly, SameSite=Strict cookie, 5 wrong tries per email or IP pause sign-in for 15 minutes. `middleware.ts` guards `/admin` and `/api/admin`, and every page and API route checks the session again. Admin pages are `noindex`, `no-store` and disallowed in `robots.txt`.
- **Locally:** set `ADMIN_USERS` and `ADMIN_SESSION_SECRET` in `.env.local`, run `npm run dev`, open http://localhost:3000/admin. Saves write straight to `content/` and `public/` in your working copy.
- **Live:** with `GITHUB_TOKEN` and `GITHUB_REPO` set, each save is one commit to `main` (via the Git Data API) and Vercel redeploys in about 2 minutes. The editor reads from GitHub, so it shows a save straight away. Without a token the live editor signs in but says saving isn't set up.
- **Uploads:** photos are resized in the browser to 2400 px JPEG, sent in 3 MB parts (Vercel's request limit is 4.5 MB) and checked by their contents. Limits: photos 15 MB, logos 5 MB, PDFs 25 MB.
- **Files:** content lives in `content/{projects,manufacturers,presentations}/*.json`; files go to `public/<collection>/<id>/` with fixed names (`hero.jpg`, `gallery/0/image.jpg`, `resources/0/file.pdf`, `logo.png`, `banner.png`). The editor renumbers them when photos are reordered and deletes ones no longer used. The web address (id) comes from the name and never changes afterwards.
- `lib/content.ts` reads the content at build time. Entries with a missing file or unknown manufacturer are skipped with a build warning instead of failing the deploy; `tests/content.spec.ts` checks every reference and file.
- Old document and photo URLs redirect to the new files (`lib/legacy-redirects.json`).

## Adding content by hand

Prefer the admin panel. By hand: add a JSON file to `content/<collection>/` following an existing one, with its files under `public/<collection>/<id>/` using the fixed names above, then run `npm run test:unit`.

## Deployment

Deployed on [Vercel](https://vercel.com/). Every push to `main` deploys to https://www.fuchs-sales.ca (the bare domain redirects to `www`).

## License

All Rights Reserved — see `LICENSE`.

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
npm run test:unit   # Vitest: contact API (tests/contact-api.spec.ts)
npm run test:e2e    # Playwright: builds, starts the server, runs tests/e2e on desktop Chrome + iPhone 12
npm test            # Both
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
  products/                  # Manufacturers (logo cards + details dialog)
  projects/                  # Project index + [slug] detail (gallery or build sequence)
  presentations/             # Technical presentations (manufacturer filter, request by email)
  resources/                 # Downloadable PDFs per manufacturer
  about/, contact/, privacy/, terms/
  fonts/                     # Switzer woff2 files
  sitemap.ts, robots.ts

components/
  Navbar.tsx, Footer.tsx, Breadcrumbs.tsx, PageHeader.tsx
  Card.tsx                   # Shared tappable card (projects, manufacturers)
  HeroVideo.tsx              # Poster-first hero video with fallbacks
  BuildSequence.tsx          # Step-through photo sequence on project pages
  Gallery.tsx                # Photo grid + lightbox
  FilterBar.tsx              # Filter chips (single swipeable row on phones)
  EmailForm.tsx              # Contact form with sending / sent / error states
  SmoothScroll.tsx, JsonLd.tsx

data/
  projects.ts                # PROJECTS (gallery photos with a `stage` render as a build sequence)
  manufacturers.ts           # MANUFACTURERS (logos, resources)
  team.ts                    # Kept for future team members (not used yet)

public/
  video/                     # Hero clips + poster
  logos/, presentations/, projects/, resources/, team/
  legal/                     # terms.html, privacy.html (shown in iframes)
  fuchs.png, fuchs-grey.png, og.jpg

tests/
  contact-api.spec.ts        # Unit tests (Vitest)
  e2e/                       # Playwright: smoke, a11y, responsive, seo, states, security
```

## Adding content

- **Project:** add an entry to `PROJECTS` in `data/projects.ts` and its photos under `public/projects/<slug>/`. Give every gallery photo a `stage` to show it as a step-through build sequence.
- **Manufacturer resource:** add to the manufacturer's `resources` in `data/manufacturers.ts`, with the PDF under `public/resources/<manufacturer>/`.
- **Presentation:** add to `PRESENTATIONS` in `app/presentations/PresentationsClient.tsx`, with a banner under `public/presentations/`.

## Deployment

Deployed on [Vercel](https://vercel.com/). Every push to `main` deploys to https://www.fuchs-sales.ca (the bare domain redirects to `www`).

## License

All Rights Reserved — see `LICENSE`.

# Fuchs Sales & Consulting website

The website for Fuchs Sales & Consulting, which provides technical sales and manufacturer representation for commercial and industrial construction across Canada.

**Live site:** https://www.fuchs-sales.ca

## Getting started

Requires Node.js 20 or later.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see Environment variables)
npm run dev                  # http://localhost:3000
```

## Commands

```bash
npm run dev             # Development server
npm run build           # Production build
npm start               # Serve the production build on port 3000
npm run test:unit       # Unit tests (Vitest)
npm run test:e2e        # Browser tests (Playwright), desktop Chrome and iPhone 12
npm run test:e2e:admin  # Signed-in admin tests, using a temporary copy of the content
npm test                # All of the above
```

`test:e2e` builds the site and starts its own server on port 3000, so stop `npm run dev` first. The contact tests use a fake API, so no email is sent.

## Environment variables

Set these in `.env.local` locally and in Vercel under Settings > Environment Variables. `.env.example` lists them all. A change in Vercel takes effect after the next deploy.

| Variable | What it's for |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Mail server for the contact form (iCloud: `smtp.mail.me.com`, `587`, `false`) |
| `SMTP_USER`, `SMTP_PASS` | iCloud account and an Apple app-specific password |
| `SMTP_FROM` | Sender. It must use the `SMTP_USER` address, or iCloud rejects it. |
| `SMTP_TO` | Inbox that receives enquiries |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown in email links on the site |
| `ADMIN_USERS` | Who can sign in to `/admin`. Create an entry with `node scripts/hash-password.mjs`. |
| `ADMIN_SESSION_SECRET` | Signs the sign-in cookie. Changing it signs everyone out. |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | Live site only: where admin saves are committed |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Optional ownership codes for Google Search Console and Bing Webmaster Tools |

Without `ADMIN_USERS` and `ADMIN_SESSION_SECRET`, `/admin` is switched off.

**If the contact form stops sending:** Apple cancels app-specific passwords when the Apple ID password changes. The Vercel logs will show `CONTACT SEND ERROR: EAUTH 535`. Create a new password, update `SMTP_PASS` and redeploy.

## Editing content

Projects, manufacturers and presentations are edited at **`/admin`**. The About and Contact pages, and the wording on the home page, are edited in their files under `app/`. The legal text is in `public/legal/`.

- **Live site:** each save is one commit to `main`, and Vercel redeploys in about 2 minutes.
- **Locally:** saves write straight to `content/` and `public/` in your working copy.
- **Web addresses:** a new entry's address comes from its name and doesn't change afterwards.
- **Files:** uploads are stored under `public/<collection>/<id>/` with fixed names, such as `hero.jpg` or `gallery/0/image.jpg`.
- **Broken entries:** an entry with a missing file is skipped with a build warning, so one mistake can't block a deploy. `tests/content.spec.ts` checks every reference and file.

To add content by hand, copy an existing JSON file in `content/<collection>/`, put its files under `public/<collection>/<id>/`, then run `npm run test:unit`.

## How it's built

- **Next.js 15**, **React 19**, **TypeScript** and **Tailwind CSS 4**. Pages are built ahead of time from the files in `content/`.
- **Design:** colours, type sizes and the `btn`, `link` and `gutter` styles are in `app/globals.css`. The Switzer typeface is in `app/fonts/`.
- **Contact form:** `app/api/contact/route.ts` sends email with nodemailer.
- **Search:** page titles and descriptions, structured data, `app/sitemap.ts` and `app/robots.ts`. Each manufacturer has its own page so search engines can find it.
- **Images:** addresses carry a version based on the file's contents, so a replaced photo appears straight away.
- **Security:** headers are set in `next.config.ts`.

## Project structure

```text
app/
  layout.tsx          Frame around every page: fonts, nav, footer, search details
  page.tsx            Home
  products/           Manufacturers list, and [id]/ for each company's page
  projects/           Projects list, and [slug]/ for each project's page
  presentations/      Technical presentations
  resources/          Documents by manufacturer
  about/, contact/, privacy/, terms/
  admin/, api/admin/  Website editor and its save, upload and sign-in routes
  api/contact/        Contact form

components/           Shared parts: nav, footer, cards, gallery, contact form
components/admin/     Website editor forms
content/              Projects, manufacturers and presentations (JSON)
lib/content.ts        Reads content/ when the site is built
lib/admin-*.ts        Website editor: checking, saving and uploads
lib/auth.ts, session.ts  Admin sign-in
public/               Images, documents, video and legal pages
scripts/              Admin password tool
tests/                Unit tests, plus browser tests in e2e/ and e2e-admin/
```

`data/team.ts` isn't used by the site at the moment.

## Deployment

Hosted on [Vercel](https://vercel.com/). Every push to `main` deploys to https://www.fuchs-sales.ca.

If you turn on Vercel's Bot Protection or Attack Challenge Mode, check that search engines can still reach the site: `curl -I https://www.fuchs-sales.ca/robots.txt` should return 200.

## License

All rights reserved. See `LICENSE`.

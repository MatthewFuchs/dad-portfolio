# Fuchs Sales & Consulting — Website

This is a [Next.js](https://nextjs.org) project for Fuchs Sales & Consulting, a technical‑sales & manufacturer‑representation site for commercial and industrial construction across Canada.

**Live site:** https://www.fuchs-sales.ca

---

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open <http://localhost:3000> with your browser to see the result.

You can start editing the home page by modifying `app/page.tsx`. The page auto‑updates as you edit the file.

> This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for automatic font optimization.

---

## What’s Inside

- **Next.js** with primarily static rendering
- **TypeScript**
- **Tailwind CSS**
- **lucide-react** icons
- Sticky Navbar + Breadcrumbs (smart offset via CSS var)
- Unified filtering UX across Products, Projects, and Presentations
- SEO metadata (title, description, canonicals), Open Graph/Twitter, and Breadcrumb JSON‑LD

---

## Scripts

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm start          # Run the production build
npm run lint       # Lint code
npm run typecheck  # Type-check only
```

---

## Project Structure

```text
app/
  layout.tsx                  # App shell; renders <Navbar/> and optional <Breadcrumbs/>
  page.tsx                    # Home (video hero + sections)

  products/
    page.tsx                  # Metadata layer
    ProductsClient.tsx        # UI (filters + cards)

  projects/
    page.tsx
    ProjectsIndexClient.tsx   # UI (sector chips + manufacturer select)
    /[slug]
        page.tsx

  presentations/
    page.tsx
    PresentationsClient.tsx   # UI (tag chips + email CTA)

  resources/
    page.tsx
    ResourcesClient.tsx

  contact/
    page.tsx

  about/
    page.tsx

  terms/
    page.tsx                  # iframe to /public/legal/terms.html

  privacy/
    page.tsx                  # iframe to /public/legal/privacy.html

components/
  Navbar.tsx                  # Sticky navbar
  Breadcrumbs.tsx             # Sticky breadcrumbs positioned below navbar
  EmailForm.tsx               # Form to send inquiries straight from the website
  FilterBar.tsx               # Used for filter pills on some pages
  Footer.tsx
  Gallery.tsx                 # Gallery on project pages
  JsonLd.tsx

data/
  projects.ts                 # PROJECTS, ALL_SECTORS
  manufacturers.ts            # MANUFACTURERS (ids/labels for filters)
  team.ts                     # Can be used in the future if more team members join the company

public/
  fuchs.png                   # Logo
  fuchs-grey.png              # Grey Logo
  og.jpg                      # Social preview image
  video.mp4                   # Hero background video
  logos/...                   # Manufacturer logos
  presentations/...           # Presentation banners
  projects/...                # Project images
  resources/...               # PDF's and presentation resources per manufacturer
  legal/terms.html            # Terms of Use
  legal/privacy.html          # Privacy Policy
  logos/...                   # Company logos
```

---

## Consistent Filtering UX

All listing pages follow the same pattern:

- Wrapped chips
- Leading “All …” chip to clear the primary filter
- Reset button when any filter is active
- Removable tokens for active selections
- Optional secondary select for a second dimension

**Pages:**

- **Products:** multi‑select Categories (chips)
- **Projects:** single‑select Sector (chips) + Manufacturer (select)
- **Presentations:** multi‑select Tags (chips)

---

## Accessibility & UX

- “Skip to content” link for keyboard users
- Navbar publishes `--nav-h` (height) so Breadcrumbs can stick directly beneath without overlapping
- Mobile drawer locks body scroll; ESC closes modals/drawer
- Fallbacks for limited `backdrop-filter` support on some mobile browsers

---

## Images & Banners

- `<Image>` uses responsive `sizes` and priority for key items
- Panoramic banners can set per‑item display controls:
  - `bannerFit: "contain"`
  - `bannerAspect: "aspect-[21/9]"`
  - `objectPosition` for focal point
- A blurred cover layer renders behind “contain” images to avoid letterboxing

---

## SEO

- Per‑page `metadata` (title, description, canonical, OG/Twitter)
- Breadcrumb JSON‑LD emitted by `components/Breadcrumbs.tsx`
- Descriptive `alt` text and semantic headings

---

## Deployment

This project is deployed on [Vercel](https://vercel.com/) and served at **https://www.fuchs-sales.ca**.

---

## License

This repository is proprietary. No license is granted to use, modify, or redistribute the code or media assets without prior written permission from the copyright holder.

See `LICENSE`.

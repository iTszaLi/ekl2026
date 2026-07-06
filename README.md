# ENVOD KINGDOM SHIPPING SERVICES LLC

Fully static, bilingual (English / Arabic, LTR / RTL) marketing site for ENVOD KINGDOM SHIPPING SERVICES LLC — a cinematic marketing site with services catalog, industries pages, gallery, and contact.

- **Frontend** — React 19 + Vite, Tailwind CSS, framer-motion, wouter. Statically prerendered for SEO, with client-side hydration.
- **No backend** — no API server, no database, no admin CMS. All content is compiled into the static bundle; the contact form and quote modal open a pre-filled email draft (`mailto:`).

## Repository layout

```
artifacts/envod-kingdom/   React + Vite frontend (the site)
artifacts/mockup-sandbox/  Internal design-preview sandbox (not deployed)
scripts/                   Utility scripts
```

## Prerequisites

- **Node.js 24+**
- **pnpm 10** (`corepack enable` or `npm i -g pnpm`)

## Installation

```bash
pnpm install
```

No environment variables or secrets are required — the site is fully static.

## Development

```bash
# Frontend dev server (PORT and BASE_PATH are required by vite.config)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/envod-kingdom run dev
```

Other useful commands:

```bash
pnpm run typecheck   # full typecheck across all packages
```

## Production build

```bash
# Static output with all prerendered routes
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build
# → artifacts/envod-kingdom/dist/public
```

## Deploying to Cloudflare Pages

The site builds to plain static files with an SPA fallback via the included `_redirects` file — fully compatible with Cloudflare Pages.

**Pages project settings:**

| Setting | Value |
|---|---|
| Build command | `pnpm install --frozen-lockfile && BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build` |
| Build output directory | `artifacts/envod-kingdom/dist/public` |
| Environment variables | `NODE_VERSION=24` and `PNPM_VERSION=10` (the lockfile requires pnpm 10 — the Pages default pnpm cannot read it) |

No API or server hosting is needed — every page is served as a static file.

## Notes

- Quote/contact submissions open the visitor's mail app with a pre-filled draft to `info@envodkingdom.net` (subject "Quote Request").
- The track page shows a bilingual "online tracking available soon — contact operations" notice.
- `robots.txt` is a static file in `artifacts/envod-kingdom/public/`; `sitemap.xml` is generated at build time from `CONTENT_ROUTES` so it can never drift from the prerendered routes.

# ENVOD KINGDOM SHIPPING SERVICES LLC

Fully static, bilingual (English/Arabic, LTR/RTL) marketing site for ENVOD KINGDOM SHIPPING SERVICES LLC, featuring a cinematic homepage, services catalog, industries pages, gallery, and contact — built for static hosting (Cloudflare Pages compatible). No backend: no API server, no database, no admin CMS.

## Run & Operate

- `pnpm --filter @workspace/envod-kingdom run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Production build (SSG): `PORT=3000 BASE_PATH="/" pnpm --filter @workspace/envod-kingdom run build` → `dist/public` (client + prerendered pages) — static output, deployable to any static host
- No required env vars at runtime (fully static)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (SSG prerender via `prerender.mjs`), Tailwind CSS, framer-motion, wouter
- No server-side code; all content is compiled into the static bundle

## Where things live

- `artifacts/envod-kingdom/` — React + Vite frontend (the only artifact besides mockup-sandbox)
- `envod-kingdom-standalone/` — self-contained copy of the frontend for Cloudflare Pages (own pinned package.json, no workspace/catalog refs, builds with plain `pnpm install && pnpm build` → single `dist/`); NOT part of the pnpm workspace. If the monorepo frontend changes, re-sync `src/`, `public/`, `index.html`, and used `attached_assets` into it
- `artifacts/envod-kingdom/src/lib/service-data.ts` — static services catalog (source of truth for all 30+ service pages)
- `artifacts/envod-kingdom/src/lib/quote-mailto.ts` — shared `mailto:` builder for quote/contact forms (`info@envodkingdom.net`, subject "Quote Request")
- `artifacts/envod-kingdom/src/lib/seo-config.ts` — per-route SEO + `CONTENT_ROUTES` (must stay in sync with artifact.toml rewrites + sitemap; build asserts this)
- `artifacts/envod-kingdom/public/` — favicons, robots.txt, `_redirects` (SPA catch-all for static hosts), `_headers`, media

## Architecture decisions

- Fully static conversion (July 2026): Express API, PostgreSQL, object storage, and the admin CMS were all removed. Content that previously came from the DB now lives in static catalogs (`service-data.ts`) or is intentionally empty (gallery shows its curated empty state).
- Contact form + QuoteModal submit via `mailto:` links (formatted body, URL-length capped) — no inquiry API
- Track page keeps its search UI but shows a bilingual "online tracking available soon — contact operations" notice with tel/mailto buttons on submit
- Bilingual support via React context (`LanguageContext`) that toggles `dir="rtl"` on `document.documentElement`
- SSG: content routes are prerendered by `prerender.mjs`; non-content routes fall back to `spa.html`

## Product

- Cinematic homepage with hero videos, animated stats, services grid, testimonials, client logo wall
- Services catalog (static) with detail pages; industries pages; Vision 2030 page
- Track page (visual search + "available soon" notice)
- Gallery (static empty state)
- Contact page + multi-step QuoteModal, both via mailto to info@envodkingdom.net

## Brand

- Primary: `#0A2342` (deep navy)
- Secondary: `#D62828` (Saudi red)
- Logo: `attached_assets/image_1780437854819.png` (import via `@assets/` alias)
- Email: info@envodkingdom.net
- Phone / WhatsApp: +966 50 226 0256
- Fax: +966 11 238 0517
- P.O. Box: 2383
- Address: Prince Mansour Bin Abdulaziz Street, Al Malaz District, Riyadh 12831
- Live at: www.envodkingdom.net

## Gotchas

- Google Font imports in `index.css` must be the VERY FIRST lines before `@import "tailwindcss"`
- Never run `pnpm dev` at workspace root — use workflow restarts instead
- `CONTENT_ROUTES` in `seo-config.ts` ↔ artifact.toml `[[services.production.rewrites]]` ↔ sitemap must stay in sync (build asserts)
- Hero background videos (`public/media/{crane,air,warehouse}.{mp4,webm,jpg}`) had a baked-in grey sparkle removed via ffmpeg delogo; the ORIGINAL WebPs in `attached_assets/` still contain the watermark — clean before reusing source footage
- `src/lib/gallery.ts` still contains `/api/gallery/media/` URL helpers; they are dead at runtime (gallery item list is always empty) and kept only to avoid touching shared presentation code

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# ENVOD KINGDOM SHIPPING SERVICES LLC

Bilingual (English/Arabic, LTR/RTL) marketing site with prerendered content and an Express enquiry endpoint using the connected Resend service. No database or admin CMS. Static-only exports require a separately hosted enquiry API.

## Run & Operate

- `pnpm --filter @workspace/envod-kingdom run dev` — run Express with Vite middleware
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Production build (SSG): `PORT=3000 BASE_PATH="/" pnpm --filter @workspace/envod-kingdom run build` → `dist/public` (client + prerendered pages) — static output, deployable to any static host
- Production: `pnpm --filter @workspace/envod-kingdom run start`; requires the connected Resend service for enquiries.
- Enquiry setup, security limits and verification: `docs/enquiry-email-delivery.md`. The owner confirmed receipt of the earlier sample. The refined `[TEST]` preview returned HTTP 201/provider acceptance at 16:32 UTC on 17 October; receipt of this newest layout remains pending owner confirmation. Gmail/Outlook and published-deployment rendering remain unverified.
- Latest SEO continuation and full-brief coverage: `docs/seo-research/loading-stage-report.md`. This records a tested loading stage, not completion of the article programme or proof of production CWV/ranking gains.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (SSG prerender via `prerender.mjs`), Tailwind CSS, framer-motion, wouter
- Express serves prerendered content and validates/delivers enquiry emails; content remains compiled into the frontend.

## Where things live

- `artifacts/envod-kingdom/` — React + Vite frontend (the only artifact besides mockup-sandbox)
- `envod-kingdom-standalone/` — self-contained copy of the frontend for Cloudflare Pages (own pinned package.json, no workspace/catalog refs, builds with plain `pnpm install && pnpm build` → single `dist/`); NOT part of the pnpm workspace. If the monorepo frontend changes, re-sync `src/`, `public/`, `index.html`, and used `attached_assets` into it
- `artifacts/envod-kingdom/src/lib/service-data.ts` — static services catalog (source of truth for all 30+ service pages)
- `artifacts/envod-kingdom/src/lib/enquiry-api.ts` — frontend enquiry client; shared validation contract is in `enquiry-contract.ts`
- `artifacts/envod-kingdom/src/lib/seo-config.ts` — per-route SEO + `CONTENT_ROUTES`, used to generate prerendered pages and sitemap
- `artifacts/envod-kingdom/public/` — favicons, robots.txt, `_redirects` (SPA catch-all for static hosts), `_headers`, media

## Architecture decisions

- Following the July 2026 static conversion, server-side enquiry email delivery was approved in October 2026. Content remains static; no database or CMS was reintroduced.
- Contact, quote and shipment-status forms submit to the server; successful responses mean the provider accepted the message, not proof of inbox delivery.
- Contact and quote forms share the bilingual 14-category enquiry catalog, conditional service fields, per-category value preservation and strict server-side validation. Do not add a service option in only one form.
- Track page explicitly offers manual shipment-status requests, not live tracking.
- English routes are preserved; Arabic equivalents use `/ar`, reciprocal hreflang and RTL.
- SSG: content routes are prerendered by `prerender.mjs`; non-content routes fall back to `spa.html`

## Product

- Cinematic bilingual homepage with hero videos, shipment-planning content, service discovery and FAQs. Unsupported client, association and numerical trust claims must remain unpublished until documentary evidence is supplied.
- Services catalog (static) with detail pages; industries pages; Vision 2030 page
- Track page (manual shipment-status enquiry)
- Gallery (static empty state)
- Contact page + multi-step QuoteModal, both through the enquiry API to info@envodkingdom.net

## Brand

- Primary: `#0A2342` (deep navy)
- Secondary: `#D62828` (Saudi red)
- Logo: `attached_assets/image_1780437854819.png` (import via `@assets/` alias)
- Email: info@envodkingdom.net
- Calls: +966 58 367 1739
- WhatsApp: +966 50 226 0256
- Fax: +966 11 238 0517
- P.O. Box: 2383
- Address: Prince Mansour Bin Abdulaziz Street, Al Malaz District, Riyadh 12831
- Hours: Sunday–Thursday 8:00 AM–6:00 PM, Saturday 9:00 AM–2:00 PM, Friday closed. Label displayed times as Saudi Arabia local time (AST, UTC+3).
- Live at: www.envodkingdom.net

## Gotchas

- Google Font imports in `index.css` must be the VERY FIRST lines before `@import "tailwindcss"`
- Never run `pnpm dev` at workspace root — use workflow restarts instead
- `CONTENT_ROUTES` controls prerendering and sitemap generation. Production uses the Express server, not static artifact rewrites.
- Hero background videos (`public/media/{crane,air,warehouse}.{mp4,webm,jpg}`) had a baked-in grey sparkle removed via ffmpeg delogo; the ORIGINAL WebPs in `attached_assets/` still contain the watermark — clean before reusing source footage
- `src/lib/gallery.ts` still contains `/api/gallery/media/` URL helpers; they are dead at runtime (gallery item list is always empty) and kept only to avoid touching shared presentation code

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

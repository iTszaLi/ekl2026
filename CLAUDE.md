# ENVOD KINGDOM: instructions for Claude Code

This repository powers the **live production website** https://www.envodkingdom.net for ENVOD KINGDOM SHIPPING SERVICES LLC, a logistics and freight-forwarding company in Riyadh, Saudi Arabia.

- GitHub (`iTszaLi/ekl2026`) is the source of truth.
- Vercel (project `ekl2026-envod-kingdom`, root directory `artifacts/envod-kingdom`) is the host.
- Every merge to `main` deploys to production automatically.

## Non-negotiable rules

- **Additive by default.** Never delete or rewrite existing pages, sections, service descriptions, locations, media, branding, URLs or Arabic/English routes without the owner's explicit approval. Propose the change and its reasons first.
- **Never push to `main`.** Work on `claude/<topic>` branches and open a pull request. Only the owner merges.
- **Never run `vercel --prod`.** Never change Vercel domains, build settings or environment variables. Never delete branches or deployments.
- **No destructive git or file operations** (`reset --hard`, force push, `clean -fd`, deleting directories) without checking the impact and getting approval. Preserve any uncommitted work you find and report it.
- **Secrets:**
  - Never print, log, commit or paste environment-variable values.
  - Never put a secret in a `VITE_` variable.
  - Do not commit `.env*` files; only `.env.example` is allowed.
- **No paid API calls** (DataForSEO, etc.), recurring jobs or paid services without explicit owner approval and an agreed budget cap.
- **Never invent data.** No made-up rankings, search volumes, traffic, backlinks, client names or business claims. Label every metric with its source and date; if data is unavailable, say "Unavailable".

## Content and claims policy

- Follow `.agents/memory/organic-growth-policy.md`. It contains the owner-confirmed figures:
  - 98% on-time delivery
  - 50+ fleet vehicles
  - 100% shipment tracking (this does **not** mean a live tracking portal exists)
  - 24/7 support
- Use hedged customs and transit wording: release and approvals rest with the authorities, and scope is confirmed per shipment.
- Do not use superlatives or guarantees.
- **Always edit English and Arabic together.** Arabic lives under `/ar` with `dir="rtl"`.
- Affiliations:
  - WCAworld is a membership.
  - JCtrans, WCA Events, PCN and FIATA are affiliations.
  - Never imply endorsement.
- Service-page priority order:
  1. Exhibition & Event Logistics
  2. House Moving & Relocation
  3. Customs Clearance
  4. ATA Carnet
  5. GCC Transportation
- Contact details:
  - Calls: +966 58 367 1739
  - WhatsApp: +966 50 226 0256
  - Email: info@envodkingdom.net
  - Address: Prince Mansour Bin Abdulaziz St, Al Malaz, Riyadh 12831

## Architecture (quick map)

- `artifacts/envod-kingdom/`: the website, built with React 19, Vite 7, Tailwind 4, wouter and framer-motion.
  - `src/lib/service-data.ts`: the service catalogue.
  - `src/lib/seo-config.ts`: per-route SEO, JSON-LD and `CONTENT_ROUTES`. This list drives prerendering **and** `sitemap.xml`.
  - `prerender.mjs`: static HTML for all content routes (currently 94: 47 EN + 47 AR), plus `spa.html` and `sitemap.xml`.
  - `api/enquiries.ts`: Vercel function that sends enquiries by email through Resend.
  - `api/search-console/[...path].js`: **generated** by `scripts/build-vercel-search-console.mjs` from `server/search-console/*`. Edit the TypeScript source, never the bundle.
  - `server/`: shared server code and tests. `server/index.ts` is the Express app for local/Replit use only; it does not run on Vercel.
  - `vercel.json`: redirects, admin rewrites, security headers. The CSP also lives in `prerender.mjs` and `public/_headers`; change all three together.
- `artifacts/mockup-sandbox/`: Replit design sandbox, not deployed.
- JSON-LD is defined in `index.html` (Organization, LocalBusiness, WebSite) **and** in `seo-config.ts`. Keep the two consistent.
- Private admin: `/admin/search-console`.
  - Google OAuth for a single allowlisted email.
  - Tokens are encrypted and stored in private Vercel Blob storage.
  - The route must stay `noindex` and `no-store`.

## Commands (run from repo root unless noted)

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm --filter @workspace/envod-kingdom run build   # prebuild + client + SSR + prerender + SEO route tests (Vercel runs this)
pnpm run test                                      # ALL tests: unit tests + checks on the built dist/ (run after a build)
pnpm --filter @workspace/envod-kingdom run test:unit   # server/**/*.test.ts only (no build needed)
pnpm --filter @workspace/envod-kingdom run test:dist   # SEO routes, counters, image dimensions (needs dist/)
```

- GitHub Actions (`.github/workflows/ci.yml`) runs the install, typecheck, build and all tests on every pull request, on Linux x64 (the same platform as Vercel).
- A pull request should not be proposed for merge while CI is red.

### Windows notes (this PC is Windows ARM64)

These now work out of the box:
- `prerender.mjs` imports the SSR bundle via `pathToFileURL`.
- The `win32-arm64` native binaries (Rollup, LightningCSS, Tailwind oxide, esbuild) are no longer stripped by the overrides in `pnpm-workspace.yaml`.
- The `0o600` file-mode assertion in `search-console.test.ts` is skipped only on Windows.

Two remaining caveats:
- **Git Bash rewrites `BASE_PATH=/`** into `C:/Program Files/Git/`. `vite.config.ts` now refuses to build with a clear error in that case. Either leave `BASE_PATH` unset (it defaults to `/`) or prefix the command with `MSYS_NO_PATHCONV=1`.
- **Entry-bundle hashes differ between a Windows ARM64 build and Vercel's Linux x64 build.** The native CSS compiler rounds the last digits of a few `oklab()` colour values differently, which changes the chunk hashes. The HTML content is identical. Compare content, not hashes, or rely on CI.

## Definition of done (every task)

1. Typecheck passes; `pnpm run test` passes after a production build, and so does CI. Report the actual output.
2. The route count is unchanged or higher, and existing EN and AR routes still prerender with their full content.
3. Canonical tags are self-referencing; `hreflang` is `en-SA`/`ar-SA`/`x-default` and reciprocal; there is one H1 per page; the sitemap is updated.
4. Internal links resolve. Images have alt text and width/height; videos still play.
5. Check mobile layout, browser console errors and RTL layout on the Vercel **preview** URL.
6. No existing content has disappeared. Diff the prerendered HTML in `dist/public` against a build of `main` when touching shared components.
7. Mark anything you did not test as **unverified** (for example physical iPhone/Android playback, email inbox delivery, live Search Console data).

## Workflow

1. `git checkout main && git pull`, then `git checkout -b claude/<topic>`.
2. Make small commits. End each commit message with the attribution line.
3. Push with `git push -u origin claude/<topic>`, open a PR, wait for CI to pass, check the Vercel preview, and report results to the owner.
4. The owner reviews and merges. Afterwards, verify production over HTTP and report.

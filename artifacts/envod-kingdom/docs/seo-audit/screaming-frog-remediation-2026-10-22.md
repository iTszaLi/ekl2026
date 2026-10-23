# ENVOD KINGDOM — Screaming Frog remediation and release verification

**Audit date:** 2026-10-22
**Decision:** **NOT READY for production release**
**Scope:** Read-only checks of the published website plus changes and testing in the isolated Replit review copy only. No production, GitHub, Vercel, DNS, or email-provider changes were made.

## Executive summary

The supplied 2026-10-21 crawl snapshot is only partly representative of the current published site. The live XML sitemap contains 43 English URLs, all of which returned 200 in the recorded crawl. A further 49 expected candidate routes—46 Arabic routes and three legal routes—return 404. The published homepage also throws React hydration error **#418** in a real browser. The production source is the separate `iTszaLi/ekl2026` Vercel repository, not this review copy.

The review build is a separate, improved candidate: it prerenders 92 crawlable routes (46 English and 46 Arabic), has unique titles and descriptions, correct self-canonicals and reciprocal `en-SA`/`ar-SA`/`x-default` alternates, and passes the checks listed below. I fixed two confirmed issues in this copy: missing intrinsic image dimensions and nondeterministic particle rendering that caused hydration failure. The candidate then loaded all 12 tested routes without browser exceptions. **Neither fix is on the published site.**

Production release remains blocked by route/source mismatch, the live homepage hydration error, absent sampled security headers, and production enquiry API paths returning 404. Mobile lab performance also needs further investigation. No ranking, indexing, backlink, or AI-answer visibility outcome is claimed.

## Baseline and source boundary

- The review workspace is `iTszaLi/envodkingdom`, branch `main`, at `ffe7077fd86ea952f74311ea703a14d190ecb399` when this audit began.
- Vercel identifies `iTszaLi/ekl2026` and commit `cf44867` as the published source. It is a different repository/source line.
- The review workspace already had unrelated uncommitted work. This audit created no commit and did not reset, overwrite, or promote that work.
- All code changes below are confined to the review copy. The public-domain checks were GET/browser reads only.

## Finding-by-finding reconciliation

| Finding | Live-site evidence | Review-copy result and action |
|---|---|---|
| Crawl scope and status codes | The current sitemap has 43 unique English URLs. The recorded crawl returned 200 for all 43. The separately inventoried 46 `/ar/` routes and three legal routes return 404; spot checks of `/ar` and `/ar/services/customs-clearance` confirmed this. | 92 public routes are prerendered: 46 English and 46 Arabic. All 92 have generated HTML. Exact route-by-route evidence is in `production-parity-route-inventory.csv` and `local-build-route-audit.csv`. |
| Homepage hydration | A direct production browser load throws minified React error #418 on `/`. The reviewed service and contact routes loaded without that error. | The homepage error reproduced before the fix. Render-time `Math.random()` in the scroll-animation particles/keyframes made server and client markup differ. Replacing it with deterministic values removed browser exceptions on the tested English and Arabic routes. |
| Canonicals and language alternates | The 43 crawled sitemap pages were self-canonical on the `www` host. HTTPS bare and `www` hosts both currently return 200; HTTP variants return 308 to their respective HTTPS host. | All 92 routes have one matching self-canonical and a reciprocal `en-SA`, `ar-SA`, and `x-default` set. The generated sitemap contains 92 unique URLs and matching language annotations. No `lastmod` is emitted because reliable per-page edit dates are unavailable. |
| Titles and descriptions | The current production inventory records 6 titles over 60 characters, 33 descriptions over 160 characters, and 6 descriptions under 120 characters; values are unique. | On the 43 common routes, 1 candidate title is over 60 characters and 10 descriptions are over 160. Across all 92 candidate routes, titles and descriptions are non-empty and unique. Character counts are editorial signals, not ranking rules; no copy was truncated just to hit a limit. See `seo-metadata-inventory.csv`. |
| Headings and readable content | The supplied baseline reports 26 duplicate-H2 pages, one hierarchy issue, three low-content pages, and readability flags, but no URL-level issue export was attached to verify those findings in context. | All 92 candidate pages have exactly one H1 and the generated HTML has no repeated H2 within a route. This does not validate the supplied live readability flags or prove user comprehension. No filler copy was added. |
| Alternative text | Production crawl: 565 image elements, none missing an `alt` attribute. 70 occurrences across 35 unique sources have an explicitly empty `alt`; the contact-sheet review found many are decorative or duplicate nearby card text. | All 532 candidate image elements have an `alt` attribute. Empty alt remains appropriate for decorative images; unique image information should be described only when not already conveyed in text. |
| Image dimensions | The production crawl found all 565 image elements lacked explicit width/height. The live inventory measured 84 unique assets; 21 exceed 102,400 bytes. | Before remediation, 346/532 candidate images lacked dimensions. The change supplies measured intrinsic dimensions to 508/532; the remaining 24 are inline client-logo images in fixed-size frames. `test:image-dimensions` verifies this across the prerendered HTML. |
| Large/LCP images | Existing live assets are already WebP or PNG; the inventory records their dimensions and bytes. No image was recompressed without measured evidence that the quality tradeoff would help. | The mobile lab run identified the customs hero (`1536×1024`, 106,158 bytes) and exhibition hero (`1024×683`, 157,436 bytes) among the slowest LCP elements. Keep current quality pending a responsive-size comparison. |
| Structured data | Contrary to the supplied “none found” claim, the live crawl detected Organization, LocalBusiness, MovingCompany, WebSite, BreadcrumbList, Service, FAQPage, WebPage and related types. | 510 JSON-LD blocks across the candidate HTML parse without JSON syntax errors. No `aggregateRating` or `review` markup is present. This is syntax validation, not a Rich Results Test or a full semantic/factual validation. |
| XML sitemap | `/sitemap.xml` returns 200 XML, is declared in `robots.txt`, and contains 43 production URLs. All production `lastmod` values were the same date, `2026-07-06`; that is not evidence each page was edited then. | Candidate sitemap contains 92 routes (46 English, 46 Arabic), is linked from `robots.txt`, and deliberately omits `lastmod` rather than inventing dates. Do not add the missing routes to production until they actually return the intended pages. |
| Robots and AI crawlers | Production `robots.txt` says `User-agent: *` / `Allow: /` and names the sitemap. No crawl block was observed. | The review copy explicitly allows Bingbot, Googlebot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, and PerplexityBot, as well as other crawlers. This establishes crawl permission only; it does not guarantee indexing or AI citations. |
| Security headers | Sampled production homepage, service/contact pages, robots, and sitemap responses include HSTS (`max-age=63072000`) but no CSP, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy. The sample does not establish every response. | No response-header or deployment configuration was changed. The repository’s static `_headers` file is not a substitute for Vercel response-header configuration. Any production policy needs source/hosting-owner approval and testing against the existing CSP dependencies. |
| Performance | Google PageSpeed API returned 429 because the available project quota is zero. No field Core Web Vitals or Search Console performance export was available for this check. | Synthetic Chrome lab run on the local production build tested 12 English/Arabic routes at desktop and mobile sizes. With mobile emulated at 4× CPU slowdown, 150 ms latency, and about 1.6 Mbps, median LCP was 7.312 s (maximum 9.592 s); median transfer was about 1.2 MiB. Desktop median LCP was 1.576 s (maximum 2.632 s). Maximum CLS was 0.0806 on mobile, with no horizontal overflow on the tested routes. These are constrained lab measurements, **not** field CWV or official PageSpeed results. No user interaction was performed, so INP was not measured. |
| Indexing and links | HTTP 200, robots permission, and sitemap presence do not establish indexation. No URL Inspection result or verified backlink/referring-domain export was available. | No indexing request or link-building action was made. Search Console/Bing indexing, actual inbound links, rankings, and AI-answer citations remain unverified. |
| Enquiry delivery | Production read-only probes of `/api/health`, `/api/healthz`, `/api/enquiries`, and `/api/quote` returned 404. No live enquiry was submitted. | Review-copy enquiry tests passed; this does not make the static Vercel production site operational. Backend routing and Resend acceptance must be verified at the deployed source before claiming live delivery. |

## Changes made in the review copy

1. Added a measured asset-dimension map and applied the intrinsic width/height values to existing image elements in service, industry, exhibition, client-marquee, and scroll-animation components. The dimensions preserve the existing rendered designs and reserve layout space.
2. Added `test:image-dimensions` to check prerendered pages for alt attributes and measured dimensions, with a documented exception for inline logos already contained in fixed-size frames.
3. Made decorative scroll-animation particle positions and keyframes deterministic. This resolved the locally reproduced homepage hydration error without changing the motion concept or page content.
4. Added this report; earlier audit inventories remain the detailed URL/asset evidence rather than being overwritten.

No production URLs, copy, email recipients, forms, headers, robots rules, sitemap, DNS, deployment settings, or Vercel repository were changed.

## Verification

- `pnpm --filter @workspace/envod-kingdom run build` — passed; prerendered 93 routes plus SPA shell and a 92-URL sitemap. Existing tooltip/select source-map warnings remain; Vite also warns that the 998.85 KB raw / 306.87 KB gzip main chunk exceeds its 500 KB advisory threshold.
- `typecheck` workflow — finished successfully across the workspace.
- `test:image-dimensions` — passed: 94 generated HTML documents checked; 508/532 images have explicit measured dimensions; the other 24 are inline logos in fixed-size frames; no image omits the `alt` attribute.
- `test:counters` — passed across 94 generated HTML documents.
- `test:enquiries` — 16/16 passed, including validation, honeypot, rate limits, provider rejection/timeout, retry idempotency, and service-specific payloads.
- `test:search-console` — 5/5 passed.
- Generated HTML check — 92 sitemap routes, 92 unique titles, 92 unique descriptions, one H1 per route, correct canonical on every route, all three expected language alternates per route, and zero JSON-LD parse errors.
- Browser test — all 12 candidate routes tested after the hydration fix loaded without browser exceptions. A separate read-only browser check confirmed the published homepage still throws #418 and the sampled `/ar` routes are 404.
- Desktop and mobile screenshots — reviewed the homepage and Arabic customs page. No horizontal overflow was observed in the lab routes. The fixed phone/WhatsApp buttons overlap the lower Arabic-page paragraph at the captured mobile viewport; record this for responsive review.

## Remaining release blockers

1. **Source alignment:** this candidate is not the Vercel source. Review the intended changes in the correct source repository/workspace before any release.
2. **Production route parity:** decide which of the 46 Arabic and three legal routes must be restored, then verify live 200 responses, canonicals, language alternates, and sitemap membership.
3. **Live hydration:** fix and retest the published homepage’s React #418 in the Vercel source. The review-copy fix has not been deployed.
4. **Production enquiry backend:** the tested API paths currently return 404 on the public site. Route the forms to a deployed backend and run an authorized, labeled acceptance test before claiming delivery.
5. **Vercel security policy:** configure and verify missing response headers only after the production source and hosting configuration are explicitly in scope.
6. **Performance:** obtain an authorized PageSpeed/Lighthouse run and field CWV data; investigate the large main bundle and mobile hero LCP. The present constrained lab results do not establish real-user performance.
7. **Indexing and authority evidence:** connect/authorize Search Console or Bing Webmaster data and provide actual URL Inspection and backlink exports before reporting indexation, rankings, or link growth.
8. **Responsive review:** inspect the fixed contact buttons against Arabic body text and complete a full accessibility review.
9. **Release hygiene:** the workspace had pre-existing uncommitted changes; no clean commit or release branch was created during this review.

**Release decision: NOT READY.** The local review build passes its scoped checks, but it is not the published source and the public site has verified release blockers. No deployment is recommended from this review copy.

## Evidence files

- `screaming-frog-findings-reconciliation.csv`
- `production-parity-audit.md`
- `production-parity-route-inventory.csv`
- `local-build-route-audit.csv`
- `seo-metadata-inventory.csv`
- `heading-audit.csv`
- `sitemap-audit.csv`
- `production-image-elements.csv`
- `production-image-assets.csv`
- `local-build-image-inventory.csv`
- `seo-validation-results.md`

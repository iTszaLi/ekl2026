# Implementation and validation results

## Changes made in the Replit review copy

- Added a private Search Console dashboard route at `/admin/search-console`. It is excluded from the public sitemap and prerendered with `noindex`.
- Added server-side Google OAuth and Search Console API handling. The browser does not receive OAuth client credentials or tokens.
- Limited the Google data scope to `webmasters.readonly` plus the identity scopes needed to verify the administrator. The configured Google account must match `GSC_ADMIN_EMAIL`.
- Added signed, `HttpOnly`, `SameSite=Lax` admin sessions, encrypted AES-256-GCM refresh-token storage derived from the existing `SESSION_SECRET`, exact-property validation, bounded Search Analytics requests, five-minute dashboard caching, and a maximum of ten URL Inspection requests per batch.
- Added a read-only production crawler that checks robots.txt first, follows the declared sitemap, stays on the ENVOD host allowlist, limits the crawl to 300 URLs and does not change pages or submit indexing requests.
- Added filterable/sortable/paginated dashboard tables, query-to-page rows returned by Google's query+page dimension, safe inspection actions for returned URLs, CSV export, period comparison and explicit caveats about average position and incomplete/anonymized data.
- Lazy-loaded the private dashboard so its JavaScript is not part of the homepage's initial module preload.
- Added the Google OAuth setup guide and audit reports in this `docs/` directory.
- Fixed review-copy counter defaults so the final display is present before animation and for reduced-motion users; replaced unsubstantiated general shipment/client/country counts with capability wording and removed the generic 24-hour customs KPI.
- Corrected the review-copy experience heading from “A Decade” to “More Than 25 Years” to match the owner-supplied hero statement.
- Applied wide-card layout to the requested Exhibition Logistics, Customs Clearance and House Moving & Relocation cards; lightened the two featured image overlays while retaining text contrast, all catalog services and Door-to-Door.
- Added route, metadata, keyword, image, claim and supplied Screaming Frog reconciliation inventories. No public page copy, established English path, production sitemap, DNS, Vercel setting, GitHub remote or production deployment was changed.

## Validation actually run

| Command/check | Result |
|---|---|
| `pnpm run typecheck` | Passed for workspace libraries, `artifacts/envod-kingdom`, mockup sandbox and scripts |
| `pnpm --filter @workspace/envod-kingdom run test:search-console` | Passed: 5 tests, including session allowlisting/expiry, encrypted token storage, Search Analytics bounds, sanitized provider errors and robots-aware crawl |
| `pnpm --filter @workspace/envod-kingdom run test:enquiries` | Passed: 16 tests covering complete enquiry payloads, validation, honeypot, rate limits, provider acceptance/failure, retry idempotency and exhibition-specific submissions |
| `pnpm --filter @workspace/envod-kingdom run build` | Passed: client + server build and prerender completed; 93 routes generated and 92 public sitemap URLs written |
| Review-copy static route audit | 92/92 sitemap pages present; 46 English + 46 Arabic; unique title/description/canonical, one H1 and correct three-way hreflang pairing on each page; no missing local links/fragments/assets; 510 JSON-LD blocks parse |
| Review-copy image audit | 532 image elements; 0 missing `alt` attributes, 142 empty-alt occurrences, and 346 without explicit width/height; natural dimensions/file sizes are inventoried where local assets were resolved |
| Review-copy counters | Prerendered English/Arabic HTML contains nonzero final defaults; “A Decade” and unsupported 10,000+ / 500+ clients / 50+ countries values are absent from the affected statistics; count-up and reduced-motion behavior were checked in source |
| Review-copy services layout | Exhibition Logistics, Customs Clearance and House Moving & Relocation are configured as wide cards; all 24 catalog services plus Door-to-Door remain |
| Search Console route runtime check | `/session` returns `configured: false` without disclosing credentials; unauthenticated dashboard, crawl and URL-inspection requests return HTTP 401 |
| Production HTTP crawl | Read-only: 43/43 sitemap HTML pages fetched as HTTP 200 on October 22; 49 expected Arabic/legal routes separately return 404 |
| Expected Arabic route check | 46/46 returned HTTP 404 on the public domain |
| English legal route check | 3/3 returned HTTP 404 on the public domain |
| Robots/sitemap check | Both HTTP 200; robots permits all user agents; sitemap has 43 URLs and a declared location |
| Production image audit | 565 image elements across 43 pages; 0 missing `alt` attributes; 70 empty-alt occurrences across 35 unique sources; all image elements lack explicit width/height; 21/84 unique fetched assets exceed 100 KB |
| Production headers | HSTS present; CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy absent on sampled responses |
| Search Console live authorization | Not run: Google OAuth client secrets and owner authorization are not yet configured |
| Real provider email test | Not run in this audit; no additional email was sent |
| Lighthouse/PageSpeed | No result; Google PageSpeed API returned HTTP 429 because this project has zero daily quota |
| Core Web Vitals/Bing Webmaster/AI answer citations | Not measured; no field data or authorized reporting source was available |

The local development tests do not establish that the dashboard is connected to Google, that the production site has these changes, or that any search engine indexed a route.

The production build still emits non-blocking source-map warnings for the shared tooltip/select components and a chunk-size warning. The main shared JavaScript chunk is 998.8 KB raw (306.8 KB gzip-estimated); the dashboard is isolated in a 45.7 KB raw (13.1 KB gzip-estimated) chunk. No field Core Web Vitals or PageSpeed result was measured. Desktop and mobile screenshots were reviewed for the homepage; the full-page screenshot exceeded the capture tool's 8,000-pixel limit, so deeper-page visual review is limited to route HTML and targeted build checks.

## Required external setup

1. Enable the Google Search Console API and create a Google OAuth Web application.
2. Register the exact Replit callback shown in [`../search-console-dashboard-setup.md`](../search-console-dashboard-setup.md).
3. Add `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, and `GSC_ADMIN_EMAIL` through Replit Secrets. Keep the existing `SESSION_SECRET`; never paste any secret into chat.
4. Complete Google authorization with the allowlisted account and select the exact ENVOD Search Console property.

The review-copy encrypted token file is workspace-local and is not a production persistence strategy. Production deployment remains out of scope and requires a separately approved source/configuration review.

## Addendum 2 — source audit and data findings

### Work completed in this addendum

- Searched the accessible workspace, attached files, generated-artifact directories and 13 archives for the requested backlink, keyword, GSC and Screaming Frog inputs. The original `export.csv`, `e1.csv`, `e2.csv`, GSC Performance screenshot, `issues_overview_report.csv`, and `crawl_overview.csv` were not found.
- Added [`source-file-inventory.csv`](./source-file-inventory.csv) with exact paths, file sizes, SHA-256 checksums, row counts, fields, copy identity, and limitations for available inputs and missing expected sources.
- Added [`keyword-source-reconciliation.csv`](./keyword-source-reconciliation.csv). It preserves the 2,400-row uploaded candidate master, 2,395-row Planner seed list, 1,306-row pre-upload snapshot, 292-row historical derivative, 192-row prompt-review derivative, and 2,935-row derived map as separate dataset identities.
- Expanded [`keyword-map.csv`](./keyword-map.csv) with explicit source identity, historical priority, implementation priority, route-verification, ranking-data and implementation-status fields. Eight exact language/phrase overlaps across routes receive stable review cluster IDs; they are retained rather than silently merged.
- Rebuilt [`gsc-opportunity-analysis.csv`](./gsc-opportunity-analysis.csv) from the four owner-reported query examples. Reported clicks/impressions remain separate from blank actual GSC fields; candidate URLs are labelled as manual-review candidates, never actual landing pages.
- Updated [`gsc-baseline-owner-reported.csv`](./gsc-baseline-owner-reported.csv) to state that the screenshot/export was not found and that the reported aggregate CTR is consistent with the approximate arithmetic only.
- Added [`target-query-strategy.csv`](./target-query-strategy.csv) for broad, city, service and comparative candidates. It maps to existing routes only where a route can be verified and records the `/ar/` production 404 state separately.
- Added [`serpok-reported-keyword-estimates.csv`](./serpok-reported-keyword-estimates.csv) to keep the three different owner-supplied estimates for “logistics company in Saudi Arabia” separate; none was promoted into a Google or verified-demand metric.
- Expanded [`backlink-review.csv`](./backlink-review.csv) into a row-level review schema while keeping it header-only; no backlink records were invented.
- Updated [`backlink-risk-review.md`](./backlink-risk-review.md), [`seo-remediation-plan.md`](./seo-remediation-plan.md), and [`source-evidence-register.csv`](./source-evidence-register.csv). Added [`owner-data-request.md`](./owner-data-request.md) with the exact remaining exports and settings needed.
- Verified official Google documentation URLs for Search Console Performance, disavow guidance, spam policies, helpful content, and AI features by successful public fetch (HTTP 200 on 2026-10-22).

### Verified dataset calculations

- The four attached bilingual-master CSVs are content-identical: each has 2,400 rows (1,200 English and 1,200 Arabic), with 2,395 unique normalized language/phrase pairs and five repeated exact pairs. Every search-volume and keyword-difficulty value is `Not measured`.
- The three attached Planner CSVs are content-identical: each has 2,395 unique phrase rows and one `Keyword` field. Their normalized phrase set exactly matches the deduplicated phrase set from the bilingual master; they are seeds, not Planner results.
- The six attached XLSX files are byte-identical, each 325,812 bytes with 27 sheets and a 2,400-row Master Keywords sheet.
- The existing derived map has 2,935 rows (1,460 English, 1,475 Arabic) and 2,927 unique normalized language/phrase pairs. Sixteen rows form eight exact phrase/language clusters mapped to multiple routes. All demand, difficulty and GSC metrics remain unmeasured/blank. The October 22 route audit recorded 1,553 mapped routes as HTTP 200 and 1,382 as HTTP 404.
- The owner-reported aggregate CTR check is 139 / approximately 4,130 = approximately 3.36%, consistent with the stated 3.4% after rounding. No query-level CTR, average position, URL, country, device, or exact reporting period was inferred.
- SerpOK values are explicitly third-party and provisional. The Addendum estimate (KSA 153/global 510/KD 29), Shaker observation (KSA 82/KD 36), and Globus observation (KSA 153/KD 47) are not reconciled because their original records, date and database settings are unavailable.

### What was not implemented or verified

- No website source code or page copy was changed in this addendum. The missing GSC, backlink and crawl exports do not support speculative content changes; the confirmed live technical findings involve the separate Vercel production repository and remain under the existing source-alignment/release safeguard.
- Search Console is not connected for this review; its private dashboard remains unconfigured. No Manual Actions report was inspected.
- No backlink page was human-inspected, contacted, removed, or disavowed.
- No IndexNow/Bing submission, production push, Vercel deployment, DNS change, or production search-index claim was made.
- Search performance, actual query-to-page mapping, rankings, link health, field Core Web Vitals, Bing visibility, and AI-answer citations remain unverified.

### Next input required

See [`owner-data-request.md`](./owner-data-request.md). The highest-value next input is the GSC Query and Pages exports for matching six-month periods, followed by the original backlink and Screaming Frog exports and the exact `e1.csv`/`e2.csv` source files.

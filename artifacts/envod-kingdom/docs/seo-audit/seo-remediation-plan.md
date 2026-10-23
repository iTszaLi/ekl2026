# SEO remediation plan

This is a review-copy plan. Items that affect the public site remain unimplemented until the owner approves the correct production source and deployment.

| Priority | Finding | Recommended action | Evidence / gate |
|---|---|---|---|
| P0 | Replit review source and Vercel source are different repositories | Keep work isolated in `iTszaLi/envodkingdom`; reconcile with the Vercel production repository before release | Owner supplied Vercel source `iTszaLi/ekl2026`; no Vercel integration or deploy was used |
| P0 | Search Console performance is not connected | Create the Google OAuth Web client, add the required values through Replit Secrets, authorize the allowlisted Google account, and select the exact ENVOD property | See `../search-console-dashboard-setup.md`; no live API response yet |
| P1 | 46 expected Arabic URLs currently return 404 on production | Review the complete Arabic content in the selected source; verify reciprocal EN/AR canonical and hreflang pairs, RTL behavior, internal links and sitemap before a production release | All 46 paths checked returned 404; review-copy route configuration contains Arabic routes |
| P1 | Three English legal routes return 404 | Decide whether the legal pages should be published at these established paths or whether the site's current legal paths are different; update public internal links only after confirming the correct production source | `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy` each returned 404 |
| P1 | HTTPS apex serves a 200 response while the canonical/sitemap host is `www` | Set and verify one preferred-host redirect in the actual Vercel production project; keep canonical and sitemap host consistent | `https://envodkingdom.net/` was 200/no redirect and declared the `www` canonical |
| P1 | Sitemap has no language alternates and one shared `lastmod` date | After Arabic publication is approved, include only working, indexable URLs and reciprocal alternates; use truthful page-level modification dates, not a blanket build date | 43 entries, zero sitemap alternates, all `lastmod` values `2026-07-06` |
| P1 | 70 production image elements lack `alt` attributes | Review each image as informative or decorative; add concise factual alt text only for informative images and empty alt for decorative images | 37 of the 43 crawled URLs have one or more missing attributes |
| P2 | Metadata snippets need editorial review | Review six long titles and descriptions outside the 120–160-character triage band for accuracy, distinctiveness and customer usefulness; do not shorten mechanically | All 43 titles/descriptions are present and unique; lengths are not ranking limits |
| P2 | Some pages have fewer than 300 extracted words | Review whether each page answers its own user need; add useful process/requirements/limits where factual, without word-count filler | Eight URLs below 300 extracted words; 300 is not a target |
| P2 | 346 review-build images lack explicit dimensions | Add intrinsic width/height or aspect-ratio constraints where known, then verify responsive crops and layout stability | Current local build; this is separate from the live missing-alt finding |
| P2 | Structured data is site-wide and extensive | Validate JSON-LD syntax and schema properties, ensure FAQ markup exactly matches visible Q&A, and verify each LocalBusiness claim before deployment | Types detected in HTML; this crawl did not run Google's rich-results eligibility tests |
| P2 | Conversion events have no active analytics collector | Decide whether to connect a consent-aware analytics service; test event delivery separately from button clicks and email-provider acceptance | Event bridge is present; no provider script or server-side analytics connection found |
| P2 | Main shared JavaScript bundle remains large | Profile the existing shared bundle and defer only non-critical modules after measuring mobile performance; retain the current animation and form behavior | Build reports 998.8 KB raw / 306.8 KB gzip for the main shared chunk; this is not field Core Web Vitals |
| P2 | Search and backlink datasets are incomplete | Provide Search Console/Keyword Planner results and a raw backlink export through authorized workflows; preserve source dates and report metrics as separate observations | See evidence register and backlink review |
| P3 | Competitor and SERP coverage is partial | Refresh a Saudi-localized English/Arabic SERP sample in a verified research tool; keep direct observations separate from hypotheses and tool estimates | Search/fetch tool returned 402; older page sample is dated 2026-10-17/18 |
| P3 | Original AEO/GEO resources could improve answer usefulness | Prioritize a small number of genuinely useful customs-document, exhibition-shipment and GCC route guides with citations, visible authorship and reviewed Arabic—not mass-generated pages | No measured queries or verified author credentials supplied |
| P3 | IndexNow/Bing outcomes are unverified | After production routes are corrected and owner approves release, verify Bing Webmaster ownership, IndexNow key ownership and submission responses | No Bing Webmaster access or verified IndexNow response available; this audit sent no pings |

## Release gates

1. Confirm the exact Vercel source repository and working deployment configuration.
2. Complete and review the current Arabic route set; do not expose unfinished translations.
3. Confirm each legal route and the preferred hostname behavior.
4. Run the full public route, form, mobile, accessibility and structured-data checks against the approved preview.
5. Obtain owner approval before any production push, deployment, DNS edit, sitemap submission or IndexNow ping.

## Addendum 2 — evidence-linked triage

The primary inputs are not all available. The original GSC screenshot, backlink `export.csv`, keyword `e1.csv`/`e2.csv`, and Screaming Frog `issues_overview_report.csv`/`crawl_overview.csv` were not found in the accessible project or 13 scanned archives. Do not treat derived or similarly sized files as substitutes. See [`source-file-inventory.csv`](./source-file-inventory.csv), [`keyword-source-reconciliation.csv`](./keyword-source-reconciliation.csv), and [`owner-data-request.md`](./owner-data-request.md).

| Priority | Finding and evidence | Action | Risk / verification |
|---|---|---|---|
| P0 — source alignment | Review workspace and Vercel production source are separate; public fixes cannot be called live. | Keep edits in the review copy until the production repository, preview, and release approval are established. | No production code, DNS, deployment, Search Console submission, or external backlink change was made in this addendum. |
| P1 — confirmed route readiness | October 22 direct crawl: 46 Arabic and three English legal candidate routes return HTTP 404; current sitemap has 43 English URLs. | Resolve production routing and review translations/legal destinations before any `/ar/` sitemap or internal-link release. | Verify the exact approved Vercel source and fetch every intended URL after an approved deployment; HTTP response is not proof of indexation. |
| P1 — GSC data required | Owner-reported aggregate: 139 clicks, approximately 4.13K impressions, 3.4% CTR, position 17.4. Four query examples lack their actual pages, per-query positions, dates, and filters. | Obtain matching query and page exports for the latest three full months and preceding three full months; then join queries to actual page URLs. | Keep actual GSC fields blank until exports or authorized API results exist. The 22/4/3 impression examples do not justify standalone page rewrites. |
| P1 — target-query mapping | The owner’s primary and secondary phrases map to existing homepage/service routes as candidates; actual GSC landing URLs are unknown. | Use [`target-query-strategy.csv`](./target-query-strategy.csv) for review. Improve an existing page only after matching intent, route, capability, and measured evidence. | Do not create competing city pages. Do not publish unsupported “best”, “top”, ATA Carnet, clearance-time, or port-coverage claims. |
| P1 — backlink evidence | 386 records, approximately 382 domains and associated patterns are provisional owner-reported counts; no raw rows or Manual Actions status. | Obtain the original backlink export; inspect actual context and campaign history; owner checks Manual Actions in the verified GSC property. | No links classified as toxic; no removal outreach or disavow drafted/submitted. |
| P2 — candidate keyword data | The attached 2,400-row candidate master has five repeated exact language/phrase pairs and no measured volume/difficulty. The 2,395 Planner file is a seed list. | Preserve source identities. Use keyword candidates to guide page review, not to claim demand or retain imported P1/P2 labels as implementation priority. | See the explicit route/evidence gates in [`keyword-map.csv`](./keyword-map.csv). |
| P2 — SerpOK estimates | Three owner-supplied records for “logistics company in Saudi Arabia” have distinct report contexts and different difficulty estimates. | Request the original dated records and database settings; keep each source separate until reconciled. | Do not substitute SerpOK estimates for Google data or copy them into measured-volume fields. |
| P2 — existing technical findings | Public crawl also reports canonical-host, sitemap `lastmod`/language-alternate, image-alt, security-header, and performance follow-ups in the existing remediation report. | Address these only in the approved production source after source alignment; preserve working URLs and functionality. | Retest live routes, headers, sitemap, metadata, images, forms and mobile behavior after an approved release. |
| P3 — search/AI measurement | No authenticated Search Console, Bing Webmaster, field Core Web Vitals, or AI citation dataset was available. | Connect authorized reporting or provide exports; measure before/after using consistent dates and filters. | No claim of top rankings, AI citations, or traffic growth. |

### Owner actions to unblock evidence work

1. Upload the original GSC Query and Pages CSV exports with property, date ranges, search type, country, device, and filters; also provide the verified Manual Actions status.
2. Upload original `export.csv`, `e1.csv`, and `e2.csv` unchanged.
3. Upload `issues_overview_report.csv` and `crawl_overview.csv` from the same Screaming Frog crawl, with crawl date/settings.
4. If the SerpOK estimate is to inform prioritization, provide its original record, database/location setting, and report date.

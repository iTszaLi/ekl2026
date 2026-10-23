# ENVOD KINGDOM — SEO, AEO, GEO and website audit

**Review status:** Read-only production audit and review-copy implementation. No Git push, Vercel change, DNS change, production deployment, or indexing submission was made.  
**Production observation:** Public crawl completed at `2026-10-21T20:59:50Z`; production HTML and image responses were rechecked on `2026-10-22`.  
**Source boundaries:** Production findings come from direct public HTTP requests. Search Console, analytics, SerpOK and backlink figures are not connected or independently verified unless expressly identified below.

## Executive summary

The live English site is crawlable: the declared sitemap contains 43 URLs and all 43 returned HTTP 200 in the robots-compliant crawl. The HTML responses contain unique titles, descriptions, self-canonicals on the `www` hostname, one H1 each, and no `noindex` directives. `robots.txt` allows all user agents and declares the sitemap.

The largest verified production gap is route coverage. The checked-out review copy defines 46 English and 46 `/ar/` routes. On the live domain, all 46 expected Arabic paths returned HTTP 404; three of the English legal routes also returned 404. The production sitemap contains only the 43 working English routes, has no alternate-language entries, and gives all entries the same `lastmod` value (`2026-07-06`). Local route availability is not proof that Google has indexed a URL.

The direct image crawl found 565 `<img>` elements on the 43 live sitemap pages, with no missing `alt` attributes. Seventy occurrences across 35 unique images use an explicit empty `alt`; these are service/industry card and feature images whose surrounding text often supplies the label. A contact-sheet review was completed; keep `alt=""` only where the image is decorative or its meaning is repeated in nearby text, and add factual alternative text where it conveys unique information. All 565 production image elements lack explicit HTML width/height attributes; rendered dimensions and layout shift were not measured. Of 84 unique assets fetched, 21 exceed 100 KB (the supplied crawl summary said 20); file sizes and natural dimensions are in the image inventory. Six live titles exceed 60 characters and 33 descriptions exceed 160 characters while six are shorter than 120; these are editorial flags, not Google limits or automatic ranking failures.

The private Search Console dashboard is implemented in this Replit review copy, but it has **not been connected to Google**. There are no actual GSC query/page tables, URL Inspection results, or verified current rankings yet. The supplied GSC figures are owner-reported observations and are separated from actual API metrics. Search demand, competitor rankings, backlink quality, field Core Web Vitals, and lead attribution remain unmeasured.

### Latest evidence update

The follow-up file review and evidence reconciliation are documented in [`addendum-2-analysis.md`](./addendum-2-analysis.md). It inventories the files that were actually available, keeps owner-reported GSC/SerpOK/backlink figures separate from measured data, and lists the exact missing exports in [`owner-data-request.md`](./owner-data-request.md). The source-level reconciliation is in [`source-file-inventory.csv`](./source-file-inventory.csv) and [`keyword-source-reconciliation.csv`](./keyword-source-reconciliation.csv). This update did not change site code or production.

## Baseline and preservation

### Review-copy source

- The current repository's `origin` is `iTszaLi/envodkingdom`, the review source selected by the owner.
- The previously supplied Vercel deployment referenced a different repository, `iTszaLi/ekl2026`. Its deployment/source alignment has not been independently checked through Vercel.
- The working tree contains earlier user changes. They were preserved; no reset, push, merge, or deployment was performed.
- The current public route configuration contains 46 English and 46 Arabic paths (92 public route entries). The Search Console review page is an additional private, `noindex` route and is excluded from public content routes and the sitemap.
- The existing services, industries, contact forms, contact details, imagery, animations, navigation, and English URL slugs were not removed or rewritten as part of this audit phase.

### Live public URL findings

| Check | Direct observation |
|---|---|
| Sitemap | HTTP 200; valid URL set contains 43 entries |
| Sitemap URL responses | 43/43 returned HTTP 200 |
| Arabic route coverage | 46/46 expected `/ar/` URLs returned HTTP 404 |
| English legal routes | `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy` returned HTTP 404 |
| Robots | HTTP 200; `User-agent: *`, `Allow: /`, sitemap declared |
| Sitemap `lastmod` | 43 tags; all currently read `2026-07-06` |
| Sitemap hreflang | No alternate-language tags observed |
| HTML language | All 43 live sitemap pages declare English; no Arabic page was returned |
| Canonicals | 43/43 use a matching self-canonical on `https://www.envodkingdom.net/` |
| Index directives | No page-level `noindex` found in the 43 sitemap pages |
| Titles/descriptions | 43/43 present and unique; no duplicates |
| H1 | Exactly one detected on each of the 43 pages |
| Image alternatives | 0 missing `alt` attributes; 70 empty-alt occurrences across 35 unique images |
| Image dimensions | 565 image elements have no explicit width/height; rendered geometry and CLS not measured |
| Image file sizes | 84 unique assets inspected; 21 exceed 100 KB, with file bytes and natural dimensions measured |
| Structured-data types observed | Organization, LocalBusiness, MovingCompany, WebSite, BreadcrumbList, Service, FAQPage and smaller counts of ItemList/WebPage/AboutPage/ContactPage |
| HTTPS hostname behavior | `https://envodkingdom.net/` returned HTTP 200 without redirect and declared the `www` canonical; `www` is the sitemap/canonical host |

See [`production-url-inventory.csv`](./production-url-inventory.csv) and [`unresolved-production-routes.csv`](./unresolved-production-routes.csv) for URL-level evidence. A page returning HTTP 200, appearing in a sitemap, or having a canonical does not establish its Google/Bing index status.

### Review-copy build QA (not the live deployment)

The completed static build prerendered 93 routes: 92 public routes plus the private Search Console page. Its public sitemap has 92 unique URLs (46 English and 46 Arabic); the admin route is absent from the sitemap and carries `noindex, nofollow`. All 92 public route files were present and had a unique title, description and canonical, exactly one H1, and three correct reciprocal `en-SA`, `ar-SA` and `x-default` alternates.

The review build has 532 image elements and no missing `alt` attributes; 142 occurrences have empty alt text, primarily on card/cover imagery, and 346 lack explicit width or height attributes. Intrinsic dimensions and local file sizes are listed in `local-build-image-inventory.csv`; browser-computed dimensions and CLS were not measured. All 510 JSON-LD blocks parsed as JSON; this checks syntax only, not semantic correctness or rich-result eligibility. The static link audit found no missing local targets or fragments.

These checks describe the current Replit review copy only. They do not resolve the public 404s or prove that this source is deployed.

### Page metadata review

Among the 43 live pages, six title tags are longer than 60 characters; 33 descriptions exceed 160 characters and six are shorter than 120. These counts identify pages to review for clarity and search-result usefulness only. Search engines may truncate or rewrite snippets, and character count by itself is not a quality or ranking criterion. Titles and descriptions are all unique in this crawl.

Eight pages have fewer than 300 words in the crawler's extracted text. This is a review prompt, not a word-count target; the right test is whether each page satisfies its customer intent without filler.

## Search Console, keyword and demand evidence

### Search Console

The owner-provided baseline for an approximate three-month period is 139 clicks, about 4.13K impressions, 3.4% CTR and average position 17.4. Those values are recorded as **owner-reported and unverified** because no raw Search Console export or connected API response was available.

The supplied query observations are retained in [`gsc-opportunity-analysis.csv`](./gsc-opportunity-analysis.csv). They do not include verified date ranges, query positions, country/device filters, landing URLs, or raw exports; no position or page association has been inferred. Actual GSC metric columns remain blank until the administrator authorizes the dashboard.

The dashboard setup steps are in [`../search-console-dashboard-setup.md`](../search-console-dashboard-setup.md). It requests only the Search Console read-only scope. It does not provide the Links or Manual Actions reports and does not submit URLs for indexing.

### Keyword research

- The expanded project master has 2,935 candidate records: 1,460 English and 1,475 Arabic. Its search-volume and ranking fields are not measured; candidate priorities are editorial/research heuristics.
- The supplied bilingual spreadsheet contains 2,400 candidate rows (1,200 English and 1,200 Arabic) across 24 service groups. Its workbook and matching CSV explicitly say search volumes, difficulty and organic rankings are not measured.
- The supplied Keyword Planner upload is a one-column, 2,395-phrase seed list, not a Google Ads Keyword Planner results export.
- The bilingual master CSV has 2,400 data rows but 2,395 distinct normalized phrases; five duplicate phrase rows were preserved in the source. Identical attached copies were not counted as additional evidence.
- No numeric search-volume, difficulty, or current-ranking values have been added to the keyword map. The full traceable map is [`keyword-map.csv`](./keyword-map.csv).

Priority clusters, as requested, are customs clearance around Riyadh/Jeddah/Dammam gateways, exhibition logistics, ATA Carnet coordination, freight forwarding, ocean freight, and GCC road transport. These are service-fit hypotheses pending measured GSC/Keyword Planner data, not claims about search demand.

## Competitor and SerpOK research

Current direct page checks covered Globus's Riyadh article and service pages and Shaker's logistics page. The Globus article is self-published and promotional; it is not an independent ranking of Riyadh providers. Shaker's page visibly organizes transportation, warehousing and 3PL themes and displays its own performance/scale claims. Those statements are competitor-published claims, not independently verified facts and not evidence of ENVOD capability or rank.

Additional direct checks covered SAL, ABC Logistic and MFS Arabia Logistics; Saudi Smart Logistics & Warehousing was classified as an event source, not a freight-provider competitor. The current QTR Pages thread links to Globus's English and Arabic Riyadh article, not to ENVOD. Its page-level HTML showed two Globus links, not the seven-link count in the owner-supplied SerpOK summary; the source export is still missing.

Earlier dated competitor-page observations from 2026-10-17/18 are retained as qualitative page research, not current SERP rankings. The web-search and web-fetch service returned HTTP 402 during this audit; direct bounded requests were used only for the named public pages. Direct Google query requests returned access-help content, and Bing result pages did not yield parsable result cards or a verified Saudi-origin context. Current Saudi-localized English and Arabic SERP positions could not be reliably sampled. See [`competitor-research-addendum-3.md`](./competitor-research-addendum-3.md) and [`ksa-search-access-log.csv`](./ksa-search-access-log.csv).

The supplied SerpOK values for Shaker and Globus are estimates from owner-provided prompt text with unknown report dates. Conflicting keyword values and the reported Globus page-summary discrepancy are retained, not merged, in [`serpok-competitor-observations.csv`](./serpok-competitor-observations.csv). They describe competitor estimates, never ENVOD performance.

The exact overlapping-query comparison is in [`serpok-metric-reconciliation.csv`](./serpok-metric-reconciliation.csv). The separate QTR Pages link check is in [`qtrpages-link-review.csv`](./qtrpages-link-review.csv); neither file supplies ENVOD backlink data or proves any ranking effect.

## Backlinks and business authority

No raw `export.csv`, `e1.csv`, `e2.csv`, or other backlink-provider export was found. The owner's earlier summary of approximately 386 records, 382 referring domains, repeated commercial anchors and possible PBN/EDU packages remains unverified. No link-by-link toxicity classification, penalty inference, disavowal recommendation, or claim of acquired links is made. See [`backlink-risk-review.md`](./backlink-risk-review.md) and the empty [`backlink-review.csv`](./backlink-review.csv) template.

The existing outreach tracker contains 10 candidate publishers/directories; entries are not contacted and have no confirmed placements. They remain opportunities only, subject to owner approval and verification of listing terms and business details.

## AEO/GEO and conversion findings

- The live robots policy does not block crawlers through robots.txt. This does not guarantee crawling, indexing, ranking, or AI citation.
- The public site already exposes page content in its initial HTML response. The crawl is read-only and did not execute browser JavaScript.
- Visible FAQ/Service/Organization schema types were observed, but this audit did not validate eligibility for rich results or verify every schema claim against the visible page. Schema should stay aligned with visible content and the two existing schema sources.
- Do not add invented expert quotes, author biographies, statistics, testimonials, rankings, memberships, or customer logos. Add author details only to genuinely authored educational material and use the actual author's approved biography.
- Existing form events call a local analytics bridge, but no analytics provider or event collection script is configured. The code therefore does not establish that submissions, calls, WhatsApp clicks, or conversions are being measured.
- Enquiry endpoint and form tests pass in the review copy. No new real email was sent during this audit. The previous owner-confirmed Resend acceptance test is not a substitute for a new production deployment test.
- Field Core Web Vitals, PageSpeed field data, Bing Webmaster reports, AI answer citations, call/WhatsApp outcomes and qualified lead totals were not available.

## Counter and metric review

The live homepage HTML currently begins with zero-valued animation counters; a failed or delayed animation can therefore leave a visitor seeing zero. The review copy now starts with final values and retains count-up motion when the statistic enters view. Reduced-motion code also uses the final value. A mobile and desktop homepage screenshot confirmed the hero layout; the counters themselves were checked in prerendered HTML.

Unsubstantiated homepage figures for 10,000+ shipments, 500+ clients and 50+ countries were replaced in the review copy with “Shipment Coordination,” “Business Logistics Support” and “Worldwide Freight Options.” The generic 24-hour clearance statistic was removed. The owner-confirmed 98% on-time, 50+ fleet vehicles, 100% tracking availability and 24/7 support claims remain; their underlying source records were not attached. The 25+ years statement remains owner-supplied, not independently documented. “500+ events coordinated” and “ATA Carnet — 24hr processing” remain limited to the previously approved exhibition card; customs 24-hour wording remains limited to the approved hero/featured-card placements.

The review-copy Services directory now presents Exhibition Logistics, Customs Clearance and House Moving & Relocation as wide cards. All 24 catalog services and the separate Door-to-Door card remain present.

See [`seo-stat-claims-review.csv`](./seo-stat-claims-review.csv) for each claim and its permitted scope.

## Security and performance

Production responses sampled on October 22 returned HSTS (`max-age=63072000`). CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy were absent from the sampled homepage, customs, contact, robots and sitemap responses. No production header change was made; the review copy's static-host `_headers` file does not configure Vercel.

No Lighthouse or PageSpeed score is claimed. The no-key PageSpeed API requests returned HTTP 429 because the available project quota is zero. The build did report a 998.8 KB raw / 306.8 KB gzip-estimated main JavaScript chunk and a separately lazy-loaded 45.7 KB raw / 13.1 KB gzip-estimated dashboard chunk. These are bundle-size measurements, not LCP, INP, CLS or field Core Web Vitals.

## Implementation status

The private dashboard and server routes are implemented in the review copy only. See [`implementation-results.md`](./implementation-results.md) for code scope and validation. The six requested decision documents are [`seo-remediation-report.md`](./seo-remediation-report.md), [`seo-url-inventory.csv`](./seo-url-inventory.csv), [`seo-keyword-opportunity-matrix.csv`](./seo-keyword-opportunity-matrix.csv), [`seo-competitor-gap-analysis.md`](./seo-competitor-gap-analysis.md), [`seo-metadata-inventory.csv`](./seo-metadata-inventory.csv) and [`seo-validation-results.md`](./seo-validation-results.md). **Google authorization remains a required external setup step** before the dashboard can retrieve live GSC data.

No public copy, established English URL, production sitemap, Vercel setting, DNS record, or live indexing state was changed. The remaining work is prioritized in [`seo-remediation-plan.md`](./seo-remediation-plan.md).

## Official guidance referenced

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google robots.txt guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Search Console Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Search Console URL Inspection API](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [OpenAI crawler documentation](https://platform.openai.com/docs/bots)

The official guidance supports technical eligibility and content clarity; none promises rankings or AI citations.

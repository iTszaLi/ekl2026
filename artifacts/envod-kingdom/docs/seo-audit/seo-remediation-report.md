# ENVOD KINGDOM SEO, AEO and GEO remediation report

**Audit date:** 22 October 2026  
**Scope:** Read-only audit of the public website plus implementation and validation in the isolated Replit review copy.  
**Release decision:** **Not ready for production publication.** The review copy is built and tested, but its changes are not on the verified Vercel source. The public site still has missing Arabic/legal routes, unmeasured Core Web Vitals, incomplete Search Console/Bing evidence and sampled missing security headers.

## Executive summary

This review preserves the existing English URL structure and the exhibition-logistics page. It does not change the public domain, Vercel, DNS, GitHub, public indexing state or production email configuration. The approved review-copy work corrects counter behavior, removes unsupported general numeric claims, improves the requested service-card presentation and completes bilingual route/metadata checks. The build contains 92 public review routes (46 English, 46 Arabic), each with a unique title and description, one H1, and three language-alternate links. All 510 JSON-LD blocks parse as JSON; that is a syntax check, not a rich-result eligibility guarantee.

The public production inventory is materially smaller than the review copy: 43 sitemap URLs returned HTTP 200 in the current recheck, while 49 expected Arabic/legal routes return HTTP 404. A public sitemap and multiple structured-data types do exist, contrary to two findings in the supplied Screaming Frog summary. The raw Screaming Frog URL-level exports were not attached, so its heading, readability and low-content findings cannot be verified individually.

The later source-file reconciliation is in [`addendum-2-analysis.md`](./addendum-2-analysis.md). It confirms that the original Search Console screenshot, backlink export, `e1.csv`/`e2.csv`, and Screaming Frog CSV exports are still unavailable; their figures remain unverified rather than being reconstructed from derived datasets.

Saudi English/Arabic keyword research is recorded as a candidate opportunity matrix, not as measured demand. The 2,935 candidate phrases comprise 1,460 English and 1,475 Arabic terms. Search volume, difficulty, current ranking and verified Search Console values are blank: no actual result export was supplied. The uploaded Keyword Planner list is a seed list, not a planner-results export. No traffic, rank, backlink placement or AI citation has been invented.

## Scope and safeguards

- Work remains in the separate Replit review copy. The live Vercel domain and repository were not modified, pushed or deployed.
- Existing English paths and the current exhibition page were retained. The review copy adds or preserves `/ar/` counterparts.
- Copy uses qualified language for shipment-specific routing, customs, approvals and ATA Carnet eligibility. No certification or authority relationship was added.
- The owner-approved membership/client facts and supplied client names remain subject to their existing evidence and usage rules; no outside logos were scraped.
- No new Resend message was sent during this audit. The prior owner-confirmed acceptance test is not evidence that a later Vercel deployment is configured.

## Work completed in the review copy

### Technical SEO and bilingual routing

- Rebuilt and prerendered 93 HTML outputs: 92 public routes plus the private dashboard shell. The review sitemap includes 92 public routes, split evenly between English and Arabic.
- Verified route files, unique title/description pairs, one H1 per route, self-canonicals, language alternates, `robots` metadata, JSON-LD syntax and internal targets/fragments.
- Preserved existing English paths; Arabic service paths use `/ar/`.
- Kept the private Search Console dashboard behind authentication. Its API routes return `configured: false` until credentials are authorized and unauthenticated data requests return HTTP 401. It does not currently retrieve live Search Console data.
- The review copy contains a search-friendly sitemap/robots setup. It does not ping IndexNow, submit URLs to Google/Bing, or prove indexing.

### Content and trust

- Kept the exhibition service page and its shipment-specific ATA Carnet qualifications.
- Applied wide-card layout to the requested Exhibition Logistics, Customs Clearance and House Moving & Relocation presentation. Lightened the exhibition/customs image overlays so their images remain more visible while text contrast is preserved.
- Kept the separate Door-to-Door enquiry card and existing service directory.
- Retained the owner-approved document-support wording for SABER, SFDA and related procedures; did not claim ENVOD is “certified” by those authorities.
- Did not publish invented customer names, event credentials, rankings, statistics, expert quotes or backlink placements.

### Animated statistics and claims

- Review-copy animated counters now render their final value before animation and when reduced motion is requested.
- Replaced unsupported general “10,000+ shipments,” “500+ clients” and “50+ countries” figures with capability wording. Removed the generic 24-hour customs KPI.
- Retained the user-selected 98% on-time, 50+ fleet, 100% tracking and 24/7 support statements as owner-confirmed; operational source records were not attached.
- Retained the repeated 25+ years statement as owner-supplied, not independently documented.
- Kept “500+ events coordinated,” “ATA Carnet — 24hr processing” and customs timing wording confined to the owner-approved, scoped placements described in `seo-stat-claims-review.csv`.

## Public production evidence

### Crawling, routes and indexability

- The public `robots.txt` and `/sitemap.xml` return HTTP 200. The robots file permits crawlers and declares the sitemap.
- The sitemap contains 43 English URLs, all of which returned HTTP 200 in the October 22 recheck.
- The separately enumerated expected route set includes 46 Arabic routes and 3 English legal routes, all returning HTTP 404 on the public domain. These should be reconciled against the verified Vercel source before any sitemap expansion.
- The production crawl found self-canonicals and unique metadata on the 43 crawled pages. This does not show whether Google or Bing indexed them.
- Search Console authorization and URL Inspection were not available. The GSC dashboard/task is not a substitute for an indexing report.

### Screaming Frog reconciliation

The supplied summary is useful as a lead list, not as raw evidence. Direct checks contradicted its claims that no sitemap or structured data exists. The image-alt count appears to conflate explicit empty `alt=""` with a missing attribute. Current direct counts and unresolved findings are itemized in `screaming-frog-findings-reconciliation.csv`.

The supplied summary reports 26 duplicate-H2 pages, one heading hierarchy issue, three low-content pages, and 27 difficult plus 5 very difficult readability results. Those findings could not be matched to URLs because the corresponding crawler exports were not attached. The review-copy audit found no repeated H2 within a page, no heading-level skips and no page below the diagnostic 300-word threshold. These candidate-copy results do not clear the live production pages.

### Images and accessibility

- Public crawl: 565 image elements across 43 pages; **zero missing `alt` attributes**. Seventy occurrences across 35 unique assets have intentionally empty alt values. All 35 unique sources were reviewed in a contact sheet; service/industry card imagery is generally accompanied by visible labels. Keep an empty alt only when the image is decorative or the adjacent text supplies its meaning. One text-heavy supply-chain graphic is flagged for an equivalent text description if its labels add unique information.
- Public crawl: all 565 image elements lack explicit HTML `width` and `height`. Natural dimensions and file bytes were collected for 84 unique assets; 21 exceed 100 KB. Rendered browser dimensions and layout shift were not captured.
- Review-copy build: 532 image elements; zero missing `alt` attributes, 142 empty-alt occurrences and 346 without explicit width/height. Local asset dimensions are included where available.
- Image files were not blindly recompressed. The next optimization step should use rendered display size and measured LCP/CLS evidence while preserving visual quality.

### Metadata and structured data

- Public crawl: six titles exceed 60 characters, 33 descriptions exceed 160 characters and six descriptions are shorter than 120. These are editorial review bands, not hard search-engine limits. Titles and descriptions were unique in the crawled set.
- Review copy: all 92 titles and descriptions are unique. The full EN/AR metadata is listed in `seo-metadata-inventory.csv`; review the copy for page intent and translation quality before release rather than trimming mechanically.
- Production exposes Organization, LocalBusiness, MovingCompany, WebSite, BreadcrumbList, Service, FAQPage and related JSON-LD types. Do not remove these based on the supplied “no schema” result. Validate each type against visible facts and its applicable guidelines before release.
- Review-copy JSON-LD syntax parses on all 510 blocks; this is not a Google rich-results result.

### Security and performance

- On sampled live homepage, customs, contact, robots and sitemap responses, HSTS was present (`max-age=63072000`); CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy were absent. This is a sample, not a complete resource sweep. No production header changes were made.
- The PageSpeed API returned HTTP 429 because the available project quota is zero. No PageSpeed/Lighthouse score or field Core Web Vitals measurement is claimed.
- Build output reports a 998.8 KB raw / 306.8 KB gzip-estimated main JavaScript chunk and a lazy dashboard chunk of 45.7 KB raw / 13.1 KB gzip-estimated. Bundle size does not establish LCP, INP or CLS.
- Production image markup lacks intrinsic dimensions; this is a layout-stability risk to measure, not proof of a CLS failure.

## Search demand, competitors and authority

- `seo-keyword-opportunity-matrix.csv` contains 2,935 English/Arabic candidate phrases mapped to services, cities/routes, intent estimates and proposed pages.
- Search volume, difficulty, current rank, GSC clicks, impressions and average position remain blank because actual exports were not available. The owner-reported baseline of approximately 139 clicks, 4.13K impressions, 3.4% CTR and 17.4 average position over roughly three months is not independently verified.
- Competitor inspection was limited to direct public-page checks. The Globus and Shaker pages are self-published competitor content; their claims are not facts about ENVOD. No localized live SERP position, competitor traffic, backlink count or AI answer citation was measured.
- Existing network profiles, referring domains and backlink results remain unverified. Candidate outreach opportunities are not completed placements. See the existing tasks for verified profile links and inbound-link measurement.

## Lead generation and AEO/GEO

- Contact and quote submission tests in the review copy passed with provider behavior mocked; validation, spam handling, failure handling and user-facing retry paths are covered by the test suite.
- No new real email was sent, no Vercel deployment was configured, and no new provider acceptance test was performed. Existing Replit email acceptance does not make the public Vercel forms operational.
- The site permits AI/user-agent crawling through the current robots file. This does not establish AI discovery, citation, ranking or factual retrieval.
- Answer-first copy, question-based headings, comparison content, statistics and expert quotes must use verified source evidence. No statistics or quotations were fabricated to satisfy a checklist.
- Local conversion events are not connected to an analytics collection provider. Calls, WhatsApp clicks, form completions and qualified leads therefore have no measured totals.

## Verification

The full command results and their boundaries are in `seo-validation-results.md`. Final checks include TypeScript, the Search Console and enquiry test suites, the production build/prerender, static bilingual-route inventory, internal links, JSON-LD syntax, image inventories, production HTTP checks and browser screenshots.

## Follow-up implementation — 22 October 2026

The latest attached issue lists were applied to the isolated review copy only:

- Reordered the 25-item directory to prioritize Exhibition, Customs, Packing/Crating and Relocation, GCC transport, Breakbulk, ATA Carnet, international freight, Project/OOG, then storage/distribution and other offerings. All 24 catalog services and the separate Door-to-Door card remain.
- Made the homepage FAQ questions semantic H3 headings and kept all answers in prerendered HTML without `hidden` attributes or an opacity-zero content wrapper. Added a bilingual, shipment-qualified answer on temporary exhibition admission and re-export; it states that the authorized association issues the Carnet.
- Replaced the outdated CITC acronym with CST in the relevant service/industry copy and qualified product-document requirements as shipment- and product-dependent. No certification or official relationship claim was added.
- Renamed the contact schedule to “Office Hours” so it is distinct from the owner-approved 24/7 customer-support metric. Increased mobile Services hero spacing to keep the offerings label below the wrapped announcement/navigation bars.
- Corrected prerendered robots metadata so each route has one directive; the private dashboard and SPA shell each contain only `noindex, nofollow`.

The rebuilt review copy has 93 prerendered HTML outputs: 92 indexable URLs in the sitemap and one private dashboard route. A post-build audit verified one H1 and unique title/description for every indexable route, one robots tag per HTML output, 510 parseable JSON-LD blocks, the new FAQ text in static HTML, and no public preview-domain or CITC references. TypeScript, service-catalog (2/2), enquiry (16/16) and Search Console (5/5) tests passed. Desktop and mobile Services previews and the Contact office-hours label were visually checked.

Production was not changed. The production route gaps, missing measured GSC/Keyword Planner/Bing data, absent field performance measurements, unverified backlink/citation outcomes and separate Vercel email configuration remain open as documented above. The build still reports non-blocking source-map and large-chunk warnings; these are not field performance measurements.

## Priority actions before production release

1. Align the verified GitHub/Vercel source and restore or deliberately redirect the 49 missing Arabic/legal URLs. Keep existing English URLs intact.
2. Obtain real Search Console and Keyword Planner result exports; replace owner-reported or heuristic values only with traceable metrics.
3. Measure mobile and desktop Lighthouse/PageSpeed and field CWV; review image width/height, responsive sizing and bundle size against actual rendered pages.
4. Review the production security-header policy, including CSP compatibility, in the verified deployment source; test before changing production.
5. Configure and test the enquiry endpoint and Resend delivery in the actual Vercel production architecture. The Replit review copy is not a production email backend.
6. Connect analytics/Bing reporting only after authorization; then measure form, call and WhatsApp conversions and actual indexing/citations.
7. Supply evidence before restoring 10,000+ shipments, 500+ general clients, 50+ countries or any additional operational claim.

## Companion files

- `seo-url-inventory.csv` — candidate routes compared with current public status and metadata.
- `seo-metadata-inventory.csv` — production/review-copy titles, descriptions and lengths.
- `seo-keyword-opportunity-matrix.csv` — candidate keyword mapping with unmeasured metrics left blank.
- `seo-competitor-gap-analysis.md` — direct competitor observations, gaps and evidence limits.
- `seo-validation-results.md` — checks performed and results.
- `screaming-frog-findings-reconciliation.csv` — supplied crawler findings reconciled with direct observations.
- `production-image-elements.csv`, `production-image-assets.csv`, `local-build-image-inventory.csv` — image-level findings.
- `seo-stat-claims-review.csv` — numeric claims, evidence status and allowed placement.

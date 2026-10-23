# ENVOD KINGDOM SEO / AEO / GEO implementation report

**Review date:** 17–18 October 2026  
**Status:** Local controlled-stage continuation verified; owner evidence, source alignment and production review remain required before publication.

## Scope and safety

- Work was limited to the existing Replit workspace. No GitHub push, Vercel change, DNS edit, or production deployment was performed.
- The established English and Arabic URLs, design system, enquiry forms, Resend recipient (`info@envodkingdom.net`), and floating WhatsApp CTA were preserved.
- No live email was sent as part of this SEO work.
- A pre-change source backup is available at `generated-artifacts/backups/envod-seo-pre-implementation-20261017.tar.gz`. It is local and ignored by Git.
- Additional local pre-edit archives for the October 18 continuation are in `generated-artifacts/backups/`; no production files or external repositories were changed.

## Existing-site audit and research

The project already contains 24 distinct service pages, corresponding English and Arabic content routes, shared service metadata, a service-to-service link structure, and prerendering. The local production build outputs 92 content URLs (46 EN and 46 AR) and a 92-URL sitemap. This batch did not add duplicate city pages or change existing URLs.

Research and baseline references:

- `controlled-stages-report.md` — prior 92-route audit and controlled SEO stages.
- `controlled-saudi-search-landscape.md` — sampled English and Arabic search results and source limitations.
- `saudi-keyword-and-competitor-audit.md` — keyword hypotheses, competitor observations, and evidence boundaries.
- `bilingual-keyword-database.csv` and `keyword-map.csv` — existing map; search volumes, difficulty and ENVOD ranks remain unverified.
- `business-claims-register.md` — evidence requirements for company-specific statements.
- `backlink-opportunity-sources.json` — inspected public listing and membership pathways.

## Changes made in this batch

### Content accuracy and service coverage

- Refined customs, ocean freight, GCC transportation, freight forwarding, warehousing, exhibition logistics and ATA Carnet copy in English and Arabic.
- Kept Riyadh Dry Port, Jeddah Islamic Port and King Abdulaziz Port in Dammam as gateway topics, while removing claims that ENVOD operates at every port, airport or border.
- Replaced unsupported fleet counts, direct port-access claims, universal coverage, fixed transit/clearance windows, live tracking, warehouse certifications, and unverified cold-chain or dangerous-goods credentials with shipment-specific review and availability language.
- Kept exhibition venues and event names as planning references, not proof of ENVOD appointment or completed work. On-site work, venue contractors, ATA eligibility and event-specific scope are explicitly subject to confirmation.
- Clarified that ATA Carnets are issued by an authorized association and that Saudi eligibility, use, issuance and customs acceptance must be checked for the goods and purpose.
- Replaced homepage “trusted partner” language and the exhibition pillar's nationwide delivery claim with coordination and per-event scope language.
- Reworked the homepage customs steps so they do not imply that an authority will approve or release a shipment.
- Removed unsupported SFDA/GDP/halal certification language from the homepage industry cards.
- Replaced the exhibition section's “live tracking” claim with manual status updates on request.
- Updated service-card summaries for core and selected regulated services so the summary does not promise unsupported coverage or credentials.
- In the October 18 continuation, reordered service discovery to feature exhibition logistics, customs clearance and relocation, then prioritized GCC road, breakbulk, ATA Carnet, forwarding, ocean and air freight. Breakbulk now has its own service form category instead of being conflated with ocean freight.
- Added a server-endpoint regression test for exhibition enquiries. It verifies the selected exhibition service and submitted event/venue details survive validation and appear in the accepted email payload.
- Routed remaining service-detail, industry-detail and Vision 2030 quote actions to the existing contact form rather than opening a mail client.
- Reworded selected breakbulk, OOG, dangerous-goods, RoRo, white-glove, relocation, e-commerce, food, pharmaceutical, animal, chemical, construction and telecom copy to describe enquiry scope and require shipment-specific acceptance/provider confirmation.
- Exhibition venue and event names remain useful planning references, with explicit language that they do not imply ENVOD appointment or past participation. The existing exhibition page URL, visual assets and overall layout were retained.
- Replaced the homepage client-logo wall and unsupported operating-stat counters with audience categories and shipment-planning topics. A later verification gate removed the association/membership display, FAQ and metadata claims pending company-specific evidence.
- Fixed the relocation footer link to the established route and changed the Vision 2030 quote CTA to use the website enquiry form.

### Crawlability and bilingual behavior

- Kept the full FAQ answer text in the server-rendered DOM even when accordion panels are collapsed, so no-JavaScript page HTML contains the answer content.
- Localized the homepage FAQ structured data to the active page language so Arabic routes emit Arabic questions and answers.
- Added the owner-stated industry-network affiliations to a bilingual homepage trust section, a directly answerable bilingual FAQ, and the homepage metadata. The FAQ remains in the existing localized FAQPage schema.
- Used the existing WCAworld, JCtrans and FIATA logo assets. WCA Events and PCN are text-only links because no approved logo files for those organizations are present in the workspace.
- Added external links to the named organization sites; these are outbound references, not acquired backlinks.
- Service-page FAQ structured data already selects the same language as the page; this behavior was verified in the current source and preserved.
- Retained the existing reciprocal Arabic/English route structure, canonical and hreflang logic, internal page URLs, and sitemap generation.

### Lead measurement

The existing privacy-limited client event queue remains in place. It distinguishes clicks, form starts, API success responses and request failures; it does not claim inbox delivery, qualification, revenue, or organic attribution. No analytics vendor collector was added because an authorized property and consent review are not available. See `lead-event-measurement-contract.md`.

## Verification

- `pnpm run build` — passed for the artifact, including client and server builds and prerendering of 92 routes plus the 92-URL sitemap. Vite still reports a large JavaScript chunk (~988 KB uncompressed) and two sourcemap-location warnings; these are not build failures and remain performance/tooling follow-ups.
- `pnpm run typecheck` — passed for the workspace, including ENVOD KINGDOM.
- `pnpm --filter @workspace/envod-kingdom run test:enquiries` — passed: 16 tests, covering server validation, honeypot, rate limiting, provider failures, idempotency, service-page preselection, bilingual email payloads, escaped content and exhibition event details.
- The managed web workflow restarted successfully and returned HTTP 200. Desktop homepage, service listing, mobile exhibition page and full-height mobile contact form rendered. The latest screenshot console output showed no application errors; screenshots do not exercise dropdown selection or form submission.
- The generated sitemap contains 92 URLs. English and Arabic prerendered homepage FAQ schemas were checked, and the ATA Carnet page also contains a localized FAQ schema. Updated exhibition-venue copy is present in both prerendered route files.
- The latest workspace typecheck passed and the main artifact prerendered 92 routes; the separate standalone snapshot typecheck/build passed and prerendered 43 routes. The standalone snapshot remains an older, independently maintained copy.
- Direct HTTP checks returned 200 for WCAworld, WCA Events, Project Cargo Network and FIATA. JCtrans returned 406 to automated requests, so its page content could not be independently checked. The search/fetch service returned 402; no membership registry or company-specific directory record was verified.
- A full-page exhibition screenshot exceeded the preview capture's 8,000-pixel edge limit; route output and the page's initial mobile viewport were still checked.
- No live email was sent for this SEO continuation. Email tests use a provider stub and verify only the application's acceptance behavior; they do not prove a new Resend delivery.
- Do not interpret a local build or search-result sample as proof of Google indexing, rankings, qualified leads, or production Core Web Vitals.

## Backlink and keyword status

- No backlink was purchased or acquired, no directory or membership application was submitted, and no publisher was contacted.
- The owner supplied current affiliation statements for WCAworld, JCtrans, WCA Events, PCN and FIATA. These are used as owner-provided wording; no company-specific membership IDs, public directory records, endorsement or external confirmation were supplied or established.
- The inspected pathways and approval gates are documented in `envodkingdom-seo-aeo-geo-backlink-plan.md`.
- The mapped English and Arabic phrases, including the new affiliation cluster, are hypotheses to validate in authorized Search Console/provider data, not measured demand. See `seo-keyword-map.md`.

## Keyword research and mapping completion — 18 October 2026

- Audited **608 rows across eight existing phrase CSVs**. They normalize to **197 keyword/language pairs**, with 411 repeated row appearances across files. The source files were retained; the overlap was not treated as 411 invalid keywords.
- Expanded the canonical `ksa-organic-keyword-database.csv` from 149 to **566 unique records**: 351 English and 215 Arabic. Added 417 unique records, with no normalized keyword/language duplicates. All 24 service and 11 industry page clusters now have EN/AR phrase coverage.
- The database separately marks **65 selected Google Suggest responses** (41 EN and 24 AR) with their seed, locale language and capture date. It also records city/port/route, intent, current target URL, evidence class, rationale, page-content gap, internal-link opportunities, priority, capability gates and a measurement method.
- Phrase-level priorities were tightened to **25 P1, 523 P2 and 18 P3**; P1 is limited to a small core-service and brand set. City-office/airport and unsupported-capability phrases are not promoted to P1.
- The route-level `keyword-to-page-map.csv` retains all **46 established English routes** and maps each to its existing Arabic `/ar` route. All 18 generic placeholder primary targets were replaced; every primary target is now distinct. Industry-page title/meta and heading recommendations were made neutral and capability-gated. These are planning records only, not live website copy changes.
- Customs, exhibition logistics, ATA Carnet, freight forwarding, ocean freight, GCC transportation and project cargo are marked as business/editorial P1 clusters. P1 is not a search-volume or ranking claim. Remaining service and industry content is prioritized only as an editorial hypothesis.
- The three explicit low-fit/malformed candidates `how much customs broker make`, `what is a US customs broker`, and `sea lead shipping Saudi Arabia` were excluded from service targeting. City office/airport phrases remain conditional P3 research terms; no local-office or city-landing-page claim was created.
- Twenty-seven existing rows retain user-supplied SAL competitor estimates whose collection tool, market and date were unspecified. They are not ENVOD search metrics. All new volume, difficulty and ENVOD-rank values remain unavailable.
- A direct public Google Suggest spot check used Saudi locale parameters (`gl=sa`, `hl=en|ar`). This is autocomplete observation only, not volume, rank or evidence of the searcher's location. The separate public search service returned HTTP 402 during this continuation, so no fresh SERP/competitor sample was added; October 17 observations remain dated in `controlled-saudi-search-landscape.md`.
- Structural checks passed: 566 canonical rows, zero normalized duplicates, coverage for 24/24 services and 11/11 industries, 46 route rows with Arabic URL mappings, zero route-map placeholders and zero duplicate route primary phrases. Three malformed `/ar/ar/` legacy targets were corrected. No website source, URL, design or feature was changed in this keyword-data stage; CSV and route-map parsing were validated, so an app build/typecheck was not applicable.

## Outstanding owner review and setup

1. Confirm the company-specific capabilities, service territories, operator roles and evidence listed in `business-information-required.md`.
2. Have a qualified Arabic reviewer approve the regulatory and service copy before publication.
3. Independently verify company-specific association records and review client, membership, venue and event logo rights before describing the affiliations as publicly verified.
4. Connect an authorized Search Console / analytics property through the workspace’s approved integration flow, then validate consent requirements before sending events to a vendor.
5. Obtain fresh Saudi-filtered query, rank, impression and click evidence; keep unavailable metrics marked unavailable.
6. Continue the claims-register review across legacy industry and Vision 2030 copy. This continuation removed the homepage customer-logo wall/stat counters, but unverified capability statements remain in other industry, project and service-detail content; no site-wide factual clearance is claimed.
7. Independently verify association records and display rights before restoring any membership claim or logo. No company-specific directory listing, endorsement or backlink is verified.

## Footer, contact and trust review — October 18, 2026

- Rebuilt the active app footer as five responsive groups: company, 15 prioritized services, existing industry routes, quick/legal links, and contact details. Kept existing URLs and connected each entry to its actual route.
- Made the owner-provided Riyadh contact details, phone/WhatsApp, fax, email, directions and working hours visible. Hours now state Friday closed and Saudi Arabia local time (AST, UTC+3).
- Removed the affiliation logo section, its FAQ, and homepage metadata wording until company-specific membership evidence and logo rights are provided. No generic social-profile links are presented as official accounts.
- Applied the footer, contact-hours, and affiliation-removal updates to the separate standalone export; replaced its top-level home promises and removed unsupported structured-data details such as founding date, employee range, service-area list, social-profile URLs, coordinates and payment claims.
- This is not a full standalone-export synchronization: legacy page modules there still contain unsupported service claims and metrics. Do not publish that export until the remaining copy is reviewed against confirmed capabilities. The active Replit artifact remains the source used for this stage.
- The live-site screenshot attempt was blocked by the screenshot service returning HTTP 402. That does not indicate a site error; visual validation is limited to the running Replit preview. No Vercel/GitHub sync or deployment was performed.

### Remaining verification

- Confirm business capabilities and any location/service claims that still require evidence; review the list in `business-information-required.md` and `business-claims-register.md`.
- Obtain a Saudi Arabic logistics editor's review of the localized search map and page copy.
- Connect and inspect Search Console/analytics data before making claims about impressions, rankings, qualified leads or conversion improvements. Existing code instrumentation is not proof that an analytics property is connected.
- Finish synchronizing and testing the standalone export before any Cloudflare/Vercel release. No production website was changed in this stage.
8. Review and approve changes before any GitHub synchronization or production deployment. Production remains untouched.
9. The Vercel source repository is not checked out in this workspace; these local changes have not been synced to that repository or published. The current workspace origin is `iTszaLi/envodkingdom`, while the previously identified Vercel repo is `iTszaLi/ekl2026`; no fetch, checkout, merge, push or deployment was performed.
10. The Saudi English/Arabic keyword map and sampled search observations are planning evidence, not measured demand: no Search Console query/lead dataset, verified search volumes, rankings or qualified-lead attribution is connected. Prioritize validation through an authorized property before increasing page count or making ranking claims.
11. Backlink work is limited to the documented opportunity/approval plan. No applications, outreach, paid links or link exchanges were performed.
12. Review the updated route-level map against the current claims register before implementing page copy. The 11 industry pages still contain legacy capability statements that this keyword-mapping stage did not alter.

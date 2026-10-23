# Current master-brief continuation — 17 October 2026

**Latest controlled-stage report:** `controlled-stages-report.md` records the verified pre-change backup, whole-site baseline audit, new Saudi EN/AR research, priority claim/metadata corrections, failure-event tracking, preservation checks and outstanding external gates.

**Later organic-growth extension:** `organic-growth-implementation-report.md` covers the subsequent 149-row searchable keyword inventory, backlink/citation research, reporting templates and linked bilingual preparation resources. The original keyword/benchmark source files remain intact. No external submissions or public deployment occurred.

This section supersedes the earlier baseline report below for work completed in this continuation. **The whole 90-day SEO program is not complete, and the public website has not been republished.**

## Baseline and preserved architecture

The existing product is React/Vite with Wouter, bilingual English and `/ar` routes, an Express server, build-time prerendering, a shared Zod enquiry contract and the connected Resend sending integration. No database, CMS, new authentication system or replacement framework was introduced.

The prior build had 92 content URLs and a 1,276.92 kB main JavaScript file (403.89 kB gzip). Live email sending had failed with Resend 403 `validation_error`; the owner subsequently confirmed the sender domain is **not verified**. No further live email was attempted in this continuation.

## Implementation

### Conversion and validation

- Added separate packed dimensions, gross weight in kilograms and preferred shipping date fields to the existing three-step quote form.
- Added event/venue details for exhibition and ATA enquiries; irrelevant weight/dimension controls are not shown for ATA consultations.
- The shared frontend/server cargo schema rejects nonpositive, malformed, excessive and overprecise weights, impossible calendar dates and overlong inputs.
- The server includes the new validated values in the email content. Contact and shipment-status callers remain compatible through optional defaults.
- Added explicit labels to the cargo controls and localized validation feedback.
- Prevented an old delayed reset from clearing a rapidly reopened dialog. Pending requests cannot be closed or duplicated through the dialog controls.
- Success still depends on API success. No simulated production-delivery confirmation was introduced.

### Content, trust and existing URLs

- Replaced unsupported About and Gallery counters with service/contact information, without changing the layouts.
- Removed several unverified certification, fixed-turnaround, network-size, fleet and platform-integration statements from service-catalog cards.
- Reworked the air-freight overview, advantages and FAQs to describe carrier acceptance, preparation and constraints without unsupported certification or transit promises.
- Removed selected unsupported certification-style trust labels and exhibition experience/24-hour bullets.
- Preserved the exhibition pillar layout and existing English/Arabic URLs.
- Added forwarding-specific guidance distinguishing forwarding, carrier operations, customs approvals and facility ownership.
- Added three distinct gateway sections for Riyadh, Jeddah Islamic Port and King Abdulaziz Port in Dammam. These are **planning considerations**, not assertions of new offices or direct port operations.
- Linked the gateway context to the checked official SPA source. Customs preparation continues to cite the checked ZATCA guidance.
- Kept the primary service heading and above-fold enquiry content visible in initial rendered HTML rather than relying on an opacity-zero entrance state.

### Performance and rendering

- Page modules now load by route. The initial route is resolved before both prerendering and hydration, preserving complete service HTML and EN/AR metadata.
- Added production response compression and verified gzip plus `Vary: Accept-Encoding`.
- Existing immutable hashed-asset cache headers remain in place.
- Current main JavaScript: **990.43 kB raw / 314.69 kB gzip**. This is the main-file comparison, not a claim about total page weight or all routes.

| Local mobile lab sample | After route splitting, before compression | After compression |
|---|---:|---:|
| Contact LCP | 4,928 ms | 2,548 ms |
| Exhibition service LCP | 5,324 ms | 4,384 ms |
| Contact CLS sample | 0.000845 | 0.000845 |
| Exhibition CLS sample | 0.000146 | 0.000146 |

Settings: 402×874 viewport, 40 ms artificial latency, 200,000 bytes/sec download throughput, 4× CPU slowdown, one fresh browser context per page. These are **single local lab samples**, not production field p75. LCP remains above the requested 2.5-second target in these samples; INP was not measured. Low sample CLS does not establish production Core Web Vitals compliance.

## Research and mapping outputs

- `saudi-keyword-and-competitor-audit.md`: methods, exact supplemental EN/AR searches, sources, confidence and extraction limits.
- `bilingual-keyword-database.csv`: 109 mapped opportunities in the master brief's requested column format; current ENVOD ranks explicitly unavailable.
- `master-service-coverage-map.csv`: a disposition for all 35 requested service categories, including reused pillars, Arabic destinations and gates for standalone expansion.
- The original 40-row SAL data remains intact and separate from ENVOD performance.
- Gateway sections reuse existing URLs rather than inventing thin city pages. Shared warehouse/3PL/local-distribution and other subservice intent needs confirmed scope and differentiated content before a new page is justified.
- `performance-before-compression.json` and `performance-lab-sample.json`: raw local measurement records.

## Tests actually run

- Workspace typecheck passed; artifact typecheck passed again after compression was added.
- Five enquiry-contract tests passed: compatibility, valid payloads, invalid weights, invalid dates, field bounds and privacy consent.
- Production build passed and prerendered all 92 content routes.
- All 92 local production routes passed HTTP, metadata, lang/dir, canonical, hreflang, H1, hierarchy and JSON-LD checks.
- Sitemap, 404/noindex, API validation, honeypot and rate-limit checks passed without sending email.
- Browser checks passed for contact prefill, failure/retry/success, quote field validation and transmitted values, conditional ATA fields, consent, reopening, Escape, call/WhatsApp URLs, equivalent-page language switching and Arabic mobile widths.
- The same browser workflow passed with production compression enabled.
- The local performance runner confirmed service headings/preparation content in a JavaScript-disabled browser.
- All valid test form POSTs were intercepted. No test email was sent in this continuation.

## Remaining work and external blockers

1. **Email delivery blocked:** verify the sender domain in Resend, then obtain authorization for another labeled send and distinguish provider acceptance from actual inbox delivery.
2. **Business proof pending:** the generated claims-candidate register still contains items needing contextual review and documentary evidence. It is not a count of confirmed false statements or a certificate that the entire site has been cleared.
3. **Specialist scope incomplete:** licensing, regulated cargo, partner facilities, fleet/warehouse ownership, memberships, named customers, specialist equipment and all proposed standalone service splits require confirmation. No credentials or facilities were invented.
4. **Performance incomplete:** improve remaining service-page LCP bottlenecks; investigate images/fonts, shared payloads and real-device behavior. Production LCP/INP/CLS remain unverified.
5. **Measurement unavailable:** no authenticated GSC/GA4 baseline, provider keyword volumes or real lead-quality records were supplied. Do not turn SAL metrics into ENVOD results or install duplicate/unapproved analytics tags.
6. **External editorial approval:** professional Arabic, legal-policy and business-detail approval remain required.
7. **Deployment not performed:** the public domain and separate Cloudflare frontend snapshot were not updated. Static-only exports still require a compatible external enquiry API.

The practical 90-day plan remains in `90-day-seo-roadmap.md`; measurement definitions and privacy limitations remain in `tracking-and-lead-measurement.md`.

---

## Earlier implementation baseline (historical; current results above take precedence)

# ENVOD KINGDOM — SEO implementation progress

Date: 17 October 2026. This is a progress report, **not completion of the full master brief**. Changes are in the Replit project; the separate public website has not been republished.

## Implemented

- Preserved existing English URLs and added equivalent `/ar` routes.
- Built 92 prerendered content pages, including bilingual privacy, terms and cookie notices.
- Added self-canonical URLs, reciprocal `en-SA`, `ar-SA`, and `x-default` links; generated the corresponding XML sitemap.
- Language switching retains the equivalent page. Arabic pages use `lang="ar"` and `dir="rtl"`.
- Contact and quote forms now call a server-side enquiry endpoint using the connected Resend service. The endpoint validates fields, requires consent, limits request size and rate, escapes email HTML, and includes a honeypot.
- Shipment status now explicitly means a manual enquiry, not a live tracking lookup.
- Added floating phone and WhatsApp actions with bilingual accessible labels.
- Added non-PII dataLayer events for contact/quote interactions and contact-channel clicks. No GA4 or GTM account has been connected; these events are not yet a measured analytics report.
- Removed unsupported homepage references to 25 years, 50 countries, SABER/SFDA certification, direct authority relationships and 24-hour clearance. This is only part of the claims audit.
- Removed the misleading tracking SearchAction and unsupported organization statistics from structured data.

## Checks performed

- TypeScript check passed.
- Production build passed and produced 92 routes.
- Parsed all 92 built pages: valid JSON-LD, correct HTML language, one canonical, three hreflang links and one H1 per page.
- Invalid enquiry rejected with HTTP 400.
- Honeypot submission returned HTTP 202 without sending email.
- Browser checked Arabic mobile shipment-status form; fixed RTL horizontal overflow caused by an off-screen honeypot.
- English shipment-status form showed validation and the success state with an intercepted API response. **This was a UI test, not a live delivery test.**
- No browser JavaScript errors in that test.

## Not yet verified

- Actual Resend acceptance and inbox delivery. Connected credentials allow sending but reject domain-list access; verified-domain status was not established. A controlled live send is still needed.
- All contact and quote modal interaction paths, full desktop/mobile route coverage and production 404 behavior.
- Search Console indexing, GA4 conversions, rankings, search volumes, keyword difficulty and backlink metrics. No authenticated data source was available.
- Core Web Vitals. The main production JS bundle is about 1.26 MB uncompressed / 399 KB gzipped. Do not claim the requested LCP, INP or CLS targets have been met.
- Professional Arabic editorial review.
- Legal/business review of the policy pages.

## Outstanding original scope

1. Complete the sitewide claims audit. About, service catalog, FAQs, exhibition content and footer still contain numerical, licensing, certification, network and service-level claims requiring evidence or replacement. Named client/membership logos also need approval/evidence.
2. Expand the keyword map beyond the initial customs sample, with independent Arabic and English research across all service clusters.
3. Complete the service-to-URL gap map. Distinct domestic transport, 3PL and city/port pages must be based on actual operational scope, not invented branches or thin templates.
4. Expand customs/port content using checked official sources, including documentation, SABER/SFDA applicability, duties, temporary imports and release dependencies.
5. Review all service definitions, processes, comparisons, limitations, FAQs, supporting links and above-fold calls to action.
6. Complete image sizing/lazy-loading, bundle/performance, accessibility and metadata-length work.
7. Add automated regression coverage for language switching, validation, delivery failure, duplicate submission, consent and rate limits.
8. Reconcile the separate Cloudflare standalone snapshot. It has not been synchronized with this server-dependent release.

## Hosting consequence

The website now has a runtime server for enquiries. Prerendered pages alone can still be hosted statically, but those forms need a separately hosted API. Do not replace the working static deployment with this version without confirming the server deployment and sender setup.

## Initial 90-day plan

### Days 1–14: accurate and measurable foundation

Complete the outstanding claim replacements; obtain evidence for credentials, facilities, fleet and customer references. Confirm sender authorization and perform one controlled delivery test. Finish regression tests, policy review and production setup. Connect Search Console and an approved analytics property; record a real baseline before claiming gains.

### Days 15–30: high-intent customs and freight

Complete independent EN/AR query research and the full URL map. Improve customs, ATA Carnet, exhibition, air/ocean freight and GCC pages. Add useful Riyadh/Jeddah/Dammam content only where operational facts and local needs distinguish it. Review canonical and sitemap coverage after publication.

### Days 31–60: verified service coverage

Confirm and document domestic fleet availability and whether vehicles/warehouses are owned, leased or partner-arranged. Build differentiated 3PL, storage, cold-chain and project-cargo content where supported. Publish permitted case studies instead of unsupported counters. Measure mobile performance and fix the largest measured bottlenecks.

### Days 61–90: improve from observed demand

Use actual Search Console queries and qualified-enquiry data to adjust titles, FAQs, internal links and content priorities. Review indexed pages, query-to-page overlap, form completion and lead quality. Compare the baseline using consistent dates and filters; do not equate traffic increases with revenue.

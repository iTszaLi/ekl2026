# Updated SAL benchmark brief — implementation report

**Continuation:** the owner's subsequent bilingual master brief was implemented in an additional batch. Current rendering, quote-field, claim-cleanup and performance results are in `seo-implementation-report.md`; this SAL-specific report is retained as the earlier benchmark milestone.

Date: 17 October 2026. Scope is the owner's updated competitor-keyword brief. This report distinguishes completed implementation from evidence and production checks still unavailable.

## Research deliverables

- `sal-competitor-keywords.csv`: exact eight-column import of all 40 unique supplied keyword rows. Raw volume, unavailable values and relative updated strings are preserved.
- `sal-keyword-disposition.csv`: an action for every one of the 40 rows, including excluded SAL names and ambiguous queries.
- `envod-keyword-opportunity-map.csv`: 109 initial EN/AR opportunities with source class, intent, URL, priority and evidence status; no invented numerical demand.
- `keyword-to-page-map.csv`: all 46 English pages paired with Arabic metadata, rendered H1, hierarchy warnings and relevant internal links.
- Brand strategy, competitor gap analysis, claims register, technical audit, roadmap and measurement plan complete the ten requested file categories.
- Additional exports: `business-claims-candidates.csv` and `audit-summary.json`.
- `scripts/build-envod-seo-research.py` reproduces benchmark import and local page exports, asserting all 40 source rows and dispositions are retained.

## Live research

Searched SAL service content, generic EN providers, independent Arabic providers, specialist cargo and brand ambiguity. Fetched SAL fulfillment/handling, Arabic Saad, bilingual GBE, SMI exhibition, ZATCA import instructions and Kingdom Logistics About. Detailed observations, confidence and exact URLs are in `competitor-gap-analysis.md` and `brand-search-strategy.md`.

No Google Saudi ranking position was independently measured. Supplied SAL metrics are not ENVOD metrics. No traffic gains, keyword rankings or revenue improvements are claimed.

## Code changed

- Home metadata focuses on ENVOD and Saudi logistics without an excessively long list of services.
- About names the business and explains ENVOD brand wording without making an unverified claim about the ambiguous Kingdom Logistics domain.
- Main service CTAs now navigate to the server-backed Contact page with a known service slug; the form pre-fills the enquiry context and protects against submission while pending.
- Six distinct bilingual preparation blocks cover customs, ocean, air, GCC/road, exhibition and ATA requirements and limitations. The exhibition design remains intact.
- Customs overview, advantages and FAQs no longer claim a registered-broker credential or 24-hour outcomes without evidence; the source-linked preparation section cites the checked official ZATCA instructions.
- Footer copy no longer includes the edited 25-year expertise statement or ISO-style badge.
- The map layout remains, but non-Riyadh office candidates are no longer displayed as branches. Unsupported map counters and round-the-clock status wording were replaced with contact/service information.
- Fixed production static-directory redirects so clean prerender URLs do not conflict with slash normalization.
- Fixed the controlled service selector's empty initialization event clearing a prefilled service, and contained offscreen entrance animations that caused initial Arabic mobile overflow.
- Corrected service-catalog heading hierarchy and added quote-dialog naming, scroll containment, Escape handling, focus containment and focus restoration.
- Existing English URLs, Arabic counterparts and page layouts remain in use. No thin city pages, unsupported Article/review schema or competitor-brand targeting pages were created.

## Verification record

Earlier baseline: typecheck/build and a 92-page markup audit passed; Arabic mobile shipment-status validation and an intercepted success response passed without browser errors. Those earlier checks are not proof of this update's delivery.

Current verification **passed**:

- TypeScript checks and the production build; 92 prerendered routes.
- Actual local production HTTP responses for all 92 routes: correct language/direction, canonical, three hreflang annotations, one H1, heading hierarchy and valid JSON-LD.
- Sitemap count matches the 92 routes; unknown page returns 404 with noindex.
- Invalid API input returns 400, honeypot returns 202 without forwarding, and the sixth request in the configured limit returns 429.
- Browser: service-to-contact prefill survives submission; mocked provider failure preserves entered fields; retry reaches success and emits the success event.
- Browser: quote service selection, cargo/contact steps, required consent, intercepted success and Escape closing passed.
- Arabic customs, service-prefilled contact and shipment-status routes passed mobile lang/dir and initial horizontal-overflow checks. No browser page errors were captured.
- Desktop app-preview screenshot and a production Arabic mobile screenshot were visually checked.

Reproducible checks: `scripts/verify-envod-seo.py --origin http://127.0.0.1:PORT` and `scripts/verify-envod-browser.mjs` against a temporary local production server. The browser runner requires an installed Playwright module/browser, configurable through `PLAYWRIGHT_MODULE` and `TEST_BROWSER_EXECUTABLE`. Never point these tests at the public site.

Current main JS output: 1,276.92 kB uncompressed / 403.89 kB gzip. This is a build-size measurement, not Core Web Vitals.

All valid browser submissions in the automated checks were intercepted. A mocked API response validates UI behavior only, never real delivery.

### Authorized live test — 17 October 2026

After the owner approved one clearly labeled test enquiry to the listed business inbox, one POST was made through the running website's submission endpoint. Resend rejected it with HTTP **403** and error name **`validation_error`**; the website returned HTTP **502** with its delivery-failure message. No automatic retry was made, and provider acceptance/inbox delivery was not established.

The provider's detailed error message was not recorded by the endpoint, so the precise cause is not confirmed. Verify the configured sender's domain and sending authorization before another authorized attempt. The connected integration alone does not establish that a particular sender domain is verified.

## Unresolved evidence / scope

- Live Resend acceptance is blocked by the recorded 403 validation error. Sender/domain authorization needs confirmation before a further authorized test; inbox delivery remains unverified.
- Legal business details, credentials, fleet/warehouse claims, membership/client permissions and historic statistics require owner evidence. Remaining candidates are explicitly registered, not declared verified.
- First-party Search Console/GA4 and numerical keyword-provider data are unavailable; measurement setup is documented.
- Professional Arabic editorial and legal-policy approval remain external review requirements.
- City pages, new articles and additional service splits are conditional on differentiated validated content and operational facts. They were not fabricated to satisfy a URL count.
- Comprehensive image/performance optimization and real-user Core Web Vitals measurement are not complete.
- The separate Cloudflare snapshot and the public website have not been updated or published. The current server-dependent form architecture must be accounted for before either deployment is replaced.

The research package and targeted code improvements are delivered; the full ongoing SEO program, evidence collection, performance work and production rollout are not represented as complete.

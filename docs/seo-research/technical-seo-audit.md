# Technical SEO audit

Scope: the Replit project, not an assertion that the public domain has received these changes. Date: 17 October 2026.

**Latest continuation:** route-based page loading now preserves prerendered HTML, production compression is enabled, optional validated cargo/date/event fields are supported, and further claims were reworded. Current measured results and remaining gaps are in `seo-implementation-report.md`.

## Existing implementation retained

- English URLs remain unchanged. Arabic equivalents use `/ar`.
- The last baseline build generated 92 content routes with canonical and reciprocal EN/AR/x-default annotations.
- `prerender.mjs` generates content HTML and sitemap together; `spa.html` is a noindex fallback.
- One H1 was found on every baseline built page; valid JSON-LD was parsed on all 92.
- Server-side enquiry validation, consent, payload limit, in-memory IP rate limit, honeypot and provider-error handling are present.
- Policies are crawlable, bilingual pages. They require owner/legal review, not a claim of regulatory certification.

## This update

- Shortened Home's English title and description around ENVOD and relevant logistics intent.
- Added visible About entity explanation without treating ambiguous “Kingdom Logistics” as a verified alias.
- Changed principal service quote links to the server-backed contact route, carrying a known service slug into the form. Direct email remains an optional secondary channel.
- Added six distinct bilingual shipment-preparation sections for customs, ocean, air, road, exhibition and ATA enquiries.
- Added a checked ZATCA citation and clarified product-approval versus company-certification distinctions.
- Removed unsupported licensing and fixed-turnaround wording from the customs overview, advantages and FAQs.
- Removed legacy expertise figures and certification-style badges from the footer wording edited here.
- Limited the location map to the listed Riyadh contact location; legacy unverified branch pins, numerical counters and 24/7 status wording are no longer displayed there.
- Corrected the service-catalog hierarchy, production clean-URL redirects, service-selection initialization and initial RTL animation overflow.
- Added quote-dialog naming, bounded scrolling, Escape handling and keyboard focus containment/restoration.

## Audit exports

`keyword-to-page-map.csv` records all English pages paired with Arabic titles/descriptions, rendered H1, hierarchy warning, related service/contact links and evidence gaps. It is a local markup/content audit, not Search Console performance.

`audit-summary.json` records generated counts. Rerun `python scripts/build-envod-seo-research.py` after a fresh build; otherwise CSV metadata reflects the previous build.

## Remaining findings

| Priority | Finding | Required outcome |
|---|---|---|
| P0 | One authorized live test rejected by Resend: 403 `validation_error`; API returned 502 | Confirm sender/domain authorization and obtain approval before another send; detailed cause and inbox delivery remain unverified |
| P0 | Legacy business claims remain outside edited surfaces | Review candidates and substantiate or replace EN+AR |
| P1 | Short/long metadata needs per-page review | Heading hierarchy now passes the local 92-route audit; don't pad descriptions solely to meet a character count |
| P1 | Source authority for regulated cargo incomplete | Check SFDA/SABER and other current official sources before expanding regulatory details |
| P1 | Canonical origin assumes the owner's supplied public `.net` website | Validate domain routing and canonical/indexing after actual publication |
| P1 | Static-only standalone snapshot is not synchronized | Connect a separate API or adopt the server deployment; never silently discard forms |
| P2 | Main JS now 990.43 kB uncompressed / 314.69 kB gzip; mobile lab LCP still exceeds 2.5s | Continue measured optimization; no production Core Web Vitals success claim |
| P2 | Image dimensions/lazy-loading remain inconsistent | Inspect actual image sizes and viewport behavior; preserve hero quality |
| P2 | Full keyboard/screen-reader and professional Arabic review pending | Test menus, dialogs, error focus, labels and semantic content |
| P2 | In-memory rate limits are per process and reset on restart | Reassess for a scaled production deployment and actual abuse patterns |

## Production acceptance

Check actual HTTP statuses, trailing slash redirects, unknown routes/noindex, static assets, sitemap canonical coverage, EN/AR reciprocity, schema/visible-copy agreement, navigation and contact flows. Validate Rich Results eligibility separately; syntactically valid JSON does not promise a Google feature. No new Article/Review/AggregateRating schema was added without qualifying content.

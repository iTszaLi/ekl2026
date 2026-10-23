# Animated counter and trust-metric audit

**Audit date:** 2026-10-22
**Scope:** Isolated ENVOD Kingdom Replit review copy only. No production repository, Vercel deployment, DNS, or public website files were changed.

## Result

The review copy now has a regression check for server-rendered metric values, and its interactive counters have been tested in Chromium. The live public homepage still returns zero-valued initial counter markup. That is a separate production issue and remains unchanged because this review was explicitly kept isolated from the Vercel/GitHub site.

## What was checked

- Reviewed all three animated-counter implementations: homepage results, the home trust block, and the services-directory summary.
- Checked counter initialization, visibility triggers, requestAnimationFrame cleanup, reduced-motion behavior, accessible labels, and bilingual rendering.
- Built the app and inspected the generated English and Arabic HTML without relying on JavaScript to supply the final values.
- Scanned every generated HTML page for the known zero-valued placeholders.
- Opened the review copy at desktop and mobile sizes, including the Arabic services page.
- Compared the public homepage’s raw HTML response with the isolated review build.

## Before and after

| Check | Public site response observed | Isolated review copy |
|---|---|---|
| Homepage statistics before JavaScript runs | `0+ Shipments Delivered`, `0+ Corporate Clients`, `0+ Countries Served`, and `0.0% On-Time Delivery Rate` appear in the delivered HTML | Approved review values and labels are in the prerendered HTML; the unsupported shipment, client, and country totals are not emitted |
| On-time delivery | Public initial HTML is `0.0%`; its eventual client-side target was not established in this audit | 98% is the initial HTML value and the approved animation target |
| Years of experience | The public response did not provide a usable no-JavaScript value for the reviewed metrics | 25+ is present before animation and is owner-supplied |
| Arabic | The production initial-value behavior was not tested beyond the root response | Arabic labels and final values are prerendered; numeric suffixes are explicitly left-to-right |
| No-JavaScript fallback | Public response displays zero placeholders | The regression check strips scripts/styles and verifies the prerendered metric text |

## Approved values and claim boundaries

The review copy retains:

- **98% on-time delivery** — the owner approved this replacement for the prior 99.8% figure. No measurement window, denominator, or operations report was supplied.
- **25+ years** — owner-supplied; no independent operating records were supplied.
- **50+ fleet vehicles, 100% shipment tracking, and 24/7 customer support** — owner-confirmed; fleet inventory, service-scope documentation, and service-hours evidence were not attached.
- **25+ years supporting exhibitions, 500+ events coordinated, and 24-hour ATA Carnet processing** — retained only on the featured Exhibition card, per the prior owner approval. These are not generalized to other sections.
- **“Customs clearance often within 24 hours”** — remains qualified and limited to the previously approved hero/featured placement; it is not a universal clearance-time promise.

The review copy does **not** restore 10,000+ shipments, 500+ corporate clients, 50+ countries served, 99.9% on-time delivery, or the old 99.8% rate. The claim register is `seo-stat-claims-review.csv`.

The service-directory heading reports 24 catalog records; the separate Door-to-Door enquiry offer makes the total directory offering count 25. The operations map lists six city cards. Neither count is an animated business-performance claim.

## Browser and build verification

- `pnpm --filter @workspace/envod-kingdom run build` — passed; generated 93 routes, the SPA shell, and sitemap (94 HTML files scanned).
- `pnpm run typecheck` — passed across the workspace packages.
- `pnpm --filter @workspace/envod-kingdom run test:counters` — passed; required English/Arabic homepage and services values were present, and no known zero placeholders were found across the 94 prerendered HTML files.
- Chromium, normal motion: the homepage counter read 98% before entering view; after scrolling, it was 35% at 300 ms and reached 98% by 2 seconds. Scrolling away and back left it at the final value.
- Chromium, reduced motion: `prefers-reduced-motion: reduce` was active; the final value remained visible before and after the section entered view.
- Direct services and Arabic services routes loaded with final metric text. At a 402 px mobile viewport the Arabic services page had no horizontal overflow.
- The services strip displayed `50+` correctly in Arabic after applying left-to-right direction to the numeric portion. Screen readers now receive one stable final value and label instead of the changing visual digits.
- App preview logs contained Vite connection and React DevTools messages, with no application runtime errors.

Non-blocking build warnings remain for source-map positions in the existing tooltip/select UI modules and the existing 998.8 kB JavaScript chunk (over Vite’s 500 kB warning threshold). They did not prevent prerendering or counter checks.

## Production findings and limits

The public homepage returned HTTP 200 during the read-only check. Its initial HTML includes zero placeholders and old JSON-LD service descriptions containing **50+ countries** and **80+ countries**. Those country counts are not independently substantiated and are absent from the review copy.

The public response did not contain “A Decade of Trusted Results” or “0/7 Operations.” This audit only establishes the contents of the homepage response and the local review build; it does not establish the hydrated counter targets on production or prove absence across every public route.

No production files were edited or published. The live initial-HTML defect and stale country counts remain outstanding until the production source is separately reviewed and approved. The owner-confirmed performance claims also still need source records and measurement definitions before they can be independently substantiated.

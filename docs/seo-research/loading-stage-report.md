# Controlled loading stage and full-brief status

Date: **17 October 2026**. Continues the attached SEO/AEO/GEO implementation brief without restarting or redesigning the site. This report is the latest stage summary; it does **not** claim that the entire brief, editorial programme or live email setup is complete.

## Backup before changes

A verified local source/configuration/asset archive was created before this stage's source edits:

`generated-artifacts/backups/envod-before-loading-stage-20261017T152604Z.tar.gz`

- 582 files; 63,636,829 bytes.
- SHA-256: `bf9f65c0fd39011c576c96aa8c11087c6e6a9ac1ef1068cb2904139bcb26b46c`.
- Dependencies, build outputs, caches, Git, local tooling, private agent context, symlinks and credential/environment files are excluded.
- This is a local source backup, not an off-site backup of hosted services or managed secrets. Extract into an empty directory and inspect before restoring.

## Changes completed in this stage

1. Removed the runtime schema-library import from the always-mounted quote modal. Browser cargo checks now use small dependency-free predicates and shared limits. **Server-side Zod validation remains in place.** A boundary-case parity test protects the shared rules.
2. Added 1024px and 1280px responsive derivatives of the **same existing exhibition photograph**, not new or replacement imagery. The original 1536×1024 source remains the fallback and is selected on high-DPI mobile screens.
3. Kept the exhibition hero eager and high priority. Added correct intrinsic dimensions and conservative mobile source sizing that accounts for the tall `object-cover` banner rather than assuming that visible viewport width is sufficient source resolution.
4. Added measured intrinsic dimensions to the shared header and footer logos. Preserved CSS dimensions and aspect handling; browser tests checked footer size and mobile overflow.
5. Extended the existing lab script to record repeated cold contexts and the LCP element. Added focused responsive/no-JavaScript regression checks.

Existing exhibition copy, titles, URLs, section structure, FAQs, brand assets, CTA design and language equivalents were not rewritten. No new content URL, third-party tag, profile submission or outreach was added.

## Measured results—not ranking or field-CWV claims

Protocol: 402×874 viewport, fresh browser context per sample, 40ms artificial latency, 200,000 bytes/sec download throughput, 4× CPU slowdown. **Three samples per page before and three after**, on a local production server. Third-party font/network timing and host activity were not fully controlled.

| Measure | Before | After | Interpretation |
|---|---:|---:|---|
| Exhibition median LCP | 3,804ms | 3,284ms | 520ms lower in these samples, approximately 13.7%; still above 2.5s |
| Contact median LCP | 1,824ms | 2,116ms | 292ms higher; no contact-page LCP improvement claimed |
| Exhibition initial encoded script body bytes, first sample | 383,557 | 371,715 | Approximately 3.1% lower |
| Contact initial encoded script body bytes, first sample | 382,533 | 370,475 | Approximately 3.2% lower |
| Maximum sampled exhibition CLS | 0.00565 | 0.00565 | No improvement claimed |
| Maximum sampled contact CLS | 0.000845 | 0.000845 | No improvement claimed |

- Exhibition LCP samples: **3,840 / 3,804 / 3,796ms before**, **3,324 / 3,284 / 3,256ms after**. The hero image was the recorded LCP element.
- Contact LCP samples: **2,936 / 1,808 / 1,824ms before**, **2,036 / 2,116 / 2,136ms after**. The H1 was the recorded LCP element.
- The 1× mobile hero source is 157,436 bytes versus the original 226,490 bytes, approximately 30.5% smaller. Higher-DPI clients may retain the original; this is not a universal image-transfer saving.
- The original image is unchanged. The additional 1280px derivative is 207,840 bytes.
- These observations do not establish causation for every timing difference or a statistically reliable improvement. Contact timing remains an investigation item rather than being dismissed as noise.
- No production field p75, INP measurement, ranking gain or conversion-rate gain is claimed.

Raw measurements: `loading-stage-before.json` and `loading-stage-after.json`.

## Verification completed

- Full workspace TypeScript checks passed.
- Production client/SSR build passed; **92 pages, 46 EN and 46 AR**, prerendered.
- Ten server enquiry test groups passed, including provider receipts/failure/timeout, spam, rate limits, recipient preservation and safe payload rendering.
- Six contract test groups passed, including client/server cargo-validation parity across 24 boundary cases.
- All 92 local production routes passed status, metadata, JSON-LD, canonical, hreflang, lang/dir, H1/hierarchy and sitemap checks. 404/noindex behavior and safe API invalid-request checks passed.
- Existing browser flows passed: service prefill, both form failures/retries/accepted responses, consent, missing acceptance receipts, cargo fields, ATA-specific fields, Escape/reopening, privacy links, rate guidance, WhatsApp/call links and language switching.
- Focused image checks passed in EN/AR: 1× responsive source, original fallback, original 3× mobile source, intrinsic dimensions, eager/high-priority loading, footer geometry, no overflow and no JavaScript errors.
- Exhibition H1 and shipment-preparation content remained visible with JavaScript disabled in both languages. Existing customs no-JavaScript content checks passed.
- Existing keyword explorer and EN/AR guide-fragment/table regression checks passed.
- Managed preview restarted; workflow and fresh screenshot-browser checks were clean. Desktop English and mobile Arabic exhibition screenshots retained the established design.

**No valid test submission reached the real provider during this stage.** Server tests inject providers; browser tests intercept valid POSTs. No live email, publisher outreach or production publication occurred.

## Full master-brief coverage and remaining work

| Phase | Current implementation/evidence | Remaining scope |
|---|---|---|
| 1 — Research and evidence | Competitor reports, dated public search/source observations, claims register and bilingual keyword maps exist in this directory | Actual GSC/GA4/GBP access, dated demand/ranking data and owner business records are missing; observed pages are not proven ranking competitors |
| 2 — Technical accuracy and lead generation | Manual shipment-status enquiry, server-side email implementation, privacy/terms routes, metadata/heading corrections, route splitting/compression and this loading stage | Live provider rejection, more image-sizing/loading work, contact timing investigation and standalone synchronization remain unresolved |
| 3 — Bilingual architecture | 46 equivalent EN/AR page pairs, reciprocal hreflang, canonical/lang/dir, localized routing/navigation and prerendered content are locally tested | Professional commercial/regulatory Arabic review and production crawl/indexing verification remain necessary |
| 4 — Service/local content | Priority service pairs improved; customs gateways, exhibition/ATA distinctions, FCL/LCL and shipment-preparation checklists use existing pages | Review remaining company assertions; do not invent branches, vehicles, facilities, certifications or regulated-cargo capabilities |
| 5 — Articles and authority | Backlink opportunities, submission drafts, linkable-asset plan and 90-day roadmap are prepared | **The requested initial 10–15 substantial reviewed articles have not been delivered.** Existing service sections are not counted as standalone articles. Editorial, regulatory and Arabic review remain pending; no links were acquired |
| 6 — Structured data and trust | Local JSON-LD/visible-content consistency and business identifiers have been checked; no fabricated rating/review schema added | Owner verification of remaining business claims and published-site validation are not complete; rich results are not guaranteed |
| 7 — Conversion and measurement | Privacy-limited event definitions and form acceptance/failure behavior are implemented; measurement instructions/templates exist | No authorized collector/property baseline or real qualified-lead attribution is active; events are not proof of measured leads |
| 8 — QA and handover | Source backup, build, route/form/RTL/no-JS tests, lab samples and this report | Remaining phases need their own review gates; field CWV and live/public deployment checks remain open |

### Important blockers carried forward accurately

- **Email:** the owner reported sender-domain verification complete, but the one separately authorized live test received provider-integration HTTP 403 and website HTTP 502. The later reported account-confirmation link was expired. That does not establish the precise cause of the sending API rejection. See `../enquiry-email-delivery.md`; obtain fresh approval before any new live test.
- **Claims:** 45 existing automated candidates require contextual review; they are not 45 proven false claims. Company records are needed before calling the register fully verified.
- **Measurement:** 149 keyword/opportunity rows are not 149 measured rankings. Unmeasured seeds remain labeled backlog. No fabricated volumes, backlink counts or search gains were introduced.
- **Standalone:** `envod-kingdom-standalone/` remains unchanged. Synchronize deliberately when its separate backend URL, CSP/CORS and deployment arrangement are ready; do not imply that a static bundle includes the Express API.
- **Performance:** exhibition lab LCP remains above target; the contact median did not improve. Production behavior, high-DPI transfer and third-party fonts need further measured work.

## Reproduction

```sh
pnpm run typecheck
pnpm --filter @workspace/envod-kingdom run test:enquiries
pnpm --filter @workspace/envod-kingdom exec tsx --test ../../scripts/enquiry-contract.test.ts
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build
```

Against an isolated local production server, run the existing route/browser/organic-growth checks plus `scripts/verify-envod-loading.mjs`. The lab script accepts `PERF_SAMPLE_COUNT=3` and `PERF_OUTPUT` alongside the existing Playwright executable/module and local origin settings. Keep valid submission interception enabled; these are not authorized live-mail tests.

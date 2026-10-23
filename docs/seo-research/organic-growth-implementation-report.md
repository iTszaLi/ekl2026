# Organic-growth implementation report

Completed research/implementation batch: **17 October 2026**. This implements the attached keyword/backlink expansion brief alongside the existing SEO work; it does not claim a completed outreach campaign, a public deployment, or verified search growth.

## Required deliverables

| Requested output | Result |
|---|---|
| Prioritized Saudi EN/AR database | `ksa-organic-keyword-database.csv`: **149 rows**, including 40 explicitly unmeasured backlog candidates |
| Searchable database | Offline `keyword-explorer.html` in the downloadable package; phrase/language/service/priority filters, empty/reset states and filtered CSV download |
| Keyword-to-page map | Separate `keyword-to-page-en.csv` (**86**) and `keyword-to-page-ar.csv` (**63**); original 46-page bilingual page audit retained |
| Real-source competitor research | `organic-growth-research-log.md` plus `competitor-gap-analysis.md`, with fetched versus excerpt-only confidence |
| Backlink opportunity database | `backlink-outreach-tracker.csv` and source JSON: seven inspected public pathways, three clearly unverified chamber candidates |
| Outreach plan | `ksa-backlink-opportunities.md` and `backlink-outreach-plan.md`; no outreach sent |
| Linkable assets | `linkable-assets-plan.md`: eight useful assets mapped to existing bilingual service pages |
| Local visibility audit | `local-visibility-audit.md`: code consistency, owner-verification gates, actual citation findings and profile-access limits |
| Conversion report | `tracking-and-lead-measurement.md`, blank defined baseline and weekly/monthly reporting CSVs |
| 90-day plan | Updated `90-day-seo-roadmap.md` with evidence-first keyword, citation and editorial work |
| Build/tests | Results below |
| Blockers | Explicitly listed below; none replaced with fictional measurements |

## What was implemented in the site

1. **Ocean freight:** new EN/AR FCL/LCL comparison with container use, quote inputs, handling and full-route cost considerations. No fixed price, transit time or invented volume threshold. A checked Maersk reference explains FCL; no carrier partnership is implied.
2. **Project cargo:** new EN/AR cargo dimensions/centre-of-gravity, site/route, lifting/securing and responsibility checklist. Vehicle examples are planning choices, not an owned-fleet assertion.
3. **Temperature-controlled logistics:** new EN/AR product, temperature, handover, monitoring and operator-evidence checklist. No validated range, GDP certification, cold-store ownership or equipment availability was invented.
4. **Nine existing service pages:** preparation sections now have stable `#shipment-preparation` anchors and contextual links to relevant guides. Includes customs, forwarding, air/ocean, ATA, exhibition, GCC, project and temperature-control pages.
5. **Fragment navigation:** the previous asynchronous scroll-to-top reset no longer overrides a guide fragment. Preparation sections scroll after lazy-route content renders; direct and client-navigation links were tested in EN/AR.
6. Existing page layouts, exhibition experience, legal/service URLs, reciprocal language architecture, metadata and 92-route prerendering were retained. No thin city/vehicle pages, hidden keyword lists or mass-generated articles were added.

The earlier route-splitting, compression and validated enquiry work remains documented in `seo-implementation-report.md`. No new performance measurement was claimed in this batch; the earlier mobile LCP limitation remains open.

## Research conclusions

- No reliable source supports an assertion of thousands of measured relevant queries. The 40 additional seeds are **a research backlog**, not manufactured volume.
- English and Arabic vehicle terminology were researched independently; source content does not prove exact-query demand or ENVOD capability.
- SAL metrics remain owner-supplied competitor estimates with missing market/date provenance, not ENVOD metrics.
- The actual Saudi Google ranking-competitor and ENVOD-rank fields remain unavailable. Observed competitor pages are stored separately.
- A directory citation is not necessarily a backlink: Freightnet explicitly reserves direct website links for Premium.
- Membership and event routes are conditional business relationships, not guaranteed placements. Three chamber service pages are not represented as verified backlink offers.
- The public homepage still contains legacy claims that differ from current workspace copy. No public site or profile was updated.

## Verification actually completed

- Artifact TypeScript check passed.
- Production build passed and prerendered **92 URLs**.
- All **149** mapped target files and referenced fragments exist in the production build.
- The 40 new candidate rows contain no invented volumes; source classes and operational gates remain explicit.
- All 92 local production routes passed HTTP/metadata, JSON-LD, canonical/hreflang, lang/dir, H1/hierarchy and sitemap checks; 404/noindex, API validation, honeypot and rate-limit checks passed without email.
- Searchable export: AR language filter, Arabic text search, zero-result/reset behavior, filtered CSV contents/download and mobile width passed.
- Service guides: EN/AR mobile comparison tables, direct fragments, client-side related-guide fragments, new checklist contents and absence of JavaScript errors passed.
- Existing browser regressions passed: contact prefill/failure/retry/success, quote validation/payload/conditional fields/consent/reopening/Escape, call/WhatsApp links, equivalent-page language switching and Arabic mobile widths.
- All valid form POSTs were intercepted; no live email, profile submission or outreach was sent.

## Remaining external and editorial work

1. **Analytics/search access:** no attached or already-authorized GSC, GA4 or GBP connection was available. Authorize the appropriate existing property/profile or provide dated, filtered exports; never send passwords. Baseline metrics are unavailable, not zero.
2. **Business verification:** approve premises, hours, services, operator/fleet/facility distinctions, current memberships and image rights before listing or promoting gated terms.
3. **Outreach authorization:** approve each proposed submission, applicable commercial terms and any budget. Publisher review and link inclusion remain outside our control.
4. **Content approval:** professional Arabic and responsible operational/regulatory review remain necessary, especially for regulated cargo and event/carnet details.
5. **Live delivery:** Resend sender-domain verification is still blocked. The previous single approved test failed; no new live send occurred.
6. **Performance/publication:** mobile LCP targets and production field INP/CLS remain unverified. No public deployment or separate static snapshot synchronization was performed.

## Reproduction

- `python scripts/build-envod-organic-growth.py` regenerates the research exports and self-contained explorer.
- Existing SEO/build and browser verifiers remain in `scripts/`; `verify-envod-organic-growth.mjs` adds the explorer and linked-guide checks.
- See the research log for actual queries and confidence; the generated CSVs never turn a candidate into measured evidence merely by exporting it.

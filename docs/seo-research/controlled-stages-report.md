# Controlled SEO/AEO/GEO stages — completion and outstanding issues

Date: **17 October 2026**. This is the latest continuation report for the full brief. It records a completed audit/research pass and targeted implementation; external validation and the entire growth programme are **not** claimed complete.

## Stage 0 — backup before material changes: complete

A verified local source/configuration/assets archive was created before the changes:

`generated-artifacts/backups/envod-before-controlled-seo-20261017T141014Z.tar.gz`

- 648 archive members; 46,121,195 bytes.
- SHA-256: `79a2799783f46018e8006c848237550324ca8869107b52a1349239062d5b5bc9`.
- Source, configuration, research documents, app assets and the separate existing standalone snapshot are included.
- Dependencies, build products, caches, Git internals, symlinks, environment files and Replit-managed secrets are excluded.
- Extract to a separate empty directory and inspect before restoring. Reinstall pinned dependencies and reattach managed secrets; do not blindly overwrite the live workspace.

This is a local archive, not a claim of an off-site disaster-recovery backup. Its manifest is in `generated-artifacts/backups/latest-controlled-seo-backup.json`.

## Stage 1 — existing-site audit and Saudi research: complete within stated access

- Inventoried all **92 built content URLs: 46 EN and 46 AR**.
- Checked page titles, descriptions, canonical values, H1 counts, internal links/fragments and linked image files/alt-attribute presence.
- Baseline: **zero** broken internal links, missing linked fragments, missing image files, images missing an alt attribute, duplicate-title groups or duplicate-description groups.
- Audited priority copy and found unsupported time, history, network, fleet and issuer-role assertions.
- Researched customs gateway, exhibition/ATA, forwarding/ocean and GCC intent independently in EN/AR. See `controlled-saudi-search-landscape.md` and raw observations.
- Inspected relevant ZATCA and ICC ATA announcements. Page visibility in a public search result is not a Saudi ranking measurement.
- Reviewed existing lead-event coverage, enquiry behavior, backlink research and account-access blockers.

**Audit boundaries:** static/build and local HTTP/browser checks cannot establish actual Google indexing, current production rankings, real field Core Web Vitals, business licensing, event appointments, fleet ownership or inbox delivery.

The all-page audit found **1,184 repeated image occurrences without both intrinsic width/height attributes**. This includes shared images across many URLs and CSS-sized layouts; it is not 1,184 distinct images or proof of layout shift. Investigate measured above-the-fold images first rather than changing sizing blindly.

Baseline machine inventory: `controlled-stage-1-audit.json`.

## Stage 2 — priority implementation and regression gate: complete

Affected existing page pairs:

- `/services/customs-clearance` and `/ar/services/customs-clearance`
- `/services/exhibition-logistics` and `/ar/services/exhibition-logistics`
- `/services/ata-carnet` and `/ar/services/ata-carnet`
- `/services/freight-forwarding` and `/ar/services/freight-forwarding`
- `/services/ocean-freight` and `/ar/services/ocean-freight`
- `/services/gcc-transportation` and `/ar/services/gcc-transportation`

### Content, metadata and AEO/GEO

- Replaced unsupported 24-hour ATA processing/clearance claims with eligibility, issuing-association, document and customs-dependency explanations in both languages.
- Distinguished freight coordination from carnet issuance by an authorized association. No ENVOD issuing authorization was invented.
- Removed selected unverified priority-page age/network/fleet/zero-claim/privileged-relationship assertions.
- Retained named exhibition events as planning context, not claimed appointments or completed work.
- Added a fetched official ZATCA reference on the exhibition/ATA preparation sections.
- Added concise relevant metadata descriptions for six priority services in both languages, including accurate Riyadh Dry Port, Jeddah Islamic Port and King Abdulaziz Port Dammam terminology.
- Updated the ATA English title to remove the unsupported processing-time promise. The established exhibition title was preserved.
- Existing visible FAQ content and generated FAQ structured data continue to share the same content source.

### Lead reliability

Added privacy-safe request-failure events to both forms. Successful API response, actual email delivery and lead qualification remain explicitly distinct. See `lead-event-measurement-contract.md`.

### Preservation and tests

- Workspace-wide TypeScript checks passed.
- Production build passed; **92 URLs** prerendered.
- Compared baseline/post-change inventories: **all routes, existing fragment IDs, image sources and H1 counts were preserved across all 92 pages**.
- Exactly one title changed (EN ATA) and 12 descriptions changed (the six EN/AR priority pairs); those descriptions are at most 180 characters.
- Post-change internal link/fragment/image-file/alt-presence and duplicate-title/description checks remained clean.
- Local production HTTP verification passed on all 92 routes, including metadata, JSON-LD, canonical/hreflang, lang/dir, headings, sitemap, 404/noindex and API validation/honeypot/rate-limit behavior.
- Browser verification passed for both form failure/retry/success flows, optional cargo-field validation/payload, ATA conditional fields, consent, reopening/Escape, contact prefill, contact links, equivalent language switching and Arabic mobile layouts.
- Event checks asserted one failure and one successful retry per form test, with test name/email/phone values absent from the event queue.
- Offline keyword explorer filtering/export and EN/AR mobile direct/client-side guide-fragment tests passed.
- All valid form POSTs were intercepted. **No live email was sent.**

Post-change inventory: `controlled-stage-2-audit.json`. Its priority regex candidates fell from 36 to one, which is a negative disclaimer about unverified ownership/licensing. This is a pattern-check result, not proof that every business assertion has been legally cleared.

## Stage 3 — legitimate opportunity and measurement preparation: complete

- Retained the **149-row** EN/AR database: 109 existing opportunities plus 40 unmeasured backlog candidates; no synthetic count inflation.
- Retained seven inspected public directory/membership/event pathways and three chamber research candidates, not acquired backlinks.
- Prepared publisher-specific Logistics Middle East and Eye of Riyadh drafts in `publisher-submission-drafts.md`.
- Kept profiles, fees, image rights, actual business details and submission approval as gates. No publisher was contacted, no account changed and no money spent.
- Defined event interpretation and reporting boundaries; no vendor tag, measurement property or business result was fabricated.

## Outstanding issues and next controlled stages

| Area | Outstanding evidence/action | Current status |
|---|---|---|
| Actual SEO baseline | Authorized Saudi-filtered GSC data and a consistent date/device/query/page scope | Unavailable |
| Sessions and attribution | Authorized analytics property, privacy/consent review and deployment verification | No collector installed |
| Keyword demand/difficulty | Dated provider data with market and method | New seeds remain a backlog; owner-supplied SAL estimates are not ENVOD metrics |
| Real enquiry delivery | Resend sender-domain verification and separately approved live test | Domain previously confirmed unverified; no new attempt |
| Qualified leads | Private business qualification and approved aggregate attribution | No real baseline |
| Backlinks/citations | Owner approval, duplicate/profile checks, verified facts/rights, publisher acceptance and commercial review | Drafts only; no acquired-link claim |
| Broader business claims | Owner proof and contextual review of the remaining source-registry matches | 45 automated candidates, not 45 confirmed false assertions |
| Arabic/regulatory content | Professional Arabic and responsible operational review | Still required |
| Performance | Focused mobile loading work plus production field CWV evidence | Prior mobile lab LCP target remained unmet; not remeasured or claimed fixed here |
| Public site | Owner-approved publication and live crawl after review | No publication performed; public content may still show older claims |
| Standalone export | Intentionally resynchronize only when preparing that separate distribution | Existing snapshot unchanged |

Proceed with measured performance work and broader claim review as separate tested batches. Activate measurement and perform external submissions only after their factual/account/approval gates are satisfied. Do not interpret this report as completed rankings, lead growth or a publication approval.

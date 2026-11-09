# Final Strategic Action Plan

**This is a recommended sequence only. No work below was executed on the website.**

## Phase 0 — Establish a trustworthy baseline (owner/SEO analyst, first)

1. Confirm the exact GSC property and export the same date windows and filters for Pages, Queries, Countries and Devices. Use equal current/prior periods and preserve download metadata.
2. Obtain URL Inspection for the exhibition EN/AR URLs and the 31 crawled-not-indexed / 19 discovered-not-indexed examples. Record Google-selected canonical, last crawl, indexing reason and sitemap/referring page. Exclude expected redirect/alternate canonical URLs from defect totals.
3. Define the decline: exact target query, location, device, dates, previous measured position/clicks and the report where the change was observed. Do not infer this from a personalized search.
4. Capture reproducible SERPs/AI Overviews for national and Riyadh, Jeddah, Dammam/Eastern Province and Jubail queries. A direct attempt on 9 November returned only a JavaScript shell; use a validated rank/grid source or owner-provided captures instead. Store timestamp, exact query, location, language, device, signed-in state, result order, URLs and AI citations.
5. Export Google Business Profile performance and Search Console Links data; request Bing Webmaster query/page data if Bing visibility is in scope. Do not request credentials in chat; use secure account access/exports.

**Exit criterion:** The property, date windows, page/query totals and exact ranking question are consistent and documented.

## Phase 1 — Fix verified technical/claim issues (after evidence review)

1. Keep the existing `/services/exhibition-logistics` and `/ar/services/exhibition-logistics` URLs and current sitemap/hreflang structure. The 8 Nov crawl found them live and self-canonical.
2. Review all 50 excluded URLs individually; correct a verified canonical, content, internal link or soft-404 issue without deleting valid services.
3. Consolidate the duplicate homepage Organization @id after inspecting the schema generation sources and verifying no required properties are lost.
4. Verify the 12 exhibition ItemList entries and the “served by” relationship against owner records. Keep event examples clearly distinguished from past participation/official appointments.
5. Confirm whether the Vercel Insights script path is referenced in deployed assets before changing analytics configuration. Do not suppress an error or modify build configuration without a verified reference.

**Exit criterion:** Each change is tied to a reproduced issue, reviewed in EN/AR where applicable, and regression-tested.

## Phase 2 — Build the exhibition authority cluster (after content owner approval)

1. Preserve the current transactional exhibition page; improve only when query/page evidence identifies a real gap.
2. Publish one practical exhibitor-shipping checklist, one official-source ATA Carnet/temporary-admission explainer, and one return/re-export guide, in English and Arabic. Each must identify who issues documents, what ENVOD coordinates, what depends on shipment and venue, and where official rules can change.
3. Add venue/city delivery guidance only when it contains verified access/timing/route detail. Describe coverage as enquiry-based if no dedicated premises/team are evidenced.
4. Add contextual internal links to the existing customs, ATA Carnet, air/ocean freight, packaging/crating and quote pages; do not create multiple target pages for identical search intent.
5. Use a subject-matter and claims review for Arabic legal/customs nuance. Keep original helpful material; do not clone competitor copy.

**Exit criterion:** Every page answers a distinct need, has an owner/source/review date, a reciprocal language URL and a measured purpose.

## Phase 3 — Local and authority work (only with genuine eligibility)

1. Verify the current Google Business Profile, address, category, hours, website and duplicate status; establish a local-grid baseline before edits.
2. Keep Riyadh as the only asserted base unless branch/premises evidence is supplied. Avoid city doorway pages and fictitious local entities.
3. Pursue genuine directory/association/event citations only where eligibility, actual relationship, cost and linking policy are confirmed.
4. Obtain Search Console Links or approved third-party backlink exports before estimating authority or competitor links.

## Measurement and release gates

- Report weekly by fixed query groups, English/Arabic, country, device, page and conversion event.
- For the exhibition cluster, track impressions, clicks, CTR, average position, indexed URL state, qualified enquiry count and exact query-to-page mapping. Avoid attributing changes to a single copy update without a controlled period.
- Re-run a production crawl, URL Inspection and mobile/desktop Lighthouse/CrUX check after separately approved implementation. A preview or passing crawl does not prove production rankings or AI inclusion.
- No website/application code was changed. The report directory is separate from Vercel's configured app root; a Git-triggered production build does not serve these report files as website pages.

# Addendum 2 — evidence and opportunity review

**Review date:** 2026-10-22  
**Scope:** Read-only audit of available project files and the public production site. The existing Replit copy remains a review workspace; this addendum does not change website code, the Vercel project, DNS, GitHub, Search Console, Bing Webmaster Tools, external links, or production.

## Executive summary

The audit can confirm the structure and limitations of the keyword files already in the workspace, but it cannot validate the reported Google Search Console or backlink data because the original screenshot and row-level exports are missing. The raw `e1.csv`, `e2.csv`, backlink `export.csv`, and both requested Screaming Frog CSVs were not found in the project, attachments, generated-artifact folders, or 13 scanned archives.

Useful work has still been completed from available evidence:

- The attached bilingual candidate master is 2,400 rows (1,200 English and 1,200 Arabic), with five repeated exact language/phrase pairs. It contains 2,395 unique pairs; every search-volume and difficulty value is marked `Not measured`.
- The 2,395-row Keyword Planner file is a seed list, not Keyword Planner results. Its normalized phrase set matches the deduplicated phrase set in the bilingual master.
- The existing derived map has 2,935 rows: 1,306 pre-upload records plus 1,629 net-new mapped records from the owner-supplied candidate master. It has 2,927 unique normalized language/phrase pairs; eight pairs are mapped to two routes and remain flagged for intent/cannibalization review. None of its rows has verified GSC metrics or a verified ranking URL.
- The owner-reported GSC baseline is arithmetically consistent: 139 clicks / approximately 4,130 impressions is approximately 3.36%, which rounds to 3.4%. Its exact dates, property, filters, screenshot, and query-to-page data remain unavailable.
- The backlink counts and risk indicators remain provisional owner-reported observations. No row-level link review, Search Console Manual Actions check, removal request, or disavow action was performed.
- Two separate SerpOK summaries show different values for the same phrase in different report contexts. They are retained separately; without the original dated exports, they cannot be reconciled or treated as Google metrics.

## Source availability and dataset identity

The detailed file-level record is in [`source-file-inventory.csv`](./source-file-inventory.csv), and the keyword row-count and merge reconciliation is in [`keyword-source-reconciliation.csv`](./keyword-source-reconciliation.csv).

| Expected input | Result |
|---|---|
| Backlink `export.csv` | Not found. The 386-record summary remains unverified. |
| `e1.csv` | Not found. The stated 1,114 rows are not verified. |
| `e2.csv` | Not found. The stated 292 rows are not verified. A separate 292-row historical derivative exists, but its source identity does not prove that it is `e2.csv`. |
| Search Console Performance screenshot | Not found. Only the owner’s written summary and four query examples are available. |
| `issues_overview_report.csv` | Not found. A pasted Screaming Frog text summary is not the original export. |
| `crawl_overview.csv` | Not found. The separately generated live sitemap/route audit is not the original Screaming Frog export. |

Four attached keyword-master CSV files have the same SHA-256 and content; six workbook files are byte-identical; and three Planner seed CSV files are byte-identical. These are duplicate copies, not additional independent datasets. The derived 2,400-row processing CSV matches all 11 original columns and row order of the attached master; its additional processing columns do not make it another source.

The current 2,935-row map does **not** represent the missing `e1.csv` and `e2.csv`. Its route checks describe public HTTP responses observed in the October 22 crawl, not Google rankings or indexation. Arabic review-copy routes do not establish that their production counterparts are available.

## Search Console findings

The owner-reported aggregate is recorded separately from the four query observations in [`gsc-baseline-owner-reported.csv`](./gsc-baseline-owner-reported.csv) and [`gsc-opportunity-analysis.csv`](./gsc-opportunity-analysis.csv). The individual-query average position, CTR, landing page, country, device, date range, and filters are blank because they were not supplied. The aggregate position of 17.4 is not assigned to any query.

The three non-brand query samples have only 22, 4, and 3 reported impressions. They are investigation leads, not reliable demand estimates or a basis for rewriting pages. Candidate pages in the CSV are labelled for manual review only; they are not asserted to be the pages that received impressions.

[`target-query-strategy.csv`](./target-query-strategy.csv) separately maps the owner’s primary, secondary, service-specific, and comparative query hypotheses to existing routes where a suitable route can be verified. It records actual GSC landing pages as blank. The broad national query is a candidate for the existing homepage; the Riyadh query does not justify a new city page on the available evidence; service terms use existing service routes. “Best”, “top”, and “top 10” are not approved self-ranking claims.

## Bilingual keyword mapping

The map keeps the old source priority labels separate from implementation priority. A row whose mapped production URL returned HTTP 404 is blocked until the URL/release source is resolved; a live route remains a candidate until GSC or Keyword Planner evidence and capability checks support a content change. The map’s actual-ranking URL and GSC-period fields remain empty.

The separate `target-query-strategy.csv` gives the current routing recommendation without folding the Addendum’s query list into the unrelated source datasets. Existing English URLs are preserved. No new location or service page is proposed by this audit.

For the priority areas:

- Customs-clearance terms for Riyadh, Jeddah, and Dammam point to the existing customs-clearance page as a candidate, not to new city pages. Port coverage, brokerage role, and partner responsibilities must be confirmed before location-specific copy.
- Freight forwarding, GCC transportation, ocean freight, exhibition logistics, ATA Carnet, project cargo, and air freight map to existing live English service routes. Their Arabic counterpart routes returned HTTP 404 in the production audit and are not safe to treat as production destinations yet.
- No current search-volume or difficulty metric is inserted into the keyword map. All seed/master values remain marked not measured.

## SerpOK estimate reconciliation

[`serpok-reported-keyword-estimates.csv`](./serpok-reported-keyword-estimates.csv) preserves three separate owner-supplied records for “logistics company in Saudi Arabia”:

- Addendum estimate: KSA volume 153, global volume 510, difficulty 29.
- Shaker page observation: KSA volume 82, difficulty 36.
- Globus page observation: KSA volume 153, difficulty 47.

The global estimate exceeding the KSA estimate is not inherently inconsistent. The difficulty values differ, but the source exports, database settings, and report dates are unavailable, so no reconciliation is possible. These are third-party estimates—not Google Search Console data, ENVOD rankings, or verified forecasts—and they have not been copied into the keyword map’s measured-volume fields.

## Backlink review

The reported counts (386 records, approximately 382 domains, 221 repeated commercial anchors, 44 PBN/premium-package mentions, and 385 homepage targets) remain unverified. No raw rows were available to deduplicate domains, inspect link context, establish whether links are live/followed, or connect links to any vendor campaign.

[`backlink-review.csv`](./backlink-review.csv) is a header-only review template, not a fabricated 386-row reconstruction. [`backlink-risk-review.md`](./backlink-risk-review.md) records the limits, risk safeguards, and unresolved Manual Actions check. No link is classified as harmful, and no removal or disavow recommendation is made from the summary alone.

## Existing technical evidence and action boundary

The separate production crawl on October 22 found 43/43 sitemap URLs responding HTTP 200 and 49 additional Arabic/legal paths returning HTTP 404 (46 Arabic and three English legal paths). The production sitemap has 43 English URLs and no alternate-language entries. This is direct HTTP/XML evidence, not Search Console indexation evidence and not the missing Screaming Frog export.

The broader technical remediation plan remains in [`seo-remediation-plan.md`](./seo-remediation-plan.md). No website change was made in this addendum: the production source is a separate repository and the prior source-alignment safeguard remains in force. The review copy already contains a separate set of previously tested changes; they are not described as live production fixes.

## Owner inputs needed to complete the remaining analysis

See [`owner-data-request.md`](./owner-data-request.md) for the exact exports and settings. The priority inputs are the GSC query and page CSVs, the original backlink export, the two original keyword CSVs, and the two Screaming Frog exports. No credentials are requested.

## Official guidance checked

The following public Google documentation pages were fetched successfully on 2026-10-22 (HTTP 200):

- [Search Console Performance report](https://support.google.com/webmasters/answer/7576553)
- [Disavow links to your site](https://support.google.com/webmasters/answer/2648487)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

These references guide the recommendations; they do not verify any ENVOD ranking, link penalty, or AI citation.

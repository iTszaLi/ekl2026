# Backlink evidence review

**Status: no raw backlink export was available for row-level review. No links were classified.**

## Available evidence

The expected `export.csv` was not found in the project, attached files, generated-artifact directories, or 13 scanned archives. The exact provider, report date, original field names, and 386 link rows are unavailable. The file-level search result is recorded in [`source-file-inventory.csv`](./source-file-inventory.csv).

The owner supplied a preliminary third-party-tool summary:

- 386 backlink records and approximately 382 referring domains.
- 221 records with a repeated anchor phrase promoting contextual citations and EDU links.
- 44 records mentioning PBN or premium dofollow packages.
- 385 records targeting the homepage.
- Zero reported referring-page traffic for all 386 records; zero domain traffic for 385 records and a value of one for one record.

Every figure above remains **owner-reported and unverified**. These are not Google traffic measurements, and the original rows were not available to recalculate exact duplicates, normalized referring domains, live-link status, link attributes, anchor clusters, or target URLs.

The project also contains `docs/seo-research/backlink-outreach-tracker.csv`: 10 possible outreach prospects, with no confirmed placement URLs or acquired links. It is an opportunity tracker, not an inbound backlink report.

## Competitor backlink example checked separately

The public QTR Pages thread [`showthread.php?t=422528`](https://qtrpages.com/vb/showthread.php?t=422528) was inspected because it was named as a Globus backlink source. Its HTML contains one English and one Arabic link to Globus's Riyadh article; both target URLs returned HTTP 200, and neither anchor had a `rel` attribute. This is a link to Globus, not ENVOD, and is not part of ENVOD's missing 386-row backlink export.

The owner's SerpOK summary reports seven links from qtrpages.com, but only two Globus target URLs were observed on this thread. Without the source export, the count difference cannot be explained. The page and link markup do not establish indexation, editorial endorsement, Google's treatment, toxicity or ranking impact. Details are preserved in [`qtrpages-link-review.csv`](./qtrpages-link-review.csv); no disavow or removal action was taken.

## Human review and Google Manual Actions

- Referring pages and link context: **not inspected**.
- Potential vendor or past-campaign involvement: **unknown**.
- Google Search Console Manual Actions report: **not checked**; authorized access to the correct property is not available in this audit.
- Disavow decision: **not made**. No disavow file was created or submitted.
- Publisher contact/removal requests: **not made**.

Repeated commercial anchors or low third-party traffic estimates are reasons to investigate once the raw report exists. They do not prove that a link is live, paid, manipulative, harmful, or responsible for a ranking issue. No link is labelled “toxic.”

## Recommended next action

Upload the original, unmodified provider export with its provider and report date. Preserve all source columns, including referring page/domain, target URL, anchor, domain rating, referring-page and domain traffic metrics, first/last-seen dates, link type, and link attributes. Then review page context and known vendor history before deciding whether any removal request is warranted.

The owner should separately check **Search Console → Security & Manual Actions → Manual actions** for the verified property. Google advises using the disavow tool cautiously; no action should be taken from this summary alone.

[`backlink-review.csv`](./backlink-review.csv) is a header-only review template with zero verified link records. It does not reconstruct the 386 reported rows.

## Official guidance checked

- [Google: Disavow links to your site](https://support.google.com/webmasters/answer/2648487) — fetched 2026-10-22 (HTTP 200).
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) — fetched 2026-10-22 (HTTP 200).

These references inform the cautious process; they do not establish that ENVOD has a manual action or that any reported link violates policy.

# Historical SEO Forensics

## Evidence timeline

| Date / period | Evidence | What it supports | What it does not support |
|---|---|---|---|
| 17–22 Oct 2026 | Earlier technical audit recorded Arabic route errors and route-resolution findings | A historic bilingual routing defect was reported | That Arabic pages still fail today |
| 23 Oct 2026 | User-supplied GSC indexing export: 32 indexed; 31 crawled-not-indexed; 19 discovered-not-indexed; 3 redirects; 7 proper alternate canonicals | Google had selected only part of the known URL set at that snapshot | Current index state or a cause for any ranking change |
| 24 Oct 2026 | GSC performance screenshot and CSVs were supplied | 174 clicks / 4.61k impressions / 3.8% CTR / 17.7 average position appears in screenshot; device/country exports reconcile to 174/4,614 | Exact query, page, period and current rank; page/query exports do not reconcile |
| 24 Oct 2026 | Prior SEO intelligence report and source review | Search volume, difficulty, backlinks and city ranks were not measured in that work | A current competitive ranking measurement |
| 4 Nov 2026 | Earlier 94-route public crawl recorded bilingual pages, canonicals and alternates | Recovery/availability was observed by that audit | Google indexing or actual search exposure |
| 8 Nov 2026 | Fresh production crawl in this research folder | All 94 sitemap URLs return 200 and 145 internal destinations tested return 200 | Google selecting or serving those URLs |

The Oct/Nov sequence is consistent with a route issue having been corrected before the current crawl. It does not reveal when or whether Google recrawled each affected URL.

## Search Console export inconsistency

| Export | Rows | Clicks | Impressions |
|---|---:|---:|---:|
| Screenshot / device rows | — / 3 device groups | 174 | 4,614 |
| Country rows | 107 | 174 | 4,614 |
| Pages | 38 | 185 | 5,684 |
| Queries | 244 | 12 | 1,527 |
| Query + page destinations | 277 | Not comparable due query/page aggregation | Not comparable |

Possible explanations include different filters, dates, property selection, export caps, anonymized queries or separate downloads. The available metadata does not distinguish them. Do not infer a technical loss or recompute the overall performance trend from these tables.

The Pages export includes 37 clicks / 1,090 impressions for http://envodkingdom.net/ and a separate 84 / 660 for the HTTPS www homepage. The live HTTP/non-www root checks now redirect to https://www.envodkingdom.net/. These may be historical URL-level records; confirm the canonical and selected URL through current Search Console inspection before interpreting them as ongoing duplicate indexing.

## Current query/page clues

The Pages export associates 16 clicks and 494 impressions with the English exhibition page (average position 11.33). The query export includes 41 impressions and no clicks for “exhibition shipments to saudi arabia” (position 11.20), 13 impressions for “exhibition cargo handling” (position 70.46), and two broad Arabic exhibition/logistics phrases with 3 and 9 impressions. These are small, undated samples. In the query-destination file, some low-volume exhibition phrases are split across the service page and homepage; this warrants monitoring but is not enough evidence of cannibalization.

## Current production state

The current sitemap/HTML crawl found no 404 among its 94 routes, including English and Arabic exhibition pages. Each page has one H1, a unique title/description, a self-canonical, index/follow robots and three hreflang links. All internal link destinations checked returned 200. See the raw CSVs in this folder. [R01](13_SOURCE_REGISTER.md#r01) [R02](13_SOURCE_REGISTER.md#r02)

## Root-cause conclusion

No evidence supports a single root cause for the reported visibility decline. Current crawl errors are not demonstrated. The indexing snapshot deserves URL-level follow-up; query intent, geography, content depth and authority are plausible areas to test but not proven causes. The exact date and magnitude of the reported decline are still missing.

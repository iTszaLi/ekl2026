# Current Saudi competitor and search-access addendum

**Review date:** 22 October 2026
**Scope:** Read-only review in the separate ENVOD Replit copy. No production repository, Vercel deployment, live website content, DNS or Search Console settings were changed.

## Findings at a glance

- Seven requested Globus/Shaker pages were reachable and checked, and four additional public sites were reviewed. The site observations below describe visible page content only; they do not establish a competitor's claimed capability or market position.
- Google and Bing did not provide usable current Saudi-localized result listings through the available access paths. This addendum therefore does **not** report Google/Bing rankings, SERP features, search volume or AI-answer citations.
- The QTR Pages forum thread is live and links to the Globus Riyadh article in English and Arabic. The fetched HTML contains two target links on that thread; the owner-supplied SerpOK summary reports seven links from qtrpages.com. The original backlink export is still needed to explain the difference.
- Existing SerpOK observations already retain 14 Shaker rows and 11 Globus keyword rows plus a separate Globus page summary. The new reconciliation file compares matched phrases without replacing source values.
- The review-copy exhibition page already has qualified Saudi-specific process content and contextual links to ATA Carnet, customs, freight forwarding, ocean/air freight, project cargo, warehousing and relocation. No new page or unsupported comparative claim was justified by the unavailable SERP evidence, so no code change was made for this research addendum.

## Method and access limits

The web-search and web-fetch service returned HTTP 402. Bounded read-only HTTP GET requests were then made to the public pages listed below. Google requests used English/Arabic language and `gl=sa` parameters but returned only an access-help message. Bing requests used Saudi country/language parameters; the retrieved HTML did not yield parsable external result cards, and captured metadata included `RevIpCC=in`. This is not a reliable Saudi-user SERP sample. The search attempts are recorded in [`ksa-search-access-log.csv`](./ksa-search-access-log.csv).

No login, posting, submission, API key, or search-engine challenge bypass was used. A page returning HTTP 200 is a reachability observation, not proof it is indexed, ranks, receives traffic or earns qualified leads.

## Public page observations

| Public page | Direct observation on 2026-10-22 | Evidence limit |
|---|---|---|
| [Globus Riyadh article](https://www.globus-logistics.com/news/logistics-service-companies-in-riyadh) | HTTP 200. H1: “Top Logistics Service Companies in Riyadh.” Visible date text is “04 Jul”; the fetched page does not show a year beside that date. | Self-published promotional article, not an independent ranking. |
| [Globus services](https://www.globus-logistics.com/services) | HTTP 200. Groups sourcing/procurement, forwarding, warehousing, inventory, transport/distribution, sales/merchandising, asset management and end-to-end logistics. | Service taxonomy only. |
| [Globus freight forwarding](https://www.globus-logistics.com/freight-forwarding) | HTTP 200. Separate Air Cargo and Sea Cargo sections describe air, ocean, container and special-cargo topics. | IATA and carrier statements belong to Globus and are not evidence about ENVOD. |
| [Globus warehousing](https://www.globus-logistics.com/warehousing) | HTTP 200. Describes frozen/chilled/ambient/dry facilities, warehouse management and inventory processes. | These are Globus's page statements, not independently inspected facilities. |
| [Globus end-to-end logistics](https://www.globus-logistics.com/end-to-end-logistics-solution) | HTTP 200. Connects sourcing, freight/customs, warehousing, inventory, transport/distribution, merchandising and asset management. | Page content does not establish comparative performance. |
| [Globus about](https://www.globus-logistics.com/about) | HTTP 200. Publishes company-history, staffing and regional-presence statements. | First-party company claims, not independently validated. |
| [Shaker Group logistics](https://shaker.com.sa/business-sectors/logistics/) | HTTP 200. Page title says “Best Logistics Services in Saudi Arabia”; its visible service hierarchy includes logistics, transportation, warehousing and 3PL. | “Best” is a marketing phrase, not a measured rank. Displayed delivery/fulfillment figures are unverified. |
| [SAL homepage](https://sal.sa/home) | The `www.sal.sa` request redirected to the canonical `/home` page and returned HTTP 200. It presents SAL Handling, SAL Logistics and Logistics Zone as business units. | Airport and customer-scale statements remain SAL-published claims. |
| [ABC Logistic](https://abclogistic.com/) | HTTP 200. Arabic homepage topics include Saudi road transport, heavy/lowbed moves, storage and customs-related services. | Fleet and location figures in its description are the company's own claims. |
| [MFS Arabia Logistics](https://www.mfs-logistics.com/) | HTTP 200. Page title/navigation includes air and ocean freight, project cargo, relocation, break-bulk, customs clearance, ground transport, warehousing and distribution; Jeddah, Riyadh and Dammam offices are listed. | Public page statements are not independently verified operating facts. |
| [Saudi Smart Logistics & Warehousing](https://saudi-smartlogistics.com/) | HTTP 200. The site advertises a 2027 logistics/warehousing exhibition and summit at RICEC. | Event source, not a freight provider or evidence of ENVOD participation/appointment. |

These observations suggest useful comparison topics—clear service hierarchy, shipment requirements, customs responsibility, mode selection and event planning—but do not justify copying claims, adding thin “top company” content or inventing ENVOD capabilities. Full row-level notes are in [`competitor-comparison.csv`](./competitor-comparison.csv).

## SerpOK values and reconciliation

The supplied competitor observations remain owner-provided third-party estimates with unknown report dates and no original SerpOK export. They are not Google Keyword Planner volumes, ENVOD analytics or independently confirmed competitor rankings.

Nine exact query phrases occur in both the current 14-row Shaker table and the 11-row Globus keyword table:

- For seven phrases, keyword difficulty, Saudi volume and CPC match while estimated traffic and/or reported position differ.
- “Logistics company in Saudi Arabia” differs across the two competitor rows (Shaker: KD 36 / KSA volume 82; Globus: KD 47 / KSA volume 153).
- “Logistics services” also differs (Shaker: KD 4 / volume 92; Globus: KD 12 / volume 102).
- “Logistics service,” “logistic company in Saudi Arabia,” and “list of logistics companies in Saudi Arabia” also match difficulty, Saudi volume and CPC, but differ in estimated traffic/position.
- “Logistics companies” and “logistics transportation” are Globus-only exact phrases; five Shaker phrases have no exact Globus counterpart.

The detailed values and match status are in [`serpok-metric-reconciliation.csv`](./serpok-metric-reconciliation.csv). The separate Globus Top Page by Traffic summary remains a separate report type: estimated traffic 50, seven keywords, top query “logistics company in Riyadh.” Addendum 2's separate broad estimate for “logistics company in Saudi Arabia” (KSA 153, global 510, KD 29) is also not merged into either competitor page's rows.

## QTR Pages link review

The exact [QTR Pages thread](https://qtrpages.com/vb/showthread.php?t=422528) returned HTTP 200 at the same URL. Its Arabic title is “شركات الخدمات اللوجستية في الرياض: دعامة الاقتصاد والتنمية”; the thread date shown in the HTML is 5 May 2024. The fetched HTML contains:

1. An Arabic anchor, “شركات الخدمات اللوجستية في الرياض,” to `https://www.globus-logistics.com/ar/news/logistics-service-companies-in-riyadh`.
2. An English anchor, “LOGISTICS SERVICE COMPANIES IN RIYADH,” to `https://www.globus-logistics.com/news/logistics-service-companies-in-riyadh`.

Both target URLs returned HTTP 200. Neither anchor included a `rel` attribute in the fetched HTML. That records the markup only; it does not establish search-engine indexing or treatment.

The owner-reported tool metrics—qtrpages.com, one referring domain, DR 19, domain traffic 396, seven links, seven dofollow and zero nofollow—remain unverified. The raw source export is absent, and only two Globus links were observed on the named thread. The remaining five links may come from other URLs, another report scope or an estimate; no explanation is asserted. This is a Globus link, not an ENVOD backlink. The review did not label it toxic or recommend disavowal.

See [`qtrpages-link-review.csv`](./qtrpages-link-review.csv) for the page-level record.

## Implementation and next evidence

The review-copy exhibition service page already uses a clear Saudi service description, shipment-specific customs/ATA qualifications and relevant internal links. The current `Related Services` component renders those links from the existing pillar data. No additional competitor-driven page or phrase was added because there is no reliable current SERP or keyword-demand evidence to support one.

The remaining research blockers are the original SerpOK exports, the actual ENVOD backlink export, verified Search Console and Keyword Planner result exports, and an access path that can produce dated Saudi-localized English and Arabic SERP observations. Until those arrive, keep rankings, search demand, backlink health and AI citations marked unmeasured.

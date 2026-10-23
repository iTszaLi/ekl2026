# Competitor and search-result review

## Method and limits

The web-search and web-fetch service returned HTTP 402 during this audit. After those failures, bounded read-only requests were made to the specifically named public pages. Google query requests returned an access-help page rather than result listings; Bing requests returned HTML with no parsable external result cards, and the captured Bing metadata did not establish a Saudi-origin search. Page contents below are dated observations, not stable rankings or independent verification of the competitors' claims. Query attempts and limitations are logged in [`ksa-search-access-log.csv`](./ksa-search-access-log.csv).

No current, reliably Saudi-localized English/Arabic SERP positions, AI citations, traffic shares, or competitor backlink counts were measured.

## Directly checked on 2026-10-22

### Globus Logistics

- [Riyadh logistics-company article](https://www.globus-logistics.com/news/logistics-service-companies-in-riyadh): HTTP 200; page title “Logistics Service Companies In Riyadh - Globus Professional Logistics Solutions”; visible H1 “Top Logistics Service Companies in Riyadh”; publication text shows 04 Jul; about 29 same-site links were present in the returned HTML.
- The article introduces logistics topics, includes internal links and promotes Globus. It is self-published marketing content, not an independent comparison or proof that named competitors rank.
- [Services](https://www.globus-logistics.com/services): HTTP 200; visibly groups sourcing/procurement, freight forwarding, warehousing, inventory, transport/distribution, sales/merchandising, asset management and end-to-end logistics.
- [Freight forwarding](https://www.globus-logistics.com/freight-forwarding): HTTP 200; visible headings include Air Cargo and Sea Cargo. Company-specific IATA/airline statements are not independently verified and must not be transferred to ENVOD.
- [Warehousing](https://www.globus-logistics.com/warehousing) and [end-to-end solution](https://www.globus-logistics.com/end-to-end-logistics-solution): HTTP 200; show warehouse and multi-service supply-chain positioning.
- [About](https://www.globus-logistics.com/about): HTTP 200; the page publishes company-history, staffing and regional-presence statements. These remain competitor claims, not independently verified facts.
- The page parser detected empty or absent description content on the sampled Globus pages. This is a direct HTML observation, not an inference about their search snippets.

### Shaker Group

- [Logistics page](https://shaker.com.sa/business-sectors/logistics/): HTTP 200; title “Best Logistics Services in Saudi Arabia | Shaker Group”; one visible H1, “Logistics”; page sections include transportation, warehousing and 3PL.
- The page displays claims including “70,000+ deliveries per year” and “10 fulfillment centers with 100m² capacity.” These are displayed competitor claims; the capacity wording is ambiguous in the fetched text and was not independently checked.
- The page has a visible logistics-service hierarchy and extensive site navigation. A raw internal-link count is not treated as a quality or ranking measure.

### Additional live providers and adjacent event source

- [SAL homepage](https://sal.sa/home): the `www.sal.sa` request redirected to this canonical page and returned HTTP 200. The page presents SAL Handling, SAL Logistics and Logistics Zone as business units and describes airport/logistics coverage. Any customer or airport figures are SAL's own page claims, not independently validated here.
- [ABC Logistic](https://abclogistic.com/): HTTP 200. Its Arabic-language homepage covers Saudi road transport, heavy/lowbed transport, storage and customs-related services. Its page claims fleet and location figures; these are first-party claims and are not comparative measurements.
- [MFS Arabia Logistics](https://www.mfs-logistics.com/): HTTP 200. Its title and service navigation cover air and ocean freight, project cargo, relocation, break-bulk, customs clearance, ground transportation, warehousing and distribution; the page lists Jeddah, Riyadh and Dammam offices. These are page observations, not independent capability verification.
- [Saudi Smart Logistics & Warehousing](https://saudi-smartlogistics.com/): HTTP 200. This is an exhibition/summit website, not a freight provider. It advertises a 2027 event at Riyadh International Convention & Exhibition Center; this is relevant event-planning context, not evidence of an ENVOD relationship.

### Globus forum-link case study — not an ENVOD backlink

- The public [QTR Pages forum thread](https://qtrpages.com/vb/showthread.php?t=422528) returned HTTP 200 at the requested URL. The page title is Arabic and the thread date shown in its HTML is 5 May 2024.
- The fetched thread HTML contains two links to the Globus Riyadh article: one Arabic URL (`/ar/news/logistics-service-companies-in-riyadh`) and one English URL (`/news/logistics-service-companies-in-riyadh`). Each target URL returned HTTP 200 when checked. Neither anchor included a `rel` attribute in the fetched HTML.
- The owner-supplied SerpOK summary says qtrpages.com has one referring domain, DR 19, domain traffic 396, seven links, seven dofollow and zero nofollow. Those values remain unverified because the provider export and report date were not supplied. The two links observed on this thread do not explain the reported seven; the seven may cover other pages or a different reporting scope.
- This is a link to Globus, not ENVOD. Page access and link markup do not establish Google indexing, link treatment, editorial endorsement, toxicity, or ranking impact. No disavow or outreach action was taken.

## Previously captured research (dated 2026-10-17/18)

The source matrix includes direct page observations for DSV Saudi Arabia and service pages, SAL fulfillment/handling, Saad Logistics Arabic pages, GBE, and SMI Fairs & Exhibition Logistics. Other names in the matrix are search-excerpt leads only. Snippet-only records are not treated as direct inspections or proof of rank.

Useful editorial opportunities are to explain ENVOD's verified service scope, shipment inputs, documentation responsibilities and process constraints in customer language; preserve the existing exhibition page; and connect related service pages contextually. Do not copy competitor wording, artwork, client claims, fleet statistics, credentials, or guarantees.

## SerpOK estimates supplied in the prompt

The Shaker and Globus tables are preserved row by row in [`serpok-competitor-observations.csv`](./serpok-competitor-observations.csv). Their dates are unknown. The same phrase has differing reported values across the two records—for example, “logistics company in Saudi Arabia” and “logistics services.” The discrepancy may reflect different snapshots or settings; neither value is silently selected as definitive.

The Globus article's separate Top Page by Traffic summary reports estimated traffic 50, seven keywords and “logistics company in Riyadh” as the top keyword. This is a different report summary from the 11-row keyword list; the records are not merged. Shaker's prompt says 15 keywords but supplies 14 rows; the missing row remains missing.

The row-by-row comparison is in [`serpok-metric-reconciliation.csv`](./serpok-metric-reconciliation.csv). Nine exact keyword phrases occur in both competitor tables. For seven phrases, difficulty, Saudi volume and CPC match while estimated traffic and/or reported position differ; two other shared phrases have differing difficulty/volume but the same CPC. Two Globus phrases have no exact Shaker counterpart, and five Shaker phrases have no exact Globus counterpart. A separate Addendum 2 estimate for “logistics company in Saudi Arabia” (KSA 153, global 510, KD 29) remains separate from the competitor-page rows.

No competitor metric in these tables is an ENVOD metric, a verified Google Analytics visit, or a verified search ranking.

# Saudi logistics competitor and content-gap analysis

**Reviewed:** 22 October 2026  
**Evidence boundary:** Direct, read-only HTML checks of named public pages; historical source matrices; no verified rank, traffic, backlink or AI-citation data.

## Executive summary

The audit did not obtain reliable Saudi-localized English or Arabic search-result positions. The search/fetch service returned HTTP 402 during this review, so the listed public pages were checked with bounded direct requests. These are content and page-structure observations, not proof of rankings or market share.

The clearest competitive opportunity is to make ENVOD’s service scope easier to verify: explain what customers provide, what ENVOD can coordinate, which approvals remain with the authorities, and what is confirmed per shipment. Build this around the established exhibition and customs pages, then connect relevant freight, GCC transport, relocation and industry pages. Do not copy competitor wording, logos, customer names, certifications or operational claims.

## Direct page observations

| Company/page | Direct observation | What this does and does not show |
|---|---|---|
| [Globus Logistics — Riyadh article](https://www.globus-logistics.com/news/logistics-service-companies-in-riyadh) | HTTP 200; title and H1 target logistics companies in Riyadh; the page promotes Globus and includes internal service links. | Self-published competitor marketing, not an independent list of top firms or evidence of current rank. |
| [Globus — services](https://www.globus-logistics.com/services) | HTTP 200; visible groups include sourcing/procurement, forwarding, warehousing, inventory, transport/distribution, sales/merchandising, asset management and end-to-end logistics. | A broad service taxonomy is visible. It does not establish service quality, demand or rankings. |
| [Globus — freight forwarding](https://www.globus-logistics.com/freight-forwarding) | HTTP 200; visible Air Cargo and Sea Cargo headings. | Content organization only. Its IATA/airline claims must not be transferred to ENVOD. |
| [Globus — warehouse/end-to-end/about](https://www.globus-logistics.com/warehousing) | HTTP 200; warehouse, multi-service and company-history material was visible. | Competitor-published statements are not independently verified. |
| [Shaker Group — logistics](https://shaker.com.sa/business-sectors/logistics/) | HTTP 200; title targets “Best Logistics Services in Saudi Arabia”; visible H1 “Logistics”; content groups transportation, warehousing and 3PL. | The title is a marketing claim, not independent proof that Shaker is “best” or ranks first. |
| Shaker logistics page | Displays “70,000+ deliveries per year” and “10 fulfillment centers with 100m² capacity.” | Competitor claims only; the capacity wording is ambiguous and must not be treated as validated. |
| [SAL homepage](https://sal.sa/home) | Current page presents SAL Handling, SAL Logistics and Logistics Zone; initial `www` URL redirected to `/home`. | Airport and scale statements are SAL's first-party claims; do not treat it as the same operating model as ENVOD. |
| [ABC Logistic](https://abclogistic.com/) | Arabic homepage covers Saudi road transport, heavy/lowbed transport, storage and customs-related services. | Fleet and location scale figures are company-published, not independently verified. |
| [MFS Arabia Logistics](https://www.mfs-logistics.com/) | Air/ocean freight, project cargo, relocation, break-bulk, customs, ground transport and storage appear in page title/navigation; multiple Saudi offices are listed. | Page content only; no independent verification of operation or comparative performance. |
| [Saudi Smart Logistics & Warehousing](https://saudi-smartlogistics.com/) | Event site advertises a 2027 logistics/warehousing exhibition at RICEC. | Adjacent event-planning source, not a freight provider, ENVOD client or affiliation. |

The source matrix also contains older observations for DSV Saudi Arabia, SAL handling/fulfilment, Saad Logistics Arabic pages, GBE and SMI Fairs & Exhibition Logistics. Those records are dated 17–18 October 2026 and are not current rank checks. Snippet-only leads remain unverified. See `competitor-analysis.md` and `competitor-comparison.csv` for source details.

The current English and Arabic Google search attempts did not return result listings. Bing responses yielded no parsable external result cards and included an external-IP country signal of `in`; therefore no localized Saudi rank or SERP-feature claims are made. See [`ksa-search-access-log.csv`](./ksa-search-access-log.csv).

## ENVOD opportunity matrix

| Topic | Observed opportunity | Evidence-safe content direction |
|---|---|---|
| English and Arabic coverage | The review build has 46 routes per language, but the public domain currently returns 404 for the expected Arabic and legal routes. | Keep established English URLs and publish Arabic routes only after source alignment, translation review, canonical/hreflang verification and a live crawl. |
| Customs clearance | The competing pages present broad transport/3PL menus; this audit did not verify an exact competitor Saudi customs process. | Explain documentation intake, product-specific document checks, customs responsibilities and authority-dependent release. Do not imply certification or guaranteed clearance. |
| Exhibition logistics | ENVOD has a dedicated established exhibition page and owner-provided show logistics copy. Competitor evidence is not sufficient to claim ENVOD is uniquely top-ranked. | Preserve the page; clearly describe temporary-import/export coordination, venue delivery, on-site scope, ATA Carnet eligibility and relevant venue planning. Qualify each by shipment and authorized-party decisions. |
| Saudi ports/cities and GCC road routes | No current Saudi-localized rank comparison was obtained for Riyadh, Jeddah, Dammam or GCC routes. | Create city/route pages only where they answer a real service question and contain verified local contact, gateway and service information. Avoid thin city-name duplicates. |
| Service architecture | Globus exposes a broad services menu; Shaker presents logistics as a sector hierarchy. | Maintain ENVOD’s existing service directory and add internal links based on actual customer journeys (for example, customs ↔ exhibition ↔ freight forwarding). Avoid cloning competitor taxonomies. |
| Trust signals | Competitors display operational claims; this review did not independently validate them. | Use ENVOD’s own approved and evidenced facts. Maintain the claim register; do not borrow competitor scale, credentials or client references. |
| Backlinks and authority | No current referring-domain exports or placements were verified. Existing outreach candidates are prospects only. | Prioritize legitimate member profiles and relevant event/industry resources, then record each confirmed URL and date. Do not buy links or fabricate associations. |
| AI answers and citations | No citations from ChatGPT, Gemini, Claude, Perplexity, Bing/Copilot or Grok were measured. | Use direct answer-first content, clear process steps, qualified FAQs and traceable sources. Re-check citations using a dated, repeatable prompt log; no citation can be promised. |

## Search landscape and data limitations

The candidate matrix includes 2,935 English and Arabic phrases, mapped by estimated service intent and target market. It contains no verified search volume, keyword difficulty, current rank or Search Console performance. The user-provided Keyword Planner upload was a keyword seed list, not a results export. The reported Search Console baseline (approximately 139 clicks, 4.13K impressions, 3.4% CTR and 17.4 average position over roughly three months) is owner-reported and was not confirmed by an authorized property export.

The prior SerpOK observations have unknown dates and inconsistent values between snapshots. They remain separate source rows and are not presented as current measurements. No competitor traffic, rank, backlink or AI-visibility estimate is used as a verified fact.

## Prioritized actions

1. Fix the public route/source mismatch first: verify and restore or deliberately redirect the 49 Arabic/legal routes before adding any new sitemap entries.
2. Obtain Search Console and actual Keyword Planner result exports. Use them to prioritize route/query pairs by impressions, clicks, CTR and position rather than heuristic volume.
3. Preserve the exhibition page and build accurate internal links from its customs, ATA Carnet, freight and venue-delivery content.
4. Publish only verified venue, office, membership and client information; separate owner-provided facts from independent evidence.
5. Measure real referral domains and record verified member-profile URLs before using association badges as links.
6. Track page/query and form/call/WhatsApp outcomes. AEO/GEO monitoring must use dated citations and query logs, not inferred “AI ranking” scores.

## Sources

- Globus pages linked in the table; direct fetch observations dated 22 October 2026.
- Shaker logistics page linked in the table; direct fetch observation dated 22 October 2026.
- Existing audit source files: `competitor-analysis.md`, `competitor-comparison.csv`, `serpok-competitor-observations.csv`, `keyword-map.csv` and `source-evidence-register.csv`.
- No independent ranking, analytics, backlink or citation export was available for this review.

## Current competitor and search-access addendum

The current page checks now also include SAL, ABC Logistic and MFS Arabia Logistics. Saudi Smart Logistics & Warehousing is treated as an event/summit source, not a freight provider. The exact direct-page observations and safe use limits are in [`competitor-research-addendum-3.md`](./competitor-research-addendum-3.md).

Google direct requests returned access-help text rather than result cards. Bing responses did not yield parsable result listings and showed an external-IP country signal of `in`; current Saudi-localized English and Arabic rankings therefore remain unmeasured. Search attempts are logged in [`ksa-search-access-log.csv`](./ksa-search-access-log.csv).

The named QTR Pages thread links to Globus's English and Arabic Riyadh article. Two links were observed on the page; the owner's unverified SerpOK summary reports seven qtrpages.com links. This competitor backlink case is separate from ENVOD's missing backlink export and is not a toxicity or ranking-impact finding. See [`qtrpages-link-review.csv`](./qtrpages-link-review.csv).

The SerpOK competitor table reconciliation is in [`serpok-metric-reconciliation.csv`](./serpok-metric-reconciliation.csv). Dates remain unknown, and no competitor estimate is substituted for Google Keyword Planner, Search Console, or ENVOD analytics data.

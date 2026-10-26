# Saudi English and Arabic search landscape — controlled-stage research

Research dates: **17–18 October 2026**. The October 18 continuation extends the current 566-row canonical database without replacing the historical phrase-source files or claiming new measured keywords. Raw October 17 public-search observations remain in `controlled-search-observations.json`.

## Method and limits

Public web searches were run independently in English and Arabic. These are not a geolocated Saudi Google rank crawl, keyword-provider volumes, Google Search Console results or proof of any competitor's credentials. A page's appearance among returned observations does not establish its ranking for a particular user/location. ENVOD's exhibition page appeared in the returned observations; this is evidence of discoverability in that source, not a ranking or performance claim.

### Exact initial search queries

English:
- `customs clearance Riyadh dry port`
- `customs clearance Jeddah Islamic Port`
- `customs clearance King Abdulaziz Port Dammam`
- `Saudi exhibition logistics ATA Carnet`
- `Saudi freight forwarding ocean freight FCL LCL`
- `Saudi GCC cross border road transportation`

Arabic:
- `تخليص جمركي الرياض الميناء الجاف`
- `مخلص جمركي ميناء جدة الإسلامي`
- `تخليص جمركي ميناء الملك عبدالعزيز بالدمام`
- `لوجستيات المعارض كارنيه ATA السعودية`
- `وكيل شحن بحري حاويات السعودية`
- `نقل بضائع بري بين دول الخليج السعودية`

Follow-up queries:
- `Saudi Arabia GCC cross border road freight transport service`
- `Saudi Arabia freight forwarder ocean FCL LCL Saudi ports`
- `كارنيه ATA السعودية لوجستيات المعارض متطلبات`
- `site.iccwbo.org Saudi Arabia ATA Carnet June 2024 Federation Saudi Chambers`
- `site.zatca.gov.sa كارنيه الإدخال المؤقت السعودية ضمان`

The initial combined result groups overrepresented customs and carnet content. The follow-up searches addressed the ocean/forwarding and GCC gaps. Arabic ATA results also included event organizers and unrelated accreditation pages; these are not treated as direct freight competitors.

## Priority intent ownership

| Intent / independently researched Arabic terminology | Existing EN destination; AR equivalent is prefixed `/ar` | Observation and decision |
|---|---|---|
| Riyadh customs / تخليص جمركي الرياض، الميناء الجاف | `/services/customs-clearance#gateway-riyadh` | Distinguish the inland dry port and airport from a seaport. Answer documents, eligibility, operator and inland handover questions; no invented office. |
| Jeddah port customs / مخلص جمركي ميناء جدة الإسلامي | `/services/customs-clearance#gateway-jeddah` | Show gateway-specific documents/arrival planning within the established page, not a near-duplicate city landing page. |
| Dammam port customs / تخليص جمركي ميناء الملك عبدالعزيز | `/services/customs-clearance#gateway-dammam` | Use the named seaport accurately; do not infer dedicated local staff or terminal presence. |
| Exhibition / لوجستيات المعارض، شحن المعروضات | `/services/exhibition-logistics` | Protect the established title, URL, imagery, useful event/venue content and section structure; clarify appointments and site responsibilities. |
| ATA / كارنيه ATA، الإدخال المؤقت | `/services/ata-carnet` | Issuer versus logistics coordinator, item lists, endorsements, re-export deadlines and conditional eligibility are useful direct answers. |
| Forwarding / وكيل شحن، خدمات الشحن المتكامل | `/services/freight-forwarding` | Clarify air/sea/road coordination, booking scope, documents and delivery responsibility; no invented network counts. |
| Ocean / الشحن البحري، حاوية كاملة، شحن مشترك | `/services/ocean-freight#fcl-lcl-comparison` | Compare shipment requirements and full-route costs, not a made-up universal price/CBM threshold. |
| GCC / نقل بضائع بري بين دول الخليج | `/services/gcc-transportation` | Explain cross-border documents, border/cargo eligibility and suitable operator/equipment; no unverified owned fleet or guaranteed departures. |

City terms are intent clusters, not separate branch entities. The existing EN/AR keyword-to-page CSVs remain the larger mappings; this table sets editorial priorities rather than claiming measured search demand.

## Actual observed pages and confidence

| Page | Evidence class | Useful pattern; do not inherit its claims |
|---|---|---|
| `https://custom-clearance.saz.sa/en/customs-clearance` | Search excerpt; grouped fetch failed | Port-specific customs scope and contact context |
| `https://oflsa.com/customs-clearance` | Search excerpt | Gateway names, document/commodity questions; its dedicated-team claims are not ENVOD evidence |
| `https://radhiawad.com.sa/branches/king-abdul-aziz-sea-port` | Search excerpt | Named port intent; do not copy branch, license, history or turnaround assertions |
| `https://amlclogistics.sa/` | Search excerpt; grouped fetch did not return a usable result set | Arabic document readiness and commodity/inspection questions; do not copy hours-to-clear promises |
| `https://jomroksaudi.com/` | Search excerpt | Arabic city/port questions and document intent |
| `https://www.saadlogistic.com/sea-freight-saudi-arabia` | Search excerpt | Arabic FCL/LCL and connected customs/transport topics |
| `https://www.smilogistics.com/fairs-exhibition-logistics` | Search excerpt; grouped fetch did not return a usable result set | Event routing, handling, temporary import and return-freight intent |
| `https://www.bafcointl.com/ocean-freight` | Search excerpt | FCL/LCL, cargo-specific modes and quotation pathways |
| `https://www.bafcointl.com/cross-border-trucking` | Search excerpt | Cross-border scope and responsibility; its owned-fleet claim is not ENVOD's |
| `https://gccfreights.com/services` | Search excerpt | GCC route scope and service navigation |

No DR/DA, backlink count, traffic, exact current rank, fleet certification or license has been inferred from these excerpts.

## Primary-source findings

- **Fetched with relevant body content:** [ZATCA, 2 June 2024](https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx). Explains Saudi ATA acceptance and identifies the Saudi chambers' guaranteeing role.
- **Fetched with relevant body content:** [ICC implementation announcement](https://iccwbo.org/news-publications/news/saudi-arabia-and-the-philippines-to-launch-ata-operations-in-2024). Saudi implementation began 1 June 2024; the Federation of Saudi Chambers is the national guaranteeing/issuing association. A forwarder's service offering is not proof of issuing authority.
- The ICC announcement describes Saudi Annex B1 exhibition scope, while the ZATCA announcement lists broader categories. These historical summaries are **not** treated as unconditional current approval for every equipment type. Check shipment-specific intended use and current authority requirements.
- The ZATCA temporary-admission service appeared in search, but the underscore-form URL fetch exposed navigation rather than substantive instructions; pre-approval steps are therefore not asserted as comprehensively independently checked.
- A Saudi Global Ports contact page appeared in search, but direct fetch failed. Its excerpt is not proof of ENVOD's relationship with a port operator.

## AEO/GEO implementation boundaries

Use clear bilingual explanations, consistent entities, visible questions/answers, source links, shipment checklists and matching structured data. Keep guidance separate from marketing claims. No AI-search citation, rich result or search-engine display is guaranteed.

Refresh this work with authorized Saudi-filtered query/page exports and dated keyword-provider data before prioritizing by volume or attributing growth. Validate Arabic wording professionally and operational requirements with the responsible subject-matter owner before public promotion.

## 18 October autocomplete spot check — separate evidence class

On 18 October 2026, a public Google Suggest response endpoint was queried with `client=firefox`, `gl=sa`, and either `hl=en` or `hl=ar`. These responses are not search volume, rankings, a geolocated user sample, or proof that all Saudi users see the same suggestions. **65 selected response phrases** were retained in the canonical database with their seed, language and capture date (41 English, 24 Arabic). The wider source set remains in the database and research log.

### Seed queries checked

- **English (13):** `customs clearance Saudi Arabia`; `customs clearance Riyadh`; `customs clearance Jeddah`; `customs clearance Dammam`; `ocean freight Saudi Arabia`; `sea freight from China to Saudi Arabia`; `air freight Saudi Arabia`; `ATA Carnet Saudi Arabia`; `exhibition logistics Saudi Arabia`; `exhibition freight Saudi Arabia`; `exhibition shipping Saudi Arabia`; `trade show logistics Saudi Arabia`; `GCC road freight Saudi Arabia`.
- **Arabic (13):** `تخليص جمركي السعودية`; `تخليص جمركي الرياض`; `تخليص جمركي جدة`; `تخليص جمركي الدمام`; `مكتب تخليص جمركي السعودية`; `الشحن البحري في السعودية`; `الشحن البحري من الصين إلى السعودية`; `الشحن الجوي في السعودية`; `لوجستيات المعارض السعودية`; `شحن المعارض في السعودية`; `خدمات شحن المعارض السعودية`; `كارنيه ATA السعودية`; `النقل البري الخليجي`.

### Useful observed patterns and limits

- English customs responses included Saudi customs broker, declaration/form and process language; city seeds returned broker, office, agent and charge variants for Riyadh, Jeddah and Dammam.
- English sea-freight responses included `international shipping Saudi Arabia`, `ocean freight rates/fee`, and China-to-Saudi shipping and cost wording. The generic rate/formula suggestions are informational candidates, not validated Saudi prices.
- Arabic customs responses included company, office, port and airport phrases; Arabic sea responses included company/agent and China-route duration/rate wording. Local-office and airport phrases are conditional intent only, not evidence of ENVOD premises.
- Air suggestions included Saudi air cargo/service terms and several unrelated outbound destinations; exhibition seeds and the Arabic ATA seed returned no suggestions. The English GCC road seed returned no suggestions; the Arabic GCC seed returned only its base wording. An empty suggestion response does not demonstrate zero demand.
- Competitor-branded terms (including DHL, Bayan, Aramex, Khaled Dhafer and Sky Ocean), job/course queries, French ATA wording, and unrelated country routes were not promoted as ENVOD target phrases.

The public web-search service returned **HTTP 402** when fresh SERP/competitor research was attempted on 18 October. No new competitor result set or ranking observation was added in that continuation. The public-page observations above are still dated 17 October and remain qualitative terminology/content references only.

## 27 October 2026 — Search Console evidence and focused page improvements

### Data and limits

The owner supplied the Search Console dashboard capture and six-month CSV exports for pages, queries, countries, devices, and query-to-page destinations. The dashboard screenshot reports 174 clicks, 4,610 impressions, 3.8% CTR, and average position 17.7. The CSV files do not encode exact period start/end dates or a query-country join. Treat this as the selected historical six-month window, not current performance or Saudi-only query performance.

The country export separately reports Saudi Arabia (`sau`) at 64 clicks, 1,539 impressions, 4.16% CTR, and average position 15.41. This cannot be joined to an individual query/page row from the supplied exports. Search Console average position is an aggregate over the selected period and does not establish a fixed current rank for a Saudi searcher.

| Query → existing destination | Clicks | Impressions | CTR | Average position | Interpretation |
|---|---:|---:|---:|---:|---|
| `customs clearance saudi arabia` → `/services/customs-clearance` | 0 | 104 | 0% | 43.14 | Largest selected service-query impression count; reinforce the document and gateway enquiry intent on the existing page. |
| `shipping container to saudi arabia` → `/services/ocean-freight` | 0 | 78 | 0% | 41.69 | Add a clear container-shipping enquiry explanation alongside FCL/LCL and routing details. |
| `exhibition shipments to saudi arabia` → `/services/exhibition-logistics` | 0 | 41 | 0% | 11.20 | Existing page already covers event cargo, customs documents, ATA enquiries, venue planning and returns; retain one bilingual destination. |
| `gcc transportation` → `/services/gcc-transportation` | 0 | 39 | 0% | 5.79 | Search intent can include non-freight travel; state road-freight scope clearly. |
| `gcc transportation services` → `/services/gcc-transportation` | 0 | 25 | 0% | 14.40 | Separate query row; do not average its position with the preceding row. |
| `ata carnet saudi arabia` → `/services/ata-carnet` | 0 | 29 | 0% | 11.72 | Preserve the distinction between logistics coordination and authorized issuance or customs acceptance. |

All selected query/page rows recorded zero clicks in the supplied export. Their average positions and impressions do not explain why clicks were absent, establish a current SERP position, or prove what a Saudi-only searcher saw. The query-page export contains only four Arabic-script rows in its returned sample; these point to the homepage or construction-industry page. This is not evidence of zero Arabic service demand because privacy filtering, row limits, and low counts can omit queries.

### Saudi search-intent spot checks

On 27 October 2026, public Google Suggest was queried with the Saudi country parameter (`gl=sa`) for English and Arabic seeds. This is a query-language discovery sample only: it is not search volume, a rank check, or a representative survey.

- English customs seeds returned broker, declaration, process, office, agent, and charges wording for Saudi Arabia and Riyadh.
- Arabic customs wording included `التخليص الجمركي في السعودية`, `التخليص الجمركي في الرياض`, and related company, method, requirements, and cost phrasing.
- English container/ocean wording included cargo, container rates, and origin-country variants; Arabic ocean wording included company and agent variants.
- ATA suggestions covered the exact Saudi query and explanatory terms such as meaning, number, and cost.
- GCC suggestions included company/freight phrasing and unrelated personal travel or vehicle-border intent, supporting explicit freight qualification on ENVOD's page.
- The checked exhibition and some Arabic event/logistics seeds returned no suggestions. An empty suggestion response is not evidence of no demand.

Fresh direct page checks on 27 October returned HTTP 200 for the sampled public pages below. These are content references, not competitor rankings, endorsements, or proof of ENVOD's operating scope:

- [SMI Logistics — Fairs and Exhibition Logistics](https://www.smilogistics.com/fairs-exhibition-logistics): event-specific logistics page; useful for comparing how exhibition intent is explained.
- [OFL International — Customs Clearance](https://oflsa.com/customs-clearance): Saudi customs/freight service page; its company and licensing claims are not evidence about ENVOD.
- [Saad Logistics — Sea Freight Saudi Arabia](https://www.saadlogistic.com/sea-freight-saudi-arabia): page title and limited static content were available; no traffic or ranking inference is made.
- [GCC Freights — Services](https://gccfreights.com/services): regional service navigation; its coverage claims are not evidence of ENVOD routes.
- [ZATCA — ATA Carnets](https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx) and [ICC — Saudi Arabia and the Philippines to launch ATA operations](https://iccwbo.org/news-publications/news/saudi-arabia-and-the-philippines-to-launch-ata-operations-in-2024): primary regulatory/industry context; check current authority requirements for each shipment.

The web-search service again returned HTTP 402 for fresh SERP research. No current Google results, competitor positions, market share, keyword volumes, difficulty scores, backlinks, or AI citations are claimed. Riyadh/Jeddah/Dammam phrases from autocomplete are intent candidates only; they do not establish local search volume or ENVOD premises.

### Prioritized bilingual page actions

1. **Customs Clearance — `/services/customs-clearance` and `/ar/services/customs-clearance` (104 impressions, position 43.14).** Keep a single national page. Put the customer's goods, origin/destination, shipment documents, and intended gateway in the first enquiry explanation; retain the distinctions among Riyadh Dry Port, Jeddah Islamic Port, and Dammam's King Abdulaziz Port. Release and approvals remain subject to authorities. The English and Arabic service introductions and metadata were refined accordingly.
2. **Ocean Freight — `/services/ocean-freight` and `/ar/services/ocean-freight` (78 impressions, position 41.69).** Keep the existing page and clarify container shipping with origin, destination, FCL/LCL, cargo, and inland-delivery requirements; confirm routing, carrier availability, and responsibilities per shipment. The bilingual service introduction and metadata now state this more directly.
3. **Exhibition & Event Logistics — `/services/exhibition-logistics` and `/ar/services/exhibition-logistics` (41 impressions, position 11.20).** Retain the current detailed bilingual page and its qualified wording. It already covers international freight, customs-document support, ATA Carnet enquiries, venue delivery, and return/re-export planning; no duplicate city pages or definitive “leading provider” claim is warranted.
4. **GCC Transportation — `/services/gcc-transportation` and `/ar/services/gcc-transportation` (39 and 25 impressions across two separate queries).** Preserve the existing road-freight, border-document, route, carrier, and vehicle-suitability qualifications. Do not extend the page to passenger transport or unverified country pairs.
5. **ATA Carnet — `/services/ata-carnet` and `/ar/services/ata-carnet` (29 impressions, position 11.72).** Keep eligibility, authorized issuance, and customs acceptance distinct; link users to current official guidance rather than promising issuance or acceptance.

No new service URLs were created. Existing English/Arabic routes, canonical host, hreflang, sitemap, forms, and internal links were not intentionally changed by these copy edits. Validate the refined copy and performance in a Vercel Preview before any production release.

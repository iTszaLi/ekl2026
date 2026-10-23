# Saudi customs, import documentation, ports and road logistics — research findings

**Research date:** 17 October 2026  
**Method:** Four-angle public search (including Arabic), plus direct public HTTPS requests to official government sites. No paid search or databases.

## Facts suitable for cautious website answers

- ZATCA's general import guidance lists a commercial invoice and bill of lading, and a certificate of origin unless origin is clearly established. The same guidance explicitly requires further documents when the goods' nature or product controls call for them; it gives IECEE certification and registration with the relevant authority as examples. It directs users to check the Customs Tariff/product conditions rather than treating the general list as exhaustive. [Source 1]
- ZATCA says importers should submit the required documents and complete the customs declaration through FASAH at least 48 hours before arrival at the port of entry. ZATCA says the data may be submitted by the importer directly or through a customs broker once the required documents are available. Give this as ZATCA's published general timing guidance, not a guarantee of release time or a substitute for commodity-specific instructions. [Source 1]
- ZATCA describes a customs broker as a party formally delegated by an importer/exporter to handle customs procedures at a specified customs port. The FASAH authorization can be for import, export, or both; traders may authorize single or multiple uses, while non-traders' authorization is single-use. The service lists an active FASAH account, the broker's license number, and authorization duration as requirements. [Source 2]
- Read together, ZATCA's pages distinguish delegation of customs procedures from the importer's documentary obligation: the Import Instructions still say that the importer is required to provide the required documents. Avoid implying the broker replaces the importer as the importer of record or assumes every product-compliance duty unless a legal source establishes that precise boundary. [Sources 1–2]
- TGA's regulations index is divided into land, maritime, and rail regulatory sectors. The page retrieved did not expose individual regulations or cross-border permit terms. [Source 3]
- The official port pages for Jeddah Islamic Port and King Abdulaziz Port Dammam could not be read because Mawani returned HTTP 405. Riyadh Dry Port was not independently validated from an accessible official page in this research. Do not make claims about port capacity, terminals, operating hours, routing, cargo capabilities, free-time, inland rail links, or current disruption based on these notes.

## Claims requiring cross-reference before publication

1. **Port-specific statements:** Mawani appears to be the right authority, but the official site blocked direct retrieval here. Independently verify official descriptions and current details for Jeddah Islamic Port, King Abdulaziz Port Dammam, and Riyadh Dry Port. The pages recorded as leads are not evidence of the underlying claims.
2. **GCC road haulage:** Verify the current Saudi TGA rules and applicable GCC/bilateral arrangements for the specific carrier, vehicle, driver, goods, origin/destination, and border crossing. No universal list of permits, vehicle documents, insurance, transit guarantees, axle/weight, or border procedures was confirmed.
3. **Customs broker liability:** ZATCA's customer-journey page proves that authorization delegates customs procedure handling; it does not settle contractual indemnity, representation, importer-of-record status, or all statutory liability allocation.
4. **48-hour rule:** ZATCA's current English page says “at least 48 hours prior” to arrival. The Arabic page variant returned a different “last updated” date, while its wording around the time window is less clear; use the current English page and recheck before hardcoding the timing into customer-facing copy.
5. **Required documents:** The invoice, bill of lading, and conditional certificate of origin are a general ZATCA list, not a product-agnostic final checklist. Check HS code, product regulator/conformity rules, permits, and controlled/prohibited status per shipment.

## Source quality and source paths

| # | Source | Tier / date | Evidence status |
|---|---|---|---|
| 1 | [ZATCA — Import Instructions](https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx) | Tier 1 government; page updated 26 Aug 2026 | Fetched and read. `research/sources/ksa-customs-ports/01-zatca-import-instructions.md` |
| 2 | [ZATCA — Customs Journey](https://zatca.gov.sa/en/HelpCenter/CustomerJourney/Pages/customs-journey.aspx) | Tier 1 government; page updated 30 Jul 2025 | Fetched and read. `research/sources/ksa-customs-ports/02-zatca-customs-journey.md` |
| 3 | [TGA — Regulations and Legislation](https://tga.gov.sa/ar/regulations) | Tier 1 government index; page modified 3 Sep 2026 | Fetched and read; individual rules not exposed. `research/sources/ksa-customs-ports/03-tga-regulations-portal.md` |
| 4 | [ZATCA — Mandatory customs declaration (2025)](https://zatca.gov.sa/en/MediaCenter/News/Pages/mandatory-customs-declaration-2025.aspx) | Tier 1 government; specific publication date not checked | URL confirmed in official ZATCA sitemap; page not read. Lead only. |
| 5 | [ZATCA — Importers registration feedback (2025)](https://zatca.gov.sa/en/MediaCenter/News/Pages/importers-registration-feedback-2025.aspx) | Tier 1 government; specific publication date not checked | URL confirmed in official ZATCA sitemap; page not read. Lead only. |
| 6 | [ZATCA — Brokers Guideline](https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/Customs%20Clearance/Brokers-Guideline.aspx) | Tier 1 government; publication date not checked | URL confirmed in official ZATCA sitemap; not read. Lead only. |
| 7 | [Mawani — Jeddah Islamic Port page](https://mawani.gov.sa/en-us/Ports/Pages/JeddahIslamicPort.aspx) | Tier 1 government; publication date not checked | Direct retrieval returned HTTP 405; no page evidence. Lead only. |
| 8 | [Mawani — King Abdulaziz Port Dammam page](https://mawani.gov.sa/en-us/Ports/Pages/KingAbdulazizPortDammam.aspx) | Tier 1 government; publication date not checked | Direct retrieval returned HTTP 405; no page evidence. Lead only. |
| 9 | [FASAH](https://fasah.zatca.gov.sa/) | Tier 1 government platform | Linked from ZATCA Import Instructions; platform itself not independently read. |

The search/query record, official-page leads, and Mawani access failure are retained at `research/sources/ksa-customs-ports/04-query-and-snippet-notes.md`.

## Coverage gaps

- No accessible Mawani evidence was obtained for the three requested port nodes, operational information, and inland port/rail distinction.
- No precise current TGA regulation or GCC agreement was inspected for international road transport conditions.
- No commodity-specific HS code, product permit, conformity requirement, prohibited/restricted list, or port-specific clearance procedure was examined.
- No current Fasah workflow screen was inspected; timing and service requirements are only as stated in ZATCA's page.


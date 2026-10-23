# Saudi English and Arabic Search Intent for Logistics Services

**Research date:** 2026-10-17  
**Scope:** Qualitative query and landing-page review for Saudi logistics service acquisition intent, with emphasis on city-based customs clearance, freight forwarding, sea freight, GCC road transport, warehousing, exhibition logistics, ATA Carnet, and quote requests.  
**Method:** Eight distinct Bing query angles (four English, four Arabic) plus one English plain-HTML check; direct public-page fetches of Maersk, ICC and ZATCA pages. No paid keyword tools, no paid search APIs, no billing enablement.  
**Search-volume / ranking data:** None. Do not interpret the noisy Bing snapshots as ranks or demand measures.

## Key Facts

- Queries were constructed with local-commercial modifiers in English and Arabic: service + place (Riyadh/Jeddah/Dammam or Saudi/GCC) + transaction wording such as “quote,” “price” / `سعر`, and `عرض سعر`. The eight query strings and exact sampled Bing result observations are preserved in [SERP evidence](sources/ksa-search-intent/serp-samples.md).
- The English test angles cover (1) customs clearance in Riyadh/Jeddah/Dammam with quote intent, (2) Saudi freight forwarding and sea freight quotes, (3) Saudi/GCC road transport and warehousing, and (4) Saudi exhibition logistics and ATA Carnet. Arabic tests covered those same topic clusters with Arabic service terms, while retaining the Latin-script “ATA Carnet” in the exhibition query.
- Bing's returned samples were substantially irrelevant in this environment: examples included airline/tourism and general-country results for English, and unrelated YouTube, celebrity/fashion, Vietnamese-food and quote pages for Arabic. This is an endpoint-quality limitation, not a finding that relevant providers or customer intent are absent. No competitor rankings or SERP-result demand patterns can responsibly be claimed from those samples. [SERP evidence](sources/ksa-search-intent/serp-samples.md)
- Maersk’s ocean-transport commercial landing page couples an “Ocean Transport” service heading and global coverage claim with a prominent “Check prices” action and a schedules action. This supports quote/price and schedule pathways as examples of service-page conversion language, but not Saudi-specific search demand. [Maersk page evidence](sources/ksa-search-intent/maersk-ocean-transport.md)
- The ICC page defines ATA Carnet in terms of temporary export/import and customs processing, and its navigation presents ATA Carnet, eATA Carnet and country-level information as separate destinations. This supports using the standard term alongside explanatory copy; it does not establish Saudi local procedures or eligibility. [ICC page evidence](sources/ksa-search-intent/icc-ata-carnet.md)
- ZATCA’s official page title and breadcrumb use the term “Customs Brokers,” a useful local vocabulary anchor for Saudi customs service information. The captured page body was sparse, so this research does not make regulatory or licensing claims from it. [ZATCA page evidence](sources/ksa-search-intent/zatca-customs-brokers.md)
- The current sample provides hypotheses for landing-page and keyword research, not a validated list of top Saudi keywords. Useful phrase variants to test with native speakers and Search Console/advertiser data (if separately available) include `customs clearance Riyadh`, `customs broker Jeddah`, `customs clearance Dammam`, `sea freight Saudi Arabia quote`, `GCC road freight`, `warehousing Saudi Arabia`, `exhibition freight Saudi Arabia`, `ATA Carnet Saudi Arabia`, and Arabic combinations such as `تخليص جمركي الرياض`, `تخليص جمركي جدة`, `تخليص جمركي الدمام`, `شحن بحري السعودية`, `نقل بري الخليج`, `مستودعات لوجستية`, `شحن معارض`, and `طلب عرض سعر`. These are query hypotheses, not measured demand.

## Notable Claims Requiring Cross-Reference

- **Saudi-specific ATA Carnet process, availability, issuing authority, and whether a logistics provider can arrange the service:** not established by the global ICC page. Cross-check the Saudi Chamber / national guaranteeing association and current customs guidance before making a local landing-page claim.
- **Customs broker licensing, port/airport coverage, and process requirements:** ZATCA’s page title anchors the broker terminology, but the retrieved body was too sparse to substantiate the rules. Consult the current full ZATCA regulation and service portals.
- **Maersk “500+ destinations” and reliability language:** these are promotional assertions on the provider's own page and were not independently verified.
- **Whether quote/price searches dominate Saudi buyer intent:** not established. The query set deliberately included commercial modifiers, but no volume, click, conversion, or sufficiently relevant SERP evidence was available.

## Source Quality Assessment

| Source | Tier | Quality and caveat |
|---|---:|---|
| Bing query result samples | 3 (search-engine observation) | Direct public result output, but heavily irrelevant and not demonstrably localized. Useful only as evidence of the captured response failure; not a reliable picture of actual Saudi SERPs. |
| ZATCA Customs Brokers page | 1 | Official Saudi government domain and terminology source. Captured page body was limited, constraining substantive use. |
| ICC ATA Carnet page | 2 | Primary chamber / carnet service reference with explicit terminology and structured metadata. Global rather than Saudi-specific. |
| Maersk Ocean Transport page | 3 | Direct service landing page useful for commercial page structure and CTA language; promotional statements should not be generalized. |

## Gaps & Unanswered Questions

- Bing HTML/RSS results in this runtime were irrelevant despite focused English and Arabic queries; the search-engine findings need a second capture from a Saudi-located browser or a different public engine to understand actual local SERPs.
- Searcher locale and language preference are not proven by a query written in a language; no Saudi IP, city-level location, or device context was available.
- No free source surfaced verifiable search volumes, impressions, clicks, or ranking positions. Those metrics are intentionally omitted.
- No local competitor landing pages were reliably discovered through the sampled SERPs. A dedicated direct-company-site discovery pass is needed for Saudi customs brokers, GCC trucking, contract warehousing, and exhibition-forwarding providers.
- Arabic wording may vary by audience and sector (for example, `تخليص جمركي` vs. `مخلص جمركي`; `شحن بري` vs. `نقل بري`). Native-speaker review and local query data would help determine which variants sound natural and commercially precise.
- City/service coverage, port versus airport intent, cargo type, origin/destination, customs-broker credentials, prices, and quote form requirements require primary confirmation before publishing claims.

## Sources

| # | Title | URL | Date | Tier | Evidence |
|---:|---|---|---|---:|---|
| 1 | Bing SERP: Saudi customs clearance Riyadh/Jeddah/Dammam quote (EN-1) | https://www.bing.com/search?format=rss&q=Saudi+customs+clearance+Riyadh+Jeddah+Dammam+quote | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 2 | Bing SERP: freight forwarder / sea freight quote (EN-2) | https://www.bing.com/search?format=rss&q=Saudi+freight+forwarder+sea+freight+quote+Saudi+Arabia | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 3 | Bing SERP: GCC road transport / warehousing (EN-3) | https://www.bing.com/search?format=rss&q=Saudi+GCC+road+transport+warehousing+quote+logistics | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 4 | Bing SERP: exhibition logistics / ATA Carnet (EN-4) | https://www.bing.com/search?format=rss&q=Saudi+exhibition+logistics+ATA+Carnet+shipping+quote | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 5 | Bing HTML SERP: Saudi customs clearance / Riyadh logistics (EN-5) | https://www.bing.com/search?q=Saudi+Arabia+customs+clearance+Riyadh+logistics+company&count=10 | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 6 | Bing SERP: customs clearance and price (AR-1) | https://www.bing.com/search?format=rss&q=%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+%D8%AC%D9%85%D8%B1%D9%83%D9%8A+%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6+%D8%AC%D8%AF%D8%A9+%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85+%D8%B3%D8%B9%D8%B1 | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 7 | Bing SERP: sea freight / customs clearance / quote (AR-2) | https://www.bing.com/search?format=rss&q=%D8%B4%D8%AD%D9%86+%D8%A8%D8%AD%D8%B1%D9%8A+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+%D8%AC%D9%85%D8%B1%D9%83%D9%8A+%D8%B9%D8%B1%D8%B6+%D8%B3%D8%B9%D8%B1 | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 8 | Bing SERP: GCC road freight / warehouses (AR-3) | https://www.bing.com/search?format=rss&q=%D9%86%D9%82%D9%84+%D8%A8%D8%B1%D9%8A+%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D8%AC+%D9%85%D8%B3%D8%AA%D9%88%D8%AF%D8%B9%D8%A7%D8%AA+%D9%84%D9%88%D8%AC%D8%B3%D8%AA%D9%8A%D8%A9+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9 | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 9 | Bing SERP: exhibition shipment / ATA Carnet (AR-4) | https://www.bing.com/search?format=rss&q=%D8%B4%D8%AD%D9%86+%D9%85%D8%B9%D8%A7%D8%B1%D8%B6+%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+ATA+Carnet+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9 | Sampled 2026-10-17 | 3 | `research/sources/ksa-search-intent/serp-samples.md` |
| 10 | Global Ocean Transport Services \| Maersk | https://www.maersk.com/transportation-services/ocean-transport | Page fetched 2026-10-17; publication date not shown | 3 | `research/sources/ksa-search-intent/maersk-ocean-transport.md` |
| 11 | ATA Carnet - ICC - International Chamber of Commerce | https://iccwbo.org/business-solutions/ata-carnet/ | Published 2023-01-20; modified 2026-08-27 | 2 | `research/sources/ksa-search-intent/icc-ata-carnet.md` |
| 12 | Customs Brokers - ZATCA | https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/CustomsClearance.aspx | Page fetched 2026-10-17; publication date not shown | 1 | `research/sources/ksa-search-intent/zatca-customs-brokers.md` |

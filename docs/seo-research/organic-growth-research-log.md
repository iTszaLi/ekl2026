# Organic growth research log

Dates: **17–18 October 2026**. Coverage: Saudi service, gateway, fleet terminology, keyword coverage and legitimate citation/membership opportunities. Public page/search observations and Google Suggest responses are **not a Saudi Google ranking report**, keyword-provider dataset or authenticated first-party search dataset.

## Queries actually run

| Workstream | Exact queries |
|---|---|
| EN chambers/listings | `Riyadh Chamber business directory membership`; `Jeddah Chamber business directory`; `Freightnet add company directory` |
| EN industry/publications | `FIATA membership apply directory`; `JCtrans join network membership`; `Logistics Middle East contact editorial` |
| Arabic local organizations | `غرفة الشرقية دليل المشتركين عضوية`; `المعرض السعودي للمخازن والخدمات اللوجستية احجز جناح`; `غرفة الرياض دليل المشتركين` |
| Independent Arabic vehicle terms | `نقل لوبد سطحات السعودية`; `نقل دينا صندوق مبرد الرياض`; `شاحنات ستائر مغلقة نقل سيارات السعودية` |
| Submission verification | `site.freightnet.com register company directory`; `site.eyeofriyadh.com add company directory`; `site.logisticsmiddleeast.com contact us` |
| Independent EN vehicle terms | `Saudi Arabia lowbed flatbed curtainside transport`; `Saudi refrigerated Dyna box truck transport`; `Saudi car carrier road transport services` |
| Official profile rules | `site.support.google.com/business guidelines virtual office service area businesses` |
| Carrier definition | `site.maersk.com logistics explained FCL LCL shipping difference` |

Some results were irrelevant company aggregators; these were not used as direct operational proof. Public competitor copy was observed, not independently audited for fleet, licensing or accuracy.

## Competitor/terminology evidence

- **Fetched:** `https://triadlogistics-sa.com/services`. EN service links for flatbed, lowbed, curtainside, enclosed box and Dyna vehicles. Evidence of terminology/content architecture, not measured rankings or ENVOD capabilities.
- **Fetched:** `https://shahen-sa.com/`. Arabic vehicle labels include تريلا سطحة، دينا شبك، دينا مغلقة، دينا ثلاجة. Do not reuse its load capacities or fleet claims for ENVOD.
- **Fetched:** `https://www.dar-alshamel.sa/`. Arabic chilled/frozen/dry transport and refrigerated Dyna terminology. Its compliance and temperature claims are its own.
- **Search excerpt only:** `https://nqlyat.com/ar` mentions لوبد/سطحات. Medium confidence for observed terminology, no verified exact-query demand.
- **Search excerpt only:** `https://autoline-sa.com/` includes vehicle-sales categories. Sales inventory is not evidence of transportation-service demand; no transactional ENVOD page was created from those categories.
- **Fetched:** `https://www.maersk.com/support/faqs/what-is-fcl`. Definition states a single shipper occupies the container. This is a carrier reference, not a Saudi keyword-volume source or a claimed ENVOD partnership.
- Earlier SAL/Saad/GBE/SMI observations remain in `competitor-gap-analysis.md`; no current Google positions were inferred from them.

## Database method and 18 October coverage update

The pre-expansion baseline for `ksa-organic-keyword-database.csv` was **149 records** (86 EN, 63 AR). The current canonical database has **566 records** (351 EN, 215 AR), after **417 unique normalized additions**. It covers all **24 service pages** and all **11 industry pages** in both languages. There are no duplicate normalized `keyword + language` pairs.

The source-file audit counted **608 phrase rows across eight existing CSVs**, with **197 unique normalized phrase/language pairs** and **411 repeated row appearances across those files**. This is historical file overlap, not a count of invalid terms. The source CSVs were retained. `keyword-to-page-map.csv` is the separate route-level map: **46 established EN routes**, each paired with its existing `/ar` route, and 18 previously generic/placeholder primary targets have been assigned distinct page intents.

The 566-row canonical phrase map contains **65 selected exact Google Suggest responses** (41 EN, 24 AR), plus **364 proposed/source-seed candidates** and 137 older records whose exact observation method was not recorded. Every suggestion is marked as a suggestion only; every proposed term remains unmeasured. Phrase-level priorities are **25 P1, 523 P2 and 18 P3**, with P1 reserved for a small core/brand set. The October 18 proposal set includes 44 proposed industry terms (two EN and two AR per industry page). See `seo-keyword-map.md` for the page-by-page plan and `controlled-saudi-search-landscape.md` for the query method and observed patterns.

Twenty-seven metric-bearing records are legacy, user-provided SAL competitor estimates. Their provider/tool, market and collection date are unspecified; they are **not** ENVOD search-demand, rank or lead data. All new volume, difficulty and current-rank values remain `Unavailable`. No Cartesian city/vehicle combinations, city doorway pages or invented metrics were added.

The three explicitly identified low-fit/malformed candidates `how much customs broker make`, `what is a US customs broker`, and `sea lead shipping Saudi Arabia` were not added as service targets. Competitor-branded, job-seeking, unrelated-country and unrelated-route suggestions were excluded from ENVOD target recommendations. Local office/airport phrases are conditional, low-priority research terms with explicit capability/premises gates.

`keyword-to-page-en.csv` and `keyword-to-page-ar.csv` and the other historical maps remain source files; the active bilingual phrase-level and route-level maps are documented above. Arabic target paths use the existing `/ar` hierarchy. Speculative vehicle/facility terms are gated, not promoted as confirmed services.

## Data access checked

The attached/already-authorized integration inventory returned GitHub and Resend for this project, plus unrelated source-control authorizations. No Google Search Console, GA4 or Business Profile access was available. No analytics/property identifier was invented or tag installed.

Next evidence inputs: authorized Search Console query/page export with Saudi country/device/date filters; a dated keyword-provider export with market/method; owner-confirmed services; private, aggregate qualified-enquiry outcomes. New input must replace “unavailable” only when the specific metric is actually supported.

## 18 October 2026 Google Suggest spot check

The public suggestion endpoint was queried with `client=firefox`, `gl=sa`, and `hl=en` or `hl=ar`. This records response suggestions for Saudi locale parameters; it does not verify the searcher's actual location, represent all Saudi users, indicate query volume, or establish a rank. Thirteen seed queries were checked in each language:

- **English:** `customs clearance Saudi Arabia`; `customs clearance Riyadh`; `customs clearance Jeddah`; `customs clearance Dammam`; `ocean freight Saudi Arabia`; `sea freight from China to Saudi Arabia`; `air freight Saudi Arabia`; `ATA Carnet Saudi Arabia`; `exhibition logistics Saudi Arabia`; `exhibition freight Saudi Arabia`; `exhibition shipping Saudi Arabia`; `trade show logistics Saudi Arabia`; `GCC road freight Saudi Arabia`.
- **Arabic:** `تخليص جمركي السعودية`; `تخليص جمركي الرياض`; `تخليص جمركي جدة`; `تخليص جمركي الدمام`; `مكتب تخليص جمركي السعودية`; `الشحن البحري في السعودية`; `الشحن البحري من الصين إلى السعودية`; `الشحن الجوي في السعودية`; `لوجستيات المعارض السعودية`; `شحن المعارض في السعودية`; `خدمات شحن المعارض السعودية`; `كارنيه ATA السعودية`; `النقل البري الخليجي`.

Selected responses included customs broker/declaration/process and city variants, China–Saudi sea-freight cost/duration wording, Arabic company/agent and port/airport wording, and Arabic sea-freight company/route variants. The service-seed responses for the exhibition phrases and Arabic ATA Carnet query were empty; the English GCC road-freight seed returned no suggestions, while the Arabic GCC seed returned only its base wording. Empty suggestion results are not evidence of zero demand.

The exact records retained from these responses are labeled in the canonical CSV with their seed, language and capture date. Office/airport queries remain capability-gated. Branded suggestions (for example DHL, Bayan, Aramex, Khaled Dhafer and Sky Ocean), jobs/courses, French ATA wording and unrelated outbound-country routes were not promoted as ENVOD service keywords.

Fresh public web-search/competitor research was attempted again on 18 October, but the search service returned HTTP 402. No new SERP or competitor observations were added in this continuation; the dated October 17 sources above remain the available competitor evidence.

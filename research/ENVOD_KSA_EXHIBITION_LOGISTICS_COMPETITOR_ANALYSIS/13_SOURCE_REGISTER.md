# Source Register & Evidence Notes

**Research cut-off:** 8 November 2026.  
**Evidence tiers:** Tier 1 = official regulator/search platform; Tier 2 = authoritative association/standards body; Tier 3 = company-published marketing or first-party site; Tier 4 = user-provided exports/screenshots or prior project research; Tier 5 = interpretation/hypothesis. Tier indicates source type, not truth of every claim.

## First-party live website and crawl

<a id="r01"></a>
### R01 — Current sitemap crawl
- `production-crawl-2026-11-08.csv` in this folder; 94 sitemap URLs fetched directly from production on 8 Nov 2026. Records status, final URL, language, title, description, robots, canonical, alternate counts, H1 count and parsed schema types.
- Scope is limited to sitemap pages and HTTP-visible HTML; it does not establish Google indexation, rich-result eligibility or full client-side behavior.

<a id="r02"></a>
### R02 — Internal-link destination checks
- `internal-links-2026-11-08.csv`; 145 unique same-domain destinations found in the crawl and checked on 8 Nov 2026. All recorded 200. Bounded link set, not external links/assets.

<a id="r03"></a>
### R03 — Live sitemap
- https://www.envodkingdom.net/sitemap.xml — HTTP 200, 94 URLs, with EN/AR alternates in the inspected version.

<a id="r04"></a>
### R04 — Live robots.txt
- https://www.envodkingdom.net/robots.txt — HTTP 200 on 8 Nov 2026; permits Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot and the catch-all crawler; references the sitemap.

<a id="r05"></a>
### R05 — Live llms.txt
- https://www.envodkingdom.net/llms.txt — HTTP 200 on 8 Nov 2026; first-party summary text. Does not prove crawler access, indexing or citation.

<a id="r06"></a>
### R06 — Live English exhibition page
- https://www.envodkingdom.net/services/exhibition-logistics — HTTP 200 on 8 Nov 2026. Title: “Exhibition Logistics Company in Saudi Arabia | ENVOD KINGDOM.” The page covers freight, customs-document support, ATA Carnet enquiries, venue delivery and return/re-export planning with qualified shipment-specific wording.

<a id="r07"></a>
### R07 — Live Arabic exhibition page
- https://www.envodkingdom.net/ar/services/exhibition-logistics — HTTP 200 on 8 Nov 2026. Arabic title/description, self-canonical and EN/AR/x-default alternates.

<a id="r08"></a>
### R08 — Live homepage schema inspection
- Read-only JSON-LD extraction from https://www.envodkingdom.net/ and the two exhibition URLs on 8 Nov 2026. Detailed observations are in `sources/live-schema-audit-2026-11-08.md`. Syntax parsing of sampled scripts is not a Google validator result.

## User-provided Search Console and PageSpeed evidence

<a id="r09"></a>
### R09 — Search Console performance screenshot
- `../../attached_assets/image_1792885926719.png` (owner-supplied). Shows 174 clicks, 4.61k impressions, 3.8% CTR and 17.7 average position in a selected reporting view. The screenshot appears to select six months; exact dates/filters are not encoded in the CSVs.

<a id="r10"></a>
### R10 — Device export
- `../../attached_assets/search-console-devices_1792886032700.csv`. Totals 174 clicks / 4,614 impressions. Desktop 130/3,248; mobile 42/1,359; tablet 2/7. Undated/filter metadata absent.

<a id="r11"></a>
### R11 — Country export
- `../../attached_assets/search-console-countries_1792886035447.csv`. 107 rows totaling 174 clicks / 4,614 impressions. Country selection and date range not recorded in the export.

<a id="r12"></a>
### R12 — Pages export
- `../../attached_assets/search-console-pages_1792886039103.csv`. 38 rows totaling 185 clicks / 5,684 impressions. Exhibition URL row: 16 clicks, 494 impressions, CTR about 3.24%, average position 11.33. Contains a separate HTTP homepage row.

<a id="r13"></a>
### R13 — Queries export
- `../../attached_assets/search-console-queries_1792886042888.csv`. 244 rows totaling 12 clicks / 1,527 impressions. Query rows have clicks/impressions/CTR/average position but no report-range metadata.

<a id="r14"></a>
### R14 — Query-to-destination export
- `../../attached_assets/search-console-query-destinations_1792886045446.csv`. 277 rows. Some low-volume exhibition queries map to both homepage and exhibition page. Query/page aggregation is not comparable to Pages/Queries totals.

<a id="r15"></a>
### R15 — Indexing issues export
- `../../attached_assets/1_Critical_issues_1793099034946.csv`. User-supplied issue table: 3 redirects; 31 crawled-not-indexed; 19 discovered-not-indexed; 7 alternate pages with proper canonical. Validation state shows not started except alternate validation started.

<a id="r16"></a>
### R16 — Indexing chart export
- `../../attached_assets/0_Chart_1793099034945.csv`. 87 dated rows from 29 July through 23 October 2026; final row shows 32 indexed, 60 not indexed. This is a historical GSC snapshot, not the current production crawl.

<a id="r17"></a>
### R17 — Bilingual keyword candidate master
- `../../attached_assets/0_Envod_Kingdom_KSA_Bilingual_Keyword_Master_1792429774836.csv`. 2,400 owner-supplied phrase candidates overall; 100 Exhibition & Event Logistics rows (50 English/50 Arabic). Search volume and difficulty are not measured; priority is heuristic and intent estimated. The source file’s draft exhibition URL differs from the live slug; the research CSV maps candidates to the current live URL.

<a id="r18"></a>
### R18 — Owner-described Google AI Overview / SERP
- `../../attached_assets/Pasted--MASTER-DEEP-RESEARCH-PROJECT-ENVOD-KINGDOM-SAUDI-ARABI_1794163625651.txt`, lines describing “best exhibition logistics in Riyadh.” The original SERP screenshot/result URLs were not supplied with this text. This is user-reported context, not an independently captured Google result.

<a id="r19"></a>
### R19 — Mobile PageSpeed report
- `../../attached_assets/Pasted-PageSpeed-Insights-logo-PageSpeed-Insights-This-site-us_1793276114816.txt`, dated 29 October 2026. Lab score 67 and metrics documented in the technical audit. Not a current retest.

## Prior project research and claim controls

<a id="r20"></a>
### R20 — Prior SEO intelligence report
- `../../generated-artifacts/ekl2026-seo-recovery-review/docs/seo-research/complete-seo-intelligence-and-market-review-2026-10-24.md`. Dated project research; use as historical context, not current ranking data.

<a id="r21"></a>
### R21 — Business-claims register
- `../../generated-artifacts/ekl2026-seo-recovery-review/docs/seo-research/business-claims-register.md`, dated 18 October 2026. Distinguishes code-present assertions from independently verified claims and flags premises, memberships, licenses, event relationships and metrics for evidence review.

## Official search and local guidance (Tier 1)

<a id="r22"></a>
### R22 — Google Search AI features
- https://developers.google.com/search/docs/appearance/ai-features — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r23"></a>
### R23 — Google helpful content
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r24"></a>
### R24 — Google canonicalization
- https://developers.google.com/search/docs/crawling-indexing/canonicalization — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r25"></a>
### R25 — Google localized versions
- https://developers.google.com/search/docs/specialty/international/localized-versions — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r26"></a>
### R26 — Google sitemap documentation
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r27"></a>
### R27 — Google robots documentation
- https://developers.google.com/search/docs/crawling-indexing/robots/intro — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r28"></a>
### R28 — Google LocalBusiness structured data
- https://developers.google.com/search/docs/appearance/structured-data/local-business — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r29"></a>
### R29 — Google FAQ rich-result updates
- https://developers.google.com/search/updates#removing-faq-rich-result — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r30"></a>
### R30 — Google Business Profile local ranking
- https://support.google.com/business/answer/7091 — “Tips to improve your local ranking on Google,” accessed directly, HTTP 200 on 8 Nov 2026.

## Official Saudi/ATA guidance

<a id="r31"></a>
### R31 — ZATCA Import Instructions
- https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r32"></a>
### R32 — ZATCA ATA Carnet notice
- https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx — “ZATCA to Begin Accepting ATA Carnets,” accessed directly, HTTP 200 on 8 and 9 Nov 2026. The notice says ZATCA began accepting ATA Carnets through customs, land, marine and air ports on 2 June 2024.

<a id="r33"></a>
### R33 — ZATCA temporary admission e-service
- https://zatca.gov.sa/ar/eServices/Pages/eServices-294.aspx — accessed directly, HTTP 200 on 8 Nov 2026.

<a id="r34"></a>
### R34 — ICC Saudi ATA operations announcement
- https://iccwbo.org/news-publications/news/saudi-arabia-and-the-philippines-to-launch-ata-operations-in-2024/ — published 22 April 2024; accessed directly, HTTP 200 on 9 Nov 2026. The announcement says acceptance in Saudi Arabia began 1 June 2024 for goods displayed or used at exhibitions, fairs, meetings or similar events. Confirm current item eligibility and procedures with ZATCA/ICC.

## Company-published competitor pages (Tier 3)

<a id="r35"></a>
### R35 — Four Winds exhibitions and events
- https://www.fourwinds-ksa.com/exhibitions-and-events/ — live page HTTP 200 on 8 Nov 2026; dedicated event/exhibition logistics claims; public marketing content.

<a id="r36"></a>
### R36 — Four Winds About
- https://www.fourwinds-ksa.com/about-us/ — live page HTTP 200 on 8 Nov 2026; company-published footprint claims.

<a id="r37"></a>
### R37 — BAFCO International homepage
- https://www.bafcointl.com/ — live page HTTP 200; company-published Saudi logistics claims.

<a id="r38"></a>
### R38 — BAFCO ocean freight
- https://www.bafcointl.com/ocean-freight — live page HTTP 200; published service page.

<a id="r39"></a>
### R39 — BAFCO cross-border trucking
- https://www.bafcointl.com/cross-border-trucking — live page HTTP 200; published service page.

<a id="r40"></a>
### R40 — Bahri Integrated Logistics
- https://www.bahri.sa/en/bahri-units/bahri-integrated-logistics/ and https://www.bahri.sa/en/logistic-services/ — public company pages referenced in the direct-HTTP gap-fill. Our batch had timeouts on these URLs; treat exact current availability as not independently reconfirmed in the main crawl. Public page descriptions are company claims.

<a id="r41"></a>
### R41 — Maxon English
- https://www.maxon.sa/index-en.html — live page HTTP 200 on 8 Nov 2026; public company information.

<a id="r42"></a>
### R42 — Maxon Arabic
- https://logistics.maxon.sa/ — live page HTTP 200 on 8 Nov 2026; public company information.

<a id="r43"></a>
### R43 — Globus About
- https://www.globus-logistics.com/about — live page HTTP 200; company-published description.

<a id="r44"></a>
### R44 — Globus Services
- https://www.globus-logistics.com/services and https://www.globus-logistics.com/freight-forwarding — live pages HTTP 200; general freight service descriptions.

<a id="r45"></a>
### R45 — SAL public pages
- https://sal.sa/home, https://sal.sa/sal-logistics, https://sal.sa/sal-handling — live pages HTTP 200; public brand/service descriptions.

<a id="r46"></a>
### R46 — SMI exhibition logistics
- https://www.smilogistics.com/fairs-exhibition-logistics and https://www.smilogistics.com/ar/fairs-exhibition-logistics — live pages HTTP 200; company-published event service claims.

<a id="r47"></a>
### R47 — Khelogix exhibition logistics
- https://khelogix.com/service/exhibition-event-logistics/ — live page HTTP 200; company-published KSA/UAE service claims.

## Saved retrieval record

<a id="r48"></a>
### R48 — Direct public-source extract ledger
- `sources/public-source-extracts-2026-11-08.csv` records direct HTTP status, final URL, title, description, text extracts and errors for 47 first-party, official, company and directory pages. Of these, 44 returned HTTP 200; two timed out and one directory endpoint returned HTTP 405. Web search/fetch and screenshot callbacks were unavailable (HTTP 402); direct retrieval is clearly distinguished from search-result observation.

## Research caveats

- A company page verifies what a company says publicly, not that the claim is independently true.
- A public Google Search Central document is authoritative for Google guidance; it does not reveal ENVOD’s private index or ranking state.
- Search Console exports are owner-supplied and not date/filter-complete; no account was accessed in this research.
- No paid rank/backlink API was used. No production data were changed.

## Directory, association and publisher leads (Tier 3 / pathway evidence)

<a id="r49"></a>
### R49 — Logistics Middle East directory
- https://www.logisticsmiddleeast.com/logistics/submit-your-company-to-the-logistics-directory — pathway recorded in prior project research (24 Oct); current direct request returned HTTP 405, so live availability is not reconfirmed.

<a id="r50"></a>
### R50 — Eye of Riyadh directory
- https://www.eyeofriyadh.com/directory/ and https://www.eyeofriyadh.com/member/company_edit.php — public directory pages; HTTP 200 on 8 Nov for directory; account workflow/link eligibility not completed.

<a id="r51"></a>
### R51 — Freightnet membership
- https://www.freightnet.com/membership — HTTP 200 on 8 Nov 2026. Public commercial membership/plan page; no listing or link was created.

<a id="r52"></a>
### R52 — FIATA membership route
- https://fiata.org/individual-membership/ — HTTP 200 on 8 Nov 2026. Application and member directory route; no current company membership verification performed.

<a id="r53"></a>
### R53 — JCtrans member profile
- https://www.jctrans.com/en/vip/ — HTTP 200 on 8 Nov 2026. Public membership/profile route; no account status or link value verified.

<a id="r54"></a>
### R54 — Saudi Warehousing & Logistics Expo exhibitor enquiry
- https://www.saudilogisticsexpo.com/request-information-about-exhibiting/ — HTTP 200 on 8 Nov 2026. Public commercial exhibitor-information route; not evidence of ENVOD participation.

<a id="r55"></a>
### R55 — BluePages company correction
- https://bluepages.com.sa/verify-company — HTTP 200 on 8 Nov 2026. Public company verification/correction route; enhanced placement is commercial and marketing claims about Google visibility are not independently substantiated.

<a id="r56"></a>
### R56 — Riyadh Chamber subscriber services
- https://www.chamber.sa/ChamberServices/SubscribersServices/Pages/default.aspx — HTTP 200 on 8 Nov 2026. Subscriber services do not prove a public backlink or ENVOD eligibility.

<a id="r57"></a>
### R57 — Jeddah Chamber
- https://www.jcci.org.sa/ — HTTP 200 on 8 Nov 2026. Chamber site; direct ENVOD listing/backlink path not established.

<a id="r58"></a>
### R58 — Asharqia Chamber subscriber services
- https://www.chamber.org.sa/subscribers/ — HTTP 200 on 8 Nov 2026. Subscriber services; a public listing/backlink path and ENVOD eligibility are not established.

## Owner-supplied competitor URL review (8 November 2026)

<a id="r59"></a>
### R59 — Owner-supplied ten-company URL set
- `sources/user-supplied-competitor-urls-2026-11-08.csv` records direct GET status, final URL, title, description, text extract and relevant same-domain links for the ten URLs supplied by the owner. This resolves the intended company websites; it does not validate company claims or search ranks.

<a id="r60"></a>
### R60 — Competitor page metadata/content sample
- `sources/competitor-page-audit-2026-11-08.csv` records status/final URL, title, description, canonical, language, robots, H1 count, hreflang, parsed schema types and text extracts for 23 sampled home/service pages. Basic direct-HTML check only; not a full technical SEO or Lighthouse audit.

<a id="r61"></a>
### R61 — BCC Logistics Saudi exhibition pages
- https://www.bcclogistics.com/Service.aspx?S=FAIRS%20AND%20EXHIBITIONS and https://www.bcclogistics.com/About_KSA.aspx — both served HTTP 200 in the 8 Nov direct check. The Saudi profile describes event logistics and city operations; all appointments, membership and volume statements are company claims. HTTPS request timed out in this check.

<a id="r62"></a>
### R62 — BAFCO International
- https://www.bafcointl.com/, https://www.bafcointl.com/about and https://www.bafcointl.com/services — HTTP 200 on 8 Nov. About page explicitly lists exhibition logistics and claims Saudi branches; no dedicated exhibition landing was located in these sampled pages.

<a id="r63"></a>
### R63 — Falcon Logistics Services
- https://falconlogistics.me/, https://falconlogistics.me/about/ and https://falconlogistics.me/our-services/ — HTTP 200 on 8 Nov. The supplied site identifies Sialkot, Pakistan and UAE/Pakistan/Dubai logistics, not a KSA exhibition service.

<a id="r64"></a>
### R64 — Agility Logistics Parks Saudi Arabia
- https://agilitylogisticsparks.com/logistics-parks-in-middle-east/saudi-arabia/ — HTTP 200 in the 23-page sample on 8 Nov. Company page describes Saudi logistics parks/warehousing in Riyadh and Dammam; not a forwarding service page.

<a id="r65"></a>
### R65 — Maxon Logistics
- https://maxon.sa/index-en.html — HTTP 200 on 8 Nov; company-published Saudi transport content. No exhibition-specific page was found in the sampled links.

<a id="r66"></a>
### R66 — Aegis India
- https://aegisindia.com/ — HTTP 200 on 8 Nov. The supplied site is branded Aegis Logistics Limited and focuses on India-oriented LPG/gas/liquid logistics; no Saudi exhibition page was found.

<a id="r67"></a>
### R67 — Future Mobility / FMS (fmls.me)
- https://fmls.me/, https://fmls.me/service/show-events/ and https://fmls.me/about/ — HTTP 200 on 8 Nov. Riyadh contact and a short Shows & Events service page were observed. About-page placeholder text and national-branch claims were not independently verified.

<a id="r68"></a>
### R68 — Four Winds Saudi Arabia
- https://www.fourwinds-ksa.com/ and https://www.fourwinds-ksa.com/exhibitions-and-events/ — HTTP 200 on 8 Nov; dedicated event page and company-published multi-city location list.

<a id="r69"></a>
### R69 — EFS Logistics KSA
- https://www.efslogistics.net/, https://www.efslogistics.net/OurServices and https://www.efslogistics.net/Service/expo-and-events — HTTP 200 on 8 Nov. Dedicated Expo and Events content describes site handling, empty-box storage, loading equipment, repacking, freight, temporary import and documentation; operational/license claims are not independently verified.

<a id="r70"></a>
### R70 — Globus Professional Logistics Solutions
- https://www.globus-logistics.com/services and https://www.globus-logistics.com/freight-forwarding — HTTP 200 on 8 Nov. Company pages describe a Riyadh office and broad KSA freight/warehouse services; no exhibition page was found in the sampled set.

<a id="r71"></a>
### R71 — Official IELA member directory
- https://www.iela.org/members/find-an-iela-member.html — direct HTTP 200 on 9 Nov 2026. The returned official directory lists “BCC Logistics KSA” as “Full member,” business type “Domestic, Export & Onsite,” country “Saudi Arabia.” This verifies the directory membership entry/category only, not a particular event appointment or search ranking. The captured evidence is described in `sources/competitor-claims-verification-2026-11-09.md`.

<a id="r72"></a>
### R72 — City-level search capture attempt
- `sources/city-level-serp-attempt-2026-11-09.md` records one integrated web-search 402 error and four direct Google requests that returned only a JavaScript-required shell. No ranking positions were captured.

<a id="r73"></a>
### R73 — Competitor claim verification record
- `sources/competitor-claims-verification-2026-11-09.md` separates the one independently verified IELA membership listing from self-published location, service, licensing and event-appointment claims. It also records the unresolved and contradictory items without presenting them as measured market facts.

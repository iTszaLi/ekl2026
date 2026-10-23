# ENVOD KINGDOM — SEO, AEO, GEO and Lead-Generation Audit

**Audit date:** 17 October 2026  
**Production site inspected:** <https://www.envodkingdom.net/> and <https://envodkingdom.net/>  
**Target source repository:** <https://github.com/iTszaLi/ekl2026>, `main`  
**Scope:** Read-only audit and reporting. No website code, deployment, DNS, GitHub settings, Vercel settings, or email was changed. This report is a local Markdown file; it has not been committed, uploaded, or deployed.

## 1. Executive Summary

The public site is reachable on Vercel and has a substantial English service and industry footprint: **43 sitemap URLs returned HTTP 200**, each rendered crawlable page had one H1, a unique title and description, a self-canonical URL on `www`, and parseable JSON-LD. The service-page coverage includes customs clearance, freight forwarding, ocean and air freight, GCC transportation, warehousing, exhibition logistics, ATA Carnet, project cargo, and specialized cargo.

The most important production issues are:

1. **Enquiry forms do not send a server-side submission from the inspected production source.** The current contact and quote flows use `mailto:` and show an email-draft state; this is not confirmation that ENVOD received an enquiry. The production target repository has no enquiry API/serverless function.
2. **The live English site has no crawlable Arabic route set.** `/ar` and sampled Arabic service routes return 404; the sitemap has no Arabic URLs or `hreflang`.
3. **Both HTTPS hostnames serve the site.** `https://envodkingdom.net/` and `https://www.envodkingdom.net/` both return 200, while page canonicals prefer `www`. This leaves a duplicate-host signal.
4. **Important claims need owner evidence or qualification.** The live metadata claims ATA Carnet processing “typically within 24 hours”; the tracking page promises real-time status even though the source flow says tracking is not yet available. Other examples include a 50+ country network, employee count schema, bonded/temperature-controlled facilities, regulatory compliance and dedicated fleet claims.
5. **Privacy/legal links are placeholders.** The contact-page footer labels Privacy Policy, Terms and Cookie Policy but uses `href="#"`; the corresponding sampled paths return 404. No privacy notice was observed beside the forms.
6. **Core Web Vitals could not be measured.** PageSpeed requests were rate-limited with HTTP 429. Basic payload checks found a 717 KB uncompressed homepage HTML response (148 KB gzip) and a 1.24 MB uncompressed JavaScript bundle (397 KB gzip). These are optimization opportunities, not proof of poor user CWV.
7. **Search performance, rankings, and conversion rates are unknown.** Search Console, analytics, Google Business Profile and Vercel settings were not accessible. Google autocomplete produced real query suggestions but no volume or difficulty data.
8. **The active Replit checkout is not the target production repository.** At audit start, the checkout was on `main` at `ccfdcd19f1a49b6374b4ccda9a49638a2b452b18`, with 43 changed/untracked entries and origin `iTszaLi/envodkingdom`. The target `iTszaLi/ekl2026` main was `cf44867ccd040b7f865504d95c58136b4b639139` (2026-07-06). The target Vercel deployment URL redirects to Vercel SSO; its active build SHA and settings could not be confirmed.

**No one can guarantee a Google #1 ranking.** The recommendations below focus on eligible, factual, bilingual pages, better enquiry reliability and measurement. They do not promise a position, traffic level, backlink count, or AI citation.

| Area | Status | Evidence confidence | Main finding | Priority |
|---|---|---|---|---|
| Technical SEO | Partial | High for HTTP/source checks | Pages are crawlable, but host canonicalization and security-header configuration need attention. | P1/P2 |
| Indexability | Partial | High | 43 English URLs are indexed-eligible; Arabic and policy paths are missing. | P1 |
| On-page SEO | Partial | High for metadata; medium for content truth | Unique metadata and H1s, but many descriptions are long and several claims need proof. | P1/P2 |
| Keyword strategy | Partial | Medium for autocomplete suggestions; none for volume | Saudi-targeted suggestions support customs, sea-freight and ATA themes; no volume/KD/rank data. | P2 |
| Local SEO | Partial | High for website markup; blocked for listings | Public phone/address/schema are present; Google Business Profile and business-record consistency were not checked. | P2 |
| AEO | Partial | High for JSON syntax; not tested for rich results | FAQ markup is present; question accuracy/visibility and rich-result eligibility need review. | P2 |
| GEO | Unverified | Low | Crawl access is open, but AI citations/visibility were not measured. | P2/P3 |
| Performance | Blocked for CWV | High for payload measurements; none for field CWV | PSI was rate-limited; HTML and JS payloads are sizable. | P2 |
| Backlinks | Unverified | Low | No Search Console or backlink account; an older owner-provided tool snapshot is not independently verified. | P3 |
| Lead conversion | Needs work | High for inspected source and live bundle | Forms prepare email drafts via `mailto:` rather than submit to a production endpoint. | P1 |
| Email integration | Not confirmed for production | High for 401 result; no send test | Replit’s Resend connection returned HTTP 401 on a read-only domain query; no email was sent. Vercel configuration is inaccessible. | P1 |

## 2. Website and Technical Environment

### Production site

- Both the bare and `www` HTTPS hosts are publicly reachable. Responses identify Vercel (`server: Vercel`); the `www` homepage returned `x-vercel-cache: HIT`.
- The live HTML is prerendered: title, description, canonical, H1, page text and JSON-LD are present in the HTTP response rather than depending entirely on client rendering.
- The target repository is a React/Vite site with an SSR prerender step. Its package scripts include Vite client build, SSR build and `prerender.mjs`.
- The checked target repository contains no server/API directory, no Vercel serverless enquiry handler, no `vercel.json`, and no project-level Vercel linkage file. It includes a `_headers` file, but the live Vercel response did not return CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy; only HSTS was observed among the searched security headers.
- The target repository package has `build` and `typecheck` scripts but no test script or test files were found in the target artifact. I did not install dependencies or run a build against it during this read-only audit.
- The live homepage response included `Last-Modified: 15 October 2026`; that header alone does not identify the deployed Git SHA.

### Source and deployment alignment

- Read-only `git ls-remote`/clone inspection found `iTszaLi/ekl2026` `main` at `cf44867ccd040b7f865504d95c58136b4b639139`, dated 2026-07-06, message “Make Vite build portable: PORT/BASE_PATH optional with defaults (5173, '/')”.
- The GitHub deployment/status record previously inspected showed a successful Vercel status associated with that SHA. This does **not** establish that it is the currently active Vercel production build.
- The Vercel-generated deployment URL supplied in the project material returned HTTP 302 to `vercel.com/sso-api`. Vercel dashboard, project settings, current deployment SHA, environment variables and production logs were not accessible.
- The active Replit checkout is separate: `main` at `ccfdcd19f1a49b6374b4ccda9a49638a2b452b18`, with origin `https://github.com/iTszaLi/envodkingdom.git`. It had 43 changed/untracked entries at audit start, including 26 tracked-file modifications. Its bilingual route work and Replit-side email work are not evidence that those features are deployed to the Vercel target.
- The public site’s content fingerprints broadly match the target repository, but the active Vercel deployment SHA could not be verified. Treat the Replit checkout, GitHub target and live deployment as three distinct evidence sources until Vercel access confirms alignment.

### Connected account limits

- GitHub and Resend are connected in this Replit workspace. No Vercel, Google Search Console, Google Analytics or Google Business Profile connection was available.
- The Resend connection was queried read-only using `GET /domains?limit=100`. It returned **HTTP 401**, so no domain status was returned. Reauthorization context classifies the connection as `api_key`; update the key/permission within the existing Replit Resend integration if account verification is needed. Do not paste a key into chat.
- No email was sent in this audit. The owner’s previous report that test messages arrived is user-reported evidence for the earlier Replit test, not a live Vercel submission test.

## 3. Evidence Sources and Audit Limitations

### Evidence collected on 17 October 2026

- HTTP GET/HEAD checks of the live site, robots file, sitemap, all 43 sitemap URLs, selected missing routes, and the current public JS bundle.
- Metadata/heading/canonical/JSON-LD extraction from all sitemap pages; internal-link crawl of those pages; basic JSON parsing of structured data.
- Google autocomplete requests with `gl=SA`, using `hl=en` and `hl=ar`. These are query suggestions, not an observed SERP, search volume or ranking report.
- Read-only inspection of GitHub `iTszaLi/ekl2026` main and the active Replit checkout; selected source files include the contact page, quote modal, tracking page, SEO configuration, exhibition section, `index.html`, prerender script and public headers.
- Existing project research notes and source records: `research/notes.md`, `research/ksa-search-intent.md`, `research/sources.json`, and relevant files under `research/sources/`.
- Read-only Resend domain-list request; it returned HTTP 401.

### Blocked or not tested

- The web-search callback returned HTTP 402 Payment Required. Earlier Bing RSS samples in the repository were materially irrelevant, so they were not used to infer demand or SERP composition.
- Google PageSpeed API requests for home and priority pages returned HTTP 429 quota exceeded. No LCP, INP, CLS, FCP, Speed Index, TBT, Lighthouse score or field data is reported.
- External website screenshot requests returned HTTP 402/429. The rendered desktop/mobile appearance, mobile menu, keyboard behavior, contrast, and post-interaction UI were not visually verified in this audit.
- Search Console, GA4, GBP, Vercel project settings/logs, and third-party keyword/backlink accounts were not available.
- No real production form submission, spam submission, provider success/failure, or email delivery test was performed. The source has no production endpoint to test.
- JSON-LD was checked for valid JSON and type names only, not with Google’s Rich Results Test or a schema validator.
- No ranking positions, traffic, keyword difficulty, search volume, referring domains, conversion rate, AI citations, or competitor metrics are claimed.

**Evidence labels in this report:** **Verified** means directly confirmed in a live response/source/tool output; **Observed** means found in sampled content but not fully validated; **Estimated** means a tool/model estimate; **Not tested** means no valid test was run; **Blocked** means the necessary access or external check was unavailable.

## 4. Complete Page Inventory

### Shared findings across the 43 sitemap pages

- **HTTP:** every sitemap URL returned 200 in the audit.
- **Indexability:** every page had an `index, follow` robots directive in the inspected response.
- **Canonical:** all 43 pages self-canonicalize to the corresponding `https://www.envodkingdom.net/...` URL.
- **Headings:** exactly one H1 was extracted from each page.
- **Metadata:** titles and meta descriptions were unique across the 43 pages; five titles exceeded a 65-character heuristic and 33 descriptions exceeded 160 characters. These are snippet-length review flags, not strict Google ranking limits.
- **Structured data:** all embedded JSON-LD parsed as JSON. Types below are the recursively observed `@type` values, not a Google eligibility verdict.
- **Internal links:** counts below include repeated site navigation/footer links. A link-graph crawl found no sitemap page with zero inbound links and no non-200 target among the 43 discovered internal page paths. Food/FMCG, pet/animal import and cross-trade shipping each had only one distinct inbound page; relocation, medical/pharma and RoRo had two.
- **Word counts:** approximate visible-text tokens after stripping HTML, scripts and styles. They include repeated navigation/footer text and are not editorial body-only counts.
- **Conversion action by page type:** the contact page has a form; service pages expose quote/email and WhatsApp actions; the site-wide quote modal is client-side. The observed form destination is `mailto:info@envodkingdom.net`, not a server endpoint. The floating WhatsApp CTA is present.

| URL | Purpose / inferred search intent | Title (characters) | Meta description (characters) | H1 | Internal links | JSON-LD types | Approx. words |
|---|---|---|---|---|---:|---|---:|
| `/` | Home / broad logistics and quote acquisition | 89: ENVOD KINGDOM Shipping Services LLC — Logistics, Customs Clearance & Freight Saudi Arabia | 223: ENVOD KINGDOM — Saudi Arabia's trusted logistics partner. Expert customs clearance, container transportation, road freight, air freight, sea freight, exhibition logistics & project cargo in Riyadh, Jeddah, Dammam & the GCC. | ENVOD KINGDOM Shipping Services LLC — Logistics, Customs Clearance & Freight Forwarding in Saudi Arabia and the GCC | 57 | WebPage, ItemList, Organization, BreadcrumbList, LocalBusiness, MovingCompany, WebSite, FAQPage | 2582 |
| `/services` | Service directory | 60: Logistics & Freight Services in Saudi Arabia / ENVOD KINGDOM | 216: Explore ENVOD KINGDOM's full range of logistics services across Saudi Arabia and the GCC — ocean freight, air freight, GCC transportation, customs clearance, warehousing, project cargo, exhibition logistics and more. | Comprehensive Logistics Solutions | 83 | ItemList, Organization, BreadcrumbList, LocalBusiness, MovingCompany, WebSite | 1412 |
| `/about` | Company information | 52: About ENVOD KINGDOM — Saudi Arabia Logistics Company | 192: Learn about ENVOD KINGDOM SHIPPING SERVICES LLC — a Riyadh-based logistics company delivering customs clearance, freight forwarding, and supply chain solutions across Saudi Arabia and the GCC. | Our Story | 34 | AboutPage, BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 457 |
| `/gallery` | Operations gallery | 56: Operations Gallery — ENVOD KINGDOM Shipping Services LLC | 183: Explore ENVOD KINGDOM's logistics operations in pictures — customs clearance, exhibition logistics, project cargo, warehousing, and freight forwarding across Saudi Arabia and the GCC. | Logistics in Motion | 35 | BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 446 |
| `/contact` | Contact and quote enquiry | 59: Contact ENVOD KINGDOM — Request a Freight & Logistics Quote | 171: Contact ENVOD KINGDOM SHIPPING SERVICES LLC in Riyadh for customs clearance, freight forwarding, and logistics across Saudi Arabia and the GCC. Request a free quote today. | Let's Move Your Business Forward | 34 | ContactPage, BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 524 |
| `/industries` | Industry directory | 73: Industries We Serve — Logistics by Sector in Saudi Arabia / ENVOD KINGDOM | 196: Industry-specific logistics across Saudi Arabia — automotive, construction, retail, fashion, electronics, aerospace, hospitality, furniture, chemical, telecom, and government-sector supply chains. | Logistics Built for Your Industry | 49 | ItemList, BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 654 |
| `/vision-2030` | Vision 2030 project-logistics information | 88: Vision 2030 Logistics — NEOM, Red Sea, Qiddiya & Diriyah Project Support / ENVOD KINGDOM | 193: Logistics support for Vision 2030 suppliers & contractors — NEOM logistics, Red Sea Project logistics, Qiddiya, Diriyah, infrastructure cargo, and smart logistics solutions across Saudi Arabia. | Logistics for the Kingdom's Giga-Projects | 59 | WebPage, FAQPage, BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 1351 |
| `/track` | Shipment tracking / status enquiry | 57: Track Your Shipment — ENVOD KINGDOM Shipping Services LLC | 182: Track your ENVOD KINGDOM shipment in real time. Enter your tracking number, booking reference, or invoice number for live status and delivery updates across Saudi Arabia and the GCC. | Track Your Shipment | 39 | BreadcrumbList, Organization, LocalBusiness, MovingCompany, WebSite | 578 |
| `/services/ocean-freight` | Ocean freight service quote intent | 45: Ocean Freight in Saudi Arabia / ENVOD KINGDOM | 166: Ocean freight is the sea transport of goods by container or breakbulk — cost-effective FCL and LCL shipping connecting Saudi Arabia's main ports to markets worldwide. | Ocean Freight | 53 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 929 |
| `/services/air-freight` | Air freight service quote intent | 43: Air Freight in Saudi Arabia / ENVOD KINGDOM | 175: Air freight is the fastest mode of international cargo transport — expedited air cargo connecting Saudi Arabia to 50+ countries, with typical transit times that vary by route. | Air Freight | 51 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 864 |
| `/services/gcc-transportation` | GCC road freight quote intent | 50: GCC Transportation in Saudi Arabia / ENVOD KINGDOM | 153: GCC transportation is cross-border road freight across the six Gulf states — FTL, LTL, and dedicated-fleet trucking with managed customs at every border. | GCC Transportation | 59 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 937 |
| `/services/customs-clearance` | Customs clearance service quote intent | 49: Customs Clearance in Saudi Arabia / ENVOD KINGDOM | 189: Customs clearance is the process of filing documentation and duties so goods can legally enter or leave Saudi Arabia — expert Saudi brokerage with SABER, SFDA, CITC, and ATA Carnet support. | Customs Clearance | 56 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 953 |
| `/services/warehousing` | Warehousing and distribution quote intent | 58: Warehousing & Distribution in Saudi Arabia / ENVOD KINGDOM | 188: Warehousing and distribution is the secure storage, inventory management, and order fulfilment of goods — bonded and temperature-controlled facilities in Riyadh with GCC-wide distribution. | Warehousing & Distribution | 59 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 926 |
| `/services/freight-forwarding` | Freight forwarding service quote intent | 50: Freight Forwarding in Saudi Arabia / ENVOD KINGDOM | 170: Freight forwarding is the coordination of shipments on the shipper's behalf across sea, air, and road — multimodal routing, documentation, and customs handled end to end. | Freight Forwarding | 47 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 824 |
| `/services/supply-chain` | Supply-chain service quote intent | 55: Supply Chain Management in Saudi Arabia / ENVOD KINGDOM | 103: Comprehensive supply chain optimization with vendor management, last-mile delivery and ERP integration. | Supply Chain Management | 47 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 619 |
| `/services/project-cargo` | Project cargo service quote intent | 55: Project Cargo Logistics in Saudi Arabia / ENVOD KINGDOM | 185: Project cargo logistics is the transport of oversized, heavy, or high-value equipment for industrial and infrastructure projects — route surveys, permits, heavy-lift, and site delivery. | Project Cargo Logistics | 53 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 912 |
| `/services/relocation` | Relocation service quote intent | 57: House Moving & Relocation in Saudi Arabia / ENVOD KINGDOM | 99: Residential and corporate relocation services with full packing, customs and door-to-door delivery. | House Moving & Relocation | 53 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 680 |
| `/services/ecommerce-logistics` | E-commerce logistics service quote intent | 52: E-commerce Logistics in Saudi Arabia / ENVOD KINGDOM | 96: Last-mile delivery, fulfillment centers, returns management and e-commerce platform integration. | E-commerce Logistics | 47 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 609 |
| `/services/exhibition-logistics` | Exhibition logistics service quote intent | 60: Exhibition Logistics Company in Saudi Arabia / ENVOD KINGDOM | 204: Saudi Arabia's specialist exhibition & trade-show logistics company — ATA Carnet typically within 24 hours, on-site handling, temporary import and event freight forwarding to every major venue nationwide. | Exhibition & Event Logistics | 58 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 1922 |
| `/services/medical-pharma` | Medical and pharmaceutical logistics quote intent | 58: Medical & Pharma Logistics in Saudi Arabia / ENVOD KINGDOM | 199: Medical and pharmaceutical logistics is GDP-compliant cold-chain transport of temperature-sensitive healthcare products — validated reefers, SFDA clearance, and hospital delivery across Saudi Arabia. | Medical & Pharma Logistics | 49 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 824 |
| `/services/food-fmcg` | Food and FMCG logistics quote intent | 53: Food & FMCG Logistics in Saudi Arabia / ENVOD KINGDOM | 108: Temperature-controlled food logistics with SFDA clearance, halal certification and supermarket distribution. | Food & FMCG Logistics | 50 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 646 |
| `/services/pet-animal-import` | Pet and animal import quote intent | 51: Pet & Animal Import in Saudi Arabia / ENVOD KINGDOM | 99: SFDA veterinary import, live animal transport with health certificates and quarantine coordination. | Pet & Animal Import | 46 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 625 |
| `/services/breakbulk-shipping` | Breakbulk shipping service quote intent | 50: Breakbulk Shipping in Saudi Arabia / ENVOD KINGDOM | 189: Breakbulk shipping is the transport of non-containerized cargo loaded piece by piece — heavy machinery, steel structures, and project materials handled port-to-port with full documentation. | Breakbulk Shipping | 49 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 851 |
| `/services/dangerous-goods` | Dangerous-goods shipping quote intent | 58: Dangerous Goods (DG Cargo) in Saudi Arabia / ENVOD KINGDOM | 179: IMO & IATA compliant transportation of hazardous chemicals, flammable goods and temperature-sensitive dangerous goods. Certified DG handling with safe packaging and documentation. | Dangerous Goods (DG Cargo) | 47 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 652 |
| `/services/oog-cargo` | Out-of-gauge cargo quote intent | 68: Oversized / Out-of-Gauge (OOG) Cargo in Saudi Arabia / ENVOD KINGDOM | 197: Out-of-gauge (OOG) cargo exceeds standard container dimensions — flat-rack and open-top sea freight, permit-managed road moves, and crane/SPMT operations for turbines, transformers, and structures. | Oversized / Out-of-Gauge (OOG) Cargo | 47 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 851 |
| `/services/roro-shipping` | RoRo shipping quote intent | 45: RoRo Shipping in Saudi Arabia / ENVOD KINGDOM | 111: Roll-on/roll-off shipping for vehicles, machinery, and wheeled cargo — direct port access at major Saudi ports. | RoRo Shipping | 48 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 655 |
| `/services/ata-carnet` | ATA Carnet and temporary-import quote intent | 67: ATA Carnet Saudi Arabia — Typically Within 24 Hours / ENVOD KINGDOM | 223: ATA Carnet processing in Saudi Arabia typically within 24 hours — the international customs passport for temporary duty-free admission of exhibition goods, professional equipment and commercial samples across 80+ countries. | ATA Carnet Processing | 51 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 1420 |
| `/services/white-glove-logistics` | White-glove logistics quote intent | 53: White Glove Logistics in Saudi Arabia / ENVOD KINGDOM | 207: White glove logistics is premium, high-touch handling for high-value and delicate items — luxury furniture, fine art, medical equipment, hotel and villa projects — with inside delivery, placement, and setup. | White Glove Logistics | 45 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 688 |
| `/services/temperature-controlled-logistics` | Temperature-controlled logistics quote intent | 64: Temperature Controlled Logistics in Saudi Arabia / ENVOD KINGDOM | 193: Temperature-controlled logistics keeps cargo within a set temperature range end to end — refrigerated trucks, frozen and chilled cargo, cold storage, and unbroken cold chain for food logistics. | Temperature Controlled Logistics | 45 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 671 |
| `/services/packaging-crating` | Packaging and crating quote intent | 60: Packaging & Crating Services in Saudi Arabia / ENVOD KINGDOM | 152: Professional export packing and industrial crating — ISPM-15 compliant wooden crates, heavy equipment packing, and protective packing for fragile cargo. | Packaging & Crating Services | 45 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 664 |
| `/services/express-courier` | Express courier quote intent | 57: Express Courier Logistics in Saudi Arabia / ENVOD KINGDOM | 158: Express courier logistics is time-definite urgent shipping for business — same-day and next-day delivery, international express, and secure document shipping. | Express Courier Logistics | 44 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 638 |
| `/services/cross-trade-shipping` | Cross-trade shipping quote intent | 52: Cross Trade Shipping in Saudi Arabia / ENVOD KINGDOM | 201: Cross trade shipping moves cargo directly between two foreign countries — China to the UAE, China to the USA, Germany to Saudi Arabia — managed end to end without the goods transiting your home market. | Cross Trade Shipping | 45 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 728 |
| `/industries/automotive-logistics` | Automotive-sector logistics intent | 52: Automotive Logistics in Saudi Arabia / ENVOD KINGDOM | 188: Automotive logistics across Saudi Arabia & the GCC — RoRo vehicle shipping, spare parts air freight, SABER coordination, customs clearance, and parts warehousing for dealers and importers. | Automotive Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 824 |
| `/industries/construction-logistics` | Construction-sector logistics intent | 54: Construction Logistics in Saudi Arabia / ENVOD KINGDOM | 180: Construction logistics for contractors & suppliers in Saudi Arabia — project cargo, heavy equipment transport, breakbulk shipping, customs clearance, and scheduled site deliveries. | Construction Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 817 |
| `/industries/retail-logistics` | Retail-sector logistics intent | 48: Retail Logistics in Saudi Arabia / ENVOD KINGDOM | 181: Retail logistics in Saudi Arabia — import consolidation, distribution-centre warehousing, mall & store deliveries, and omnichannel e-commerce fulfilment for brands and distributors. | Retail Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 779 |
| `/industries/fashion-logistics` | Fashion-sector logistics intent | 49: Fashion Logistics in Saudi Arabia / ENVOD KINGDOM | 175: Fashion & apparel logistics in Saudi Arabia — launch-critical air freight, ocean replenishment, apparel warehousing, boutique and mall distribution, and e-commerce fulfilment. | Fashion Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 779 |
| `/industries/electronics-logistics` | Electronics-sector logistics intent | 53: Electronics Logistics in Saudi Arabia / ENVOD KINGDOM | 170: Electronics logistics in Saudi Arabia — secure high-value air freight, lithium battery DG compliance, protective packing, secure warehousing, and conformity coordination. | Electronics Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 752 |
| `/industries/aerospace-logistics` | Aerospace-sector logistics intent | 51: Aerospace Logistics in Saudi Arabia / ENVOD KINGDOM | 165: Aerospace logistics in Saudi Arabia — AOG express spares, aircraft component air freight, specialised crating, ATA Carnet for airshows, and oversized aviation moves. | Aerospace Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 819 |
| `/industries/hospitality-logistics` | Hospitality-sector logistics intent | 53: Hospitality Logistics in Saudi Arabia / ENVOD KINGDOM | 174: Hospitality & hotel logistics in Saudi Arabia — FF&E consolidation, pre-opening warehousing, white glove installation, and project cargo for hotels, resorts, and restaurants. | Hospitality Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 783 |
| `/industries/furniture-logistics` | Furniture-sector logistics intent | 51: Furniture Logistics in Saudi Arabia / ENVOD KINGDOM | 163: Furniture logistics in Saudi Arabia — container imports, furniture warehousing, showroom distribution, custom crating, and white glove home delivery with assembly. | Furniture Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 775 |
| `/industries/chemical-logistics` | Chemical-sector logistics intent | 50: Chemical Logistics in Saudi Arabia / ENVOD KINGDOM | 169: Chemical & dangerous goods logistics in Saudi Arabia — IMDG/IATA-compliant DG shipping, UN-spec packing, temperature-controlled transport, and chemical import clearance. | Chemical Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 780 |
| `/industries/telecommunications-logistics` | Telecommunications logistics intent | 60: Telecommunications Logistics in Saudi Arabia / ENVOD KINGDOM | 159: Telecom logistics in Saudi Arabia — network equipment imports, rollout warehousing, tower site deliveries, data-centre hardware moves, and DG battery handling. | Telecommunications Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 777 |
| `/industries/government-logistics` | Government-sector logistics intent | 52: Government Logistics in Saudi Arabia / ENVOD KINGDOM | 171: Government-sector logistics in Saudi Arabia — tender-compliant deliveries, import clearance, secure warehousing, and multi-region distribution for public-sector suppliers. | Government Logistics | 60 | Service, BreadcrumbList, FAQPage, Organization, LocalBusiness, MovingCompany, WebSite | 780 |

### Main page-by-page recommendations

- **Home:** keep the existing home route and visual/brand structure. Shorten the title/description after confirming the primary service hierarchy; substantiate “trusted” and “expert”; make the primary quote path clearly distinguish an email draft from a sent enquiry.
- **Services hub:** retain as the directory; use concise unique snippets and make priority services (customs, forwarding/ocean, GCC road, warehouse, exhibition/ATA) easy to reach.
- **About:** add verifiable company history, legal identity and operational evidence only with owner-approved facts; do not add unverified staff or coverage numbers.
- **Gallery:** keep only images ENVOD has rights to use; add accurate descriptive alt text/captions and evidence context where available. All sampled images had alt attributes, but that does not verify image rights or accuracy.
- **Contact:** maintain the visible phone, email and floating WhatsApp CTA; replace the client-only email-draft flow with a real server submission only after production source alignment; add an actual privacy policy link and short notice.
- **Industries directory and 11 industry pages:** preserve existing routes; verify sector-specific regulatory, equipment, warehouse and delivery capabilities; avoid making every vertical page a lightly varied generic service list.
- **Vision 2030:** use neutral supplier/project logistics language; do not imply a client, supplier, government or giga-project relationship without evidence. Title is 88 characters.
- **Track:** either connect an actual tracking provider/customer data source, or change the page title, description and UI to shipment-status enquiries. Do not promise real-time tracking without live status data.
- **Customs clearance:** preserve the existing route and strengthen it with accurate document/process guidance, a clear statement of ENVOD’s role, and Riyadh/Jeddah/Dammam port coverage only where operations are confirmed.
- **Freight forwarding/ocean/air/GCC transportation:** retain the existing pages; focus on confirmed origin/destination lanes, FCL/LCL or other offered modes and the exact shipment details needed for a quote. Verify 50+ countries and dedicated fleet claims.
- **Exhibition logistics:** preserve `/services/exhibition-logistics` and its substantial content (about 1,922 approximate text tokens). Remove or support the 24-hour Carnet statement; confirm venue coverage, service scope, event references and third-party logo rights. Do not rewrite the page wholesale.
- **ATA Carnet:** preserve the route but distinguish ENVOD’s coordination role from the authorized Saudi issuer/guarantor; verify shipment-specific eligibility and remove unsupported fixed processing times.
- **Warehousing, temperature-controlled, medical/pharma, food/FMCG, pet import, DG, OOG and RoRo pages:** confirm facility ownership/access, certifications, licences, permitted cargo, vehicle/equipment availability and operational limits before claiming them. Use official regulatory sources to explain rules, not as proof of ENVOD capability.
- **Remaining specialized services and industries:** preserve existing URLs; improve with genuinely differentiating operational details, not invented service counts or location pages.

### Missing and non-indexable destinations

- `/ar`, `/ar/services/customs-clearance`, `/ar/services/exhibition-logistics`, `/ar/services/ata-carnet`: 404.
- `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`: 404. The contact footer uses `href="#"` for those labels.
- `/llms.txt`: 404. This is not a Google indexing requirement; do not treat the absence as a blocking SEO issue.
- The quote modal is an interaction, not a separate URL; no standalone quote page was discovered in the sitemap/navigation.

## 5. Technical SEO Findings

### Strengths verified

- The HTML is prerendered and contains important text, title, canonical and structured data in the initial response.
- All 43 sitemap URLs return 200; no sitemap-target internal 4xx links were found.
- Every audited page has one H1, a unique title and description, and a self-canonical.
- All sampled homepage/exhibition/customs images have `alt` attributes (105/105 homepage image tags; 10/10 on each service sample).
- `robots.txt` allows crawling; it declares the sitemap.
- The floating WhatsApp link and telephone/email contact details are present in production HTML.

### Issues and opportunities

- Two HTTPS hostnames return 200 despite `www` canonicals.
- No crawlable Arabic URL set or `hreflang` is published.
- The sitemap’s 43 `<lastmod>` values are all `2026-07-06`; this may reflect a build timestamp rather than each page’s last substantive edit.
- Five titles are over a 65-character review threshold: home (89), industries (73), Vision 2030 (88), OOG cargo (68), ATA Carnet (67).
- 33 of 43 descriptions exceed 160 characters. This can lead to snippet truncation/rewriting; it is not a direct ranking penalty and there is no absolute character rule.
- The homepage has 105 image tags and none includes both explicit `width` and `height` attributes. Five do not include a `loading` attribute. CSS may reserve image space, so the CLS impact is unknown.
- Three home video tags use `preload="none"` (helpful for avoiding early video downloads); repository video assets were approximately 1.1–2.3 MB each, but live transfer behavior was not measured.
- The current public JS bundle is approximately 1,241,953 bytes uncompressed and 396,531 bytes with gzip transfer. The homepage HTML was 717,436 bytes uncompressed and 148,240 bytes gzip.
- Live responses exposed HSTS, but the other searched security headers were not observed. Confirm the correct Vercel header mechanism rather than assuming `public/_headers` is applied.
- No GA/GTM/Umami marker was found in the inspected target source or public HTML/bundle. This is “not detected,” not proof no server-side analytics exists.
- Structured data is syntactically parseable but has not been tested for Google rich-result eligibility or the accuracy of every property.

## 6. Indexability, Sitemap, Robots, Canonicalization, and Redirects

- **Robots:** `https://www.envodkingdom.net/robots.txt` returned 200 with `User-agent: *`, `Allow: /`, and `Sitemap: https://www.envodkingdom.net/sitemap.xml`. No crawl restriction was present in the file.
- **Sitemap:** `https://www.envodkingdom.net/sitemap.xml` returned 200 with 43 URLs. All 43 fetched pages returned 200. The XML is English-only, has no `xhtml:link` alternates, and every URL uses the `www` host. All `<lastmod>` values were `2026-07-06`; `changefreq`/`priority` values are present but should not be treated as ranking signals.
- **Canonical:** all 43 page canonicals point to their own `www` URL. This is internally consistent with the sitemap, but not with the duplicate bare HTTPS host.
- **Scheme/host test:** HTTP bare and HTTP `www` each made one redirect to HTTPS on the same hostname; both HTTPS hosts then returned 200. Thus `https://envodkingdom.net/` does not redirect to the declared `www` canonical. No loop was observed. Only the homepage aliases were used for this redirect check.
- **Internal links:** 43 unique internal page paths were discovered from the sitemap crawl; all responded 200. The link graph had no orphan among those 43 routes. Food/FMCG, pet/animal import and cross-trade shipping had one distinct inbound page each; these are low-connectivity pages, not proven orphans.
- **Duplicates/cannibalization:** no duplicate titles/descriptions or duplicate sitemap URLs were found. Potential intent overlap between service and industry pages cannot be confirmed without Search Console query/page data.
- **Arabic/legal routes:** sampled Arabic and policy routes return 404. They are not in the current sitemap.
- **Redirect-chain scope:** the two HTTP-to-HTTPS homepage redirects were one hop each; other paths and query variants were not exhaustively tested.

**Recommendation:** configure one preferred host (the existing `www` canonical) at the Vercel/domain layer with a single-hop permanent redirect from bare HTTPS, preserve all paths and query strings, then validate canonical/sitemap parity and representative service routes. This changes the host redirect behavior but need not change the public page paths.

## 7. Core Web Vitals and Performance

| Check | Result | Evidence status |
|---|---|---|
| LCP, INP, CLS, FCP, Speed Index, TBT, Lighthouse score | No values reported | **Blocked:** PSI API returned HTTP 429 quota exceeded; no valid lab/field report was returned. |
| Field data / CrUX | Not available | **Not tested:** no authorized Search Console/CrUX access. |
| Homepage HTML | 717,436 bytes raw; 148,240 bytes gzip | **Verified:** live response body measured. |
| Main JS bundle `/assets/index-CV1IiI0I.js` | 1,241,953 bytes raw; 396,531 bytes gzip | **Verified:** public bundle downloaded and decompressed for size/string checks. |
| Exhibition/customs/contact/track HTML | Approximately 422,433 / 392,000 / 335,200 / 328,546 bytes raw | **Verified:** sampled live bodies. |
| Vercel response time | Approximately 24–38 ms TTFB in sampled requests | **Observed only:** one cached request set from the audit environment; not user-experience or geographic performance data. |
| Images | All tested images had `alt`; dimensions absent on 105/105 homepage images; 5 homepage images lacked `loading` | **Verified markup check;** visual layout impact not measured. |
| Videos | 3 homepage video elements with `preload="none"`; repo assets approximately 1.1–2.3 MB | **Verified in source/HTML;** actual browser transfer not measured. |
| Mobile/desktop comparison | Not available | **Blocked:** screenshot tool returned 402/429; no mobile Lighthouse run. |

**Practical next performance checks:** run PSI/Lighthouse once quota/access is available on home, customs, exhibition and contact at mobile and desktop; inspect LCP element and JS execution; add intrinsic dimensions/aspect ratios where safe; lazy-load below-fold images; retain lazy video loading; review route-level code splitting and font loading. Re-measure CLS and LCP after changes. Do not claim the site is slow from byte counts alone.

## 8. On-Page SEO and Content Quality

### Content quality overview

- Existing coverage is broad and well separated into service pages and industry pages. The Exhibition Logistics route is substantial and should be preserved as requested.
- Visible content and one-H1 structure are present in prerendered HTML.
- Core pages use FAQPage/Service schema and service-specific titles; no missing titles/descriptions were found in the 43-page set.
- Most current page metadata is descriptive but frequently overlong. Use concise, unique, human-readable snippets that identify service and geography without keyword lists.
- A page’s existing statement is not evidence that ENVOD has the claimed licence, facility, fleet, certification or turnaround.
- No direct ZATCA, ICC, Mawani or TGA source links were found in sampled live home/customs/ATA/exhibition pages. Add authority citations where they improve factual explanations, while clearly distinguishing authority rules from ENVOD’s service capability.

### Claims requiring owner evidence

Examples in production metadata/schema/source:

- ATA Carnet processing “typically within 24 hours.”
- Shipment tracking “in real time” and “live status and delivery updates,” while the target source flow says “Online Tracking Available Soon.”
- “50+ countries” air-freight network.
- “80+ countries” Carnet coverage presented alongside the company’s Saudi service.
- “Expert Saudi brokerage” and support for SABER, SFDA, CITC and ATA Carnet.
- Bonded and temperature-controlled Riyadh facilities; validated reefers; GDP-compliant logistics; certified dangerous-goods handling; dedicated GCC fleet; crane/SPMT operations.
- Static schema `numberOfEmployees` range of 50–200, `priceRange: "$$"`, `MovingCompany`, Riyadh address/coordinates and six-country `areaServed`.
- The target Exhibition source associates event names from 2024–2026 with event-logo assets; live HTML exposed at least “INDEX Saudi Arabia.” Verify current participation, dates and rights before presenting these as ENVOD credentials.

Confirm each claim with the business owner and relevant current records. Do not convert regulatory material (e.g. ZATCA instructions or ICC ATA guidance) into a claim that ENVOD is licensed, is the issuer, or can guarantee timing.

### Suggested metadata drafts for the highest-priority pages

Drafts only; verify actual service and market scope before use. The current request is audit-only, so none have been applied.

| Page | Suggested title | Suggested description |
|---|---|---|
| Home | `Saudi Logistics & Customs Clearance \| ENVOD KINGDOM` | `Customs clearance and freight forwarding for businesses moving cargo through Saudi Arabia and the GCC. Share your route and shipment details for a tailored quote.` |
| Customs | `Customs Clearance in Saudi Arabia \| ENVOD KINGDOM` | `Ask about import or export clearance coordination for business cargo in Saudi Arabia. Share the commodity, route, port and documents for shipment-specific guidance.` |
| Ocean freight | `Ocean Freight in Saudi Arabia \| ENVOD KINGDOM` | `Request an FCL or LCL ocean-freight quote to or from Saudi Arabia. Share the origin, destination, cargo, container needs and timing.` |
| Exhibition | `Exhibition Logistics in Saudi Arabia \| ENVOD KINGDOM` | `Plan exhibition cargo, temporary imports, venue delivery and return shipping in Saudi Arabia. Share the event, venue, dates and cargo for a tailored quote.` |
| ATA Carnet | `ATA Carnet and Temporary Imports in Saudi Arabia \| ENVOD KINGDOM` | `Ask about current ATA Carnet eligibility, documents and timing for exhibition or professional equipment moving to Saudi Arabia.` |
| Shipment status | `Shipment Status Enquiries \| ENVOD KINGDOM` | `Need an update on an ENVOD KINGDOM shipment? Contact the team with your booking reference for assistance.` |

For body content, retain existing URLs and use service-specific, factual sections. Customs should distinguish importer requirements, ZATCA process and ENVOD’s role. Exhibition/ATA should explain the actual coordinator/issuer roles and shipment-specific eligibility. GCC and port content should identify only routes and operating locations that the company confirms. Do not create thin city or port doorway pages.

## 9. Saudi Arabia and GCC Keyword Strategy

### Data actually available

Google autocomplete was queried on 17 October 2026 using `gl=SA`, `hl=en`/`hl=ar`. The phrases below are **suggestions, not search volumes, rankings or proof of qualified demand**. The attached “complete keyword research” document is a strategy prompt, not a keyword export. No reliable volume or keyword-difficulty dataset was available.

| Observed phrase/theme | Intent and location | Suggested existing target | Volume / KD | New page? | Priority |
|---|---|---|---|---|---|
| “customs clearance Saudi Arabia”; “customs broker Saudi Arabia”; “customs declaration Saudi Arabia” | Commercial and informational; KSA | `/services/customs-clearance` | Not available | No | High |
| “customs clearance Riyadh”; “customs broker Riyadh”; “custom clearance agent Riyadh”; “custom clearance charges in Saudi Arabia” | Local/commercial and price research; Riyadh/KSA | `/services/customs-clearance`, contact | Not available | No; add a verified Riyadh section if operationally accurate | High |
| “customs clearance Dammam”; “customs broker Dammam”; “customs clearance office Dammam” | Local/commercial; Dammam | `/services/customs-clearance` | Not available | No; confirm actual coverage first | High |
| Arabic `تخليص جمركي الرياض`, `مكتب تخليص جمركي الرياض`, `شركة تخليص جمركي الرياض` | Commercial/local; Riyadh | Arabic customs page, once crawlable | Not available | No separate page until evidence supports it | High |
| Arabic `تخليص جمركي جدة`, `تخليص جمركي ميناء جدة الاسلامي`, `مكتب تخليص جمركي ميناء جدة الإسلامي` | Port/local/commercial; Jeddah | Arabic customs page and verified Jeddah-port section | Not available | No separate port page yet | High |
| “freight forwarder in Dammam”; “freight forwarder in Dammam Saudi Arabia” | Commercial/local; Dammam | `/services/freight-forwarding` | Not available | No; validate coverage | High |
| “sea freight Saudi Arabia”; “sea freight from China/India/UK to Saudi Arabia” | Commercial/route; KSA | `/services/ocean-freight` | Not available | No new route page without Search Console/customer evidence | High |
| Arabic `الشحن البحري السعودية`, `شركات الشحن البحري السعودية`, `وكلاء الشحن البحري في السعودية`, `الشحن البحري من الصين الى السعودية` | Commercial/route; KSA | Arabic ocean-freight page, once crawlable | Not available | No | High |
| “ATA Carnet Saudi Arabia”; “ATA Carnet cost” | Commercial/informational; KSA | `/services/ata-carnet` and exhibition page | Not available | No | High, subject to issuer/eligibility accuracy |
| “exhibition logistics Saudi Arabia”; “exhibition freight forwarding Saudi Arabia”; “trade show shipping Saudi Arabia” | Commercial; KSA | `/services/exhibition-logistics` | No suggestions returned for these seeds; no volume | No; preserve existing page | High business fit, weak query evidence |
| Arabic `لوجستيات المعارض السعودية`, `شحن المعارض السعودية` | Commercial; KSA | Arabic exhibition page, once crawlable | No suggestions returned for these seeds; no volume | No | High business fit, weak query evidence |
| “GCC transportation”, `نقل بري الخليج`, `نقل بري السعودية الإمارات` | Commercial/route; GCC | `/services/gcc-transportation` | No suggestions returned for the Arabic seeds; no volume | No; use only real routes | Medium |
| “customs clearance Jeddah port” | Port/commercial; Jeddah | `/services/customs-clearance` | No suggestions returned for this exact English seed | No | Validate in GSC/Planner |

### Five highest-potential organic opportunities supported by available evidence

1. **Saudi city/port customs intent, English and Arabic.** Riyadh/Dammam English completions and Riyadh/Jeddah-port Arabic completions were observed. Improve the existing customs page and create crawlable Arabic equivalent; only claim cities/ports served after confirmation.
2. **Sea freight and freight-forwarding routes.** Suggestions included China/India/UK to Saudi Arabia and Arabic company/agent terms. Expand the existing ocean/freight pages around real lanes and quote data.
3. **ATA Carnet / temporary-import information.** The core `ATA Carnet Saudi Arabia` suggestion exists and the current page already targets the intent. Explain eligibility, issuer role and documents accurately; remove unsupported processing-time claims.
4. **Exhibition and event freight.** This is a user-prioritized service with a substantial existing page, but exact autocomplete seeds returned no suggestions. Preserve the current page and use GSC/customer vocabulary to validate whether additional question or event-intent sections are warranted.
5. **GCC road transportation.** The service is in the existing site and business brief, but Arabic suggestion seeds were empty. Validate route terminology and demand before adding routes or pages.

Search suggestion samples also returned brand completions such as DHL, Aramex and Bayan for some customs seeds. That is not evidence of their position, market share or direct SERP competition. No keyword volume/KD, Google rank or click data is available. Map terms to existing pages first; do not create new pages solely because a phrase sounds relevant.

## 10. Local SEO

- Contact information on the website includes the Riyadh address, calling number `+966 58 367 1739`, WhatsApp `+966 50 226 0256`, and `info@envodkingdom.net`. The calling number/email also appear in static structured data. Website consistency is observed; consistency with an official registry/GBP was not checked.
- JSON-LD includes `Organization`, `LocalBusiness`, `MovingCompany`, PostalAddress, GeoCoordinates and `areaServed` entries for SA, AE, BH, KW, OM and QA. It also includes a 50–200 employee range and `priceRange`. Verify these facts with the owner before relying on them.
- No Google Business Profile was accessible. I did not infer that the listed address is a verified public-facing business premises, nor that the service-area countries imply branches or warehouses.
- Do not create additional city profiles for port coverage. A service area is not a physical office. Confirm address, hours, legal business name, phone and eligible service areas before profile optimization.

## 11. AEO Assessment

- Direct answer capability is partially present: service pages explain services and include FAQPage JSON-LD; the customs page has a basic process definition.
- JSON-LD is parseable, but schema correctness/Google eligibility and whether every structured FAQ exactly matches visible, current content were not validated.
- Improve the highest-value answers using concise, sourced explanations:
  - Saudi import documents and process: link to ZATCA and distinguish importer obligations from broker coordination.
  - Clearance timing: explain that it depends on commodity, documents, inspection, duties, approvals and authorities; do not publish a numerical ENVOD turnaround without operational evidence.
  - ATA Carnet: state the authorized Saudi issuing/guaranteeing body and shipment-specific eligible use; do not imply ENVOD issues carnets unless authorized.
  - Exhibition quote requirements: event/venue, in/out dates, commodity, dimensions/weight, origin, temporary-import status, return plan and site access.
  - Temperature-controlled freight: cargo temperature range, packaging, lane, monitoring and handling requirements only where the company confirms the capability.
- Do not add FAQ schema to chase a rich result; ensure the text is useful, visible and consistent with the structured data.
- No featured snippets or AEO outcomes were measured.

## 12. GEO Assessment

- Positive eligibility signals: English pages are prerendered, the sitemap is public, `robots.txt` allows all crawlers, and organization/service/FAQ structured data is present.
- Gaps: no crawlable Arabic page set, no direct authority citations in the sampled priority pages, limited first-hand evidence in claims, and no accessible analytics of AI referrals.
- `/llms.txt` returns 404. This is not by itself an SEO or AI-citation defect; do not add a file unless it has accurate, maintainable content.
- Google AI Overview, ChatGPT Search, Gemini and Perplexity citations were not checked. The site cannot be declared cited or uncited.
- Practical work: accurate company/entity facts, original process and quote guidance, visible references to authoritative rules, descriptive internal links, current proof of capability, and a crawlable EN/AR structure. These improve interpretability but cannot guarantee AI citations.

## 13. Competitor Analysis

No current Saudi-localized Google result pages could be captured. The earlier public Bing RSS samples were irrelevant, and the search callback returned 402. Competitor observations below are direct-page comparisons, **not ranking observations**.

| Company | Verified page evidence | Relevant benchmark | Limitation |
|---|---|---|---|
| DSV Saudi Arabia | [Country page](https://www.dsv.com/en/countries/saudi-arabia); related [sea freight](https://www.dsv.com/en/our-solutions/modes-of-transport/sea-freight), [customs clearance](https://www.dsv.com/en-ae/our-solutions/modes-of-transport/value-added-services/customs-clearance), [project transport](https://www.dsv.com/en-ae/our-solutions/modes-of-transport/project-transport), and [road transport](https://www.dsv.com/en/our-solutions/modes-of-transport/road-transport) pages. | Clear service segmentation and broad market-facing service explanations. Benchmark for navigation, proof and service detail; ENVOD can differentiate with verified local operational knowledge and specific quote guidance. | Direct pages were reviewed; no Saudi query ranking, traffic, backlink or market-share data was available. |
| Maersk | [Ocean transport](https://www.maersk.com/transportation-services/ocean-transport). | Strong service-specific education and clear ocean-freight path. Use as a content-structure reference, not copy. | Global brand; no local SERP rank or performance data inferred. |
| DHL / Aramex / Bayan | Names appeared in Google autocomplete continuations for customs queries. | Candidates to include in a later SERP competitor capture. | Suggestion output is not a verified result page or proof of local ranking for ENVOD’s target queries. |

**Differentiation opportunities:** verified Saudi customs/port process guidance; event cargo and temporary import expertise with accurate issuer roles; bilingual, native-reviewed service pages; transparent shipment-specific quote requirements; and authorized customer case studies. Use only real examples and approved names.

## 14. Backlink and Authority Assessment

- No current GSC link report or external backlink account was available.
- An earlier owner-provided SerpOK snapshot in `research/sources.json` / `research/seo-audit.md` reported DR 0, UR 0, 388 backlinks, 382 referring domains, and no organic keywords/traffic/AI citations. The snapshot date, scope and tool settings are unverified; it is not treated as a current fact or a Search Console measurement.
- No independent toxicity finding was made; no disavow is recommended.
- Legitimate prospect categories (not confirmed links): verified chamber/association member directory if eligible; real exhibitor/vendor profile for events ENVOD actually serves; authorized customer/supplier case studies; genuine partner directory listings; and editorial logistics/trade coverage based on original useful material. Sponsorship links should be properly qualified where required.
- Do not buy bulk links, use PBNs, create fake profiles, submit irrelevant directories or promise DR/DA/rankings. No outreach or backlink acquisition was performed.

## 15. Conversion and Enquiry Form Audit

### Production behavior found

- The target source’s contact form and quote modal call `mailto:` to the existing `info@envodkingdom.net` recipient. The public bundle contains `mailto:info@envodkingdom.net` and “Email Draft Is Ready”; the checked bundle did not contain a specific `/api/enquiries` endpoint.
- Contact validation is client-side. The contact form has a client-side honeypot, but no server endpoint exists in the target repository to enforce validation or rate limits. A browser-only honeypot can be bypassed.
- The quote modal collects a generic service selection and shipment/contact fields (origin, destination, cargo description, name, company, email, phone and message). Fields do not become meaningfully service-specific for customs, exhibition, ATA, cold-chain or project cargo.
- The contact form asks for contact/service/message information. Neither form provides production server-side validation, spam/rate limiting, provider-acceptance handling or a retryable server error state in the inspected target.
- The floating WhatsApp CTA and contact telephone/email are present. No click/submission analytics were detected.
- The contact footer shows Privacy Policy, Terms and Cookie Policy with `href="#"`; the corresponding URLs return 404. No privacy notice was observed beside the forms.
- The app’s Replit-side Resend connection returned HTTP 401 to a read-only domain query. No email was sent. The previous successful Replit tests reported by the owner do not verify this Vercel production source or its environment.

### Recommended conversion work (not implemented)

1. Confirm target repository and Vercel deployment; add the serverless submission endpoint to the correct production source only after separate authorization.
2. Keep `info@envodkingdom.net` as the recipient unless the owner authorizes a change. Store provider credentials only in Vercel/Replit secrets, never frontend code.
3. Validate and rate-limit server-side; add robust spam controls; accept success only after Resend confirms acceptance; show a clear retryable error on failure.
4. Add service-specific optional fields: customs commodity/port/documents; sea/air origin/destination/mode/weight/dimensions; exhibition event/venue/dates/temporary import; ATA use/eligible goods; temperature range; project cargo dimensions/lift/route. Keep the form short and mobile usable.
5. Publish a real privacy policy and a concise notice beside each form. Do not imply consent or delivery unless it occurred.
6. Track form success only after provider acceptance and separately track telephone/WhatsApp clicks, once analytics and privacy requirements are confirmed.

## 16. Search Console and Analytics Findings

- No Google Search Console or GA4 account was connected or accessed. There are no verified clicks, impressions, CTR, average position, query, landing-page, indexing, conversion or organic-revenue figures in this report.
- No GA/GTM/Umami marker was detected in the inspected target source and public page/bundle. This check cannot rule out server-side or tag-manager configuration outside the repository.
- The unverified SerpOK snapshot is not a substitute for GSC.
- For a complete follow-up audit, export GSC Search Results for the longest available range, filtered to Saudi Arabia and then GCC countries, with queries/pages/clicks/impressions/CTR/position/device; include Page indexing and sitemap reports. Provide GA4 landing-page/channel/device/country events and verified lead outcomes, without sharing visitor personal data.
- Confirm event names and retention/privacy choices with the owner before adding analytics. No conversion rate or expected uplift is estimated.

## 17. Prioritized Issue Register

No issue is labelled P0/Critical because the evidence does not show a site-wide outage or exposed credential. These are the ten highest-impact items, followed by secondary technical items.

### Top ten

**I-01 — P1: Production forms do not deliver an enquiry server-side**

- **Affected:** `/contact`, site-wide quote modal; target `src/pages/contact.tsx`, `src/components/QuoteModal.tsx`.
- **Evidence:** `mailto:` in live bundle/source; “Email Draft Is Ready”; no server endpoint in target repo. A mail draft depends on the visitor’s email client and manual send.
- **Action/benefit:** after separate authorization, implement a serverless submission path and accurate provider-acceptance/retry UI; keep recipient unchanged. Reduces silent lead loss.
- **Effort/risk:** Medium/High; risk Medium. Dependencies: correct Vercel project, secrets configuration, verified sender, privacy policy and owner-approved fields.
- **Verify:** server-side validation, rate limits, honeypot/spam tests, provider acceptance, provider failure, successful delivery in an authorized test inbox; mobile and accessibility checks.
- **Public URL change:** No. **External account:** Yes, Vercel and Resend.

**I-02 — P1: Privacy/legal destinations are not live**

- **Affected:** `/contact`, footer; `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`.
- **Evidence:** footer labels use `href="#"`; each sampled route returns 404; no notice observed beside forms.
- **Action/benefit:** owner-approved policy content and real links/notices before collecting data via a server endpoint.
- **Effort/risk:** Medium/High; risk Medium. Dependency: owner/legal review.
- **Verify:** links open 200 pages, notice is near each form, policies accurately describe actual data/retention.
- **Public URL change:** adds policy URLs. **External account:** No, but policy approval required.

**I-03 — P1: Arabic search pages are absent**

- **Affected:** `/ar` and Arabic service routes; sitemap/prerender/language handling.
- **Evidence:** sampled Arabic paths return 404; no Arabic sitemap URLs or `hreflang`; `html lang="en"` in initial HTML.
- **Action/benefit:** publish crawlable Arabic pages with native review, reciprocal hreflang, correct Arabic `lang`/RTL and Arabic sitemap entries while preserving all current English URLs.
- **Effort/risk:** High; risk Medium. Dependency: native Arabic review and verified terminology/capabilities.
- **Verify:** Arabic routes 200, unique metadata and canonical, reciprocal hreflang, rendered RTL/mobile checks, sitemap and Search Console inspection.
- **Public URL change:** adds `/ar/...` URLs. **External account:** GSC access helpful.

**I-04 — P1: Bare and `www` HTTPS both serve content**

- **Affected:** all canonical pages.
- **Evidence:** both hostnames return 200; page canonicals and sitemap use `www`.
- **Action/benefit:** set a single canonical host redirect at Vercel; reduce duplicate-host ambiguity.
- **Effort/risk:** Low/Medium; risk Medium. Dependency: Vercel domain settings and verification.
- **Verify:** test HTTP/HTTPS and both hosts on home and service paths; confirm one-hop redirect, canonical and sitemap host.
- **Public URL change:** host redirects change; page paths remain unchanged. **External account:** Vercel.

**I-05 — P1: Unsupported or ambiguous capability/timing claims**

- **Affected:** customs, ATA, exhibition, air freight, warehousing, medical/pharma, food, pet import, dangerous goods, OOG, GCC transport and local-business schema.
- **Evidence:** live metadata includes “typically within 24 hours,” “50+ countries,” “80+ countries,” compliance/facility/fleet statements; schema includes 50–200 employees. No supporting owner records were available.
- **Action/benefit:** obtain evidence per claim; remove or qualify unsupported claims and state ENVOD’s exact coordination/issuer/partner role. Protects trust and avoids misrepresenting regulated capabilities.
- **Effort/risk:** Medium; risk Low after fact-check. Dependency: owner confirmation and current certificates/operational records.
- **Verify:** page-by-page claim checklist, EN/AR parity, structured-data validation.
- **Public URL change:** No. **External account:** No.

**I-06 — P1: Shipment-tracking promise conflicts with the available flow**

- **Affected:** `/track`, `src/pages/track.tsx`, title/description.
- **Evidence:** metadata promises live real-time updates; target source displays “Online Tracking Available Soon” and has no tracking API integration.
- **Action/benefit:** either connect a real tracking source with access controls, or accurately present a shipment-status enquiry page.
- **Effort/risk:** High for live tracking; Low for copy correction; risk Medium. Dependency: carrier/customer data source.
- **Verify:** test known authorized tracking references end-to-end, or verify corrected copy and enquiry flow.
- **Public URL change:** No. **External account:** Carrier/API access if building tracking.

**I-07 — P2: Metadata snippets are often overlong**

- **Affected:** five long-title pages and 33 descriptions over 160 characters, listed in the inventory.
- **Evidence:** live `<title>` and description lengths measured across all 43 pages.
- **Action/benefit:** shorten only after intent/claim review; prioritize home, customs, exhibition, ATA, industries, Vision 2030 and OOG. Improves snippet control without promising rankings.
- **Effort/risk:** Medium; risk Low. Dependency: claim review.
- **Verify:** check title/description uniqueness, SERP previews and recrawl.
- **Public URL change:** No. **External account:** No.

**I-08 — P2: Performance risk is not measured and image layout may shift**

- **Affected:** home and service-page assets; `src/components/ScrollAnimSection.tsx`, image components, built JS.
- **Evidence:** homepage HTML 717 KB raw/148 KB gzip; JS 1.24 MB raw/397 KB gzip; image dimensions absent from audited markup; PSI 429.
- **Action/benefit:** use Lighthouse/PSI when available, inspect LCP element, reserve image dimensions/aspect ratios, split unnecessary JS and keep below-fold media lazy.
- **Effort/risk:** Medium; risk Low/Medium. Dependency: valid mobile/desktop performance tools.
- **Verify:** compare field/lab metrics before and after; no layout regressions; preserve existing visuals.
- **Public URL change:** No. **External account:** PSI quota or local Lighthouse setup.

**I-09 — P2: Production source/deployment identity is not confirmed**

- **Affected:** GitHub/Vercel source of truth.
- **Evidence:** Replit origin is `iTszaLi/envodkingdom`; target repo is `iTszaLi/ekl2026`; 43 dirty Replit entries at audit start; Vercel deployment URL is SSO-protected; active deployment SHA unavailable.
- **Action/benefit:** confirm repo, branch, Vercel project, latest deployment SHA and environment before implementation; create a backup/preview and preserve current URLs/Exhibition page.
- **Effort/risk:** Low/Medium; risk Low. Dependency: authorized Vercel project access.
- **Verify:** compare Vercel deployment commit, target `main`, built artifact and live HTML; do not push from the mismatched checkout.
- **Public URL change:** No. **External account:** Vercel/GitHub access.

**I-10 — P2: No verified SEO or lead measurement**

- **Affected:** sitewide.
- **Evidence:** no Search Console/GA4 access; no analytics marker detected; no conversion metrics.
- **Action/benefit:** connect authorized Search Console/analytics or share exports; instrument accepted enquiries, phone and WhatsApp clicks with privacy approval.
- **Effort/risk:** Medium; risk Medium. Dependency: account access and privacy review.
- **Verify:** event test, GSC property/sitemap status, channel and country reports.
- **Public URL change:** No. **External account:** GSC/GA4.

### Additional P2/P3 findings

- **P2 — Sitemap lastmod:** all 43 entries share `2026-07-06`; update to actual page-modified dates or omit inaccurate dates. No URL change; verify generated sitemap.
- **P2 — Security headers:** only HSTS was observed among queried headers; configure appropriate headers in the actual Vercel project and test. No URL change; Vercel access required.
- **P2 — Low internal link counts:** food/FMCG, pet/animal and cross-trade each have one distinct inbound page. Add relevant contextual links if useful; no new pages required.
- **P3 — Authority/backlinks:** current metrics are unavailable or unverified. Build only legitimate, evidence-based partner/customer/editorial references; do not buy or fabricate links.

## 18. Recommended 30-Day Action Plan

**Days 1–5: Protect source and verify facts**

- Confirm the live Vercel project, connected GitHub repo/branch and active deployment SHA. Do not merge/push from the mismatched Replit checkout.
- Take a source backup/branch and use a Vercel preview for any later implementation; preserve all existing English URLs and the exhibition page.
- Owner-verify the ATA timing, tracking, service availability, credentials, employee range, address, warehouse/fleet, service-area and event claims.
- Obtain Search Console/GA4 exports and confirm the correct GBP/address situation.

**Days 6–12: Fix high-risk lead and trust blockers after authorization**

- Finalize the privacy notice/policy and legal URLs.
- Build/test the Vercel-side enquiry submission only in the confirmed production repository; keep `info@envodkingdom.net` as recipient; do not expose credentials.
- Test validation, spam controls, rate limits, accepted email, failure/retry, and authorized labeled test delivery.
- Replace inaccurate tracking claims if no live tracking backend exists.

**Days 13–20: Make bilingual and canonical foundations crawlable**

- Publish reviewed Arabic equivalents for existing priority pages (customs, freight/ocean, GCC transport, exhibition and ATA first); keep English URLs stable.
- Add reciprocal hreflang/canonicals and Arabic sitemap entries; verify language/RTL rendering.
- Redirect bare HTTPS to the declared `www` host after reviewing Vercel domain behavior.
- Correct title/description outliers while preserving page copy and visual design.

**Days 21–30: Validate and measure**

- Run full route/link/canonical/sitemap/structured-data checks on a preview and production only after owner approval.
- Run mobile/desktop PSI or Lighthouse, inspect CWV and image/JS bottlenecks.
- Configure privacy-approved events for accepted quote submissions and phone/WhatsApp clicks.
- Review GSC query/page/country data and prioritize exact Saudi English/Arabic intent; do not expand pages based on autocomplete alone.

## 19. Recommended 60–90-Day SEO, AEO and GEO Roadmap

- Use real GSC query/page data to refine intent mapping for customs in Riyadh/Jeddah/Dammam, sea freight routes, GCC road freight, exhibition logistics and ATA Carnet.
- Add only verified route/port coverage and useful customer information to existing pages; create a new page only where a distinct service/search intent and real capability are documented.
- Publish native-reviewed Arabic content and maintain parity as English service facts change.
- Add original, owner-approved case studies with cargo type, route, role and outcome evidence; anonymize customers unless approved.
- Strengthen FAQ answers with official ZATCA/ICC references and current, visible source links. Keep company claims distinct from regulatory facts.
- Build legitimate off-page authority through genuine association memberships, event participation listings, customer/supplier stories and editorial contributions. Record outreach separately from acquired links.
- Monitor accepted enquiry quality and source channel monthly. Run controlled form and CTA tests without promising a fixed conversion uplift.
- Recheck schema, claims, sitemap modified dates, redirects, mobile performance, AI crawler access and Search Console indexing on a regular schedule.

## 20. Questions, Data, or Access Required From the Owner

1. Which Vercel project and GitHub repository/branch are authoritative for production? Can an authorized view confirm the current deployment SHA and environment variable names (not values)?
2. Can you provide Search Console exports for queries/pages/clicks/impressions/CTR/position by country and device, plus indexing/sitemap issues?
3. Is GA4 or another analytics tool intentionally installed? If yes, share aggregate reports/event names; do not share visitor-level personal data.
4. Is there a verified Google Business Profile? Confirm whether the displayed Riyadh address is a staffed customer-facing location and whether hours/phone are current.
5. Which services, routes, ports, facilities, fleets, certifications and regulatory activities does ENVOD directly provide versus coordinate through partners?
6. What evidence supports the 24-hour ATA claim, 50+/80+ country counts, 50–200 employee range, bonded/temperature-controlled facilities and dedicated fleet? If none, should those claims be removed?
7. Does ENVOD issue ATA Carnets, coordinate with the authorized issuer, or provide freight/customs support around a Carnet? Confirm current Saudi eligibility and scope.
8. Is shipment tracking backed by a live system? If so, which authorized tracking source can be used without exposing customer shipment data?
9. Are the Exhibition event names/logos current and approved for use? Which event logistics examples can be documented with permission?
10. Who will approve the Arabic terminology and service-page translations?
11. What privacy policy and retention/contact process should be represented in the forms?
12. Can the Resend connection be updated/reconnected through the existing Replit integration after its read-only API request returned 401? No key should be sent in chat.

## 21. Appendix: Technical Evidence, URLs, Metrics, Source Files and Test Results

### Public URL tests

| Test | Result |
|---|---|
| `https://www.envodkingdom.net/` | 200; Vercel; cached HIT observed |
| `https://envodkingdom.net/` | 200; does not redirect to the `www` canonical |
| `http://www.envodkingdom.net/` | One redirect to HTTPS `www`; final 200 |
| `http://envodkingdom.net/` | One redirect to HTTPS bare host; final 200 |
| Sitemap URLs | 43/43 returned 200 |
| Internal path crawl | 43 unique paths; no non-200 targets in this path set; no orphan within the set |
| Arabic routes | `/ar`, `/ar/services/customs-clearance`, `/ar/services/exhibition-logistics`, `/ar/services/ata-carnet` returned 404 |
| Policy routes | `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy` returned 404 |
| `robots.txt` / `sitemap.xml` | Both returned 200 |
| `/llms.txt` | 404; not treated as a required SEO file |
| Vercel generated deployment URL | HTTP 302 to Vercel SSO; deployment details unavailable |
| Resend read-only `GET /domains?limit=100` | HTTP 401; no domain status returned; no email sent |

### Search/data test notes

- Google autocomplete used `https://suggestqueries.google.com/complete/search` with `client=firefox`, `gl=SA`, and `hl=en`/`hl=ar`. Results are suggestion strings only.
- Examples returned: customs broker/office/agent phrases for Riyadh and Dammam; Arabic office/company/port phrases for Riyadh/Jeddah; sea-freight routes from China/India/UK; ATA Carnet Saudi Arabia.
- No suggestions were returned for several exhibition-logistics and Arabic GCC-road seeds. An empty suggestion response does not mean zero search demand.
- Web search: HTTP 402. PageSpeed: HTTP 429. External screenshots: HTTP 402/429.

### Source files inspected in the target repository

- `artifacts/envod-kingdom/index.html`
- `artifacts/envod-kingdom/package.json`
- `artifacts/envod-kingdom/prerender.mjs`
- `artifacts/envod-kingdom/public/robots.txt`
- `artifacts/envod-kingdom/public/_headers`
- `artifacts/envod-kingdom/src/lib/seo-config.ts`
- `artifacts/envod-kingdom/src/pages/contact.tsx`
- `artifacts/envod-kingdom/src/pages/track.tsx`
- `artifacts/envod-kingdom/src/components/QuoteModal.tsx`
- `artifacts/envod-kingdom/src/components/ExhibitionSection.tsx`
- Service, industry and layout source/data referenced by the route pages.

### Relevant existing research and external references

- `research/notes.md`, `research/ksa-search-intent.md`, `research/sources.json`
- `research/sources/ksa-customs-ports/01-zatca-import-instructions.md`
- `research/sources/ksa-customs-ports/02-zatca-customs-journey.md`
- `research/sources/ksa-search-intent/zatca-customs-brokers.md`
- `research/sources/ksa-search-intent/icc-ata-carnet.md`
- `research/sources/ksa-search-intent/maersk-ocean-transport.md`
- `research/sources/ksa-competitors/company-page-evidence.md`
- [ZATCA Import Instructions](https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx)
- [ZATCA Customs Journey](https://zatca.gov.sa/en/HelpCenter/CustomerJourney/Pages/customs-journey.aspx)
- [ICC ATA Carnet](https://iccwbo.org/business-solutions/ata-carnet/)
- [Google localized versions guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [OpenAI crawler documentation](https://platform.openai.com/docs/bots)

### Test results and change log

- Live sitemap route checks: **43/43 HTTP 200**.
- Internal href graph: **0 broken targets within the discovered 43-page set; 0 orphan pages**.
- Metadata: **43 unique titles, 43 unique descriptions, 43 canonical URLs, 43 pages with one H1**.
- JSON-LD: **all scripts parsed as JSON**; no external rich-results validator was run.
- Provider delivery: **not tested**; Resend read-only domain request returned 401; no email sent.
- Search/analytics/backlinks/CWV: **not available or not tested**, as described above.
- Website code/config, DNS, GitHub settings and production deployment: **not changed** during this audit. This Markdown report is local only and is not committed or published.


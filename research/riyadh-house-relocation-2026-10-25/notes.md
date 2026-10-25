# Riyadh residential moving — research notes

**Status:** researched, implemented in isolated candidate, and verified locally
**Depth:** Deep

## Plan

- **Question:** What can ENVOD substantiate on its existing English/Arabic relocation pages, and which low-risk changes can improve qualified enquiries without claiming unverified moving services?
- **Scope:** Saudi-first, Riyadh residential/home/furniture relocation and packing; relevant local and international providers; existing `/services/relocation` and `/services/packaging-crating` pages only; isolated verified checkout.
- **Audience:** Riyadh/Saudi homeowners, renters, families and business enquiry customers; owner reviews business-model claims.
- **Deliverable:** Source-backed EN/AR relocation update, competitor/keyword findings, capability-confirmation list, change ledger, QA report. No release.

## Focus Areas

| # | Area | Status | Sources |
|---|---|---|---|
| 1 | Riyadh English/Arabic search discovery and intent | complete; terms remain hypotheses | S05, S08–S12, S29–S33, S49 |
| 2 | A Plus / E-Movers service and quote journeys | complete; company claims only | S13–S20, S26, S28 |
| 3 | Crown / CargoTrack international relocation | complete; locations kept distinct | S21–S27 |
| 4 | Dar Al Ittijahat / Manqul / local providers | complete; site-status and identity caveats recorded | S09, S29–S40, S42–S46, S48 |
| 5 | ENVOD relocation model, pages, technical and conversion review | complete for current public pages and isolated code | S01–S04; local source/tests |

## Coverage Checklist

- [x] Separate measured Saudi search demand/rank from query hypotheses; identify source availability.
- [x] Verify official identity and service-scope claims for supplied moving competitors.
- [x] Compare residential, office, international, packing/storage, dismantling and return capabilities without treating missing page evidence as inability.
- [x] Inspect production and isolated EN/AR relocation/packaging routes, metadata, forms and internal links. The responsive layout follows existing breakpoints; no physical-device or mobile SERP measurement was performed.
- [x] Confirm which ENVOD household-moving capabilities can be sourced from approved information; list unresolved owner questions.
- [x] Implement bilingual, low-risk copy and enquiry improvements in the isolated checkout only; preserve public routes and contact destinations.
- [x] Run tests, build, typecheck and static output assertions; record warnings and evidence-dependent gaps.

## Findings Log

Source IDs in `sources.json` are the registry. Company pages are claims unless independent records corroborate them. Search-discovery output is not a localized Google rank report.

### Search intent and measurement

- Search work covered English and Arabic variants using general discovery queries and page inspection. Results were not controlled by Riyadh device/location/account and do not establish rank order.
- English transactional candidates: “movers in Riyadh,” “Riyadh movers and packers,” “house shifting Riyadh,” “furniture movers Riyadh,” “moving company in Riyadh,” “home relocation Riyadh,” and apartment/villa move variants.
- Arabic transactional candidates: `نقل عفش بالرياض`, `شركة نقل عفش بالرياض`, `نقل أثاث بالرياض`, `شركة نقل أثاث بالرياض`, `نقل عفش داخل الرياض`, `نقل عفش من الرياض`, `نقل بيت بالرياض`, `نقل شقة بالرياض`, `نقل فيلا بالرياض`.
- Scope/price intent includes packing, dismantling/reassembly, moving-day planning, cartons, volume and quote variations in both languages. Useful informational intent includes planning an apartment/villa move and preparing fragile or oversized furniture. Arabic copy should use both colloquial `عفش` and formal `أثاث`.
- Search-discovery pages and snippets are recorded in `sources.json`. We did not receive GSC/GA4 data, a Google Ads Keyword Planner export, GBP access, city-specific organic rank tracking, actual enquiry conversion data, or a referring-domain export. No query volume, traffic, position, share of voice, conversion rate, or link count is reported.
- “الصفرات” is the competitor's spelling; it is not the district name “السفارات.” Do not conflate business names, legal entities or branches.

### Competitive comparison

- Four Winds publishes local/intercity Riyadh moving scope, packing and dismantling/reassembly. FIDI's separate Riyadh record provides stronger branch/affiliation corroboration than a company location claim alone, but is not evidence of service quality or performance (S05–S07).
- A Plus and E-Movers present quote journeys that collect origin, destination, move-size, date and notes, and publish home-moving, packing and international offerings. Those pages support customer-expectation patterns only; each provider's claims remain self-published. A Plus's “#1” language and ambiguous insurance copy are not copied (S13–S20).
- Crown's Riyadh page focuses on international household relocation, planning/packing and storage; it does not prove a same-city furniture-moving offer. CargoTrack publishes broader household moves, but its FIDI record is for Jeddah, not Riyadh (S21–S25).
- Dar Al Ittijahat and Alsafrrat publish Arabic local-Riyadh furniture moving, packing and/or dismantling scope. These are company statements, not independently verified credentials or offices (S09, S29–S31).
- SIMC, KIM, Ishaq and Go Movers were considered from provider material. Their coverage claims were not converted into branch claims without independent address evidence (S34–S37, S45).
- E-Movers' FIDI listing is Dubai, and Four Winds' IATA CargoLink entry is Jeddah; neither should be generalized to a Saudi/Riyadh household-moving credential (S26–S27).
- Manqulmovers.com displayed a suspended/expired-domain notice at inspection; a separate manqul.online result was not confirmed to be the same operator. RJ Movers could not be verified, and the similarly named UK business is unrelated. Farhan Home Shifting Services was not conclusively identified. Global Fleet did not show household removal scope in the inspected result and was excluded as a direct household-moving comparator (S32–S33, S48–S49).
- Government transport regulation is not proof that a specific company is currently licensed. Legal-entity, city and review-database references were treated as corroborating leads, not service endorsements (S40, S42–S46).

### ENVOD baseline and isolated candidate

- Production English/Arabic relocation and packaging URLs returned HTTP 200 on 2026-10-25. Relocation EN/AR canonicals and `en-SA`, `ar-SA`, `x-default` alternates already pointed to the correct existing routes (S01–S04).
- Existing English metadata addressed residential/commercial moves in Saudi Arabia broadly. The candidate narrows title/H1/description to Riyadh household relocation while retaining the existing `/services/relocation` route. Arabic metadata, H1, overview, quote guidance, FAQs, process, request categories and internal guidance are localized together.
- The candidate adds practical route/inventory/date/access questions, distinguishes local/intercity/international enquiries, and states that provider, route, inclusion, price, customs, insurance and timing must be confirmed. It makes no rank, first-place, response-time, owned-fleet, direct-crew, branch, guaranteed delivery or universal package claim.
- The candidate reduces relocation request categories to four relevant enquiry types: homes/apartments, office/employee moves, international household requests and packing/handling/storage requests. Unsupported generic export/industrial, pet, vehicle and on-site service cards were removed from this page's service metadata only. Missing competitor or owner evidence is not described as an inability to serve.
- The existing relocation enquiry already gathered move type, home size, approximate contents, packing/assembly, preferred date, storage and general cargo/location details. A new optional bilingual textarea records building access and special handling (e.g. floor/lift/stairs, entry/parking restrictions, fragile/oversized items). No full address is required, no upload field was added, and the API schema/endpoint/recipient are unchanged.
- Added a bilingual move-preparation checklist and links to existing packaging/crating, warehousing and customs-clearance routes. These URLs already exist; no new landing pages were added.
- No existing phone, email or WhatsApp destination changed. Verified code constants/routes remain WhatsApp `https://wa.me/966502260256`, phone `+966 58 367 1739`, email `info@envodkingdom.net`.
- Production/GitHub/Vercel were not changed. All proposed copy/form/code is confined to `/home/runner/ekl2026-ksa-seo-isolated` on the isolated `agent/ksa-exhibition-seo-audit` checkout; earlier exhibition-candidate work remains preserved there.

### Verification

- `pnpm run typecheck`: passed across the root, artifact and script packages.
- `pnpm exec tsx --test server/*.test.ts server/search-console/*.test.ts`: 38 passed, 0 failed.
- Production Vite client + SSR build and prerender: passed; 92 routes generated.
- Relocation English and Arabic prerendered pages each contain one localized H1, a locale-specific title and canonical, all three correct language alternates, and one FAQPage JSON-LD block.
- Build emitted two source-map diagnostic messages for `tooltip.tsx` and `select.tsx`; both client and SSR bundles completed. It also emitted the existing large-chunk advisory. Nothing was silenced or changed in build configuration.
- Tests and static prerender output do not execute an actual quote submission or prove provider delivery. Public page inspection and local tests do not constitute a real-device UX test, GSC validation, rankings, a Google Business Profile review, or release verification.

## Conflicts & Open Questions

- Whether ENVOD supplies direct crews/vehicles or coordinates third-party providers; which party is the contracting supplier, appears on the quote, carries goods liability and handles service failures.
- Current Riyadh neighborhoods/areas, local and intercity route coverage, apartment/villa capacity, office/employee move scope, packing/unpacking, furniture dismantling/reassembly, fragile-item handling and storage locations/terms.
- International household routes and customs support; which documents ENVOD prepares versus which the customer/provider/authority supplies; goods eligibility, required importer documents and exemptions.
- Insurance options, limits/exclusions, claims process, timing/price/availability statements, quote validity and actual operating hours.
- Whether customers should provide exact addresses during the form step, retention/access rules for those details, and whether translations/contact response are staffed consistently.
- No authenticated GSC exports, keyword tool, controlled Riyadh SERP tracker, GBP access, customer-review evidence, referral/backlink dataset or performance analytics were supplied.

## Gaps

- [x] Any owner-confirmation request is recorded rather than guessed.
- [x] Do not build photo/video uploads, new service routes, new local pages or claim cards without verified business scope and approval.
- [x] Search providers by English and Arabic queries; where search tools are not location-controlled, label organic positions unmeasured.

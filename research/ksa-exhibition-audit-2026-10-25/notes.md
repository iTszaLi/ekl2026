# Research Notes: KSA Exhibition Logistics SEO and Competitor Audit

**Status:** completed with explicitly documented account-data and ranking limitations
**Depth:** Deep
**Research date:** 2026-10-25
**Baseline:** `9d896a8945b0ac1f77d1f10ca83e3eec1a8deff5`

## Plan

- **Question:** Which SEO, AEO, local trust, conversion, and technical improvements are justified for ENVOD's existing exhibition-logistics service without risking URLs or unsupported claims?
- **Scope:** Public site and named competitor pages; official KSA event/customs guidance; source-level bilingual/technical audit; read-only Vercel and Search Console readiness; isolated, additive changes only.
- **Audience:** ENVOD owner and website maintainers.
- **Deliverable:** Evidence-labeled report, source register, isolated change ledger, and QA results.

## Focus Areas

| # | Area | Status | Evidence |
|---|---|---|---|
| 1 | Competitor identity and public service claims | pending | Existing 17–21 Oct research to recheck and extend |
| 2 | English/Arabic query intent and localized result limitations | pending | Search discovery; no rank tracker or GSC export |
| 3 | Saudi customs, ATA Carnet, event and venue references | pending | Official sources and owner scope |
| 4 | Production technical SEO, bilingual routes, leads and forms | pending | Verified source, live HTTP, Vercel metadata |
| 5 | Authority/backlinks, local trust and measurement | pending | Public evidence only; account exports unavailable |

## Coverage Checklist

- [x] Reconfirm baseline commit, branch, remote, status, and Vercel production deployment.
- [x] Verify named competitor identities and compare evidence-backed page features.
- [x] Report observed search results separately from measured Saudi Google rankings.
- [x] Identify evidence-backed high-confidence changes and intentionally defer unsupported claims.
- [x] Audit EN/AR route parity, metadata, links, conversion flow, and technical behavior.
- [x] Verify anonymous Search Console readiness and source/tests, without bypassing authentication or claiming account access.
- [x] Run build, typecheck, tests, route/metadata regression checks, and safe mocked form checks.

## Findings Log

Use source keys from `sources.json`. Label every material claim as official guidance, company-owned claim, owner confirmation, tool observation, or hypothesis.

- S01–S05: live 92-page crawl and anonymous configuration flags; 46 pages in each language. No authenticated reports.
- S06–S18: competitor service claims and identity corrections; GES KSA is distinct evidence from ges.com. Smart Powers' stand-production offer does not establish freight/customs scope. Diqah is not ENVOD.
- S19–S30: official customs, ATA, event and venue references. ZATCA news publication date (2 June 2024) is not itself the effective date; service/ATA network records identify 1 June 2024. Avoid hardcoding operational dates/timing.
- S31–S37: Arabic commercial vocabulary and legitimate association/vendor/identity pathways; no rankings or existing ENVOD affiliations inferred.
- S38–S41: primary search/API/security guidance. No additional AI technical requirement; API results are not exhaustive; CSV hardening is separate.
- Completed five initial research workstreams and two gap-fill reviews.
- Isolated changes: bilingual quote checklist, official references, packaging internal link, responsive anchor clearance, native RTL bullet direction. Existing text and URLs preserved.
- QA: workspace typecheck, 37 passing tests, production build/prerender, counter/image checks, 92-route schema/asset checks, four Chromium EN/AR desktop/mobile cases. No runtime exceptions or horizontal overflow in changed views.
- Source-map diagnostics and large-chunk warnings remain non-fatal in the build; no suppression applied.
- Full report and file ledger: `report.html`. Inventory: `route-inventory.csv`; browser assertions: `qa-results.json`; verifier: `verify.mjs`.
- Second competitor addendum added to the original report: 97 total source URLs; DHL, Agility history/current DSV, DSV event documents, Kuehne+Nagel, Global Fleet, Advanced Logistics and unresolved Sky Expo.
- Additional five research workstreams and two gap-fill reviews completed. Organizer checks supersede stale DSV ACHEMA/Intersec dates; do not copy calendar information without a freshness policy.
- Detailed status scorecards retain all original competitors, separate global/local/production scopes, and do not assign invented scores or rankings. No further application changes or release actions were made for the addendum.

## Conflicts & Open Questions

- Prior research found web-search and SERP access limitations; current discovery must not be described as a city-level Google ranking report.
- No GSC integration or supplied export is currently available. A configured production OAuth service is not the same as an authenticated connection.
- Competitor case studies and capabilities are company claims unless independently corroborated.
- Business metrics and service scope are owner-confirmed only within the scope stated in the project accuracy policy; do not extrapolate.

## Gaps

- Actual query/page impressions, clicks, CTR, and average position require authenticated GSC access or owner-supplied exports.
- Keyword volume/difficulty and backlink metrics require a named data provider; none will be invented.
- Real-world office, event appointment, customs, venue access, and customer outcomes require primary business evidence.

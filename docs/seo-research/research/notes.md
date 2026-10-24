# Research Notes: ENVOD Complete SEO Intelligence and Market Review

**Status:** complete — research, dashboard implementation, and local verification passed; remote release verification is reported separately.
**Depth:** Deep

## Plan

- **Question:** Which evidence-backed organic-search and conversion improvements are appropriate across ENVOD KINGDOM’s 25 services and relevant KSA, UAE/Dubai and GCC markets in English and Arabic?
- **Scope:** Use the existing production site and research as baseline; validate technical/crawler behavior, service/market coverage, public search observations, competitors, and available first-party data. Preserve approved routes and claims. No assumed local offices, metric estimates, rankings, credentials or service capabilities.
- **Audience:** ENVOD business owner and implementation team.
- **Deliverable:** A sourced research report, auditable keyword-to-page and 25-service/multi-market matrices, technical and AI-crawler audit, prioritized roadmap, and verified production implementation report.

## Focus Areas

| # | Area | Status | Sources |
|---|---|---|---|
| 1 | Existing service catalog, English/Arabic keyword maps, KSA and city coverage | done | existing Saudi candidate dataset + 12 KSA/EN source records |
| 2 | Arabic-language service intent, terminology and Saudi competitor pages | done | existing candidate map + 9 KSA/AR source records |
| 3 | UAE/Dubai and cross-border freight market scope | done | 10 source records; official rules and provider-page claims separated |
| 4 | Wider GCC corridors, service scope and competing provider pages | done | 12 source records; official process guidance separated from carrier claims |
| 5 | Technical SEO, Search Console/Bing access, and official AI/search crawler policies | done | live 86-URL crawl + 13 crawler/ATA source records; Meta discovery and Bing notification verified; xAI remains unverified |
| 6 | Secure administrator research views for keywords, competitor evidence, markets and actions | done | Existing authenticated Search Console workspace; research data served by admin-checked, private no-store API |

## Coverage Checklist

- [x] Account for every service in the current source catalog and both language routes without changing established URLs; distinguish 24 detail routes from 25 directory offerings. (25-service matrix complete; Door-to-Door remains directory-only.)
- [x] Map the Saudi 566-record candidate set and carefully scoped UAE/Dubai/GCC opportunities; keep all demand/rank metrics unavailable without a measured source.
- [x] Record sampled competitor page observations across all 25 services and clearly label the remaining service-by-market evidence gaps.
- [x] Verify live sitemap routes, robots, canonical/hreflang, one H1 and JSON-LD on all 86 current production URLs (2026-10-24).
- [x] Review official Google/Bing/OpenAI/Anthropic/Meta guidance; xAI crawler guidance not verified. No crawler policy changes made.
- [x] Confirm no connected GSC, Google Ads Keyword Planner or Bing Webmaster integration; production GSC session remains configured=false. First-party metrics are unavailable.
- [x] Production enquiry endpoint rejects GET as expected; no live test was sent. Resend delivery remains unverified; secure Vercel environment setup remains owner action.
- [x] Complete full-service market matrices; add a protected SEO research dashboard view; run typecheck, production build, tests and the production crawl. No public-page edits were warranted by the available evidence.

## Findings Log

- Existing project reports include a 566-record EN/AR Saudi candidate database, 46-route EN/AR map, 149-row organic-growth dataset, 92-route historical audit, 86-URL 24 Oct production crawl, and prior 25-service priority map. Treat these as evidence with their own dates/methods, not as current rankings or demand.
- The owner's service priority order is fixed for editorial sequencing: Exhibition; Relocation; Customs; ATA Carnet; GCC Transportation; then the remaining services in the master brief. Priority is not a measured volume or profitability ranking.
- Latest verified integration commit is on GitHub main and has a READY Vercel production deployment. The public EN/AR Exhibition pages return 200; production Search Console session reports configured=false. Vercel environment variables were absent in the prior check.
- No authorized Search Console, GA4, Keyword Planner, Bing Webmaster or SEO-provider dataset has been supplied. Until confirmed, first-party clicks, impressions, CTR, positions, sessions and qualified leads remain unavailable.

## Conflicts & Open Questions

- Owner-supplied SAL competitor estimates have unspecified provider, date and market filters; never treat them as ENVOD data or measured current competitor outcomes.
- Current ZATCA service page (updated 2026-06-19), ZATCA's 2024 acceptance notice and ICC's country directory establish that Saudi Arabia participates in the ATA Carnet system and list the Federation of Saudi Chambers as the national association. SPA's specific issuer/guarantor wording is snippet-only; verify eligibility and any delegated issuer before giving shipment-specific advice. Do not repeat the older outside-the-scheme claim as current.
- Public provider pages and snippets describe marketing, not independent capability; UAE/GCC lanes, city office presence, licenses, assets and shipment acceptance require owner evidence.
- Live robots.txt explicitly allows search/retrieval agents and has a permissive catch-all, so GPTBot and ClaudeBot are not blocked. Meta's current docs identify Meta-WebIndexer for Meta AI search citations. Bing says IndexNow notifies but does not guarantee crawl/indexing. Official xAI crawler identity/rules and X rules remain unverified. Training-vs-search access is still an owner policy decision; no rule change was made.
- Current production sitemap has 86 URLs; all 86 returned 200 with exactly one canonical, at least two hreflang links, one H1 and valid JSON-LD in the current crawl.
- A private research tab was added to `/admin/search-console` for candidate keywords, competitor observations, regional markets and prioritized actions. Its `/api/search-console/research` endpoint requires the allowlisted administrator session and sends `Cache-Control: private, no-store`; an unauthenticated 401 test confirms no dataset is returned.
- Local verification passed: workspace typecheck; production client/SSR build and 86-route prerender; counter and image checks; service catalog (2), Search Console/security (10), enquiry (16), and Vercel enquiry-handler (7) tests. Vite still reports sourcemap and main-chunk-size warnings, but the build succeeds.
- Several public provider statements about routes, local offices, licensing and regulated services cannot establish ENVOD's own coverage. These require owner documentation.
- Search APIs may not provide reproducible country/device/language-specific Google SERPs; record observation conditions and limitations.
- Existing research has distinct audit dates (17–18 Oct and 24 Oct 2026); preserve dates when reusing claims and recheck volatile policies.

## Gaps

- Two targeted gap-fill passes completed: Saudi ATA system participation and national association verified; Meta AI WebIndexer and Bing IndexNow guidance verified; xAI identity/rules and Saudi ATA eligibility/delegate details remain unresolved.
- Actual GSC/GA4/Keyword Planner/Bing data requires the owner's secure integration/property access and is not replaced by public searches.
- The research dashboard's live Search Console view stays empty until its server-side configuration and authorized Google property are provided. It does not substitute the 566 candidate records for measured traffic or ranking data.
- Production email delivery and the private Search Console dashboard require owner-configured Vercel environment values (GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_ADMIN_EMAIL, GSC_REDIRECT_URI, GSC_TOKEN_ENCRYPTION_KEY, SESSION_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL, ENQUIRY_ALLOWED_ORIGINS); values were not accessed or committed.

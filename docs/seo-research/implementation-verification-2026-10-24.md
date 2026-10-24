# SEO intelligence implementation and verification

**Date:** 2026-10-24  
**Scope:** ENVOD KINGDOM public-site audit, bilingual service-market research, and the private administrator research dashboard.

## What changed

- Added an SEO Intelligence research tab to the existing `/admin/search-console` workspace, alongside its Search Console performance and site-audit views.
- Added keyword-candidate, competitor-evidence, market-coverage and prioritized-action views for the current 25-service sequence, with English/Arabic phrase selection, filtering, source links and CSV export.
- Added `GET /api/search-console/research`. The endpoint uses the existing allowlisted administrator-session check and `Cache-Control: private, no-store`. Research data is fetched only after the protected session is active; it is not included in the public client bundle.
- Preserved existing public routes and content. No additional public-page copy, location, capability, ranking, demand or credential claims were supported by this evidence review, so none were added.

## Evidence and limits

- The 25-service map distinguishes 25 directory offerings from 24 bilingual detail routes; Door-to-Door remains directory-only.
- The source project contains 566 English/Arabic Saudi keyword-candidate rows. They are candidate phrases, not search volume, rankings or proof of demand.
- The research register contains 52 unique source URLs. Competitor observations describe sampled public pages and are not rankings, market share, backlink counts or independent capability verification.
- The market map covers Saudi Arabia, Riyadh, Jeddah, Dammam/Eastern Province, UAE/Dubai, wider GCC markets and international corridors. ENVOD office presence, licensing, owned assets, gateway coverage and country-specific capability are not inferred.
- Production Search Console status returned `configured=false`; no authorized GSC, GA4, Keyword Planner, Bing Webmaster or SEO-provider data was available. Search performance and lead outcomes remain unavailable rather than estimated.
- Current crawler policy was documented without changing robots rules. Training-versus-search access remains an owner decision; official xAI crawler guidance was not verified.
- No live email was sent. Resend delivery and production environment configuration remain unverified.

## Checks completed

- `pnpm run typecheck` — passed.
- `pnpm --filter @workspace/envod-kingdom run build` — passed; client and SSR bundles built and 86 public routes were prerendered.
- Counter prerender check — passed.
- Image dimensions and alt-markup check — passed.
- Service-catalog tests — 2 passed.
- Search Console/security tests — 10 passed, including a new unauthenticated research-endpoint test: HTTP 401, private no-store response, no research payload.
- Enquiry tests — 16 passed.
- Vercel enquiry-handler tests — 7 passed.
- Total unit tests: 35 passed. Both additional prerender checks passed.
- Production audit baseline: all 86 sitemap URLs returned HTTP 200; each had one canonical, at least two hreflang links, one H1 and syntactically valid JSON-LD. This confirms crawl response and markup, not indexation.
- The research phrase was absent from the public browser bundle after the build.

## Administrator setup and verification boundary

The Search Console workspace and research endpoint require the existing secure Vercel-side setup. The variable **names** used by the project are:

- Search Console: `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_ADMIN_EMAIL`, `GSC_REDIRECT_URI`, `GSC_TOKEN_ENCRYPTION_KEY`, `SESSION_SECRET`
- Enquiry email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ENQUIRY_ALLOWED_ORIGINS`

No values were accessed or written to Git. The production Search Console connection is not configured, so real GSC metrics and an authenticated visual session could not be verified. No authentication bypass was added. The private endpoint’s access boundary was verified by automated tests.

Vite emitted sourcemap-location and large-main-chunk warnings during the successful build; these did not fail the build.

## Research files

- [Complete SEO Intelligence and Market Review](complete-seo-intelligence-and-market-review-2026-10-24.md)
- [Technical Search Visibility Audit](technical-search-visibility-audit-2026-10-24.md)
- [AI Search and Crawler Policy Audit](ai-search-crawler-policy-2026-10-24.md)
- [Service-market SEO matrix](service-market-seo-matrix-2026-10-24.csv)
- [Competitor-market observation matrix](competitor-market-observation-matrix-2026-10-24.csv)
- [Regional market opportunity map](regional-market-opportunity-map-2026-10-24.csv)
- [Research source register](research/sources.json)


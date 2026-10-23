# ENVOD KINGDOM — Production Parity Audit

**Audit date:** 2026-10-22

**Scope:** Read-only comparison of `envodkingdom.net`, the GitHub production source identified by the user, and the isolated Replit review copy.
**Release status:** Not approved for implementation or publication. No production code, settings, routes, sitemap, integrations, branches, or DNS were changed. No commits, submissions, merges, pushes, or deployments were made.

## A. Executive summary

The production site is **not route-parity aligned** with the local bilingual review build:

- All **43 current sitemap URLs** returned HTTP 200.
- All **46 candidate `/ar/` routes** and all **three English legal routes** returned a hard HTTP 404 from production. The response is the Vercel `404: NOT_FOUND` page, not a successful page or a soft-404 fallback.
- The production GitHub source at `iTszaLi/ekl2026` does not register or prerender the Arabic or legal paths. Its generated sitemap is based on its English-only `CONTENT_ROUTES` list. This is the confirmed source-level explanation for the 49 missing paths; it is not evidence of an indexing decision.
- The 92-route review build generates all 92 candidate HTML pages and has self-canonicals and reciprocal English/Arabic hreflang links. That is review-copy evidence only, not production availability or approval to publish every candidate.
- The user-provided Vercel deployment details identify commit `cf44867…`; a read-only GitHub check confirms that exact commit is still `iTszaLi/ekl2026`'s `main` head. Vercel account settings and the live deployment record were not independently accessible, so the exact deployed artifact and build settings remain unverified.
- The production sitemap's 43 `lastmod` values are all `2026-07-06`. The production source generates one build-date value for every URL, so the field does not represent per-page content changes.

**Priority:** First confirm the intended route set and policy copy with the owner, then verify Vercel's root/build/output configuration. Only after that should an approved source change be prepared. Preserve all 43 existing English URLs and their content.

## B. Evidence and results

Checks were performed on 2026-10-22 unless noted. The exact route-by-route results are in [production-parity-route-inventory.csv](production-parity-route-inventory.csv).

| Check | Actual result | Evidence source | Confidence |
|---|---|---|---|
| Production URL groups | 92 routes checked: 43 HTTP 200, 49 HTTP 404 | Direct GET requests to every path in the 43-entry production sitemap, 46 review-build `/ar/` candidates, and three legal paths | High for the checked date |
| 200-page behavior | 43 pages return HTML with page title, H1, and absolute self-canonical; no redirect observed | Rendered production HTML | High |
| 404-page behavior | 49 routes return HTTP 404, title `404: NOT_FOUND`, and “This page doesn’t exist”; no canonical or hreflang | Rendered production error HTML | High |
| Production language signals | Successful pages use `lang="en"`; no `dir` or HTML hreflang found. 404 pages also use English error markup and have no canonical | Production HTML crawl | High |
| Sitemap | HTTP 200, XML, 43 URLs, no Arabic entries or hreflang alternate markers; every `lastmod` is `2026-07-06` | Current `/sitemap.xml` response | High |
| Robots | HTTP 200; allows all paths and declares `https://www.envodkingdom.net/sitemap.xml` | Current `/robots.txt` response | High |
| Production source branch | `iTszaLi/ekl2026` `main` is `cf44867ccd040b7f865504d95c58136b4b639139`, dated 2026-07-06 | Read-only `git ls-remote` and GitHub commit API | High |
| Vercel deployment association | User-provided Vercel details show `main` at the same commit; current GitHub `main` still matches. The Vercel deployment/API/settings could not be independently queried | User-provided deployment snapshot plus GitHub verification | Medium; deployment association remains unverified |
| Review-copy routes | 92 candidate HTML outputs exist locally: 46 English, 46 Arabic. Review pages have three hreflang links with reciprocal targets in the local build | Existing local build and route metadata audit | High for the review copy only |
| Local Git state | Review copy is a different repository (`iTszaLi/envodkingdom`), at local `main` commit `ffe7077fd86ea952f74311ea703a14d190ecb399`, with uncommitted/untracked changes. Its public remote `main` exists at `fd4e40dc2355b3259b6ac5f83a72a82ca3a528aa`; the local `origin/main [gone]` label is due to a missing local tracking ref, not a deleted remote branch | Read-only `git status`, `git show`, and `git ls-remote` | High |
| Live legal links | Production footer contains Privacy Policy and Cookie Policy links to `#`; it does not link to the three legal paths. The production contact source has no privacy-policy URL reference. Review-copy footer links to all three candidate legal paths and the review contact form links to Privacy Policy | Live homepage/contact HTML and source comparison | High |
| Search indexing | No Search Console URL Inspection or indexing report was available. The earlier `AGENT_ERROR` is not an indexing result | Prior audit status; no current authorized Search Console access | Unverified |
| Bing / IndexNow | Account ownership and configuration could not be checked; no key was created and no URL was submitted | No authorized account access | Unverified |
| Performance | No reliable LCP/INP/CLS data was available. The prior PageSpeed request returned HTTP 429 because quota was zero | Previous PageSpeed attempt; no field-data access | Unverified |

## C. Route inventory and publication intent

The attached CSV contains **one row for each of the 92 requested paths**, including the full URL, language, page type, production status and final URL, production HTML metadata, sitemap membership, review-build output, hreflang targets, and whether approval is needed.

The groups are classified conservatively:

1. **43 existing English sitemap URLs:** confirmed active production URLs. Preserve each exact path and its existing content.
2. **46 Arabic URLs:** candidate equivalents in the review build. The prior language-strategy choice supports `/ar/` URLs, but this parity audit does not treat every route, translation, or slug as approved for publication. Confirm the final page list and Arabic content page by page.
3. **Three English legal paths:** `/privacy-policy`, `/terms-and-conditions`, and `/cookie-policy`. They exist in the review copy and return 404 in production. The exact legal copy and which policies should be published require legal-owner approval.

The inventory records that all 92 review-build paths have generated HTML and reciprocal hreflang targets locally. It does **not** imply that every page is intended for production.

## D. Confirmed root causes and unresolved questions

### Confirmed from the production source

- At commit `cf44867…`, `artifacts/envod-kingdom/src/App.tsx` registers English route patterns only; it does not register `/ar/` or the three legal pages.
- `artifacts/envod-kingdom/src/lib/seo-config.ts` defines the production `CONTENT_ROUTES` used for prerendering and sitemap generation. It covers the 43 English sitemap URLs and contains no Arabic or legal routes.
- `artifacts/envod-kingdom/prerender.mjs` generates route HTML and the sitemap from `CONTENT_ROUTES`. It explicitly describes Arabic as a client-side language toggle rather than a crawlable URL and emits no hreflang alternates.
- Therefore, the 46 Arabic 404s are explained by the production source/build not defining or emitting those routes. The three legal 404s are explained by the absence of production route registrations and legal pages in that source snapshot.
- The production homepage/footer currently uses `href="#"` for Privacy Policy and Cookie Policy. Those are nonfunctional placeholders, not links to the 404 paths. The live footer does not show a Terms link. Do not silently substitute candidate policy text.
- `prerender.mjs` sets `lastmod` with `new Date().toISOString().slice(0, 10)` once per build and applies that same date to every sitemap URL. This explains the uniform date but does not establish when each page’s content was last materially changed.
- The production repository includes `public/_redirects`, whose comments describe a Cloudflare Pages fallback. No `vercel.json` appears in the inspected commit tree. This file alone does not establish Vercel’s routing behavior.

### Unresolved

- Vercel project root directory, build command, output directory, rewrite settings, and the exact live deployment artifact were not available for independent inspection.
- The user-provided Vercel snapshot and current GitHub `main` agree on the commit SHA, and the live site's 43-route shape is consistent with that source. This is strong parity evidence, not an independently verified Vercel deployment record.
- Whether all 46 Arabic candidates and all three legal routes are intended for release is an owner/legal decision, not something the code or a 404 response can determine.
- No indexing status, crawler logs, Bing account setup, backlink status, or reliable field Core Web Vitals can be inferred from these HTTP checks.

## E. Source, build, and deployment comparison

| Area | Production source identified by the user | Replit review copy |
|---|---|---|
| Repository | `iTszaLi/ekl2026` | `iTszaLi/envodkingdom` |
| Branch and commit | `main`, `cf44867ccd040b7f865504d95c58136b4b639139` | Local `main`, `ffe7077fd86ea952f74311ea703a14d190ecb399`; its remote `main` is a different SHA |
| Route output | 43 English sitemap pages; no Arabic or legal routes | 92 candidate outputs, 46 English and 46 Arabic, including three English legal pages |
| Language signals | English HTML; no hreflang | English/Arabic HTML metadata and three reciprocal hreflang links per candidate page |
| Build | Workspace build runs typecheck and package builds; the artifact build runs Vite client/SSR builds and prerendering to `artifacts/envod-kingdom/dist/public` | Review copy has additional uncommitted code and generated documentation; it is not the Vercel source repository |
| Deployment configuration | Vercel snapshot supplied by the user; current project settings not accessible | Replit preview workflow is running; this does not establish Vercel configuration |

The GitHub commit displayed in the user's Vercel details matches the current public `main` commit. This audit did not fetch, pull, or alter either repository. The local `origin/main [gone]` state is explained by the absent local remote-tracking ref: read-only `ls-remote` still finds `iTszaLi/envodkingdom`'s `main`. No sync was performed.

## F. Minimum-risk correction plan — proposed only

No implementation is authorized by this audit. If separately approved:

1. **Lock the current English baseline.** Preserve all 43 production URLs and their content; use the route inventory as the pre-change snapshot.
2. **Confirm intended route scope.** Approve the exact Arabic page list, final slugs, translation quality, and language pairing. Do not publish all local routes by default.
3. **Resolve legal content first.** A legal owner should approve the actual privacy, terms, and cookie text and confirm which policy pages are required. Then connect footer/form links to those approved routes. Do not invent or silently replace legal language.
4. **Prepare additive source changes** in the production-equivalent source only after source alignment is confirmed. Likely files:
   - `artifacts/envod-kingdom/src/App.tsx` — register only approved routes.
   - `artifacts/envod-kingdom/src/lib/seo-config.ts` — approved route metadata, canonicals, and route list.
   - `artifacts/envod-kingdom/prerender.mjs` — emit approved static pages and sitemap entries; use verified per-page dates or omit `lastmod` when reliable dates are unavailable.
   - `artifacts/envod-kingdom/src/components/layout/MainLayout.tsx` and `src/pages/contact.tsx` — update policy links only after legal approval.
   - `artifacts/envod-kingdom/public/_redirects` or deployment-specific configuration — only if Vercel settings inspection proves a routing change is required. Confirm the Vercel root/build/output settings; do not assume the Cloudflare `_redirects` file is applied by Vercel.
5. **Choose one hreflang implementation.** The current review build uses HTML alternates. If approved, keep absolute self-canonicals and reciprocal `en-SA`/`ar-SA` (and `x-default` where appropriate) links for genuinely equivalent pages; avoid redundant HTML and sitemap implementations.
6. **Deploy only after a separate owner approval.** This report grants no deployment or production-change permission.

## G. Regression test plan

Before a future release, test against the approved route list:

- Build/typecheck and verify one generated HTML file per intended URL.
- Request every existing English URL and confirm status, final URL, page content, and unchanged path.
- Request every approved Arabic/legal URL and confirm the correct page—not a generic shell or error page.
- Validate absolute self-canonicals, `lang`, text direction, reciprocal hreflang targets, and absence of unintended `noindex`.
- Compare sitemap URLs with the approved canonical route set; confirm no 404, redirect, duplicate, or noncanonical URL is listed.
- Confirm robots.txt still permits intended crawling and points to the correct sitemap.
- Check footer, contact form, quote form, navigation, service pages, locations, and floating WhatsApp CTA.
- Run form unit tests for validation, spam/rate limiting, provider acceptance/failure, and retry behavior. Use mocks for routine tests; any live email requires separate authorization.
- Verify Vercel's configured source, branch, root, build command, and output directory before release.

## H. Post-release acceptance checklist

Only after an owner-approved deployment:

- Repeat the 92-route audit, limited to the routes actually approved for production.
- Confirm the original 43 English routes remain HTTP 200 and content/path parity is preserved.
- Confirm approved Arabic/legal routes return their intended HTML and reciprocal metadata.
- Re-fetch robots.txt and sitemap.xml; inspect each sitemap URL and lastmod policy.
- With authorized access, run Google Search Console URL Inspection and review Page Indexing; separately confirm Bing Webmaster ownership/configuration before any submission.
- Measure mobile and desktop LCP, INP, and CLS using reliable field/lab data.
- Check live forms and email delivery only under the approved test procedure.

## I. Access and tooling limits

- No Vercel account/API connection was available for independent verification of deployment details or project settings. The Vercel commit association is taken from the user's shared deployment information and cross-checked against GitHub `main`.
- No authorized Google Search Console or Bing Webmaster access was available. The earlier `AGENT_ERROR` is not proof of indexing or deindexing; no URL submissions were made.
- PageSpeed Insights previously returned HTTP 429 with zero quota; there are no reliable Core Web Vitals results in this audit.
- No production-code, configuration, branch, deployment, or provider data was changed. The report and route inventory are workspace documentation deliverables only.

**Stopped after the diagnostic report, as requested. Waiting for explicit approval before any code, route, legal-content, source, or deployment changes.**

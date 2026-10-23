# SEO/AEO/GEO validation results

**Validation date:** 22 October 2026  
**Target checked:** Isolated Replit review copy plus read-only checks of the public Vercel site.  
**Important:** Passing review-copy checks does not mean changes are live on `envodkingdom.net`.

## Automated checks

| Check | Result | Scope and limit |
|---|---|---|
| `pnpm run typecheck` | Passed | Workspace libraries, ENVOD artifact and scripts compiled without type errors. |
| `pnpm --filter @workspace/envod-kingdom run test:search-console` | Passed: 5/5 | Session security, encrypted refresh-token storage, validated metrics, safe provider failures and robots-aware crawl behavior. |
| `pnpm --filter @workspace/envod-kingdom run test:enquiries` | Passed: 16/16 | Contact and quote payloads, field validation, consent, honeypot, rate limit, recipient override prevention, provider failures, idempotency, service-specific details and exhibition details. Provider responses are mocked in these tests. |
| `pnpm --filter @workspace/envod-kingdom run build` | Passed | Client and SSR builds plus prerender completed: 93 HTML outputs including the private dashboard shell; 92 public sitemap routes. |
| Bilingual route audit | Passed for review copy | 92/92 public routes present; 46 English and 46 Arabic; unique titles/descriptions/canonicals; one H1 per route; three language alternates and valid targets. |
| Internal destination and fragment audit | Passed for review copy | No missing local route, static target or fragment detected in the 92-route crawl. |
| JSON-LD syntax | Passed for review copy | 510 blocks parsed as JSON; this does not validate schema semantics or Google rich-result eligibility. |
| Heading audit | Passed for review copy | No repeated H2 within a page, skipped heading levels or routes below the diagnostic 300-word count. Word count is a rough source-text estimate, not a content-quality or ranking test. |
| Animated statistics | Passed in source/prerender checks | Initial server-rendered copy shows stable values; count-up behavior and reduced-motion final-value handling remain in the component. |
| Service-card layout | Passed in source/build and screenshots | 24 catalog IDs plus Door-to-Door are included. The directory renders 23 cards because Exhibition and Customs have separate featured full-width cards. Those two featured cards precede the wide House Moving & Relocation card. Desktop and mobile screenshots show the exhibition and customs photos visibly; the relocation card spans the requested grid width. |
| Logo navigation | Passed in source inspection | ENVOD brand link targets `/` and invokes smooth scroll to the top. |

## Browser review

- Desktop preview: `/services`, 1440 × 1800. The exhibition and customs cards render as wide image-led panels with lighter overlays; text remains readable and the source images are visible.
- Mobile preview: `/services`, 402 × 2200. The hero, stats, exhibition panel and start of the customs panel fit the narrow layout without horizontal page overflow in the captured viewport. The page is scrollable; the screenshot ends partway through the customs card.
- Browser console output contained Vite connection and React DevTools informational messages only; no application error appeared in the captured logs.
- The full-page screenshot attempt exceeded the screenshot tool’s 8,000-pixel capture limit. This is not evidence that the web page itself failed.

## Live production checks

| Public check | Result |
|---|---|
| Sitemap-listed pages | 43/43 returned HTTP 200 on the October 22 recheck. |
| Expected Arabic routes | 46/46 returned HTTP 404. |
| English legal routes | 3/3 returned HTTP 404. |
| `robots.txt` and `/sitemap.xml` | Both returned HTTP 200; robots permits crawlers and declares the sitemap. The sitemap currently lists 43 URLs. |
| Structured data | Live crawl detected Organization, LocalBusiness, MovingCompany, WebSite, BreadcrumbList, Service, FAQPage and other types. |
| Response headers | HSTS present; CSP, X-Frame-Options, X-Content-Type-Options and Referrer-Policy absent on sampled homepage, customs, contact, robots and sitemap responses. |
| Image markup | 565 `<img>` elements across the 43 pages; no missing `alt` attribute, 70 explicit empty-alt occurrences across 35 unique sources, and all 565 elements lack explicit width/height. |
| Image assets | 84 unique live assets fetched; 21 exceed 100 KB. Natural dimensions and bytes are in `production-image-assets.csv`. |
| Homepage counters | Public HTML initializes animated counters at zero. The review copy uses a stable initial final value. |

All production checks were read-only. No public content, routes, headers, DNS, Search Console state, email delivery configuration or Vercel deployment was changed.

## Checks that remain unavailable

- **Google Search Console:** Not connected or authorized. No URL Inspection, indexing or performance results were fetched. The owner-reported baseline (about 139 clicks, 4.13K impressions, 3.4% CTR and average position 17.4 over roughly three months) is unverified.
- **Keyword Planner:** No actual metrics export was supplied. The 2,935-row matrix has no measured search volume or keyword difficulty. It contains candidate phrases only.
- **Bing Webmaster:** Not connected; no indexing or query report was read.
- **PageSpeed/Lighthouse/Core Web Vitals:** PageSpeed API returned HTTP 429 because the available project quota is zero. No LCP, INP, CLS or field data is claimed.
- **AI answer visibility:** No repeatable ChatGPT, Gemini, Claude, Perplexity, Copilot/Bing or Grok citation/rank checks were supplied or measured.
- **Backlinks:** No raw referring-domain export was available; candidate outreach is not a confirmed backlink.
- **Email in production:** The endpoint suite uses a mocked provider. No new email was sent in this audit, and the public Vercel frontend was not connected to the Replit endpoint. A prior owner-confirmed Resend test email is not a production integration check.
- **Accessibility:** Alt attributes and page semantics were inventoried. No full WCAG, screen-reader, keyboard or contrast audit was performed.

## Build warnings

The latest successful build reports non-blocking sourcemap-location warnings in shared tooltip/select components and a chunk-size warning. The main shared JavaScript chunk is 1,004.99 KB raw (308.35 KB gzip-estimated); the lazy browser-side Search Console dashboard chunk is 45.65 KB raw (13.05 KB gzip-estimated). These build sizes are not real-user performance measurements.

## Follow-up verification — 22 October 2026

- `typecheck`, `test:service-catalog` (2/2), `test:enquiries` (16/16), `test:search-console` (5/5), and the production build passed.
- The build prerendered 93 HTML outputs. The 92 sitemap-listed, indexable routes each have one H1 and unique title/description; every HTML output has exactly one robots directive. The admin route and SPA shell each have a single `noindex, nofollow` directive.
- All 510 JSON-LD blocks parsed. The new bilingual temporary-import FAQ and existing home FAQ answers are present in prerendered HTML, with no FAQ `hidden` attribute or opacity-zero answer wrapper.
- Public build output contains no preview-domain URLs or outdated CITC references. The service-directory order and catalog completeness test passed; the Door-to-Door card remains separate.
- Targeted desktop (1280 × 1200) and mobile (402 × 874) Services screenshots show the page and corrected mobile top spacing. Contact screenshot confirms the “Office Hours” label. Full-page capture of the very tall Services/Home pages exceeded the screenshot tool limit; this did not indicate an application failure.
- Browser logs contained only Vite and React DevTools informational messages. No live production routes, Vercel configuration, email delivery or external indexing were changed or tested.

## Current release status

**Do not treat this review copy as deployed or production-ready.** The critical release blockers are the 49 public 404 routes, source/hosting divergence, missing sampled security headers, absent measured performance data and unconnected production email/analytics. See `seo-remediation-report.md` for the ordered remediation plan and `seo-url-inventory.csv` for route-level evidence.

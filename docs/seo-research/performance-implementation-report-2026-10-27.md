# ENVOD KINGDOM — Performance and Saudi SEO implementation report

**Date:** 27 October 2026
**Candidate:** `review/pagespeed-seo-20261027`
**Deployment:** Isolated local checkout only. Nothing from this candidate was pushed or deployed.

## A. Measured causes

Three Lighthouse 13.5.0 mobile runs on the final local build identified the LCP element as the first hero heading, **“25+ YEARS OF LOGISTICS EXCELLENCE.”** It is text, not a video or image. It is present in the prerendered HTML, remains visible without JavaScript, and had inline `opacity: 1` in the trace. The mobile hero video was not requested; the existing 66.8 KB JPEG poster was requested instead. Desktop retains the animated video.

The last mobile trace reported:

- LCP: 5.57 s; first byte: 22.8 ms; LCP insight element-render delay: 1.24 s.
- The stylesheet (`index` CSS, 21.5 KB transferred) was the only reported render-blocking resource; estimated savings were about 150 ms. The Google Fonts stylesheet is now loaded asynchronously and was not reported as render-blocking.
- Across the final mobile sample, median main-thread work was 4.95 s. In the representative third run, 1.83 s was style/layout and 0.76 s was script evaluation. The page had 3,231 DOM elements; the largest DOM child group was the client-logo marquee.
- Twelve long tasks were observed in that representative run; the longest were attributed to document work (451 ms) and the main entry script (360 ms).
- Lighthouse reported 84 KiB of estimated unused JavaScript, including about 33.5 KiB in the scroll-engine chunk.

This trace does not show that the video is the LCP bottleneck. It also does not establish one single cause for the full LCP delay: the heading is visible in server-rendered HTML, while substantial style/layout and main-thread work remain.

## B. Implementation

- Load the Google Fonts stylesheet asynchronously, with a no-JavaScript stylesheet fallback.
- Defer the quote modal and its dependencies until the modal is opened; pointer/focus intent can prefetch it.
- Keep the smooth-scroll engine out of the static application entry and load it dynamically. On browser history restoration, restore native scroll immediately and import the engine only to synchronize Lenis/ScrollTrigger.
- Split D3/TopoJSON map geometry from the initial application entry. Keep localized static map previews and office details in the prerendered page; request the geometry only when the map approaches the viewport.
- Keep the initial English and Arabic hero copy visible in prerendered HTML. Keep decorative scroll videos unloaded on small mobile screens.
- Refine bilingual customs-clearance and ocean-freight content and metadata using the supplied Search Console evidence; retain the existing exhibition, GCC road-freight, and ATA Carnet routes and claim qualifications.
- Remove the unused TooltipProvider. This removed its source-map diagnostic without suppressing warnings globally.

## C. Performance results

The first two rows below are comparable local Lighthouse medians (three runs per viewport, Lighthouse 13.5.0, simulated network/CPU). The historical PageSpeed Insights row was supplied by the owner and is a different measurement environment; it is not a post-deployment retest.

| Measurement | Viewport | Score | FCP | LCP | TBT | CLS | Speed Index | Total network weight |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Local pre-change baseline | Mobile | 50 | 5.55 s | 6.54 s | 513 ms | 0.0000 | 5.73 s | 847 KiB |
| Final local candidate | Mobile | 62 | 4.47 s | 5.57 s | 301 ms | 0.0081 | 4.47 s | 705 KiB |
| Local pre-change baseline | Desktop | 88 | 1.34 s | 1.69 s | 65 ms | 0.0018 | 1.53 s | 2,838 KiB |
| Final local candidate | Desktop | 99 | 0.66 s | 0.79 s | 28 ms | 0.0075 | 0.93 s | 2,696 KiB |
| Owner-supplied historical PageSpeed Insights baseline (26 Oct) | Mobile | 61 | 4.7 s | 6.9 s | 170 ms | 0.000 | 5.5 s | 5,025 KiB |
| Owner-supplied historical PageSpeed Insights baseline (26 Oct) | Desktop | 87 | 1.0 s | 1.5 s | 150 ms | 0.001 | 1.9 s | 5,188 KiB |

The supplied PSI baseline also estimated 1,280 ms (mobile) and 520 ms (desktop) of render-blocking savings, 223/90 KiB of image savings, 99 KiB of unused JavaScript savings, 2.3 s of mobile main-thread work, and four/five long tasks. These are PSI estimates from the historical run, not guaranteed savings.

The local final mobile runs ranged from score 61–64, FCP 4.44–4.47 s, LCP 5.42–5.57 s, and TBT 252–354 ms. The final desktop runs ranged from score 96–99. Mobile remains well short of the requested 85+ score and 2.5 s LCP target. The local results must not be described as a production PageSpeed Insights result.

An intermediate candidate measurement before the final map split was faster for FCP/LCP (mobile median score 66, FCP 3.06 s, LCP 3.66 s), but had higher TBT (599 ms). The final three-run measurement did not reproduce that FCP/LCP result. The final build did reduce transferred bytes and TBT, but the FCP/LCP difference between these candidate snapshots is unresolved; use the final-run medians above, not the faster intermediate run, for decisions.

## D. Assets, bundles, and warnings

- The main JavaScript chunk decreased from 994 KB raw / 300.82 KB gzip before map extraction to 864.19 KB raw / 251.55 KB gzip after it.
- The 130.39 KB raw / 48.46 KB gzip map-geometry module is not requested on the initial viewport. The English and Arabic static preview images are about 26 KB each and have intrinsic dimensions.
- The scroll engine remains a separate 126 KB raw / 48.22 KB gzip chunk. The Vite scroll-engine static/dynamic warning is gone, but Lighthouse still estimates unused code in that chunk.
- The desktop page continues to use the animated hero video; the mobile run used the poster and did not request the video. The final local desktop page weight includes approximately 1.55 MB for the WebM hero video.
- The production build still reports an 864 KB raw main-chunk size warning. It was not hidden by raising the warning threshold. The `select.tsx` sourcemap-location diagnostic remains nonfatal; no corresponding browser runtime error was observed. No `.map` files were emitted in the built `dist`.

## E. Saudi-market SEO research and page actions

The detailed, dated English/Arabic research and citations are in `controlled-saudi-search-landscape.md`. The owner-provided six-month Search Console material reported 174 clicks, 4,610 impressions, 3.8% CTR, and average position 17.7. The separate Saudi country export reported 64 clicks, 1,539 impressions, 4.16% CTR, and average position 15.41; the supplied exports do not support joining those country figures to individual queries.

Selected query/page rows and resulting priorities:

| Existing page | Supplied query evidence | Safe improvement |
|---|---|---|
| Customs clearance | “customs clearance saudi arabia”: 104 impressions, position 43.14, zero clicks | Explain documents, goods, intended gateway, and authority-controlled release on the existing bilingual page. |
| Ocean freight | “shipping container to saudi arabia”: 78 impressions, position 41.69, zero clicks | Clarify container enquiries, origin/destination, FCL/LCL, cargo, and inland delivery; no invented rates. |
| Exhibition logistics | “exhibition shipments to saudi arabia”: 41 impressions, position 11.20, zero clicks | Retain one bilingual destination covering freight, customs documents, ATA Carnet enquiries, venue planning, and returns. |
| GCC transportation | Two separate query rows: 39 and 25 impressions, both zero clicks | Make road-freight scope, border documents, routes, and operator/equipment qualifications clear; do not imply passenger transport. |
| ATA Carnet | “ata carnet saudi arabia”: 29 impressions, position 11.72, zero clicks | Distinguish logistics coordination from authorized issuance and customs acceptance. |

On 27 October, Saudi-parameter Google Suggest checks and direct public-page checks were completed. Competitor content observations and source links include [SMI Logistics](https://www.smilogistics.com/fairs-exhibition-logistics), [OFL International](https://oflsa.com/customs-clearance), [Saad Logistics](https://www.saadlogistic.com/sea-freight-saudi-arabia), and [GCC Freights](https://gccfreights.com/services). Primary context includes [ZATCA’s ATA announcement](https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx) and the [ICC implementation announcement](https://iccwbo.org/news-publications/news/saudi-arabia-and-the-philippines-to-launch-ata-operations-in-2024).

The live web-search service returned HTTP 402 for fresh SERP research. The cited pages are qualitative content references, not verified rankings. No search volume, keyword difficulty, traffic, competitor position, backlink count, or AI Overview citation is claimed. Existing city intent is addressed on the relevant service pages; no duplicate city pages were created.

## F. Indexing status

- The local production build prerendered 94 routes. The existing sitemap/canonical/hreflang setup was preserved; no route was intentionally removed or set to `noindex`.
- Automated SEO route checks passed 3/3. Earlier public crawl evidence reported 94 sitemap URLs, 47 English and 47 Arabic; this candidate did not alter that route inventory.
- Search Console was reported configured but disconnected in the earlier audit. The 29-URL indexing issue remains unresolved because the complete affected URL list and Google-selected canonicals are unavailable. No indexing recovery is claimed.
- Live redirect check: `http://envodkingdom.net/` returned 308 to `https://envodkingdom.net/`, then 308 to `https://www.envodkingdom.net/` (200). A one-hop redirect likely needs Vercel/domain-level routing because the first HTTP-to-HTTPS hop occurs before the app route. No domain setting was changed; this is not established as the cause of the 29-URL issue.

## G. Regression, accessibility, and security checks

- Root typecheck and frontend production build passed; 94 routes prerendered.
- SEO route tests: 3/3. Counters: passed. Image dimensions/alt test: passed. Service catalog: 4/4. Search Console: 10/10. Enquiries: 16/16. Vercel enquiry handlers: 7/7.
- Browser verification passed for quote/contact validation and submission behavior (requests intercepted; no mail sent), customs and ATA fields, call/WhatsApp actions, language switching, mobile layouts, and history-scroll restoration. The map test confirmed localized previews, one deferred geometry load near the map, and 187 country paths/6 markers after hydration.
- Visual smoke checks at 1280×900 and 412×823 showed no horizontal overflow; the Arabic mobile page rendered RTL with its Arabic hero copy. Mobile Lighthouse accessibility scored 100.
- Live HTTPS responses include `Strict-Transport-Security: max-age=63072000`, CSP, Referrer-Policy, and `X-Content-Type-Options: nosniff`. HSTS is edge-managed; it does not include subdomains. No COOP or Trusted Types policy was added without an OAuth/embed compatibility test. The built output contains no source maps. The only raw HTML sinks found were static JSON-LD generated with `JSON.stringify`; React-rendered user text remains escaped.
- A real live network issue remains: `https://www.envodkingdom.net/_vercel/insights/script.js` returns 404. Local Lighthouse reported no runtime error, but the production analytics request is not healthy. It was not removed because doing so could silently discard conversion analytics; fix the Vercel Analytics configuration or approve removal separately.

## H. Branch and deployment

All changes are isolated on `review/pagespeed-seo-20261027`. No push, Vercel Preview, or production deployment was performed. The live production site was only checked with read-only HTTP requests.

## I. Ranked remaining work

1. Run PageSpeed Insights against the actual Vercel Preview after an authorized branch push; investigate if the final mobile LCP remains above target.
2. Reduce the 3,231-node homepage and 1.83 s style/layout workload with measured, section-specific work; avoid blanket `content-visibility` placeholders that could shift scroll positions or break the cinematic sections.
3. Resolve the live Vercel Analytics 404 without losing conversion measurement.
4. Obtain the complete Search Console affected-URL export and Google-selected canonicals before diagnosing the 29-URL indexing issue.
5. Ask the Vercel/domain administrator whether the apex can redirect directly to the canonical hostname; retest all HTTP/HTTPS and www/apex variants before changing it.
6. Revisit COOP/Trusted Types only after compatibility testing with the Google OAuth flow, maps, and current frontend dependencies.

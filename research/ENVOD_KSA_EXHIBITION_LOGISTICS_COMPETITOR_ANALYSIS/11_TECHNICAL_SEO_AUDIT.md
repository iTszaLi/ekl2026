# Technical SEO Audit — Production Snapshot

**Checked:** 8 November 2026 | **Method:** Read-only HTTP crawl of production sitemap URLs and a bounded set of internal links. This is not a Search Console index report or full asset/security audit.

## Crawl and URL controls — PASS in tested scope

| Check | Result | Evidence / limit |
|---|---|---|
| Sitemap availability | HTTP 200; 94 URLs | Current public sitemap; 47 EN / 47 AR |
| Sitemap URL status | 94/94 HTTP 200 | Point-in-time responses, not Google's selected canonicals |
| Metadata | 94/94 have title and description; no duplicates detected in the crawl | Does not assess copy quality or SERP rewriting |
| H1 | 94/94 have one H1 | Does not assess page content quality |
| Canonical | 94/94 self-canonical | Current HTML, not GSC-selected canonical |
| Robots meta | All tested pages index/follow | Current public HTML |
| Hreflang | 3 reciprocal entries in sitemap and HTML for each route | en-SA, ar-SA, x-default; x-default points to English version |
| Internal destinations | 145 unique same-domain destinations; all tested return 200 | Bounded anchors from crawled pages; not every external link or media asset |
| Host variants | HTTP/non-www root checks redirect to HTTPS www; final root returns 200 | Root checks only; test other path variants if present |
| robots.txt | HTTP 200; explicitly permits Googlebot, Bingbot and named AI/retrieval crawlers; declares sitemap | Allowing a bot is not proof it crawled/indexed the site |

Raw evidence: [production crawl CSV](production-crawl-2026-11-08.csv), [internal-link check CSV](internal-links-2026-11-08.csv), live [sitemap](https://www.envodkingdom.net/sitemap.xml), [robots.txt](https://www.envodkingdom.net/robots.txt). [R01](13_SOURCE_REGISTER.md#r01) [R02](13_SOURCE_REGISTER.md#r02)

## Structured data — review recommended, not a confirmed rich-result failure

- The crawler found structured-data types across routes, including Organization, LocalBusiness, WebSite, Service, BreadcrumbList, FAQPage and ItemList. JSON-LD syntax was parsed on the inspected pages; Google rich-result eligibility was not tested.
- Homepage inspection found two Organization nodes with the same @id (https://www.envodkingdom.net/#organization): one minimal node and one detailed node. Consolidate/coordinate schema emitters so one entity is represented consistently.
- The homepage also has a name-only ItemList with 12 entries titled as major Saudi/GCC exhibitions “served by” ENVOD. The page does not encode those as Event entities in the inspected sample. Confirm owner evidence for each company relationship before publishing/retaining the “served by” framing; the ItemList form alone does not validate the claim.
- FAQPage appears on many URLs. Retain markup only when it matches visible page content and applicable current Google policy. FAQ markup does not guarantee a rich result; Google’s FAQ rich-result appearance is restricted. [R28](13_SOURCE_REGISTER.md#r28) [R29](13_SOURCE_REGISTER.md#r29)

## Analytics-script endpoint

A direct request to https://www.envodkingdom.net/_vercel/insights/script.js returned HTTP 404 on 8 November. The root HTML inspected did not contain that literal script path, so this endpoint response alone does not prove the site currently loads a broken script or that visitors see a runtime error. The October PageSpeed report did record an Insights 404/MIME console issue; verify whether a deployed client bundle references it before changing analytics configuration. [R19](13_SOURCE_REGISTER.md#r19)

## Historical PageSpeed evidence (not a current retest)

The supplied 29 October 2026 mobile Lighthouse/PageSpeed report recorded Performance 67, Accessibility 100, Best Practices 96 and SEO 100; FCP 4.3 s, LCP 4.9 s, TBT 200 ms, CLS 0, Speed Index 5.0 s. Its LCP element was hero text, with a reported 2.24 s render delay. It also listed 3,155 DOM elements, 2.3 s main-thread work, 878 ms style/layout and six long tasks. These are a dated lab snapshot, not today's field CWV or a verified current score. [R19](13_SOURCE_REGISTER.md#r19)

## Not tested

Current Google indexing/selected canonicals, Google Rich Results Test, schema accuracy for all URLs, current CrUX field data, complete Lighthouse mobile/desktop runs, full image/video sizes and decoding, all external links, robots behavior for every crawler, JavaScript rendered-content parity, Bing Webmaster indexation, backlinks, sitemap submission state and real user conversion rates.

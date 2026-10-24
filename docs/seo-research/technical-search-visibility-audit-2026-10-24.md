# Technical Search Visibility Audit — ENVOD KINGDOM
**Observed:** 24 October 2026 | **Target:** public production site, www.envodkingdom.net

## Crawl results
- Production sitemap: 86 URLs checked; 86 returned HTTP 200.
- Canonicals: exactly one per URL in the audited HTML.
- Hreflang: at least two language/locale alternates per URL.
- Main heading: exactly one H1 per URL.
- Structured data: all JSON-LD blocks parsed as valid JSON; this is a syntax/data-presence check, not a full Rich Results eligibility assessment.
- No sitemap-route anomalies were observed in this point-in-time crawl.

## Robots, sitemap and indexation limits
The public robots file and sitemap were accessible. Explicit rules permit Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot and Claude-User; a permissive wildcard also applies. The policy does not prove crawling or indexing. Google’s robots meta documentation describes crawl/index directives; robots restrictions and noindex must be used with their distinct semantics. [1](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
Google indexation, ranking and coverage cannot be proven by fetching the public HTML. Search Console is not connected/configured. The private Search Console route is marked noindex,nofollow and the production session endpoint reports configured=false / authenticated=false.

## API and lead-path smoke checks
- GET /api/enquiries returns 405 with a method-specific response as expected.
- No live POST, customer submission, or email was sent; this avoids creating real records or messages during a research audit.
- Resend delivery is unverified; no first-party leads, qualified enquiries or conversion rates are reported.

## Not measured
No Lighthouse/PageSpeed, CrUX/Core Web Vitals, accessibility, mobile interaction, third-party tag audit, backlink inventory or live form POST was run in this pass. Do not infer performance or accessibility scores from HTTP success. These items belong in follow-up verification when safe access and data are available.

## Implementation decision
No production app code was changed in this research update. The 86-route check did not identify a confirmed crawl/metadata defect, while UAE/GCC operating claims and regulated service details require owner evidence. This avoids publishing speculative locality, licensing, timing, certification or service-capacity claims.

## Reproduction note
The check is a dated public crawl of URLs in the production sitemap. Re-run after code or route changes; it is not a continuous monitor and does not establish search-engine index state.

## Sources cited

1. **Google Search Central, “Robots Meta Tags Specifications** — [source](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) — Tier 1; fetched evidence; docs/seo-research/research/sources/CRAWLERS-01-google-robots-meta.md.

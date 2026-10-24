# ENVOD KINGDOM production SEO, AEO, GEO and Search Console readiness

**Audit date:** 2026-10-24  
**Site reviewed:** `https://www.envodkingdom.net`  
**Method:** read-only HTTP checks, sitemap/robots review, bounded site crawl, direct page review, and public competitor-page review. This is not a Google rank-tracking report.

## Executive summary

| Area | Verified finding | Interpretation |
|---|---|---|
| Public crawl | The sitemap returned 86 URLs. The bounded crawl fetched all 86 with HTTP 200. | No sitemap URL returned an HTTP failure in this crawl. This is a point-in-time check, not an uptime guarantee. |
| Page metadata | Crawled pages had a title, description, canonical, H1, language and corresponding English/Arabic alternate links. | Preserve bilingual prerendering and recheck these fields on future route changes. |
| Crawl resources | `/robots.txt`, `/sitemap.xml` and `/llms.txt` returned HTTP 200. | These are available to crawlers; this does not establish search visibility or AI citations. |
| Image accessibility | The crawler flagged 142 image tags without a non-empty `alt` value. | This is a review queue, not 142 confirmed defects. Some images may intentionally use `alt=""` because they are decorative; inspect each template before changing it. |
| Exhibition page | The live English page contains the exact phrase “leading exhibition logistics providers in KSA” in qualified wording and covers event cargo, international freight, customs documentation, ATA Carnet enquiries, venue delivery planning, and return or re-export shipments. | The phrase is framed as a comparison query, not a factual number-one or official-ranking claim. The Arabic version is present and should remain the localized counterpart. |
| Search Console admin | Before this implementation, `/admin/search-console` and `/api/search-console/session` both returned 404 on production. | A Vercel function, private persistent storage adapter, and non-indexable admin SPA route are being added; the live route must be checked after deployment. |
| Search Console access | The Vercel environment-variable listing exposed no project variable names at review time; Google OAuth and private Blob settings were not configured. | No live Search Console analytics, query impressions, clicks, positions, or URL Inspection results were available for this audit. |
| Enquiry delivery | No production `RESEND_API_KEY` was available in the reviewed Vercel environment listing, and no live email was sent. | Do not report contact-form email as production-verified until the owner configures the key and an authorized test message is received. |
| Keyword metrics | No connected Google Search Console or Google Ads Keyword Planner data source was available. | Search volume, keyword difficulty, ENVOD rank, competitor rank, and AI Overview/citation presence are all **Unavailable** in the accompanying candidate map. |

## Public-site crawl observations

The crawler followed the published sitemap and robots rules and stayed within ENVOD domains. At the time of the crawl:

- All 86 sitemap URLs returned HTTP 200.
- English/Arabic page pairing, page language, title, description, canonical, and H1 were present in the crawled output.
- The image-alt result requires manual/template-level review because empty alt text can be correct for decorative images.
- The crawl did not change site content, submit indexing requests, or use authenticated data.

The crawl is a technical snapshot only. It does not prove that Google has indexed every page, that pages rank for any particular query, or that the content is selected by an answer engine.

## Search evidence and competitive page review

The following pages were publicly readable on the audit date. The observations describe their published page copy; they are not an independent verification of the companies' operations, performance, rankings, or event appointments.

| Public source | Page-level observation | Implication for ENVOD content |
|---|---|---|
| [Four Winds — Exhibitions and Events](https://www.fourwinds-ksa.com/exhibitions-and-events) | Describes event/exhibition support, customs documents, temporary import/export, international air/sea freight, on-site project management, and packing/crating. Its page also states Saudi Arabia is not part of the ATA Carnet system. | Distinguish enquiries and coordination from issuer, guarantor, or authority roles. Verify current Saudi rules with authorized sources before explaining eligibility. |
| [SMI — Fairs & Exhibition Logistics](https://www.smilogistics.com/fairs-exhibition-logistics) | Structures content around pre-event planning, freight modes, temporary import/customs, on-site delivery to booths, return logistics, and venue coordination. | Keep ENVOD's explanation organized around the shipment timeline and state that venue access and handling depend on event/organizer requirements. |
| [Khelogix — Exhibition & Event Logistics](https://khelogix.com/service/exhibition-event-logistics/) | Describes Saudi/UAE trade-show cargo, customs and temporary-import paperwork, venue-floor delivery, and post-event return/re-export. | Event cargo lifecycle language is established in the market; ENVOD can differentiate using its own verified process details, not copied competitor claims. |
| [SAL — Logistics](https://sal.sa/sal-logistics) | Publishes a broad integrated logistics overview, including customs and specialized cargo. | Do not imply that ENVOD operates SAL's airport facilities, network, or infrastructure. |
| [ENVOD — Exhibition & Event Logistics](https://www.envodkingdom.net/services/exhibition-logistics) | Live page describes freight planning, customs-document coordination, eligibility-dependent ATA Carnet/temporary-import review, venue-delivery planning, and return/re-export coordination. | The page is aligned to the event shipment journey; retain its qualified wording and internal quote/WhatsApp links. |

### AEO/GEO content guidance

For answer-oriented search, provide direct, factual answers on the existing exhibition page rather than adding repeated keyword variants. The current page already explains the scope and caveats. Future answers should remain conditional where eligibility or third-party venue permissions apply:

1. What does exhibition logistics in Saudi Arabia cover?
2. What freight and customs documents should an exhibitor prepare?
3. What can ENVOD coordinate for ATA Carnet enquiries, and what depends on the authorized issuer or Saudi authorities?
4. How is delivery to an exhibition venue or stand planned?
5. How can post-event return freight or re-export be arranged?
6. Which event-specific details are needed for a quote?

Use dated, owner-approved evidence for all operational claims. Do not present examples of events, a competitor's event appointment, AI-generated summaries, or public search snippets as proof of ENVOD participation or official status. Do not invent premises or city offices to target local searches.

## Candidate-query methodology

`priority-keyword-candidates-2026-10-24.csv` is a working content map, not a performance report:

- Candidate queries are based on the current service catalog, live page terminology, and publicly observed competitor topic coverage.
- English/Arabic pairs are research candidates; a native Arabic search review is needed before using them as exact-match targets.
- Priority means **editorial fit and business relevance**, not estimated search demand.
- Monthly volume, difficulty, ENVOD rank, competitor rank, and AI answer visibility are explicitly `Unavailable`.
- Do not copy estimates from the existing SAL competitor benchmark into ENVOD metrics. That supplied dataset has unspecified tool, report date, market filters, and device.
- Replace unavailable fields only after collecting dated Saudi-specific Search Console or Google Ads Keyword Planner evidence. Record language, country, device, property, query/page dimensions, and date range.

Google Ads documents that Keyword Planner provides search estimates through an authorized account: [Discover new keywords and get search volume forecasts](https://support.google.com/google-ads/answer/7337243?hl=en). No Keyword Planner account data was available in this review.

## Production-readiness blockers and owner actions

1. **Complete Vercel Search Console setup:** attach a private Blob store and configure the OAuth client, exact administrator email, `SESSION_SECRET`, separate `GSC_TOKEN_ENCRYPTION_KEY`, callback URI, and Blob token. Follow `artifacts/envod-kingdom/docs/search-console-dashboard-setup.md`.
2. **Connect Search Console:** authorize the account that can access the exact ENVOD property; verify dashboard responses and URL Inspection against live Google data.
3. **Verify enquiry delivery:** add `RESEND_API_KEY` securely to Vercel and conduct an authorized test from the production form to an owner-approved recipient. Confirm receipt; a successful API response alone is not proof of delivery.
4. **Review the image-alt queue:** separate decorative images from informative images, then add concise, accurate alt text only where useful.
5. **Collect real query evidence:** export Saudi-filtered English and Arabic Search Console query/page data after OAuth is connected. Use Keyword Planner only with documented account, country, language, and date settings.
6. **Validate event and ATA Carnet claims:** confirm current regulations, provider/organizer responsibilities, and operational coverage before publishing stronger claims or processing promises.
7. **Recheck the production admin route after release:** it should serve the non-indexable page shell, return a safe unconfigured session until owner settings exist, and reject cross-origin state changes.

## Source register

All public site/competitor pages below were reviewed on 2026-10-24:

- `https://www.envodkingdom.net/robots.txt`
- `https://www.envodkingdom.net/sitemap.xml`
- `https://www.envodkingdom.net/llms.txt`
- `https://www.envodkingdom.net/services/exhibition-logistics`
- `https://www.envodkingdom.net/ar/services/exhibition-logistics`
- `https://www.fourwinds-ksa.com/exhibitions-and-events`
- `https://www.smilogistics.com/fairs-exhibition-logistics`
- `https://khelogix.com/service/exhibition-event-logistics/`
- `https://sal.sa/sal-logistics`
- `https://developers.google.com/identity/protocols/oauth2#expiration`
- `https://developers.google.com/webmaster-tools/v1/how-tos/authorizing`
- `https://developers.google.com/webmaster-tools/v1/searchanalytics/query`
- `https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect`
- `https://support.google.com/google-ads/answer/7337243?hl=en`
- `https://vercel.com/docs/vercel-blob/private-storage`
- `https://vercel.com/docs/vercel-blob/using-blob-sdk`
- `https://vercel.com/docs/functions/configuring-functions/duration`


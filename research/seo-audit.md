# ENVOD KINGDOM SEO / AEO / GEO audit and implementation report

**Audit date:** 17 October 2026  
**Scope:** Current public website and workspace source, Saudi English/Arabic search intent, selected competitor pages, technical SEO, content accuracy, AEO/GEO and lead-generation readiness.  
**Status:** Local implementation and verification complete; production synchronization is blocked pending confirmation of the correct deployment repository.

## Executive summary

The current workspace is materially newer than the public website checked on 17 October 2026. The live sitemap lists 43 URLs, while the workspace build produces 92 English and Arabic routes. Several Arabic service and legal URLs present in the workspace return 404 on the public site. The local build has working canonical and reciprocal language-alternate markup, but those fixes will not reach customers until the owner confirms the correct deployment repository and release path.

Search and competitor research was limited by noisy public results and unavailable account data. No search volumes, rankings, traffic, backlink quality, or AI citation counts are claimed. DSV is the only directly verified Saudi competitor in the reviewed sample. The most useful confirmed changes were accuracy and crawlability fixes: shorten overlong metadata, stop emitting a false build-date `lastmod`, remove unsupported fixed-time promises, clarify the ATA Carnet issuer's role, and replace unverified numeric trust counters with service descriptions.

No changes were pushed or published. No links were purchased or outreach sent. Forms and email delivery were not changed in this SEO pass.

## What was audited

- Public homepage, robots file, sitemap, selected English service pages, and Arabic/legal routes.
- Current prerendered workspace output and source metadata, language alternates, canonical tags, JSON-LD, H1s, alt attributes, route coverage, and sitemap generation.
- Eight English/Arabic query angles for customs, freight forwarding, ocean freight, GCC road transport, warehousing, exhibition logistics and ATA Carnet.
- ZATCA import instructions and customs-journey guidance; the TGA regulations index; ICC global ATA Carnet guidance.
- DSV Saudi Arabia and selected sea, customs, road and project logistics pages; a Maersk ocean-transport landing page.
- Google localized-page, AI-feature and sitemap guidance; OpenAI crawler documentation.

## Baseline findings

### Public site vs. workspace

The public `www` homepage, robots file, and sitemap returned HTTP 200. The public sitemap contained 43 URLs, all with `lastmod` `2026-07-06`; all 43 listed URLs returned HTTP 200 in the baseline HEAD crawl. A HEAD response does not establish rendered page quality or Google indexing.

The live site returned 404 for `/ar`, `/ar/privacy-policy`, `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`, and the sampled Arabic customs, exhibition and ATA service routes. Those routes exist in the current workspace. The public ATA Carnet title also contained “Typically Within 24 Hours”; this was not supported by the research and has been removed from the workspace source, but the public page remains unchanged until deployment is resolved. [@live-site]

The current workspace prerenders 92 routes (46 English, 46 Arabic). The inspected output has canonical URLs, one H1 per route, reciprocal `en-SA` / `ar-SA` / `x-default` alternates, valid JSON-LD, unique titles, and no image missing an `alt` attribute in the generated HTML. These are markup checks, not proof of indexing or ranking.

### Metadata and sitemap fixes

- Shortened selected English titles/descriptions and Arabic industry metadata; industry descriptions now use concise SEO summaries instead of entire page overviews.
- Removed duplicated `لوجستيات` from affected Arabic industry titles.
- Shortened selected service, contact, about, gallery and industries metadata while preserving page URLs and body copy.
- Removed the generated build date as sitemap `lastmod`. Google says `lastmod` should represent a verifiable significant page update; it ignores `priority` and `changefreq`. [@google-sitemap]

## Saudi search and competitor research

The query set covered:

- `customs clearance Riyadh`, `customs broker Jeddah`, `customs clearance Dammam`
- `sea freight Saudi Arabia quote`, `Saudi freight forwarder`
- `GCC road freight`, `warehousing Saudi Arabia`
- `exhibition freight Saudi Arabia`, `ATA Carnet Saudi Arabia`
- Arabic hypotheses including `تخليص جمركي الرياض`, `تخليص جمركي جدة`, `تخليص جمركي الدمام`, `شحن بحري السعودية`, `نقل بري الخليج`, `مستودعات لوجستية`, `شحن معارض`, and `طلب عرض سعر`

These are phrases to validate with owner Search Console data, a Saudi-located search capture, or a permitted keyword tool—not measured demand. Bing results in this environment were substantially irrelevant for both English and Arabic. The integrated search service returned HTTP 402 and was not retried or enabled for paid access. Accordingly, this audit reports no search volume, ranking, share-of-voice, organic traffic or competitor SERP position. [@bing-serp]

### Keyword-to-page map (hypotheses; no volume data)

| Existing route family | English topic phrases to validate | Arabic topic phrases to validate |
|---|---|---|
| `/services/customs-clearance` | customs clearance Riyadh; customs broker Jeddah; customs clearance Dammam | تخليص جمركي الرياض؛ تخليص جمركي جدة؛ تخليص جمركي الدمام |
| `/services/exhibition-logistics` | exhibition logistics Saudi Arabia; exhibition freight; event cargo Saudi Arabia | لوجستيات المعارض السعودية؛ شحن المعارض؛ شحن الفعاليات |
| `/services/ata-carnet` | ATA Carnet Saudi Arabia; temporary import for exhibitions | كارنيه ATA السعودية؛ الاستيراد المؤقت للمعارض |
| `/services/freight-forwarding` | freight forwarder Saudi Arabia; international freight forwarding | وكيل شحن السعودية؛ خدمات الشحن الدولي |
| `/services/ocean-freight` | ocean freight Saudi Arabia; sea freight Jeddah/Dammam; FCL/LCL quote | شحن بحري السعودية؛ شحن بحري جدة/الدمام؛ شحن حاويات |
| `/services/gcc-transportation` | GCC road freight; Saudi GCC transportation | نقل بري الخليج؛ النقل بين السعودية ودول الخليج |

These phrases express the requested service/city intent and map to existing route families; they are not measured keywords or a recommendation to create duplicate URLs. Review wording with native Arabic speakers and compare against Search Console before expanding copy.

DSV was the only directly verified Saudi competitor in the sample. Its Saudi page links to air, road, sea and project logistics and offers a contact action. Its sea page describes FCL, LCL and other cargo arrangements; its customs and project pages explain documentation, regulatory and complex cargo topics. These are observations of DSV's own marketing, not independent validation. A small noisy sample cannot establish a market-wide content gap. [@dsv-sa] [@dsv-sea] [@dsv-customs] [@dsv-project] [@dsv-road]

### Exhibition calendar leads

The Saudi government events schedule at SCEGA is a relevant source to monitor, but event records were not present in the static capture. Riyadh Exhibitions Company’s own calendar listed Saudi Agriculture for 19–22 October 2026 and Saudi Build / Saudi Elenex for 2–5 November 2026 on the 17 October snapshot. The listing did not establish venues; verify dates and venue with the organizer before planning outreach or publishing event logistics content. These are calendar leads only and do not imply ENVOD participation. [@scega-calendar] [@rec-calendar]

## Factual service guidance applied

- ZATCA's general import instructions identify a commercial invoice and bill of lading, and a conditional certificate of origin, while directing users to check product-specific requirements. Its 48-hour document/declaration guidance is a preparation rule, not a customs-release estimate. The Arabic page wording differed in the captured version, so no hard-coded 48-hour statement was added to the public-facing FAQ. [@zatca-import]
- ZATCA describes customs-broker work as delegated customs-procedure handling; it does not remove the importer's document obligations. The updated FAQ avoids claiming ENVOD employs licensed brokers or assumes every importer duty. [@zatca-journey]
- The ICC global page supports general ATA terminology. A separate ICC launch notice and Saudi Press Agency report identify the Federation of Saudi Chambers (FSC) as Saudi Arabia's national guaranteeing and issuing association, with Saudi customs acceptance effective 1 June 2024 for eligible Annex B1 exhibition, fair, meeting and similar-event goods. This does not confirm an individual shipment's eligibility, current application requirements, fees, processing time, or customs release. [@icc-ata] [@icc-saudi-ata] [@spa-fsc]
- Mawani port pages returned HTTP 405 in this audit; Riyadh Dry Port details were not verified from an accessible official source. The TGA page exposed an index rather than individual current road rules. No port capacity, terminal, operating-hour, routing, or GCC permit claims were added. [@tga-index]

## Implemented content and AEO/GEO changes

- Removed 24-hour customs/Carnet and other unsupported fixed turnaround statements from the editable source. A source search found no remaining 24-hour turnaround wording.
- Rewrote the customs FAQ in English and Arabic around shipment-specific timing, conditional documentation and approvals; removed a fixed 2–5-day claim and an unsupported licensed-broker claim.
- Clarified FSC's issuing/guaranteeing role and the documented Saudi event-goods scope; states that ENVOD coordinates shipment information and documentation but does not issue or guarantee a Carnet. Removed a 1–3-business-day promise and unverified direct-issuance/guarantee language.
- Replaced the asserted online live-tracking portal with accurate status-enquiry wording; shipment updates depend on carrier and other party information.
- Replaced homepage/exhibition numerical trust counters with service-area labels while preserving the existing section layouts.
- Replaced the homepage's unverified performance counters with a shipment-planning checklist, retaining the same six-card visual structure.
- Kept existing English URLs, bilingual alternates, forms, email-delivery code and floating WhatsApp CTA unchanged.

Google recommends discoverable crawlable text, internal links, accurate structured data and appropriate localized-page annotations, but says there are no special AI-only markup requirements and no guarantee of crawling, indexing or serving. OpenAI documents separate controls for OAI-SearchBot and GPTBot; allowing search crawling does not guarantee citation frequency. No `llms.txt` or schema was added as a claimed citation shortcut. [@google-localized] [@google-ai] [@openai-bots]

A 31-question English/Arabic visibility checklist is saved in `research/ai-visibility-checklist.md`. It is a monitoring template only; no AI provider was queried for ENVOD visibility.

## Backlinks, authority and owner-provided metrics

The owner-provided SerpOK snapshot reported DR 0, UR 0, 388 backlinks, 382 referring domains, 0 organic keywords, 0 organic traffic and zero AI citations in the named tools. These values were not independently queried; they do not establish link quality, link spam, current rankings or the need for a disavow. No backlink outreach, directory submission or purchase was performed. [@serpok-owner-snapshot]

Legitimate next steps are to publish evidence-backed customer or event case studies with permission; request a link only where ENVOD has a real membership, supplier, exhibitor or partner relationship; and complete accurate business profiles on platforms the company actually qualifies for. Do not use paid link schemes, fabricated event logos, fake premises, or unearned directory credentials.

## Lead generation and analytics

The existing contact and quote forms, server-side email delivery, recipient and WhatsApp CTA were not changed. The forms already emit start, success and failure events plus phone, email and WhatsApp/CTA clicks; the previous helper only queued these in `dataLayer`, with no analytics provider connected. The helper now calls Replit's injected Umami tracker and sends only page path, language, service category and CTA location—never enquiry content or contact details. Analytics must be enabled in Publishing settings and the correct app republished before events will be collected. No customer email was sent in this pass.

| Outcome | Event names |
|---|---|
| Contact form | `contact_form_start`, `contact_form_submit_success`, `contact_form_submit_failure` |
| Quote modal | `quote_form_start`, `quote_form_submit_success`, `quote_form_submit_failure` |
| Contact actions | `call_click`, `email_click`, `whatsapp_click`, `service_cta_click` |

Search Console, Business Profile and historical analytics were not available, so actual conversion rates, source attribution, organic lead quality and Core Web Vitals were not measured. Failed submissions are tracked separately from successful submissions; only provider-accepted outcomes count as form success.

## Verification

- `pnpm run typecheck`: passed after the final source edits.
- `pnpm --filter @workspace/envod-kingdom run build`: passed after the final source edits; emitted 92 routes and a sitemap.
- Build emitted existing sourcemap-location warnings for tooltip/select UI files and a large JavaScript chunk warning; these did not fail the build.
- `pnpm --filter @workspace/envod-kingdom run test:enquiries`: 14 tests passed, 0 failed.
- The final route audit found 92 prerendered HTML pages and 92 sitemap entries (46 English, 46 Arabic), no `lastmod`, missing canonical/hreflang, missing H1, `noindex`, or invalid JSON-LD.
- Local desktop homepage and exhibition-page previews and a tall mobile Arabic customs preview loaded; browser console showed only normal Vite/React development messages.
- Final metadata check found one title over 65 characters (`/services/oog-cargo`, 68 characters) and 16 descriptions over 160 characters. The 160-character comparison is a review heuristic, not a Google ranking rule; remaining descriptions are candidates for selective editing.

## Deployment blocker and required owner actions

Read-only GitHub API verification on 17 October 2026 confirmed the requested repository is `iTszaLi/ekl2026`, with default branch `main` at `cf44867ccd040b7f865504d95c58136b4b639139`, matching the supplied Vercel snapshot. GitHub reports a successful `Vercel` status and a Production deployment record for that SHA (created 6 July 2026). The branch is not protected. No Vercel integration was connected, so project settings, environment variables, and preview deployment configuration could not be inspected.

This Replit workspace is not checked out from that target: its local `origin` is `iTszaLi/envodkingdom`, local `main` is `ccfdcd19f1a49b6374b4ccda9a49638a2b452b18`, and its local origin branch is marked gone. The configured remote's current `main` is `fd4e40dc2355b3259b6ac5f83a72a82ca3a528aa`. The current worktree has many uncommitted and untracked changes. A comparison with the target's `main` tree found 30 differing tracked files and 13 local-only paths; the changes have not been applied to the target repository.

The workspace enquiry backend is an Express server that sends through `@replit/connectors-sdk`; the target GitHub tree contains no server or API files and no committed Vercel project configuration. That Replit connection cannot be assumed to exist in Vercel. A Vercel-native serverless endpoint and a server-side `RESEND_API_KEY` configured directly in Vercel would be needed for Vercel email delivery; neither has been implemented or verified in the target project. No remote, branch, commit, or deployment was changed.

Before production sync, prepare and review a feature branch based on the verified target `main`, port only the approved changes, and run checks against that codebase. The existing Vercel status check confirms a production integration on `main`, but preview-branch behavior and Vercel settings still require verification. Until a preview is verified, do not push changes to production `main`. The public site still has the observed missing Arabic/legal routes and stale metadata.

### Outstanding verification

1. Confirm correct GitHub repository/branch and Vercel or Cloudflare target.
2. Provide Search Console/analytics and Business Profile access or export data; obtain a Saudi-localized English/Arabic SERP sample and a native Arabic copy review.
3. Verify actual company claims still in service pages (such as GPS fleet, warehouse/CCTV, cold-chain monitoring, nationwide exhibition service, on-site teams, venue knowledge, and quote response scope) with owner documentation before relying on them in marketing.
4. Obtain official current port details and specific TGA/GCC road rules before adding port operations or corridor claims.
5. Broaden direct competitor research once a reliable Saudi-localized search source is available.

## 30-day action plan

**Days 1–7:** Confirm deployment target; publish only after reviewing the correct source tree; connect Search Console and analytics; submit the current sitemap and monitor the missing Arabic/legal routes.  
**Days 8–14:** Review Search Console queries and landing pages by language/city; ask a native Arabic reviewer to validate service terminology and CTA wording; verify business capabilities and credentials.  
**Days 15–21:** Build only substantiated city/service pages (Riyadh, Jeddah, Dammam) with useful port/process guidance, quote inputs and internal links; validate each location and service claim with operations.  
**Days 22–30:** Publish permission-based case studies or partner references; monitor impressions, clicks, qualified enquiries and successful form submissions. Compare before/after periods; do not claim ranking or AI-visibility gains without measurements.

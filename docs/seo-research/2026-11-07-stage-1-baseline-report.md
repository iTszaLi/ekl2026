# ENVOD KINGDOM — Stage 1 baseline report (SEO, AEO, GEO)

**Date:** 2026-11-07  **Branch:** `claude/seo-dashboard`  **Site:** https://www.envodkingdom.net
**Scope:** Stage 1 of the master SEO/AEO/GEO project. That covers the baseline, the audit of all 94 routes, competitor verification and keyword mapping for the seven priority services.
**No site content, metadata, config or design was changed for this report.** Every proposed change below waits for the owner's approval.

## How to read the numbers

Every figure is labelled with one of four kinds of data. They are never mixed.

| Label | Meaning | Source used here |
|---|---|---|
| **Measured rank** | A real Google results page retrieved for ENVOD | DataForSEO SERP live, Google Saudi Arabia, desktop, depth 50, 2026-11-06 (23 keywords) |
| **Estimated volume / difficulty** | Third-party keyword-tool estimates | Existing repo research only; mostly `Unavailable` (539 of 566 rows) |
| **Search Console data** | Google's own impressions and clicks | **Not available.** Search Console is not yet connected |
| **Lab performance** | Synthetic page-load test | Local Chrome Lighthouse/trace, throttled (Slow 4G, 4× CPU). The PageSpeed Insights API was unavailable (shared daily quota exhausted). No CrUX field data exists for the site |

Nothing in this report is a traffic figure. Traffic cannot be measured until Search Console and analytics both work (see §2.4).

---

## 1. Executive summary

1. **The site is technically clean, but Google is barely indexing it.**
   - All 94 routes are prerendered, self-canonical, in the sitemap, carry reciprocal hreflang, have one H1 each, and have unique titles and descriptions.
   - Even so, ENVOD was **not found in the readable top-50 results for any of 22 measured keywords**, including its own brand name.
   - A `site:` check shows about 10 indexed URLs, and the homepage is not one of them.
   - **Indexing is the first bottleneck, ahead of content or links.** The domain was registered on 2026-06-02.
2. **The conversion-tracking code is in place but is not collecting anything.**
   - `/_vercel/insights/script.js` returns **404** on production, so Vercel Web Analytics is not enabled for the project.
   - Vercel's docs say custom events (`track()`) need the **Pro** plan.
   - Until both are fixed, there is no verified enquiry or click data.
3. **The real competitors are not the ones assumed.**
   - In measured Saudi results, the businesses ranking are specialist customs brokers (issc.sa, 1accc.com, fares-cc.com, alghaiths.com, kdl.com.sa) and movers (fourwinds-ksa.com, kimww.com, aplusksa.com, aljawad.sa.com). Directories also rank (bluepages, clutch, freightnet).
   - Of the nine names in the brief, only **Four Winds** appears in the measured results (10 of 23 keywords).
   - BCC, Maxon and Falcon could not be identified. Aegis, Glaube and Expat Logistics exist but do not rank for these keywords.
   - Luxe Events is an events company, not a freight competitor.
4. **The pages themselves are strong. Gaps are in linking, metadata hygiene, and hero performance on mobile.**
   - Priority pages carry 610–3,158 words, 9–19 H2s and FAQ schema in both languages.
   - The relocation page (Priority 3) gets internal links from only 6 pages, against 47 for every other priority service.
   - Mobile lab LCP is 3.0–4.4 s.
5. **Budget:**
   - DataForSEO balance is **$0.758** (free check, 2026-11-07).
   - This month's spend is $0.242 of the $5 self-imposed cap.
   - The proposed paid research in §6 costs about **$0.20** and needs your approval.

---

## 2. Technical baseline

### 2.1 Route audit: all 94 prerendered routes (47 EN + 47 AR)

Full data: `2026-11-07-route-audit.csv`.

| Check | Result |
|---|---|
| Canonical = self on every route | ✅ 94/94 |
| In `sitemap.xml` | ✅ 94/94 |
| `noindex` | ✅ none |
| hreflang en/ar/x-default reciprocity | ✅ no errors |
| Exactly one H1 | ✅ 94/94 |
| Duplicate titles / descriptions / H1s | ✅ none |
| Titles under 30 characters | ⚠️ `/cookie-notice`, `/terms-and-conditions` (legal pages; low priority) |
| Descriptions over 165 characters | ⚠️ `/gallery`, `/services/cross-trade-shipping`, `/services/customs-clearance` (186), `/services/medical-pharma`, `/services/ocean-freight` (203), `/services/pet-animal-import`, `/services/project-cargo` (167). Google truncates these; trimming is a metadata change, so it needs approval |
| Thin pages (under 300 words of main content) | Legal pages, contact, track and industries (expected), plus `/services/door-to-door` (200), `/services/express-courier` (287), `/services/supply-chain` (278), `/ar/services/white-glove-logistics` (292) and `/ar/services/pet-animal-import` (288) |
| Images without alt | Only decorative hero images with `alt=""` (correct) |
| Trailing-slash variants (`/ar/`, `/services/`) | Return 200 with the correct canonical, so no duplicate-content risk. Arabic pages link home as `/ar/` rather than the canonical `/ar` (minor) |

**Internal linking gaps** (number of prerendered pages linking to the route):

| Route | Incoming pages | Note |
|---|---|---|
| Exhibition, customs, project cargo, GCC, warehousing, ATA Carnet (EN + AR) | 47 each | Linked from the main navigation |
| **`/services/relocation` and `/ar/services/relocation`** | **6** | Priority 3 service, missing from the site-wide link set |
| pet-animal-import, vision-2030 | 1 | |
| door-to-door, food-fmcg, medical-pharma, roro-shipping | 2 | |
| ecommerce-logistics | 3 | |
| dangerous-goods, supply-chain | 4 | |

**Language switch is not crawlable.**
- The EN/AR toggle in `src/components/layout/MainLayout.tsx` (lines 118, 161) is a `<button onClick>`, not an `<a href>`.
- hreflang tags already tell Google about each counterpart page, so this is not an indexing blocker.
- A crawlable link to the counterpart route would still give every Arabic page a direct link from its English twin, and the reverse.
- This changes a functional element, so it needs approval.

### 2.2 Lab performance (mobile, local Chrome, Slow 4G, 4× CPU)

These are lab figures, not field data. CrUX has no data for this site yet.

| Page | LCP | LCP element / cause | CLS | Lighthouse a11y / BP / SEO |
|---|---|---|---|---|
| `/` | 3.36 s | Hero headline text. 97% is *render delay*: lines start at `opacity:0; translateY(40px)` in the prerendered HTML and appear only after JS runs the reveal animation | 0.00 | 100 / 96 / 100 |
| `/services/exhibition-logistics` | 2.96 s | Headline text, render delay (same pattern) | 0.00 | 100 / 96 / 100 |
| `/ar/services/exhibition-logistics` | 4.41 s | Hero image: 3.7 s load duration, about 125 KB saving available through higher compression | 0.03 | 100 / 96 / 100 |

Other measured issues:
- **React hydration error #418 on `/` only.** The server HTML and the first client render differ, so React rebuilds the tree on the client, which adds main-thread work.
  - The first divergence is inside the hero `ScrollAnimSection`.
  - Likely cause: `useState` initialisers that read `window` (`src/components/ScrollAnimSection.tsx:69-72`).
  - This is **not yet confirmed**. It needs a development-mode build to pinpoint.
- **Hashed assets are not cached long-term.** `/assets/*.js` and `/media/*` are served with `Cache-Control: public, max-age=0, must-revalidate`. The fix is a single `headers` rule for `/assets/(.*)` in `vercel.json`. That is a config change, so it needs approval. `public/_headers` exists but only Cloudflare reads it; Vercel ignores it.
- **The homepage HTML is about 501 KB.** Roughly 207 KB is Tailwind class attributes, 134 KB inline SVG, 34 KB JSON-LD and 31 KB data URIs. It compresses well over the network, but parsing cost is real on low-end phones.
- **Accessibility:** 8 links have an `aria-label` that does not contain their visible text (Lighthouse `label-content-name-mismatch`): the "Explore network" cards, the footer JCtrans link and the footer email link. This is a small copy-level fix.

The brief says *"Do not sacrifice existing hero videos, visual design or working features just to improve a laboratory score."* So for the hero, the proposal is to keep the animation and render the **first headline line visible in the server HTML**: animate only transform, or start at opacity 1. Videos and design stay as they are. **This needs approval.**

### 2.3 Security and crawling

- **Security headers are good:** HSTS, CSP, nosniff, X-Frame-Options and Referrer-Policy are set in `vercel.json`.
- **`robots.txt`** allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot and `*`, and declares the sitemap.
- **`llms.txt`** is live (4.7 KB) with appropriately cautious wording. `llms-full.txt` does not exist and is not required.
- **`ekl2026-envod-kingdom.vercel.app` is publicly reachable (200)** and serves the same pages, with the canonical tag pointing to www.
  - That copy is low risk, but a host-based redirect to www would remove it entirely.
  - The redirect needs a Vercel project or domain setting, so it is the owner's decision.

### 2.4 Analytics and Search Console

| System | State | Evidence |
|---|---|---|
| Google Search Console | **Not connected** | The OAuth dashboard exists on this branch. The property still needs verifying and the sitemap submitting |
| Vercel Web Analytics | **Not enabled** | `/_vercel/insights/script.js` returns 404, and the browser refuses it as `text/html` |
| Custom conversion events (`call_click`, `whatsapp_click`, `quote_form_submit_success`, …) | **Not collected** | `src/lib/analytics.ts` calls `track()`, but nothing receives it. Vercel docs list custom events as **Pro/Enterprise only**, and Pro allows 2 properties per event, while the code sends up to 4 |
| Google Business Profile | Exists: 4.9★ from 11 reviews, CID 5323643622818912268 | Its website field is `http://envodkingdom.net/`; it should be `https://www.envodkingdom.net/` |

Per the brief (*"Track actual events only when the analytics integration is functioning and verified"*), no conversion figures will be reported until this is fixed.

---

## 3. Measured ranking baseline (2026-11-06)

Google Saudi Arabia, desktop, top 50, 23 keywords (13 EN, 10 AR). Cost $0.21.

- **ENVOD:** not found in the readable top-50 for any of the 22 keywords that returned data.
  - Some results came back as Google redirect links with no readable URL. Up to 36 of 50 were unreadable on `النقل بين السعودية ودول الخليج`.
  - So "not found" is reported as *not found among N readable results*, not as a definite "not ranking".
- **`gcc road freight saudi arabia`:** DataForSEO returned partial results (40106). The rank is not measured.
- **Brand query `envod kingdom`:** not found in 47 readable results. The Google Business Profile exists, but the site itself is not ranking for its own name. This is consistent with the indexing gap in §1.

Businesses ranking most often in the measured top 10:

| Domain | Keywords in top 10 | Best | Type |
|---|---|---|---|
| zatca.gov.sa | 5 | #1 | Government (not a competitor) |
| issc.sa | 3 | #1 | Customs broker |
| 1accc.com | 3 | #2 | Customs broker (AR) |
| globus-logistics.com | 3 | #3 | Customs / air cargo content |
| fares-cc.com | 3 | #4 | Customs guides |
| bluepages.com.sa | 3 | #1 | Directory |
| bafcointl.com | 2 | #1 | Forwarder / project cargo |
| alghaiths.com | 2 | #1 | Customs broker (AR) |
| kdl.com.sa | 2 | #3 | Customs broker (AR) |
| fourwinds-ksa.com | 2 (10 in top 50) | #8 | Moving & logistics |
| kimww.com, aplusksa.com, aljawad.sa.com, naqliaat.sa | 1–2 | #1–#4 | Movers (relocation) |

**What this means for the services:**
- **Customs (Priority 2):** the strongest competitors are narrow specialists with city-specific and cost/guide content. Fares ranks with a "Customs clearance at Jeddah Islamic Port: an importer's guide" type page.
- **Exhibition (Priority 1):** the SERP is a mix of event listings (Saudi Logistics Expo, 10times) and a few forwarders. That suggests weak dedicated competition, which is an opportunity once the site is indexed.

---

## 4. Competitor verification (free checks)

Full table: `2026-11-07-competitor-verification.csv`.

| Named in brief | Finding |
|---|---|
| **Four Winds** | ✅ Verified. Saudi moving and logistics; the only named competitor that ranks (10 of 23 keywords) |
| **Expat Logistics** | ✅ Exists. Saudi boutique **pet and personal-effects relocation** agency (third-party profiles). Competes with `/services/pet-animal-import` and `/services/relocation`, not exhibition. Not in the measured top 50 |
| **Aegis** | Found "Aegis Logistics and International Movers", a Saudi GLA member: freight, customs brokerage, OOG, warehousing, moving. No exhibition evidence. **Owner to confirm this is the intended company** |
| **Glaube Logistics** | ✅ Exists. Jeddah head office, with Riyadh, Dammam and Bahrain branches per directories. Not ranking for these keywords |
| **Agility (Fairs & Events)** | ✅ Global exhibition forwarder (ADNEC, ExCeL London). **No Saudi-specific evidence found** |
| **Luxe Events & Exhibitions** | Riyadh events company (job listing only). **Not a logistics competitor**; at most adjacent |
| **BCC, Maxon, Falcon** | ❌ Could not be identified for Saudi exhibition or freight. **Owner to supply names or domains** |

Exhibition competitors found during research:
- **DB Schenker**, reported as the exclusive fairs/exhibitions logistics partner for MFME in the UAE and Saudi Arabia.
- **AF Logistics**, which has an exhibitions and events page.
- **BAFCO** and **FTE Logistics**, both Breakbulk Middle East exhibitors.

No competitor text was copied. Competitor pages are used only to understand topics and structure.

---

## 5. Keyword baseline for the seven priority services

Full table: `2026-11-07-priority-keyword-baseline.csv`, 292 rows.

Each row has: service, language, country, city, intent, business value, estimated volume and source, difficulty and source, ENVOD measured rank and source, measured ranking businesses, directories/government results, SERP features, Search Console, target URL, priority and action.

| # | Service | Keywords (EN / AR) | Measured | Estimated volume available | Cities present |
|---|---|---|---|---|---|
| 1 | Exhibition & event logistics | 32 (20 / 12) | 2 | 0 | none yet |
| 2 | Customs clearance | 104 (58 / 46) | 8 | 0 | Riyadh, Jeddah, Dammam |
| 3 | House packing / moving / relocation | 29 (19 / 10) | 2 | 0 | Riyadh |
| 4 | Project cargo | 24 (16 / 8) | 0 | 0 | none |
| 5 | GCC transportation | 41 (26 / 15) | 2 | 1 | Riyadh, Bahrain, Kuwait, Oman, Qatar |
| 6 | Warehousing | 29 (17 / 12) | 0 | 0 | Jeddah, Riyadh, Dammam |
| 7 | ATA Carnet | 26 (18 / 8) | 2 | 0 | none |
| — | Brand + general-freight controls | 7 | 7 | 0 | Riyadh |

**Gaps this table exposes:**
1. Volume and difficulty are missing for almost every keyword. Priorities are currently based on service order and intent, not demand.
2. Exhibition and project cargo have **no city or GCC keywords** (Jeddah, Dammam, Jubail, Dubai and so on).
3. Relocation has almost no Arabic city terms, even though the measured Arabic SERPs (`نقل أثاث`) are dominated by local movers.

**Every action in the table is additive:** align existing headings, add verified coverage paragraphs, or add real-question FAQs. The table **never** proposes a duplicate city page.

---

## 6. Proposed paid research (needs your approval)

The balance is **$0.758**. Prices are estimates based on DataForSEO's published rates and the charges already observed on this account. The dashboard's budget guard records the actual cost of every task.

| Option | Scope | Est. cost | Why |
|---|---|---|---|
| **A1 (recommended)** | Labs `keyword_overview`, Saudi Arabia, EN + AR (2 tasks), about 300 priority keywords plus about 60 new city/GCC variants | ≈ $0.07 | Fills the volume and difficulty gaps so priorities follow demand |
| **A2 (recommended)** | Labs `ranked_keywords`, Saudi Arabia, 5 verified domains (fourwinds-ksa.com, issc.sa, fares-cc.com, kimww.com, bafcointl.com), top 100 keywords each | ≈ $0.12 | Real keyword-gap list for customs, relocation and project cargo |
| A3 (optional) | Labs `keyword_suggestions`, 7 service seeds × EN/AR | ≈ $0.34 | Broader discovery; overlaps A1. Better done after a top-up |
| Re-check | 1 SERP for `gcc road freight saudi arabia` | ≈ $0.01 | Replace the partial 40106 result |
| Hold | Re-run of the 23-keyword check | ≈ $0.21 | **Only after indexing is fixed.** Re-running now would only re-confirm "not found" |
| Needs top-up | City-level ranks (Riyadh, Jeddah, Dammam) and GCC country checks | from about $0.20 per city per 23 keywords | DataForSEO's minimum top-up is $50. No recurring scans without approval |

Rates assumed: about $0.012 per Labs task plus $0.00012 per returned item, and $0.01 per depth-50 SERP, as observed on this account. A1 + A2 + re-check ≈ **$0.20**, which leaves about $0.55: enough for the post-indexing re-run ($0.21) with headroom.

---

## 7. Changes proposed for approval (nothing has been applied)

| # | Change | Type | Risk | Effect |
|---|---|---|---|---|
| 1 | **Owner:** verify the property in Search Console, submit the sitemap, request indexing for `/` and `/ar` | Owner action | None | Unblocks everything else |
| 2 | **Owner:** set the GBP website to `https://www.envodkingdom.net/` | Owner action | None | Consistent brand entity |
| 3 | **Owner:** enable Vercel Web Analytics; decide on the Pro plan for custom events | Owner action / cost | Plan cost | Real conversion data |
| 4 | Add internal links to `/services/relocation` (and the AR version) from the services hub, the footer service list and genuinely related service pages (for example white-glove and pet import) | Additive code | Low | Fixes the Priority 3 linking gap |
| 5 | Make the language switch an `<a href>` to the counterpart route, keeping the same look and behaviour | Functional element | Low | Crawlable EN↔AR links |
| 6 | `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` for `/assets/(.*)` | Config | Low (hashed filenames) | Faster repeat visits |
| 7 | Trim 7 over-long meta descriptions to 150–160 characters, keeping the current meaning | Existing metadata | Low | No truncation in results |
| 8 | Render the first hero headline line visible in the server HTML (animation kept) | Visual detail | Low–medium | Mobile LCP |
| 9 | Diagnose and fix the homepage hydration error #418 | Bug fix | Low | Less client work |
| 10 | Include visible text in the 8 mismatched `aria-label`s | Accessibility copy | Very low | Lighthouse a11y pass |
| 11 | Recompress the Arabic exhibition hero image (same image, about 125 KB smaller) | Media optimisation | Low | Arabic LCP |
| 12 | Redirect `ekl2026-envod-kingdom.vercel.app` to www | Vercel domain setting | Owner decision | Removes the duplicate host |
| 13 | Paid research A1 + A2 + re-check (≈ $0.20) | Paid API | Within balance | Demand and gap data |

After approval, items 4–11 would land as separate commits on this branch, with the full test suite, typecheck, production build and 94-route verification run in both languages before a PR.

## 8. Progress against the 22 deliverables

| Status | Deliverables |
|---|---|
| **Done (baseline)** | Technical audit; 94-route on-page audit; measured ranking baseline; competitor verification; keyword database (priority services); budget check |
| **Started** | Keyword-gap analysis (needs A2); AEO/GEO baseline (robots, llms.txt, FAQ schema present on all priority pages); local SEO baseline (GBP found; website field wrong) |
| **Waiting on approvals or owner actions** | Internal-linking plan (item 4); technical fixes (5–11); Search Console and analytics reporting; conversion review |
| **Later stages** | New content (Stage 4, after gap data, with capability verification); off-page/citations (Stage 6); monitoring cadence (Stage 7, no recurring paid scans without approval) |

## Sources

- DataForSEO SERP run `2026-11-06t10-34-59-644z-b79c55` (stored privately at `.private-data/dataforseo`, not committed).
- Vercel Web Analytics custom events and pricing: https://vercel.com/docs/analytics/custom-events and https://vercel.com/docs/analytics/limits-and-pricing.
- Competitor checks, all on 2026-11-07:
  - GLA Family announcement (Aegis);
  - gludo.org and racklify.com directory listings (Glaube);
  - Bayt and expat sources (Expat Logistics);
  - ADNEC and ExCeL coverage (Agility);
  - DB Schenker blog (MFME partnership).

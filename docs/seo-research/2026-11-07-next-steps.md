# ENVOD KINGDOM SEO: what is done, and what is waiting (2026-11-07)

Live on www.envodkingdom.net since PR #2 (`2fae427`) and PR #3 (`9837900`). Verified live on 2026-11-07: all 94 sitemap URLs return 200, the relocation changes show in English and Arabic, and the DataForSEO dashboard API answers with an admin sign-in request.

## 1. Done

| Area | Result |
|---|---|
| Stage 1 audit | Baseline report, 94-route audit, ranking baseline, competitor verification, keyword baseline (`2026-11-07-stage-1-baseline-report.md`) |
| Technical fixes 4–11 | Crawlable language switch; relocation footer link (6 → 48 incoming pages); long-term caching for `/assets`; descriptions ≤ 160 characters; hydration error #418 fixed; hero image −58 KB; accessibility labels (Lighthouse 100) |
| Paid research | Demand and competitor gaps for $0.1431 (`2026-11-07-paid-research-results.md`) |
| Relocation (owner-confirmed cities) | City coverage section, 2 FAQs, `areaServed` cities; title, meta description, H1 and hero sentence name Riyadh, Jeddah, Dammam and Khobar |
| Dashboard | DataForSEO routes reachable on Vercel (entry-file fix plus a regression test) |
| `llms.txt` | Now lists relocation and warehousing, with a short EN/AR relocation summary that repeats only the approved page facts (this branch, after PR #3) |

Checked and needing no change:
- Images reported as "missing alt" are decorative backgrounds (hero backgrounds, faded industry-card images) with intentional `alt=""`. That is correct.
- The CSS file is 160 KB on disk but about 21 KB compressed. It costs roughly 0.5 s on the lab's Slow 4G profile and is not the main cause of the ~3 s mobile LCP. See proposal P3 for the larger cause.

## 2. Owner actions (nothing else pays off until Google indexes the site)

1. **Google Search Console.**
   - Add the domain property `envodkingdom.net` at https://search.google.com/search-console and verify it with the DNS TXT record Google gives you, added at your domain registrar.
   - Submit `https://www.envodkingdom.net/sitemap.xml` under **Sitemaps**.
   - Use **URL inspection → Request indexing** for `/`, `/ar`, `/services/relocation`, `/ar/services/relocation` and `/ar/services/customs-clearance`.
   - Then connect the property in the site's private dashboard at `/admin/search-console`.
2. **Google Business Profile:** change the website from `http://envodkingdom.net/` to `https://www.envodkingdom.net/`.
3. **Vercel Web Analytics:** turn it on in the Vercel project (Analytics tab). Page views work on the current plan. Custom events (calls, WhatsApp, quote form) need Pro; decide whether that is worth it.
4. **Optional:** approve P4 below to stop `ekl2026-envod-kingdom.vercel.app` serving a copy of the site.

## 3. Questions that decide what can be written

| # | Question | Unblocks |
|---|---|---|
| Q2 | In which ports and cities does ENVOD clear customs itself, and where does it use a partner broker? Is ENVOD a licensed customs broker («مخلص جمركي»)? | Arabic customs section for Jeddah, Dammam and Riyadh (≈ 1,680 searches/month, Jeddah largest). The wording «مخلص جمركي» is only safe if ENVOD holds that licence |
| Q3 | Does ENVOD rent storage space? If so, in which cities, and is it bonded, ambient or temperature-controlled? | Warehousing section for «مستودعات للايجار» (≈ 1,100/month) |
| Q4 | Real past exhibition shipments (event, year, scope; client names only with permission) | Factual exhibition case notes for AI answers and trust |

## 4. Proposals waiting for approval (exact text)

**P1. Homepage title (existing metadata).** Measured demand: "logistics company in riyadh" ≈ 720/month, ENVOD's natural positioning.
- Current: `ENVOD KINGDOM | Logistics & Shipping in Saudi Arabia`
- Proposed: `ENVOD KINGDOM | Logistics Company in Riyadh, Saudi Arabia` (56 characters)
- Arabic title unchanged.

**P2. One English relocation FAQ (additive).** Measured: "packers and movers riyadh" ≈ 480/month, "movers riyadh" ≈ 260/month.
- Q: "Do you provide packers and movers in Riyadh?"
- A: "Yes. Packing and moving can be arranged together for homes in Riyadh, Jeddah, Dammam and Khobar. List the rooms or main items, any fragile or oversized pieces, and whether you need dismantling or reassembly. The packing scope, crew and price are confirmed before booking."
- Arabic: «هل توفرون خدمة تغليف ونقل العفش في الرياض؟» / «نعم. يمكن تنسيق التغليف والنقل معاً للمنازل في الرياض وجدة والدمام والخبر. اذكر الغرف أو أبرز القطع وأي قطع حساسة أو كبيرة الحجم وحاجتك إلى الفك أو التركيب. ويُؤكد نطاق التغليف وفريق العمل والسعر قبل الحجز.»
- Needs confirmation that packing is offered in all four cities.

**P3. Speed: split the `site-content` JavaScript chunk (performance project).**
- Every page preloads `site-content.js`: 415 KB, or 104 KB compressed. It holds all service, industry, pillar, FAQ and SEO data for both languages.
- The home page loads about 250 KB of compressed JavaScript before its own page code. This, plus main-thread work, drives the ~3 s mobile lab LCP.
- Change: load each page's content with that page, keeping SEO metadata available to the prerender. Design, animation and videos are not touched.
- Risk: medium, because titles and structured data move between chunks. Needs before/after checks on all 94 routes and a Lighthouse comparison.
- No cost.

**P4. Redirect the Vercel host (repo config, owner decision).** Add this to `vercel.json` `redirects`. It redirects only that one production alias; preview URLs and www are unaffected.
```json
{ "source": "/:path*", "has": [{ "type": "host", "value": "ekl2026-envod-kingdom.vercel.app" }], "destination": "https://www.envodkingdom.net/:path*", "permanent": true }
```

**P5. Analytics events (only if Pro is chosen).** Vercel Pro allows 2 properties per custom event, and `src/lib/analytics.ts` sends up to 4. Trim them to the 2 most useful (service and page) at the same time as Pro is enabled.

## 5. Later, by plan

- **About 4–6 weeks after indexing:** one rank re-run of about 20 measured-demand keywords (≈ $0.20, shown for approval first).
- **Off-page (Stage 6):** genuine listings only (organisers, venues, chambers, directories the company actually qualifies for); no paid links.
- **Monitoring (Stage 7):** a monthly Search Console review once connected. No recurring paid scans without approval.

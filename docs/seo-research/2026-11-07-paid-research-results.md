# Paid keyword and competitor research: results (2026-11-07)

**Approved by the owner:** "Yes, run it", for proposal A1 + A2 + re-check in the Stage 1 report §6. Estimate ≈ $0.20.
**Actual cost reported by DataForSEO: $0.1431.** The balance went from $0.7580 to $0.6149, checked with the free endpoint before and after. This month's spend is $0.3851 of the $5.00 cap. No recurring jobs were created.

| Request | Scope | Rows returned | Cost |
|---|---|---|---|
| Labs `keyword_overview` | Google Saudi Arabia, **en**, 200 keywords (baseline priority order plus 37 new city/GCC/ATA terms) | 21 with data | $0.0145 |
| Labs `keyword_overview` | Google Saudi Arabia, **ar**, 138 keywords (baseline plus 25 new city/GCC terms) | 45 with data | $0.0174 |
| Labs `ranked_keywords` | fourwinds-ksa.com, SA/en, top 100 by volume | 100 (of 791) | $0.0240 |
| Labs `ranked_keywords` | issc.sa, SA/en | 43 (of 43) | $0.0172 |
| Labs `ranked_keywords` | fares-cc.com, SA/en | **0**. The site has no English rankings in the Labs database; it is Arabic-only for this purpose | $0.0120 |
| Labs `ranked_keywords` | kimww.com, SA/en | 100 (of 124) | $0.0240 |
| Labs `ranked_keywords` | bafcointl.com, SA/en | 100 (of 260) | $0.0240 |
| SERP live, depth 50 | `gcc road freight saudi arabia`, SA desktop | 49 readable / 15 unreadable; ENVOD not found | $0.0100 |

**Not requested:** 11 low-priority English informational ATA Carnet variants, cut to keep English in one 200-keyword task. Examples are "what does ata carnet stand for" and "ata carnet number". The four core ATA terms were included.

All volumes, difficulty scores and CPCs below are **DataForSEO third-party estimates** for Google Saudi Arabia. They are not Search Console data and not traffic. When a keyword is marked "no data", the Labs database has no volume for it, which usually means very low or no measurable demand.

Files:
- `2026-11-07-priority-keyword-baseline.csv`, updated to 349 rows. New columns: `cpc_usd`, `labs_intent`, `demand_tier`. `priority` was revised wherever demand was measured.
- `2026-11-07-competitor-keyword-gap.csv`: 343 competitor keywords. 232 are marked "Relevant gap"; brand and off-topic terms are flagged "do not target" or "ignore".

---

## 1. Findings

### 1.1 Search demand is overwhelmingly Arabic, and relocation dominates

| Service (brief priority) | Keywords measured | With volume | Est. monthly searches | Top measured terms |
|---|---|---|---|---|
| 3. House moving / relocation | 45 | 12 | **≈ 29,350** | نقل عفش جدة 12,100 · شركة نقل عفش بالرياض 12,100 · نقل عفش الدمام 2,900 · نقل عفش الخبر 1,000 · packers and movers riyadh 480 · نقل عفش من الرياض الى جدة 320 · movers riyadh 260 |
| 2. Customs clearance | 108 | 37 | ≈ 1,680 | مخلص جمركي جدة 260 · تخليص جمركي جدة 210 · مخلص جمركي الرياض 170 · مكتب تخليص جمركي جدة 170 · تخليص جمركي الرياض 140 · تخليص جمركي الدمام 110 · customs clearance saudi arabia 90 |
| 6. Warehousing | 36 | 4 | ≈ 1,100 | مستودعات للايجار جدة 480 · مستودعات الدمام 320 · مستودعات للايجار الرياض 210 · warehouse for rent riyadh 90 |
| General (controls) | 6 | 3 | ≈ 840 | logistics company in riyadh 720 · freight forwarder in saudi arabia 110 |
| 5. GCC transportation | 52 | 5 | ≈ 240 | النقل البري في السعودية 70 · شحن من السعودية الى قطر/البحرين/عمان 10 each |
| 4. Project cargo | 30 | 2 | ≈ 70 | نقل معدات ثقيلة 50 |
| 1. Exhibition & event logistics | 43 | 1 | **≈ 10** | شركة تنظيم معارض الرياض 10. Every English exhibition term returned no data |
| 7. ATA Carnet | 28 | 0 | **0** | No measurable demand for any term sent |

**What this means:**
- **Exhibition logistics and ATA Carnet are still high-value per deal, but Google search will not bring that business in volume.** Buyers there probably reach providers through organisers, venues, freight networks, LinkedIn and referrals. SEO for these two services should aim at:
  - being **found and trusted** when someone looks the company up (brand and entity, which is the indexing fix);
  - being **cited by AI answers**: clear, factual exhibition and ATA pages;
  - an **off-page** presence with organisers, venues and directories.

  Chasing search volume will not help here. The existing exhibition page (3,158 words) is already strong on content.
- **Relocation is where Google demand is, and it is Arabic.** The `/ar/services/relocation` page is now linked site-wide (fix 4). It is currently framed around **Riyadh**: «هل تخطط لنقل منزل في الرياض؟». The largest measured demand is Jeddah (12,100) and Dammam (2,900). **ENVOD can only target those cities if it actually performs household moves there.** That decision needs the owner (§3).
- **Customs demand is Arabic and city-specific, with Jeddah the largest.** Searchers use «مخلص جمركي» (customs broker) and «مكتب تخليص جمركي» (customs office) as often as «تخليص جمركي». The Arabic customs page should use these phrasings naturally.
- **Arabic warehousing demand is for rentals** («مستودعات للايجار»). That matches ENVOD only if it offers rentable or shared storage space. Owner to confirm.
- **English demand is small.** The largest English terms are "logistics company in riyadh" (720), "packers and movers riyadh" (480) and "movers riyadh" (260).
- **Keyword difficulty is near 0–11 for almost every term with volume.** These are local, low-competition SERPs. The barrier is indexing and relevance, not authority.

### 1.2 Competitor gaps (English, Google Saudi Arabia)

| Competitor | Ranked keywords | In top 10 | What it wins with |
|---|---|---|---|
| fourwinds-ksa.com | 791 | 96 | **City-specific service URLs** (`/logistics-service/riyadh/`, `/logistics-service/warehouse/riyadh/`, `/relocation-services/local-domestic/movers-…`), plus blog posts on city moves (e.g. "jubail to riyadh"). Ranks for logistic company in riyadh (720, #6), warehouse in riyadh (480, #9) and house shifting dammam (590, #10) |
| kimww.com | 124 | 59 | Moving-company homepage, local-moving city pages (`/local-moving/dammam/`, `/jubail/`), "top 10 movers in Khobar/Jeddah" listicles. Ranks for moving company (1,300, #4) and movers and packers in riyadh (480, #4) |
| bafcointl.com | 260 | 81 | "10 best freight forwarders in Saudi Arabia" listicle, plus freight-forwarder-in-Jeddah/Riyadh city pages |
| issc.sa | 43 | 10 | Fasah-related news content (fasah sa 1,600, #4), land transport and customs service pages |
| fares-cc.com | 0 (en) | — | Arabic-only; an Arabic `ranked_keywords` pull would be needed (≈ $0.024) |

Relevant gap volume by ENVOD service: relocation 87 keywords / ≈ 17,500 per month; general logistics 114 / ≈ 14,100; warehousing 23 / ≈ 1,500; customs 6 / ≈ 800; GCC 2 / ≈ 130.

**Search for the brand name "expat logistics" (≈ 1,000/mo):** kimww.com ranks #26 for it with its pet-relocation page. This is a **competitor brand query**, so ENVOD should not target it. It does confirm that pet-relocation searchers exist in Saudi Arabia. ENVOD's `/services/pet-animal-import` page already covers the regulated process and should stay factual.

**What not to copy:** competitors rank partly through the "top 10 movers/forwarders" listicle format and through city pages. The brief rules out city-name duplicate pages and invented claims. A listicle ranking competitors would also be a sensitive comparison claim. The structural lesson is **specific, verified city coverage on the existing service pages**, not mass-produced pages.

### 1.3 SERP re-check
`gcc road freight saudi arabia` now returns full results (not 40106 partial). ENVOD is not found in 49 readable results; 15 more were unreadable. Ranking pages include market-research reports (mordorintelligence, researchandmarkets) and a few forwarders (gsi-int.com, panglobelg.com, gccfreights.com). The query reads as informational or market research, not buyer intent.

---

## 2. Recommended next actions (ordered by expected impact)

1. **Indexing first (owner).** Verify Search Console, submit the sitemap and request indexing for `/`, `/ar`, `/ar/services/relocation` and `/ar/services/customs-clearance`. None of the rest pays off while Google barely indexes the site.
2. **Arabic relocation page, Priority 3 by service order but first by demand** (additive; needs approval of exact copy):
   - Add Arabic sections covering the move types ENVOD actually handles: inside Riyadh, Riyadh↔Jeddah and other inter-city moves, and office moves. Use the measured phrasing («نقل عفش», «نقل أثاث», «نقل عفش من الرياض الى جدة»).
   - Add Jeddah, Dammam and Khobar coverage **only if confirmed**.
   - Keep the existing text; no city duplicate pages.
3. **Arabic customs page:** add natural uses of «مخلص جمركي» and «مكتب تخليص جمركي», plus a short verified section on Jeddah Islamic Port, King Abdulaziz Port Dammam and Riyadh dry port/airport procedures, where ENVOD actually clears there. Keep the existing "subject to authorities" caveats.
4. **Warehousing:** only if ENVOD rents storage space, add an Arabic section answering «مستودعات للايجار» intent (what can be stored, minimum period, how pricing is quoted). Otherwise leave it.
5. **Exhibition and ATA Carnet:** no keyword-volume work. Focus on entity and authority:
   - organiser and venue directory listings, but only real ones;
   - case notes when the owner can verify a real past shipment;
   - clear, factual answers that AI engines can cite.
6. **English:** align the homepage and services hub with "logistics company in riyadh" (720), which is already ENVOD's natural positioning, and the relocation page with "packers and movers riyadh" / "movers riyadh".
7. **Hold all further paid research until indexing is fixed.** The next useful spend is a rank re-run of about 20 keywords, rebuilt around the measured demand terms (≈ $0.20), about 4–6 weeks after indexing. An Arabic `ranked_keywords` pull for 1accc.com, fares-cc.com and alghaiths.com (≈ $0.07) is optional.

## 3. Questions for the owner (these decide what can be written)

1. Does ENVOD carry out **household moves in Jeddah, Dammam and Khobar**, and **between cities** (for example Riyadh→Jeddah), with its own crews or named partners? This decides whether the 12,100 + 2,900 + 1,000 monthly Arabic searches can be targeted.
2. In which **ports and cities** does ENVOD clear customs itself, and where does it use a partner broker?
3. Does ENVOD offer **rentable or shared warehouse space**? If so, in which cities, and is it bonded or ambient?
4. Are there **real exhibition shipments** (event, year, scope) that can be described factually, without client names unless permitted?

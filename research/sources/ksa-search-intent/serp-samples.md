# SERP evidence: Saudi logistics search-intent queries

**Captured:** 2026-10-17 (UTC)  
**Engine:** Bing public search results (`format=rss` unless noted). Direct unauthenticated `curl` requests; no paid tools or integrated search callbacks.  
**Locale caveat:** English or Arabic below identifies the query language, not a verified searcher location. Bing did not expose a reliable Saudi location setting in the result response. The Saudi market was specified in the query text. Treat these as query samples, not representative rankings or volume data.

These are literal observations of the top result items returned to the request, retained to document what the public endpoint exposed. Most returned irrelevant results, so they are not used to infer rank, demand, or actual Saudi SERP composition. Queries still record the intent angles tested.

## English samples

### EN-1 — customs clearance and city-local quote intent
- **Query:** `Saudi customs clearance Riyadh Jeddah Dammam quote`
- **Locale:** English query; Saudi cities named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=Saudi+customs+clearance+Riyadh+Jeddah+Dammam+quote
- **Observed sample:** Bing RSS titled the search as requested. Returned visible items included “Saudia | Book flights | Hotels | Holidays” and “Saudi Arabia - Wikipedia”; snippets concerned flights and country history, not freight or customs.

### EN-2 — forwarding, sea freight and price/quote intent
- **Query:** `Saudi freight forwarder sea freight quote Saudi Arabia`
- **Locale:** English query; Saudi Arabia named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=Saudi+freight+forwarder+sea+freight+quote+Saudi+Arabia
- **Observed sample:** Visible items again included Saudia flight pages and general Saudi Arabia pages; no relevant forwarding result was visible in the sampled items.

### EN-3 — GCC road transport and warehousing
- **Query:** `Saudi GCC road transport warehousing quote logistics`
- **Locale:** English query; Saudi/GCC market named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=Saudi+GCC+road+transport+warehousing+quote+logistics
- **Observed sample:** Visible items included Saudia and general tourism/country results, not road transport or warehouse providers.

### EN-4 — exhibition logistics and ATA Carnet
- **Query:** `Saudi exhibition logistics ATA Carnet shipping quote`
- **Locale:** English query; Saudi Arabia named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=Saudi+exhibition+logistics+ATA+Carnet+shipping+quote
- **Observed sample:** Visible items included Saudia flight and general country results; no exhibition logistics or carnet result was visible.

### EN-5 — plain HTML result check for city-based customs
- **Query:** `Saudi Arabia customs clearance Riyadh logistics company`
- **Locale:** English query; Saudi market named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?q=Saudi+Arabia+customs+clearance+Riyadh+logistics+company&count=10
- **Observed sample:** Returned `b_algo` items included Saudia and Wikipedia rather than relevant customs brokers; visible snippets concerned flights and country history.

## Arabic samples

### AR-1 — city-specific customs clearance and price
- **Query:** `تخليص جمركي الرياض جدة الدمام سعر`
- **Locale:** Arabic query; Riyadh, Jeddah and Dammam named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+%D8%AC%D9%85%D8%B1%D9%83%D9%8A+%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6+%D8%AC%D8%AF%D8%A9+%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85+%D8%B3%D8%B9%D8%B1
- **Observed sample:** Returned results included YouTube Help and unrelated Chinese-language YouTube pages; no relevant customs results were visible.

### AR-2 — sea freight, customs clearance and quote
- **Query:** `شحن بحري السعودية تخليص جمركي عرض سعر`
- **Locale:** Arabic query; Saudi Arabia named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=%D8%B4%D8%AD%D9%86+%D8%A8%D8%AD%D8%B1%D9%8A+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+%D8%AC%D9%85%D8%B1%D9%83%D9%8A+%D8%B9%D8%B1%D8%B6+%D8%B3%D8%B9%D8%B1
- **Observed sample:** Returned results included unrelated HELLO! celebrity/fashion pages; no relevant freight results were visible.

### AR-3 — GCC road freight and warehousing
- **Query:** `نقل بري الخليج مستودعات لوجستية السعودية`
- **Locale:** Arabic query; Saudi/GCC market named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=%D9%86%D9%82%D9%84+%D8%A8%D8%B1%D9%8A+%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D8%AC+%D9%85%D8%B3%D8%AA%D9%88%D8%AF%D8%B9%D8%A7%D8%AA+%D9%84%D9%88%D8%AC%D8%B3%D8%AA%D9%8A%D8%A9+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9
- **Observed sample:** Returned results were about Vietnamese food, not road freight or warehousing.

### AR-4 — exhibition shipment and ATA Carnet
- **Query:** `شحن معارض تخليص ATA Carnet السعودية`
- **Locale:** Arabic query with Latin “ATA Carnet”; Saudi Arabia named; searcher location unverified.
- **Bing URL:** https://www.bing.com/search?format=rss&q=%D8%B4%D8%AD%D9%86+%D9%85%D8%B9%D8%A7%D8%B1%D8%B6+%D8%AA%D8%AE%D9%84%D9%8A%D8%B5+ATA+Carnet+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9
- **Observed sample:** Returned results were quote-of-the-day pages, not exhibition shipping or carnet services.

## Evidence limitation

The Bing endpoint produced grossly irrelevant samples for all these terms. This is evidence of a poor/unstable endpoint response in this capture, not evidence that there is no Saudi demand or no relevant SERP. Do not cite the displayed items as competitors, infer ranking positions, or derive search volume from them.

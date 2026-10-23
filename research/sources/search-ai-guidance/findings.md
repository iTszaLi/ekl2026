# Primary-source findings: bilingual SEO, AI visibility, crawlers, and local trust

- **Research date:** 2026-10-17
- **Scope:** Google bilingual/localized indexing guidance, Google AI search guidance, OpenAI search crawler controls, and official reference inventory relevant to schema, Bing/Perplexity, and Saudi business identity.
- **Evidence files:** `google-localized-versions.md`, `google-ai-features.md`, `openai-crawlers.md`, `query-log.md`, `source-inventory.md`
- **Source URLs retained:** 10 distinct public URLs (3 fetched/read; 7 retained as follow-up official references).

## Key facts: official guidance

1. **Bilingual/localized pages:** Google's advice is to identify alternate language/region page variants, using `hreflang`; each alternate should reciprocally list itself and the other variants, with fully qualified URLs. Google says `hreflang` and HTML `lang` are not its language-detection mechanism; Google determines language algorithmically. This is language/variant interpretation guidance, not an indexing guarantee. [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) — evidence: `google-localized-versions.md`.
2. **Indexing and eligibility:** Google says AI Overviews/AI Mode have no additional technical requirements beyond Search's existing requirements; eligibility entails indexing and snippet eligibility. Google expressly warns that meeting requirements does not guarantee crawling, indexing, or serving. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) — evidence: `google-ai-features.md`.
3. **Visible, crawlable content:** Google's stated fundamentals include crawl permission through robots.txt and infrastructure, internal linking, important information in textual form, page experience, and ensuring structured data matches visible text. It also recommends current Merchant Center and Business Profile information. Same evidence as above.
4. **Structured data and AI-specific files:** Google states no special Schema.org structured data, new AI text files, or new markup are required for its AI features. That means schema should describe truthful, visible page content and serve supported Search features; it is not an AI-citation switch. Google's non-guarantee for indexing/serving further rules out promising citations based on schema. Google does not establish `llms.txt` as a Google AI visibility requirement or citation guarantee. Same evidence as above.
5. **OpenAI crawler policy:** OpenAI separates OAI-SearchBot (ChatGPT search) from GPTBot (training-related crawling), allowing a site to permit search crawling while opting out of training use. OpenAI says OAI-SearchBot opt-out removes the site from ChatGPT search answers, though navigational links may remain; it does not promise citation frequency when allowed. [OpenAI crawler docs](https://platform.openai.com/docs/bots) — evidence: `openai-crawlers.md`.
6. **Local trust:** Google's AI guide explicitly calls for up-to-date Business Profile information (and Merchant Center where relevant). For a Saudi firm, official Saudi business-service and Ministry of Commerce portals are appropriate primary references when verifying company names/registrations; the relevant pages were not fetched here, so this is a source-selection recommendation, not an assertion about ENVOD's registration or local ranking factors.

## Guidance versus speculation

**Officially supported:** Correct language/region annotations help Google understand alternate URLs; Google has ordinary crawl/index/snippet eligibility prerequisites for AI features; structured data must match visible text; robots.txt can control specific official AI crawlers; OpenAI provides an explicit OAI-SearchBot opt-out.

**Not established by these sources:** that adding schema, `llms.txt`, or an AI-specific file increases AI citations; that allowing an AI crawler guarantees an answer mention; that bilingual tags alone cause indexing; or that any one local trust signal guarantees a local rank. Claims of those effects should be labeled SEO speculation unless separately supported by direct platform documentation or controlled evidence.

## Limitations and source quality

- Three live, first-party documents were fetched/read directly; they had no visible publication/update date in the captured page text. Access date: 2026-10-17. They are Tier 1 for describing their publishers' own systems, but vendor documentation is not independent evidence of ranking impact.
- Seven additional distinct official/standards URLs are retained for later research but were not fetched and are not used for claims here. The Saudi sources are not a substitute for checking a specific business record.
- Search discovery used four Bing queries (one Arabic); returned results were noisy/off-topic, and Google/DDG requests presented anti-automation challenges. No query volume, rank, or competitor conclusions are claimed.
- This brief does not determine Google/Bing/Perplexity indexing state for any particular site. That requires live crawl checks and/or owner access to Search Console and other webmaster consoles.

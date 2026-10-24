# AI Search and Crawler Policy Audit — ENVOD KINGDOM
**Observed:** 24 October 2026 | **Scope:** robots.txt, official search/crawler documentation and available site policy

## Current site state
The live robots file explicitly allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot and Claude-User. It also has a wildcard rule that permits crawlers not named in a dedicated group, including GPTBot and ClaudeBot. No policy change was made because the owner’s preference on training access was not specified.

## Documented crawler distinctions
- Google documents robots meta directives, including indexing controls; they are separate from a robots.txt crawl permission. [1](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- OpenAI identifies OAI-SearchBot for search discovery, GPTBot for model training, and ChatGPT-User for a user-directed fetch. Search access and training access can be considered separately. [2](https://developers.openai.com/api/docs/bots)
- Anthropic documents Claude-SearchBot for search, ClaudeBot for training and Claude-User for user-directed fetching. [3](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- Meta documents Meta-WebIndexer for improving Meta AI search-result quality and citing/linking to web content. This is direct Meta AI discovery guidance, distinct from social-sharing crawlers. [4](https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers)
- Bing says IndexNow notifies engines when URLs change; submission does not guarantee crawling or indexing. [5](https://www.bing.com/indexnow/getstarted)
- X’s official Twitterbot evidence is snippet-only and concerns card previews. It does not establish an xAI/Grok search crawler or policy. [6](https://developer.x.com/en/docs/x-for-websites/cards/guides/getting-started)

## Unresolved
No usable official xAI documentation was found for crawler identity, robots handling or URL-notification policy. X robots behavior beyond the card-preview snippet also remains unresolved. Do not invent bot names or rules from third-party pages.

## Owner decision before policy edits
The site’s wildcard currently permits training crawlers even though GPTBot and ClaudeBot are not separately listed. If the owner later chooses to block training while keeping search discovery, update robots.txt and verify each search user-agent separately; do not assume one crawler represents another. No changes have been made. Robots permissions cannot guarantee an AI answer citation, brand mention or referral.

## Site-specific AEO/GEO assessment
The crawl found the robots and sitemap publicly readable and all 86 sitemap routes technically accessible. This verifies crawler access at request time only. It does not show which models retrieve the pages, whether a system cites ENVOD, or any AI search visibility. Current verified outcome: **AI citations and referral impact not measured**.

## Sources cited

1. **Google Search Central, “Robots Meta Tags Specifications** — [source](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) — Tier 1; fetched evidence; docs/seo-research/research/sources/CRAWLERS-01-google-robots-meta.md.
2. **OpenAI, “Overview of OpenAI Crawlers** — [source](https://developers.openai.com/api/docs/bots) — Tier 1; fetched evidence; docs/seo-research/research/sources/CRAWLERS-02-openai-bots.md.
3. **Anthropic Privacy Center, “Does Anthropic crawl data from the web, and how can site owners block the crawler?** — [source](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) — Tier 1; fetched evidence; docs/seo-research/research/sources/CRAWLERS-03-anthropic-crawlers.md.
4. **Meta Web Crawlers | Developer Documentation** — [source](https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers) — Tier 1; fetched evidence; docs/seo-research/research/sources/AI-GAP-02-meta-webindexer-robots.md.
5. **How to add IndexNow to your website | Bing Webmaster Tools** — [source](https://www.bing.com/indexnow/getstarted) — Tier 1; fetched evidence; docs/seo-research/research/sources/AI-GAP-01-bing-indexnow-url-notification.md.
6. **Getting started with Cards | Docs | Twitter Developer Platform** — [source](https://developer.x.com/en/docs/x-for-websites/cards/guides/getting-started) — Tier 1; snippet-only; docs/seo-research/research/sources/AI-GAP-03-x-twitterbot-cards-snippet.md.

# Evidence: OpenAI — Overview of OpenAI Crawlers

- **Source URL:** https://platform.openai.com/docs/bots
- **Publisher / tier:** OpenAI official documentation (Tier 1 for OpenAI's own crawler and product behavior)
- **Publication/update date:** No publication or update date shown on the page when checked
- **Accessed:** 2026-10-17
- **Capture:** Relevant page text transcribed from the directly fetched public page; this is an excerpt, not the complete page.

## Relevant official guidance

OpenAI says its `OAI-SearchBot` and `GPTBot` robots.txt controls are independent. A publisher can permit OAI-SearchBot for search visibility while disallowing GPTBot for model-training use. OpenAI notes that a robots.txt change can take approximately 24 hours to adjust for search.

> “OAI-SearchBot is for search. OAI-SearchBot is used to surface websites in search results in ChatGPT’s search features.”

> “Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links.”

The documentation recommends allowing OAI-SearchBot and allowing requests from OpenAI's published IP ranges for sites that want to appear in ChatGPT search results.

## Interpretation / limits

This documents an eligibility/opt-out control for ChatGPT search, not a ranking promise or guarantee that a page will be cited in any particular answer. It is OpenAI-specific and should not be generalized to Google, Bing, or Perplexity.

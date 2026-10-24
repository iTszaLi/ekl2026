Source: https://developers.openai.com/api/docs/bots
Title: Overview of OpenAI Crawlers
Fetched: 2026-10-24T10:40:10.674Z

For the complete documentation index, see [llms.txt](https://developers.openai.com/llms.txt). Markdown versions of documentation pages are available by appending
`.md` to the page URL.

## Search the API docs

Search docs

### Suggested

response\_formatreasoning\_effortstreamingtools

Primary navigation

Search docs

### Suggested

response\_formatreasoning\_effortstreamingtools

Overview  Models  Agents  Tools  Audio & voice  Production  API reference

DocsOverview

- [Home](https://developers.openai.com/api/docs)

### Get started

- [Quickstart](https://developers.openai.com/api/docs/quickstart)
- [Using GPT-6](https://developers.openai.com/api/docs/guides/latest-model)
- [Key concepts](https://developers.openai.com/api/docs/concepts)

### Core concepts

- [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Decisions API](https://developers.openai.com/api/docs/guides/decisions)
- [Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [Background mode](https://developers.openai.com/api/docs/guides/background)
- [Streaming](https://developers.openai.com/api/docs/guides/streaming-responses)
- [WebSocket mode](https://developers.openai.com/api/docs/guides/websocket-mode)
- [Mid-turn steering](https://developers.openai.com/api/docs/guides/steering)
- [Multi-agent](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [Webhooks](https://developers.openai.com/api/docs/guides/webhooks)
- [File inputs](https://developers.openai.com/api/docs/guides/file-inputs)
- [Compaction](https://developers.openai.com/api/docs/guides/compaction)
- [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting)

### SDKs and CLI

- [OpenAI SDK](https://developers.openai.com/api/docs/libraries)
- [OpenAI CLI](https://developers.openai.com/api/docs/libraries/openai-cli)

### Resources

- [Changelog](https://developers.openai.com/api/docs/changelog)
- [Deprecations](https://developers.openai.com/api/docs/deprecations)
- [Supported countries](https://developers.openai.com/api/docs/supported-countries)
- [OpenAI Crawlers](https://developers.openai.com/api/docs/bots)
- [Terms and policies](https://openai.com/policies)

### Legacy APIs

- Agent Builder

  - [Overview](https://developers.openai.com/api/docs/guides/agent-builder)
  - [Migration guide](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder)
  - [Node reference](https://developers.openai.com/api/docs/guides/node-reference)
  - [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)

- Evals

  - [Getting started](https://developers.openai.com/api/docs/guides/evaluation-getting-started)
  - [Working with evals](https://developers.openai.com/api/docs/guides/evals)
  - [Prompt optimizer](https://developers.openai.com/api/docs/guides/prompt-optimizer)
  - [External models](https://developers.openai.com/api/docs/guides/external-models)
  - [Graders](https://developers.openai.com/api/docs/guides/graders)

- Fine-tuning

  - [Optimization cycle](https://developers.openai.com/api/docs/guides/model-optimization)
  - [Supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)
  - [Vision fine-tuning](https://developers.openai.com/api/docs/guides/vision-fine-tuning)
  - [Direct preference optimization](https://developers.openai.com/api/docs/guides/direct-preference-optimization)
  - [Reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
  - [RFT use cases](https://developers.openai.com/api/docs/guides/rft-use-cases)
  - [Best practices](https://developers.openai.com/api/docs/guides/fine-tuning-best-practices)

- Assistants API

  - [Migration guide](https://developers.openai.com/api/docs/assistants/migration)

[API Dashboard](https://platform.openai.com/login)

[Try ChatGPT](https://chatgpt.com/)

Copy Page

OpenAI uses web crawlers (“robots”) and user agents to perform actions for its products, either automatically or triggered by user request. OpenAI uses OAI-SearchBot and GPTBot robots.txt tags to enable webmasters to manage how their sites and content work with AI. Each setting is independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI’s generative AI foundation models. If your site has allowed both bots, we may use the results from just one crawl for both use cases to avoid duplicative crawling. For search results, please note it can take ~24 hours from a site’s robots.txt update for our systems to adjust.

| User agent | Description & details |
| --- | --- |
| OAI-SearchBot | OAI-SearchBot is for search. OAI-SearchBot is used to surface websites in search results in ChatGPT’s search features. Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links. To help ensure your site appears in search results, we recommend allowing OAI-SearchBot in your site’s robots.txt file and allowing requests from our published IP ranges below. <br>Example user-agent string (the version number may change): `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot`<br>When fetching robots.txt files, we may use a user-agent string with an additional `robots.txt` marker. The marker helps site owners more easily distinguish requests for the robots.txt file from requests for other resources, especially when their logs do not include paths: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; robots.txt; +https://openai.com/searchbot`<br>Published IP addresses: [https://openai.com/searchbot.json](https://openai.com/searchbot.json) |
| OAI-AdsBot | OAI-AdsBot is used to validate the safety of web pages submitted as ads on ChatGPT. When you submit an ad, OpenAI may visit the landing page to ensure it complies with our policies. We may also use content from the landing page to determine when it’s most relevant to show the ad to users. OAI-AdsBot only visits pages submitted as ads, and the data collected by OAI-AdsBot is not used to train generative AI foundation models. <br>Full user-agent string: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-AdsBot/1.0; +https://openai.com/adsbot`<br>Published IP addresses: [https://openai.com/adsbot.json](https://openai.com/adsbot.json) |
| GPTBot | GPTBot is used to make our generative AI foundation models more useful and safe. It is used to crawl content that may be used in training our generative AI foundation models. Disallowing GPTBot indicates a site’s content should not be used in training generative AI foundation models. <br>Example user-agent string (the version number may change): `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot`<br>When fetching robots.txt files, we may add a `robots.txt` marker to the user-agent string to help site owners distinguish those requests from requests for other resources, especially when logs do not include paths. <br>Published IP addresses: [https://openai.com/gptbot.json](https://openai.com/gptbot.json) |
| ChatGPT-User | OpenAI also uses ChatGPT-User for certain user actions in ChatGPT and [Custom GPTs](https://openai.com/index/introducing-gpts/). When users ask ChatGPT or a CustomGPT a question, it may visit a web page with a ChatGPT-User agent. ChatGPT users may also interact with external applications via [GPT Actions](https://developers.openai.com/api/docs/actions/introduction). ChatGPT-User is not used for crawling the web in an automatic fashion. Because these actions are initiated by a user, robots.txt rules may not apply. ChatGPT-User is not used to determine whether content may appear in Search. Please use OAI-SearchBot in robots.txt for managing Search opt outs and automatic crawl. <br>Full user-agent string: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot`<br>Published IP addresses: [https://openai.com/chatgpt-user.json](https://openai.com/chatgpt-user.json) |

Subscribe to the [RSS feed](https://developers.openai.com/api/docs/bots/rss.xml) for updates
to this page.

Ask AI

Loading docs agent...
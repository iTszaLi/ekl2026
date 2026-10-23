# Google Search Central — sitemap `lastmod`

- **URL:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- **Retrieved:** 17 October 2026 (UTC), direct public HTTPS request with `?hl=en`.
- **Tier:** 1 — first-party Google Search documentation.

Google states that it uses a sitemap `<lastmod>` value when it is consistently and verifiably accurate, and that the value should reflect the date and time of the page's last significant update. The same page says Google ignores `<priority>` and `<changefreq>` values.

This supports removing a generated build-date value when there is no per-page content revision date; it does not mean a sitemap without `<lastmod>` is invalid.

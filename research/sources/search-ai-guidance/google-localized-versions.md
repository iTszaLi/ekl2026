# Evidence: Google Search Central — Tell Google about localized versions

- **Source URL:** https://developers.google.com/search/docs/specialty/international/localized-versions
- **Publisher / tier:** Google Search Central, official platform documentation (Tier 1 for Google's own behavior)
- **Publication/update date:** No publication or update date shown on the page when checked
- **Accessed:** 2026-10-17
- **Capture:** Relevant page text transcribed from the directly fetched public page; this is an excerpt, not the complete page.

## Relevant official guidance

> “If you have multiple versions of a page for different languages or regions, tell Google about these different variations. Doing so will help Google Search point users to the most appropriate version of your page by language or region.”

> “Use `hreflang` to tell Google about the variations of your content, so that we can understand that these pages are localized variations of the same content.”

> “Google doesn't use `hreflang` or the HTML `lang` attribute to detect the language of a page; instead, we use algorithms to determine the language.”

> “Each language version must list itself as well as all other language versions.”

Google also says alternate URLs must be fully qualified, including `http` or `https`.

## Interpretation / limits

This supports explicit, reciprocal language/region annotations for alternate URLs; it does **not** say that `hreflang` causes indexing or guarantees a particular result. `lang` remains useful for document/accessibility semantics, but Google says it is not its language-detection signal.

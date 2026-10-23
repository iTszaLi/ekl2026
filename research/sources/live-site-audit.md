# ENVOD KINGDOM public-site and workspace baseline

**Observed:** 17 October 2026 (UTC)  
**Method:** Direct HTTPS requests to the public site and a script-based inspection of the existing workspace prerender output. This is a crawlability and markup audit, not a Google index or performance measurement.

## Public website

The bare domain redirects to `https://www.envodkingdom.net/`.

| URL | Status | Observed detail |
|---|---:|---|
| `/` | 200 | Canonical points to the www homepage; one H1. The title is 91 characters and the meta description is 231 characters. |
| `/robots.txt` | 200 | `User-agent: *`, `Allow: /`, and sitemap URL `https://www.envodkingdom.net/sitemap.xml`. |
| `/sitemap.xml` | 200 | 43 `<loc>` entries; every `<lastmod>` observed is `2026-07-06`; no `hreflang` entries. All 43 listed URLs returned HTTP 200 in the baseline HEAD crawl. |
| `/services` | 200 | One H1; meta description is 216 characters. |
| `/services/customs-clearance` | 200 | Title: “Customs Clearance in Saudi Arabia \| ENVOD KINGDOM”; one H1; description is 189 characters. |
| `/services/exhibition-logistics` | 200 | Title: “Exhibition Logistics Company in Saudi Arabia \| ENVOD KINGDOM”; one H1; description is 208 characters. |
| `/services/ata-carnet` | 200 | Title includes “Typically Within 24 Hours”; description is 223 characters. This is an unsupported turnaround claim and should not be presented without owner evidence. |
| `/privacy-policy` | 404 | Current source contains a legal page, but it is not present on the public deployment checked. |
| `/terms-and-conditions` | 404 | Current source contains a legal page, but it is not present on the public deployment checked. |
| `/cookie-policy` | 404 | Current source contains a legal page, but it is not present on the public deployment checked. |
| `/ar` | 404 | The Arabic homepage is not served on the public deployment checked. |
| `/ar/privacy-policy` | 404 | Arabic legal route not served. |
| `/ar/services/customs-clearance` | 404 | Arabic service route not served. |
| `/ar/services/exhibition-logistics` | 404 | Arabic service route not served. |
| `/ar/services/ata-carnet` | 404 | Arabic service route not served. |

The 43/43 result describes only the URLs listed by the current public sitemap. It does not establish that unlisted routes are accessible or that Google has indexed the pages. A HEAD check confirms HTTP status, not rendered content or user experience.

## Current workspace build

The current application source prerenders 92 URLs: 46 English and 46 Arabic. In the generated `dist/public` output, the audit found:

- Each route has a prerendered HTML file, canonical URL, one H1, and no `noindex` directive.
- English and Arabic variants have reciprocal `en-SA`, `ar-SA`, and `x-default` alternate links.
- JSON-LD parsed as valid JSON, page titles were unique, and no image without an `alt` attribute was found in the generated page HTML.
- Three English page titles exceed 65 characters. Forty-one page descriptions exceed 160 characters; all 11 Arabic industry descriptions are especially long because the full overview text is reused as metadata. The Arabic industry titles repeat “لوجستيات” because the template adds the term to names that already include it.
- The sitemap builder writes the build date as `lastmod` for every URL, even when that page's content did not change.

These are workspace findings only. They do not prove that the current public deployment is built from this source tree.

## Evidence limits

- No Search Console, analytics, Business Profile, or paid keyword/backlink account was accessed.
- No Core Web Vitals or PageSpeed result was obtained; performance observations in the final report must be labeled as code-based unless measured separately.
- The public pages and workspace build were inspected independently because the live output does not match the current bilingual/legal route set in the workspace.

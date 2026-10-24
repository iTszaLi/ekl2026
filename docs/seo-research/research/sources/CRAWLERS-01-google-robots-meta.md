Source: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
Title: Robots Meta Tags Specifications | Google Search Central  |  Documentation  |  Google for Developers
Fetched: 2026-10-24T10:40:07.903Z

[Skip to main content](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#main-content)

[![Google Search Central](https://developers.google.com/static/search/images/google-search-central-logo.svg)](https://developers.google.com/search)

- [GoogleSearch Central](https://developers.google.com/search)

`/`

Language

- [English](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Deutsch](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=de)
- [Español](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=es)
- [Español – América Latina](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=es-419)
- [Français](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=fr)
- [Indonesia](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=id)
- [Italiano](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=it)
- [Polski](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=pl)
- [Português – Brasil](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=pt-br)
- [Tiếng Việt](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=vi)
- [Türkçe](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=tr)
- [Русский](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ru)
- [العربيّة](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ar)
- [हिंदी](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=hi)
- [ภาษาไทย](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=th)
- [中文 – 简体](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=zh-cn)
- [中文 – 繁體](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=zh-tw)
- [日本語](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ja)
- [한국어](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag?hl=ko)

[Sign in](https://developers.google.com/_d/signin?continue=https%3A%2F%2Fdevelopers.google.com%2Fsearch%2Fdocs%2Fcrawling-indexing%2Frobots-meta-tag&prompt=select_account)

- [Documentation](https://developers.google.com/search/docs)

[Search Console](https://goo.gle/searchconsole)

- On this page
- [Using the robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#robotsmeta)
- [Using the X-Robots-Tag HTTP header](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag)
- [Valid indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives)
  - [all](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#all)
  - [noindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noindex)
  - [nofollow](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nofollow)
  - [none](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#none)
  - [nosnippet](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
  - [indexifembedded](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#indexifembedded)
  - [max-snippet: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
  - [max-image-preview: \[setting\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-image-preview)
  - [max-video-preview: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-video-preview)
  - [notranslate](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#notranslate)
  - [noimageindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noimageindex)
  - [unavailable\_after: \[date/time\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#unavailable-after)
  - [Reference of historical and other unused rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#reference-of-historical-and-other-unused-rules)
  - [noarchive](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noarchive)
  - [nocache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nocache)
  - [nositelinkssearchbox](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nositelinkssearchbox)
- [Handling combined indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combined)
- [Using the data-nosnippet HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr)
- [Using structured data](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#structureddata)
- [Practical implementation of X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag-implementation)
- [Combining robots.txt rules with indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combining)

- [Home](https://developers.google.com/)
- [Search Central](https://developers.google.com/search)
- [Documentation](https://developers.google.com/search/docs)

Was this helpful?



 Send feedback



- On this page
- [Using the robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#robotsmeta)
- [Using the X-Robots-Tag HTTP header](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag)
- [Valid indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives)
  - [all](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#all)
  - [noindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noindex)
  - [nofollow](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nofollow)
  - [none](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#none)
  - [nosnippet](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
  - [indexifembedded](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#indexifembedded)
  - [max-snippet: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
  - [max-image-preview: \[setting\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-image-preview)
  - [max-video-preview: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-video-preview)
  - [notranslate](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#notranslate)
  - [noimageindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noimageindex)
  - [unavailable\_after: \[date/time\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#unavailable-after)
  - [Reference of historical and other unused rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#reference-of-historical-and-other-unused-rules)
  - [noarchive](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noarchive)
  - [nocache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nocache)
  - [nositelinkssearchbox](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nositelinkssearchbox)
- [Handling combined indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combined)
- [Using the data-nosnippet HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr)
- [Using structured data](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#structureddata)
- [Practical implementation of X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag-implementation)
- [Combining robots.txt rules with indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combining)

# Robots`meta` tag, `data-nosnippet`, and `X-Robots-Tag` specifications

This document details how the page- and text-level settings can be used to adjust how Google
presents your content in search results. You can specify page-level settings by including a
`meta` tag on HTML pages or in an HTTP header. You can specify text-level settings with
the `data-nosnippet` attribute on HTML elements within a page.

Keep in mind that these settings can be read and followed only if crawlers are allowed to access
the pages that include these settings.

The `<meta name="robots" content="noindex">` rule applies to search engine
crawlers. To block non-search crawlers, such as `AdsBot-Google`, you might need to add
rules targeted to the specific crawler (for example,
`<meta name="AdsBot-Google" content="noindex">`).

## Using the robots`meta` tag

The robots`meta` tag lets you use a granular,
page-specific approach to controlling how an individual HTML page should be indexed and served to
users in Google Search results. Place the robots`meta` tag
in the `<head>` section of a given page, like this:

```
<!DOCTYPE html>
<html><head>
  <meta name="robots" content="noindex">
  (…)
</head>
<body>(…)</body>
</html>
```

In this example, the robots`meta` tag instructs search
engines not to show the page in search results. The value of the `name` attribute
(`robots`) specifies that the rule applies to all crawlers. Both the `name`
and the `content` attributes are case-insensitive. To address a specific crawler,
replace the `robots` value of the `name` attribute with the user agent token
of the crawler that you are addressing. Google supports two user agent tokens in the
robots`meta` tag; other values are ignored:

1. `googlebot`: for all text results.
2. `googlebot-news`: for news results.

For example, to instruct Google specifically not to show a snippet in its search results, you can
specify `googlebot` as the name of the `meta` tag:

```
<meta name="googlebot" content="nosnippet">
```

To show a full snippet in Google's web search results, but no snippet in Google News, specify
`googlebot-news` as the name of the `meta` tag:

```
<meta name="googlebot-news" content="nosnippet">
```

To specify multiple crawlers individually, use multiple robots`meta` tags:

```
<meta name="googlebot" content="notranslate">
<meta name="googlebot-news" content="nosnippet">
```

To block indexing of non-HTML resources, such as PDF files, video files, or image files, use the
[`X-Robots-Tag` response header](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag) instead.

## Using the `X-Robots-Tag` HTTP header

The `X-Robots-Tag` can be used as an element of the HTTP header response for a given
URL. Any rule that can be used in a robots`meta` tag can
also be specified as an `X-Robots-Tag`. Here's an example of an HTTP response with an
`X-Robots-Tag` instructing crawlers not to index a page:

```
HTTP/1.1 200 OK
Date: Tue, 25 May 2010 21:42:43 GMT
(…)
X-Robots-Tag: noindex
(…)
```

Multiple `X-Robots-Tag` headers can be combined within the HTTP
response, or you can specify a comma-separated list of rules. Here's an example of an
HTTP header response which has a `noimageindex``X-Robots-Tag` combined with an
`unavailable_after``X-Robots-Tag`.


```
HTTP/1.1 200 OK
Date: Tue, 25 May 2010 21:42:43 GMT
(…)
X-Robots-Tag: noimageindex
X-Robots-Tag: unavailable_after: 25 Jun 2010 15:00:00 PST
(…)
```

The `X-Robots-Tag` may optionally specify a user agent before the
rules. For instance, the following set of `X-Robots-Tag` HTTP
headers can be used to conditionally allow showing of a page in search results for different
search engines:


```
HTTP/1.1 200 OK
Date: Tue, 25 May 2010 21:42:43 GMT
(…)
X-Robots-Tag: googlebot: nofollow
X-Robots-Tag: otherbot: noindex, nofollow
(…)
```

Rules specified without a user agent are valid for all crawlers. The HTTP header, the
user agent name, and the specified values are not case sensitive.


## Valid indexing and serving rules

The following rules, also available in
[machine-readable format](https://developers.google.com/static/search/apis/ipranges/robots-tags.json), can be used to
control indexing and serving of a [snippet](https://developers.google.com/search/docs/appearance/snippet) with
the robots`meta` tag and the `X-Robots-Tag`. Each value represents a specific
rule. [Multiple rules may be combined](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combined) in a comma-separated
list or in separate `meta` tags. These rules are case-insensitive.


| Rules |
| ### `all` | There are no restrictions for indexing or serving. This rule is the default value and<br> has no effect if explicitly listed. |
| ### `noindex` | Do not show this page, media, or resource in search results. If you don't specify this<br>rule, the page, media, or resource may be indexed and shown in search results.<br> <br>To remove information from Google, follow our<br>[step-by-step guide](https://developers.google.com/search/docs/crawling-indexing/remove-information). |
| ### `nofollow` | Do not follow the links on this page. If you don't specify this rule, Google may use<br> the links on the page to discover those linked pages. Learn more about<br> [`nofollow`](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links). |
| ### `none` | Equivalent to `noindex, nofollow`. |
| ### `nosnippet` | Do not show a text snippet or video preview in the search results for this page. A<br>static image thumbnail (if available) may still be visible, when it results in a better<br>user experience. This applies to all forms of search results (at Google: web search,<br>Google Images, Discover, AI Overviews, AI Mode) and<br>will also prevent the content from being used as a direct input for AI Overviews and AI Mode.<br> <br>If you don't specify this rule, Google may generate a text snippet and video<br>preview based on information found on the page.<br> <br>To exclude certain sections of your content from appearing in search result snippets,<br>use the [`data-nosnippet`\<br>HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr). |
| ### `indexifembedded` | Google is allowed to index the content of a page if it's embedded in another page<br>through<br>[`iframes`](https://developer.mozilla.org/docs/Web/HTML/Element/iframe)<br>or similar HTML tags, in spite of a `noindex` rule.<br> <br>`indexifembedded` only has an effect if it's accompanied by<br>`noindex`. |
| ### `max-snippet:` \[number\] | Use a maximum of \[number\] characters as a textual snippet for this search result. (Note<br>that a URL may appear as multiple search results within a search results page.) This<br>does not affect image or video previews. This applies to all forms of search results<br>(such as Google web search, Google Images, Discover, Assistant, AI Overviews, AI Mode) and<br>will also limit how much of the content may be used as a direct input for AI Overviews and AI Mode.<br>However, this limit<br>does not apply in cases where a publisher has separately granted permission for use of<br>content. For instance, if the publisher supplies content in the form of in-page<br>structured data or has a license agreement with Google, this setting does not interrupt<br>those more specific permitted uses. This rule is ignored if no parseable \[number\]<br>is specified.<br> <br>If you don't specify this rule, Google will choose the length of the snippet.<br> <br>Special values:<br>- `0`: No snippet is to be shown. Equivalent to<br>   `nosnippet`.<br>   <br>- `-1`: Google will choose the snippet length that it<br>   believes is most effective to help users discover your content and direct users to<br>   your site.<br>   <br>Examples:<br>To stop a snippet from displaying in search results:<br>```<br><meta name="robots" content="max-snippet:0"><br>```<br>To allow up to 20 characters to be shown in the snippet:<br>```<br><meta name="robots" content="max-snippet:20"><br>```<br>To specify that there's no limit on the number of characters that can be shown in the<br>snippet:<br> <br>```<br><meta name="robots" content="max-snippet:-1"><br>``` |
| ### `max-image-preview:` \[setting\] | Set the maximum size of an image preview for this page in search results.<br>If you don't specify the `max-image-preview` rule, Google may show an<br>image preview of the default size.<br> <br>Accepted \[setting\] values:<br>- `none`: No image preview is to be shown.<br>   <br>- `standard`: A default image preview may be shown.<br>   <br>- `large`: A larger image preview, up to the width of the<br>   viewport, may be shown.<br>   <br>This applies to all forms of search results (such as Google web search, Google Images,<br>Discover, Assistant). However, this limit does not apply in cases where a publisher has<br>separately granted permission for use of content. For instance, if the publisher<br>supplies content in the form of in-page structured data (such as AMP and canonical<br>versions of an article) or has a license agreement with Google, this setting will not<br>interrupt those more specific permitted uses.<br> <br>If you don't want Google to use larger thumbnail images when their AMP pages<br>and canonical version of an article are shown in Search or Discover, specify a<br>`max-image-preview` value of<br>`standard` or `none`.<br> <br>Example:<br>```<br><meta name="robots" content="max-image-preview:standard"><br>``` |
| ### `max-video-preview:` \[number\] | Use a maximum of \[number\] seconds as a video snippet for videos on this page in search<br>results.<br> <br>If you don't specify the `max-video-preview` rule, Google may show a<br>video snippet in search results, and you leave it up to Google to decide how long the<br>preview may be.<br> <br>Special values:<br>- `0`: At most, a static image may be used, in accordance to<br>   the `max-image-preview` setting.<br>- `-1`: There is no limit.<br>This applies to all forms of search results (at Google: web search, Google Images,<br>Google Videos, Discover, Assistant). This rule is ignored if no parseable \[number\]<br>is specified.<br>Example:<br>```<br><meta name="robots" content="max-video-preview:-1"><br>``` |
| ### `notranslate` | Don't offer translation of this page in search results. If you don't specify this<br> rule, Google may provide a<br> [translation of the title link and snippet](https://developers.google.com/search/docs/appearance/translated-results)<br> of a search result for results that aren't in the language<br> of the search query. If the user clicks the translated title link, all further user<br> interaction with the page is through Google Translate, which will automatically translate<br> any links followed. |
| ### `noimageindex` | Do not index images on this page. If you don't specify this value, images on the page<br> may be indexed and shown in search results. |
| ### `unavailable_after:` \[date/time\] | Do not show this page in search results after the specified date/time. The date/time<br>must be specified in a widely adopted format including, but not limited to<br>[RFC 822](https://www.ietf.org/rfc/rfc0822.txt),<br>[RFC 850](https://www.ietf.org/rfc/rfc0850.txt), and<br>[ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html).<br>The rule is ignored if no valid date/time is specified. By default there is no<br>expiration date for content.<br> <br>If you don't specify this rule, this page may be shown in search results<br>indefinitely. Googlebot will decrease the crawl rate of the URL considerably after the specified<br>date and time.<br> <br>Example:<br>```<br><meta name="robots" content="unavailable_after: 2020-09-21"><br>``` |

**Reference of historical and other unused rules**

The following rules aren't used by Google Search and are ignored. We're
including these rules here because people have often asked about them or we used them in the
past.


| List of historical and other unused rules |
| --- |
| ### `noarchive` | The `noarchive` rule is no longer used by Google Search to control whether a<br> cached link is shown in search results, as the cached link feature no longer exists. |
| ### `nocache` | The `nocache` rule isn't used by Google Search. |
| ### `nositelinkssearchbox` | The `nositelinkssearchbox` rule is no longer used by Google Search to<br>control whether the sitelink search box is shown for a given page, as the<br>feature no longer exists. |

## Handling combined indexing and serving rules

You can create a multi-rule instruction by combining robots`meta`
tag rules with commas or by using multiple `meta` tags. Here is an example of a robots`meta` tag that instructs web crawlers to not index the
page and to not crawl any of the links on the page:

[Comma-separated list](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#comma-separated-list)[Multiple `meta` tags](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#multiple-meta-tags)More

```
<meta name="robots" content="noindex, nofollow">
```

```
<meta name="robots" content="noindex">
<meta name="robots" content="nofollow">
```

Here is an example that limits the text snippet to 20 characters, and allows a large image
preview:


```
<meta name="robots" content="max-snippet:20, max-image-preview:large">
```

For situations where multiple crawlers are specified along with different rules, the
search engine will use the sum of the negative rules. For example:

```
<meta name="robots" content="nofollow">
<meta name="googlebot" content="noindex">
```

The page containing these `meta` tags will be interpreted as having a
`noindex, nofollow` rule when crawled by Googlebot.


## Using the `data-nosnippet` HTML attribute

You can designate textual parts of an HTML page not to be used as a snippet. This can be done
on an HTML-element level with the `data-nosnippet` HTML attribute on
`span`, `div`, and
`section` elements. The `data-nosnippet`
is considered a
[boolean attribute](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes).
As with all boolean attributes, any value specified is ignored. To ensure machine-readability,
the HTML section must be valid HTML and all appropriate tags must be closed accordingly.


Examples:

```
<p>This text can be shown in a snippet
<span data-nosnippet>and this part would not be shown</span>.</p>

<div data-nosnippet>not in snippet</div>
<div data-nosnippet="true">also not in snippet</div>
<div data-nosnippet="false">also not in snippet</div>
<!-- all values are ignored -->

<div data-nosnippet>some text</html>
<!-- unclosed "div" will include all content afterwards -->

<mytag data-nosnippet>some text</mytag>
<!-- NOT VALID: not a span, div, or section -->

<p>This text can be shown in a snippet.</p>
<div data-nosnippet>
<p>However, this is not in snippet.</p>
<ul>
  <li>Stuff not in snippet</li>
  <li>More stuff not in snippet</li>
</ul>
</div>
```

Google typically renders pages in order to index them, however rendering is not guaranteed.
Because of this, extraction of `data-nosnippet` may happen both
before and after rendering. To avoid uncertainty from rendering, do not add or remove the
`data-nosnippet` attribute of existing nodes through JavaScript.
When adding DOM elements through JavaScript, include the
`data-nosnippet` attribute as necessary when initially adding the
element to the page's DOM. If custom elements are used, wrap or render them with
`div`, `span`, or
`section` elements if you need to use
`data-nosnippet`.


## Using structured data

Robots`meta` tags govern the amount of content that Google extracts automatically from web
pages for display as search results. But many publishers also use schema.org structured data
to make specific information available for
[search presentation](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data). Robots`meta` tag
limitations don't affect the use of that structured data, with the exception of
`article.description` and the
`description` values for structured data specified for other
creative works. To specify the maximum length of a preview based on these
`description` values, use the
`max-snippet` rule. For example,
`recipe` structured data on a page is eligible for inclusion in the
recipe carousel, even if the text preview would otherwise be limited. You can limit the length
of a text preview with `max-snippet`, but that robots`meta` tag
doesn't apply when the information is provided using structured data for rich results.


To manage the use of structured data for your web pages, modify the structured data types and
values themselves, adding or removing information in order to provide only the data you want
to make available. Also note that structured data remains usable for search results when
declared within a `data-nosnippet` element.


## Practical implementation of `X-Robots-Tag`

You can add the `X-Robots-Tag` to a site's HTTP responses through
the configuration files of your site's web server software. For example, on Apache-based web
servers you can use .htaccess and httpd.conf files. The benefit of using an
`X-Robots-Tag` with HTTP responses is that you can specify crawling
rules that are applied globally across a site. The support of regular expressions allows
a high level of flexibility.


For example, to add a `noindex, nofollow``X-Robots-Tag` to the HTTP response for all `.PDF` files across an
entire site, add the following snippet to the site's root `.htaccess` file or `httpd.conf` file on
Apache, or the site's `.conf` file on NGINX.


[Apache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#apache)[NGINX](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nginx)More

```
<Files ~ "\.pdf$">
Header set X-Robots-Tag "noindex, nofollow"
</Files>
```

```
location ~* \.pdf$ {
add_header X-Robots-Tag "noindex, nofollow";
}
```

You can use the `X-Robots-Tag` for non-HTML files like image files
where the usage of robots`meta` tags in HTML is not possible. Here's an example of adding a
`noindex``X-Robots-Tag` rule for
images files (`.png`, `.jpeg`, `.jpg`, `.gif`) across an entire site:


[Apache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#apache)[NGINX](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nginx)More

```
<Files ~ "\.(png|jpe?g|gif)$">
Header set X-Robots-Tag "noindex"
</Files>
```

```
location ~* \.(png|jpe?g|gif)$ {
add_header X-Robots-Tag "noindex";
}
```

You can also set the `X-Robots-Tag` headers for individual static files:


[Apache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#apache)[NGINX](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nginx)More

```
# the htaccess file must be placed in the directory of the matched file.
<Files "unicorn.pdf">
Header set X-Robots-Tag "noindex, nofollow"
</Files>
```

```
location = /secrets/unicorn.pdf {
add_header X-Robots-Tag "noindex, nofollow";
}
```

## Combining robots.txt rules with indexing and serving rules

robots`meta` tags and `X-Robots-Tag` HTTP headers are discovered when
a URL is crawled. If a page is disallowed from crawling through the robots.txt file, then any
information about indexing or serving rules will not be found and will therefore be
ignored. If indexing or serving rules must be followed, the URLs containing those
rules cannot be disallowed from crawling.


Was this helpful?



 Send feedback



Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2026-03-24 UTC.


Need to tell us more?






\[\[\["Easy to understand","easyToUnderstand","thumb-up"\],\["Solved my problem","solvedMyProblem","thumb-up"\],\["Other","otherUp","thumb-up"\]\],\[\["Missing the information I need","missingTheInformationINeed","thumb-down"\],\["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"\],\["Out of date","outOfDate","thumb-down"\],\["Samples / code issue","samplesCodeIssue","thumb-down"\],\["Other","otherDown","thumb-down"\]\],\["Last updated 2026-03-24 UTC."\],\[\],\["The \`robots meta\` tag and \`X-Robots-Tag\` control how search engines index and display content, with page-level and non-HTML resource settings respectively. Rules like \`noindex\`, \`nofollow\`, and \`nosnippet\` dictate visibility and link following. \`data-nosnippet\` excludes specific text from snippets, while \`max-snippet\`, \`max-image-preview\`, and \`max-video-preview\` set limits on snippets, images and video previews. Conflicting rules favor the most restrictive. These methods must be available during the crawling process and aren't affected by the \`robots.txt\` disallow rule.\\n"\]\]



Info


Chat


API


## Page info

bug\_reportfullscreenclose\_fullscreenclose

### On this page

- On this page
- [Using the robots meta tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#robotsmeta)
- [Using the X-Robots-Tag HTTP header](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag)
- [Valid indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives)
  - [all](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#all)
  - [noindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noindex)
  - [nofollow](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nofollow)
  - [none](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#none)
  - [nosnippet](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
  - [indexifembedded](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#indexifembedded)
  - [max-snippet: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
  - [max-image-preview: \[setting\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-image-preview)
  - [max-video-preview: \[number\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-video-preview)
  - [notranslate](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#notranslate)
  - [noimageindex](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noimageindex)
  - [unavailable\_after: \[date/time\]](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#unavailable-after)
  - [Reference of historical and other unused rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#reference-of-historical-and-other-unused-rules)
  - [noarchive](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#noarchive)
  - [nocache](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nocache)
  - [nositelinkssearchbox](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nositelinkssearchbox)
- [Handling combined indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combined)
- [Using the data-nosnippet HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr)
- [Using structured data](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#structureddata)
- [Practical implementation of X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag-implementation)
- [Combining robots.txt rules with indexing and serving rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#combining)
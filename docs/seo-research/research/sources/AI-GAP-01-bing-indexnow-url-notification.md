Source: https://www.bing.com/indexnow/getstarted
Title: How to add IndexNow to your website | Bing Webmaster Tools
Fetched: 2026-10-24T10:43:26.185Z

# Take control of your SEO game with real-time indexing

Don’t wait for crawlers! Elevate your website’s performance and visibility with immediate content updates in multiple search engines.


Why IndexNow?


Your browser does not support the video tag.


### GET STARTED

# How to add IndexNow to your website

Adopting IndexNow is fast and easy and you may already have IndexNow. To check if your website is already publishing your latest URLs (added, modified, deleted)
via IndexNow to search engines, connect to the [Bing Webmaster Tools Portal](https://www.bing.com/webmasters). If not, follow the steps below.


# IndexNow is built into the following Content Management Solutions.

No setup needed. You’re already using IndexNow.

![](https://indexnowvideos.azureedge.net/logos/wix-studio.png)

[Learn More](https://support.wix.com/en/article/how-wix-uses-indexnow-to-inform-search-engines-about-your-site-changes)

![](https://indexnowvideos.azureedge.net/logos/31Duda.png)

[Learn More](https://support.duda.co/hc/en-us/articles/4413233373335-IndexNow)

![](https://indexnowvideos.azureedge.net/logos/GD_LOCKUP_RGB_BW_Correct.svg)

[Learn More](https://www.godaddy.com/websites/website-builder)

![](https://indexnowvideos.azureedge.net/logos/xenforo.png)

[Learn More](https://xenforo.com/docs/xf2/seo#indexnow)

![](https://indexnowvideos.azureedge.net/logos/Milestone%20Logo%20Blue.png)

[Learn More](https://www.milestoneinternet.com/)

![](https://indexnowvideos.azureedge.net/logos/Shopify%20Logo.png)

[Learn More](https://apps.shopify.com/instaindex)

# IndexNow can be enabled in minutes by installing the following third-party plugins\*

# WordPress

- [IndexNow plugin](https://wordpress.org/plugins/indexnow/)
- [Yoast](https://yoast.com/what-is-indexnow/)
- [RankMath](https://rankmath.com/kb/how-to-use-indexnow/)
- [AIOSEO](https://aioseo.com/docs/integrating-with-indexnow-to-instantly-re-index-your-content/)
- [SEOPress](https://www.seopress.org/support/guides/google-indexing-api-with-seopress/#automatically-request-indexing-with-indexnow-api)

# Shopify

- [InstaIndex](https://apps.shopify.com/instaindex)
- [Method #2](https://community.shopify.com/c/technical-q-a/indexnow-org-implementation/m-p/2022539/highlight/true#M124586)
- [Method #3 (Coding required)](https://codepal.ai/code-generator/query/48ZfCRcm/integrate-indexnow-into-shopify)

# Joomla!

- [Aimy Sitemap PRO](https://extensions.joomla.org/extension/aimy-sitemap-pro/)
- [JSitemap](https://extensions.joomla.org/extension/jsitemap/)

# Bitrix24

- [ReIndex (Russian)](https://marketplace.1c-bitrix.ru/solutions/vayti.reindex/)
- [TurboIndex (Russian)](https://marketplace.1c-bitrix.ru/solutions/madmen.indexnow/)

# Drupal

[Learn More](https://www.drupal.org/project/index_now)

# PrestaShop

[Learn More](https://addons.prestashop.com/en/seo-natural-search-engine-optimization/88693-op-art-indexnow-improve-indexability-automatically.html)

# MODX

[Learn More](https://k2studio.pro/blog/post3.html)

# Shopware

[Learn More](https://store.shopware.com/en/fishn32546318596m/bing-index-now.html)

# Opencart

[Learn More](https://www.opencart.com/index.php?route=marketplace/extension/info&extension_id=43538&filter_search=indexnow)

# Typo3

[Learn More](https://packagist.org/packages/jweiland/indexnow)

# Umbraco

[Learn More](https://www.dyfort.com/products/umbraco-indexnow/)

# IndexNow is supported by the following Content Delivery Networks:

For a more managed IndexNow experience, we recommend using one of the above IndexNow Content Management Solutions,
or following the instructions below to utilize an API for integration.

![](https://indexnowvideos.azureedge.net/logos/24CloudFlare.png)

Enable Crawler Hints in your Cloudflare account [Learn More](https://blog.cloudflare.com/cloudflare-now-supports-indexnow/)

# If your website is not currently supported with any of the above systems, follow the simple, four-step process to integrate IndexNow in your website.

1

[Generate API Key](https://www.bing.com/indexnow/getstarted#implementation)

An API key is needed to match the ownership of the domain with submitted URLs.


2

[Host your API key](https://www.bing.com/indexnow/getstarted#implementation)

Host your UTF-8 key file in either the root of your website or
[other location](https://www.indexnow.org/documentation) within your host


3

[Submit URLs](https://www.bing.com/indexnow/getstarted#implementation)

Submit individual or bulk URLs with your key location as your URL parameter.


4

[Verify URLs](https://www.bing.com/indexnow/getstarted#implementation)

Use Bing Webmaster Tools to verify if your URLs are received by search engines.


An API key is needed to match the ownership of the domain with submitted URLs.


e9aeded393ac4a4db3fe94a71cab2239

Generate


**Option 1**: Host your UTF-8 key file at the root of your website: [https://www.example.com/e9aeded393ac4a4db3fe94a71cab2239.txt](https://www.bing.com/indexnow/getstarted#implementation)
This file must contain the key e9aeded393ac4a4db3fe94a71cab2239

**Option 2**: Host one to many UTF-8 encoded text key files in other locations within the same host.


**Note**: If you submit a URL,
you must specify the key file location as keyLocation URLs parameter value: [https://<searchengine>/indexnow?url=http://www.example.com/product.html&key=e9aeded393ac4a4db3fe94a71cab2239&keyLocation=http://www.example.com/myIndexNowKey63638.txt](https://www.bing.com/indexnow/getstarted#implementation)

Submit individual or bulk URLs with your key location as your URL parameter: [Send one URL via an HTTP request](https://www.bing.com/indexnow/getstarted#)

**Submitting a set of URL via an HTTP request**

Request


```
                    POST /IndexNow HTTP/1.1
                    Content-Type: application/json; charset=utf-8
                    Host: api.indexnow.org
                    {
                      "host": "www.example.org",
                      "key": "e9aeded393ac4a4db3fe94a71cab2239",
                      "keyLocation": "https://www.example.org/e9aeded393ac4a4db3fe94a71cab2239.txt",
                      "urlList": [\
                          "https://www.example.org/url1",\
                          "https://www.example.org/folder/url2",\
                          "https://www.example.org/url3"\
                          ]
                    }

```

Response


**HTTP Code**

**Response**

**Reasons**

200

Ok

URL submitted successfully

400

Bad request

Invalid format

403

Forbidden

In case of key not valid (e.g. key not found, file found but key not in the file)

422

Unprocessable Entity

In case of URLs don’t belong to the host or the key is not matching the schema in the protocol

429

Too Many Requests

Too Many Requests (potential Spam)

Use [Bing Webmaster Tools](https://www.bing.com/webmasters) to verify if your URLs are received by search engines.


For more detailed information on integrating IndexNow into your website, please visit our documentation page at [https://www.indexnow.org/documentation](https://www.indexnow.org/documentation).


## FAQs

* * *

I submitted a URL, but I don’t see the URL indexed?

Using IndexNow ensures that search engines are aware of your website changes. Using IndexNow does
not guarantee that web pages will be crawled or indexed by search engines. It may take time for the
change to reflect in search engines.


* * *

I just started using IndexNow, should I publish URLs changed last year?

No, you should publish only URLs changing (added, updated, or deleted) since the time you start to
use IndexNow.


* * *

Does the URLs submitted count on my crawl quota?

Yes, every crawl counts towards your crawl quota. By publishing them to INDEXNOW, you notify
search engines that you care about these URLs, search engines will generally prioritize crawling
these URLs versus other URLs they know.


* * *

More FAQs >>
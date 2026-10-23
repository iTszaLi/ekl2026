const site = new URL("https://www.envodkingdom.net");
const key = "4e627570bb53410eb9cd337da194c444";
const keyLocation = new URL(`/${key}.txt`, site);

const sitemapResponse = await fetch(new URL("/sitemap.xml", site));
if (!sitemapResponse.ok) {
  throw new Error(`Could not fetch the live sitemap: HTTP ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map(([, value]) => value.replaceAll("&amp;", "&").trim())
  .filter(Boolean);

if (urls.length === 0) {
  throw new Error("The live sitemap contains no URLs.");
}

for (const value of urls) {
  if (new URL(value).origin !== site.origin) {
    throw new Error(`Refusing to submit a URL outside ${site.origin}: ${value}`);
  }
}

const keyResponse = await fetch(keyLocation);
const publishedKey = (await keyResponse.text()).trim();
if (!keyResponse.ok || publishedKey !== key) {
  throw new Error(
    `IndexNow key verification failed at ${keyLocation.href}. Deploy the key file before submitting.`,
  );
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: site.hostname,
    key,
    keyLocation: keyLocation.href,
    urlList: urls,
  }),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed: HTTP ${response.status} ${body}`);
}

console.log(`IndexNow accepted ${urls.length} live sitemap URLs (HTTP ${response.status}).`);

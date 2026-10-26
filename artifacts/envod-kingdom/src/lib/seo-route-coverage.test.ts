import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { DOOR_TO_DOOR_META } from "./door-to-door";
import { INDUSTRY_META } from "./industry-data";
import { CONTENT_ROUTES, SITE_URL } from "./seo-config";
import { SERVICE_CATALOG, SERVICE_META } from "./service-data";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = join(packageRoot, "dist", "public");
const sitemapPath = join(publicDir, "sitemap.xml");

function htmlPath(route: string): string {
  const segments = route.split("/").filter(Boolean);
  return join(publicDir, ...segments, "index.html");
}

function assertDiscoverableRoute(route: string, sitemap: string): void {
  const filePath = htmlPath(route);
  assert.ok(existsSync(filePath), `${route} has a prerendered HTML file`);

  const html = readFileSync(filePath, "utf8");
  const canonical = `${SITE_URL}${route}`;
  const canonicalTags = html.match(/<link rel="canonical" href="[^"]+"\s*\/?>/g) ?? [];
  assert.equal(canonicalTags.length, 1, `${route} has one canonical`);
  assert.ok(canonicalTags[0].includes(`href="${canonical}"`), `${route} canonical is self-referencing`);

  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
  assert.ok(robots, `${route} has an explicit robots directive`);
  assert.doesNotMatch(robots, /\bnoindex\b/i, `${route} is not marked noindex`);
  assert.doesNotMatch(robots, /\bnofollow\b/i, `${route} is not marked nofollow`);

  const isArabic = route.startsWith("/ar/");
  assert.match(html, new RegExp(`<html lang="${isArabic ? "ar" : "en"}" dir="${isArabic ? "rtl" : "ltr"}"`), `${route} declares its language and direction`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route} contains one server-rendered H1`);
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `${route} is included in the sitemap`);

  const counterpart = isArabic ? route.slice(3) : `/ar${route}`;
  assert.ok(
    html.includes(`hreflang="${isArabic ? "en-SA" : "ar-SA"}" href="${SITE_URL}${counterpart}"`),
    `${route} links to its bilingual counterpart`,
  );
}

test("every service detail page stays indexable and discoverable in English and Arabic", () => {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const serviceSlugs = SERVICE_CATALOG.map((service) => {
    const slug = SERVICE_META[service.id]?.slug;
    assert.ok(slug, `service ${service.id} has a detail-page slug`);
    return slug;
  });
  serviceSlugs.push(DOOR_TO_DOOR_META.slug);

  for (const slug of serviceSlugs) {
    for (const route of [`/services/${slug}`, `/ar/services/${slug}`]) {
      assert.ok(CONTENT_ROUTES.includes(route), `${route} is registered for prerender`);
      assertDiscoverableRoute(route, sitemap);
    }
  }

  const robots = readFileSync(join(publicDir, "robots.txt"), "utf8");
  for (const agent of ["Googlebot", "*"]) {
    const group = robots
      .split(/\n\s*\n/)
      .find((block) => new RegExp(`^User-agent:\\s*${agent.replace("*", "\\*")}\\s*$`, "im").test(block));
    assert.ok(group, `robots.txt has a ${agent} group`);
    assert.match(group, /^Allow:\s*\/\s*$/im, `${agent} is allowed to crawl the site`);
    assert.doesNotMatch(group, /^Disallow:\s*\/\s*$/im, `${agent} does not block the whole site`);
    assert.doesNotMatch(group, /^Disallow:\s*\/(?:ar\/)?services(?:\/|$)/im, `${agent} has no service-route block`);
  }
  assert.match(robots, new RegExp(`^Sitemap:\\s*${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml$`, "im"));

  const vercel = JSON.parse(readFileSync(join(packageRoot, "vercel.json"), "utf8")) as {
    headers?: Array<{ source?: string; headers?: Array<{ key?: string; value?: string }> }>;
  };
  for (const rule of vercel.headers ?? []) {
    const blocksIndexing = rule.headers?.some(
      (header) => header.key?.toLowerCase() === "x-robots-tag" && /noindex/i.test(header.value ?? ""),
    );
    if (blocksIndexing) {
      assert.match(rule.source ?? "", /^\/admin(?:\/|$)/, "X-Robots-Tag noindex remains limited to admin routes");
    }
  }
  const siteWideHeaders = vercel.headers?.find((rule) => rule.source === "/(.*)")?.headers ?? [];
  assert.equal(
    siteWideHeaders.some((header) => header.key?.toLowerCase() === "x-robots-tag" && /noindex/i.test(header.value ?? "")),
    false,
    "the site-wide Vercel header rule does not hide public service pages",
  );
});

test("every industry detail page has English and Arabic indexable routes", () => {
  const sitemap = readFileSync(sitemapPath, "utf8");
  for (const industry of INDUSTRY_META) {
    for (const route of [`/industries/${industry.slug}`, `/ar/industries/${industry.slug}`]) {
      assert.ok(CONTENT_ROUTES.includes(route), `${route} is registered for prerender`);
      assertDiscoverableRoute(route, sitemap);
    }
  }
});

test("the footer profile badge and About page link to the verified JCtrans company profile in both languages", () => {
  const profileUrl = "https://www.jctrans.com/en/company/07f1r7u/";
  for (const route of ["/about", "/ar/about"]) {
    const html = readFileSync(htmlPath(route), "utf8");
    assert.ok(html.includes(`href="${profileUrl}"`), `${route} links to the verified company profile`);
    assert.ok(html.includes("160391"), `${route} includes the listed JCtrans member identifier`);
    const badgeLink = html.match(/<a\b[^>]*data-testid="footer-jctrans-profile"[^>]*>/)?.[0] ?? "";
    assert.ok(badgeLink.includes(`href="${profileUrl}"`), `${route} footer badge links to the official company profile`);
    assert.ok(badgeLink.includes('target="_blank"'), `${route} footer badge opens the external profile separately`);
    assert.ok(badgeLink.includes('rel="noopener noreferrer"'), `${route} footer badge uses safe external-link attributes`);
  }
});

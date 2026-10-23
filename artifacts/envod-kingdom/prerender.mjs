import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist", "public");
const SERVER_ENTRY = path.join(__dirname, "dist", "server", "entry-server.js");

const { render, getSeoForPath, CONTENT_ROUTES, SITE_URL, OG_IMAGE, toAbsolute } =
  await import(SERVER_ENTRY);
const PRERENDER_ROUTES = [...CONTENT_ROUTES];

const rawTemplate = await readFile(path.join(DIST, "index.html"), "utf-8");

// Build-time security meta tags (production HTML only — dev index.html is
// untouched, so Vite HMR/react-refresh keep working). frame-ancestors and
// X-Frame-Options cannot be expressed via <meta>; Vercel sends it as an HTTP
// header via vercel.json, and Cloudflare Pages can use public/_headers.
const SECURITY_META = [
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://storage.googleapis.com; media-src 'self'; connect-src 'self' https://storage.googleapis.com; frame-src https://maps.google.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" />`,
  `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
].join("\n    ");
if (!rawTemplate.includes("</head>")) {
  throw new Error("prerender: index.html template has no </head> — cannot inject security meta");
}
const template = rawTemplate.replace("</head>", `  ${SECURITY_META}\n  </head>`);

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Escape a JSON-LD payload so it can never break out of its <script> element
// (guards against "</script>", "<!--", etc. appearing in the data).
function jsonLdSafe(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// Replace exactly once, using a function replacement so `$&`/`$'`/`$1` inside
// the replacement string are treated literally. Throws if the pattern is
// missing, so a future Vite/template change can never silently ship an
// un-SEO'd shell.
function replaceOnce(html, pattern, replacement, label) {
  let matched = false;
  const out = html.replace(pattern, () => {
    matched = true;
    return replacement;
  });
  if (!matched) {
    throw new Error(
      `prerender: pattern for "${label}" did not match — did the index.html template change?`,
    );
  }
  return out;
}

function buildHead(seo, canonicalAbs) {
  const image = seo.image ? toAbsolute(seo.image) : OG_IMAGE;
  const tags = [
    `<meta property="og:locale" content="${esc(seo.locale || "en_SA")}" />`,
    `<meta property="og:locale:alternate" content="${esc(seo.alternateLocale || "ar_SA")}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:type" content="${esc(seo.type || "website")}" />`,
    `<meta property="og:url" content="${esc(canonicalAbs)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ];
  if (seo.imageAlt) {
    tags.push(`<meta property="og:image:alt" content="${esc(seo.imageAlt)}" />`);
  }
  for (const obj of seo.jsonLd || []) {
    // Tag with data-seo-ssg so the client useSeo hook can remove exactly these
    // prerendered nodes on mount and avoid duplicate/stale JSON-LD after nav.
    tags.push(
      `<script type="application/ld+json" data-seo-ssg="true">${jsonLdSafe(obj)}</script>`,
    );
  }
  for (const alternate of seo.alternates || []) {
    tags.push(
      `<link rel="alternate" hreflang="${esc(alternate.hreflang)}" href="${esc(alternate.href)}" data-seo-ssg="true" />`,
    );
  }
  return tags.join("\n    ");
}

let count = 0;
for (const route of PRERENDER_ROUTES) {
  const seo = getSeoForPath(route);
  const canonicalPath = seo.canonicalPath || route;
  const canonicalAbs = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_URL}${canonicalPath}`;
  const isArabic = route === "/ar" || route.startsWith("/ar/");
  const appHtml = await render(route);

  let html = template;
  html = replaceOnce(
    html,
    /<html lang="en">/,
    `<html lang="${isArabic ? "ar" : "en"}" dir="${isArabic ? "rtl" : "ltr"}">`,
    "html language and direction",
  );
  html = replaceOnce(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${esc(seo.title)}</title>`,
    "title",
  );
  html = replaceOnce(
    html,
    /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${esc(seo.description)}" />`,
    "description",
  );
  html = replaceOnce(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${esc(canonicalAbs)}" />`,
    "canonical",
  );
  if (seo.robots) {
    html = replaceOnce(
      html,
      /<meta name="robots" content="[^"]*"\s*\/>/,
      `<meta name="robots" content="${esc(seo.robots)}" />`,
      "robots",
    );
  }
  html = replaceOnce(html, "<!--seo-head-->", buildHead(seo, canonicalAbs), "seo-head marker");
  html = replaceOnce(
    html,
    '<div id="root"></div>',
    `<div id="root" data-ssr-path="${esc(route)}">${appHtml}</div>`,
    "root div",
  );

  const outDir = route === "/" ? DIST : path.join(DIST, route);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html, "utf-8");
  count += 1;
}

// Clean SPA shell for browser-side development fallback and the static-host
// fallback. It has no server-rendered appHtml and no
// data-ssr-path, so main.tsx uses createRoot (pure client render) and crawlers
// never see home content/canonical bleeding onto non-content routes. The
// default <title>/description/canonical from index.html stay; client-side
// useSeo overrides them per route after mount.
{
  let shell = replaceOnce(template, "<!--seo-head-->", "", "seo-head marker (spa shell)");
  // Strip the homepage canonical and swap in a neutral brand title/description.
  // Otherwise a no-JS crawler served this shell for /track (or any unknown URL)
  // would see it canonicalize to "/" — i.e. declare itself a duplicate of the
  // homepage / a homepage soft-404. JS crawlers still get the correct per-route
  // title/description/canonical from useSeo after mount.
  shell = replaceOnce(shell, /<link rel="canonical"[^>]*>/, "", "canonical (spa shell)");
  shell = replaceOnce(
    shell,
    /<title>[\s\S]*?<\/title>/,
    `<title>ENVOD KINGDOM Shipping Services LLC</title>`,
    "title (spa shell)",
  );
  shell = replaceOnce(
    shell,
    /<meta name="description" content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="ENVOD KINGDOM Shipping Services LLC — logistics, customs clearance, and freight forwarding across Saudi Arabia and the GCC." />`,
    "description (spa shell)",
  );
  shell = replaceOnce(
    shell,
    /<meta name="robots" content="[^"]*"\s*\/>/,
    '<meta name="robots" content="noindex, nofollow" />',
    "robots (spa shell)",
  );
  await writeFile(path.join(DIST, "spa.html"), shell, "utf-8");
}

// --- Sitemap includes the canonical English/Arabic pairs and their reciprocal
// hreflang annotations. ---
{
  const sitemapMeta = (route) => {
    const englishRoute =
      route === "/ar" || route.startsWith("/ar/") ? route.slice(3) || "/" : route;
    if (englishRoute === "/") return { priority: "1.0", changefreq: "weekly" };
    if (englishRoute === "/services") return { priority: "0.9", changefreq: "monthly" };
    if (englishRoute === "/gallery") return { priority: "0.7", changefreq: "weekly" };
    if (englishRoute === "/about") return { priority: "0.7", changefreq: "monthly" };
    if (englishRoute === "/contact") return { priority: "0.8", changefreq: "monthly" };
    if (englishRoute.startsWith("/privacy") || englishRoute.startsWith("/terms") || englishRoute.startsWith("/cookie")) {
      return { priority: "0.2", changefreq: "yearly" };
    }
    return { priority: "0.8", changefreq: "monthly" };
  };
  const urls = CONTENT_ROUTES.map((route) => {
    const loc = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    const englishRoute =
      route === "/ar" || route.startsWith("/ar/") ? route.slice(3) || "/" : route;
    const englishLoc =
      englishRoute === "/" ? `${SITE_URL}/` : `${SITE_URL}${englishRoute}`;
    const arabicRoute =
      englishRoute === "/" ? "/ar" : `/ar${englishRoute}`;
    const arabicLoc = `${SITE_URL}${arabicRoute}`;
    const { priority, changefreq } = sitemapMeta(route);
    return `  <url>\n    <loc>${esc(loc)}</loc>\n    <xhtml:link rel="alternate" hreflang="en-SA" href="${esc(englishLoc)}" />\n    <xhtml:link rel="alternate" hreflang="ar-SA" href="${esc(arabicLoc)}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(englishLoc)}" />\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, "sitemap.xml"), xml, "utf-8");
}

console.log(
  `✅  Prerendered ${count} routes + spa.html shell + sitemap.xml (${CONTENT_ROUTES.length} urls) to ${DIST}`,
);

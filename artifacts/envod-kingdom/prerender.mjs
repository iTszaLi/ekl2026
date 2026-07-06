import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist", "public");
const SERVER_ENTRY = path.join(__dirname, "dist", "server", "entry-server.js");

const { render, getSeoForPath, CONTENT_ROUTES, SITE_URL, OG_IMAGE, toAbsolute } =
  await import(SERVER_ENTRY);

const rawTemplate = await readFile(path.join(DIST, "index.html"), "utf-8");

// Build-time security meta tags (production HTML only — dev index.html is
// untouched, so Vite HMR/react-refresh keep working). frame-ancestors and
// X-Frame-Options cannot be expressed via <meta>; those are sent as real HTTP
// headers by hosts that support them (see public/_headers for Cloudflare
// Pages) and by the API server for /api responses.
const SECURITY_META = [
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://storage.googleapis.com; media-src 'self'; connect-src 'self' https://storage.googleapis.com; frame-src https://maps.google.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" />`,
  `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
].join("\n    ");
if (!rawTemplate.includes("</head>")) {
  throw new Error("prerender: index.html template has no </head> — cannot inject security meta");
}
const template = rawTemplate.replace("</head>", `  ${SECURITY_META}\n  </head>`);

// --- Guard: the hand-maintained artifact.toml rewrite list must stay in sync
// with CONTENT_ROUTES. Every prerendered content route (except "/", served as
// the root index.html) needs an explicit /foo -> /foo/index.html rewrite before
// the SPA catch-all; otherwise that route falls through to spa.html and ships
// the neutral, non-canonical shell head instead of its prerendered SEO. This
// throws on drift in either direction so a missed edit fails the build loudly. ---
{
  const tomlPath = path.join(__dirname, ".replit-artifact", "artifact.toml");
  const toml = await readFile(tomlPath, "utf-8");
  const rewriteFroms = new Set(
    [...toml.matchAll(/from\s*=\s*"([^"]+)"/g)].map((m) => m[1]),
  );
  const expected = CONTENT_ROUTES.filter((r) => r !== "/");
  const missing = expected.filter((r) => !rewriteFroms.has(r));
  if (missing.length > 0) {
    throw new Error(
      `prerender: artifact.toml is missing rewrites for prerendered routes: ${missing.join(", ")}. ` +
        `Add [[services.production.rewrites]] "${missing[0]}" -> "${missing[0]}/index.html" (and any others) before the "/*" catch-all.`,
    );
  }
  const orphans = [...rewriteFroms].filter((f) => f !== "/*" && !expected.includes(f));
  if (orphans.length > 0) {
    throw new Error(
      `prerender: artifact.toml has rewrites with no matching CONTENT_ROUTES entry: ${orphans.join(", ")}. ` +
        `Remove them or add the route to CONTENT_ROUTES.`,
    );
  }
  if (!rewriteFroms.has("/*")) {
    throw new Error('prerender: artifact.toml is missing the "/*" -> "/spa.html" SPA catch-all rewrite.');
  }
}

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
  return tags.join("\n    ");
}

let count = 0;
for (const route of CONTENT_ROUTES) {
  const seo = getSeoForPath(route);
  const canonicalPath = seo.canonicalPath || route;
  const canonicalAbs = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_URL}${canonicalPath}`;
  const appHtml = render(route);

  let html = template;
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

// Clean SPA shell for the catch-all rewrite (client-routed pages like /track,
// /admin, and any unknown URL). It has no server-rendered appHtml and no
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
  await writeFile(path.join(DIST, "spa.html"), shell, "utf-8");
}

// --- sitemap.xml (generated from CONTENT_ROUTES so it can never drift from the
// set of prerendered pages). Client-only routes like /track and /admin are not
// in CONTENT_ROUTES and are intentionally excluded. No hreflang alternates:
// Arabic is a client-side context toggle (not a distinct crawlable URL), so a
// ?lang=ar "alternate" would serve identical HTML to crawlers. ---
{
  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapMeta = (route) => {
    if (route === "/") return { priority: "1.0", changefreq: "weekly" };
    if (route === "/services") return { priority: "0.9", changefreq: "monthly" };
    if (route === "/gallery") return { priority: "0.7", changefreq: "weekly" };
    if (route === "/about") return { priority: "0.7", changefreq: "monthly" };
    if (route === "/contact") return { priority: "0.8", changefreq: "monthly" };
    return { priority: "0.8", changefreq: "monthly" }; // /services/<detail>
  };
  const urls = CONTENT_ROUTES.map((route) => {
    const loc = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    const { priority, changefreq } = sitemapMeta(route);
    return `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, "sitemap.xml"), xml, "utf-8");
}

console.log(
  `✅  Prerendered ${count} routes + spa.html shell + sitemap.xml (${CONTENT_ROUTES.length} urls) to ${DIST}`,
);

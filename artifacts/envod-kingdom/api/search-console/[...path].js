// server/search-console/vercel-function.ts
import express2 from "express";

// server/search-console/router.ts
import { createHash as createHash2, randomBytes as randomBytes2 } from "node:crypto";
import { fileURLToPath } from "node:url";
import path2 from "node:path";
import express, {
  Router
} from "express";
import { z } from "zod";

// server/search-console/crawler.ts
var ALLOWED_HOSTS = /* @__PURE__ */ new Set(["www.envodkingdom.net", "envodkingdom.net"]);
var AUDIT_AGENT = "EnvodKingdomSEOAudit";
var MAX_URLS = 300;
var MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
var DEFAULT_CRAWL_DELAY_MS = 250;
function decodeHtml(value) {
  return value.replace(
    /&#x([0-9a-f]+);?/gi,
    (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16))
  ).replace(
    /&#([0-9]+);?/g,
    (_match, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10))
  ).replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
}
function stripMarkup(value) {
  return decodeHtml(
    value.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/<!--[\s\S]*?-->/g, " ")
  ).replace(/\s+/g, " ").trim();
}
function attributes(tag) {
  const result = {};
  const source = tag.replace(/^<[^\s>]+|\/?>$/g, "");
  const regex = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(regex)) {
    const key = match[1]?.toLowerCase();
    if (!key || key.startsWith("<")) continue;
    result[key] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}
function getMeta(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.name?.toLowerCase() === name.toLowerCase()) {
      return attrs.content ?? "";
    }
  }
  return "";
}
function getLinkByRel(html, rel) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    const relValues = (attrs.rel ?? "").toLowerCase().split(/\s+/);
    if (relValues.includes(rel.toLowerCase()) && attrs.href) {
      return attrs.href;
    }
  }
  return null;
}
function jsonLdTypes(html) {
  const types = /* @__PURE__ */ new Set();
  for (const match of html.matchAll(
    /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi
  )) {
    try {
      const json = JSON.parse(match[1] ?? "");
      const visit = (value) => {
        if (Array.isArray(value)) {
          for (const child of value) visit(child);
          return;
        }
        if (!value || typeof value !== "object") return;
        const record = value;
        const schemaType = record["@type"];
        if (typeof schemaType === "string") types.add(schemaType);
        if (Array.isArray(schemaType)) {
          for (const type of schemaType) {
            if (typeof type === "string") types.add(type);
          }
        }
        if ("@graph" in record) visit(record["@graph"]);
      };
      visit(json);
    } catch {
      types.add("invalid_json_ld");
    }
  }
  return [...types].sort();
}
function canonicalUrl(value, base) {
  if (!value) return null;
  try {
    return new URL(value, base).href;
  } catch {
    return null;
  }
}
function normalizeInternalUrl(value, base) {
  try {
    const url = new URL(value, base);
    if (!["https:", "http:"].includes(url.protocol) || !ALLOWED_HOSTS.has(url.hostname.toLowerCase()) || url.username || url.password) {
      return null;
    }
    url.hash = "";
    url.search = "";
    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.href;
  } catch {
    return null;
  }
}
function regexFromRobotsPattern(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
  return new RegExp(`^${escaped}`);
}
function robotsGroupApplies(group) {
  return group.agents.includes("*") || group.agents.some((agent) => agent.includes(AUDIT_AGENT.toLowerCase()));
}
function parseRobots(content) {
  const groups = [];
  let current = null;
  let hasRule = false;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0]?.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (!current || hasRule) {
        current = { agents: [], rules: [], crawlDelayMs: null };
        groups.push(current);
        hasRule = false;
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current) continue;
    if (key === "allow" || key === "disallow") {
      if (value) {
        current.rules.push({ allow: key === "allow", pattern: value });
        hasRule = true;
      }
    } else if (key === "crawl-delay") {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds >= 0) {
        current.crawlDelayMs = Math.min(seconds * 1e3, 5e3);
        hasRule = true;
      }
    }
  }
  const matching = groups.filter(robotsGroupApplies);
  const specific = matching.filter(
    (group) => group.agents.some((agent) => agent !== "*")
  );
  const selected = specific.length ? specific : matching;
  const rules = selected.flatMap((group) => group.rules);
  const delays = selected.map((group) => group.crawlDelayMs).filter((delay) => delay !== null);
  return {
    rules,
    crawlDelayMs: delays.length ? Math.max(...delays) : DEFAULT_CRAWL_DELAY_MS
  };
}
function robotsAllows(policy, url) {
  const pathAndQuery = `${url.pathname}${url.search}`;
  let winningRule = null;
  let winningLength = -1;
  for (const rule of policy.rules) {
    if (!regexFromRobotsPattern(rule.pattern).test(pathAndQuery)) continue;
    const length = rule.pattern.replace(/[*$]/g, "").length;
    if (length > winningLength || length === winningLength && rule.allow) {
      winningRule = rule;
      winningLength = length;
    }
  }
  return winningRule?.allow ?? true;
}
async function readLimitedText(response, maximumBytes) {
  if (!response.body) return { text: "", truncated: false };
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    const remaining = maximumBytes - size;
    if (value.byteLength > remaining) {
      if (remaining > 0) chunks.push(value.slice(0, remaining));
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
    size += value.byteLength;
  }
  return {
    text: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString(
      "utf8"
    ),
    truncated
  };
}
async function safeFetch(url, fetchImpl, maximumRedirects = 4) {
  let current = new URL(url.href);
  for (let redirects = 0; redirects <= maximumRedirects; redirects++) {
    const response = await fetchImpl(current.href, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": `${AUDIT_AGENT}/1.0 (+https://www.envodkingdom.net/)`,
        Accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.1"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: current };
    }
    const location = response.headers.get("location");
    if (!location) return { response, finalUrl: current };
    const next = new URL(location, current);
    if (!ALLOWED_HOSTS.has(next.hostname.toLowerCase())) {
      return { response, finalUrl: current };
    }
    current = next;
  }
  throw new Error("redirect_limit");
}
function sitemapLocations(xml) {
  const isIndex = /<sitemapindex\b/i.test(xml);
  const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map((match) => decodeHtml(match[1] ?? "").trim()).filter(Boolean);
  return { isIndex, locations };
}
async function collectSitemapUrls(robotsSitemaps, fetchImpl, notes) {
  const queue = [
    ...robotsSitemaps,
    "https://www.envodkingdom.net/sitemap.xml"
  ];
  const visited = /* @__PURE__ */ new Set();
  const sitemapUrls = [];
  const pageUrls = /* @__PURE__ */ new Set();
  while (queue.length && visited.size < 20 && pageUrls.size < 2e3) {
    const candidate = queue.shift();
    if (!candidate) continue;
    const normalized = normalizeInternalUrl(
      candidate,
      new URL("https://www.envodkingdom.net/")
    );
    if (!normalized || visited.has(normalized)) continue;
    visited.add(normalized);
    try {
      const { response, finalUrl } = await safeFetch(
        new URL(normalized),
        fetchImpl
      );
      if (!response.ok) {
        if (response.status !== 404) {
          notes.push(`Sitemap returned HTTP ${response.status}: ${normalized}`);
        }
        continue;
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("xml") && !contentType.includes("text/plain")) {
        notes.push(`Sitemap response was not XML: ${normalized}`);
        continue;
      }
      const { text, truncated } = await readLimitedText(
        response,
        MAX_DOCUMENT_BYTES
      );
      if (truncated) {
        notes.push(`Sitemap exceeded the ${MAX_DOCUMENT_BYTES} byte safety limit.`);
        continue;
      }
      sitemapUrls.push(finalUrl.href);
      const { isIndex, locations } = sitemapLocations(text);
      for (const location of locations) {
        const internal = normalizeInternalUrl(
          location,
          finalUrl
        );
        if (!internal) continue;
        if (isIndex || /\.xml(?:$|\?)/i.test(new URL(internal).pathname)) {
          if (!visited.has(internal) && queue.length < 20) queue.push(internal);
        } else {
          pageUrls.add(internal);
        }
        if (pageUrls.size >= 2e3) break;
      }
    } catch {
      notes.push(`Sitemap could not be fetched: ${normalized}`);
    }
  }
  return { sitemapUrls: [...new Set(sitemapUrls)], pageUrls: [...pageUrls] };
}
function extractPage(html, url, status, truncated) {
  const title = stripMarkup(
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? ""
  );
  const description = getMeta(html, "description").trim();
  const canonical = canonicalUrl(getLinkByRel(html, "canonical"), url);
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)].map((match) => stripMarkup(match[1] ?? "")).filter(Boolean);
  const language = html.match(/<html\b[^>]*>/i) ? attributes(html.match(/<html\b[^>]*>/i)[0]).lang ?? null : null;
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const direction = attributes(htmlTag).dir ?? null;
  const hreflang = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if ((attrs.rel ?? "").toLowerCase().split(/\s+/).includes("alternate") && attrs.hreflang && attrs.href) {
      const href = canonicalUrl(attrs.href, url);
      if (href) hreflang.push({ language: attrs.hreflang, url: href });
    }
  }
  let imageCount = 0;
  let imagesMissingAlt = 0;
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    imageCount++;
    const attrs = attributes(match[0]);
    if (!attrs.alt?.trim()) imagesMissingAlt++;
  }
  const internalLinks = /* @__PURE__ */ new Set();
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attributes(match[0]).href;
    if (!href) continue;
    const normalized = normalizeInternalUrl(href, url);
    if (normalized) internalLinks.add(normalized);
  }
  const visibleText = stripMarkup(
    html.replace(/<(nav|footer|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
  );
  const wordCount = visibleText.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return {
    page: {
      url: url.href,
      status,
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      canonical,
      robots: getMeta(html, "robots") || getMeta(html, "googlebot") || null,
      language,
      direction,
      h1,
      hreflang,
      internalLinks: internalLinks.size,
      imageCount,
      imagesMissingAlt,
      structuredDataTypes: jsonLdTypes(html),
      wordCount,
      error: truncated ? "HTML exceeded the 2 MB inspection limit; content was partially inspected." : null
    },
    internalLinks: [...internalLinks]
  };
}
async function fetchRobots(fetchImpl, notes) {
  const url = "https://www.envodkingdom.net/robots.txt";
  try {
    const { response } = await safeFetch(new URL(url), fetchImpl);
    if (response.status === 404) {
      notes.push("robots.txt returned 404; no robots directives were found.");
      return {
        url,
        policy: { rules: [], crawlDelayMs: DEFAULT_CRAWL_DELAY_MS },
        allowsCrawl: true,
        sitemapUrls: []
      };
    }
    if (!response.ok) {
      notes.push(`robots.txt could not be read (HTTP ${response.status}); crawl stopped.`);
      return {
        url,
        policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5e3 },
        allowsCrawl: false,
        sitemapUrls: []
      };
    }
    const { text, truncated } = await readLimitedText(response, 256 * 1024);
    if (truncated) {
      notes.push("robots.txt exceeded the safety limit; crawl stopped.");
      return {
        url,
        policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5e3 },
        allowsCrawl: false,
        sitemapUrls: []
      };
    }
    const sitemapUrls = [...text.matchAll(/^sitemap\s*:\s*(\S+)/gim)].map((match) => match[1] ?? "").filter(Boolean);
    const policy = parseRobots(text);
    return {
      url,
      policy,
      allowsCrawl: robotsAllows(policy, new URL("https://www.envodkingdom.net/")),
      sitemapUrls
    };
  } catch {
    notes.push("robots.txt could not be fetched; crawl stopped.");
    return {
      url,
      policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5e3 },
      allowsCrawl: false,
      sitemapUrls: []
    };
  }
}
async function sleep(ms) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
async function crawlEnvodKingdom(options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const startedAt = new Date(now()).toISOString();
  const notes = [
    "Read-only public-site crawl. No page content was changed and no indexing request was sent."
  ];
  const robots = await fetchRobots(fetchImpl, notes);
  const sitemap = await collectSitemapUrls(
    robots.sitemapUrls,
    fetchImpl,
    notes
  );
  const rootUrl = "https://www.envodkingdom.net/";
  const discovered = /* @__PURE__ */ new Set([rootUrl, ...sitemap.pageUrls]);
  const cap = Math.max(1, Math.min(options.maxUrls ?? MAX_URLS, MAX_URLS));
  const queue = [...discovered].filter(
    (candidate) => robotsAllows(robots.policy, new URL(candidate))
  ).slice(0, cap);
  const pagesByUrl = /* @__PURE__ */ new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      const index = cursor++;
      const candidate = queue[index];
      if (!candidate || pagesByUrl.has(candidate)) continue;
      await sleep(robots.policy.crawlDelayMs);
      try {
        const { response, finalUrl } = await safeFetch(
          new URL(candidate),
          fetchImpl
        );
        const type = response.headers.get("content-type") ?? "";
        if (!type.toLowerCase().includes("html")) {
          pagesByUrl.set(candidate, {
            url: candidate,
            status: response.status,
            title: "",
            titleLength: 0,
            description: "",
            descriptionLength: 0,
            canonical: null,
            robots: null,
            language: null,
            direction: null,
            h1: [],
            hreflang: [],
            internalLinks: 0,
            imageCount: 0,
            imagesMissingAlt: 0,
            structuredDataTypes: [],
            wordCount: 0,
            error: response.ok ? "non_html_content" : null
          });
          continue;
        }
        const { text, truncated } = await readLimitedText(
          response,
          MAX_DOCUMENT_BYTES
        );
        const parsed = extractPage(
          text,
          finalUrl,
          response.status,
          truncated
        );
        pagesByUrl.set(candidate, parsed.page);
        for (const linked of parsed.internalLinks) {
          if (discovered.has(linked)) continue;
          discovered.add(linked);
          const linkedUrl = new URL(linked);
          if (queue.length < cap && robotsAllows(robots.policy, linkedUrl)) {
            queue.push(linked);
          }
        }
      } catch {
        pagesByUrl.set(candidate, {
          url: candidate,
          status: null,
          title: "",
          titleLength: 0,
          description: "",
          descriptionLength: 0,
          canonical: null,
          robots: null,
          language: null,
          direction: null,
          h1: [],
          hreflang: [],
          internalLinks: 0,
          imageCount: 0,
          imagesMissingAlt: 0,
          structuredDataTypes: [],
          wordCount: 0,
          error: "page_fetch_failed"
        });
      }
    }
  }
  await Promise.all([worker(), worker()]);
  if (discovered.size > cap) {
    notes.push(`Crawl safety cap reached at ${cap} URLs; ${discovered.size - cap} discovered URLs were not crawled.`);
  }
  if (queue.length === 0 && robots.allowsCrawl) {
    notes.push("No URLs were allowed by the current robots.txt directives.");
  }
  return {
    origin: "https://www.envodkingdom.net",
    startedAt,
    completedAt: new Date(now()).toISOString(),
    robotsUrl: robots.url,
    robotsAllowsCrawl: robots.allowsCrawl,
    sitemapUrls: sitemap.sitemapUrls,
    discoveredUrls: discovered.size,
    crawledUrls: pagesByUrl.size,
    pages: [...pagesByUrl.values()].sort((a, b) => a.url.localeCompare(b.url)),
    notes
  };
}

// server/search-console/google-api.ts
var GoogleApiError = class extends Error {
  constructor(status, kind) {
    super("google_api_request_failed");
    this.status = status;
    this.kind = kind;
    this.name = "GoogleApiError";
  }
};
async function jsonOrNull(response) {
  return response.json().catch(() => null);
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function isTokenResponse(value) {
  return isRecord(value) && typeof value.access_token === "string" && typeof value.expires_in === "number" && typeof value.token_type === "string";
}
async function exchangeAuthorizationCode(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const form = new URLSearchParams({
    code: options.code,
    code_verifier: options.codeVerifier,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: options.redirectUri,
    grant_type: "authorization_code"
  });
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15e3)
  });
  const body = await jsonOrNull(response);
  if (!response.ok || !isTokenResponse(body)) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return body;
}
async function refreshGoogleAccessToken(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const form = new URLSearchParams({
    refresh_token: options.refreshToken,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    grant_type: "refresh_token"
  });
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15e3)
  });
  const body = await jsonOrNull(response);
  if (!response.ok || !isTokenResponse(body)) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return body;
}
async function fetchGoogleUserInfo(accessToken, fetchImpl = fetch) {
  const response = await fetchImpl(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15e3)
    }
  );
  const body = await jsonOrNull(response);
  if (!response.ok || !isRecord(body) || typeof body.email !== "string" || body.email_verified !== true) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return { email: body.email, email_verified: true };
}
var SearchConsoleClient = class {
  constructor(fetchImpl = fetch) {
    this.fetchImpl = fetchImpl;
  }
  async listSites(accessToken) {
    const response = await this.fetchImpl(
      "https://searchconsole.googleapis.com/webmasters/v3/sites",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(15e3)
      }
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "search_console");
    }
    const sites = isRecord(body) && Array.isArray(body.siteEntry) ? body.siteEntry : [];
    return sites.flatMap((entry) => {
      if (!isRecord(entry) || typeof entry.siteUrl !== "string" || typeof entry.permissionLevel !== "string") {
        return [];
      }
      return [
        { siteUrl: entry.siteUrl, permissionLevel: entry.permissionLevel }
      ];
    });
  }
  async query(accessToken, siteUrl, query) {
    const response = await this.fetchImpl(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...query,
          searchType: "web",
          aggregationType: "auto",
          rowLimit: Math.min(Math.max(query.rowLimit ?? 25e3, 1), 25e3),
          startRow: Math.max(query.startRow ?? 0, 0)
        }),
        signal: AbortSignal.timeout(2e4)
      }
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "search_console");
    }
    const rows = isRecord(body) && Array.isArray(body.rows) ? body.rows : [];
    return rows.flatMap((row) => {
      if (!isRecord(row) || typeof row.clicks !== "number" || typeof row.impressions !== "number" || typeof row.ctr !== "number" || typeof row.position !== "number") {
        return [];
      }
      return [
        {
          keys: Array.isArray(row.keys) ? row.keys.filter((key) => typeof key === "string") : [],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        }
      ];
    });
  }
  async inspectUrl(accessToken, siteUrl, inspectionUrl) {
    const response = await this.fetchImpl(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl,
          languageCode: "en-US"
        }),
        signal: AbortSignal.timeout(2e4)
      }
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "inspection");
    }
    return body;
  }
};
async function revokeGoogleToken(token, fetchImpl = fetch) {
  const response = await fetchImpl("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
    signal: AbortSignal.timeout(1e4)
  });
  return response.ok || response.status === 400;
}

// server/search-console/security.ts
import { createHmac, timingSafeEqual } from "node:crypto";
var SESSION_COOKIE = "__Host-envod_gsc_admin";
var STATE_COOKIE = "envod_gsc_oauth_state";
var SESSION_TTL_SECONDS = 8 * 60 * 60;
var OAUTH_STATE_TTL_SECONDS = 10 * 60;
function signature(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}
function constantTimeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
function cookieValue(req, name) {
  const header = req.headers.cookie;
  if (!header) return void 0;
  for (const item of header.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) {
      return decodeURIComponent(item.slice(separator + 1).trim());
    }
  }
  return void 0;
}
function isSecureRequest(req) {
  return req.secure || process.env.NODE_ENV === "production";
}
function serializeCookie(name, value, req, options) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    "HttpOnly",
    "SameSite=Lax"
  ];
  if (isSecureRequest(req)) parts.push("Secure");
  return parts.join("; ");
}
function setOAuthStateCookie(req, res, state, verifier, secret, path3, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      state,
      verifier,
      expiresAt: now + OAUTH_STATE_TTL_SECONDS * 1e3
    })
  ).toString("base64url");
  const value = `${payload}.${signature(payload, secret)}`;
  res.append(
    "Set-Cookie",
    serializeCookie(STATE_COOKIE, value, req, {
      maxAge: OAUTH_STATE_TTL_SECONDS,
      path: path3
    })
  );
}
function clearOAuthStateCookie(req, res, path3) {
  res.append(
    "Set-Cookie",
    serializeCookie(STATE_COOKIE, "", req, { maxAge: 0, path: path3 })
  );
}
function getOAuthStateCookie(req, secret, now = Date.now()) {
  if (!secret) return null;
  const value = cookieValue(req, STATE_COOKIE);
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const encodedPayload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  if (!constantTimeEqual(suppliedSignature, signature(encodedPayload, secret))) {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );
    if (!decoded || typeof decoded !== "object") return null;
    const payload = decoded;
    if (typeof payload.state !== "string" || payload.state.length < 32 || typeof payload.verifier !== "string" || payload.verifier.length < 43 || typeof payload.expiresAt !== "number" || !Number.isFinite(payload.expiresAt) || payload.expiresAt <= now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
function setAdminSessionCookie(req, res, email, secret, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      expiresAt: now + SESSION_TTL_SECONDS * 1e3
    })
  ).toString("base64url");
  const value = `${payload}.${signature(payload, secret)}`;
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, value, req, {
      maxAge: SESSION_TTL_SECONDS,
      path: "/"
    })
  );
}
function clearAdminSessionCookie(req, res) {
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, "", req, {
      maxAge: 0,
      path: "/"
    })
  );
}
function getAdminSession(req, secret, allowedEmail, now = Date.now()) {
  if (!secret || !allowedEmail) return null;
  const value = cookieValue(req, SESSION_COOKIE);
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const payload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  if (!constantTimeEqual(suppliedSignature, signature(payload, secret))) {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (!decoded || typeof decoded !== "object") return null;
    const session = decoded;
    if (typeof session.email !== "string" || typeof session.expiresAt !== "number" || !Number.isFinite(session.expiresAt) || session.expiresAt <= now) {
      return null;
    }
    const email = session.email.trim().toLowerCase();
    if (email !== allowedEmail.trim().toLowerCase()) return null;
    return { email, expiresAt: session.expiresAt };
  } catch {
    return null;
  }
}

// server/search-console/store.ts
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes
} from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
function emptySearchConsoleStore() {
  return {
    version: 1,
    refreshToken: null,
    selectedProperty: null,
    lastSyncedAt: null,
    audit: null
  };
}
function encryptionKey(secret) {
  return createHash("sha256").update("ENVOD KINGDOM Search Console store v1\0").update(secret).digest();
}
function validateStore(value) {
  if (!value || typeof value !== "object") {
    throw new Error("search_console_store_invalid");
  }
  const store = value;
  if (store.version !== 1 || store.refreshToken !== null && typeof store.refreshToken !== "string" || store.selectedProperty !== null && typeof store.selectedProperty !== "string" || store.lastSyncedAt !== null && typeof store.lastSyncedAt !== "string" || !("audit" in store)) {
    throw new Error("search_console_store_invalid");
  }
  return store;
}
function encryptSearchConsoleStore(value, secret) {
  if (secret.length < 32) {
    throw new Error("search_console_store_key_too_short");
  }
  const store = validateStore(value);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(store), "utf8"),
    cipher.final()
  ]);
  const envelope = {
    version: 1,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url")
  };
  return JSON.stringify(envelope);
}
function decryptSearchConsoleStore(raw, secret) {
  if (secret.length < 32) {
    throw new Error("search_console_store_key_too_short");
  }
  try {
    const envelope = JSON.parse(raw);
    if (envelope.version !== 1 || typeof envelope.iv !== "string" || typeof envelope.tag !== "string" || typeof envelope.ciphertext !== "string") {
      throw new Error("invalid_envelope");
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(secret),
      Buffer.from(envelope.iv, "base64url")
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64url")),
      decipher.final()
    ]).toString("utf8");
    return validateStore(JSON.parse(plaintext));
  } catch {
    throw new Error("search_console_store_unreadable");
  }
}
var EncryptedSearchConsoleStore = class {
  constructor(filePath, secret) {
    this.filePath = filePath;
    this.secret = secret;
    if (secret.length < 32) {
      throw new Error("search_console_store_key_too_short");
    }
  }
  async read() {
    let raw;
    try {
      raw = await readFile(this.filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        return emptySearchConsoleStore();
      }
      throw error;
    }
    return decryptSearchConsoleStore(raw, this.secret);
  }
  async write(value) {
    const directory = path.dirname(this.filePath);
    await mkdir(directory, { recursive: true, mode: 448 });
    const temporaryPath = `${this.filePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(temporaryPath, encryptSearchConsoleStore(value, this.secret), {
      encoding: "utf8",
      mode: 384,
      flag: "wx"
    });
    await rename(temporaryPath, this.filePath);
  }
  async clear() {
    await rm(this.filePath, { force: true });
  }
};

// server/search-console/router.ts
var SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
var IDENTITY_SCOPES = "openid email";
var MAX_GSC_RANGE_DAYS = 400;
var MAX_INSPECTION_URLS = 10;
var SEARCH_ROW_LIMIT = 25e3;
var AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1e3;
function metricSummary(row) {
  return {
    key: "",
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0
  };
}
function metricRow(row) {
  return {
    key: row.keys?.[0] ?? "",
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position
  };
}
function isEnvodProperty(siteUrl) {
  if (/^sc-domain:envodkingdom\.net$/i.test(siteUrl.trim())) return true;
  try {
    const url = new URL(siteUrl);
    return ["https:", "http:"].includes(url.protocol) && ["envodkingdom.net", "www.envodkingdom.net"].includes(
      url.hostname.toLowerCase()
    ) && !url.username && !url.password;
  } catch {
    return false;
  }
}
function normalizeAdminEmail(value) {
  const email = value?.trim().toLowerCase() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
function getRedirectUri(env, apiPrefix) {
  const callbackPath = `${apiPrefix}/search-console/oauth/callback`;
  const configured = env.GSC_REDIRECT_URI?.trim();
  if (configured) {
    try {
      const uri = new URL(configured);
      if (uri.protocol !== "https:" || uri.pathname !== callbackPath || uri.search || uri.hash || uri.username || uri.password) {
        return null;
      }
      if ((env.VERCEL === "1" || env.NODE_ENV === "production") && uri.origin !== "https://www.envodkingdom.net") {
        return null;
      }
      const developmentDomain = env.REPLIT_DEV_DOMAIN?.trim().toLowerCase();
      if (env.VERCEL !== "1" && env.NODE_ENV !== "production" && developmentDomain && uri.origin !== `https://${developmentDomain}`) {
        return null;
      }
      return uri.href;
    } catch {
      return null;
    }
  }
  const devDomain = env.REPLIT_DEV_DOMAIN?.trim().toLowerCase();
  if (devDomain && /^[a-z0-9.-]+\.replit\.dev$/.test(devDomain)) {
    return `https://${devDomain}${callbackPath}`;
  }
  if (env.NODE_ENV !== "production" && (devDomain === "localhost" || devDomain === "127.0.0.1")) {
    return `http://${devDomain}${callbackPath}`;
  }
  return null;
}
function configuration(env, apiPrefix) {
  const adminEmail = normalizeAdminEmail(env.GSC_ADMIN_EMAIL);
  const sessionSecret = env.SESSION_SECRET?.trim();
  const redirectUri = getRedirectUri(env, apiPrefix);
  const missing = [];
  if (!env.GSC_CLIENT_ID?.trim()) missing.push("GSC_CLIENT_ID");
  if (!env.GSC_CLIENT_SECRET?.trim()) missing.push("GSC_CLIENT_SECRET");
  if (!adminEmail) missing.push("GSC_ADMIN_EMAIL");
  if (!sessionSecret || sessionSecret.length < 32) {
    missing.push("SESSION_SECRET");
  }
  const encryptionSecret = env.GSC_TOKEN_ENCRYPTION_KEY?.trim();
  if (!encryptionSecret || encryptionSecret.length < 32) {
    missing.push("GSC_TOKEN_ENCRYPTION_KEY");
  }
  if (env.VERCEL === "1" && !env.BLOB_READ_WRITE_TOKEN?.trim()) {
    missing.push("BLOB_READ_WRITE_TOKEN");
  }
  if (!redirectUri) missing.push("GSC_REDIRECT_URI");
  return {
    configured: missing.length === 0,
    missing,
    clientId: env.GSC_CLIENT_ID?.trim() ?? "",
    clientSecret: env.GSC_CLIENT_SECRET?.trim() ?? "",
    adminEmail,
    sessionSecret,
    redirectUri
  };
}
function isTrustedMutationOrigin(req, env) {
  const origin = req.get("origin")?.trim();
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || req.get("sec-fetch-site") === "cross-site") {
      return false;
    }
    if (env.VERCEL === "1" || env.NODE_ENV === "production") {
      return parsed.protocol === "https:" && (parsed.origin === "https://www.envodkingdom.net" || parsed.origin === "https://envodkingdom.net");
    }
    return origin === `${req.protocol}://${req.get("host")}`;
  } catch {
    return false;
  }
}
function parseCookiePath(apiPrefix) {
  return `${apiPrefix}/search-console/oauth`;
}
function parseQueryString(value) {
  return typeof value === "string" ? value : null;
}
function validIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) && (/* @__PURE__ */ new Date(`${value}T00:00:00.000Z`)).toISOString().slice(0, 10) === value;
}
function dateDaysBetweenInclusive(start, end) {
  return Math.floor(
    (Date.parse(`${end}T00:00:00.000Z`) - Date.parse(`${start}T00:00:00.000Z`)) / 864e5
  ) + 1;
}
function previousDateRange(start, days) {
  const previousEnd = new Date(
    Date.parse(`${start}T00:00:00.000Z`) - 864e5
  );
  const previousStart = new Date(
    previousEnd.getTime() - (days - 1) * 864e5
  );
  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10)
  };
}
function responseError(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}
function sendProviderError(req, res, error, action) {
  if (error instanceof GoogleApiError) {
    req.log?.warn(
      { providerStatus: error.status, provider: error.kind },
      "Google Search Console request failed"
    );
    if (error.status === 401 || error.status === 400) {
      responseError(
        res,
        401,
        "Google access expired or was declined. Reconnect the authorized account and try again."
      );
      return;
    }
    if (error.status === 403) {
      responseError(
        res,
        403,
        "Google denied this request. Confirm that the Search Console API is enabled and the authorized account can access this property."
      );
      return;
    }
    if (error.status === 429) {
      res.setHeader("Retry-After", "60");
      responseError(
        res,
        503,
        "Google is rate-limiting requests. Wait a little, then retry."
      );
      return;
    }
  } else {
    req.log?.error(
      { action },
      "Search Console operation failed without safe provider details"
    );
  }
  responseError(
    res,
    502,
    action === "inspection" ? "URL Inspection could not complete. Retry later; no indexing request was sent." : "Google Search Console could not complete the request. Please retry later."
  );
}
function createRateLimiter(options) {
  const buckets = /* @__PURE__ */ new Map();
  let nextCleanup = 0;
  return (req, res, next) => {
    const time = options.now();
    if (time >= nextCleanup) {
      for (const [key2, bucket2] of buckets) {
        if (bucket2.expiresAt <= time) buckets.delete(key2);
      }
      nextCleanup = time + 6e4;
    }
    const key = req.ip ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket || bucket.expiresAt <= time) {
      if (buckets.size >= 5e3 && !bucket) {
        res.setHeader("Retry-After", "60");
        responseError(res, 429, "Too many requests. Please wait and retry.");
        return;
      }
      bucket = { count: 0, expiresAt: time + options.windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= options.limit) {
      res.setHeader(
        "Retry-After",
        String(Math.max(1, Math.ceil((bucket.expiresAt - time) / 1e3)))
      );
      responseError(res, 429, "Too many requests. Please wait and retry.");
      return;
    }
    bucket.count++;
    next();
  };
}
function getInspectionDetails(url, response) {
  const outer = response && typeof response === "object" ? response : {};
  const inspection = outer.inspectionResult && typeof outer.inspectionResult === "object" ? outer.inspectionResult : {};
  const index = inspection.indexStatusResult && typeof inspection.indexStatusResult === "object" ? inspection.indexStatusResult : {};
  const list = (value) => Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
  const stringValue = (value) => typeof value === "string" ? value : null;
  return {
    url,
    verdict: stringValue(index.verdict),
    coverageState: stringValue(index.coverageState),
    indexingState: stringValue(index.indexingState),
    robotsTxtState: stringValue(index.robotsTxtState),
    pageFetchState: stringValue(index.pageFetchState),
    lastCrawlTime: stringValue(index.lastCrawlTime),
    googleCanonical: stringValue(index.googleCanonical),
    userCanonical: stringValue(index.userCanonical),
    referringUrls: list(index.referringUrls),
    sitemaps: list(index.sitemap)
  };
}
function normalizeInspectionUrl(value, property) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || !["envodkingdom.net", "www.envodkingdom.net"].includes(
      url.hostname.toLowerCase()
    ) || url.username || url.password) {
      return null;
    }
    if (!property.startsWith("sc-domain:")) {
      const prefix = new URL(property);
      if (url.hostname.toLowerCase() !== prefix.hostname.toLowerCase() || !url.pathname.startsWith(prefix.pathname)) {
        return null;
      }
    }
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}
function toDashboardResponse(property, startDate, endDate, previousRange, retrievedAt, currentTotal, previousTotal, trend, queryRows, queryPageRows, pageRows, countryRows, deviceRows, appearanceRows) {
  return {
    property,
    startDate,
    endDate,
    previousStartDate: previousRange.startDate,
    previousEndDate: previousRange.endDate,
    retrievedAt,
    current: metricSummary(currentTotal[0]),
    previous: metricSummary(previousTotal[0]),
    timeSeries: trend.map((row) => ({
      ...metricRow(row),
      date: row.keys?.[0] ?? ""
    })),
    queries: queryRows.map(metricRow),
    queryPages: queryPageRows.map((row) => ({
      query: row.keys?.[0] ?? "",
      page: row.keys?.[1] ?? "",
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    })),
    pages: pageRows.map(metricRow),
    countries: countryRows.map(metricRow),
    devices: deviceRows.map(metricRow),
    appearances: appearanceRows.map(metricRow),
    notes: [
      "Google Search Console data can be delayed; the newest dates may be incomplete.",
      "Query rows can omit anonymized searches and are limited to the rows Google returns for this request.",
      "Query-to-page associations come from Google\u2019s query+page dimension and may also be limited by API row limits.",
      "Position is an aggregate Search Console metric for the selected property and date range, not a fixed rank for every searcher."
    ]
  };
}
function isAudit(value, now = Date.now()) {
  if (!!value && typeof value === "object" && Array.isArray(value.pages) && typeof value.completedAt === "string") {
    const completedAt = Date.parse(value.completedAt);
    const age = now - completedAt;
    return Number.isFinite(completedAt) && age >= 0 && age < AUDIT_RETENTION_MS;
  }
  return false;
}
function createSearchConsoleRouter(options) {
  const router = Router();
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const basePath = options.basePath ?? "";
  const authConfig = () => configuration(env, options.apiPrefix);
  const oauthCookiePath = parseCookiePath(options.apiPrefix);
  const accessCache = { current: null };
  const dashboardCache = /* @__PURE__ */ new Map();
  let lastCrawlStartedAt = 0;
  let inFlightCrawl = null;
  const serverDirectory = path2.dirname(fileURLToPath(import.meta.url));
  const storePath = options.storeFilePath ?? path2.resolve(serverDirectory, "..", "..", ".private-data", "gsc.enc");
  let store;
  const getStore = () => {
    if (store !== void 0) return store;
    if (options.storeFactory) {
      store = options.storeFactory(env);
      return store;
    }
    if (env.VERCEL === "1") {
      store = null;
      return store;
    }
    const secret = env.GSC_TOKEN_ENCRYPTION_KEY?.trim();
    if (!secret || secret.length < 32) {
      store = null;
      return store;
    }
    store = new EncryptedSearchConsoleStore(storePath, secret);
    return store;
  };
  const requireAdmin = (req, res, next) => {
    const config2 = authConfig();
    const session = getAdminSession(
      req,
      config2.sessionSecret,
      config2.adminEmail ?? void 0,
      now()
    );
    if (!config2.configured || !session) {
      responseError(res, 401, "Sign in with the authorized ENVOD administrator account to continue.");
      return;
    }
    res.locals.adminEmail = session.email;
    next();
  };
  const requireSameOrigin = (req, res, next) => {
    if (!isTrustedMutationOrigin(req, env)) {
      responseError(res, 403, "This request must come from the ENVOD KINGDOM site.");
      return;
    }
    next();
  };
  const requireConnection = async (req, res) => {
    const storage = getStore();
    if (!storage) {
      responseError(res, 503, "Search Console storage is not configured. Add the required server-side settings first.");
      return null;
    }
    const connection = await storage.read();
    if (!connection.refreshToken) {
      responseError(res, 409, "Connect the authorized Google Search Console account first.");
      return null;
    }
    const token = await accessToken();
    return { connection, token };
  };
  async function accessToken() {
    const config2 = authConfig();
    if (!config2.configured || !config2.clientId || !config2.clientSecret) {
      throw new Error("search_console_not_configured");
    }
    if (accessCache.current && accessCache.current.expiresAt > now() + 6e4) {
      return accessCache.current.value;
    }
    const storage = getStore();
    if (!storage) throw new Error("search_console_not_configured");
    const connection = await storage.read();
    if (!connection.refreshToken) {
      throw new Error("search_console_not_connected");
    }
    const refreshed = await refreshGoogleAccessToken({
      refreshToken: connection.refreshToken,
      clientId: config2.clientId,
      clientSecret: config2.clientSecret,
      fetchImpl
    });
    accessCache.current = {
      value: refreshed.access_token,
      expiresAt: now() + Math.max(60, refreshed.expires_in) * 1e3
    };
    return refreshed.access_token;
  }
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });
  router.use(express.json({ limit: "64kb", strict: true }));
  router.get("/session", async (req, res) => {
    const config2 = authConfig();
    const session = getAdminSession(
      req,
      config2.sessionSecret,
      config2.adminEmail ?? void 0,
      now()
    );
    if (!config2.configured) {
      res.json({
        configured: false,
        authenticated: false,
        connected: false,
        selectedProperty: null,
        lastSyncedAt: null,
        setupMessage: "The private dashboard needs server-side Google OAuth settings, the authorized administrator, and encrypted persistent storage."
      });
      return;
    }
    if (!session) {
      res.json({
        configured: true,
        authenticated: false,
        connected: false,
        selectedProperty: null,
        lastSyncedAt: null
      });
      return;
    }
    try {
      const storage = getStore();
      const connection = storage ? await storage.read() : emptySearchConsoleStore();
      res.json({
        configured: true,
        authenticated: true,
        connected: Boolean(connection.refreshToken),
        selectedProperty: connection.selectedProperty,
        lastSyncedAt: connection.lastSyncedAt
      });
    } catch {
      req.log?.error("Search Console connection state could not be read");
      responseError(res, 503, "The private connection record could not be read.");
    }
  });
  router.get(
    "/oauth/start",
    createRateLimiter({ limit: 10, windowMs: 15 * 6e4, now }),
    (req, res) => {
      const config2 = authConfig();
      if (!config2.configured || !config2.redirectUri) {
        responseError(
          res,
          503,
          "Google OAuth is not configured. Set the OAuth client, administrator, encryption, storage, and matching redirect URI in the deployment environment."
        );
        return;
      }
      const state = randomBytes2(32).toString("base64url");
      const verifier = randomBytes2(48).toString("base64url");
      const challenge = createHash2("sha256").update(verifier).digest("base64url");
      setOAuthStateCookie(
        req,
        res,
        state,
        verifier,
        config2.sessionSecret ?? "",
        oauthCookiePath,
        now()
      );
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.search = new URLSearchParams({
        client_id: config2.clientId,
        redirect_uri: config2.redirectUri,
        response_type: "code",
        scope: `${IDENTITY_SCOPES} ${SEARCH_CONSOLE_SCOPE}`,
        access_type: "offline",
        prompt: "consent",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256"
      }).toString();
      res.redirect(302, authUrl.href);
    }
  );
  router.get("/oauth/callback", async (req, res) => {
    const config2 = authConfig();
    const state = parseQueryString(req.query.state);
    const providerError = parseQueryString(req.query.error);
    const code = parseQueryString(req.query.code);
    const pendingState = getOAuthStateCookie(
      req,
      config2.sessionSecret,
      now()
    );
    clearOAuthStateCookie(req, res, oauthCookiePath);
    if (providerError) {
      res.redirect(`${basePath}/admin/search-console?oauth=cancelled`);
      return;
    }
    const pending = state && pendingState?.state === state ? pendingState : null;
    if (!state || !pending || !code || code.length > 4096 || !config2.configured || !config2.redirectUri || !config2.clientId || !config2.clientSecret || !config2.adminEmail) {
      responseError(res, 400, "Google sign-in could not be verified. Start the connection again.");
      return;
    }
    try {
      const tokenResponse = await exchangeAuthorizationCode({
        code,
        codeVerifier: pending.verifier,
        clientId: config2.clientId,
        clientSecret: config2.clientSecret,
        redirectUri: config2.redirectUri,
        fetchImpl
      });
      if (!tokenResponse.scope || !tokenResponse.scope.split(/\s+/).includes(SEARCH_CONSOLE_SCOPE)) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false
        );
        responseError(
          res,
          403,
          "Google did not grant the requested read-only Search Console permission."
        );
        return;
      }
      const googleUser = await fetchGoogleUserInfo(
        tokenResponse.access_token,
        fetchImpl
      );
      if (googleUser.email.trim().toLowerCase() !== config2.adminEmail) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false
        );
        res.redirect(`${basePath}/admin/search-console?oauth=not-authorized`);
        return;
      }
      const storage = getStore();
      if (!storage) {
        responseError(res, 503, "Secure server-side storage is unavailable.");
        return;
      }
      const current = await storage.read();
      const refreshToken = tokenResponse.refresh_token ?? current.refreshToken;
      if (!refreshToken) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false
        );
        responseError(
          res,
          502,
          "Google did not return offline access. Restart sign-in and approve the requested access."
        );
        return;
      }
      await storage.write({
        ...current,
        refreshToken,
        lastSyncedAt: null
      });
      accessCache.current = {
        value: tokenResponse.access_token,
        expiresAt: now() + Math.max(60, tokenResponse.expires_in) * 1e3
      };
      setAdminSessionCookie(
        req,
        res,
        config2.adminEmail,
        config2.sessionSecret ?? "",
        now()
      );
      res.redirect(`${basePath}/admin/search-console?oauth=connected`);
    } catch (error) {
      sendProviderError(req, res, error, "oauth");
    }
  });
  router.post("/logout", requireSameOrigin, (_req, res) => {
    clearAdminSessionCookie(_req, res);
    res.json({ ok: true });
  });
  router.get("/properties", requireAdmin, async (req, res) => {
    try {
      const token = await accessToken();
      const client = new SearchConsoleClient(fetchImpl);
      const sites = await client.listSites(token);
      const properties = sites.filter((site) => isEnvodProperty(site.siteUrl)).map(({ siteUrl, permissionLevel }) => ({ siteUrl, permissionLevel })).sort((a, b) => {
        const aDomain = a.siteUrl.startsWith("sc-domain:");
        const bDomain = b.siteUrl.startsWith("sc-domain:");
        return aDomain === bDomain ? a.siteUrl.localeCompare(b.siteUrl) : aDomain ? -1 : 1;
      });
      res.json({
        properties,
        preferredProperty: properties.find(
          (property) => property.siteUrl.toLowerCase() === "sc-domain:envodkingdom.net"
        )?.siteUrl ?? null
      });
    } catch (error) {
      if (error instanceof Error && error.message === "search_console_not_connected") {
        responseError(res, 409, "Connect the authorized Google account first.");
        return;
      }
      sendProviderError(req, res, error, "oauth");
    }
  });
  router.post(
    "/property",
    requireAdmin,
    requireSameOrigin,
    async (req, res) => {
      const body = z.object({ siteUrl: z.string().trim().min(1).max(500) }).safeParse(req.body);
      if (!body.success) {
        responseError(res, 400, "Choose a valid Search Console property.");
        return;
      }
      if (!isEnvodProperty(body.data.siteUrl)) {
        responseError(res, 400, "Only verified ENVOD KINGDOM domain properties can be selected.");
        return;
      }
      try {
        const storedConnection = await getStore()?.read();
        if (!storedConnection?.refreshToken) {
          responseError(res, 409, "Connect the authorized Google account first.");
          return;
        }
        const token = await accessToken();
        const client = new SearchConsoleClient(fetchImpl);
        const sites = await client.listSites(token);
        const property = sites.find(
          (site) => site.siteUrl === body.data.siteUrl
        );
        if (!property) {
          responseError(
            res,
            403,
            "That exact property is not available to the authorized Google account."
          );
          return;
        }
        const storage = getStore();
        if (!storage) {
          responseError(res, 503, "Secure server-side storage is unavailable.");
          return;
        }
        const current = await storage.read();
        await storage.write({
          ...current,
          selectedProperty: property.siteUrl,
          lastSyncedAt: null
        });
        dashboardCache.clear();
        res.json({ ok: true, selectedProperty: property.siteUrl });
      } catch (error) {
        sendProviderError(req, res, error, "oauth");
      }
    }
  );
  router.get(
    "/dashboard",
    requireAdmin,
    createRateLimiter({ limit: 8, windowMs: 5 * 6e4, now }),
    async (req, res) => {
      const startDate = parseQueryString(req.query.startDate);
      const endDate = parseQueryString(req.query.endDate);
      if (!startDate || !endDate || !validIsoDate(startDate) || !validIsoDate(endDate)) {
        responseError(res, 400, "Select valid start and end dates.");
        return;
      }
      const days = dateDaysBetweenInclusive(startDate, endDate);
      const today = new Date(now()).toISOString().slice(0, 10);
      if (days < 1 || days > MAX_GSC_RANGE_DAYS || endDate > today) {
        responseError(res, 400, "The date range must be within the last 400 days and cannot include future dates.");
        return;
      }
      try {
        const connectionInfo = await requireConnection(req, res);
        if (!connectionInfo) return;
        const { connection, token } = connectionInfo;
        if (!connection.selectedProperty) {
          responseError(res, 409, "Select the verified ENVOD KINGDOM property first.");
          return;
        }
        const cacheKey = `${connection.selectedProperty}|${startDate}|${endDate}`;
        const force = req.query.force === "1";
        const cached = dashboardCache.get(cacheKey);
        if (!force && cached && cached.expiresAt > now()) {
          res.json(cached.value);
          return;
        }
        const client = new SearchConsoleClient(fetchImpl);
        const previous = previousDateRange(startDate, days);
        const baseQuery = (from, to, dimensions) => ({
          startDate: from,
          endDate: to,
          ...dimensions ? { dimensions } : {},
          rowLimit: SEARCH_ROW_LIMIT
        });
        const [
          currentTotal,
          previousTotal,
          trend,
          queryRows,
          queryPageRows,
          pageRows,
          countryRows,
          deviceRows,
          appearanceRows
        ] = await Promise.all([
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate)
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(previous.startDate, previous.endDate)
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["date"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["query"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["query", "page"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["page"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["country"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["device"])
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["searchAppearance"])
          )
        ]);
        const retrievedAt = new Date(now()).toISOString();
        const result = toDashboardResponse(
          connection.selectedProperty,
          startDate,
          endDate,
          previous,
          retrievedAt,
          currentTotal,
          previousTotal,
          trend,
          queryRows,
          queryPageRows,
          pageRows,
          countryRows,
          deviceRows,
          appearanceRows
        );
        dashboardCache.set(cacheKey, {
          value: result,
          expiresAt: now() + 5 * 6e4
        });
        await getStore()?.write({
          ...connection,
          lastSyncedAt: retrievedAt
        });
        res.json(result);
      } catch (error) {
        sendProviderError(req, res, error, "analytics");
      }
    }
  );
  router.get("/audit", requireAdmin, async (req, res) => {
    try {
      const storage = getStore();
      const saved = await storage?.read();
      if (!saved?.audit || !isAudit(saved.audit, now())) {
        if (saved?.audit && storage) {
          await storage.write({ ...saved, audit: null });
        }
        responseError(res, 404, "No site crawl has been completed yet.");
        return;
      }
      res.json(saved.audit);
    } catch {
      req.log?.error("Search Console crawl report could not be read");
      responseError(res, 503, "The private crawl report could not be read.");
    }
  });
  router.post(
    "/audit/run",
    requireAdmin,
    requireSameOrigin,
    createRateLimiter({ limit: 2, windowMs: 5 * 6e4, now }),
    async (req, res) => {
      const elapsed = now() - lastCrawlStartedAt;
      if (elapsed < 6e4) {
        res.setHeader("Retry-After", String(Math.ceil((6e4 - elapsed) / 1e3)));
        responseError(res, 429, "A crawl was started recently. Wait one minute before starting another.");
        return;
      }
      const storage = getStore();
      if (!storage) {
        responseError(res, 503, "Secure server-side storage is unavailable.");
        return;
      }
      try {
        if (!inFlightCrawl) {
          lastCrawlStartedAt = now();
          inFlightCrawl = crawlEnvodKingdom({
            fetchImpl,
            now,
            maxUrls: options.maxCrawlUrls
          }).finally(() => {
            inFlightCrawl = null;
          });
        }
        const audit = await inFlightCrawl;
        const current = await storage.read();
        await storage.write({ ...current, audit });
        res.json(audit);
      } catch {
        req.log?.error("Read-only site crawl failed");
        responseError(res, 502, "The site crawl could not complete. Check the public robots and sitemap responses, then retry.");
      }
    }
  );
  router.post(
    "/inspection",
    requireAdmin,
    requireSameOrigin,
    createRateLimiter({ limit: 5, windowMs: 5 * 6e4, now }),
    async (req, res) => {
      const body = z.object({
        urls: z.array(z.string().trim().min(1).max(2e3)).min(1).max(MAX_INSPECTION_URLS)
      }).safeParse(req.body);
      if (!body.success) {
        responseError(res, 400, `Submit between 1 and ${MAX_INSPECTION_URLS} URLs for inspection.`);
        return;
      }
      try {
        const connectionInfo = await requireConnection(req, res);
        if (!connectionInfo) return;
        const { connection, token } = connectionInfo;
        if (!connection.selectedProperty) {
          responseError(res, 409, "Select the verified ENVOD KINGDOM property first.");
          return;
        }
        const urls = body.data.urls.map(
          (url) => normalizeInspectionUrl(url, connection.selectedProperty)
        );
        if (urls.some((url) => !url)) {
          responseError(
            res,
            400,
            "Only URLs inside the selected ENVOD KINGDOM property can be inspected."
          );
          return;
        }
        const client = new SearchConsoleClient(fetchImpl);
        const inspections = [];
        for (const url of urls) {
          try {
            const details = await client.inspectUrl(
              token,
              connection.selectedProperty,
              url
            );
            inspections.push(getInspectionDetails(url, details));
          } catch (error) {
            if (error instanceof GoogleApiError) {
              req.log?.warn(
                { providerStatus: error.status },
                "URL Inspection request failed"
              );
            }
            inspections.push({
              url,
              verdict: null,
              coverageState: null,
              indexingState: null,
              robotsTxtState: null,
              pageFetchState: null,
              lastCrawlTime: null,
              googleCanonical: null,
              userCanonical: null,
              referringUrls: [],
              sitemaps: [],
              error: "Google could not inspect this URL. Retry later."
            });
          }
        }
        res.json({ inspections, indexingRequestsSent: 0 });
      } catch (error) {
        sendProviderError(req, res, error, "inspection");
      }
    }
  );
  router.post(
    "/disconnect",
    requireAdmin,
    requireSameOrigin,
    async (req, res) => {
      const storage = getStore();
      if (!storage) {
        responseError(res, 503, "Secure server-side storage is unavailable.");
        return;
      }
      try {
        const connection = await storage.read();
        let revocationConfirmed = true;
        if (connection.refreshToken) {
          revocationConfirmed = await revokeGoogleToken(
            connection.refreshToken,
            fetchImpl
          ).catch(() => false);
        }
        await storage.clear();
        dashboardCache.clear();
        accessCache.current = null;
        res.json({ ok: true, revocationConfirmed });
      } catch (error) {
        sendProviderError(req, res, error, "disconnect");
      }
    }
  );
  router.use(
    (error, req, res, _next) => {
      const type = error && typeof error === "object" && "type" in error ? String(error.type) : "";
      const status = type === "entity.too.large" ? 413 : type === "entity.parse.failed" ? 400 : 500;
      req.log?.warn({ status }, "Search Console request could not be parsed");
      responseError(
        res,
        status,
        status === 413 ? "The request is too large." : status === 400 ? "The request body is invalid JSON." : "The Search Console request could not be processed."
      );
    }
  );
  return router;
}

// server/search-console/vercel-blob-store.ts
import { del, get, put } from "@vercel/blob";
var STORE_PATH = "envod-private/search-console/connection-v1.enc";
var defaultBlobOperations = { get, put, del };
var EncryptedVercelBlobSearchConsoleStore = class {
  constructor(token, encryptionSecret, blob = defaultBlobOperations) {
    this.token = token;
    this.encryptionSecret = encryptionSecret;
    this.blob = blob;
    if (!token.trim()) throw new Error("search_console_blob_token_missing");
    if (encryptionSecret.trim().length < 32) {
      throw new Error("search_console_store_key_too_short");
    }
  }
  async read() {
    const result = await this.blob.get(STORE_PATH, {
      access: "private",
      token: this.token,
      useCache: false
    });
    if (!result) return emptySearchConsoleStore();
    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("search_console_blob_read_failed");
    }
    const raw = await new Response(result.stream).text();
    return decryptSearchConsoleStore(raw, this.encryptionSecret);
  }
  async write(value) {
    const encrypted = encryptSearchConsoleStore(value, this.encryptionSecret);
    await this.blob.put(STORE_PATH, encrypted, {
      access: "private",
      token: this.token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    });
  }
  async clear() {
    const current = await this.blob.get(STORE_PATH, {
      access: "private",
      token: this.token,
      useCache: false
    });
    if (!current) return;
    await current.stream?.cancel();
    await this.blob.del(STORE_PATH, { token: this.token });
  }
};

// server/search-console/vercel-function.ts
var app = express2();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  "/api/search-console",
  createSearchConsoleRouter({
    apiPrefix: "/api",
    storeFactory: (env) => {
      const blobToken = env.BLOB_READ_WRITE_TOKEN?.trim();
      const encryptionSecret = env.GSC_TOKEN_ENCRYPTION_KEY?.trim();
      if (!blobToken || !encryptionSecret) return null;
      return new EncryptedVercelBlobSearchConsoleStore(
        blobToken,
        encryptionSecret
      );
    }
  })
);
var notFoundHandler = (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(404).json({ error: "search_console_route_not_found" });
};
app.use(notFoundHandler);
var config = {
  api: { bodyParser: false },
  maxDuration: 120
};
var vercel_function_default = app;
export {
  config,
  vercel_function_default as default
};

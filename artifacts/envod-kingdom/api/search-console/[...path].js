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
    sitemapPageUrls: sitemap.pageUrls,
    discoveredUrls: discovered.size,
    crawledUrls: pagesByUrl.size,
    pages: [...pagesByUrl.values()].sort((a, b) => a.url.localeCompare(b.url)),
    notes
  };
}

// src/data/seo-intelligence-research.ts
var researchRegister = {
  "researchDate": "2026-10-24",
  "keywordCandidateRows": 566,
  "sourceRecords": 52,
  "measuredKeywordVolume": false,
  "measuredRank": false,
  "measuredAiCitations": false,
  "services": [
    {
      "priority": "P1",
      "service": "Exhibition & Event Logistics",
      "queryEn": "exhibition logistics company Saudi Arabia",
      "queryAr": "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A",
      "targetUrlEn": "/services/exhibition-logistics",
      "targetUrlAr": "/ar/services/exhibition-logistics",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "International freight; customs documents; ATA enquiries; venue planning; returns",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh fetched KSA provider page plus Arabic/snippet observations",
      "competitorObservation": "Four Winds Saudi event page describes event logistics; SMI has Arabic exhibition content; Khelogix result is snippet-only.",
      "competitorLimitations": "Provider marketing is not rank, endorsement, or proof of ENVOD capability.",
      "competitorNextResearch": "Compare event-specific enquiry requirements and page completeness; do not infer market rank.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "Exhibition & Event Logistics in Saudi Arabia | Four Winds Saudi Arabia",
          "url": "https://www.fourwinds-ksa.com/exhibitions-and-events",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-EN-02-four-winds-exhibitions-events.md"
        },
        {
          "title": "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A",
          "url": "https://www.smilogistics.com/ar/fairs-exhibition-logistics",
          "tier": 3,
          "evidenceMode": "snippet",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-snippets.md"
        },
        {
          "title": "Exhibition Logistics Services in Saudi Arabia | Khelogix",
          "url": "https://khelogix.com/service/exhibition-event-logistics/",
          "tier": 3,
          "evidenceMode": "snippet",
          "evidencePath": "docs/seo-research/research/sources/KSA-EN-snippets.md"
        }
      ]
    },
    {
      "priority": "P2",
      "service": "House Moving & Relocation",
      "queryEn": "house moving and relocation Saudi Arabia",
      "queryAr": "\u0646\u0642\u0644 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/relocation",
      "targetUrlAr": "/ar/services/relocation",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Inventory; packing; dates; origin/destination; provider scope",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh fetched KSA provider pages",
      "competitorObservation": "SMI publishes a Saudi relocation page; Four Winds has Arabic service content.",
      "competitorLimitations": "These are company-published service claims; cities listed do not prove ENVOD premises.",
      "competitorNextResearch": "Review pack/inventory, origin/destination and claims for each language.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "Relocation & Freight Services in Saudi Arabia | SMI Logistics",
          "url": "https://www.smilogistics.com/relocation-services",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-EN-03-smi-relocation-services.md"
        },
        {
          "title": "\u0646\u0642\u0644 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 | \u0634\u0631\u0643\u0629 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
          "url": "https://www.fourwinds-ksa.com/arabic/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-fourwinds-arabic-services.md"
        }
      ]
    },
    {
      "priority": "P3",
      "service": "Customs Clearance",
      "queryEn": "customs clearance services Saudi Arabia",
      "queryAr": "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/customs-clearance",
      "targetUrlAr": "/ar/services/customs-clearance",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Goods-specific documents; approvals; shipment responsibilities; authority decisions",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Earlier dated competitor sample + current official customs guidance",
      "competitorObservation": "Existing 17-Oct competitor sample covers MSL, OFL and SCLS; ZATCA current import instructions establish official document context.",
      "competitorLimitations": "No competitor ranking measured; official procedures are not ENVOD licensing evidence.",
      "competitorNextResearch": "Keep regulatory copy linked to ZATCA; verify broker authority separately.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "Import Instructions",
          "url": "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
          "tier": 1,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-EN-01-zatca-import-instructions.md"
        },
        {
          "title": "\u0634\u0631\u0643\u0629 KDL \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 | \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A",
          "url": "https://kdl.com.sa/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-kdl-arabic-homepage.md"
        }
      ]
    },
    {
      "priority": "P4",
      "service": "ATA Carnet Coordination",
      "queryEn": "ATA Carnet enquiries Saudi Arabia",
      "queryAr": "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/ata-carnet",
      "targetUrlAr": "/ar/services/ata-carnet",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Eligibility checks; authorized issuer/guarantor; ZATCA pre-approval; re-export",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Official system records; no Saudi competitor service-page rank sample",
      "competitorObservation": "ZATCA current Arabic service, ICC national association directory and SPA snippet describe Saudi ATA Carnet administration.",
      "competitorLimitations": "SPA is snippet-only; shipment-specific eligibility and any delegated issuer remain unverified.",
      "competitorNextResearch": "Explain coordination only; do not imply ENVOD issues or guarantees Carnets.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A (\u0643\u0627\u0631\u0646\u064A\u0647)",
          "url": "https://zatca.gov.sa/ar/eServices/Pages/eServices-294.aspx",
          "tier": 1,
          "evidenceMode": "fetched_page",
          "evidencePath": "artifacts/envod-kingdom/docs/seo-research/research/sources/ATA-GAP-01-zatca-arabic-e-service.md"
        },
        {
          "title": "ATA Carnet in your country \u2013 ICC",
          "url": "https://iccwbo.org/business-solutions/ata-carnet/ata-carnet-in-your-country/",
          "tier": 1,
          "evidenceMode": "fetched_page",
          "evidencePath": "artifacts/envod-kingdom/docs/seo-research/research/sources/ATA-GAP-02-icc-saudi-association.md"
        },
        {
          "title": "Saudi Commerce Chambers Launches ATA Carnet for Temporary Import of Goods",
          "url": "https://www.spa.gov.sa/en/N2178366",
          "tier": 1,
          "evidenceMode": "snippet",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-snippets.md"
        }
      ]
    },
    {
      "priority": "P5",
      "service": "GCC Transportation",
      "queryEn": "GCC road transport from Saudi Arabia",
      "queryAr": "\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0645\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0625\u0644\u0649 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646",
      "targetUrlEn": "/services/gcc-transportation",
      "targetUrlAr": "/ar/services/gcc-transportation",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Route; border documents; carriers; cargo acceptance; onward delivery",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh provider page + official corridor/customs sources",
      "competitorObservation": "OFL markets Saudi/GCC road freight; official national customs/corridor sources describe procedures and infrastructure.",
      "competitorLimitations": "OFL statements are provider marketing; official corridor sources do not verify ENVOD lanes.",
      "competitorNextResearch": "Verify country pairs, carriers/agents, documents and cargo acceptance.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "Road Freight & Land Transport Across Saudi Arabia & GCC | OFL International",
          "url": "https://oflsa.com/road-freight",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/GCC-03-ofl-gcc-road-freight.md"
        },
        {
          "title": "Unified Guide for Customs Procedures at First Points of Entry",
          "url": "https://www.customs.gov.om/media/gu0p51wd/unified-guide-for-customs-procedures-at-fpoe.pdf",
          "tier": 1,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/GCC-02-oman-unified-customs-guide.md"
        },
        {
          "title": "Kuwait Government Online: Custom Clearances",
          "url": "https://e.gov.kw/sites/kgoenglish/Pages/Services/MOCI/ReleasesCustoms.aspx",
          "tier": 1,
          "evidenceMode": "snippet",
          "evidencePath": "docs/seo-research/research/sources/GCC-snippets.md"
        }
      ]
    },
    {
      "priority": "P6",
      "service": "Breakbulk Shipping",
      "queryEn": "breakbulk shipping Saudi Arabia",
      "queryAr": "\u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u063A\u064A\u0631 \u0627\u0644\u0645\u062D\u0648\u0627\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/breakbulk-shipping",
      "targetUrlAr": "/ar/services/breakbulk-shipping",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Dimensions, weight, lifting plan, permits, terminals and project route",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P7",
      "service": "Ocean Freight",
      "queryEn": "sea freight Saudi Arabia",
      "queryAr": "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/ocean-freight",
      "targetUrlAr": "/ar/services/ocean-freight",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Origin/destination, FCL/LCL, routing, documents and cargo constraints",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh Arabic provider page/snippet",
      "competitorObservation": "SAAD and KDL publish sea-freight-related content.",
      "competitorLimitations": "Page presence is not market share or current Google position.",
      "competitorNextResearch": "Use origin/destination and FCL/LCL intent only where service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 | \u0633\u0639\u062F \u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A",
          "url": "https://www.saadlogistic.com/sea-freight-saudi-arabia",
          "tier": 3,
          "evidenceMode": "snippet",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-snippets.md"
        },
        {
          "title": "\u0634\u0631\u0643\u0629 KDL \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 | \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A",
          "url": "https://kdl.com.sa/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-kdl-arabic-homepage.md"
        }
      ]
    },
    {
      "priority": "P8",
      "service": "Air Freight",
      "queryEn": "air freight Saudi Arabia",
      "queryAr": "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/air-freight",
      "targetUrlAr": "/ar/services/air-freight",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Origin/destination, dimensions, handling, documents and shipment urgency",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh Arabic provider page; page-level detail limited",
      "competitorObservation": "KDL Arabic service page lists air freight; the 566-record candidate file includes service query candidates.",
      "competitorLimitations": "No search-volume, rank or carrier-capacity proof.",
      "competitorNextResearch": "Confirm origin/destination and actual booking scope before regional expansion.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "\u0634\u0631\u0643\u0629 KDL \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 | \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A",
          "url": "https://kdl.com.sa/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-kdl-arabic-homepage.md"
        }
      ]
    },
    {
      "priority": "P9",
      "service": "Freight Forwarding",
      "queryEn": "freight forwarding company Saudi Arabia",
      "queryAr": "\u0634\u0631\u0643\u0629 \u0634\u062D\u0646 \u0645\u062A\u0643\u0627\u0645\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/freight-forwarding",
      "targetUrlAr": "/ar/services/freight-forwarding",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Origin/destination, modes, documents, booking and contracted responsibility",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh KSA and Dubai provider pages",
      "competitorObservation": "KDL publishes broad freight services; ILS describes itself as Dubai-based and lists freight-forwarding services.",
      "competitorLimitations": "Provider claims do not verify ENVOD Dubai presence, licenses, or comparable service.",
      "competitorNextResearch": "Compare process transparency and bilingual detail, not unsupported superiority.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "\u0634\u0631\u0643\u0629 KDL \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 | \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A",
          "url": "https://kdl.com.sa/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-kdl-arabic-homepage.md"
        },
        {
          "title": "ILS \u2014 International Logistics Services | Dubai-Based Freight Forwarder",
          "url": "https://www.ilsmtc.com/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/UAE-04-ils-dubai-service-claims.md"
        }
      ]
    },
    {
      "priority": "P10",
      "service": "Project Cargo Logistics",
      "queryEn": "project cargo logistics Saudi Arabia",
      "queryAr": "\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629",
      "targetUrlEn": "/services/project-cargo",
      "targetUrlAr": "/ar/services/project-cargo",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Cargo survey, route, lifting, permits, schedule and site delivery",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "ZATCA Issues the Regulating Controls for Customs Procedures",
          "url": "https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1174.aspx",
          "tier": 1,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/GCC-04-zatca-customs-procedure-controls.md"
        }
      ]
    },
    {
      "priority": "P11",
      "service": "Oversized / Out-of-Gauge Cargo",
      "queryEn": "out of gauge cargo Saudi Arabia",
      "queryAr": "\u0634\u062D\u0646 \u0627\u0644\u062D\u0645\u0648\u0644\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629",
      "targetUrlEn": "/services/oog-cargo",
      "targetUrlAr": "/ar/services/oog-cargo",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Dimensions/weight, route survey, permits, lifting plan and carrier acceptance",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P12",
      "service": "Warehousing & Distribution",
      "queryEn": "warehousing and distribution Saudi Arabia",
      "queryAr": "\u062E\u062F\u0645\u0627\u062A \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639",
      "targetUrlEn": "/services/warehousing",
      "targetUrlAr": "/ar/services/warehousing",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Goods type, storage period, distribution scope and verified warehouse location/capacity",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Earlier dated competitor page snapshot",
      "competitorObservation": "The 17-Oct competitor analysis notes SAL fulfillment content connecting storage, picking/packing, shipping and last mile.",
      "competitorLimitations": "Does not establish ENVOD facilities, technology, stock handling or third-party fulfillment.",
      "competitorNextResearch": "Require owner-confirmed locations, capacity, inventory and distribution scope.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P13",
      "service": "Temperature-Controlled Logistics",
      "queryEn": "cold chain logistics Saudi Arabia",
      "queryAr": "\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0645\u0628\u0631\u062F\u0629",
      "targetUrlEn": "/services/temperature-controlled-logistics",
      "targetUrlAr": "/ar/services/temperature-controlled-logistics",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Commodity, temperature band, monitoring, lane and shipment acceptance",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Earlier dated Arabic provider observation",
      "competitorObservation": "The 18-Oct project research log records Dar Al-Shamel chilled/frozen/dry transport language.",
      "competitorLimitations": "Competitor compliance and equipment claims remain theirs; no ENVOD certification proof.",
      "competitorNextResearch": "Confirm temperature ranges, monitoring, equipment and commodity acceptance.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P14",
      "service": "Supply Chain Management",
      "queryEn": "supply chain coordination Saudi Arabia",
      "queryAr": "\u062A\u0646\u0633\u064A\u0642 \u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u0625\u0645\u062F\u0627\u062F \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/supply-chain",
      "targetUrlAr": "/ar/services/supply-chain",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Defined scope, parties, markets and deliverables; verify actual managed-service capability",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Fresh provider page + earlier project sample",
      "competitorObservation": "KDL markets integrated logistics; earlier competitor review includes 3PL/fulfillment scope.",
      "competitorLimitations": "Marketing scope is not independent service verification.",
      "competitorNextResearch": "Define deliverables, responsible parties and systems before claiming managed end-to-end scope.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": [
        {
          "title": "\u0634\u0631\u0643\u0629 KDL \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 | \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A",
          "url": "https://kdl.com.sa/",
          "tier": 3,
          "evidenceMode": "fetched_page",
          "evidencePath": "docs/seo-research/research/sources/KSA-AR-NN-kdl-arabic-homepage.md"
        }
      ]
    },
    {
      "priority": "P15",
      "service": "E-commerce Logistics",
      "queryEn": "ecommerce logistics services Saudi Arabia",
      "queryAr": "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/ecommerce-logistics",
      "targetUrlAr": "/ar/services/ecommerce-logistics",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Order volume, fulfilment model, destination, returns and verified system/service scope",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Earlier dated fulfillment page snapshot",
      "competitorObservation": "The 17-Oct analysis notes SAL fulfillment page with storage, picking/packing, shipping and last-mile content.",
      "competitorLimitations": "No ENVOD fulfillment platform, marketplace integration or returns capability verified.",
      "competitorNextResearch": "Keep any ENVOD claims to confirmed offer and partners.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P16",
      "service": "Medical & Pharma Logistics",
      "queryEn": "pharmaceutical shipping Saudi Arabia",
      "queryAr": "\u0634\u062D\u0646 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/medical-pharma",
      "targetUrlAr": "/ar/services/medical-pharma",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Product class, temperature, transport conditions and regulatory/authorization requirements",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Earlier snippet-only competitor observation",
      "competitorObservation": "The 17-Oct competitor review captured WTM pharma-transport snippet.",
      "competitorLimitations": "Snippet-only; do not infer GDP certification or validated temperature range for ENVOD.",
      "competitorNextResearch": "Verify product classes, permits and compliance before publishing.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P17",
      "service": "Food & FMCG Logistics",
      "queryEn": "food logistics Saudi Arabia",
      "queryAr": "\u0646\u0642\u0644 \u0648\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/food-fmcg",
      "targetUrlAr": "/ar/services/food-fmcg",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Commodity, temperature, handling, documentation and applicable approvals",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P18",
      "service": "Pet & Animal Import",
      "queryEn": "pet import logistics Saudi Arabia",
      "queryAr": "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0644\u064A\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/pet-animal-import",
      "targetUrlAr": "/ar/services/pet-animal-import",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Species, route, permits, health documents and carrier acceptance",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P19",
      "service": "Dangerous Goods Logistics",
      "queryEn": "dangerous goods freight forwarding Saudi Arabia",
      "queryAr": "\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629",
      "targetUrlEn": "/services/dangerous-goods",
      "targetUrlAr": "/ar/services/dangerous-goods",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "UN number/class, packaging, documents, approvals and carrier acceptance",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P20",
      "service": "RoRo Shipping",
      "queryEn": "RoRo vehicle shipping Saudi Arabia",
      "queryAr": "\u0634\u062D\u0646 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0628\u0646\u0638\u0627\u0645 \u0631\u0648\u0631\u0648 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/roro-shipping",
      "targetUrlAr": "/ar/services/roro-shipping",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Vehicle/rolling cargo, port pair, condition, documents and vessel acceptance",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P21",
      "service": "White Glove Logistics",
      "queryEn": "white glove delivery Saudi Arabia",
      "queryAr": "\u0646\u0642\u0644 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0642\u062A\u0646\u064A\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/white-glove-logistics",
      "targetUrlAr": "/ar/services/white-glove-logistics",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Item, handling level, site access, installation scope and delivery appointment",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P22",
      "service": "Express Courier Logistics",
      "queryEn": "local cargo delivery Saudi Arabia",
      "queryAr": "\u0634\u062D\u0646 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0639\u0627\u062C\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/express-courier",
      "targetUrlAr": "/ar/services/express-courier",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Origin/destination, size/weight, service availability and delivery commitment",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Existing candidate database only; no new page-level competitor review",
      "competitorObservation": "Prior keyword candidate file includes SBT-related express-cargo phrasing.",
      "competitorLimitations": "The phrase/source is not a current rank or service-capacity check.",
      "competitorNextResearch": "Verify delivery coverage, partners, cutoffs and service commitments.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P23",
      "service": "Cross Trade Shipping",
      "queryEn": "cross trade shipping Saudi Arabia",
      "queryAr": "\u0627\u0644\u0634\u062D\u0646 \u0628\u064A\u0646 \u062F\u0648\u0644\u062A\u064A\u0646 \u0639\u0628\u0631 \u0648\u0643\u064A\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/cross-trade-shipping",
      "targetUrlAr": "/ar/services/cross-trade-shipping",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Origin/destination pair, transit plan, contracting parties and customs scope",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "No new page-specific competitor evidence captured for this service",
      "competitorObservation": "No current public competitor page was independently fetched and reviewed for this service in the 24-Oct market sample; check dated project snapshots before using competitor claims.",
      "competitorLimitations": "This is an evidence gap, not evidence of no competitors or no demand. No competitor rank, traffic, market share or backlinks were measured.",
      "competitorNextResearch": "Prioritize a focused page-level competitor sample only after actual service scope is confirmed.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P24",
      "service": "Door-to-Door Logistics",
      "queryEn": "door-to-door freight services Saudi Arabia",
      "queryAr": "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "targetUrlEn": "/services/door-to-door",
      "targetUrlAr": "/ar/services/door-to-door",
      "routeType": "Services-page enquiry card; no separate detail route",
      "journeyFocus": "Pickup-to-delivery scope, shipment modes, customs responsibilities and recipient location",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "ENVOD directory enquiry card; no separate detail route",
      "competitorObservation": "The current site exposes Door-to-Door as a services-directory enquiry offering.",
      "competitorLimitations": "No standalone page or verified full operational scope; preserve the existing card route.",
      "competitorNextResearch": "Do not create a detail URL or imply all customs, modes and last-mile steps are included.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    },
    {
      "priority": "P25",
      "service": "Packaging & Crating Services",
      "queryEn": "export packing Saudi Arabia",
      "queryAr": "\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0623\u062B\u0627\u062B \u0644\u0644\u0646\u0642\u0644",
      "targetUrlEn": "/services/packaging-crating",
      "targetUrlAr": "/ar/services/packaging-crating",
      "routeType": "Existing English/Arabic service-detail route",
      "journeyFocus": "Cargo, destination, export packing and ISPM-15 where applicable",
      "ksaScope": "Primary market; existing bilingual page/card is the target; phrase is a candidate, not measured demand.",
      "cityScope": "National page only; city/gateway queries require route evidence; do not imply local office, depot or owned fleet.",
      "uaeScope": "Research candidate only; no ENVOD UAE office, customs licence, fleet, warehouse or route-specific coverage verified in this review.",
      "gccScope": "Research candidate only; confirm each country pair, carrier/agent, border documents and cargo acceptance before claiming coverage.",
      "searchVolume": "Unavailable \u2014 no authorized GSC/GA4/Keyword Planner dataset",
      "keywordDifficulty": "Unavailable \u2014 no verified provider data",
      "envodRank": "Unavailable \u2014 Search Console is not configured",
      "competitorRank": "Not measured",
      "aiCitationStatus": "Not measured",
      "technicalStatus": "Current production crawl: HTTP 200, canonical, hreflang, one H1 and valid JSON-LD; no route issue found.",
      "nextAction": "Use the existing bilingual target; collect verified service/route proof and Search Console/lead data before creating regional variants.",
      "competitorCoverage": "Existing candidate database only; no new full-page competitor review",
      "competitorObservation": "Prior candidate file cites Aljawad packing/crating content.",
      "competitorLimitations": "Does not verify ENVOD ISPM-15 treatment certification; current copy limits this to checking requirements where applicable.",
      "competitorNextResearch": "Keep ISPM-15 language qualified and verify any treatment provider.",
      "effortEstimate": "Medium (editorial estimate; service-owner validation may extend scope)",
      "confidence": "Medium for existing page/query mapping; low for demand because no performance data is connected",
      "recommendedChange": "Retain the existing bilingual target. Improve only verifiable service details and internal links; do not add regional claims or pages without operational evidence.",
      "testMethod": "After Search Console setup, compare page/query clicks, impressions, CTR and position over matched periods; inspect qualified lead outcomes. Google country is not a city-ranking report.",
      "actualOutcome": "NOT TESTED \u2014 no authorized performance or lead dataset",
      "evidence": []
    }
  ],
  "markets": [
    {
      "market_group": "Saudi Arabia \u2014 national",
      "language_scope": "English and Arabic",
      "role": "Primary target",
      "candidate_coverage": "566 rows in existing KSA organic-keyword candidate database; not measured demand",
      "observed_intent": "Freight, customs, exhibition, relocation and specialist cargo candidates; existing Arabic and English page equivalents",
      "site_target": "Existing bilingual service pages and services directory; do not add duplicate city pages",
      "evidence_and_limits": "Google Suggest snapshots and public page observations; not volume, Google position, or actual traffic. No first-party performance source is connected.",
      "next_action": "Use the 25-service priority map; add only route-specific evidence and collect GSC/lead data securely."
    },
    {
      "market_group": "Riyadh",
      "language_scope": "English and Arabic",
      "role": "Saudi city/gateway research",
      "candidate_coverage": "City/gateway candidates occur in existing maps and competitor research; no separately verified local premises for ENVOD",
      "observed_intent": "Customs, relocation, event venues, cargo and airport/road transport enquiries",
      "site_target": "National service pages; no dedicated Riyadh landing-page change in this review",
      "evidence_and_limits": "A query for a city does not establish an office, warehouse, licensed broker or fleet in Riyadh.",
      "next_action": "Use city wording only when a real route, venue or service capability is confirmed."
    },
    {
      "market_group": "Jeddah",
      "language_scope": "English and Arabic",
      "role": "Saudi port/city research",
      "candidate_coverage": "City/gateway candidates occur in existing maps; not separately measured",
      "observed_intent": "Customs/port handling, ocean freight, event cargo and relocation",
      "site_target": "National service pages; no new city page",
      "evidence_and_limits": "Official import requirements describe documents; they do not verify ENVOD port operations or broker status.",
      "next_action": "Confirm port/terminal, partner, clearance and delivery scope before location-specific claims."
    },
    {
      "market_group": "Dammam / Eastern Province",
      "language_scope": "English and Arabic",
      "role": "Saudi city/industrial gateway research",
      "candidate_coverage": "Candidate geography in current project research; no separate ENVOD local-presence proof",
      "observed_intent": "Road freight, project cargo, customs and warehousing/distribution enquiries",
      "site_target": "National service pages; no new city page",
      "evidence_and_limits": "No owned site, fleet or local office is inferred from regional search terms.",
      "next_action": "Verify lane, industrial-site access, capacity and local partners before adding city content."
    },
    {
      "market_group": "UAE / Dubai",
      "language_scope": "English and Arabic",
      "role": "Secondary market research; actual ENVOD coverage unresolved",
      "candidate_coverage": "Two UAE records in current 566-row dataset; public provider and government content reviewed",
      "observed_intent": "International forwarding and road freight; UAE import documentation and local provider pages",
      "site_target": "Existing freight/service pages only; no UAE-specific ENVOD page or office claim",
      "evidence_and_limits": "Government rules and Dubai provider marketing do not establish ENVOD entity, licence, staff, inventory, customs capability or lanes.",
      "next_action": "Owner must confirm legal entity, service/partner model, route pairs and customer scope before UAE landing pages."
    },
    {
      "market_group": "Bahrain",
      "language_scope": "English and Arabic",
      "role": "GCC corridor research",
      "candidate_coverage": "One Bahrain record in current candidate database; official corridor context reviewed",
      "observed_intent": "KSA\u2013Bahrain road/causeway and cross-border cargo enquiries",
      "site_target": "Existing GCC transportation and freight pages",
      "evidence_and_limits": "Causeway authority information is not proof of ENVOD route, permit, fleet or delivery coverage.",
      "next_action": "Verify route partner, customs documents, crossing constraints, cargo acceptance and return leg."
    },
    {
      "market_group": "Kuwait",
      "language_scope": "English and Arabic",
      "role": "GCC corridor research",
      "candidate_coverage": "One Kuwait record; public customs reference reviewed",
      "observed_intent": "Saudi\u2013Kuwait road freight and customs coordination",
      "site_target": "Existing GCC transportation / customs pages",
      "evidence_and_limits": "Government customs information is process context, not carrier availability or ENVOD corridor coverage.",
      "next_action": "Confirm current route, border procedure, carrier/agent, and country-specific documents."
    },
    {
      "market_group": "Qatar",
      "language_scope": "English and Arabic",
      "role": "GCC corridor research",
      "candidate_coverage": "One Qatar record; border infrastructure snippet reviewed",
      "observed_intent": "Saudi\u2013Qatar road route and onward delivery",
      "site_target": "Existing GCC transportation page",
      "evidence_and_limits": "Infrastructure sources do not prove ENVOD service coverage or border clearance capability.",
      "next_action": "Validate live country-pair capability, transits, documents and partner responsibility."
    },
    {
      "market_group": "Oman",
      "language_scope": "English and Arabic",
      "role": "GCC corridor research",
      "candidate_coverage": "One Oman record; official customs procedure guide reviewed",
      "observed_intent": "Saudi\u2013Oman cross-border cargo and customs-document questions",
      "site_target": "Existing GCC transportation / customs pages",
      "evidence_and_limits": "Oman customs guide supports process research only; it does not establish ENVOD lanes.",
      "next_action": "Confirm operating partner, route, cargo classes, customs roles and delivery limits."
    },
    {
      "market_group": "International origin/destination lanes",
      "language_scope": "English and Arabic as customer journey requires",
      "role": "Supporting trade-lane context, not a new target country claim",
      "candidate_coverage": "Existing Saudi freight candidates include selected origins/destinations; country/lane volume and service fit not measured",
      "observed_intent": "Air/ocean forwarding, project/breakbulk and cross-trade enquiries",
      "site_target": "Existing international freight pages and quote flow",
      "evidence_and_limits": "No route volumes, transit times, rates or carrier commitments measured; do not promise a lane absent owner evidence.",
      "next_action": "Select only commercially approved trade lanes; specify direction, cargo, responsibility and source date."
    }
  ]
};
var seoIntelligenceResearch = {
  ...researchRegister,
  services: researchRegister.services.map((service) => ({
    ...service,
    researchSnapshot: { envodRank: service.envodRank, technicalStatus: service.technicalStatus },
    envodRank: "No independent rank-tracking measurement; inspect actual returned Search Console metrics in Performance.",
    searchVolume: "Not measured by a keyword-demand source. Search Console impressions are not monthly keyword volume.",
    actualOutcome: "Research record; live performance and conversion outcomes must be measured separately.",
    testMethod: service.testMethod.replace("After Search Console setup,", "Where authorized Search Console rows are returned,"),
    confidence: service.confidence.replace("Search Console is not configured", "live performance has not been evaluated for this research record"),
    ...service.priority === "P24" ? { routeType: "Dedicated bilingual detail route", technicalStatus: "Door-to-Door has its own target, separate from Freight Forwarding. Check current HTTP, canonical and indexing evidence independently." } : {}
  }))
};

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

// src/lib/pillar-data/exhibition.ts
var EXHIBITION_PILLAR = {
  seoTitle: "Exhibition Logistics Company in Saudi Arabia | ENVOD KINGDOM",
  seoDescription: "Exhibition shipments to Saudi Arabia: freight, customs documents, ATA Carnet enquiries and venue delivery. Compare leading exhibition logistics providers in KSA",
  intro: [
    {
      en: "Businesses comparing leading exhibition logistics providers in KSA can explore ENVOD KINGDOM\u2019s specialist exhibition and event cargo coordination services. For trade shows, expos and corporate events in Saudi Arabia, enquiries may cover international freight, customs documentation and clearance coordination, ATA Carnet enquiries, venue delivery and on-site setup planning, and return or re-export shipments. Routes, responsibilities, provider availability and venue access are confirmed for each shipment.",
      ar: "\u064A\u0645\u0643\u0646 \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0628\u062D\u062B \u0639\u0646 \u0645\u0632\u0648\u062F\u064A \u062E\u062F\u0645\u0627\u062A \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u062E\u062F\u0645\u0627\u062A \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u062A\u0646\u0633\u064A\u0642 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A. \u0648\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A\u060C \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635\u060C \u0648\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u060C \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0644\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u060C \u0648\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631. \u0648\u064A\u064F\u0624\u0643\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645\u064A \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629."
    },
    {
      en: "From a single crate of samples to a multi-country pavilion, confirm freight routing, itemized equipment lists, temporary-import eligibility, on-site responsibilities and return transport before booking. LEAP, Cityscape Global, Big 5 Construct Saudi, Saudi Build and INDEX are examples of events to research when preparing an exhibition shipment, not a claim of ENVOD's official appointment or past participation.",
      ar: "\u0645\u0646 \u0635\u0646\u062F\u0648\u0642 \u0639\u064A\u0646\u0627\u062A \u0648\u0627\u062D\u062F \u0625\u0644\u0649 \u062C\u0646\u0627\u062D \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u062F\u0648\u0644\u060C \u0623\u0643\u0651\u062F \u0645\u0633\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0641\u0635\u0651\u0644\u0629 \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0646\u0642\u0644 \u0627\u0644\u0639\u0648\u062F\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632. \u0648\u062A\u064F\u0630\u0643\u0631 LEAP \u0648Cityscape Global \u0648Big 5 Construct Saudi \u0648Saudi Build \u0648INDEX \u0643\u0623\u0645\u062B\u0644\u0629 \u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u064A\u064F\u0628\u062D\u062B \u0639\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A\u0647\u0627 \u0639\u0646\u062F \u0627\u0644\u062A\u062E\u0637\u064A\u0637\u060C \u0644\u0627 \u0643\u0627\u062F\u0639\u0627\u0621 \u0628\u062A\u0639\u064A\u064A\u0646 \u0625\u0646\u0641\u0648\u062F \u0631\u0633\u0645\u064A\u0627\u064B \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u062A\u0647\u0627 \u0627\u0644\u0633\u0627\u0628\u0642\u0629."
    }
  ],
  sections: [
    {
      id: "what-is-exhibition-logistics",
      heading: {
        en: "What is exhibition logistics?",
        ar: "\u0645\u0627 \u0647\u064A \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636\u061F"
      },
      paragraphs: [
        {
          en: "Exhibition logistics is the specialised transport, customs and on-site handling of everything an exhibitor needs to present at a trade show or event \u2014 stand structures, display materials, product samples, audiovisual and technical equipment, marketing collateral and giveaways. Unlike ordinary freight, it runs to an immovable deadline: the cargo must arrive, clear customs and reach the correct hall and stand number before build-up ends.",
          ar: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0647\u064A \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u062A\u062E\u0635\u0635 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0644\u0643\u0644 \u0645\u0627 \u064A\u062D\u062A\u0627\u062C\u0647 \u0627\u0644\u0639\u0627\u0631\u0636 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064A \u0645\u0639\u0631\u0636 \u062A\u062C\u0627\u0631\u064A \u0623\u0648 \u0641\u0639\u0627\u0644\u064A\u0629 \u2014 \u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u0623\u062C\u0646\u062D\u0629\u060C \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u0639\u0631\u0636\u060C \u0648\u0639\u064A\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0633\u0645\u0639\u064A\u0629 \u0648\u0627\u0644\u0628\u0635\u0631\u064A\u0629 \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0648\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629 \u0648\u0627\u0644\u0647\u062F\u0627\u064A\u0627. \u0648\u062E\u0644\u0627\u0641\u0627\u064B \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0639\u0627\u062F\u064A\u060C \u062A\u062E\u0636\u0639 \u0644\u0645\u0648\u0639\u062F \u0646\u0647\u0627\u0626\u064A \u0644\u0627 \u064A\u062A\u063A\u064A\u0651\u0631: \u064A\u062C\u0628 \u0623\u0646 \u062A\u0635\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u062A\u064F\u062E\u0644\u064E\u0651\u0635 \u062C\u0645\u0631\u0643\u064A\u0627\u064B \u0648\u062A\u0635\u0644 \u0625\u0644\u0649 \u0627\u0644\u0642\u0627\u0639\u0629 \u0648\u0631\u0642\u0645 \u0627\u0644\u062C\u0646\u0627\u062D \u0627\u0644\u0635\u062D\u064A\u062D\u064A\u0646 \u0642\u0628\u0644 \u0627\u0646\u062A\u0647\u0627\u0621 \u0641\u062A\u0631\u0629 \u0627\u0644\u062A\u062C\u0647\u064A\u0632."
        },
        {
          en: "Some exhibition goods may qualify for temporary admission under an ATA Carnet or another procedure. Saudi acceptance depends on the goods, intended use and current authority requirements; confirm eligibility, endorsements, deadlines and any separate approvals before dispatch. A Carnet does not guarantee release or remove customs controls.",
          ar: "\u0642\u062F \u062A\u0643\u0648\u0646 \u0628\u0639\u0636 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0645\u0624\u0647\u0644\u0629 \u0644\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0628\u0645\u0648\u062C\u0628 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0623\u0648 \u0625\u062C\u0631\u0627\u0621 \u0622\u062E\u0631. \u0648\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0642\u0628\u0648\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u063A\u0631\u0636 \u0645\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629\u061B \u0644\u0630\u0627 \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u0648\u0644\u0627 \u064A\u0636\u0645\u0646 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0627\u0644\u0641\u0633\u062D \u0623\u0648 \u064A\u0644\u063A\u064A \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629."
        }
      ],
      bullets: [
        {
          en: "Review air, sea or road freight options for the event route, subject to carrier acceptance",
          ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0623\u0648 \u0627\u0644\u0628\u062D\u0631\u064A \u0623\u0648 \u0627\u0644\u0628\u0631\u064A \u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0641\u0642 \u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644"
        },
        {
          en: "Customs, temporary-admission and ATA Carnet document coordination, subject to eligibility",
          ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0641\u0642 \u0627\u0644\u0623\u0647\u0644\u064A\u0629"
        },
        {
          en: "Venue-delivery planning against organizer access rules and appointed contractors",
          ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0641\u0642 \u0642\u0648\u0627\u0639\u062F \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646"
        },
        {
          en: "On-site unloading, installation or dismantling only where the venue permits and a provider is confirmed",
          ar: "\u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0623\u0648 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0623\u0648 \u0627\u0644\u062A\u0641\u0643\u064A\u0643 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0641\u0642\u0637 \u0625\u0630\u0627 \u0633\u0645\u062D \u0627\u0644\u0645\u0643\u0627\u0646 \u0648\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629"
        },
        {
          en: "Return-routing and re-export planning after the event",
          ar: "\u062A\u062E\u0637\u064A\u0637 \u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0648\u062F\u0629 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0628\u0639\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629"
        }
      ]
    },
    {
      id: "trade-show-logistics-saudi-arabia",
      heading: {
        en: "Trade show & event logistics across Saudi Arabia",
        ar: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u0645\u0644\u0643\u0629"
      },
      paragraphs: [
        {
          en: "ENVOD KINGDOM is based in Al Malaz, Riyadh, and reviews exhibition-freight enquiries for Saudi venues. Depending on the shipment, the requested scope may include international show freight, customs-clearance arrangements at ports or airports, ATA Carnet eligibility and document coordination, door-to-door delivery planning, venue delivery, nationwide destination-delivery requests and on-site setup coordination. Each element is confirmed per shipment; local-provider availability, venue-appointed contractors, organizer rules, customs approval and site access can affect the scope.",
          ar: "\u064A\u0642\u0639 \u0645\u0642\u0631 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645 \u0641\u064A \u062D\u064A \u0627\u0644\u0645\u0644\u0632 \u0628\u0627\u0644\u0631\u064A\u0627\u0636\u060C \u0648\u062A\u0631\u0627\u062C\u0639 \u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u0648\u0642\u062F \u064A\u0634\u0645\u0644 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u060C \u0628\u062D\u0633\u0628 \u0627\u0644\u0634\u062D\u0646\u0629\u060C \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0623\u0648 \u0627\u0644\u0645\u0637\u0627\u0631\u0627\u062A \u0648\u0623\u0647\u0644\u064A\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0647 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0644\u0644\u062A\u0648\u0635\u064A\u0644 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0625\u0644\u0649 \u0648\u062C\u0647\u0627\u062A \u0641\u064A \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A. \u0648\u064A\u064F\u0624\u0643\u062F \u0643\u0644 \u0639\u0646\u0635\u0631 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629\u061B \u0625\u0630 \u0642\u062F \u064A\u0624\u062B\u0631 \u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645\u064A \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u064A\u0646 \u0648\u0645\u0642\u0627\u0648\u0644\u0648 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0648\u0646 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u0641\u064A \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0627\u062D."
        },
        {
          en: "Requests can include exhibition cargo to Riyadh, Jeddah, Dammam and other Saudi destinations. The port or airport gateway, inland route, customs operator and local-delivery scope are confirmed for each shipment; city references do not imply venue appointment or fixed clearance timing.",
          ar: "\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0625\u0644\u0649 \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062C\u062F\u0629 \u0648\u0627\u0644\u062F\u0645\u0627\u0645 \u0648\u063A\u064A\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0648\u062C\u0647\u0627\u062A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0623\u0648 \u0627\u0644\u0645\u0637\u0627\u0631 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u062F\u0627\u062E\u0644\u064A \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062D\u0644\u064A \u0644\u0643\u0644 \u0634\u062D\u0646\u0629\u061B \u0648\u0644\u0627 \u064A\u0639\u0646\u064A \u0630\u0643\u0631 \u0627\u0644\u0645\u062F\u0646 \u0648\u062C\u0648\u062F \u062A\u0639\u064A\u064A\u0646 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u062A\u0648\u0642\u064A\u062A \u062B\u0627\u0628\u062A \u0644\u0644\u062A\u062E\u0644\u064A\u0635."
        },
        {
          en: "Planning references include Riyadh Front Exhibition & Conference Center (RFECC), Riyadh International Convention & Exhibition Center (RICEC), Malham Exhibition Centre, Jeddah International Exhibition & Convention Center, Jeddah Superdome and Jeddah Center for Forums & Events. These are possible destinations for planning only; the list does not imply venue or organizer appointment, or a completed ENVOD project at any location.",
          ar: "\u062A\u0634\u0645\u0644 \u0645\u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0645\u0631\u0643\u0632 \u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A (RFECC)\u060C \u0648\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 (RICEC)\u060C \u0648\u0645\u0631\u0643\u0632 \u0645\u0639\u0627\u0631\u0636 \u0645\u0644\u0647\u0645\u060C \u0648\u0645\u0631\u0643\u0632 \u062C\u062F\u0629 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A\u060C \u0648\u0642\u0628\u0629 \u062C\u062F\u0629\u060C \u0648\u0645\u0631\u0643\u0632 \u062C\u062F\u0629 \u0644\u0644\u0645\u0646\u062A\u062F\u064A\u0627\u062A \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A. \u0647\u0630\u0647 \u0648\u062C\u0647\u0627\u062A \u0645\u062D\u062A\u0645\u0644\u0629 \u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0641\u0642\u0637\u061B \u0648\u0644\u0627 \u062A\u0639\u0646\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u062C\u0648\u062F \u062A\u0639\u064A\u064A\u0646 \u0645\u0646 \u0623\u064A \u0645\u0648\u0642\u0639 \u0623\u0648 \u0645\u0646\u0638\u0651\u0645 \u0623\u0648 \u062A\u0646\u0641\u064A\u0630 \u0625\u0646\u0641\u0648\u062F \u0645\u0634\u0631\u0648\u0639\u0627\u064B \u0641\u064A \u0623\u064A \u0645\u0646\u0647\u0627."
        },
        {
          en: "For a single pallet or a multi-exhibitor pavilion, send the itemized cargo list, dimensions, weight, origin, event dates and venue instructions. The proposed freight, customs and on-site responsibilities can then be scoped; availability, partners and organizer approval are confirmed before booking.",
          ar: "\u0633\u0648\u0627\u0621 \u0643\u0627\u0646\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0645\u0646\u0635\u0629 \u0648\u0627\u062D\u062F\u0629 \u0623\u0648 \u062C\u0646\u0627\u062D\u0627\u064B \u064A\u0636\u0645 \u0639\u062F\u0629 \u0639\u0627\u0631\u0636\u064A\u0646\u060C \u0623\u0631\u0633\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0641\u0635\u0644\u0629 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639. \u0639\u0646\u062F\u0647\u0627 \u064A\u0645\u0643\u0646 \u062A\u062D\u062F\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629\u061B \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0625\u062A\u0627\u062D\u0629 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632."
        }
      ],
      bullets: [
        {
          en: "Planning target: start 4\u20136 weeks before the event; for large events such as LEAP or Cityscape, allow 8 weeks or more where practical. This is guidance, not a guaranteed booking lead time.",
          ar: "\u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u062E\u0637\u064A\u0637\u064A\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629: \u0627\u0628\u062F\u0623 \u0642\u0628\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0628\u0623\u0631\u0628\u0639\u0629 \u0625\u0644\u0649 \u0633\u062A\u0629 \u0623\u0633\u0627\u0628\u064A\u0639\u061B \u0648\u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0645\u062B\u0644 LEAP \u0623\u0648 Cityscape\u060C \u064A\u064F\u0641\u0636\u0651\u0644 \u0625\u062A\u0627\u062D\u0629 \u062B\u0645\u0627\u0646\u064A\u0629 \u0623\u0633\u0627\u0628\u064A\u0639 \u0623\u0648 \u0623\u0643\u062B\u0631 \u0645\u062A\u0649 \u0623\u0645\u0643\u0646. \u0647\u0630\u0647 \u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0648\u0644\u064A\u0633\u062A \u0645\u0647\u0644\u0629 \u062D\u062C\u0632 \u0645\u0636\u0645\u0648\u0646\u0629."
        },
        {
          en: "Before dispatch, check the commercial invoice, packing list, certificate of origin and any required attestations, permits or product documents against current requirements for the goods and route.",
          ar: "\u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u060C \u0631\u0627\u062C\u0639 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0623\u064A \u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0623\u0648 \u062A\u0635\u0627\u0631\u064A\u062D \u0623\u0648 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0644\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628\u0629\u060C \u0648\u0641\u0642 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631."
        },
        {
          en: "For eligible goods, confirm ATA Carnet availability, the authorized issuing association, customs acceptance and re-export deadlines before dispatch.",
          ar: "\u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0624\u0647\u0644\u0629\u060C \u0623\u0643\u0651\u062F \u062A\u0648\u0641\u0631 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0628\u0625\u0635\u062F\u0627\u0631\u0647 \u0648\u0642\u0628\u0648\u0644\u0647 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644."
        }
      ]
    },
    {
      id: "ata-carnet-temporary-import",
      heading: {
        en: "ATA Carnet & temporary-import preparation",
        ar: "\u062A\u062C\u0647\u064A\u0632 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A"
      },
      paragraphs: [
        {
          en: "Saudi Arabia accepts ATA Carnets for eligible exhibition goods under applicable procedures. Confirm the goods, intended use, current acceptance, any pre-approval, authorized issuing association and re-export deadline for each shipment. A Carnet does not remove customs controls, organizer rules or all issuing and handling costs.",
          ar: "\u062A\u0642\u0628\u0644 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0643\u0627\u0631\u0646\u064A\u0647\u0627\u062A ATA \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0645\u0624\u0647\u0644\u0629 \u0648\u0641\u0642 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0647\u0627. \u0623\u0643\u0651\u062F \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u063A\u0631\u0636 \u0645\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0633\u0628\u0642\u0629 \u0648\u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0648\u0645\u0648\u0639\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629. \u0648\u0644\u0627 \u064A\u0644\u063A\u064A \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0623\u0648 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0623\u0648 \u062C\u0645\u064A\u0639 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629."
        },
        {
          en: "ENVOD coordinates the equipment-list and shipment-document review. If a Carnet is unavailable or unsuitable, discuss the applicable temporary-import procedure with the responsible customs operator before dispatch. Customs clearance times vary depending on documentation, commodity type, inspection requirements, and regulatory approvals.",
          ar: "\u062A\u0646\u0633\u0651\u0642 \u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629. \u0648\u0625\u0630\u0627 \u062A\u0639\u0630\u0651\u0631 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0623\u0648 \u0644\u0645 \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629\u060C \u0641\u0646\u0627\u0642\u0634 \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0627\u0644\u0645\u0637\u0628\u0642 \u0645\u0639 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0645\u062E\u062A\u0635 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u062A\u062E\u062A\u0644\u0641 \u0645\u062F\u062F \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u062D\u0633\u0628 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629."
        }
      ],
      references: [
        {
          label: { en: "ZATCA: Temporary Admission Using ATA Carnet", ar: "\u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643: \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A (\u0643\u0627\u0631\u0646\u064A\u0647)" },
          href: "https://zatca.gov.sa/en/eServices/Pages/eServices-294.aspx",
          hrefAr: "https://zatca.gov.sa/ar/eServices/Pages/eServices-294.aspx"
        },
        {
          label: { en: "ICC: Find the ATA Carnet association for your country", ar: "\u063A\u0631\u0641\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629: \u0627\u0628\u062D\u062B \u0639\u0646 \u062C\u0647\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0641\u064A \u0628\u0644\u062F\u0643 (\u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629)" },
          href: "https://iccwbo.org/business-solutions/ata-carnet/ata-carnet-in-your-country/"
        }
      ]
    },
    {
      id: "on-site-handling",
      heading: {
        en: "On-site handling, installation & dismantling",
        ar: "\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u0644\u062A\u0641\u0643\u064A\u0643 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639"
      },
      paragraphs: [
        {
          en: "Confirm who is authorized to receive cargo at the loading dock, move it to the stand, unpack it, position it and store empty crates. These tasks may be restricted to venue-appointed contractors and must be included in the confirmed service scope.",
          ar: "\u0623\u0643\u0651\u062F \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u0648\u0644\u0629 \u0628\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0639\u0646\u062F \u0631\u0635\u064A\u0641 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0646\u0642\u0644\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u062C\u0646\u0627\u062D \u0648\u0641\u0643 \u062A\u063A\u0644\u064A\u0641\u0647\u0627 \u0648\u062A\u0645\u0648\u0636\u0639\u0647\u0627 \u0648\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0641\u0627\u0631\u063A\u0629. \u0648\u0642\u062F \u062A\u0642\u062A\u0635\u0631 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0627\u0645 \u0639\u0644\u0649 \u0645\u0642\u0627\u0648\u0644\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646\u060C \u0644\u0630\u0627 \u064A\u062C\u0628 \u0625\u062F\u0631\u0627\u062C\u0647\u0627 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0643\u062F."
        },
        {
          en: "The return plan should confirm the collection slot, repacking responsibility, stored-crate access, export documents and next destination. Assign a named event contact and confirm any coordinator or on-site support as part of the booking.",
          ar: "\u064A\u0646\u0628\u063A\u064A \u0623\u0646 \u062A\u062D\u062F\u062F \u062E\u0637\u0629 \u0627\u0644\u0639\u0648\u062F\u0629 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0645\u062E\u0632\u0646\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629. \u0639\u064A\u0651\u0646 \u062C\u0647\u0629 \u062A\u0648\u0627\u0635\u0644 \u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0623\u0643\u0651\u062F \u0623\u064A \u062A\u0646\u0633\u064A\u0642 \u0623\u0648 \u062F\u0639\u0645 \u0645\u064A\u062F\u0627\u0646\u064A \u0636\u0645\u0646 \u0627\u0644\u062D\u062C\u0632."
        }
      ]
    },
    {
      id: "live-events-and-specialist-cargo",
      heading: {
        en: "Fairs, live events & specialist cargo",
        ar: "\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629"
      },
      paragraphs: [
        {
          en: "Alongside trade shows, event enquiries may involve concerts, sports tournaments, broadcast productions and high-value showcases. ENVOD can review the requested freight, customs-document, venue-delivery, temporary-storage and return or re-export scope. Cargo acceptance, organizer rules, venue access, schedules and operating partners are checked for each event.",
          ar: "\u0625\u0644\u0649 \u062C\u0627\u0646\u0628 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629\u060C \u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u0641\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u064A\u0642\u064A\u0629 \u0648\u0627\u0644\u0628\u0637\u0648\u0644\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u0627\u062A \u0627\u0644\u0625\u0639\u0644\u0627\u0645\u064A\u0629 \u0648\u0627\u0644\u0639\u0631\u0648\u0636 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0634\u062D\u0646 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0627\u0644\u0639\u0648\u062F\u0629 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631. \u0648\u064A\u064F\u0631\u0627\u062C\u0639 \u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0634\u0631\u0643\u0627\u0621 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0644\u0643\u0644 \u0641\u0639\u0627\u0644\u064A\u0629."
        },
        {
          en: "The categories below are examples of enquiries, not a guarantee of availability or a claim of special authorization. Any specialist provider, equipment, permit, security requirement or on-site role must be confirmed before booking. Relocation and warehousing requirements are assessed as separate service enquiries.",
          ar: "\u0627\u0644\u0641\u0626\u0627\u062A \u0623\u062F\u0646\u0627\u0647 \u0623\u0645\u062B\u0644\u0629 \u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u060C \u0648\u0644\u064A\u0633\u062A \u0636\u0645\u0627\u0646\u0627\u064B \u0644\u0644\u062A\u0648\u0641\u0631 \u0623\u0648 \u0627\u062F\u0639\u0627\u0621\u064B \u0628\u0648\u062C\u0648\u062F \u062A\u0641\u0648\u064A\u0636 \u062E\u0627\u0635. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u062E\u0635\u0635 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0648\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0645\u0648\u0642\u0639 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632. \u0648\u062A\u064F\u0642\u064A\u0651\u0645 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0643\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u062E\u062F\u0645\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629."
        }
      ],
      bullets: [
        {
          en: "Concert, sports and broadcast equipment: cargo lists, freight route, venue windows and on-site handling, where permitted and confirmed.",
          ar: "\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062D\u0641\u0644\u0627\u062A \u0648\u0627\u0644\u0631\u064A\u0627\u0636\u0629 \u0648\u0627\u0644\u0628\u062B: \u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u0633\u0645\u0627\u062D \u0648\u0627\u0644\u062A\u0623\u0643\u064A\u062F."
        },
        {
          en: "Fine art, vehicles and high-value media equipment: packing, handling, route, carrier acceptance and required approvals are reviewed; specialist capability is confirmed separately.",
          ar: "\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0641\u0646\u064A\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629: \u062A\u064F\u0631\u0627\u062C\u0639 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629\u061B \u0648\u064A\u064F\u0624\u0643\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644."
        },
        {
          en: "Project cargo and oversized exhibits: dimensions, weight, route, permits, lifting or handling plans and equipment availability are assessed.",
          ar: "\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629: \u062A\u064F\u0642\u064A\u0651\u0645 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u062E\u0637\u0637 \u0627\u0644\u0631\u0641\u0639 \u0623\u0648 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0639\u062F\u0627\u062A."
        },
        {
          en: "Temporary storage and international removals: facility and provider availability, customs scope, access and timing are confirmed separately.",
          ar: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0623\u062B\u0627\u062B: \u064A\u064F\u0624\u0643\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644."
        },
        {
          en: "Government, defense or controlled-venue requests: eligibility, security and regulatory requirements must be reviewed before any service commitment.",
          ar: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0623\u0648 \u0627\u0644\u062F\u0641\u0627\u0639\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u0636\u0648\u0627\u0628\u0637: \u064A\u062C\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u0644\u0648\u0627\u0626\u062D \u0642\u0628\u0644 \u0623\u064A \u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062E\u062F\u0645\u0629."
        }
      ]
    },
    {
      id: "exhibition-logistics-quote-checklist",
      heading: {
        en: "What information is needed for an exhibition logistics quote?",
        ar: "\u0645\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0639\u0631\u0636 \u0633\u0639\u0631 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636\u061F"
      },
      paragraphs: [
        {
          en: "Send the event brief and cargo details together so the proposed freight, customs-document support, venue delivery and return movements can be reviewed as one plan. Pricing depends on the route, freight mode, cargo, required handling, customs procedure and venue requirements; a written quote should clarify included work, exclusions and each provider\u2019s responsibilities.",
          ar: "\u0623\u0631\u0633\u0644 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0645\u0639\u0627\u064B \u062D\u062A\u0649 \u064A\u0645\u0643\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0634\u062D\u0646 \u0648\u062F\u0639\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629 \u0636\u0645\u0646 \u062E\u0637\u0629 \u0648\u0627\u062D\u062F\u0629. \u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0633\u0639\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639\u061B \u0648\u064A\u0646\u0628\u063A\u064A \u0623\u0646 \u064A\u0648\u0636\u062D \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u0643\u062A\u0648\u0628 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u0634\u0645\u0648\u0644\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621\u0627\u062A \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0643\u0644 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629."
        }
      ],
      bullets: [
        {
          en: "Event name, venue, hall and stand number, organizer\u2019s freight manual, and confirmed build-up, delivery and collection windows.",
          ar: "\u0627\u0633\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0642\u0627\u0639\u0629 \u0648\u0631\u0642\u0645 \u0627\u0644\u062C\u0646\u0627\u062D \u0648\u062F\u0644\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0635\u0627\u062F\u0631 \u0639\u0646 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0624\u0643\u062F\u0629."
        },
        {
          en: "Collection address, origin country, destination, cargo-ready date, preferred freight mode and the return or next-event destination.",
          ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0627\u0631\u064A\u062E \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0648\u0648\u062C\u0647\u0629 \u0627\u0644\u0639\u0648\u062F\u0629 \u0623\u0648 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629."
        },
        {
          en: "Itemized packing list, number of packages, dimensions, gross weight and declared values; identify restricted goods, batteries, liquids or special handling needs.",
          ar: "\u0642\u0627\u0626\u0645\u0629 \u062A\u0639\u0628\u0626\u0629 \u0645\u0641\u0635\u0644\u0629 \u0648\u0639\u062F\u062F \u0627\u0644\u0637\u0631\u0648\u062F \u0648\u0623\u0628\u0639\u0627\u062F\u0647\u0627 \u0648\u0623\u0648\u0632\u0627\u0646\u0647\u0627 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0642\u064A\u0645 \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647\u0627\u061B \u0645\u0639 \u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0642\u064A\u062F\u0629 \u0623\u0648 \u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0623\u0648 \u0627\u0644\u0633\u0648\u0627\u0626\u0644 \u0623\u0648 \u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u062E\u0627\u0635\u0629."
        },
        {
          en: "Identify goods intended for return separately from items intended for sale, use or distribution. Confirm the applicable import procedure, importer or consignee and required approvals with the responsible customs operator.",
          ar: "\u0645\u064A\u0651\u0632 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0639\u0648\u062F\u0629 \u0639\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0628\u064A\u0639 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0648 \u0627\u0644\u062A\u0648\u0632\u064A\u0639. \u0648\u0623\u0643\u0651\u062F \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0637\u0628\u0642 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F \u0623\u0648 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0645\u0639 \u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0645\u0633\u0624\u0648\u0644."
        },
        {
          en: "Clarify unloading, lifting, unpacking, empty-crate storage, repacking, insurance and return collection requirements. Venue-appointed contractors and access permissions must be confirmed rather than assumed.",
          ar: "\u0648\u0636\u0651\u062D \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0648\u0627\u0644\u0631\u0641\u0639 \u0648\u0641\u0643 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0641\u0627\u0631\u063A\u0629 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0644\u0644\u0639\u0648\u062F\u0629. \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u062F\u062E\u0648\u0644\u060C \u0644\u0627 \u0627\u0641\u062A\u0631\u0627\u0636 \u062A\u0648\u0641\u0631\u0647\u0627."
        }
      ],
      references: [
        {
          label: { en: "ZATCA: Import instructions and cargo-dependent document requirements", ar: "\u0647\u064A\u0626\u0629 \u0627\u0644\u0632\u0643\u0627\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643: \u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0628\u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629" },
          href: "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
          hrefAr: "https://zatca.gov.sa/ar/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx"
        }
      ]
    },
    {
      id: "why-envod-exhibition-logistics",
      heading: {
        en: "Why choose ENVOD as your exhibition logistics company",
        ar: "\u0644\u0645\u0627\u0630\u0627 \u062A\u062E\u062A\u0627\u0631 \u0625\u0646\u0641\u0648\u062F \u0634\u0631\u0643\u0629\u064B \u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u0627\u0631\u0636\u0643"
      },
      paragraphs: [
        {
          en: "Before choosing an exhibition logistics provider, confirm who arranges the freight, who is responsible for customs, which venue contractor handles the cargo, and what happens if a schedule or inspection changes. ENVOD can review the requested shipment scope; any operator, venue access, on-site work and timing must be confirmed for the event.",
          ar: "\u0642\u0628\u0644 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0642\u062F\u0645 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636\u060C \u0623\u0643\u0651\u062F \u0645\u0646 \u064A\u0631\u062A\u0628 \u0627\u0644\u0634\u062D\u0646 \u0648\u0645\u0646 \u064A\u062A\u062D\u0645\u0644 \u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0645\u0642\u0627\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0630\u064A \u064A\u0646\u0627\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0645\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0639\u0646\u062F \u062A\u063A\u064A\u0651\u0631 \u0627\u0644\u062C\u062F\u0648\u0644 \u0623\u0648 \u0627\u0644\u0641\u062D\u0635. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0639\u0646\u064A\u0629."
        }
      ],
      bullets: [
        {
          en: "Event-specific planning around venue access and organizer deadlines",
          ar: "\u062A\u062E\u0637\u064A\u0637 \u062E\u0627\u0635 \u0628\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u062D\u0633\u0628 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0645\u0646\u0638\u0645"
        },
        {
          en: "ATA Carnet eligibility and documentation review",
          ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0647\u0644\u064A\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0647"
        },
        {
          en: "Confirm routing and venue arrangements for your event location",
          ar: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u0648\u062C\u0647\u0629 \u0641\u0639\u0627\u0644\u064A\u062A\u0643"
        },
        {
          en: "On-site roles and support only when permitted, available and separately confirmed",
          ar: "\u062A\u064F\u0642\u062F\u0651\u0645 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0639\u0646\u062F \u0627\u0644\u0633\u0645\u0627\u062D \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644"
        },
        {
          en: "Freight mode and carrier options assessed against cargo, route and event deadlines",
          ar: "\u062A\u0642\u064A\u064A\u0645 \u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629"
        }
      ]
    },
    {
      id: "event-transport-and-specialist-support",
      heading: {
        en: "Exhibition transport, packing & event-site support",
        ar: "\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062F\u0639\u0645 \u0641\u064A \u0645\u0648\u0642\u0639 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629"
      },
      paragraphs: [
        {
          en: "An event plan may combine GCC cross-border and domestic Saudi movements, international air or sea freight, temporary storage, packing, venue delivery and return routing. The route, carrier, customs operator, permits, service providers and event deadlines are assessed for the cargo and confirmed before booking.",
          ar: "\u0642\u062F \u062A\u062C\u0645\u0639 \u062E\u0637\u0629 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0628\u064A\u0646 \u0627\u0644\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u062D\u062F\u0648\u062F \u062F\u0627\u062E\u0644 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u062D\u0644\u064A \u062F\u0627\u062E\u0644 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u062C\u0648\u064A \u0623\u0648 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0648\u062F\u0629. \u0648\u064A\u064F\u0642\u064A\u0651\u0645 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u0642\u062F\u0645\u0648 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629\u060C \u062B\u0645 \u062A\u064F\u0624\u0643\u062F \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632."
        },
        {
          en: "For temperature-controlled or heavy equipment, share the required temperature range, weight, dimensions, handling instructions and schedule early. Suitable vehicles, monitoring, lifting equipment, permits and on-site teams are not assumed; they must be verified for the shipment and venue.",
          ar: "\u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u062A\u0637\u0644\u0628 \u062A\u062D\u0643\u0645\u0627\u064B \u062D\u0631\u0627\u0631\u064A\u0627\u064B \u0623\u0648 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629\u060C \u0623\u0631\u0633\u0644 \u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0645\u0628\u0643\u0631\u0627\u064B. \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0623\u0648 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0623\u0648 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0631\u0641\u0639 \u0623\u0648 \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0623\u0648 \u0627\u0644\u0641\u0631\u0642 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629\u061B \u0628\u0644 \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0644\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639."
        }
      ],
      bullets: [
        {
          en: "GCC cross-border transport and domestic or multi-city KSA movements: route, border documents, carrier acceptance and local coverage are confirmed.",
          ar: "\u0627\u0644\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u062D\u062F\u0648\u062F \u062F\u0627\u062E\u0644 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u062D\u0644\u064A \u0623\u0648 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0645\u062F\u0646 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629: \u064A\u064F\u0624\u0643\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629."
        },
        {
          en: "Temperature-controlled transport requests: confirm equipment, required range, monitoring, carrier acceptance and handover conditions.",
          ar: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u062A\u062D\u0643\u0645 \u0628\u062F\u0631\u062C\u0629 \u062D\u0631\u0627\u0631\u062A\u0647: \u0623\u0643\u0651\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645."
        },
        {
          en: "Heavy or oversized event equipment: review dimensions, weight, road restrictions, permits, lifting and handling plans.",
          ar: "\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0623\u0648 \u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u062D\u062C\u0645: \u062A\u064F\u0631\u0627\u062C\u0639 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0642\u064A\u0648\u062F \u0627\u0644\u0637\u0631\u0642 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u062E\u0637\u0637 \u0627\u0644\u0631\u0641\u0639 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629."
        },
        {
          en: "Packing, custom cases or crates, fragile or high-value items, temporary storage and return transport: confirm the scope and any specialist provider.",
          ar: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0623\u0648 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0645\u0635\u0645\u0645\u0629 \u062D\u0633\u0628 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0647\u0634\u0629 \u0623\u0648 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0646\u0642\u0644 \u0627\u0644\u0639\u0648\u062F\u0629: \u064A\u064F\u0624\u0643\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0623\u064A \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u062A\u062E\u0635\u0635."
        },
        {
          en: "Booth, stage, d\xE9cor and lighting design/build enquiries, transport, installation or teardown, and on-site project coordination: subject to qualified-provider availability, venue access, appointed contractors and confirmed responsibilities.",
          ar: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0623\u062C\u0646\u062D\u0629 \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0648\u0627\u0644\u062F\u064A\u0643\u0648\u0631 \u0648\u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0623\u0648 \u062A\u0646\u0641\u064A\u0630\u0647\u0627 \u0648\u0646\u0642\u0644\u0647\u0627 \u0648\u062A\u0631\u0643\u064A\u0628\u0647\u0627 \u0623\u0648 \u062A\u0641\u0643\u064A\u0643\u0647\u0627 \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0644\u0644\u0645\u0634\u0631\u0648\u0639: \u062A\u062E\u0636\u0639 \u0644\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0642\u0627\u0648\u0644\u064A\u0647 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A."
        },
        {
          en: "Door-to-door international air or sea freight, temporary-import/export documents and return or re-export planning: eligibility, route and customs requirements are checked for each shipment.",
          ar: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u062C\u0648\u064A \u0623\u0648 \u0627\u0644\u0628\u062D\u0631\u064A \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0623\u0648 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0639\u0648\u062F\u0629 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631: \u062A\u064F\u0631\u0627\u062C\u0639 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629."
        },
        {
          en: "Fine-art, fragile and other high-value cargo: packing, crating, handling, insurance requirements and specialist-provider capability must be reviewed for the items and route.",
          ar: "\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0641\u0646\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0647\u0634\u0629 \u0648\u063A\u064A\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629: \u062A\u064F\u0631\u0627\u062C\u0639 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0642\u062F\u0631\u0627\u062A \u0645\u0642\u062F\u0645\u064A \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0645\u0633\u0627\u0631."
        },
        {
          en: "Temporary admission for overseas exhibitors without a Saudi commercial presence: the eligible importer or consignee, procedure and supporting documents must be confirmed with the responsible customs operator and authorities.",
          ar: "\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0644\u0644\u0639\u0627\u0631\u0636\u064A\u0646 \u0645\u0646 \u062E\u0627\u0631\u062C \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0630\u064A\u0646 \u0644\u0627 \u064A\u0645\u0644\u0643\u0648\u0646 \u062D\u0636\u0648\u0631\u0627\u064B \u062A\u062C\u0627\u0631\u064A\u0627\u064B \u0633\u0639\u0648\u062F\u064A\u0627\u064B: \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F \u0623\u0648 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064A\u0647 \u0627\u0644\u0645\u0624\u0647\u0644 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062F\u0627\u0639\u0645\u0629 \u0645\u0639 \u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629."
        },
        {
          en: "Aircraft or VIP charter and relocation meet-and-greet requests may be reviewed separately; licensed-operator availability, approvals, timing and exact scope must be confirmed before commitment.",
          ar: "\u064A\u0645\u0643\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u0626\u062C\u0627\u0631 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0623\u0648 \u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0631\u062E\u0651\u0635 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0642\u0628\u0644 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645."
        }
      ]
    },
    {
      id: "event-logistics-coordination-benefits",
      heading: {
        en: "Benefits of coordinated event logistics",
        ar: "\u0645\u0632\u0627\u064A\u0627 \u062A\u0646\u0633\u064A\u0642 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A"
      },
      paragraphs: [
        {
          en: "Exhibition and event enquiries are coordinated by the same Riyadh logistics team that coordinates ENVOD KINGDOM\u2019s freight, storage and delivery requests. A shipment-specific plan can bring these requirements together while you focus on the event; each service, provider and responsibility is confirmed before booking.",
          ar: "\u064A\u062A\u0648\u0644\u0649 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0646\u0641\u0633\u0647 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u062A\u0646\u0633\u064A\u0642 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A\u060C \u0648\u0647\u0648 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0630\u064A \u064A\u0646\u0633\u0642 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u062F\u0649 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645. \u0648\u064A\u0645\u0643\u0646 \u0644\u062E\u0637\u0629 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u062D\u0646\u0629 \u062C\u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0639 \u0625\u062A\u0627\u062D\u0629 \u062A\u0631\u0643\u064A\u0632\u0643 \u0639\u0644\u0649 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629\u061B \u0648\u064A\u064F\u0624\u0643\u062F \u0643\u0644\u0651\u064C \u0645\u0646 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0645\u0642\u062F\u0645\u0647\u0627 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632."
        }
      ],
      bullets: [
        {
          en: "A dedicated enquiry contact and coordination plan, with response timing and any on-site attendance agreed for the specific booking.",
          ar: "\u062C\u0647\u0629 \u062A\u0648\u0627\u0635\u0644 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0648\u062E\u0637\u0629 \u062A\u0646\u0633\u064A\u0642\u060C \u0645\u0639 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0648\u0642\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0648\u0623\u064A \u062D\u0636\u0648\u0631 \u0645\u064A\u062F\u0627\u0646\u064A \u0644\u0644\u062D\u062C\u0632 \u0627\u0644\u0645\u0639\u0646\u064A."
        },
        {
          en: "Shipment updates based on tracking and reporting supplied by the selected carrier or provider; visibility and update frequency vary by route and operator.",
          ar: "\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0641\u0642 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u064A \u064A\u0642\u062F\u0645\u0647\u0627 \u0627\u0644\u0646\u0627\u0642\u0644 \u0623\u0648 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u061B \u0625\u0630 \u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0631\u0624\u064A\u0629 \u0648\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u062D\u0633\u0628 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644."
        },
        {
          en: "A tailored scope can coordinate available freight, customs-document support, packing, storage, venue delivery and return routing, with provider roles clarified before dispatch.",
          ar: "\u064A\u0645\u0643\u0646 \u0644\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0635\u0645\u0645 \u062D\u0633\u0628 \u0627\u0644\u0637\u0644\u0628 \u062A\u0646\u0633\u064A\u0642 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0648\u062F\u0639\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0648\u062F\u0629\u060C \u0645\u0639 \u062A\u0648\u0636\u064A\u062D \u0623\u062F\u0648\u0627\u0631 \u0645\u0642\u062F\u0645\u064A \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644."
        }
      ]
    }
  ],
  venues: [
    {
      name: "Riyadh International Convention & Exhibition Center (RICEC)",
      nameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636",
      city: "Riyadh",
      cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636"
    },
    {
      name: "Riyadh Front Exhibition & Conference Center (RFECC)",
      nameAr: "\u0645\u0631\u0643\u0632 \u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A (RFECC)",
      city: "Riyadh",
      cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636"
    },
    {
      name: "Riyadh Exhibition and Convention Center (Malham)",
      nameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A (\u0645\u0644\u0647\u0645)",
      city: "Malham",
      cityAr: "\u0645\u0644\u0647\u0645"
    },
    {
      name: "Jeddah International Exhibition & Convention Center (Jeddah Forums and Events Center)",
      nameAr: "\u0645\u0631\u0643\u0632 \u062C\u062F\u0629 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A (\u0645\u0631\u0643\u0632 \u062C\u062F\u0629 \u0644\u0644\u0645\u0646\u062A\u062F\u064A\u0627\u062A \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A)",
      city: "Jeddah",
      cityAr: "\u062C\u062F\u0629"
    },
    {
      name: "Jeddah Superdome",
      nameAr: "\u0642\u0628\u0629 \u062C\u062F\u0629 (\u0633\u0648\u0628\u0631 \u062F\u0648\u0645)",
      city: "Jeddah",
      cityAr: "\u062C\u062F\u0629"
    },
    {
      name: "Dhahran Expo",
      nameAr: "\u0638\u0647\u0631\u0627\u0646 \u0625\u0643\u0633\u0628\u0648",
      city: "Dhahran",
      cityAr: "\u0627\u0644\u0638\u0647\u0631\u0627\u0646"
    }
  ],
  majorEvents: [
    { name: "LEAP", sector: "Technology", sectorAr: "\u0627\u0644\u062A\u0642\u0646\u064A\u0629", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "Cityscape Global", sector: "Real Estate", sectorAr: "\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "Big 5 Construct Saudi", sector: "Construction", sectorAr: "\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062A\u0634\u064A\u064A\u062F", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "Saudi Build", sector: "Construction", sectorAr: "\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062A\u0634\u064A\u064A\u062F", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "INDEX Saudi Arabia", sector: "Interiors & Design", sectorAr: "\u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u062F\u0627\u062E\u0644\u064A", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "Global Health Exhibition", sector: "Healthcare", sectorAr: "\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" },
    { name: "Foodex Saudi", sector: "Food & Beverage", sectorAr: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062A", city: "Jeddah", cityAr: "\u062C\u062F\u0629" },
    { name: "Automechanika Riyadh", sector: "Automotive", sectorAr: "\u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A", city: "Riyadh", cityAr: "\u0627\u0644\u0631\u064A\u0627\u0636" }
  ],
  relatedLinks: [
    { label: "ATA Carnet Coordination", labelAr: "\u062A\u0646\u0633\u064A\u0642 \u0643\u0627\u0631\u0646\u064A\u0647 ATA", href: "/services/ata-carnet" },
    { label: "Air Freight for Urgent Cargo", labelAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0639\u0627\u062C\u0644\u0629", href: "/services/air-freight" },
    { label: "Ocean Freight", labelAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A", href: "/services/ocean-freight" },
    { label: "Customs Clearance", labelAr: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "\u0627\u0644\u0634\u062D\u0646 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0646\u0642\u0644", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", href: "/services/project-cargo" },
    { label: "Warehousing & Distribution", labelAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0648\u0632\u064A\u0639", href: "/services/warehousing" },
    { label: "House Moving & Relocation", labelAr: "\u0646\u0642\u0644 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644", href: "/services/relocation" },
    { label: "GCC Transportation", labelAr: "\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u062F\u0627\u062E\u0644 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646", href: "/services/gcc-transportation" },
    { label: "Packaging & Crating Services", labelAr: "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642", href: "/services/packaging-crating" }
  ]
};

// src/lib/pillar-data/ata-carnet.ts
var ATA_CARNET_PILLAR = {
  seoTitle: "ATA Carnet Saudi Arabia & Temporary Import | ENVOD KINGDOM",
  seoDescription: "ATA Carnet and temporary-import coordination in Saudi Arabia: equipment lists, customs endorsements, eligibility checks and re-export planning for exhibition cargo.",
  intro: [
    {
      en: "An ATA Carnet is an international customs document for eligible goods moving temporarily under the ATA guarantee system. ENVOD KINGDOM SHIPPING SERVICES coordinates shipment documentation, customs endorsements and re-export planning for exhibition cargo entering or leaving Saudi Arabia. Carnets are issued by authorized associations, not automatically by the freight forwarder; confirm the goods, intended use and destination requirements before dispatch.",
      ar: "\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0645\u0633\u062A\u0646\u062F \u062C\u0645\u0631\u0643\u064A \u062F\u0648\u0644\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0624\u0647\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u064F\u0646\u0642\u0644 \u0645\u0624\u0642\u062A\u0627\u064B \u0636\u0645\u0646 \u0646\u0638\u0627\u0645 \u0627\u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647. \u062A\u0646\u0633\u0651\u0642 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645 \u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u062E\u0637\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062F\u0627\u062E\u0644\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0623\u0648 \u0627\u0644\u062E\u0627\u0631\u062C\u0629 \u0645\u0646\u0647\u0627. \u062A\u064F\u0635\u062F\u0631 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647\u0627\u062A \u062C\u0647\u0627\u062A \u0645\u062E\u0648\u0651\u0644\u0629\u060C \u0648\u0644\u064A\u0633 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B\u061B \u0644\u0630\u0627 \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u063A\u0631\u0636 \u0645\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u062C\u0647\u0629 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644."
    },
    {
      en: 'Known as the "passport for goods", a Carnet works through an international guarantee chain. The holder remains responsible for accurate item descriptions, values and serial numbers, correct customs endorsements, and re-export within the period customs permits, which can be earlier than the Carnet expiry date. Issuance, pre-approval, inspection and release depend on the responsible authorities; no fixed processing time or claim-free outcome is promised.',
      ar: "\u064A\u064F\u0639\u0631\u0641 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0628\u0640\xAB\u062C\u0648\u0627\u0632 \u0633\u0641\u0631 \u0627\u0644\u0628\u0636\u0627\u0626\u0639\xBB \u0648\u064A\u0639\u0645\u0644 \u0639\u0628\u0631 \u0633\u0644\u0633\u0644\u0629 \u0636\u0645\u0627\u0646 \u062F\u0648\u0644\u064A\u0629. \u0648\u064A\u0638\u0644 \u062D\u0627\u0645\u0644\u0647 \u0645\u0633\u0624\u0648\u0644\u0627\u064B \u0639\u0646 \u062F\u0642\u0629 \u0623\u0648\u0635\u0627\u0641 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0648\u0642\u064A\u0645\u0647\u0627 \u0648\u0623\u0631\u0642\u0627\u0645\u0647\u0627 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A\u0629\u060C \u0648\u0635\u062D\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629\u060C \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0636\u0645\u0646 \u0627\u0644\u0645\u0647\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0633\u0645\u062D \u0628\u0647\u0627 \u0627\u0644\u062C\u0645\u0627\u0631\u0643\u060C \u0648\u0642\u062F \u062A\u0643\u0648\u0646 \u0623\u0642\u0635\u0631 \u0645\u0646 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647. \u0648\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0633\u0628\u0642\u0629 \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u0641\u0633\u062D \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629\u060C \u062F\u0648\u0646 \u0648\u0639\u062F \u0628\u0645\u062F\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u062B\u0627\u0628\u062A\u0629 \u0623\u0648 \u062E\u0644\u0648\u0651 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0627\u062A."
    }
  ],
  sections: [
    {
      id: "what-is-an-ata-carnet",
      heading: {
        en: "What is an ATA Carnet?",
        ar: "\u0645\u0627 \u0647\u0648 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F"
      },
      paragraphs: [
        {
          en: "An ATA Carnet is an international customs document used for eligible temporary movements of goods under the ATA system. Country acceptance, permitted purpose, validity and guarantee terms depend on the issuing terms and authorities. For Saudi Arabia, confirm the current accepted use and shipment eligibility before relying on a Carnet.",
          ar: "\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0645\u0633\u062A\u0646\u062F \u062C\u0645\u0631\u0643\u064A \u062F\u0648\u0644\u064A \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0627\u0644\u0645\u0624\u0647\u0644\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0636\u0645\u0646 \u0646\u0638\u0627\u0645 ATA. \u0648\u064A\u0639\u062A\u0645\u062F \u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0644\u062F\u0627\u0646 \u0648\u0627\u0644\u063A\u0631\u0636 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0636\u0645\u0627\u0646 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A. \u0648\u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u060C \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0642\u0628\u0648\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0642\u0628\u0644 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647."
        },
        {
          en: "Where the authorities accept a Carnet for the specific goods and use, its guarantee mechanism may apply under the relevant terms. Issuing-association fees or security requirements can still apply. Customs controls, prior approvals, examination and other cargo-specific permits remain separate requirements.",
          ar: "\u0639\u0646\u062F\u0645\u0627 \u062A\u0642\u0628\u0644 \u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0644\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u062D\u062F\u062F\u064A\u0646\u060C \u0642\u062F \u062A\u0646\u0637\u0628\u0642 \u0622\u0644\u064A\u0629 \u0627\u0644\u0636\u0645\u0627\u0646 \u0648\u0641\u0642 \u0627\u0644\u0634\u0631\u0648\u0637 \u0630\u0627\u062A \u0627\u0644\u0635\u0644\u0629. \u0648\u0642\u062F \u062A\u0638\u0644 \u0631\u0633\u0648\u0645 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0623\u0648 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0642\u0627\u0626\u0645\u0629. \u0648\u062A\u0628\u0642\u0649 \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0633\u0628\u0642\u0629 \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629."
        }
      ],
      bullets: [
        {
          en: "Temporary admission only where the goods and intended use are eligible",
          ar: "\u0625\u062F\u062E\u0627\u0644 \u0645\u0624\u0642\u062A \u0641\u0642\u0637 \u0639\u0646\u062F \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u063A\u0631\u0636 \u0627\u0644\u0645\u0642\u0635\u0648\u062F"
        },
        {
          en: "Country acceptance and permitted use vary; confirm before dispatch",
          ar: "\u064A\u062E\u062A\u0644\u0641 \u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0644\u062F\u0627\u0646 \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0633\u0645\u0648\u062D\u061B \u0623\u0643\u0651\u062F \u0630\u0644\u0643 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644"
        },
        {
          en: "A recognized guarantee mechanism, subject to shipment acceptance and issuing terms",
          ar: "\u0622\u0644\u064A\u0629 \u0636\u0645\u0627\u0646 \u0645\u0639\u062A\u0631\u0641 \u0628\u0647\u0627\u060C \u0648\u0641\u0642 \u0642\u0628\u0648\u0644 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0634\u0631\u0648\u0637 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631"
        },
        {
          en: "Covers multiple trips and multiple countries on a single Carnet",
          ar: "\u064A\u063A\u0637\u064A \u0631\u062D\u0644\u0627\u062A \u0645\u062A\u0639\u062F\u062F\u0629 \u0648\u062F\u0648\u0644\u0627\u064B \u0645\u062A\u0639\u062F\u062F\u0629 \u0639\u0644\u0649 \u0643\u0627\u0631\u0646\u064A\u0647 \u0648\u0627\u062D\u062F"
        }
      ]
    },
    {
      id: "what-does-an-ata-carnet-cover",
      heading: {
        en: "What can you move on an ATA Carnet?",
        ar: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u0645\u0643\u0646 \u0646\u0642\u0644\u0647 \u0628\u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F"
      },
      paragraphs: [
        {
          en: "International ATA guidance describes broad categories such as exhibition goods, professional equipment and commercial samples. That global description does not establish Saudi eligibility for every category: confirm the destination, intended use and specific items with the authorized issuing association and customs authorities. Consumables, giveaways or goods to be sold or left behind may require another import procedure.",
          ar: "\u062A\u0630\u0643\u0631 \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0644\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0641\u0626\u0627\u062A \u0639\u0627\u0645\u0629 \u0645\u062B\u0644 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0648\u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629. \u0648\u0644\u0627 \u062A\u062B\u0628\u062A \u0647\u0630\u0647 \u0627\u0644\u0641\u0626\u0627\u062A \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0623\u0647\u0644\u064A\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061B \u0644\u0630\u0627 \u0623\u0643\u0651\u062F \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629. \u0648\u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0648\u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u062F\u0629 \u0644\u0644\u0628\u064A\u0639 \u0623\u0648 \u0627\u0644\u062A\u064A \u0633\u062A\u064F\u062A\u0631\u0643 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0622\u062E\u0631."
        }
      ],
      bullets: [
        {
          en: "Exhibition & event goods \u2014 stands, displays, samples and demo units",
          ar: "\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u2014 \u0627\u0644\u0623\u062C\u0646\u062D\u0629 \u0648\u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0627\u062A \u0648\u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0648\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636"
        },
        {
          en: "Professional equipment \u2014 broadcast, film, survey, medical and test gear",
          ar: "\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u2014 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0628\u062B \u0648\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0648\u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0648\u0627\u0644\u0637\u0628 \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631"
        },
        {
          en: "Commercial samples \u2014 products shown to buyers before an order is placed",
          ar: "\u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u2014 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0642\u0628\u0644 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0637\u0644\u0628"
        },
        {
          en: "Tools, instruments and equipment for on-site projects and maintenance",
          ar: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0648\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629"
        }
      ]
    },
    {
      id: "how-envod-processes-ata-carnets",
      heading: {
        en: "How ENVOD coordinates your ATA Carnet shipment",
        ar: "\u0643\u064A\u0641 \u062A\u0646\u0633\u0651\u0642 \u0625\u0646\u0641\u0648\u062F \u0634\u062D\u0646\u062A\u0643 \u0628\u0643\u0627\u0631\u0646\u064A\u0647 ATA"
      },
      paragraphs: [
        {
          en: "Before dispatch, check that the item list, values and serial numbers match the goods, and confirm the validity period, required endorsements and re-export deadline. ENVOD can coordinate shipment information and document checks; the holder remains responsible for the Carnet, while the issuing association and customs authorities determine issuance, acceptance and discharge.",
          ar: "\u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u060C \u062A\u062D\u0642\u0651\u0642 \u0645\u0646 \u062A\u0637\u0627\u0628\u0642 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0648\u0627\u0644\u0642\u064A\u0645 \u0648\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639\u060C \u0648\u0623\u0643\u0651\u062F \u0645\u062F\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u0645\u0648\u0639\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u062A\u0646\u0633\u064A\u0642 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u061B \u0648\u064A\u0638\u0644 \u062D\u0627\u0645\u0644 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0645\u0633\u0624\u0648\u0644\u0627\u064B \u0639\u0646\u0647\u060C \u0628\u064A\u0646\u0645\u0627 \u062A\u062D\u062F\u062F \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0627\u0644\u0625\u0628\u0631\u0627\u0621."
        }
      ],
      bullets: [
        {
          en: "Eligibility review and accurate general list of goods with values",
          ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0625\u0639\u062F\u0627\u062F \u0642\u0627\u0626\u0645\u0629 \u0639\u0627\u0645\u0629 \u062F\u0642\u064A\u0642\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0628\u0642\u064A\u0645\u0647\u0627"
        },
        {
          en: "Issuance and guarantee requirements confirmed with the authorized association",
          ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0636\u0645\u0627\u0646 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629"
        },
        {
          en: "Customs endorsement at export, import, re-export and re-import",
          ar: "\u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0639\u0646\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F"
        },
        {
          en: "Keep endorsement and re-export evidence for the issuing association's discharge review",
          ar: "\u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0625\u062B\u0628\u0627\u062A\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0625\u0628\u0631\u0627\u0621 \u0644\u062F\u0649 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631"
        }
      ]
    },
    {
      id: "why-envod-for-ata-carnets",
      heading: {
        en: "Why choose ENVOD for ATA Carnets in Saudi Arabia",
        ar: "\u0644\u0645\u0627\u0630\u0627 \u062A\u062E\u062A\u0627\u0631 \u0625\u0646\u0641\u0648\u062F \u0644\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629"
      },
      paragraphs: [
        {
          en: "An ATA shipment involves separate responsibilities for the holder, issuing association, carrier, customs broker and authorities. ENVOD can review the requested transport and document-coordination scope; confirm who issues the Carnet, who files declarations and who obtains any approvals before booking.",
          ar: "\u062A\u062A\u0636\u0645\u0646 \u0634\u062D\u0646\u0629 ATA \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629 \u0644\u062D\u0627\u0645\u0644 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0648\u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u062E\u0644\u0651\u0635 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0646\u0642\u0644 \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u061B \u0623\u0643\u0651\u062F \u062C\u0647\u0629 \u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u062A\u064A \u062A\u0642\u062F\u0645 \u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632."
        }
      ],
      bullets: [
        {
          en: "Documentation and deadline planning for time-critical shipments",
          ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0651\u0627\u0633\u0629 \u0644\u0644\u0648\u0642\u062A"
        },
        {
          en: "Shipment, customs and document responsibilities scoped before booking",
          ar: "\u062A\u062D\u062F\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632"
        },
        {
          en: "Coordination with the authorized issuing association and responsible authorities",
          ar: "\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629"
        },
        {
          en: "Integrated air, sea and road freight to and from the venue or site",
          ar: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0648\u0628\u062D\u0631\u064A \u0648\u0628\u0631\u064A \u0645\u062A\u0643\u0627\u0645\u0644 \u0645\u0646 \u0648\u0625\u0644\u0649 \u0627\u0644\u0645\u0643\u0627\u0646 \u0623\u0648 \u0627\u0644\u0645\u0648\u0642\u0639"
        }
      ]
    }
  ],
  venues: [],
  majorEvents: [],
  relatedLinks: [
    { label: "Exhibition & Event Logistics", labelAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A", href: "/services/exhibition-logistics" },
    { label: "Customs Clearance", labelAr: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "\u0627\u0644\u0634\u062D\u0646 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0646\u0642\u0644", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", href: "/services/project-cargo" }
  ]
};

// src/lib/relocation-options.ts
var RESTORED_RELOCATION_OPTIONS = [
  { name: "Residential relocation enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0646\u062A\u0642\u0627\u0644 \u0633\u0643\u0646\u064A", desc: "Share inventory, packing needs, dates and origin/destination addresses to review provider options and scope.", descAr: "\u0623\u0631\u0633\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0648\u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642." },
  { name: "Corporate relocation enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0646\u062A\u0642\u0627\u0644 \u0645\u0624\u0633\u0633\u064A", desc: "Employee or office moves require a project-specific inventory, schedule, access and provider-availability review.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u0627\u0646\u062A\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0623\u0648 \u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0643\u0644 \u0645\u0634\u0631\u0648\u0639." },
  { name: "International relocation enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0646\u062A\u0642\u0627\u0644 \u062F\u0648\u0644\u064A", desc: "Confirm origin and destination coverage, packing scope, import requirements and each party's responsibilities before booking.", descAr: "\u0623\u0643\u0651\u062F \u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0643\u0644 \u0637\u0631\u0641 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
  { name: "Export Packing", nameAr: "\u062A\u063A\u0644\u064A\u0641 \u0644\u0644\u062A\u0635\u062F\u064A\u0631", desc: "Discuss packing requirements; material, treatment, marking and provider records must be confirmed for the shipment and destination.", descAr: "\u0646\u0627\u0642\u0634 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0633\u062C\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0648\u062C\u0647\u0629." },
  { name: "Industrial packing enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u063A\u0644\u064A\u0641 \u0635\u0646\u0627\u0639\u064A", desc: "Cargo protection, materials, load dimensions and qualified-provider availability need confirmation.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0645\u0648\u0644\u0629 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
  { name: "Wooden-crate requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u062E\u0634\u0628\u064A\u0629", desc: "Confirm destination rules, treatment and marking requirements, crate design and provider records.", descAr: "\u0623\u0643\u0651\u062F \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0648\u0633\u062C\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629." },
  { name: "Moisture-protection enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062D\u0645\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0631\u0637\u0648\u0628\u0629", desc: "Discuss the cargo's packaging and environmental requirements with an available qualified provider.", descAr: "\u0646\u0627\u0642\u0634 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0638\u0631\u0648\u0641 \u0627\u0644\u0628\u064A\u0626\u064A\u0629 \u0645\u0639 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u0645\u062A\u0627\u062D." },
  { name: "Protective wrapping enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0648\u0642\u0627\u0626\u064A", desc: "Material suitability, cargo dimensions and application scope require confirmation.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u0645\u0644\u0627\u0621\u0645\u0629 \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
  { name: "Palletizing enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u0631\u0635 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062A", desc: "Confirm pallet specification, cargo weight, stacking and handling requirements.", descAr: "\u0623\u0643\u0651\u062F \u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0648\u0632\u0646 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0643\u062F\u064A\u0633 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629." },
  { name: "Cargo-securing requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639", desc: "Lashing method, load points and responsible qualified provider must be agreed for the shipment.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0631\u0628\u0637 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u062D\u0645\u0644 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0644\u0644\u0634\u062D\u0646\u0629." },
  { name: "Loading and unloading enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u062A\u0641\u0631\u064A\u063A", desc: "Site access, equipment, load plan, operator and insurance responsibilities require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u062E\u0637\u0629 \u0627\u0644\u062D\u0645\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
  { name: "On-site handling enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0646\u0627\u0648\u0644\u0629 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639", desc: "Share the site, cargo, schedule and requested tasks to confirm available provider scope.", descAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u062D." },
  { name: "Pet relocation requirements review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0644\u064A\u0641\u0629", desc: "Species-specific permissions, health documents, carrier acceptance and qualified-provider availability require confirmation.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0646\u0648\u0639 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
  { name: "Vehicle-shipping enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0645\u0631\u0643\u0628\u0629", desc: "Vehicle eligibility, route, carrier acceptance, customs responsibilities and onward-delivery scope must be reviewed.", descAr: "\u064A\u062C\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0644\u0627\u062D\u0642." }
];

// src/lib/door-to-door.ts
var DOOR_TO_DOOR_META = {
  id: 25,
  slug: "door-to-door",
  gradient: "linear-gradient(135deg,#071421,#172b3c)",
  accentHex: "#ec2529",
  industries: [],
  industriesAr: [],
  whyEnvod: [],
  process: [
    { en: "Share collection and delivery requirements", ar: "\u0623\u0631\u0633\u0644 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645" },
    { en: "Review route and transport options", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0642\u0644" },
    { en: "Confirm customs and operator responsibilities", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644" }
  ],
  subServices: [
    { name: "Collection and delivery requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645", desc: "Share addresses, cargo details and timing so the requested collection and delivery scope can be reviewed.", descAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628." },
    { name: "Route and responsibility review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A", desc: "Transport options, customs responsibilities, operators and the agreed scope are confirmed per shipment.", descAr: "\u062A\u064F\u0624\u0643\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0642\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." }
  ],
  faq: [{ q: "Is every door-to-door shipment offered on the same terms?", a: "No. Collection, transport, customs responsibilities, operators and delivery requirements depend on the route and shipment. The agreed scope must be confirmed before booking.", qAr: "\u0647\u0644 \u062A\u064F\u0642\u062F\u0645 \u0643\u0644 \u0634\u062D\u0646\u0629 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0628\u0627\u0644\u0634\u0631\u0648\u0637 \u0646\u0641\u0633\u0647\u0627\u061F", aAr: "\u0644\u0627. \u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0646\u0642\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0648\u0646 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0634\u062D\u0646\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }]
};

// src/lib/service-review-faq.ts
var SERVICE_REVIEW_FAQ = {
  "customs-clearance": [
    { q: "Does advance filing through Fasah mean the goods have been released?", a: "No. ZATCA's published import instructions call for submitting documents and creating the customs declaration at least 48 hours before arrival. This is an advance-filing requirement, not a promise of clearance within 48 hours. Validation, inspection, product approvals and the release decision are separate steps controlled by the responsible authorities. Check the current instructions for your shipment.", qAr: "\u0647\u0644 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0628\u064A\u0627\u0646 \u0645\u0633\u0628\u0642\u0627\u064B \u0639\u0628\u0631 \u0641\u0633\u062D \u064A\u0639\u0646\u064A \u0641\u0633\u062D \u0627\u0644\u0628\u0636\u0627\u0639\u0629\u061F", aAr: "\u0644\u0627. \u062A\u0637\u0644\u0628 \u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629 \u0644\u062F\u0649 \u0627\u0644\u0647\u064A\u0626\u0629 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0642\u0628\u0644 \u0648\u0635\u0648\u0644 \u0627\u0644\u0634\u062D\u0646\u0629 \u0628\u0641\u062A\u0631\u0629 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 \u0664\u0668 \u0633\u0627\u0639\u0629. \u0647\u0630\u0647 \u0645\u0647\u0644\u0629 \u0644\u0644\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0645\u0633\u0628\u0642 \u0648\u0644\u064A\u0633\u062A \u0648\u0639\u062F\u0627\u064B \u0628\u0641\u0633\u062D \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u062E\u0644\u0627\u0644 \u0664\u0668 \u0633\u0627\u0639\u0629. \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0628\u064A\u0627\u0646 \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0642\u0631\u0627\u0631 \u0627\u0644\u0641\u0633\u062D \u062E\u0637\u0648\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629 \u062A\u062E\u0636\u0639 \u0644\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629. \u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0634\u062D\u0646\u062A\u0643." },
    { q: "What is the difference between customs coordination, brokerage and product conformity?", a: "Document coordination helps prepare shipment information. Filing declarations requires the responsible authorized operator and any necessary customs-broker authorization. Fasah is a customs-services platform; SABER handles product registration and conformity services, while SFDA requirements depend on the regulated goods. These roles do not replace one another or prove an ENVOD licence. ENVOD's role, the operator, gateway and responsibilities are confirmed before booking.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0645\u0631\u062E\u0651\u0635 \u0648\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u061F", aAr: "\u064A\u0633\u0627\u0639\u062F \u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0641\u064A \u062A\u062C\u0647\u064A\u0632 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629. \u0623\u0645\u0627 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0628\u064A\u0627\u0646 \u0641\u064A\u062A\u0637\u0644\u0628 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0648\u0623\u064A \u062A\u0641\u0648\u064A\u0636 \u0644\u0627\u0632\u0645 \u0644\u0644\u0645\u062E\u0644\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A. \u0641\u0633\u062D \u0645\u0646\u0635\u0629 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629\u060C \u0648\u0633\u0627\u0628\u0631 \u0644\u062E\u062F\u0645\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629\u060C \u0648\u062A\u062E\u062A\u0644\u0641 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621 \u0628\u062D\u0633\u0628 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0631\u0642\u0627\u0628\u062A\u0647\u0627. \u0644\u0627 \u062A\u062D\u0644 \u0647\u0630\u0647 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0645\u062D\u0644 \u0628\u0639\u0636\u0647\u0627 \u0648\u0644\u0627 \u062A\u062B\u0628\u062A \u062A\u0631\u062E\u064A\u0635\u0627\u064B \u0644\u0625\u0646\u0641\u0648\u062F. \u064A\u064F\u0624\u0643\u062F \u062F\u0648\u0631 \u0625\u0646\u0641\u0648\u062F \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0648\u0627\u0644\u0645\u0646\u0641\u0630 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
  ],
  relocation: [
    { q: "How does a Riyadh move differ from an intercity or international move?", a: "For a local move, describe both areas, building access, inventory and the preferred moving date. A Riyadh-to-Jeddah or Riyadh-to-Dammam enquiry also needs the transport route, loading and delivery windows, and responsibility at both ends. International moves require destination-specific import and document checks. Mentioning a city does not imply an ENVOD branch or an owned moving crew; provider availability and scope are confirmed for the request.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0646\u0642\u0644 \u0627\u0644\u0639\u0641\u0634 \u062F\u0627\u062E\u0644 \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u0627\u0644\u0646\u0642\u0644 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646 \u0623\u0648 \u062F\u0648\u0644\u064A\u0627\u064B\u061F", aAr: "\u0644\u0644\u0646\u0642\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u060C \u0648\u0636\u0651\u062D \u0645\u0646\u0637\u0642\u062A\u064A \u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0628\u0646\u064A\u064A\u0646 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0641\u0636\u0644. \u0648\u064A\u062D\u062A\u0627\u062C \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u0646\u0642\u0644 \u0639\u0641\u0634 \u0645\u0646 \u0627\u0644\u0631\u064A\u0627\u0636 \u0625\u0644\u0649 \u062C\u062F\u0629 \u0623\u0648 \u0627\u0644\u062F\u0645\u0627\u0645 \u0623\u064A\u0636\u0627\u064B \u0625\u0644\u0649 \u062A\u062D\u062F\u064A\u062F \u0645\u0633\u0627\u0631 \u0627\u0644\u0646\u0642\u0644 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0637\u0631\u0641\u064A\u0646. \u0623\u0645\u0627 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062F\u0648\u0644\u064A \u0641\u064A\u062D\u062A\u0627\u062C \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0641\u064A \u0628\u0644\u062F \u0627\u0644\u0648\u062C\u0647\u0629. \u0644\u0627 \u064A\u0639\u0646\u064A \u0630\u0643\u0631 \u0645\u062F\u064A\u0646\u0629 \u0648\u062C\u0648\u062F \u0641\u0631\u0639 \u0644\u0625\u0646\u0641\u0648\u062F \u0623\u0648 \u0641\u0631\u064A\u0642 \u0646\u0642\u0644 \u0645\u0645\u0644\u0648\u0643 \u0644\u0647\u0627\u061B \u0648\u064A\u064F\u0624\u0643\u062F \u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0644\u0643\u0644 \u0637\u0644\u0628." },
    { q: "What should I include in an international relocation enquiry?", a: "Provide origin and destination addresses, inventory, preferred dates, packing requirements and any restricted or high-value items. Check household-goods eligibility, customs procedures, coverage, insurance and provider responsibilities for the specific route; no door-to-door service is assumed.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u0623\u0631\u0633\u0644\u0647\u0627 \u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0646\u062A\u0642\u0627\u0644 \u062F\u0648\u0644\u064A\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0639\u0646\u0648\u0627\u0646\u064A \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0623\u064A \u0623\u0635\u0646\u0627\u0641 \u0645\u0642\u064A\u062F\u0629 \u0623\u0648 \u062B\u0645\u064A\u0646\u0629. \u062A\u062D\u0642\u0651\u0642 \u0645\u0646 \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0623\u0645\u062A\u0639\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u062A\u063A\u0637\u064A\u0629 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u062D\u062F\u062F\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u062E\u062F\u0645\u0629 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628." }
  ],
  "exhibition-logistics": [
    { q: "How should I compare exhibition logistics providers in Saudi Arabia?", a: "Compare the proposed freight route, cargo-document review, temporary-admission options, venue delivery window, unloading responsibilities and return plan. Ask who contracts and performs each task, which venue approvals are needed and what the quotation excludes. ENVOD reviews the event and shipment brief before confirming available coordination scope; no ranking or official organizer appointment is implied.", qAr: "\u0643\u064A\u0641 \u0623\u0642\u0627\u0631\u0646 \u0634\u0631\u0643\u0627\u062A \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u0642\u0627\u0631\u0646 \u0645\u0633\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0648\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0648\u062E\u0637\u0629 \u0627\u0644\u0625\u0639\u0627\u062F\u0629. \u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062A\u0639\u0627\u0642\u062F\u0629 \u0648\u0627\u0644\u0645\u0646\u0641\u0630\u0629 \u0644\u0643\u0644 \u0645\u0647\u0645\u0629 \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0627 \u064A\u0633\u062A\u062B\u0646\u064A\u0647 \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631. \u062A\u0631\u0627\u062C\u0639 \u0625\u0646\u0641\u0648\u062F \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0634\u062D\u0646\u0629 \u0642\u0628\u0644 \u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u062A\u0627\u062D\u060C \u062F\u0648\u0646 \u0627\u062F\u0639\u0627\u0621 \u062A\u0631\u062A\u064A\u0628 \u062A\u0646\u0627\u0641\u0633\u064A \u0623\u0648 \u062A\u0639\u064A\u064A\u0646 \u0631\u0633\u0645\u064A \u0645\u0646 \u0627\u0644\u0645\u0646\u0638\u0651\u0645." },
    { q: "Does exhibition freight coordination include event management or booth construction?", a: "Not automatically. Transport, customs-document coordination and delivery planning are different from event production, booth design, construction and crowd management. Confirm the organizer's appointed contractors and the agreed on-site tasks. Only the responsibilities, providers and services expressly confirmed in the quotation should be treated as included.", qAr: "\u0647\u0644 \u064A\u0634\u0645\u0644 \u062A\u0646\u0633\u064A\u0642 \u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0623\u0648 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u0646\u0627\u062D\u061F", aAr: "\u0644\u064A\u0633 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B. \u0627\u0644\u0646\u0642\u0644 \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u062A\u062E\u062A\u0644\u0641 \u0639\u0646 \u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u062C\u0646\u0627\u062D \u0648\u0625\u0646\u0634\u0627\u0626\u0647 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0634\u0648\u062F. \u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0644\u062F\u0649 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0627. \u0644\u0627 \u062A\u064F\u0639\u062F \u0645\u0634\u0645\u0648\u0644\u0629 \u0625\u0644\u0627 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0648\u0645\u0642\u062F\u0645\u0648 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0624\u0643\u062F\u0629 \u0635\u0631\u0627\u062D\u0629\u064B \u0641\u064A \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631." }
  ]
};

// src/lib/service-data.ts
var SERVICE_META = {
  1: {
    id: 1,
    slug: "ocean-freight",
    gradient: "linear-gradient(135deg,#0a1f3c 0%,#0d2d4a 50%,#071828 100%)",
    accentHex: "#0ea5e9",
    industries: ["Oil & Gas", "Construction", "Automotive", "Retail & FMCG", "Industrial Manufacturing"],
    industriesAr: ["\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062A\u0634\u064A\u064A\u062F", "\u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A", "\u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0648\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A"],
    process: [
      { en: "Booking & Planning", ar: "\u0627\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u062A\u062E\u0637\u064A\u0637" },
      { en: "Documentation", ar: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642" },
      { en: "Port Departure", ar: "\u0645\u063A\u0627\u062F\u0631\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621" },
      { en: "Sea Transit", ar: "\u0627\u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u0628\u062D\u0631\u064A" },
      { en: "Customs Clearance", ar: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A" },
      { en: "Port Arrival", ar: "\u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u064A\u0646\u0627\u0621" },
      { en: "Final Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064A" }
    ],
    subServices: [
      { name: "Full Container Load (FCL)", nameAr: "\u062D\u0627\u0648\u064A\u0629 \u0643\u0627\u0645\u0644\u0629 (FCL)", desc: "Exclusive use of a full container for your shipment.", descAr: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u062D\u0627\u0648\u064A\u0629 \u0643\u0627\u0645\u0644\u0629 \u062D\u0635\u0631\u064A\u0627\u064B \u0644\u0634\u062D\u0646\u062A\u0643." },
      { name: "Less-than-Container Load (LCL)", nameAr: "\u062D\u0627\u0648\u064A\u0629 \u062C\u0632\u0626\u064A\u0629 (LCL)", desc: "Share container space \u2014 ideal for smaller shipments.", descAr: "\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u2014 \u0645\u062B\u0627\u0644\u064A \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0635\u063A\u064A\u0631\u0629." },
      { name: "Break Bulk Shipment", nameAr: "\u0634\u062D\u0646 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643", desc: "Non-containerized cargo for oversized or irregular items.", descAr: "\u0628\u0636\u0627\u0626\u0639 \u063A\u064A\u0631 \u062D\u0627\u0648\u064A\u0629 \u0644\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0636\u062E\u0645\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0627\u0644\u0645\u0646\u062A\u0638\u0645\u0629." },
      { name: "RoRo Shipping", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u062D\u0631\u062C\u064A (\u0631\u0648\u0631\u0648)", desc: "Roll-on/roll-off service for vehicles and wheeled cargo.", descAr: "\u062E\u062F\u0645\u0629 \u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0644\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0630\u0627\u062A \u0627\u0644\u0639\u062C\u0644\u0627\u062A." },
      { name: "Project Cargo Shipping", nameAr: "\u0634\u062D\u0646 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", desc: "Heavy and oversized industrial project cargo via sea.", descAr: "\u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0627\u0644\u0636\u062E\u0645\u0629." },
      { name: "Heavy Lift Shipping", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u062B\u0642\u064A\u0644", desc: "Crane-assisted heavy lift sea freight for industrial loads.", descAr: "\u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0628\u0631\u0627\u0641\u0639\u0629 \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0642\u064A\u0644\u0629." },
      { name: "Container Consolidation", nameAr: "\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A", desc: "Groupage services combining multiple smaller shipments.", descAr: "\u062E\u062F\u0645\u0627\u062A \u062A\u062C\u0645\u064A\u0639 \u062A\u0636\u0645 \u0634\u062D\u0646\u0627\u062A \u0623\u0635\u063A\u0631 \u0645\u062A\u0639\u062F\u062F\u0629 \u0645\u0639\u0627\u064B." },
      { name: "Reefer Containers", nameAr: "\u062D\u0627\u0648\u064A\u0627\u062A \u0645\u0628\u0631\u062F\u0629", desc: "Temperature-controlled containers for perishables.", descAr: "\u062D\u0627\u0648\u064A\u0627\u062A \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0644\u0641." },
      { name: "Door-to-Port", nameAr: "\u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u064A\u0646\u0627\u0621", desc: "Pickup from shipper's door to destination port.", descAr: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0646 \u0628\u0627\u0628 \u0627\u0644\u0645\u064F\u0631\u0633\u0650\u0644 \u0648\u062A\u0633\u0644\u064A\u0645 \u0641\u064A \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0642\u0635\u0648\u062F." },
      { name: "Door-to-Door Sea Freight", nameAr: "\u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628 \u0628\u062D\u0631\u0627\u064B", desc: "Full sea freight service from origin to final destination.", descAr: "\u062E\u062F\u0645\u0629 \u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0643\u0627\u0645\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u0634\u0623 \u0625\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629." },
      { name: "Dangerous Goods Sea Freight", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Classification, documents, packing and carrier acceptance must be confirmed for each cargo.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Customs Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A", desc: "Customs responsibilities and the responsible operator are confirmed for each route.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0644\u0643\u0644 \u0645\u0633\u0627\u0631." },
      { name: "Port Handling", nameAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621", desc: "Terminal and port-handling arrangements depend on the carrier, gateway and booking scope.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u062D\u0637\u0629 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Import & Export Management", nameAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0631", desc: "Import or export coordination is scoped to the cargo, route and responsible operators.", descAr: "\u064A\u064F\u062D\u062F\u062F \u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0623\u0648 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629." }
    ],
    whyEnvod: [
      { en: "Gateway routing checked against the carrier service and inland destination", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0641\u0642 \u062E\u062F\u0645\u0629 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629" },
      { en: "Carrier and agent coordination for international shipping", ar: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A" },
      { en: "Customs responsibilities confirmed for each booking", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0643\u0644 \u062D\u062C\u0632" },
      { en: "Manual shipment-status enquiries handled by the contact team", ar: "\u064A\u062A\u0648\u0644\u0649 \u0641\u0631\u064A\u0642 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u062D\u0627\u0644\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u064A\u062F\u0648\u064A\u0627\u064B" },
      { en: "FCL and LCL options reviewed against route and cargo requirements", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A FCL \u0648LCL \u0648\u0641\u0642 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0639\u0629" }
    ],
    overview: [
      { en: "Ocean freight moves goods by sea in containers or as breakbulk. Common booking types include Full Container Load (FCL) and Less-than-Container Load (LCL); breakbulk and roll-on/roll-off (RoRo) depend on cargo suitability, route and carrier acceptance. Ask ENVOD KINGDOM SHIPPING SERVICES to review the shipment scope and available options.", ar: "\u064A\u0646\u0642\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0639\u0646 \u0637\u0631\u064A\u0642 \u0627\u0644\u0628\u062D\u0631 \u0641\u064A \u062D\u0627\u0648\u064A\u0627\u062A \u0623\u0648 \u0643\u0628\u0636\u0627\u0626\u0639 \u0633\u0627\u0626\u0628\u0629 \u063A\u064A\u0631 \u062D\u0627\u0648\u064A\u0629. \u062A\u0634\u0645\u0644 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062D\u062C\u0632 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 (FCL) \u0648\u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u062C\u0632\u0626\u064A\u0629 (LCL)\u060C \u0628\u064A\u0646\u0645\u0627 \u062A\u0639\u062A\u0645\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0648\u0627\u0644\u062F\u062D\u0631\u062C\u0629 (RoRo) \u0639\u0644\u0649 \u0645\u0644\u0627\u0621\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644. \u0623\u0631\u0633\u0644 \u0644\u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u062D\u064A\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629." },
      { en: "Saudi ocean-freight planning can involve Jeddah Islamic Port or King Abdulaziz Port in Dammam, depending on the carrier service and inland destination. Confirm booking acceptance, customs responsibility and local charges for your shipment. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.", ar: "\u0642\u062F \u064A\u0634\u0645\u0644 \u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A \u0623\u0648 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0627\u0644\u062F\u0645\u0627\u0645\u060C \u0648\u0641\u0642 \u062E\u062F\u0645\u0629 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629. \u0623\u0643\u0651\u062F \u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u062C\u0632 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0644\u0634\u062D\u0646\u062A\u0643. \u0642\u062F \u062A\u062E\u062A\u0644\u0641 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629." }
    ],
    faq: [
      { q: "What is the difference between FCL and LCL?", a: "FCL (Full Container Load) means you rent an entire container exclusively. LCL (Less-than-Container Load) means your cargo shares space with others \u2014 ideal when your cargo doesn't fill a full container.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 FCL \u0648LCL\u061F", aAr: "FCL \u062A\u0639\u0646\u064A \u0627\u0633\u062A\u0626\u062C\u0627\u0631 \u062D\u0627\u0648\u064A\u0629 \u0643\u0627\u0645\u0644\u0629 \u062D\u0635\u0631\u064A\u0627\u064B. LCL \u062A\u0639\u0646\u064A \u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0645\u0639 \u0634\u062D\u0646\u0627\u062A \u0623\u062E\u0631\u0649 \u2014 \u0645\u062B\u0627\u0644\u064A\u0629 \u0639\u0646\u062F\u0645\u0627 \u0644\u0627 \u062A\u0645\u0644\u0623 \u0634\u062D\u0646\u062A\u0643 \u062D\u0627\u0648\u064A\u0629 \u0643\u0627\u0645\u0644\u0629." },
      { q: "How long does ocean freight from China take?", a: "Transit time depends on the origin and destination ports, carrier schedule, routing and customs steps. Share the route, cargo details and ready date to ask about current options; no fixed transit time is promised.", qAr: "\u0643\u0645 \u062A\u0633\u062A\u063A\u0631\u0642 \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0645\u0646 \u0627\u0644\u0635\u064A\u0646\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u0629 \u0627\u0644\u0639\u0628\u0648\u0631 \u0639\u0644\u0649 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629. \u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u0648\u0639\u062F \u062C\u0627\u0647\u0632\u064A\u062A\u0647\u0627 \u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629\u061B \u0648\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062F\u0629 \u0639\u0628\u0648\u0631 \u062B\u0627\u0628\u062A\u0629 \u0645\u0636\u0645\u0648\u0646\u0629." },
      { q: "Can you coordinate customs for a Saudi port shipment?", a: "Gateway and customs scope are confirmed per shipment. Common gateways to discuss include Jeddah Islamic Port, King Abdulaziz Port in Dammam and Riyadh Dry Port. Share the cargo type, route and terminal details; customs decisions and release remain with the responsible authorities.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0634\u062D\u0646\u0629 \u0639\u0628\u0631 \u0623\u062D\u062F \u0627\u0644\u0645\u0646\u0627\u0641\u0630 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629. \u0645\u0646 \u0627\u0644\u0645\u0646\u0627\u0641\u0630 \u0627\u0644\u062A\u064A \u064A\u0645\u0643\u0646 \u0645\u0646\u0627\u0642\u0634\u062A\u0647\u0627 \u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A \u0648\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0627\u0644\u062F\u0645\u0627\u0645 \u0648\u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u062C\u0627\u0641 \u0628\u0627\u0644\u0631\u064A\u0627\u0636. \u0623\u0631\u0633\u0644 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u062D\u0637\u0629\u061B \u0648\u062A\u0628\u0642\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0641\u0633\u062D \u0645\u0646 \u0627\u062E\u062A\u0635\u0627\u0635 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0639\u0646\u064A\u0629." },
      { q: "How do I arrange container shipping to Saudi Arabia?", a: "Share the origin, Saudi destination, cargo-ready date, package count, dimensions and gross weight. For FCL, include the required container size and loading details; for LCL, provide the packed dimensions and weight of each piece. Carrier, route, port, customs responsibilities, charges and final-delivery scope must be confirmed for the shipment before booking.", qAr: "\u0643\u064A\u0641 \u0623\u0631\u062A\u0628 \u0634\u062D\u0646 \u062D\u0627\u0648\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u062A\u0627\u0631\u064A\u062E \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0639\u062F\u062F \u0627\u0644\u0637\u0631\u0648\u062F \u0648\u0623\u0628\u0639\u0627\u062F\u0647\u0627 \u0648\u0648\u0632\u0646\u0647\u0627 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A. \u0644\u0634\u062D\u0646 FCL\u060C \u0623\u0636\u0641 \u0645\u0642\u0627\u0633 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u061B \u0648\u0644\u0634\u062D\u0646 LCL\u060C \u0623\u0631\u0633\u0644 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0628\u0639\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0644\u0643\u0644 \u0642\u0637\u0639\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0634\u062D\u0646\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ]
  },
  2: {
    id: 2,
    slug: "air-freight",
    gradient: "linear-gradient(135deg,#0c1a3a 0%,#1a0a3a 50%,#070a28 100%)",
    accentHex: "#8b5cf6",
    industries: ["Pharmaceuticals", "Electronics", "E-commerce", "Perishables", "Fashion & Luxury"],
    industriesAr: ["\u0627\u0644\u0623\u062F\u0648\u064A\u0629", "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", "\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u062A\u0644\u0641", "\u0627\u0644\u0623\u0632\u064A\u0627\u0621 \u0648\u0627\u0644\u0641\u0627\u062E\u0631\u0629"],
    process: [
      { en: "Booking", ar: "\u0627\u0644\u062D\u062C\u0632" },
      { en: "Pickup", ar: "\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645" },
      { en: "Export Docs", ar: "\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u062A\u0635\u062F\u064A\u0631" },
      { en: "Airport Departure", ar: "\u0627\u0644\u0645\u063A\u0627\u062F\u0631\u0629" },
      { en: "Air Transit", ar: "\u0627\u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u062C\u0648\u064A" },
      { en: "Airport Arrival", ar: "\u0627\u0644\u0648\u0635\u0648\u0644" },
      { en: "Customs & Delivery", ar: "\u062A\u062E\u0644\u064A\u0635 \u0648\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Express Air Freight", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0633\u0631\u064A\u0639", desc: "Urgent cargo routing, subject to carrier capacity and acceptance.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0645\u0633\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0639\u0627\u062C\u0644 \u062D\u0633\u0628 \u0633\u0639\u0629 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0642\u0628\u0648\u0644\u0647." },
      { name: "Standard Air Freight", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0642\u064A\u0627\u0633\u064A", desc: "Review flight options, consolidation and routing for your cargo.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0639 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0644\u0634\u062D\u0646\u062A\u0643." },
      { name: "Airport-to-Airport", nameAr: "\u0645\u0646 \u0645\u0637\u0627\u0631 \u0644\u0645\u0637\u0627\u0631", desc: "Standard cargo handled terminal-to-terminal.", descAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0645\u0646 \u0635\u0627\u0644\u0629 \u0625\u0644\u0649 \u0635\u0627\u0644\u0629." },
      { name: "Door-to-Door Air", nameAr: "\u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628 \u062C\u0648\u0627\u064B", desc: "Complete pickup, customs, and delivery service.", descAr: "\u062E\u062F\u0645\u0629 \u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u062E\u0644\u064A\u0635 \u0648\u062A\u0633\u0644\u064A\u0645 \u0643\u0627\u0645\u0644\u0629." },
      { name: "Airport Customs Clearance", nameAr: "\u062A\u062E\u0644\u064A\u0635 \u062C\u0645\u0631\u0643\u064A \u0645\u0637\u0627\u0631\u064A", desc: "Fast customs handling at all Saudi international airports.", descAr: "\u062A\u062E\u0644\u064A\u0635 \u062C\u0645\u0631\u0643\u064A \u0633\u0631\u064A\u0639 \u0641\u064A \u062C\u0645\u064A\u0639 \u0645\u0637\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629." },
      { name: "Charter Aircraft", nameAr: "\u0637\u0627\u0626\u0631\u0629 \u0645\u0633\u062A\u0623\u062C\u0631\u0629", desc: "Dedicated aircraft for urgent or oversized air cargo.", descAr: "\u0637\u0627\u0626\u0631\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0639\u0627\u062C\u0644 \u0623\u0648 \u0627\u0644\u0636\u062E\u0645." },
      { name: "Dangerous Goods Air Freight", nameAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Cargo classification, packaging and carrier acceptance must be reviewed before booking.", descAr: "\u064A\u062C\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Pharmaceutical Air Freight", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u062F\u0648\u0627\u0626\u064A", desc: "Product handling, temperature requirements and permitted arrangements require confirmation.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647\u0627." },
      { name: "Temperature-Controlled Cargo", nameAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", desc: "Cold chain air freight for pharma, food, and biologics.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0628\u0633\u0644\u0633\u0644\u0629 \u0628\u0627\u0631\u062F\u0629 \u0644\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0645\u0633\u062A\u062D\u0636\u0631\u0627\u062A \u0627\u0644\u0628\u064A\u0648\u0644\u0648\u062C\u064A\u0629." },
      { name: "Priority Cargo", nameAr: "\u0634\u062D\u0646 \u0623\u0648\u0644\u0648\u064A\u0629", desc: "Highest-priority handling for critical time-sensitive cargo.", descAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0623\u0648\u0644\u0648\u064A\u0629 \u0642\u0635\u0648\u0649 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u062D\u0633\u0627\u0633 \u0644\u0644\u0648\u0642\u062A." },
      { name: "Consolidated Air Freight", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0645\u062C\u0645\u0639", desc: "Cost-effective groupage airfreight solutions.", descAr: "\u062D\u0644\u0648\u0644 \u0634\u062D\u0646 \u062C\u0648\u064A \u0645\u062C\u0645\u0639 \u0641\u0639\u0627\u0644\u0629 \u0645\u0646 \u062D\u064A\u062B \u0627\u0644\u062A\u0643\u0644\u0641\u0629." },
      { name: "Priority & On-Board Courier", nameAr: "\u0628\u0631\u064A\u062F \u0633\u0631\u064A\u0639 \u0639\u0644\u0649 \u0645\u062A\u0646 \u0627\u0644\u0637\u0627\u0626\u0631\u0629", desc: "Hand-carried courier for critical documents and small cargo.", descAr: "\u0628\u0631\u064A\u062F \u0645\u062D\u0645\u0648\u0644 \u0628\u0627\u0644\u064A\u062F \u0644\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u0631\u062C\u0629 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0635\u063A\u064A\u0631." }
    ],
    whyEnvod: [
      { en: "Review of routing and carrier availability", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0627\u0642\u0644" },
      { en: "Cargo-ready date and collection planning", ar: "\u062A\u062D\u062F\u064A\u062F \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645" },
      { en: "Shipment-specific handling requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629" },
      { en: "Manual shipment-status enquiries", ar: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u064A\u062F\u0648\u064A\u0629 \u0639\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0634\u062D\u0646\u0629" },
      { en: "Carrier acceptance and documentation checks", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A" }
    ],
    overview: [
      { en: "Air freight moves goods by aircraft and can suit urgent or high-value consignments. ENVOD reviews your origin, destination, packed dimensions, gross weight and cargo-ready date to discuss feasible routing and coordination. Express, consolidation or charter options depend on carrier availability and the cargo's acceptance requirements.", ar: "\u064A\u0646\u0642\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0628\u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0648\u0642\u062F \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0623\u0648 \u0645\u0631\u062A\u0641\u0639\u0629 \u0627\u0644\u0642\u064A\u0645\u0629. \u062A\u0631\u0627\u062C\u0639 \u0625\u0646\u0641\u0648\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0628\u0639\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0648\u0645\u0648\u0639\u062F \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0644\u0645\u0646\u0627\u0642\u0634\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0645\u0643\u0646\u064A\u0646. \u062A\u0639\u062A\u0645\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0633\u0631\u064A\u0639 \u0623\u0648 \u0627\u0644\u062A\u062C\u0645\u064A\u0639 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u0626\u062C\u0627\u0631 \u0639\u0644\u0649 \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629." },
      { en: "Airport-to-airport and door-to-door enquiries need different collection, clearance and delivery arrangements. Pharmaceutical, temperature-sensitive and dangerous goods require product-specific review; no company certification or universal acceptance is implied. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.", ar: "\u062A\u062E\u062A\u0644\u0641 \u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0628\u064A\u0646 \u0627\u0644\u0634\u062D\u0646 \u0645\u0646 \u0645\u0637\u0627\u0631 \u0644\u0645\u0637\u0627\u0631 \u0648\u0627\u0644\u0634\u062D\u0646 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628. \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062E\u0637\u0631\u0629 \u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C\u061B \u0648\u0644\u0627 \u064A\u0639\u0646\u064A \u0630\u0644\u0643 \u0648\u062C\u0648\u062F \u0634\u0647\u0627\u062F\u0629 \u0644\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0642\u0628\u0648\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639. \u0642\u062F \u062A\u062E\u062A\u0644\u0641 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629." }
    ],
    faq: [
      { q: "How fast is express air freight to Saudi Arabia?", a: "A shipment-specific estimate requires the origin, destination, cargo-ready date, flight availability and customs requirements. A fixed transit time is not promised for every route.", qAr: "\u0645\u0627 \u0645\u062F\u0649 \u0633\u0631\u0639\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u064A\u062A\u0637\u0644\u0628 \u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0645\u062F\u0629 \u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0627\u0631\u064A\u062E \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629. \u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062F\u0629 \u0639\u0628\u0648\u0631 \u062B\u0627\u0628\u062A\u0629 \u0645\u0636\u0645\u0648\u0646\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A." },
      { q: "Can you ship pharmaceuticals by air?", a: "Submit the product details, required temperature range, packaging, monitoring and regulatory documents for review. Acceptance and a suitable permitted handling arrangement must be confirmed before booking.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u0634\u062D\u0646 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u062C\u0648\u0627\u064B\u061F", aAr: "\u0623\u0631\u0633\u0644 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "What is the difference between express and standard air freight?", a: "Express air freight prioritizes speed with the earliest available flights and expedited handling, while standard air freight consolidates cargo at a lower cost over a few business days. We'll recommend the option that fits your deadline and budget.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0648\u0627\u0644\u0642\u064A\u0627\u0633\u064A\u061F", aAr: "\u064A\u0639\u0637\u064A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 \u0644\u0644\u0633\u0631\u0639\u0629 \u0628\u0623\u0642\u0631\u0628 \u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u0639\u062C\u0651\u0644\u0629\u060C \u0628\u064A\u0646\u0645\u0627 \u064A\u062C\u0645\u0651\u0639 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0628\u062A\u0643\u0644\u0641\u0629 \u0623\u0642\u0644 \u062E\u0644\u0627\u0644 \u0628\u0636\u0639\u0629 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644. \u0646\u0648\u0635\u064A \u0628\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0623\u0646\u0633\u0628 \u0644\u0645\u0648\u0639\u062F\u0643 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0643." }
    ]
  },
  3: {
    id: 3,
    slug: "gcc-transportation",
    gradient: "linear-gradient(135deg,#1a1208 0%,#2a1c08 50%,#100c04 100%)",
    accentHex: "#f59e0b",
    industries: ["Construction", "Retail", "Manufacturing", "Agriculture", "Government"],
    industriesAr: ["\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u062A\u062C\u0632\u0626\u0629", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639", "\u0627\u0644\u0632\u0631\u0627\u0639\u0629", "\u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u062D\u0643\u0648\u0645\u064A"],
    process: [
      { en: "Route Planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Loading", ar: "\u0627\u0644\u062A\u062D\u0645\u064A\u0644" },
      { en: "Border Crossing", ar: "\u0639\u0628\u0648\u0631 \u0627\u0644\u062D\u062F\u0648\u062F" },
      { en: "Customs Clearance", ar: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635" },
      { en: "Transit", ar: "\u0627\u0644\u0639\u0628\u0648\u0631" },
      { en: "Final Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Flatbed Trailers", nameAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0645\u0633\u0637\u062D\u0629", desc: "Open flatbed transport for machinery, steel, and oversized loads.", descAr: "\u0646\u0642\u0644 \u0639\u0644\u0649 \u0645\u0642\u0637\u0648\u0631\u0629 \u0645\u0633\u0637\u062D\u0629 \u0645\u0641\u062A\u0648\u062D\u0629 \u0644\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0636\u062E\u0645\u0629." },
      { name: "Curtain Side Trailers", nameAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0633\u062A\u0627\u0626\u0631 \u062C\u0627\u0646\u0628\u064A\u0629", desc: "Flexible side-loading trailers for palletized goods.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u062A\u062D\u0645\u064A\u0644 \u062C\u0627\u0646\u0628\u064A \u0645\u0631\u0646\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u064F\u0631\u0635\u0648\u0635\u0629." },
      { name: "Refrigerated (Reefer) Trucks", nameAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0645\u0628\u0631\u062F\u0629 (\u0631\u064A\u0641\u0631)", desc: "Temperature-controlled refrigerated trucks for food and pharma.", descAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0645\u0628\u0631\u062F\u0629 \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629 \u0644\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621." },
      { name: "Dry Van Trucks", nameAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0645\u063A\u0644\u0642\u0629 \u062C\u0627\u0641\u0629", desc: "Enclosed dry van transport for general cargo protection.", descAr: "\u0646\u0642\u0644 \u0641\u064A \u0635\u0646\u062F\u0648\u0642 \u0645\u063A\u0644\u0642 \u062C\u0627\u0641 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0639\u0627\u0645\u0629." },
      { name: "Low Bed Trailers", nameAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0645\u0646\u062E\u0641\u0636\u0629", desc: "Low-profile trailers for heavy equipment and tall machinery.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0645\u0646\u062E\u0641\u0636\u0629 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0627\u0644\u0622\u0644\u0627\u062A \u0627\u0644\u0637\u0648\u064A\u0644\u0629." },
      { name: "Extendable Trailers", nameAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0645\u062F\u064A\u062F", desc: "Telescopic extendable trailers for extra-long cargo.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u062A\u0644\u0633\u0643\u0648\u0628\u064A\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0645\u062F\u064A\u062F \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0637\u0648\u064A\u0644\u0629 \u062C\u062F\u0627\u064B." },
      { name: "Skeletal Trailers", nameAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0647\u064A\u0643\u0644\u064A\u0629", desc: "Container-ready skeletal trailers for 20ft and 40ft containers.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0647\u064A\u0643\u0644\u064A\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062D\u0627\u0648\u064A\u0627\u062A 20 \u064840 \u0642\u062F\u0645\u0627\u064B." },
      { name: "Container Transport (20ft / 40ft)", nameAr: "\u0646\u0642\u0644 \u062D\u0627\u0648\u064A\u0627\u062A (20 / 40 \u0642\u062F\u0645)", desc: "Door-to-door container transport across Saudi Arabia and GCC.", descAr: "\u0646\u0642\u0644 \u062D\u0627\u0648\u064A\u0627\u062A \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628 \u0639\u0628\u0631 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0648\u0627\u0644\u062E\u0644\u064A\u062C." },
      { name: "Side Loader Trucks", nameAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u062A\u062D\u0645\u064A\u0644 \u062C\u0627\u0646\u0628\u064A", desc: "Self-loading side lift trucks for container handling.", descAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0631\u0641\u0639 \u0630\u0627\u062A\u064A\u0629 \u062C\u0627\u0646\u0628\u064A\u0629 \u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A." },
      { name: "Hydraulic Trailer Transport", nameAr: "\u0646\u0642\u0644 \u0628\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0647\u064A\u062F\u0631\u0648\u0644\u064A\u0643\u064A\u0629", desc: "Multi-axle hydraulic trailers for the heaviest loads.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0647\u064A\u062F\u0631\u0648\u0644\u064A\u0643\u064A\u0629 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0631 \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0623\u062B\u0642\u0644." },
      { name: "Heavy Equipment Transport", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", desc: "Specialist transport for construction and industrial equipment.", descAr: "\u0646\u0642\u0644 \u0645\u062A\u062E\u0635\u0635 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0625\u0646\u0634\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629." },
      { name: "Oversized Cargo Transport", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0636\u062E\u0645\u0629", desc: "Permit-managed oversized load transportation.", descAr: "\u0646\u0642\u0644 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0636\u062E\u0645\u0629 \u0628\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0644\u0627\u0632\u0645\u0629." },
      { name: "Heavy Lift Transportation", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u062B\u0642\u064A\u0644", desc: "Crane and SPMT-assisted heavy lift transport solutions.", descAr: "\u062D\u0644\u0648\u0644 \u0646\u0642\u0644 \u0631\u0641\u0639 \u062B\u0642\u064A\u0644 \u0628\u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0645\u0631\u0643\u0628\u0627\u062A SPMT." },
      { name: "Cross-Border GCC Transportation", nameAr: "\u0646\u0642\u0644 \u0639\u0627\u0628\u0631 \u0644\u0644\u062D\u062F\u0648\u062F \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629", desc: "Route, transporter and border-document scope are confirmed for each enquiry.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0646\u0637\u0627\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0644\u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631." },
      { name: "Local Saudi Transportation", nameAr: "\u0646\u0642\u0644 \u0645\u062D\u0644\u064A \u0633\u0639\u0648\u062F\u064A", desc: "City-to-city and within-city freight across Saudi Arabia.", descAr: "\u0634\u062D\u0646 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646 \u0648\u062F\u0627\u062E\u0644\u0647\u0627 \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u0645\u0644\u0643\u0629." },
      { name: "Dayana Trucks", nameAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u062F\u064A\u0627\u0646\u0627", desc: "Large-capacity Dayana trucks for bulk regional distribution.", descAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u062F\u064A\u0627\u0646\u0627 \u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u0633\u0639\u0629 \u0644\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A \u0628\u0627\u0644\u062C\u0645\u0644\u0629." },
      { name: "Pickup Trucks", nameAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0628\u064A\u0643 \u0623\u0628", desc: "Light pickup trucks for small loads and urgent deliveries.", descAr: "\u0634\u0627\u062D\u0646\u0627\u062A \u0628\u064A\u0643 \u0623\u0628 \u062E\u0641\u064A\u0641\u0629 \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0635\u063A\u064A\u0631\u0629 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0639\u0627\u062C\u0644." },
      { name: "Dedicated Express Delivery", nameAr: "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0645\u062E\u0635\u0635", desc: "Dedicated express transport for time-sensitive shipments, subject to route and vehicle availability.", descAr: "\u0646\u0642\u0644 \u0633\u0631\u064A\u0639 \u0645\u062E\u0635\u0635 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u0648\u0642\u062A\u060C \u0628\u062D\u0633\u0628 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0629." },
      { name: "Last-Mile Delivery", nameAr: "\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629", desc: "Final doorstep delivery within Saudi Arabia.", descAr: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0628\u0627\u0628 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0645\u0644\u0643\u0629." },
      { name: "Door-to-Door Transportation", nameAr: "\u0646\u0642\u0644 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628", desc: "Complete pickup and delivery from origin to destination.", descAr: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u0633\u0644\u064A\u0645 \u0643\u0627\u0645\u0644 \u0645\u0646 \u0627\u0644\u0645\u0646\u0634\u0623 \u0625\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629." }
    ],
    whyEnvod: [
      { en: "Route, border and operator scope checked for each enquiry", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0641\u0630 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0644\u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631" },
      { en: "Border-document requirements reviewed against the proposed route", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0641\u0642 \u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D" },
      { en: "Vehicle type and availability confirmed before booking", ar: "\u062A\u0623\u0643\u064A\u062F \u0646\u0648\u0639 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u062A\u0648\u0641\u0631\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632" },
      { en: "Temperature-sensitive cargo reviewed against provider capability", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0641\u0642 \u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629" }
    ],
    overview: [
      { en: "GCC road freight connects Saudi Arabia with the other Gulf Cooperation Council states: the UAE, Qatar, Kuwait, Bahrain and Oman. Requests may involve full or part loads and different vehicle types. ENVOD can review the proposed origin, destination, cargo, dates and border-document requirements; route availability, carrier/operator, vehicle and customs scope must be confirmed for each shipment.", ar: "\u064A\u0631\u0628\u0637 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u0631\u064A \u0627\u0644\u062E\u0644\u064A\u062C\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0628\u0628\u0642\u064A\u0629 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646: \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0648\u0642\u0637\u0631 \u0648\u0627\u0644\u0643\u0648\u064A\u062A \u0648\u0627\u0644\u0628\u062D\u0631\u064A\u0646 \u0648\u0639\u064F\u0645\u0627\u0646. \u0648\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u062D\u0645\u0648\u0644\u0629 \u0643\u0627\u0645\u0644\u0629 \u0623\u0648 \u062C\u0632\u0626\u064A\u0629 \u0648\u0623\u0646\u0648\u0627\u0639\u0627\u064B \u0645\u062E\u062A\u0644\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0623\u0648 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { en: "Delivery timing depends on the route, carrier schedule, border procedures, documentation and any inspections. Ask for a shipment-specific review rather than relying on a general transit estimate.", ar: "\u064A\u0639\u062A\u0645\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0623\u064A \u0641\u062D\u0648\u0635\u0627\u062A. \u0627\u0637\u0644\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u062D\u0646\u0629 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u062A\u0642\u062F\u064A\u0631 \u0639\u0627\u0645 \u0644\u0645\u062F\u0629 \u0627\u0644\u0646\u0642\u0644." }
    ],
    faq: [
      { q: "What is GCC transportation?", a: "GCC transportation usually means moving goods by road between Saudi Arabia and another Gulf Cooperation Council country. Route, carrier, vehicle, border documents, customs responsibilities and delivery scope depend on the shipment and must be confirmed before booking.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0642\u0635\u0648\u062F \u0628\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u061F", aAr: "\u064A\u0634\u064A\u0631 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062E\u0644\u064A\u062C\u064A \u0639\u0627\u062F\u0629\u064B \u0625\u0644\u0649 \u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0628\u0631\u0627\u064B \u0628\u064A\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u062F\u0648\u0644\u0629 \u0623\u062E\u0631\u0649 \u0645\u0646 \u062F\u0648\u0644 \u0645\u062C\u0644\u0633 \u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0627\u0644\u062E\u0644\u064A\u062C\u064A. \u0648\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "Which GCC routes can you arrange?", a: "Tell us the origin, destination, cargo and requested dates. Route and operator availability, border documents, customs responsibilities and service scope are checked for each request; coverage at every crossing is not assumed.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u0645\u0643\u0646 \u062A\u0631\u062A\u064A\u0628\u0647\u0627\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0643\u0644 \u0637\u0644\u0628\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0639\u0646\u062F \u0643\u0644 \u0645\u0646\u0641\u0630." },
      { q: "Can you help review cross-border customs documents?", a: "We can discuss the documents and responsibilities relevant to the proposed route. Requirements vary by goods and jurisdiction, and declarations, permits or release decisions remain with the responsible operators and authorities.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0639\u0627\u0628\u0631\u0629 \u0644\u0644\u062D\u062F\u0648\u062F\u061F", aAr: "\u064A\u0645\u0643\u0646\u0646\u0627 \u0645\u0646\u0627\u0642\u0634\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D. \u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635\u060C \u0648\u062A\u0628\u0642\u0649 \u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0641\u0633\u062D \u0644\u062F\u0649 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { q: "How long does delivery across the GCC take?", a: "Transit time depends on the origin and destination, carrier schedule, border procedures, documents and inspections. Share the route and ready date to request a current estimate; no general delivery window is promised.", qAr: "\u0643\u0645 \u064A\u0633\u062A\u063A\u0631\u0642 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0639\u0628\u0631 \u062F\u0648\u0644 \u0627\u0644\u062E\u0644\u064A\u062C\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u0629 \u0627\u0644\u0646\u0642\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0641\u062D\u0648\u0635\u0627\u062A. \u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0644\u0637\u0644\u0628 \u062A\u0642\u062F\u064A\u0631 \u062D\u0627\u0644\u064A\u061B \u0648\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062F\u0629 \u062A\u0648\u0635\u064A\u0644 \u0639\u0627\u0645\u0629 \u0645\u0636\u0645\u0648\u0646\u0629." }
    ]
  },
  4: {
    id: 4,
    slug: "customs-clearance",
    gradient: "linear-gradient(135deg,#052a1a 0%,#0a3d28 50%,#031510 100%)",
    accentHex: "#10b981",
    industries: ["All Industries", "Pharmaceuticals", "Food & Beverage", "Electronics", "Industrial"],
    industriesAr: ["\u062C\u0645\u064A\u0639 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A", "\u0627\u0644\u0623\u062F\u0648\u064A\u0629", "\u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062A", "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", "\u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629"],
    process: [
      { en: "Document Review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A" },
      { en: "HS Code Classification", ar: "\u062A\u0635\u0646\u064A\u0641 HS" },
      { en: "Duty Assessment", ar: "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0631\u0633\u0648\u0645" },
      { en: "Declaration Filing", ar: "\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0625\u0642\u0631\u0627\u0631" },
      { en: "Customs Inspection", ar: "\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A" },
      { en: "Duty Payment", ar: "\u0633\u062F\u0627\u062F \u0627\u0644\u0631\u0633\u0648\u0645" },
      { en: "Release & Delivery", ar: "\u0627\u0644\u0625\u0641\u0631\u0627\u062C \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Import Customs Clearance", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F", desc: "Import declarations and document coordination; the responsible operator and gateway scope are confirmed per shipment.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u061B \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0648\u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Export Customs Clearance", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062A\u0635\u062F\u064A\u0631", desc: "Export-document and operator coordination, subject to the cargo and route requirements.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0648\u0641\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631." },
      { name: "Air Customs Clearance", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u062C\u0648\u064A", desc: "Airport and customs scope are confirmed for the requested route and cargo.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0627\u0631 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0641\u0642 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629." },
      { name: "Sea Customs Clearance", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0628\u062D\u0631\u064A", desc: "Discuss gateway and operator options for Jeddah, Dammam or another requested port; availability is confirmed per shipment.", descAr: "\u0646\u0627\u0642\u0634 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0629 \u0641\u064A \u062C\u062F\u0629 \u0623\u0648 \u0627\u0644\u062F\u0645\u0627\u0645 \u0623\u0648 \u0645\u064A\u0646\u0627\u0621 \u0622\u062E\u0631\u061B \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0625\u062A\u0627\u062D\u0629 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Land Border Customs", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u062D\u062F\u0648\u062F \u0627\u0644\u0628\u0631\u064A\u0629", desc: "Border-document and customs-responsibility review for a proposed GCC road route.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u062F\u0648\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0645\u0633\u0627\u0631 \u0628\u0631\u064A \u062E\u0644\u064A\u062C\u064A \u0645\u0642\u062A\u0631\u062D." },
      { name: "Temporary Import", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A", desc: "Check temporary-admission options, eligibility and authority requirements for the cargo.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { name: "Temporary Export", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0624\u0642\u062A", desc: "Review documents and return requirements for goods exported temporarily.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0635\u062F\u0651\u0631\u0629 \u0645\u0624\u0642\u062A\u0627\u064B." },
      { name: "ATA Carnet Processing", nameAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA", desc: "Temporary-import documentation coordination, subject to eligibility and authority acceptance.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u062D\u0633\u0628 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { name: "SFDA Requirements Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621", desc: "Review product-specific food, pharmaceutical or medical-device requirements with the responsible authority and operator.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0621 \u0623\u0648 \u0627\u0644\u062F\u0648\u0627\u0621 \u0623\u0648 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0633\u0624\u0648\u0644." },
      { name: "SABER Requirements Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0633\u0627\u0628\u0631", desc: "Discuss applicable conformity steps; product certificates and approvals are subject to the relevant conformity process and authority.", descAr: "\u0645\u0646\u0627\u0642\u0634\u0629 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629\u061B \u0648\u062A\u062E\u0636\u0639 \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A\u0647\u0627 \u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { name: "SASO Requirements Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0635\u0641\u0627\u062A", desc: "Identify product-standard documentation that may apply; conformity decisions remain with the relevant bodies.", descAr: "\u062A\u062D\u062F\u064A\u062F \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u062A\u064A \u0642\u062F \u062A\u0646\u0637\u0628\u0642\u061B \u0648\u062A\u0628\u0642\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u062F\u0649 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { name: "Dangerous Goods Requirements Review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Classification, documents, packaging and carrier acceptance must be confirmed before a booking.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Exhibition Customs", nameAr: "\u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0645\u0639\u0627\u0631\u0636", desc: "Dedicated customs coordination for exhibition cargo.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u062C\u0645\u0631\u0643\u064A \u0645\u062E\u0635\u0635 \u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636." },
      { name: "Food Import Requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0621", desc: "Review cargo documents and applicable food-import requirements; the competent authority determines approval.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0621 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629\u061B \u0648\u062A\u062D\u062F\u062F \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629." },
      { name: "Medical Device Import Requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629", desc: "Check product-specific registration and import documentation with the responsible authority.", descAr: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0647 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629." },
      { name: "Electronics Import Requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", desc: "Review applicable telecom, safety and conformity documentation for the product and route.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0633\u0627\u0631." },
      { name: "Personal Effects Clearance", nameAr: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0645\u0642\u062A\u0646\u064A\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629", desc: "Customs clearance for household goods and personal belongings.", descAr: "\u062A\u062E\u0644\u064A\u0635 \u062C\u0645\u0631\u0643\u064A \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0642\u062A\u0646\u064A\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629." }
    ],
    whyEnvod: [
      { en: "Import and export documentation coordination", ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0631" },
      { en: "Shipment-specific clearance planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u062D\u0633\u0628 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629" },
      { en: "Review of applicable product approval requirements", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C" },
      { en: "ATA Carnet and temporary-import enquiries", ar: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A" },
      { en: "Gateway and onward-delivery coordination", ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0646\u0641\u0630 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u0646\u0642\u0644 \u0628\u0639\u062F \u0627\u0644\u0641\u0633\u062D" }
    ],
    overview: [
      { en: "Customs clearance involves the declarations and supporting documents required for goods to enter or leave a country, together with applicable duties and taxes. Saudi gateway enquiries may involve Riyadh Dry Port, Jeddah Islamic Port or King Abdulaziz Port in Dammam. The gateway, responsible customs operator and ENVOD's available coordination scope must be confirmed for each shipment. Classification, product requirements, inspections and release decisions depend on the cargo and responsible authorities.", ar: "\u064A\u0634\u0645\u0644 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0623\u0648 \u062E\u0631\u0648\u062C\u0647\u0627\u060C \u0625\u0644\u0649 \u062C\u0627\u0646\u0628 \u0627\u0644\u0631\u0633\u0648\u0645 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629. \u0648\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0639\u0646 \u0627\u0644\u0645\u0646\u0627\u0641\u0630 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u062C\u0627\u0641 \u0628\u0627\u0644\u0631\u064A\u0627\u0636 \u0623\u0648 \u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A \u0623\u0648 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0627\u0644\u062F\u0645\u0627\u0645. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0646\u0641\u0630 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u062A\u0627\u062D \u0645\u0646 \u0625\u0646\u0641\u0648\u062F \u0644\u0643\u0644 \u0634\u062D\u0646\u0629. \u0648\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0642\u0631\u0627\u0631 \u0627\u0644\u0641\u0633\u062D \u0639\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { en: "Product conformity, regulated-goods approvals and temporary admission are separate requirements. SABER procedures, SFDA-related requirements or ATA Carnet eligibility may apply depending on the commodity and intended use. Assistance with documentation does not replace authority approval. Clearance timing depends on complete documents, inspections and applicable government processes.", ar: "\u062A\u0639\u062F \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0648\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629. \u0642\u062F \u062A\u0646\u0637\u0628\u0642 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0633\u0627\u0628\u0631 \u0623\u0648 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621 \u0623\u0648 \u0623\u0647\u0644\u064A\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u062D\u0633\u0628 \u0627\u0644\u0633\u0644\u0639\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0642\u0635\u0648\u062F. \u0644\u0627 \u064A\u062D\u0644 \u062F\u0639\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0645\u062D\u0644 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u062A\u0635\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0639\u0644\u0649 \u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629." }
    ],
    faq: [
      { q: "How long does customs clearance take in Saudi Arabia?", a: "Timing depends on shipment type, complete documentation, inspections, product approvals and authority processing. No fixed release time can be promised before those factors are reviewed.", qAr: "\u0643\u0645 \u064A\u0633\u062A\u063A\u0631\u0642 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u062F\u0629 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629. \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u0648\u0639\u062F \u0628\u0645\u062F\u0629 \u0641\u0633\u062D \u062B\u0627\u0628\u062A\u0629 \u0642\u0628\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u0647\u0630\u0647 \u0627\u0644\u0639\u0648\u0627\u0645\u0644." },
      { q: "What documents are needed for customs clearance in Saudi Arabia?", a: "ZATCA lists the commercial invoice and bill of lading, with a certificate of origin where origin is not clearly established. Additional documents and approvals depend on the goods; provide a packing list and commodity details for a shipment-specific review.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u062A\u0630\u0643\u0631 \u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646\u060C \u0648\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0639\u0646\u062F\u0645\u0627 \u0644\u0627 \u064A\u0643\u0648\u0646 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0636\u062D\u0627\u064B. \u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629\u061B \u0623\u0631\u0633\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0648\u0635\u0641 \u0627\u0644\u0633\u0644\u0639\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0634\u062D\u0646\u062A\u0643." },
      { q: "Do you offer ATA Carnet services?", a: "You can enquire about ATA Carnet and temporary-import logistics coordination. Eligibility, issuance and acceptance must be confirmed with the relevant issuing association and customs authorities; not all goods or uses qualify.", qAr: "\u0647\u0644 \u062A\u0642\u062F\u0645\u0648\u0646 \u062E\u062F\u0645\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0644\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0635\u062F\u0631\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0645\u062E\u062A\u0635\u0629\u061B \u0641\u0644\u064A\u0633\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A \u0645\u0624\u0647\u0644\u0629." }
    ]
  },
  5: {
    id: 5,
    slug: "warehousing",
    gradient: "linear-gradient(135deg,#0d1520 0%,#162030 50%,#070e18 100%)",
    accentHex: "#64748b",
    industries: ["E-commerce", "Retail", "FMCG", "Pharmaceuticals", "Electronics"],
    industriesAr: ["\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u0644\u062A\u062C\u0632\u0626\u0629", "\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", "\u0627\u0644\u0623\u062F\u0648\u064A\u0629", "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A"],
    process: [
      { en: "Receiving", ar: "\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645" },
      { en: "Inspection", ar: "\u0627\u0644\u0641\u062D\u0635" },
      { en: "Storage", ar: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646" },
      { en: "Order Processing", ar: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A" },
      { en: "Pick & Pack", ar: "\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u063A\u0644\u064A\u0641" },
      { en: "Dispatch", ar: "\u0627\u0644\u0625\u0631\u0633\u0627\u0644" },
      { en: "Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "General Warehousing", nameAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0639\u0627\u0645", desc: "Ask about storage for the cargo type, location and period; facility and capacity are confirmed before booking.", descAr: "\u0627\u0633\u062A\u0641\u0633\u0631 \u0639\u0646 \u062A\u062E\u0632\u064A\u0646 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u0648\u0642\u0639\u0647\u0627 \u0648\u0645\u062F\u062A\u0647\u0627\u061B \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0633\u0639\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Bonded Warehousing", nameAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A", desc: "Bonded status, facility authorization and availability must be confirmed for the requested goods and location.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0635\u0641\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0625\u062A\u0627\u062D\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u064A\u0646." },
      { name: "Temperature-Controlled Storage", nameAr: "\u062A\u062E\u0632\u064A\u0646 \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", desc: "Confirm the required temperature range, monitoring, facility and product acceptance for each enquiry.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0644\u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631." },
      { name: "Cold Storage", nameAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0628\u0627\u0631\u062F", desc: "Cold-storage enquiries are reviewed against the product, temperature range and facility availability.", descAr: "\u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0628\u0627\u0631\u062F \u0648\u0641\u0642 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0634\u0623\u0629." },
      { name: "Inventory Management", nameAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646", desc: "Inventory reporting, system access and update frequency depend on the selected facility and agreed scope.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u062A\u0648\u0627\u062A\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0645\u0627." },
      { name: "Pick & Pack", nameAr: "\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u063A\u0644\u064A\u0641", desc: "Order-level picking, packing, and labeling.", descAr: "\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u0633\u0645\u064A\u0629 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0637\u0644\u0628." },
      { name: "Packing Services", nameAr: "\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641", desc: "Professional packing for all cargo types.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0644\u062C\u0645\u064A\u0639 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639." },
      { name: "Custom Wooden Industrial Crating", nameAr: "\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u062E\u0634\u0628\u064A\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0637\u0644\u0628", desc: "In-house carpentry workshops prepare custom wooden crates and pallets for industrial machinery and specialist cargo. Export crates can use ISPM-15 heat-treated timber when required by the destination.", descAr: "\u062A\u062C\u0647\u0632 \u0648\u0631\u0634 \u0627\u0644\u0646\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0648\u0645\u0646\u0635\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629. \u0648\u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062E\u0634\u0627\u0628 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u0631\u0627\u0631\u064A\u0627\u064B \u0648\u0641\u0642 ISPM 15 \u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0639\u0646\u062F \u0627\u0634\u062A\u0631\u0627\u0637 \u0627\u0644\u0648\u062C\u0647\u0629." },
      { name: "Export Packing & Protective Cargo Packaging", nameAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0644\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u062D\u0645\u0627\u064A\u062A\u0647\u0627", desc: "Export preparation and protective packing for freight shipments, including wooden crates and pallets, shock-protection materials and moisture barriers; scope is tailored to the cargo and destination.", descAr: "\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0644\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u062A\u063A\u0644\u064A\u0641\u0647\u0627 \u0627\u0644\u0648\u0627\u0642\u064A\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u062E\u0634\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0631\u0637\u0648\u0628\u0629\u061B \u0648\u064A\u062D\u062F\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0648\u062C\u0647\u0629." },
      { name: "Heavy Equipment Handling & Securing", nameAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u062A\u062B\u0628\u064A\u062A\u0647\u0627", desc: "Heavy machinery packing, lashing and securing, with forklift handling and crane-related services planned around cargo dimensions, weight, lift points and the shipment.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0631\u0628\u0637\u0647\u0627 \u0648\u062A\u062B\u0628\u064A\u062A\u0647\u0627 \u0644\u0644\u0634\u062D\u0646\u060C \u0645\u0639 \u062A\u062E\u0637\u064A\u0637 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0627\u0644\u0634\u0648\u0643\u064A\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0641\u0642 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0645\u0648\u0644\u0629 \u0648\u0648\u0632\u0646\u0647\u0627 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0641\u0639 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "Repacking", nameAr: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u063A\u0644\u064A\u0641", desc: "Repackaging cargo to meet destination or retail requirements.", descAr: "\u0625\u0639\u0627\u062F\u0629 \u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0644\u062A\u0644\u0628\u064A\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u062C\u0647\u0629 \u0623\u0648 \u0627\u0644\u062A\u062C\u0632\u0626\u0629." },
      { name: "Labeling & Barcoding", nameAr: "\u0627\u0644\u062A\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u062A\u0631\u0645\u064A\u0632 \u0627\u0644\u0634\u0631\u064A\u0637\u064A", desc: "Product labeling, barcode application, and compliance.", descAr: "\u062A\u0633\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644." },
      { name: "Order Fulfilment", nameAr: "\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0637\u0644\u0628\u0627\u062A", desc: "End-to-end order processing and dispatch.", descAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0625\u0644\u0649 \u0627\u0644\u0625\u0631\u0633\u0627\u0644." },
      { name: "Distribution", nameAr: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639", desc: "Distribution origin, delivery area, operator and service availability are confirmed per enquiry.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u0646\u0634\u0623 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0648\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631." },
      { name: "Cross Docking", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0628\u0627\u0634\u0631", desc: "Fast transfer between inbound and outbound without long-term storage.", descAr: "\u0646\u0642\u0644 \u0633\u0631\u064A\u0639 \u0628\u064A\u0646 \u0627\u0644\u0648\u0627\u0631\u062F \u0648\u0627\u0644\u0635\u0627\u062F\u0631 \u062F\u0648\u0646 \u062A\u062E\u0632\u064A\u0646 \u0637\u0648\u064A\u0644 \u0627\u0644\u0623\u0645\u062F." },
      { name: "Container Stuffing", nameAr: "\u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A", desc: "Professional cargo packing and stuffing into containers.", descAr: "\u062A\u0639\u0628\u0626\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u062F\u0627\u062E\u0644 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A." },
      { name: "Container Destuffing", nameAr: "\u062A\u0641\u0631\u064A\u063A \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A", desc: "Safe unloading and sorting of containerized cargo.", descAr: "\u062A\u0641\u0631\u064A\u063A \u0648\u0641\u0631\u0632 \u0622\u0645\u0646 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062D\u0645\u0644\u0629 \u0641\u064A \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A." },
      { name: "Cargo Inspection", nameAr: "\u0641\u062D\u0635 \u0627\u0644\u0628\u0636\u0627\u0626\u0639", desc: "Quality checks and condition reports on receipt.", descAr: "\u0641\u062D\u0635 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062D\u0627\u0644\u0629 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645." },
      { name: "Short-Term Storage", nameAr: "\u062A\u062E\u0632\u064A\u0646 \u0642\u0635\u064A\u0631 \u0627\u0644\u0623\u0645\u062F", desc: "Flexible short-term storage from daily to monthly.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0645\u0631\u0646 \u0642\u0635\u064A\u0631 \u0627\u0644\u0623\u0645\u062F \u0645\u0646 \u064A\u0648\u0645\u064A \u0625\u0644\u0649 \u0634\u0647\u0631\u064A." },
      { name: "Long-Term Storage", nameAr: "\u062A\u062E\u0632\u064A\u0646 \u0637\u0648\u064A\u0644 \u0627\u0644\u0623\u0645\u062F", desc: "Cost-effective long-term warehouse space with full management.", descAr: "\u0645\u0633\u0627\u062D\u0629 \u0645\u0633\u062A\u0648\u062F\u0639 \u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u0623\u0645\u062F \u0641\u0639\u0627\u0644\u0629 \u0628\u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629." },
      { name: "Value Added Logistics (VAL)", nameAr: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0630\u0627\u062A \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629", desc: "Kitting, assembly, quality checks, and product customization.", descAr: "\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u0631\u0643\u064A\u0628 \u0648\u0641\u062D\u0648\u0635\u0627\u062A \u062C\u0648\u062F\u0629 \u0648\u062A\u062E\u0635\u064A\u0635 \u0627\u0644\u0645\u0646\u062A\u062C." },
      { name: "E-Commerce Fulfillment", nameAr: "\u0627\u0644\u0648\u0641\u0627\u0621 \u0628\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", desc: "Fulfillment center services for online retailers.", descAr: "\u062E\u062F\u0645\u0627\u062A \u0645\u0631\u0643\u0632 \u0627\u0644\u0648\u0641\u0627\u0621 \u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u064A\u0646." },
      { name: "Warehouse Handling", nameAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A", desc: "Full materials handling \u2014 forklifts, racking, loading bays.", descAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u0648\u0627\u062F \u0643\u0627\u0645\u0644\u0629 \u2014 \u0631\u0627\u0641\u0639\u0627\u062A \u0634\u0648\u0643\u064A\u0629 \u0648\u0631\u0641\u0648\u0641 \u0648\u0645\u062D\u0637\u0627\u062A \u062A\u062D\u0645\u064A\u0644." }
    ],
    whyEnvod: [
      { en: "Facility location, operator and capacity confirmed for the enquiry", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0645\u0634\u063A\u0651\u0644\u0647\u0627 \u0648\u0633\u0639\u062A\u0647\u0627 \u0644\u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631" },
      { en: "Security, access and monitoring arrangements confirmed before storage", ar: "\u062A\u0623\u0643\u064A\u062F \u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0642\u0628\u0644 \u0627\u0644\u062A\u062E\u0632\u064A\u0646" },
      { en: "Bonded status and temperature conditions verified for the selected facility", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0635\u0641\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0644\u0644\u0645\u0646\u0634\u0623\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629" },
      { en: "WMS or ERP access considered only where the facility and agreed scope support it", ar: "\u062A\u064F\u0628\u062D\u062B \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0623\u0646\u0638\u0645\u0629 WMS \u0623\u0648 ERP \u0641\u0642\u0637 \u0625\u0630\u0627 \u062F\u0639\u0645\u062A\u0647\u0627 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647" }
    ],
    overview: [
      { en: "Warehousing and distribution can include storage, receiving, inventory handling, order preparation and onward delivery. ENVOD can review a storage or fulfilment enquiry, but the facility location, operator, capacity, bonded authorization, temperature range, security arrangements and available services must be confirmed for the particular cargo before any commitment.", ar: "\u0642\u062F \u064A\u0634\u0645\u0644 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u062D\u0641\u0638 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0633\u062A\u0644\u0627\u0645\u0647\u0627 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0623\u0648 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u0644\u0643\u0646 \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0645\u0634\u063A\u0651\u0644\u0647\u0627 \u0648\u0633\u0639\u062A\u0647\u0627 \u0648\u062A\u0631\u062E\u064A\u0635\u0647\u0627 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0639\u0646\u064A\u0629 \u0642\u0628\u0644 \u0623\u064A \u0627\u0644\u062A\u0632\u0627\u0645." },
      { en: "Inventory-system access, reporting frequency, pick-and-pack, cross-docking, container handling and other value-added services depend on the selected facility and agreed scope. Send the goods, storage period, handling requirements and destination to ask what can be arranged.", ar: "\u062A\u0639\u062A\u0645\u062F \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u0648\u0627\u062A\u0631 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647. \u0623\u0631\u0633\u0644 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062F\u0629 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0645\u0627 \u064A\u0645\u0643\u0646 \u062A\u0631\u062A\u064A\u0628\u0647." },
      { en: "For warehouse and freight enquiries in Saudi Arabia, ENVOD's in-house carpentry workshops prepare custom wooden industrial crates and pallets for machinery and specialist cargo. Export preparation can include ISPM-15 heat-treated timber when required by the destination, shock protection, moisture barriers and protective packing. Heavy-equipment packing, handling, lashing and securing can be requested with forklift or crane-related services; the lift plan, operator, cargo dimensions, weight and lift points are confirmed for each shipment.", ar: "\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u0634\u062D\u0646 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u060C \u062A\u062C\u0647\u0632 \u0648\u0631\u0634 \u0627\u0644\u0646\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0644\u062F\u0649 \u0625\u0646\u0641\u0648\u062F \u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0645\u0646\u0635\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629. \u0648\u0642\u062F \u064A\u0634\u0645\u0644 \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0644\u0644\u062A\u0635\u062F\u064A\u0631 \u0623\u062E\u0634\u0627\u0628\u0627\u064B \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u0631\u0627\u0631\u064A\u0627\u064B \u0648\u0641\u0642 ISPM 15 \u0639\u0646\u062F \u0627\u0634\u062A\u0631\u0627\u0637 \u0627\u0644\u0648\u062C\u0647\u0629\u060C \u0648\u0648\u0633\u0627\u0626\u0644 \u062D\u0645\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0648\u062A\u063A\u0644\u064A\u0641\u0627\u064B \u0648\u0627\u0642\u064A\u0627\u064B. \u0648\u064A\u0645\u0643\u0646 \u0637\u0644\u0628 \u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0648\u0645\u0646\u0627\u0648\u0644\u062A\u0647\u0627 \u0648\u0631\u0628\u0637\u0647\u0627 \u0648\u062A\u062B\u0628\u064A\u062A\u0647\u0627\u060C \u0645\u0639 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0627\u0644\u0634\u0648\u0643\u064A\u0629 \u0623\u0648 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A\u061B \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062E\u0637\u0629 \u0627\u0644\u0631\u0641\u0639 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0645\u0648\u0644\u0629 \u0648\u0648\u0632\u0646\u0647\u0627 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0641\u0639 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." }
    ],
    faq: [
      { q: "Can you arrange bonded warehousing?", a: "Bonded storage depends on the facility's current authorization, location, cargo eligibility and capacity. Share the goods, destination and storage period so these details can be checked; no bonded status or space is assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0639\u0644\u0649 \u0627\u0644\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0645\u0648\u0642\u0639\u0647\u0627 \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0633\u0639\u0629. \u0623\u0631\u0633\u0644 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u062F\u0629 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0644\u0644\u062A\u062D\u0642\u0642\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0635\u0641\u0629 \u062C\u0645\u0631\u0643\u064A\u0629 \u0623\u0648 \u0645\u0633\u0627\u062D\u0629." },
      { q: "Can you integrate with our inventory or ERP system?", a: "System integration and inventory visibility depend on the facility's technology and the agreed scope. Share your platform and reporting requirements for review; no real-time integration is assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0645\u0639 \u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0623\u0648 ERP \u0644\u062F\u064A\u0646\u0627\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u062A\u0643\u0627\u0645\u0644 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0625\u062A\u0627\u062D\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0639\u0644\u0649 \u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647. \u0623\u0631\u0633\u0644 \u0627\u0633\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u062A\u0643\u0627\u0645\u0644 \u0641\u0648\u0631\u064A." },
      { q: "Can you arrange temperature-controlled or cold storage?", a: "Availability depends on the cargo, required temperature range, monitoring and the selected facility. Share the product and handling conditions so suitability can be checked before booking.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u062A\u0631\u062A\u064A\u0628 \u062A\u062E\u0632\u064A\u0646 \u0645\u0628\u0631\u062F \u0623\u0648 \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0648\u0641\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629. \u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0644\u0627\u0621\u0645\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "Can you crate industrial machinery for export?", a: "Yes. ENVOD's in-house carpentry workshops prepare custom wooden crates and pallets for industrial machinery and specialist cargo. ISPM-15 heat-treated timber, shock or moisture protection, lashing, securing and forklift or crane-related handling can be included according to the cargo and destination requirements. Confirm the dimensions, weight, destination and any packaging standard before dispatch.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u062C\u0647\u064A\u0632 \u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0644\u0644\u062A\u0635\u062F\u064A\u0631\u061F", aAr: "\u0646\u0639\u0645. \u062A\u062C\u0647\u0632 \u0648\u0631\u0634 \u0627\u0644\u0646\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0644\u062F\u0649 \u0625\u0646\u0641\u0648\u062F \u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0648\u0645\u0646\u0635\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629. \u0648\u064A\u0645\u0643\u0646 \u0625\u0636\u0627\u0641\u0629 \u0623\u062E\u0634\u0627\u0628 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u0631\u0627\u0631\u064A\u0627\u064B \u0648\u0641\u0642 ISPM 15 \u0648\u0648\u0633\u0627\u0626\u0644 \u062D\u0645\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0623\u0648 \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0648\u0627\u0644\u0631\u0628\u0637 \u0648\u0627\u0644\u062A\u062B\u0628\u064A\u062A \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0627\u0644\u0634\u0648\u0643\u064A\u0629 \u0623\u0648 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u062C\u0647\u0629. \u064A\u0631\u062C\u0649 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0623\u064A \u0645\u0639\u064A\u0627\u0631 \u062A\u063A\u0644\u064A\u0641 \u0645\u0637\u0644\u0648\u0628 \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644." }
    ]
  },
  6: {
    id: 6,
    slug: "freight-forwarding",
    gradient: "linear-gradient(135deg,#150a2a 0%,#220f3a 50%,#0c0515 100%)",
    accentHex: "#a855f7",
    industries: ["All Sectors", "Manufacturing", "Oil & Gas", "Construction", "Technology"],
    industriesAr: ["\u062C\u0645\u064A\u0639 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639", "\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627"],
    process: [
      { en: "Consultation", ar: "\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0629" },
      { en: "Routing", ar: "\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Documentation", ar: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642" },
      { en: "Pickup", ar: "\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645" },
      { en: "Transit Management", ar: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0628\u0648\u0631" },
      { en: "Customs Clearance", ar: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635" },
      { en: "Final Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Multimodal Freight Forwarding", nameAr: "\u0627\u0644\u0634\u062D\u0646 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0648\u0633\u0627\u0626\u0637", desc: "Combined sea/air/road routing for cost and time optimization.", descAr: "\u062A\u0648\u062C\u064A\u0647 \u0645\u062F\u0645\u062C \u062C\u0648\u064A\u0627\u064B \u0648\u0628\u062D\u0631\u064A\u0627\u064B \u0648\u0628\u0631\u064A\u0627\u064B." },
      { name: "Door-to-Door Forwarding", nameAr: "\u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628", desc: "Complete origin-to-destination management.", descAr: "\u0625\u062F\u0627\u0631\u0629 \u0643\u0627\u0645\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u0634\u0623 \u0625\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629." },
      { name: "Import Freight Forwarding", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F", desc: "Managed imports into Saudi Arabia from worldwide origins.", descAr: "\u0648\u0627\u0631\u062F\u0627\u062A \u0645\u064F\u062F\u0627\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0645\u0646 \u0645\u0635\u0627\u062F\u0631 \u0639\u0627\u0644\u0645\u064A\u0629." },
      { name: "Export Freight Forwarding", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u062A\u0635\u062F\u064A\u0631", desc: "Saudi export coordination to all global markets.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0633\u0639\u0648\u062F\u064A \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629." },
      { name: "Cargo Insurance", nameAr: "\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0634\u062D\u0646", desc: "Full cargo cover for door-to-door shipments.", descAr: "\u062A\u063A\u0637\u064A\u0629 \u0634\u062D\u0646 \u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0644\u0644\u0628\u0627\u0628." },
      { name: "3PL Solutions", nameAr: "\u062D\u0644\u0648\u0644 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062B\u0627\u0644\u062B \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629", desc: "Outsourced logistics management (3PL).", descAr: "\u0625\u062F\u0627\u0631\u0629 \u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0645\u064F\u0633\u062A\u0639\u0627\u0646 \u0628\u0647\u0627 \u0645\u0646 \u0637\u0631\u0641 \u062B\u0627\u0644\u062B." },
      { name: "Project Forwarding", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", desc: "Specialist forwarding for industrial project cargo.", descAr: "\u0634\u062D\u0646 \u0645\u062A\u062E\u0635\u0635 \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629." },
      { name: "Customs Brokerage", nameAr: "\u0648\u0643\u0627\u0644\u0629 \u062C\u0645\u0631\u0643\u064A\u0629", desc: "Customs documentation and responsible-operator coordination.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629 \u0639\u0646 \u0627\u0644\u062A\u062E\u0644\u064A\u0635." }
    ],
    whyEnvod: [
      { en: "Saudi import and export documentation planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629" },
      { en: "International routing and agent-scope coordination", ar: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0648\u0646\u0637\u0627\u0642 \u0639\u0645\u0644 \u0627\u0644\u0648\u0643\u0644\u0627\u0621" },
      { en: "Multimodal solutions tailored to your supply chain", ar: "\u062D\u0644\u0648\u0644 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0645\u0635\u0645\u0645\u0629 \u0644\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643" }
    ],
    overview: [
      { en: "Freight forwarding coordinates transport, documents and handoffs on a shipper's behalf; the forwarder may work with carriers and specialist operators rather than own the transport assets. ENVOD can review a requested sea, air or road shipment and confirm which routing, documentation, customs, insurance or 3PL elements are within scope for that enquiry.", ar: "\u064A\u0646\u0633\u0642 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644 \u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0646\u064A\u0627\u0628\u0629\u064B \u0639\u0646 \u0627\u0644\u0645\u0631\u0633\u0644\u061B \u0648\u0642\u062F \u064A\u0639\u0645\u0644 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0645\u0639 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0627\u0645\u062A\u0644\u0627\u0643 \u0648\u0633\u0627\u0626\u0637 \u0627\u0644\u0646\u0642\u0644. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0637\u0644\u0628 \u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0623\u0648 \u062C\u0648\u064A \u0623\u0648 \u0628\u0631\u064A \u0648\u062A\u0623\u0643\u064A\u062F \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0623\u0648 3PL \u0627\u0644\u062F\u0627\u062E\u0644\u0629 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631." },
      { en: "Before booking, confirm the carrier, agent, customs operator, insurance arrangement and delivery responsibilities for the shipment. International availability depends on the route, cargo, current provider capacity and acceptance.", ar: "\u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632\u060C \u0623\u0643\u0651\u062F \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0648\u0643\u064A\u0644 \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0634\u062D\u0646\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0625\u062A\u0627\u062D\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0633\u0639\u0629 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0642\u0628\u0648\u0644\u0647." }
    ],
    faq: [
      { q: "What does a freight forwarder do?", a: "A freight forwarder organizes shipments on behalf of shippers \u2014 arranging transport, handling documentation, managing customs, and coordinating the complete logistics chain.", qAr: "\u0645\u0627 \u062F\u0648\u0631 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u061F", aAr: "\u064A\u064F\u0646\u0638\u0651\u0645 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0646\u064A\u0627\u0628\u0629\u064B \u0639\u0646 \u0627\u0644\u0645\u0631\u0633\u0644\u064A\u0646 \u2014 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0646\u0642\u0644 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u062A\u0646\u0633\u064A\u0642 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629." },
      { q: "What is the difference between a freight forwarder and a carrier?", a: "A carrier physically moves cargo \u2014 a shipping line, airline, or trucking company. A freight forwarder arranges and manages that transport across multiple carriers and modes, handling booking, documentation, and customs on your behalf.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0646\u0627\u0642\u0644\u061F", aAr: "\u0627\u0644\u0646\u0627\u0642\u0644 \u0647\u0648 \u0645\u0646 \u064A\u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0641\u0639\u0644\u064A\u0627\u064B \u2014 \u062E\u0637 \u0645\u0644\u0627\u062D\u064A \u0623\u0648 \u0634\u0631\u0643\u0629 \u0637\u064A\u0631\u0627\u0646 \u0623\u0648 \u0634\u0631\u0643\u0629 \u0646\u0642\u0644 \u0628\u0631\u064A. \u0623\u0645\u0651\u0627 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0641\u064A\u064F\u0631\u062A\u0651\u0628 \u0648\u064A\u062F\u064A\u0631 \u0630\u0644\u0643 \u0627\u0644\u0646\u0642\u0644 \u0639\u0628\u0631 \u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0648\u0633\u0627\u0626\u0637 \u0645\u062A\u0639\u062F\u062F\u0629\u060C \u0645\u062A\u0648\u0644\u0651\u064A\u0627\u064B \u0627\u0644\u062D\u062C\u0632 \u0648\u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0646\u064A\u0627\u0628\u0629\u064B \u0639\u0646\u0643." },
      { q: "Can you coordinate an import or export shipment?", a: "Share the origin, destination, cargo, dates and requested service scope. Routing, carrier, customs operator, documents and delivery responsibilities are checked for each shipment; availability at both ends is not assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u0646\u0633\u064A\u0642 \u0634\u062D\u0646\u0629 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0623\u0648 \u062A\u0635\u062F\u064A\u0631\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628. \u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0639\u0646\u062F \u0627\u0644\u0637\u0631\u0641\u064A\u0646." }
    ]
  },
  7: {
    id: 7,
    slug: "supply-chain",
    gradient: "linear-gradient(135deg,#0d0520 0%,#190830 50%,#07030f 100%)",
    accentHex: "#6366f1",
    industries: ["Manufacturing", "Retail", "FMCG", "Automotive", "Healthcare"],
    industriesAr: ["\u0627\u0644\u062A\u0635\u0646\u064A\u0639", "\u0627\u0644\u062A\u062C\u0632\u0626\u0629", "\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", "\u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A", "\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629"],
    process: [
      { en: "Analysis", ar: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644" },
      { en: "Strategy", ar: "\u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629" },
      { en: "Vendor Setup", ar: "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646" },
      { en: "Implementation", ar: "\u0627\u0644\u062A\u0646\u0641\u064A\u0630" },
      { en: "Monitoring", ar: "\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629" },
      { en: "Optimization", ar: "\u0627\u0644\u062A\u062D\u0633\u064A\u0646" }
    ],
    subServices: [
      { name: "Supply Chain Consulting", nameAr: "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0648\u0631\u064A\u062F", desc: "Expert analysis and optimization of your logistics network.", descAr: "\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u062D\u0633\u064A\u0646 \u0645\u062A\u062E\u0635\u0635 \u0644\u0634\u0628\u0643\u062A\u0643 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629." },
      { name: "Vendor Management", nameAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646", desc: "Supplier selection, onboarding, and performance management.", descAr: "\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u062A\u0623\u0647\u064A\u0644\u0647\u0645 \u0648\u0625\u062F\u0627\u0631\u0629 \u0623\u062F\u0627\u0626\u0647\u0645." },
      { name: "Demand Planning", nameAr: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0637\u0644\u0628", desc: "Data-driven demand forecasting to optimize inventory.", descAr: "\u062A\u0648\u0642\u0639 \u0627\u0644\u0637\u0644\u0628 \u0628\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u062E\u0632\u0648\u0646." },
      { name: "Last-Mile Solutions", nameAr: "\u062D\u0644\u0648\u0644 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629", desc: "Efficient final delivery with route optimization.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0646\u0647\u0627\u0626\u064A \u0641\u0639\u0651\u0627\u0644 \u0645\u0639 \u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A." },
      { name: "ERP Integration", nameAr: "\u062A\u0643\u0627\u0645\u0644 ERP", desc: "Seamless integration with SAP, Oracle, and other ERP systems.", descAr: "\u062A\u0643\u0627\u0645\u0644 \u0633\u0644\u0633 \u0645\u0639 SAP \u0648Oracle \u0648\u0623\u0646\u0638\u0645\u0629 ERP \u0627\u0644\u0623\u062E\u0631\u0649." },
      { name: "KPI Reporting & Analytics", nameAr: "\u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", desc: "Real-time dashboards and performance analytics.", descAr: "\u0644\u0648\u062D\u0627\u062A \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0641\u064A \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0641\u0639\u0644\u064A \u0648\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621." },
      { name: "Warehouse Management", nameAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A", desc: "Integrated WMS solutions for efficient warehouse operations.", descAr: "\u062D\u0644\u0648\u0644 WMS \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0641\u0639\u0651\u0627\u0644\u0629." },
      { name: "Transportation Management", nameAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0646\u0642\u0644", desc: "TMS solutions to optimize fleet routing and carrier selection.", descAr: "\u062D\u0644\u0648\u0644 TMS \u0644\u062A\u062D\u0633\u064A\u0646 \u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0623\u0633\u0637\u0648\u0644 \u0648\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0646\u0627\u0642\u0644." }
    ],
    whyEnvod: [
      { en: "End-to-end visibility across your entire supply chain", ar: "\u0631\u0624\u064A\u0629 \u0634\u0627\u0645\u0644\u0629 \u0639\u0628\u0631 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0628\u0623\u0643\u0645\u0644\u0647\u0627" },
      { en: "ERP integration with SAP, Oracle, and Odoo", ar: "\u062A\u0643\u0627\u0645\u0644 ERP \u0645\u0639 SAP \u0648Oracle \u0648Odoo" },
      { en: "Dedicated KAM assigned to your account", ar: "\u0645\u062F\u064A\u0631 \u062D\u0633\u0627\u0628\u0627\u062A \u0645\u062E\u0635\u0635 \u0644\u062D\u0633\u0627\u0628\u0643" }
    ],
    faq: [
      { q: "Can you integrate with our ERP system?", a: "Integration depends on the selected provider, platform, access permissions and project scope. Share your system and required data flow so technical compatibility can be checked; no integration or real-time visibility is assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0645\u0639 \u0646\u0638\u0627\u0645 ERP \u0644\u062F\u064A\u0646\u0627\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0639\u0644\u0649 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0634\u0631\u0648\u0639. \u0623\u0631\u0633\u0644 \u0627\u0633\u0645 \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u062A\u062F\u0641\u0642 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u062A\u0642\u0646\u064A\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u062A\u0643\u0627\u0645\u0644 \u0623\u0648 \u0639\u0631\u0636 \u0641\u0648\u0631\u064A \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A." }
    ]
  },
  8: {
    id: 8,
    slug: "project-cargo",
    gradient: "linear-gradient(135deg,#1a0a04 0%,#2d1508 50%,#0e0604 100%)",
    accentHex: "#f97316",
    industries: ["Oil & Gas", "Renewable Energy", "Construction", "Mining", "Power Generation"],
    industriesAr: ["\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u062C\u062F\u062F\u0629", "\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u062A\u0639\u062F\u064A\u0646", "\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0637\u0627\u0642\u0629"],
    process: [
      { en: "Feasibility Study", ar: "\u062F\u0631\u0627\u0633\u0629 \u0627\u0644\u062C\u062F\u0648\u0649" },
      { en: "Route Survey", ar: "\u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Engineering Plan", ar: "\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629" },
      { en: "Permits & Approvals", ar: "\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A" },
      { en: "Transport Execution", ar: "\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0646\u0642\u0644" },
      { en: "Crane & Rigging", ar: "\u0627\u0644\u0631\u0627\u0641\u0639\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0642" },
      { en: "Site Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639" }
    ],
    subServices: [
      { name: "Heavy Lift Cargo", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u062B\u0642\u064A\u0644", desc: "Crane-assisted heavy lift for oversized industrial equipment.", descAr: "\u0631\u0641\u0639 \u062B\u0642\u064A\u0644 \u0628\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0636\u062E\u0645\u0629." },
      { name: "Oversized Cargo Transport", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0636\u062E\u0645\u0629", desc: "Permit-managed oversized load transport by road and sea.", descAr: "\u0646\u0642\u0644 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0636\u062E\u0645\u0629 \u0628\u0631\u064A\u0627\u064B \u0648\u0628\u062D\u0631\u064A\u0627\u064B \u0628\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0644\u0627\u0632\u0645\u0629." },
      { name: "Break Bulk Cargo", nameAr: "\u0628\u0636\u0627\u0626\u0639 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643", desc: "Non-containerized break bulk transport for large project items.", descAr: "\u0646\u0642\u0644 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u063A\u064A\u0631 \u062D\u0627\u0648\u064A\u0629 \u0644\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u064A\u0639." },
      { name: "Industrial Machinery", nameAr: "\u0627\u0644\u0622\u0644\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629", desc: "Specialist transport and installation of industrial machinery.", descAr: "\u0646\u0642\u0644 \u0648\u062A\u0631\u0643\u064A\u0628 \u0645\u062A\u062E\u0635\u0635 \u0644\u0644\u0622\u0644\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629." },
      { name: "Power Plant Equipment", nameAr: "\u0645\u0639\u062F\u0627\u062A \u0645\u062D\u0637\u0627\u062A \u0627\u0644\u0637\u0627\u0642\u0629", desc: "Transformers, generators, and power infrastructure logistics.", descAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u062D\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0644\u062F\u0627\u062A \u0648\u0628\u0646\u064A\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629." },
      { name: "Oil & Gas Equipment Logistics", nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", desc: "Secure transport of drilling, refining, and processing equipment.", descAr: "\u0646\u0642\u0644 \u0622\u0645\u0646 \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062D\u0641\u0631 \u0648\u0627\u0644\u062A\u0643\u0631\u064A\u0631 \u0648\u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629." },
      { name: "Renewable Energy Projects", nameAr: "\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u062C\u062F\u062F\u0629", desc: "Wind turbines, solar panels, and energy infrastructure logistics.", descAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u062A\u0648\u0631\u0628\u064A\u0646\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u062D \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u062D \u0627\u0644\u0634\u0645\u0633\u064A\u0629 \u0648\u0628\u0646\u064A\u0629 \u0627\u0644\u0637\u0627\u0642\u0629." },
      { name: "Construction Equipment", nameAr: "\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0628\u0646\u0627\u0621", desc: "Cranes, excavators, and construction plant transport.", descAr: "\u0646\u0642\u0644 \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0627\u0644\u062D\u0641\u0627\u0631\u0627\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0628\u0646\u0627\u0621." },
      { name: "Route Survey", nameAr: "\u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631", desc: "Pre-movement route assessment for oversized cargo.", descAr: "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u0633\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u062D\u0631\u0643\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0643\u0628\u064A\u0631\u0629." },
      { name: "Escort Vehicles", nameAr: "\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u0641\u0642\u0629", desc: "Police and pilot escort coordination for abnormal loads.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0631\u0627\u0641\u0642\u0629 \u0634\u0631\u0637\u064A\u0629 \u0648\u0637\u0644\u064A\u0639\u064A\u0629 \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u063A\u064A\u0631 \u0627\u0644\u0627\u0639\u062A\u064A\u0627\u062F\u064A\u0629." },
      { name: "Crane Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A", desc: "Full lift planning and crane operations on site.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639." },
      { name: "Port Handling", nameAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621", desc: "Specialist stevedoring and port handling for project cargo.", descAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u064A\u0646\u0627\u0621 \u0645\u062A\u062E\u0635\u0635\u0629 \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639." },
      { name: "Site Delivery", nameAr: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639", desc: "Final delivery and unloading directly to the project site.", descAr: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639." },
      { name: "Multi-Modal Project Logistics", nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0648\u0633\u0627\u0626\u0637", desc: "Combined sea, air, and road project cargo solutions.", descAr: "\u062D\u0644\u0648\u0644 \u0628\u0636\u0627\u0626\u0639 \u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u062F\u0645\u062C\u0629 \u0628\u062D\u0631\u0627\u064B \u0648\u062C\u0648\u0627\u064B \u0648\u0628\u0631\u0627\u064B." }
    ],
    whyEnvod: [
      { en: "Specialist project cargo team in Saudi Arabia", ar: "\u0641\u0631\u064A\u0642 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0641\u064A \u0627\u0644\u0645\u0645\u0644\u0643\u0629" },
      { en: "Full route survey and engineering support", ar: "\u0645\u0633\u062D \u0645\u0633\u0627\u0631 \u0643\u0627\u0645\u0644 \u0648\u062F\u0639\u0645 \u0647\u0646\u062F\u0633\u064A" },
      { en: "Crane and rigging services on-site", ar: "\u062E\u062F\u0645\u0627\u062A \u0631\u0627\u0641\u0639\u0627\u062A \u0648\u062A\u0639\u0644\u064A\u0642 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639" },
      { en: "Saudi Aramco and SABIC supply chain experience", ar: "\u062E\u0628\u0631\u0629 \u0641\u064A \u0633\u0644\u0627\u0633\u0644 \u062A\u0648\u0631\u064A\u062F \u0623\u0631\u0627\u0645\u0643\u0648 \u0648\u0633\u0627\u0628\u0643" }
    ],
    overview: [
      { en: "Project cargo logistics is the transport of oversized, overweight, high-value, or complex shipments that cannot move as standard freight. It is common in oil and gas, power generation, renewable energy, construction, and mining, and it demands engineering-led planning. ENVOD KINGDOM SHIPPING SERVICES handles heavy-lift and break-bulk cargo, route surveys, permits, crane and rigging operations, and final site delivery.", ar: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0647\u064A \u0646\u0642\u0644 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0623\u0648 \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0623\u0648 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0623\u0648 \u0627\u0644\u0645\u0639\u0642\u0651\u062F\u0629 \u0627\u0644\u062A\u064A \u0644\u0627 \u064A\u0645\u0643\u0646 \u0646\u0642\u0644\u0647\u0627 \u0643\u0634\u062D\u0646 \u0642\u064A\u0627\u0633\u064A. \u0648\u0647\u064A \u0634\u0627\u0626\u0639\u0629 \u0641\u064A \u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632 \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u062C\u062F\u062F\u0629 \u0648\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062A\u0639\u062F\u064A\u0646\u060C \u0648\u062A\u062A\u0637\u0644\u0651\u0628 \u062A\u062E\u0637\u064A\u0637\u0627\u064B \u0628\u0642\u064A\u0627\u062F\u0629 \u0647\u0646\u062F\u0633\u064A\u0629. \u062A\u062A\u0648\u0644\u0651\u0649 \u0634\u0631\u0643\u0629 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0648\u0645 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u062B\u0642\u064A\u0644 \u0648\u0628\u0636\u0627\u0626\u0639 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0648\u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0642 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0645\u0648\u0642\u0639." },
      { en: "Each project begins with a feasibility study and route survey, followed by an engineering plan, permits and approvals, multimodal transport execution, on-site crane and rigging, and delivery directly to the project site. ENVOD brings specialist experience supporting Saudi industrial supply chains, including Saudi Aramco and SABIC projects.", ar: "\u064A\u0628\u062F\u0623 \u0643\u0644 \u0645\u0634\u0631\u0648\u0639 \u0628\u062F\u0631\u0627\u0633\u0629 \u062C\u062F\u0648\u0649 \u0648\u0645\u0633\u062D \u0644\u0644\u0645\u0633\u0627\u0631\u060C \u064A\u0644\u064A\u0647 \u062E\u0637\u0629 \u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0646\u0642\u0644 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0642 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639. \u0648\u062A\u0642\u062F\u0651\u0645 \u0625\u0646\u0641\u0648\u062F \u062E\u0628\u0631\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u062F\u0639\u0645 \u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0645\u0634\u0627\u0631\u064A\u0639 \u0623\u0631\u0627\u0645\u0643\u0648 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0633\u0627\u0628\u0643." }
    ],
    faq: [
      { q: "What qualifies as project cargo?", a: "Project cargo includes oversized, heavy, or high-value shipments that require specialized handling \u2014 typically industrial equipment, power plant components, oil & gas hardware, or infrastructure materials.", qAr: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u064F\u0635\u0646\u0651\u0641 \u0636\u0645\u0646 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639\u061F", aAr: "\u062A\u0634\u0645\u0644 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0623\u0648 \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0623\u0648 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062A\u064A \u062A\u062A\u0637\u0644\u0628 \u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u062A\u062E\u0635\u0635\u0629." },
      { q: "Do you obtain the permits for oversized loads?", a: "Yes. We manage the full permit process for abnormal and oversized loads, including route surveys and police or pilot escort coordination where required.", qAr: "\u0647\u0644 \u062A\u062D\u0635\u0644\u0648\u0646 \u0639\u0644\u0649 \u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0627\u0644\u0636\u062E\u0645\u0629\u061F", aAr: "\u0646\u0639\u0645. \u0646\u062F\u064A\u0631 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u063A\u064A\u0631 \u0627\u0644\u0627\u0639\u062A\u064A\u0627\u062F\u064A\u0629 \u0648\u0627\u0644\u0636\u062E\u0645\u0629\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0631\u0627\u0641\u0642\u0629 \u0627\u0644\u0634\u0631\u0637\u064A\u0629 \u0623\u0648 \u0627\u0644\u0637\u0644\u064A\u0639\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629." },
      { q: "Can you deliver directly to a remote project site?", a: "Yes. We plan multimodal movements from port or origin to the final site, including heavy-lift, crane operations, and site delivery in remote or restricted locations.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0645\u0648\u0642\u0639 \u0645\u0634\u0631\u0648\u0639 \u0646\u0627\u0621\u064D\u061F", aAr: "\u0646\u0639\u0645. \u0646\u062E\u0637\u0651\u0637 \u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0646\u0642\u0644 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0645\u0646 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0623\u0648 \u0627\u0644\u0645\u0646\u0634\u0623 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0627\u0644\u0631\u0641\u0639 \u0627\u0644\u062B\u0642\u064A\u0644 \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0631\u0627\u0641\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0646\u0627\u0626\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u0642\u064A\u0651\u062F\u0629." }
    ]
  },
  9: {
    id: 9,
    slug: "relocation",
    gradient: "linear-gradient(135deg,#180c04 0%,#281408 50%,#0c0604 100%)",
    accentHex: "#fb923c",
    industries: ["Homes & apartments", "Villas & private residences", "Office & employee moves", "International household moves", "Corporate", "Government", "Diplomatic", "Individual", "Expat Communities"],
    industriesAr: ["\u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0634\u0642\u0642", "\u0627\u0644\u0641\u0644\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0643\u0646 \u0627\u0644\u062E\u0627\u0635\u0629", "\u0646\u0642\u0644 \u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0648\u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", "\u0646\u0642\u0644 \u0627\u0644\u0623\u0645\u062A\u0639\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629 \u062F\u0648\u0644\u064A\u0627\u064B", "\u0627\u0644\u0634\u0631\u0643\u0627\u062A", "\u0627\u0644\u062D\u0643\u0648\u0645\u0629", "\u0627\u0644\u062F\u0628\u0644\u0648\u0645\u0627\u0633\u064A\u0629", "\u0627\u0644\u0623\u0641\u0631\u0627\u062F", "\u0627\u0644\u0645\u063A\u062A\u0631\u0628\u0648\u0646"],
    process: [
      { en: "Send move details", ar: "\u0623\u0631\u0633\u0644 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644" },
      { en: "Review inventory & access", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062F\u062E\u0648\u0644" },
      { en: "Check route & provider scope", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0642\u062F\u0645" },
      { en: "Confirm scope before booking", ar: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632" }
    ],
    subServices: [
      { name: "Home and apartment move enquiries", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0646\u0642\u0644 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0634\u0642\u0642", desc: "Share the move type, approximate contents, packing needs, preferred date and origin/destination area. Provider options and the requested scope are confirmed before booking.", descAr: "\u0623\u0631\u0633\u0644 \u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0641\u0636\u0644 \u0648\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629. \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Office and employee move enquiries", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0646\u0642\u0644 \u0627\u0644\u0645\u0643\u0627\u062A\u0628 \u0648\u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", desc: "Include the inventory, schedule, building access and requested work so availability and responsibilities can be reviewed for the specific move.", descAr: "\u0623\u0631\u0633\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0628\u0646\u0649 \u0648\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0644\u0643\u0644 \u0627\u0646\u062A\u0642\u0627\u0644." },
      { name: "International household move enquiries", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0646\u0642\u0644 \u0627\u0644\u0623\u0645\u062A\u0639\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629 \u062F\u0648\u0644\u064A\u0627\u064B", desc: "Share origin and destination countries, inventory and preferred dates. Route coverage, customs documents, eligibility and provider responsibilities need confirmation.", descAr: "\u0623\u0631\u0633\u0644 \u062F\u0648\u0644\u062A\u064A \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0641\u0636\u0644\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629." },
      { name: "Packing, handling and storage requests", nameAr: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646", desc: "Describe any packing, furniture dismantling, fragile-item handling or storage needs. Availability, terms and responsibilities are confirmed for the move.", descAr: "\u0627\u0630\u0643\u0631 \u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0623\u0648 \u0641\u0643 \u0627\u0644\u0623\u062B\u0627\u062B \u0623\u0648 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u062A\u062E\u0632\u064A\u0646. \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0644\u0644\u0627\u0646\u062A\u0642\u0627\u0644." },
      ...RESTORED_RELOCATION_OPTIONS
    ],
    whyEnvod: [
      { en: "Move size, inventory, packing and access needs reviewed together", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062D\u062C\u0645 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0639\u0627\u064B" },
      { en: "Origin, destination and preferred timing checked for the requested route", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0641\u0636\u0644 \u0644\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0637\u0644\u0648\u0628" },
      { en: "Provider availability, responsibilities and scope confirmed before booking", ar: "\u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632" },
      { en: "Inventory and packing requirements reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641" },
      { en: "Import rules and customs responsibilities checked", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643" },
      { en: "Route coverage and provider scope confirmed per move", ar: "\u062A\u0623\u0643\u064A\u062F \u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0646\u0637\u0627\u0642 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0643\u0644 \u0627\u0646\u062A\u0642\u0627\u0644" }
    ],
    overview: [
      { en: "House moving and furniture relocation in Riyadh can involve a local address change, a move between Saudi cities, or an international household-goods shipment. ENVOD KINGDOM reviews each enquiry by move type, inventory, packing requests, preferred date and route; available providers and the agreed scope must be confirmed before booking.", ar: "\u0642\u062F \u064A\u0634\u0645\u0644 \u0646\u0642\u0644 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0623\u062B\u0627\u062B \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0646\u062A\u0642\u0627\u0644\u0627\u064B \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0623\u0648 \u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0623\u0648 \u0634\u062D\u0646\u0629 \u0623\u0645\u062A\u0639\u0629 \u0645\u0646\u0632\u0644\u064A\u0629 \u062F\u0648\u0644\u064A\u0629. \u062A\u0631\u0627\u062C\u0639 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u063A\u062F\u0648\u0645 \u0643\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0648\u0641\u0642 \u0646\u0648\u0639 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0648\u0627\u0644\u0645\u0633\u0627\u0631\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u062D \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { en: "For a useful first enquiry, describe the approximate home or office size, main furniture and carton count, fragile or oversized items, packing or dismantling requests, and building access such as stairs, lifts or parking restrictions. For international moves, import eligibility, customs paperwork, insurance terms and the responsibilities of each provider depend on the route and must be checked for that shipment.", ar: "\u0644\u062A\u0642\u062F\u064A\u0645 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0623\u0648\u0644\u064A \u0645\u0641\u064A\u062F\u060C \u0627\u0630\u0643\u0631 \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A \u0644\u0644\u0645\u0646\u0632\u0644 \u0623\u0648 \u0627\u0644\u0645\u0643\u062A\u0628 \u0648\u0623\u0628\u0631\u0632 \u0642\u0637\u0639 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0639\u062F\u062F \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0648\u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u062D\u062C\u0645 \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0623\u0648 \u0627\u0644\u0641\u0643 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0628\u0646\u0649 \u0645\u062B\u0644 \u0627\u0644\u0633\u0644\u0627\u0644\u0645 \u0623\u0648 \u0627\u0644\u0645\u0635\u0639\u062F \u0623\u0648 \u0642\u064A\u0648\u062F \u0627\u0644\u0645\u0648\u0627\u0642\u0641. \u0648\u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629\u060C \u062A\u0639\u062A\u0645\u062F \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0643\u0644 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." }
    ],
    faq: [
      { q: "What details help with a house-moving quote enquiry in Riyadh?", a: "Start with the origin and destination area, move date, home size or approximate inventory, packing needs, fragile or oversized items, and access details such as stairs, lifts and parking restrictions. Exact addresses can be provided later if needed. ENVOD confirms the available provider, requested scope and responsibilities before booking.", qAr: "\u0645\u0627 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u064A \u062A\u0633\u0627\u0639\u062F \u0641\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0646\u0642\u0644 \u0645\u0646\u0632\u0644 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636\u061F", aAr: "\u0627\u0628\u062F\u0623 \u0628\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u062D\u062C\u0645 \u0627\u0644\u0645\u0646\u0632\u0644 \u0623\u0648 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A\u0629 \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0643\u0628\u064A\u0631\u0629 \u0627\u0644\u062D\u062C\u0645 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u062B\u0644 \u0627\u0644\u0633\u0644\u0627\u0644\u0645 \u0648\u0627\u0644\u0645\u0635\u0639\u062F \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641. \u0648\u064A\u0645\u0643\u0646 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0644\u0627\u062D\u0642\u0627\u064B \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629. \u062A\u0624\u0643\u062F \u0625\u0646\u0641\u0648\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u062D \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "Are packing, furniture dismantling or storage automatically included?", a: "No standard package is assumed. Mention any packing, dismantling or reassembly, fragile-item handling or storage request. Availability, price, terms and the responsible provider must be confirmed for the specific route before booking.", qAr: "\u0647\u0644 \u064A\u0634\u0645\u0644 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0623\u0648 \u0641\u0643 \u0627\u0644\u0623\u062B\u0627\u062B \u0623\u0648 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B\u061F", aAr: "\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u0648\u062C\u0648\u062F \u0628\u0627\u0642\u0629 \u0645\u0648\u062D\u062F\u0629. \u0627\u0630\u0643\u0631 \u0623\u064A \u0637\u0644\u0628 \u0644\u0644\u062A\u063A\u0644\u064A\u0641 \u0623\u0648 \u0641\u0643 \u0627\u0644\u0623\u062B\u0627\u062B \u0623\u0648 \u062A\u0631\u0643\u064A\u0628\u0647 \u0623\u0648 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u062A\u062E\u0632\u064A\u0646. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0644\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u062D\u062F\u062F \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "Can ENVOD arrange an international household move?", a: "Send the origin and destination countries and a brief inventory for review. Household-goods eligibility, customs documents, route coverage, insurance terms and provider responsibilities vary by shipment and must be confirmed before any booking.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u062A\u0646\u0633\u064A\u0642 \u0627\u0646\u062A\u0642\u0627\u0644 \u062F\u0648\u0644\u064A \u0644\u0644\u0623\u0645\u062A\u0639\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629\u061F", aAr: "\u0623\u0631\u0633\u0644 \u062F\u0648\u0644\u062A\u064A \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0645\u062E\u062A\u0635\u0631\u0629 \u0628\u0627\u0644\u0645\u0646\u0642\u0648\u0644\u0627\u062A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u062A\u062E\u062A\u0644\u0641 \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0623\u0645\u062A\u0639\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u062D\u0633\u0628 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F\u0647\u0627 \u0642\u0628\u0644 \u0623\u064A \u062D\u062C\u0632." },
      { q: "Does every Riyadh or Saudi route have the same moving service?", a: "No. Local, intercity and international requests are reviewed separately. Provider availability, transport, packing, access requirements, customs responsibilities and price depend on the route and requested scope; ENVOD confirms these details before booking.", qAr: "\u0647\u0644 \u062A\u062A\u0648\u0641\u0631 \u062E\u062F\u0645\u0629 \u0627\u0644\u0646\u0642\u0644 \u0646\u0641\u0633\u0647\u0627 \u0644\u0643\u0644 \u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u0636 \u0623\u0648 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u0644\u0627. \u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0648\u0628\u064A\u0646 \u0627\u0644\u0645\u062F\u0646 \u0648\u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0643\u0644\u0651\u064C \u0639\u0644\u0649 \u062D\u062F\u0629. \u064A\u0639\u062A\u0645\u062F \u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0633\u0639\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u061B \u0648\u062A\u0624\u0643\u062F \u0625\u0646\u0641\u0648\u062F \u0647\u0630\u0647 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ]
  },
  10: {
    id: 10,
    slug: "ecommerce-logistics",
    gradient: "linear-gradient(135deg,#0a0a28 0%,#12103a 50%,#060615 100%)",
    accentHex: "#3b82f6",
    industries: ["Online Retail", "Fashion", "Electronics", "FMCG", "Marketplace Sellers"],
    industriesAr: ["\u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u0644\u0623\u0632\u064A\u0627\u0621", "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", "\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", "\u0628\u0627\u0626\u0639\u0648 \u0627\u0644\u0645\u0646\u0635\u0627\u062A"],
    process: [
      { en: "Order Received", ar: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628" },
      { en: "Pick & Pack", ar: "\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u063A\u0644\u064A\u0641" },
      { en: "Dispatch", ar: "\u0627\u0644\u0625\u0631\u0633\u0627\u0644" },
      { en: "Transit", ar: "\u0627\u0644\u0639\u0628\u0648\u0631" },
      { en: "Last Mile", ar: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629" },
      { en: "Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Fulfillment facility enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0646\u0634\u0623\u0629 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628\u0627\u062A", desc: "Facility availability, inventory, order-handling scope, technology and delivery coverage must be checked for the project.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0646\u0637\u0627\u0642 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0648\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u0645\u0634\u0631\u0648\u0639." },
      { name: "Last-Mile Delivery", nameAr: "\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629", desc: "Delivery coverage, operator, schedule and tracking features depend on the route and selected provider.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631." },
      { name: "Same-Day Delivery", nameAr: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0630\u0627\u062A\u0647", desc: "Same-day delivery may be available on selected routes, subject to location, cut-off time, and capacity.", descAr: "\u0642\u062F \u064A\u062A\u0648\u0641\u0631 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0630\u0627\u062A\u0647 \u0644\u0628\u0639\u0636 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0628\u062D\u0633\u0628 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629." },
      { name: "Returns-processing enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0627\u062A", desc: "Confirm reverse-logistics route, inspection, disposition and provider scope.", descAr: "\u0623\u0643\u0651\u062F \u0645\u0633\u0627\u0631 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0639\u0643\u0633\u064A\u0629 \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u062A\u0635\u0631\u0641 \u0628\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0646\u0637\u0627\u0642 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629." },
      { name: "Cash-on-delivery enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645", desc: "Payment collection, reconciliation, settlement timing and operator capability require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648\u0645\u0637\u0627\u0628\u0642\u062A\u0647\u0627 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0648\u064A\u0629 \u0648\u0642\u062F\u0631\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
      { name: "Cross-border e-commerce enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0639\u0627\u0628\u0631\u0629 \u0644\u0644\u062D\u062F\u0648\u062F", desc: "Route, carrier, destination duties, product eligibility and return responsibilities must be confirmed.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0631\u0633\u0648\u0645 \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0625\u0631\u062C\u0627\u0639." },
      { name: "Platform compatibility review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u0646\u0635\u0629", desc: "Integration depends on the named platform, provider technology, permissions and agreed scope.", descAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0648\u062A\u0642\u0646\u064A\u0629 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647." },
      { name: "Inventory-management enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646", desc: "Facility, inventory accuracy, reporting frequency and data access must be agreed with the provider.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0645\u0639 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u062F\u0642\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u0648\u0627\u062A\u0631 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A." }
    ],
    whyEnvod: [
      { en: "Dispatch timing and order cut-offs are confirmed for the selected service and shipment", ar: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0648\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0644\u0628 \u0628\u062D\u0633\u0628 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0634\u062D\u0646\u0629" },
      { en: "Platform and payment compatibility reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A" },
      { en: "Provider, facility and service scope confirmed", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629" }
    ],
    faq: [
      { q: "Can you integrate with my online store?", a: "Integration depends on the provider's current platform support, permissions and technical scope. Share the platform and required workflow for review; no connection or automated order handling is assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0645\u0639 \u0645\u062A\u062C\u0631\u064A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0639\u0644\u0649 \u062F\u0639\u0645 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0645\u0646\u0635\u0629 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0642\u0646\u064A. \u0623\u0631\u0633\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0633\u064A\u0631 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0627\u062A\u0635\u0627\u0644 \u0623\u0648 \u0645\u0639\u0627\u0644\u062C\u0629 \u0622\u0644\u064A\u0629 \u0644\u0644\u0637\u0644\u0628\u0627\u062A." }
    ]
  },
  11: {
    id: 11,
    slug: "exhibition-logistics",
    pillar: EXHIBITION_PILLAR,
    gradient: "linear-gradient(135deg,#1a0508 0%,#2d080e 50%,#0e0304 100%)",
    accentHex: "#ef4444",
    industries: ["Technology", "Construction", "Healthcare", "Energy", "Defense", "Food & Agriculture"],
    industriesAr: ["\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", "\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629", "\u0627\u0644\u0637\u0627\u0642\u0629", "\u0627\u0644\u062F\u0641\u0627\u0639", "\u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0632\u0631\u0627\u0639\u0629"],
    process: [
      { en: "Consultation", ar: "\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0629" },
      { en: "Planning", ar: "\u0627\u0644\u062A\u062E\u0637\u064A\u0637" },
      { en: "Documentation", ar: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642" },
      { en: "Transportation", ar: "\u0627\u0644\u0646\u0642\u0644" },
      { en: "Venue Delivery Planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639" },
      { en: "Venue Support Coordination", ar: "\u062A\u0646\u0633\u064A\u0642 \u062F\u0639\u0645 \u0627\u0644\u0645\u0648\u0642\u0639" },
      { en: "Return Logistics", ar: "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0639\u0643\u0633\u064A\u0629" }
    ],
    subServices: [
      { name: "ATA Carnet Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0643\u0627\u0631\u0646\u064A\u0647 ATA", desc: "Coordinate shipment information and documents with the authorized issuing association; issuance and acceptance are not controlled by the freight forwarder.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0647\u0627 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629\u061B \u0648\u0644\u0627 \u064A\u062A\u062D\u0643\u0645 \u0648\u0643\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0641\u064A \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0623\u0648 \u0627\u0644\u0642\u0628\u0648\u0644." },
      { name: "ATA Carnet Documentation Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA", desc: "Documentation and application-step coordination with the authorized issuing association; issuance and acceptance remain with the relevant authorities.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629\u060C \u0628\u064A\u0646\u0645\u0627 \u064A\u0628\u0642\u0649 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0645\u0646 \u0627\u062E\u062A\u0635\u0627\u0635 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0639\u0646\u064A\u0629." },
      { name: "Exhibition Cargo Handling", nameAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636", desc: "Handling requirements, appointed contractors and cargo acceptance are confirmed with the venue and organizer.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0645\u0639 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0645\u0646\u0638\u0651\u0645." },
      { name: "Exhibition Booth Logistics", nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0623\u062C\u0646\u062D\u0629 \u0627\u0644\u0645\u0639\u0627\u0631\u0636", desc: "Plan transport and venue access for booth structures; lifting, installation and handling scope must be confirmed separately.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0646\u0642\u0644 \u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u0623\u062C\u0646\u062D\u0629 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u0631\u0641\u0639 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644." },
      { name: "Trade Show Logistics", nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u0629", desc: "Coordinate the proposed freight, documents, venue schedule and return plan for a trade-show shipment.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062E\u0637\u0629 \u0627\u0644\u0639\u0648\u062F\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u0639\u0631\u0636." },
      { name: "Event Equipment Transport", nameAr: "\u0646\u0642\u0644 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A", desc: "Review equipment dimensions, weight, packing, routing and carrier acceptance before booking.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0648\u0632\u0646\u0647\u0627 \u0648\u062A\u063A\u0644\u064A\u0641\u0647\u0627 \u0648\u0645\u0633\u0627\u0631\u0647\u0627 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Temporary Import Documentation", nameAr: "\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A", desc: "Review temporary-admission documents and eligibility with the responsible association, operator and authorities.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629." },
      { name: "Temporary Export Documentation", nameAr: "\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0624\u0642\u062A", desc: "Check export and return-document requirements for the particular goods and destination.", descAr: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u0645\u0639\u0646\u064A\u062A\u064A\u0646." },
      { name: "Venue Delivery Planning", nameAr: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639", desc: "Delivery windows, access rules and appointed handling contractors are confirmed with the event organizer.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0646\u0648\u0627\u0641\u0630 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0645\u0642\u0627\u0648\u0644\u064A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0645\u0639 \u0645\u0646\u0638\u0651\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629." },
      { name: "On-site Cargo Handling Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639", desc: "On-site work depends on venue rules, contractor appointment and a separately confirmed service scope.", descAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0639\u0645\u0644 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0645\u0643\u0627\u0646 \u0648\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0645\u0642\u0627\u0648\u0644 \u0648\u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u062E\u062F\u0645\u0629 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644." },
      { name: "Installation Support Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u062F\u0639\u0645 \u0627\u0644\u062A\u0631\u0643\u064A\u0628", desc: "Installation responsibility and provider availability must be agreed with the organizer and venue.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0645\u0639 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u0627\u0644\u0645\u0648\u0642\u0639." },
      { name: "Dismantling Support Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u062F\u0639\u0645 \u0627\u0644\u062A\u0641\u0643\u064A\u0643", desc: "Confirm dismantling rules, collection slot and return-shipment arrangements with the event team.", descAr: "\u062A\u0623\u0643\u064A\u062F \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062A\u0641\u0643\u064A\u0643 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0639\u0648\u062F\u0629 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629." },
      { name: "Customs Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062C\u0645\u0627\u0631\u0643", desc: "Review the cargo-specific import, temporary-admission and re-export responsibilities; approvals remain with the authorities.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0628\u0636\u0627\u0639\u0629\u061B \u0648\u062A\u0628\u0642\u0649 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0644\u062F\u0649 \u0627\u0644\u0633\u0644\u0637\u0627\u062A." },
      { name: "Return Shipment Planning", nameAr: "\u062A\u062E\u0637\u064A\u0637 \u0634\u062D\u0646\u0629 \u0627\u0644\u0639\u0648\u062F\u0629", desc: "Plan collection and return routing subject to cargo condition, documents, carrier acceptance and event deadlines.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0648\u062F\u0629 \u0648\u0641\u0642 \u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629." },
      { name: "VIP Event Logistics Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629", desc: "Share security, access and handling requirements for review; availability and scope are not assumed.", descAr: "\u0623\u0631\u0633\u0644 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0623\u0648 \u0646\u0637\u0627\u0642\u0647\u0627." }
    ],
    whyEnvod: [
      { en: "Event-specific freight and venue-access planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0634\u062D\u0646 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0641\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629" },
      { en: "ATA Carnet and temporary-import documentation coordination", ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0648\u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A" },
      { en: "Organizer requirements checked for each exhibition", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0644\u0643\u0644 \u0645\u0639\u0631\u0636" },
      { en: "On-site responsibilities and local providers confirmed with the event organizer", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0642\u062F\u0645\u064A \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u064A\u0646 \u0645\u0639 \u0645\u0646\u0638\u0651\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629" }
    ],
    faq: [
      { q: "What is an ATA Carnet?", a: "An ATA Carnet is a customs document for eligible temporary movements under the ATA system. Saudi acceptance depends on the current permitted use and the shipment; official guidance identifies eligible goods for display or use at exhibitions, fairs, meetings and similar events. The issuing association and customs authorities determine eligibility and acceptance. ENVOD can coordinate shipment information and documents but does not issue or guarantee a Carnet.", qAr: "\u0645\u0627 \u0647\u0648 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0645\u0633\u062A\u0646\u062F \u062C\u0645\u0631\u0643\u064A \u0644\u062D\u0631\u0643\u0627\u062A \u0645\u0624\u0642\u062A\u0629 \u0645\u0624\u0647\u0644\u0629 \u0636\u0645\u0646 \u0646\u0638\u0627\u0645 ATA. \u0648\u064A\u0639\u062A\u0645\u062F \u0642\u0628\u0648\u0644\u0647 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0627\u0644\u0634\u062D\u0646\u0629\u061B \u0648\u062A\u0634\u064A\u0631 \u0627\u0644\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0624\u0647\u0644\u0629 \u0644\u0644\u0639\u0631\u0636 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0648\u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0628\u0647\u0629. \u0648\u062A\u062D\u062F\u062F \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0627\u0644\u0642\u0628\u0648\u0644. \u0648\u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u062A\u0646\u0633\u064A\u0642 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0647\u0627 \u0644\u0643\u0646\u0647\u0627 \u0644\u0627 \u062A\u0635\u062F\u0631 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0648\u0644\u0627 \u062A\u0636\u0645\u0646 \u0642\u0628\u0648\u0644\u0647." },
      { q: "How far in advance should I plan exhibition logistics?", a: "Start when the organizer's schedule and shipment details are available. The required lead time depends on origin, routing, cargo, approvals, carrier capacity and venue deadlines; there is no universal booking window.", qAr: "\u0645\u062A\u0649 \u064A\u0646\u0628\u063A\u064A \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0631\u0636\u061F", aAr: "\u0627\u0628\u062F\u0623 \u0639\u0646\u062F \u062A\u0648\u0641\u0631 \u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u0647\u0644\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0648\u0633\u0639\u0629 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639\u061B \u0648\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0647\u0644\u0629 \u062D\u062C\u0632 \u0645\u0648\u062D\u062F\u0629." },
      { q: "Which Saudi exhibition venues can I enquire about?", a: "Enquiries may include venues such as RICEC, Riyadh Front, Jeddah Superdome, Jeddah Center for Forums & Events and Dhahran Expo. A venue listing is planning context only; access, appointed contractors, delivery windows and service availability must be confirmed for the event.", qAr: "\u0645\u0627 \u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u0645\u0643\u0646 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646\u0647\u0627\u061F", aAr: "\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0645\u0648\u0627\u0642\u0639 \u0645\u062B\u0644 \u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u0642\u0628\u0629 \u062C\u062F\u0629 \u0648\u0645\u0631\u0643\u0632 \u062C\u062F\u0629 \u0644\u0644\u0645\u0646\u062A\u062F\u064A\u0627\u062A \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0638\u0647\u0631\u0627\u0646 \u0625\u0643\u0633\u0628\u0648. \u0630\u0643\u0631 \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u063A\u0631\u0636 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0641\u0642\u0637\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0629." },
      { q: "Can you coordinate exhibition shipments to Saudi Arabia?", a: "ENVOD can review exhibition shipment enquiries for Riyadh, Jeddah, Dammam and other Saudi destinations. Share the origin, venue, cargo list, packed dimensions and weight, event dates and preferred freight mode. The route, carrier, customs operator, local delivery and venue-access arrangements are confirmed for the shipment.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u0646\u0633\u064A\u0642 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0625\u0644\u0649 \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062C\u062F\u0629 \u0648\u0627\u0644\u062F\u0645\u0627\u0645 \u0648\u063A\u064A\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0648\u062C\u0647\u0627\u062A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0623\u0628\u0639\u0627\u062F\u0647\u0627 \u0648\u0648\u0632\u0646\u0647\u0627 \u0628\u0639\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629. \u0648\u064A\u064F\u0624\u0643\u062F \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062D\u0644\u064A \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { q: "What documents are typically requested for exhibition cargo to Saudi Arabia?", a: "A commercial invoice, packing list, transport document and itemized cargo or equipment list are useful starting points. Certificates of origin, attestations, permits and product documents depend on the goods, importer and route. For temporary admission, confirm whether an ATA Carnet or another procedure applies with the responsible operator and authorities.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u064F\u0637\u0644\u0628 \u0639\u0627\u062F\u0629\u064B \u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u062A\u064F\u0639\u062F \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0645\u0633\u062A\u0646\u062F \u0627\u0644\u0646\u0642\u0644 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0623\u0648 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0641\u0635\u0644\u0629 \u0646\u0642\u0637\u0629 \u0628\u062F\u0627\u064A\u0629 \u0645\u0641\u064A\u062F\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0639\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F \u0648\u0627\u0644\u0645\u0633\u0627\u0631. \u0648\u0644\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A\u060C \u0623\u0643\u0651\u062F \u0645\u0639 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u064A\u0646\u0637\u0628\u0642 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0623\u0648 \u0625\u062C\u0631\u0627\u0621 \u0622\u062E\u0631." },
      { q: "Can you arrange on-site setup or dismantling?", a: "Share the venue, stand, event dates and requested tasks. On-site work may require organizer approval or an appointed contractor; the responsible provider and scope must be confirmed before booking.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0623\u0648 \u0627\u0644\u062A\u0641\u0643\u064A\u0643 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0631\u0642\u0645 \u0627\u0644\u062C\u0646\u0627\u062D \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u0642\u062F \u064A\u062A\u0637\u0644\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0645\u0646\u0638\u0651\u0645 \u0623\u0648 \u0645\u0642\u0627\u0648\u0644\u0627\u064B \u0645\u0639\u062A\u0645\u062F\u0627\u064B\u061B \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { q: "Can you arrange temporary import without an ATA Carnet?", a: "Alternative temporary-import routes may be available when a Carnet is not used, but requirements, guarantees, and approval depend on the goods and responsible authorities. Share the origin, event purpose, and equipment list so the applicable route can be checked.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u062F\u0648\u0646 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u0642\u062F \u062A\u062A\u0627\u062D \u0645\u0633\u0627\u0631\u0627\u062A \u0623\u062E\u0631\u0649 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0639\u0646\u062F \u0639\u062F\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u060C \u0644\u0643\u0646 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0636\u0645\u0627\u0646\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u062A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629. \u0623\u0631\u0633\u0644 \u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u063A\u0631\u0636 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0646\u0627\u0633\u0628." },
      { q: "What event information should I include in an enquiry?", a: "Include the event name, venue and city, move-in and move-out dates, cargo list, dimensions, weight, origin, temporary-import or return needs, and any on-site tasks. This helps review the requested scope; it does not imply an event appointment or past participation.", qAr: "\u0645\u0627 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u0646\u0628\u063A\u064A \u062A\u0636\u0645\u064A\u0646\u0647\u0627 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u061F", aAr: "\u0623\u062F\u0631\u062C \u0627\u0633\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0648\u0627\u0644\u0625\u062E\u0631\u0627\u062C \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0623\u0648 \u0627\u0644\u0625\u0639\u0627\u062F\u0629 \u0648\u0623\u064A \u0645\u0647\u0627\u0645 \u0645\u064A\u062F\u0627\u0646\u064A\u0629. \u062A\u0633\u0627\u0639\u062F \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0644\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u061B \u0648\u0644\u0627 \u062A\u0639\u0646\u064A \u062A\u0639\u064A\u064A\u0646\u0627\u064B \u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u0629 \u0633\u0627\u0628\u0642\u0629." },
      { q: "Can you plan return shipping after the event?", a: "Return and re-export requirements can be reviewed with the event schedule, cargo list, documents and next destination. Carrier options, venue collection, customs responsibilities and availability must be confirmed for the specific shipment.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u062E\u0637\u064A\u0637 \u0634\u062D\u0646 \u0627\u0644\u0639\u0648\u062F\u0629 \u0628\u0639\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629\u061F", aAr: "\u064A\u0645\u0643\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0645\u0639 \u062C\u062F\u0648\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629. \u0648\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0644\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629." },
      { q: "How much does exhibition logistics cost?", a: "Cost depends on cargo volume and weight, transport mode, origin, event dates, and requested on-site support. Share your equipment list and event details to request a no-obligation quote.", qAr: "\u0643\u0645 \u062A\u0643\u0644\u0641\u0629 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0639\u0644\u0649 \u062D\u062C\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0648\u0632\u0646\u0647\u0627 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0646\u0642\u0644 \u0648\u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628. \u0623\u0631\u0633\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0644\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631 \u062F\u0648\u0646 \u0627\u0644\u062A\u0632\u0627\u0645." },
      { q: "Should I use air or sea freight for exhibition cargo?", a: "Compare the cargo, origin, event deadline, dimensions, budget and carrier options. Air freight may suit tighter schedules when capacity and acceptance are available; sea freight may be considered for larger cargo when the schedule allows for port and inland handling. Transit times and delivery arrangements depend on the route and operators.", qAr: "\u0647\u0644 \u0623\u062E\u062A\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0623\u0645 \u0627\u0644\u0628\u062D\u0631\u064A \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636\u061F", aAr: "\u0642\u0627\u0631\u0646 \u0628\u064A\u0646 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0648\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0644. \u0642\u062F \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0623\u0636\u064A\u0642 \u0639\u0646\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0633\u0639\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644\u061B \u0648\u0642\u062F \u064A\u064F\u062F\u0631\u0633 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0623\u0643\u0628\u0631 \u0639\u0646\u062F\u0645\u0627 \u064A\u0633\u0645\u062D \u0627\u0644\u062C\u062F\u0648\u0644 \u0628\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u062F \u0627\u0644\u0639\u0628\u0648\u0631 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646." }
    ]
  },
  12: {
    id: 12,
    slug: "medical-pharma",
    gradient: "linear-gradient(135deg,#042020 0%,#063030 50%,#021010 100%)",
    accentHex: "#14b8a6",
    industries: ["Hospitals", "Pharmacies", "Biotech", "Medical Devices", "Clinical Trials"],
    industriesAr: ["\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A", "\u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0627\u062A", "\u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u064A\u0648\u064A\u0629", "\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629", "\u0627\u0644\u062A\u062C\u0627\u0631\u0628 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629"],
    process: [
      { en: "Order Processing", ar: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628" },
      { en: "Product handling requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C" },
      { en: "Temperature requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629" },
      { en: "Authority-document review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629" },
      { en: "Cold Chain Transit", ar: "\u0639\u0628\u0648\u0631 \u0627\u0644\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0628\u0627\u0631\u062F\u0629" },
      { en: "Delivery & Verification", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u062D\u0642\u0642" }
    ],
    subServices: [
      { name: "Pharmaceutical temperature-control enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u062F\u0648\u0627\u0626\u064A \u0628\u062F\u0631\u062C\u0629 \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", desc: "Product, route, temperature, monitoring and qualified-provider requirements must be verified before any arrangement is confirmed.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0642\u0628\u0644 \u062A\u0623\u0643\u064A\u062F \u0623\u064A \u062A\u0631\u062A\u064A\u0628." },
      { name: "Refrigerated transport availability enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0628\u0631\u062F", desc: "Vehicle authorization, validated conditions, carrier acceptance and route availability require shipment-specific confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u062A\u0623\u0643\u064A\u062F\u0627\u064B \u062E\u0627\u0635\u0627\u064B \u0628\u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "Temperature-monitoring requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629", desc: "Describe the required records, alerts and monitoring interval so available provider arrangements can be reviewed.", descAr: "\u0627\u0630\u0643\u0631 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0648\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0648\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629." },
      { name: "Pharmaceutical import-document review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0623\u062F\u0648\u064A\u0629", desc: "Registration, import and clearance requirements are product-specific and determined by the responsible authorities and operators.", descAr: "\u062A\u062E\u062A\u0644\u0641 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u062A\u062D\u062F\u062F\u0647\u0627 \u0627\u0644\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0648\u0646 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0648\u0646." },
      { name: "Pharmaceutical cold-chain enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0628\u0631\u064A\u062F \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629", desc: "Any end-to-end temperature arrangement, custody handoff and supporting evidence must be confirmed before booking.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0623\u064A \u062A\u0631\u062A\u064A\u0628 \u062D\u0631\u0627\u0631\u064A \u0645\u0646 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0644\u0644\u0646\u0647\u0627\u064A\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0647\u062F\u0629 \u0648\u0627\u0644\u0623\u062F\u0644\u0629 \u0627\u0644\u062F\u0627\u0639\u0645\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Climate-Controlled Warehousing Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u062E\u0632\u064A\u0646 \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", desc: "Facility authorization, validated conditions, humidity range and capacity must be confirmed for the product.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0631\u0637\u0648\u0628\u0629 \u0648\u0627\u0644\u0633\u0639\u0629 \u0644\u0644\u0645\u0646\u062A\u062C." },
      { name: "Healthcare Facility Delivery Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u0645\u0631\u0627\u0641\u0642 \u0627\u0644\u0635\u062D\u064A\u0629", desc: "Route, receiving requirements, operator and delivery availability are checked per shipment.", descAr: "\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Clinical Trial Logistics Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0628 \u0627\u0644\u0633\u0631\u064A\u0631\u064A\u0629", desc: "Product handling, temperature, documentation, permits and qualified-provider requirements need review.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u062D\u0631\u0627\u0631\u062A\u0647 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u0647 \u0648\u062A\u0635\u0627\u0631\u064A\u062D\u0647 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0645\u0631\u0627\u062C\u0639\u0629." },
      { name: "Medical Device Import Requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629", desc: "Registration and import requirements are product-specific and determined through the applicable regulatory process.", descAr: "\u062A\u062E\u062A\u0644\u0641 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u062A\u062D\u062F\u062F\u0647\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629." },
      { name: "Time-Critical Delivery Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0635\u064A\u0644 \u062D\u0633\u0627\u0633 \u0644\u0644\u0648\u0642\u062A", desc: "Timing depends on route, operator capacity, cargo acceptance, documents and any required approvals.", descAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0633\u0639\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0644\u0627\u0632\u0645\u0629." }
    ],
    whyEnvod: [
      { en: "Product-specific temperature and documentation requirements reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C" },
      { en: "Regulatory steps checked with the responsible authority", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629" },
      { en: "Equipment, monitoring and qualified-provider evidence confirmed before booking", ar: "\u062A\u0623\u0643\u064A\u062F \u0623\u062F\u0644\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632" }
    ],
    overview: [
      { en: "Medical and pharmaceutical logistics requires product-specific controls for transport, storage, documentation and regulatory approvals. Temperature limits, packaging, monitoring, route, facility and provider qualifications must be verified against the product and applicable rules before booking. ENVOD can review an enquiry and confirm what coordination scope is available; no GDP certification, validated equipment or SFDA approval is claimed here.", ar: "\u062A\u062A\u0637\u0644\u0628 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0636\u0648\u0627\u0628\u0637 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C \u0644\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u062F\u0648\u062F \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0641\u0642 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632. \u064A\u0645\u0643\u0646 \u0644\u0625\u0646\u0641\u0648\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0648\u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u062A\u0627\u062D\u061B \u0648\u0644\u0627 \u064A\u062F\u0651\u0639\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0639\u062A\u0645\u0627\u062F GDP \u0623\u0648 \u0645\u0639\u062F\u0627\u062A \u0645\u0639\u062A\u0645\u062F\u0629 \u0623\u0648 \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0646 \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621." },
      { en: "Share the product type, required temperature range, origin, destination, handling instructions and documents for review. Availability of a suitable carrier or facility, temperature monitoring, delivery route and regulatory support is confirmed per request.", ar: "\u0623\u0631\u0633\u0644 \u0646\u0648\u0639 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u0648\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0627\u0642\u0644 \u0623\u0648 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0645\u0633\u0627\u0631 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A \u0644\u0643\u0644 \u0637\u0644\u0628." }
    ],
    faq: [
      { q: "Can you coordinate temperature-sensitive pharmaceutical cargo?", a: "Share the product, temperature range, route and required dates. Carrier, equipment, facility, monitoring and regulatory qualifications must be verified for the specific shipment before any service is confirmed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u062A\u0646\u0633\u064A\u0642 \u0634\u062D\u0646\u0629 \u062F\u0648\u0627\u0626\u064A\u0629 \u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062D\u0631\u0627\u0631\u0629\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u0624\u0647\u0644\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0642\u0628\u0644 \u062A\u0623\u0643\u064A\u062F \u0623\u064A \u062E\u062F\u0645\u0629." },
      { q: "What does GDP require for pharmaceutical logistics?", a: "Good Distribution Practice requirements depend on the applicable rules and product. Ask the responsible regulator or qualified provider to confirm the required temperature controls, validation, records and monitoring; this page does not claim ENVOD certification.", qAr: "\u0645\u0627 \u0645\u062A\u0637\u0644\u0628\u0627\u062A GDP \u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0626\u064A\u0629\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u062C\u064A\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C. \u0627\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0623\u0648 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u062A\u0623\u0643\u064A\u062F \u0636\u0648\u0627\u0628\u0637 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0648\u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u061B \u0648\u0644\u0627 \u064A\u062F\u0651\u0639\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0639\u062A\u0645\u0627\u062F \u0625\u0646\u0641\u0648\u062F." },
      { q: "Can you help with pharmaceutical and medical-device import requirements?", a: "Requirements are specific to the product and intended use. Share the product details for a document-scope review; registration, approvals and clearance decisions belong to the responsible authorities and operators.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0641\u064A \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629\u061F", aAr: "\u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0642\u0635\u0648\u062F. \u0623\u0631\u0633\u0644 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u061B \u0648\u062A\u0628\u0642\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u062F\u0649 \u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646." }
    ]
  },
  13: {
    id: 13,
    slug: "food-fmcg",
    gradient: "linear-gradient(135deg,#041a04 0%,#072807 50%,#020e02 100%)",
    accentHex: "#22c55e",
    industries: ["Food Retail", "Supermarkets", "Restaurants", "FMCG Brands", "Agriculture"],
    industriesAr: ["\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621", "\u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A", "\u0627\u0644\u0645\u0637\u0627\u0639\u0645", "\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", "\u0627\u0644\u0632\u0631\u0627\u0639\u0629"],
    process: [
      { en: "Order", ar: "\u0627\u0644\u0637\u0644\u0628" },
      { en: "Product-document requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C" },
      { en: "Temperature requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629" },
      { en: "Transport", ar: "\u0627\u0644\u0646\u0642\u0644" },
      { en: "Distribution", ar: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639" }
    ],
    subServices: [
      { name: "Perishable-food transport enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0627\u0644\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u0644\u0641", desc: "Product temperature, packaging, route, carrier acceptance and monitoring arrangements must be confirmed per shipment.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Refrigerated transport availability enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0628\u0631\u062F", desc: "Vehicle type, operating temperature, cargo acceptance and route availability require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u0646\u0648\u0639 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u062F\u0631\u062C\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
      { name: "Temperature-monitoring requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629", desc: "Share the required temperature records and monitoring interval for a provider-specific review.", descAr: "\u0623\u0631\u0633\u0644 \u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627 \u0645\u0639 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629." },
      { name: "Fresh-food route enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0633\u0627\u0631 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0627\u0644\u0637\u0627\u0632\u062C\u0629", desc: "Transit and delivery timing depend on route, carrier capacity, handling requirements and any applicable approvals.", descAr: "\u064A\u0639\u062A\u0645\u062F \u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0633\u0639\u0629 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0645\u0646\u0637\u0628\u0642\u0629." },
      { name: "Frozen-cargo requirements review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062C\u0645\u062F\u0629", desc: "Confirm the cargo temperature range, equipment, storage and monitoring arrangements before booking.", descAr: "\u0623\u0643\u0651\u062F \u0646\u0637\u0627\u0642 \u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Nutraceutical temperature enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629", desc: "Handling, temperature and regulatory requirements depend on the product and destination.", descAr: "\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0646\u0638\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0648\u062C\u0647\u0629." },
      { name: "Climate-Controlled Warehousing Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u062E\u0632\u064A\u0646 \u063A\u0630\u0627\u0626\u064A \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", desc: "Confirm facility availability, temperature range, monitoring and cargo acceptance for the product.", descAr: "\u0623\u0643\u0651\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0644\u0644\u0645\u0646\u062A\u062C." },
      { name: "SFDA Food Requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0621 \u0644\u062F\u0649 \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621", desc: "Review product-specific import documents and approvals with the responsible operator and authority.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0639 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629." },
      { name: "Halal Documentation Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644", desc: "Check the applicable product and destination requirements; certification or approval is not provided by ENVOD.", descAr: "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629\u061B \u0648\u0644\u0627 \u062A\u0635\u062F\u0631 \u0625\u0646\u0641\u0648\u062F \u0634\u0647\u0627\u062F\u0629 \u0623\u0648 \u0645\u0648\u0627\u0641\u0642\u0629." },
      { name: "Supermarket Distribution", nameAr: "\u062A\u0648\u0632\u064A\u0639 \u0644\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A", desc: "Scheduled direct delivery to retail outlets.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u062F\u0648\u0644 \u0645\u0628\u0627\u0634\u0631 \u0625\u0644\u0649 \u0645\u0646\u0627\u0641\u0630 \u0627\u0644\u0628\u064A\u0639." },
      { name: "Time-Critical Deliveries", nameAr: "\u062A\u0648\u0635\u064A\u0644\u0627\u062A \u062D\u0631\u062C\u0629 \u0628\u0627\u0644\u0648\u0642\u062A", desc: "Express delivery options may be available for time-sensitive food cargo, subject to handling and route requirements.", descAr: "\u0642\u062F \u062A\u062A\u0648\u0641\u0631 \u062E\u064A\u0627\u0631\u0627\u062A \u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u0648\u0642\u062A \u0648\u0641\u0642\u0627\u064B \u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631." }
    ],
    whyEnvod: [
      { en: "Food-import documents and authority requirements reviewed per product", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0644\u0643\u0644 \u0645\u0646\u062A\u062C" },
      { en: "Applicable halal documents confirmed with the responsible bodies", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629" }
    ],
    faq: [
      { q: "Can you review halal and food-import document requirements?", a: "Requirements depend on the product, origin and destination. Share the product details and available documents; the relevant authorities and qualified operators determine certification, approval and clearance requirements.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0621\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629. \u0623\u0631\u0633\u0644 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629\u061B \u0648\u062A\u062D\u062F\u062F \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u0648\u0646 \u0627\u0644\u0645\u0624\u0647\u0644\u0648\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635." }
    ]
  },
  14: {
    id: 14,
    slug: "pet-animal-import",
    gradient: "linear-gradient(135deg,#041520 0%,#082030 50%,#020c10 100%)",
    accentHex: "#06b6d4",
    industries: ["Pet Owners", "Veterinary Clinics", "Breeders", "Zoos & Wildlife", "Agriculture"],
    industriesAr: ["\u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0644\u064A\u0641\u0629", "\u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u064A\u0637\u0631\u064A\u0629", "\u0627\u0644\u0645\u0631\u0628\u0648\u0646", "\u062D\u062F\u0627\u0626\u0642 \u0627\u0644\u062D\u064A\u0648\u0627\u0646", "\u0627\u0644\u0632\u0631\u0627\u0639\u0629"],
    process: [
      { en: "Vet Documentation", ar: "\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0628\u064A\u0637\u0631\u064A\u0629" },
      { en: "Health Certification", ar: "\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0635\u062D\u0629" },
      { en: "Export Clearance", ar: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062A\u0635\u062F\u064A\u0631" },
      { en: "Transport", ar: "\u0627\u0644\u0646\u0642\u0644" },
      { en: "SFDA Clearance", ar: "\u062A\u062E\u0644\u064A\u0635 SFDA" },
      { en: "Quarantine", ar: "\u0627\u0644\u062D\u062C\u0631 \u0627\u0644\u0635\u062D\u064A" },
      { en: "Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Pet import requirements enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0644\u064A\u0641\u0629", desc: "Permit, health-document, microchip, vaccination, carrier and route requirements must be confirmed with the responsible authorities and provider.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0635\u0631\u064A\u062D \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u0637\u0639\u064A\u0645 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644." },
      { name: "Live-animal transport enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u064A\u0629", desc: "Species, welfare, container, airline or road-carrier acceptance and applicable transport rules require specific review.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u0627\u0644\u0646\u0648\u0639 \u0648\u0631\u0641\u0627\u0647 \u0627\u0644\u062D\u064A\u0648\u0627\u0646 \u0648\u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0627\u0644\u062C\u0648\u064A \u0623\u0648 \u0627\u0644\u0628\u0631\u064A \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u0627\u0635\u0629." },
      { name: "Quarantine and authority requirements review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0631 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629", desc: "Facility, permit, inspection and availability requirements are confirmed with the relevant authority and operator.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u062A\u0635\u0631\u064A\u062D \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0639\u0646\u064A\u064A\u0646." },
      { name: "Veterinary Import Documentation", nameAr: "\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0628\u064A\u0637\u0631\u064A", desc: "Health certificates, microchip records, vaccination proofs.", descAr: "\u0634\u0647\u0627\u062F\u0627\u062A \u0635\u062D\u0629 \u0648\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0631\u0642\u0627\u0642\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0648\u0625\u062B\u0628\u0627\u062A\u0627\u062A \u0627\u0644\u062A\u0637\u0639\u064A\u0645." },
      { name: "GCC Animal Movement", nameAr: "\u062A\u0646\u0642\u0644 \u0627\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629", desc: "Cross-border transport of animals within the GCC.", descAr: "\u0646\u0642\u0644 \u0639\u0627\u0628\u0631 \u0644\u0644\u062D\u062F\u0648\u062F \u0644\u0644\u062D\u064A\u0648\u0627\u0646\u0627\u062A \u062F\u0627\u062E\u0644 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062E\u0644\u064A\u062C." },
      { name: "Wildlife import requirements enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u062D\u064A\u0627\u0629 \u0627\u0644\u0628\u0631\u064A\u0629", desc: "Species, CITES status, permits, carrier acceptance and destination rules must be confirmed before any shipment is considered.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0646\u0648\u0639 \u0648\u062D\u0627\u0644\u0629 CITES \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0648\u062C\u0647\u0629 \u0642\u0628\u0644 \u0627\u0644\u0646\u0638\u0631 \u0641\u064A \u0623\u064A \u0634\u062D\u0646\u0629." },
      { name: "Export of Livestock", nameAr: "\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0627\u0634\u064A\u0629", desc: "Managed export of livestock with all veterinary paperwork.", descAr: "\u062A\u0635\u062F\u064A\u0631 \u0645\u064F\u062F\u0627\u0631 \u0644\u0644\u0645\u0627\u0634\u064A\u0629 \u0645\u0639 \u062C\u0645\u064A\u0639 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0628\u064A\u0637\u0631\u064A\u0629." }
    ],
    whyEnvod: [
      { en: "Species-specific import rules and documents reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0648\u0627\u0639\u062F \u0648\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639" },
      { en: "Carrier acceptance and welfare requirements confirmed", ar: "\u062A\u0623\u0643\u064A\u062F \u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0631\u0641\u0627\u0647 \u0627\u0644\u062D\u064A\u0648\u0627\u0646" },
      { en: "Permits, inspections and quarantine arrangements checked", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0641\u062D\u0648\u0635 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0631" }
    ],
    faq: [
      { q: "What should I check before importing a pet into Saudi Arabia?", a: "Confirm current permits, health certificates, microchip and vaccination rules, carrier acceptance, route and any inspection or quarantine requirements with the responsible authorities and transport provider before booking.", qAr: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u0646\u0628\u063A\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647 \u0642\u0628\u0644 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u062D\u064A\u0648\u0627\u0646 \u0623\u0644\u064A\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F", aAr: "\u0623\u0643\u0651\u062F \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0631\u0642\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u0637\u0639\u064A\u0645 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0623\u064A \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0644\u0644\u0641\u062D\u0635 \u0623\u0648 \u0627\u0644\u062D\u062C\u0631 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ]
  },
  15: {
    id: 15,
    slug: "breakbulk-shipping",
    gradient: "linear-gradient(135deg,#1a0c04 0%,#2a1608 50%,#0e0804 100%)",
    accentHex: "#b45309",
    industries: ["Construction", "Steel & Metals", "Energy", "Shipping", "Ports"],
    industriesAr: ["\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0627\u0644\u0645\u0639\u0627\u062F\u0646", "\u0627\u0644\u0637\u0627\u0642\u0629", "\u0627\u0644\u0634\u062D\u0646", "\u0627\u0644\u0645\u0648\u0627\u0646\u0626"],
    process: [
      { en: "Cargo Assessment", ar: "\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0628\u0636\u0627\u0626\u0639" },
      { en: "Port Selection", ar: "\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u064A\u0646\u0627\u0621" },
      { en: "Stowage Planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0631\u0635" },
      { en: "Loading", ar: "\u0627\u0644\u062A\u062D\u0645\u064A\u0644" },
      { en: "Sea Transit", ar: "\u0627\u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u0628\u062D\u0631\u064A" },
      { en: "Port Discharge", ar: "\u0627\u0644\u062A\u0641\u0631\u064A\u063A" },
      { en: "Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Heavy Machinery Shipping", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0622\u0644\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", desc: "Non-containerized transport for industrial machinery.", descAr: "\u0646\u0642\u0644 \u0622\u0644\u0627\u062A \u0635\u0646\u0627\u0639\u064A\u0629 \u063A\u064A\u0631 \u062D\u0627\u0648\u064A\u0629." },
      { name: "Steel Structures Transport", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629", desc: "Port-to-port breakbulk for steel beams and frames.", descAr: "\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0645\u0646 \u0645\u064A\u0646\u0627\u0621 \u0644\u0645\u064A\u0646\u0627\u0621 \u0644\u0644\u0639\u0648\u0627\u0631\u0636 \u0648\u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629." },
      { name: "Construction Materials", nameAr: "\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621", desc: "Bulk and breakbulk for large construction material shipments.", descAr: "\u0633\u0627\u0626\u0628\u0629 \u0648\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0644\u0634\u062D\u0646\u0627\u062A \u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0643\u0628\u064A\u0631\u0629." },
      { name: "Industrial Equipment", nameAr: "\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629", desc: "Specialist handling for heavy industrial cargo.", descAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0627\u0644\u062B\u0642\u064A\u0644." },
      { name: "Port-to-port breakbulk enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0645\u0646 \u0645\u064A\u0646\u0627\u0621 \u0625\u0644\u0649 \u0645\u064A\u0646\u0627\u0621", desc: "Origin, destination, port operator, carrier, cargo dimensions and handling scope are confirmed per request.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0644\u0643\u0644 \u0637\u0644\u0628." },
      { name: "Cargo lashing requirements review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0631\u0628\u0637 \u0627\u0644\u0628\u0636\u0627\u0626\u0639", desc: "Lashing plan, method statement and qualified-provider responsibilities must be agreed for the cargo.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u062E\u0637\u0629 \u0627\u0644\u0631\u0628\u0637 \u0648\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0639\u0645\u0644 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0648\u0641\u0642 \u0627\u0644\u0628\u0636\u0627\u0639\u0629." },
      { name: "Loading and discharge enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u062A\u0641\u0631\u064A\u063A", desc: "Terminal availability, cargo acceptance, equipment, stevedoring scope and port rules require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u062D\u0637\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
      { name: "Port-agent requirements enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0648\u0643\u064A\u0644 \u0627\u0644\u0645\u064A\u0646\u0627\u0621", desc: "Port representation and vessel-call responsibilities must be confirmed with the appointed local agent.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0641\u064A \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0632\u064A\u0627\u0631\u0629 \u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0645\u0639 \u0627\u0644\u0648\u0643\u064A\u0644 \u0627\u0644\u0645\u062D\u0644\u064A \u0627\u0644\u0645\u0639\u064A\u0651\u0646." },
      { name: "Timber & Lumber Shipping", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0623\u062E\u0634\u0627\u0628", desc: "Specialized breakbulk for timber and lumber cargoes.", descAr: "\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0645\u062A\u062E\u0635\u0635 \u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0623\u062E\u0634\u0627\u0628 \u0648\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0634\u0628\u064A\u0629." },
      { name: "Abnormal Load Transport", nameAr: "\u0646\u0642\u0644 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u063A\u064A\u0631 \u0627\u0644\u0627\u0639\u062A\u064A\u0627\u062F\u064A\u0629", desc: "Permit-managed road transport for abnormal breakbulk loads.", descAr: "\u0646\u0642\u0644 \u0628\u0631\u064A \u0628\u062A\u0635\u0627\u0631\u064A\u062D \u0644\u0644\u0623\u062D\u0645\u0627\u0644 \u063A\u064A\u0631 \u0627\u0644\u0627\u0639\u062A\u064A\u0627\u062F\u064A\u0629 \u0641\u064A \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643." }
    ],
    whyEnvod: [
      { en: "Port and carrier options reviewed for each route", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0648\u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0644\u0643\u0644 \u0645\u0633\u0627\u0631" },
      { en: "Cargo dimensions and handling requirements assessed", ar: "\u062A\u0642\u064A\u064A\u0645 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629" },
      { en: "Document and operator responsibilities confirmed", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646" }
    ],
    overview: [
      { en: "Breakbulk shipping describes cargo loaded individually rather than in standard containers. It may suit machinery, steel structures, timber and other pieces whose dimensions or weight do not fit a standard container. The appropriate vessel, port, terminal, handling method and carrier acceptance depend on the shipment.", ar: "\u064A\u0635\u0641 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0646\u0641\u0635\u0644 (\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643) \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u064F\u062D\u0645\u0651\u0644 \u0628\u0634\u0643\u0644 \u0641\u0631\u062F\u064A \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629. \u0648\u0642\u062F \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0648\u0627\u0644\u0623\u062E\u0634\u0627\u0628 \u0648\u063A\u064A\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062A\u064A \u0644\u0627 \u062A\u062A\u0633\u0639 \u0644\u0647\u0627 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0628\u0633\u0628\u0628 \u0623\u0628\u0639\u0627\u062F\u0647\u0627 \u0623\u0648 \u0648\u0632\u0646\u0647\u0627. \u0648\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0648\u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0645\u062D\u0637\u0629 \u0648\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0639\u0644\u0649 \u0627\u0644\u0634\u062D\u0646\u0629." },
      { en: "For an enquiry, provide piece count, dimensions, weight, cargo type, origin and destination, loading and discharge requirements, and any delivery date. Port, carrier, terminal and qualified handling-provider availability must be confirmed before a booking.", ar: "\u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u060C \u0623\u0631\u0633\u0644 \u0639\u062F\u062F \u0627\u0644\u0642\u0637\u0639 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0648\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u062D\u0637\u0629 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ],
    faq: [
      { q: "What is breakbulk shipping?", a: "Breakbulk shipping refers to cargo that must be loaded individually \u2014 not in containers. It includes machinery, steel, timber, and other non-standard items too large for standard containers.", qAr: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0646\u0641\u0635\u0644 (\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643)\u061F", aAr: "\u064A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u064A\u062C\u0628 \u062A\u062D\u0645\u064A\u0644\u0647\u0627 \u0628\u0634\u0643\u0644 \u0641\u0631\u062F\u064A \u2014 \u063A\u064A\u0631 \u062D\u0627\u0648\u064A\u0629. \u064A\u0634\u0645\u0644 \u0627\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0627\u0644\u062E\u0634\u0628 \u0648\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u063A\u064A\u0631 \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629." },
      { q: "When might breakbulk be considered instead of containers?", a: "It may be considered when cargo dimensions, weight or shape make standard container loading unsuitable. Compare available equipment, vessel and port options, handling requirements, cost and schedule with a qualified operator for the specific movement.", qAr: "\u0645\u062A\u0649 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0641\u0643\u064A\u0631 \u0641\u064A \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A\u061F", aAr: "\u0642\u062F \u064A\u064F\u0646\u0638\u0631 \u0641\u064A\u0647 \u0639\u0646\u062F\u0645\u0627 \u062A\u062C\u0639\u0644 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0623\u0648 \u0648\u0632\u0646\u0647\u0627 \u0623\u0648 \u0634\u0643\u0644\u0647\u0627 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0641\u064A \u062D\u0627\u0648\u064A\u0629 \u0642\u064A\u0627\u0633\u064A\u0629 \u063A\u064A\u0631 \u0645\u0646\u0627\u0633\u0628. \u0642\u0627\u0631\u0646 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0633\u0641\u0646 \u0648\u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0645\u0639 \u0645\u0634\u063A\u0651\u0644 \u0645\u0624\u0647\u0644 \u0644\u0644\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629." },
      { q: "Which ports can be considered for a breakbulk enquiry?", a: "Share the origin and destination ports, cargo details and requested dates. Port and terminal capability, carrier acceptance, local handling providers and customs responsibilities must be verified for the route; mentioning a port does not imply ENVOD has a branch or direct terminal access there.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u062A\u064A \u064A\u0645\u0643\u0646 \u0628\u062D\u062B\u0647\u0627 \u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643\u061F", aAr: "\u0623\u0631\u0633\u0644 \u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u062F\u0631\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0645\u062D\u0637\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0642\u062F\u0645\u064A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u064A\u0646 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0644\u0644\u0645\u0633\u0627\u0631\u061B \u0648\u0644\u0627 \u064A\u0639\u0646\u064A \u0630\u0643\u0631 \u0645\u064A\u0646\u0627\u0621 \u0648\u062C\u0648\u062F \u0641\u0631\u0639 \u0644\u0625\u0646\u0641\u0648\u062F \u0623\u0648 \u0648\u0635\u0648\u0644 \u0645\u0628\u0627\u0634\u0631 \u0625\u0644\u0649 \u0645\u062D\u0637\u062A\u0647." }
    ]
  },
  16: {
    id: 16,
    slug: "dangerous-goods",
    gradient: "linear-gradient(135deg,#1a1004 0%,#2a1a04 50%,#100c02 100%)",
    accentHex: "#eab308",
    industries: ["Oil & Gas", "Chemicals", "Mining", "Pharmaceuticals", "Military"],
    industriesAr: ["\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629", "\u0627\u0644\u062A\u0639\u062F\u064A\u0646", "\u0627\u0644\u0623\u062F\u0648\u064A\u0629", "\u0627\u0644\u062C\u064A\u0634"],
    process: [
      { en: "DG Classification", ar: "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629" },
      { en: "Packaging", ar: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641" },
      { en: "Documentation", ar: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642" },
      { en: "Carrier Approval", ar: "\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0646\u0627\u0642\u0644" },
      { en: "Transport", ar: "\u0627\u0644\u0646\u0642\u0644" },
      { en: "Customs", ar: "\u0627\u0644\u062C\u0645\u0627\u0631\u0643" },
      { en: "Safe Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0622\u0645\u0646" }
    ],
    subServices: [
      { name: "DG Air Freight Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u062C\u0648\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Classification, packing, declarations, operator qualifications and airline acceptance must be confirmed.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0642\u0628\u0648\u0644 \u0634\u0631\u0643\u0629 \u0627\u0644\u0637\u064A\u0631\u0627\u0646." },
      { name: "DG Sea Freight Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Confirm the current IMDG requirements, carrier acceptance, packing and route for the cargo.", descAr: "\u0623\u0643\u0651\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A IMDG \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0644\u0644\u0628\u0636\u0627\u0639\u0629." },
      { name: "DG Road Transport Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0628\u0631\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Route, vehicle, applicable rules, documents and qualified-operator availability are checked per request.", descAr: "\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0624\u0647\u0644 \u0644\u0643\u0644 \u0637\u0644\u0628." },
      { name: "Chemical Cargo Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629", desc: "Review the safety data, classification, packaging, temperature and applicable permits before discussing options.", descAr: "\u0631\u0627\u062C\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0642\u0628\u0644 \u0645\u0646\u0627\u0642\u0634\u0629 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A." },
      { name: "DG Packaging & Labeling Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u0633\u0645\u064A\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Packaging approval, marking and provider qualifications must be verified for the substance and transport mode.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0645\u0627\u062F\u0629 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0646\u0642\u0644." },
      { name: "Explosives Transport Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0627\u0644\u0645\u062A\u0641\u062C\u0631\u0627\u062A", desc: "Do not assume acceptance; licensing, permits, route and specialist operator availability require authority review.", descAr: "\u0644\u0627 \u062A\u0641\u062A\u0631\u0636 \u0642\u0628\u0648\u0644 \u0627\u0644\u0634\u062D\u0646\u0629\u061B \u0625\u0630 \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u062A\u0631\u0627\u062E\u064A\u0635 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u062A\u062E\u0635\u0635 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629." },
      { name: "Radioactive Materials Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0634\u0639\u0629", desc: "Acceptance, packaging, transport rules, permits and qualified-provider evidence require shipment-specific review.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0623\u062F\u0644\u0629 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "DG Customs Requirements Review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", desc: "Commodity, declaration and permit requirements are confirmed with the responsible customs operator and authorities.", descAr: "\u062A\u064F\u0624\u0643\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0633\u0644\u0639\u0629 \u0648\u0627\u0644\u0625\u0642\u0631\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0645\u0639 \u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629." }
    ],
    whyEnvod: [
      { en: "Cargo classification and acceptance reviewed before any booking", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0642\u0628\u0648\u0644\u0647\u0627 \u0642\u0628\u0644 \u0623\u064A \u062D\u062C\u0632" },
      { en: "Applicable mode-specific rules and permits checked with qualified operators", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u0648\u0627\u0639\u062F \u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0645\u0639 \u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646 \u0627\u0644\u0645\u0624\u0647\u0644\u064A\u0646" },
      { en: "Responsibilities for declarations, packaging and labels agreed per shipment", ar: "\u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0644\u0643\u0644 \u0634\u062D\u0646\u0629" }
    ],
    faq: [
      { q: "Can every class of dangerous goods be shipped?", a: "Acceptance depends on the UN classification, substance, packaging, documents, route, carrier rules, permits and qualified-operator availability. Share the safety data sheet and shipment details for an initial requirements review; no class acceptance or ENVOD license is assumed.", qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0634\u062D\u0646 \u062C\u0645\u064A\u0639 \u0641\u0626\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629\u061F", aAr: "\u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0642\u0628\u0648\u0644 \u0639\u0644\u0649 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0627\u0644\u0645\u0627\u062F\u0629 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0624\u0647\u0644. \u0623\u0631\u0633\u0644 \u0646\u0634\u0631\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0648\u0644\u064A\u0629 \u0644\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u0642\u0628\u0648\u0644 \u0623\u064A \u0641\u0626\u0629 \u0623\u0648 \u0648\u062C\u0648\u062F \u062A\u0631\u062E\u064A\u0635 \u0644\u062F\u0649 \u0625\u0646\u0641\u0648\u062F." }
    ]
  },
  17: {
    id: 17,
    slug: "oog-cargo",
    gradient: "linear-gradient(135deg,#0a0a20 0%,#141430 50%,#050510 100%)",
    accentHex: "#818cf8",
    industries: ["Oil & Gas", "Power", "Construction", "Mining", "Wind Energy"],
    industriesAr: ["\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0637\u0627\u0642\u0629", "\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u062A\u0639\u062F\u064A\u0646", "\u0637\u0627\u0642\u0629 \u0627\u0644\u0631\u064A\u0627\u062D"],
    process: [
      { en: "Cargo Measurement", ar: "\u0642\u064A\u0627\u0633 \u0627\u0644\u0628\u0636\u0627\u0626\u0639" },
      { en: "Feasibility Study", ar: "\u062F\u0631\u0627\u0633\u0629 \u0627\u0644\u062C\u062F\u0648\u0649" },
      { en: "Permits", ar: "\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D" },
      { en: "Route Planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Transport and equipment review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A" },
      { en: "Lifting-provider requirements", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0631\u0641\u0639" },
      { en: "Site-access requirements", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639" }
    ],
    subServices: [
      { name: "OOG sea-freight enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633", desc: "Flat-rack, open-top, vessel, port and carrier options depend on cargo measurements and route acceptance.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0631\u0641 \u0627\u0644\u0645\u0633\u0637\u062D \u0648\u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u0645\u0641\u062A\u0648\u062D\u0629 \u0648\u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0648\u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0639\u0644\u0649 \u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u0633\u0627\u0631." },
      { name: "OOG road-movement enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0628\u0631\u064A \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633", desc: "Route survey, permits, escorts, vehicle, schedule and qualified-provider scope require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0646\u0637\u0627\u0642 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
      { name: "Flat-Rack Container Shipping", nameAr: "\u0634\u062D\u0646 \u0639\u0644\u0649 \u062D\u0627\u0648\u064A\u0629 \u0630\u0627\u062A \u0631\u0641\u0648\u0641 \u0645\u0633\u0637\u062D\u0629", desc: "Flat-rack sea shipping for machinery and structures.", descAr: "\u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0639\u0644\u0649 \u0631\u0641\u0648\u0641 \u0645\u0633\u0637\u062D\u0629 \u0644\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u0647\u064A\u0627\u0643\u0644." },
      { name: "Open-Top Container Shipping", nameAr: "\u0634\u062D\u0646 \u0641\u064A \u062D\u0627\u0648\u064A\u0629 \u0645\u0641\u062A\u0648\u062D\u0629 \u0627\u0644\u0623\u0639\u0644\u0649", desc: "Open-top containers for tall or crane-loaded cargo.", descAr: "\u062D\u0627\u0648\u064A\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629 \u0627\u0644\u0623\u0639\u0644\u0649 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u0645\u064F\u062D\u0645\u064E\u0651\u0644\u0629 \u0628\u0631\u0627\u0641\u0639\u0629." },
      { name: "Wind-blade movement enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0634\u0641\u0631\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u062D", desc: "Dimensions, route geometry, lifting points, permits and provider capacity must be assessed for the individual movement.", descAr: "\u064A\u062C\u0628 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0641\u0639 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0633\u0639\u0629 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629." },
      { name: "Transformer movement enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0627\u0644\u0645\u062D\u0648\u0644\u0627\u062A", desc: "Weight, dimensions, route, permits, lifting requirements and operator availability need shipment-specific review.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0631\u0641\u0639 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "SPMT availability enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0641\u0631 \u0645\u0631\u0643\u0628\u0627\u062A SPMT", desc: "Equipment availability, engineering design, route and qualified-provider credentials must be confirmed before booking.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0647\u0646\u062F\u0633\u064A \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Crane-provider requirements review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u0631\u0627\u0641\u0639\u0629", desc: "Lift plan, site conditions, equipment capacity and contractor authorization require independent confirmation.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u062E\u0637\u0629 \u0627\u0644\u0631\u0641\u0639 \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0633\u0639\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0645\u0642\u0627\u0648\u0644 \u062A\u0623\u0643\u064A\u062F\u0627\u064B \u0645\u0633\u062A\u0642\u0644\u0627\u064B." }
    ],
    whyEnvod: [
      { en: "Cargo dimensions and route constraints reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0642\u064A\u0648\u062F \u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Permit and escort requirements checked with the responsible parties", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629" },
      { en: "Equipment and qualified-provider availability confirmed per movement", ar: "\u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0644\u0643\u0644 \u062D\u0631\u0643\u0629" }
    ],
    overview: [
      { en: "Out-of-gauge (OOG) cargo exceeds standard container dimensions. Depending on the cargo and route, possible equipment may include flat-rack or open-top containers, specialized road trailers or lifting equipment. Carrier and operator acceptance, permits, engineering requirements and availability must be checked for the specific shipment.", ar: "\u062A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 (OOG) \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629. \u0648\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0629\u060C \u0628\u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631\u060C \u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0631\u0641 \u0627\u0644\u0645\u0633\u0637\u062D \u0623\u0648 \u0627\u0644\u0645\u0641\u062A\u0648\u062D\u0629 \u0623\u0648 \u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0628\u0631\u064A\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0623\u0648 \u0645\u0639\u062F\u0627\u062A \u0631\u0641\u0639. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0644\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629." },
      { en: "For an enquiry, provide cargo weight and dimensions, centre of gravity if known, origin, destination, loading and delivery sites, target dates and any site restrictions. A qualified provider must confirm the engineering, equipment and permit plan before any booking.", ar: "\u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u060C \u0623\u0631\u0633\u0644 \u0648\u0632\u0646 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0623\u0628\u0639\u0627\u062F\u0647\u0627 \u0648\u0645\u0631\u0643\u0632 \u0627\u0644\u062B\u0642\u0644 \u0625\u0646 \u0639\u064F\u0631\u0641 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u0623\u064A \u0642\u064A\u0648\u062F \u0644\u0644\u0645\u0648\u0642\u0639. \u064A\u062C\u0628 \u0623\u0646 \u064A\u0624\u0643\u062F \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0642\u0628\u0644 \u0623\u064A \u062D\u062C\u0632." }
    ],
    faq: [
      { q: "What is OOG (Out-of-Gauge) cargo?", a: "OOG refers to cargo that exceeds the standard dimensions of a 20ft or 40ft shipping container. This includes large machinery, turbines, transformers, and other industrial equipment requiring specialized handling.", qAr: "\u0645\u0627 \u0647\u064A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 (OOG)\u061F", aAr: "OOG \u062A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629 \u0644\u062D\u0627\u0648\u064A\u0629 20 \u0623\u0648 40 \u0642\u062F\u0645\u0627\u064B." },
      { q: "What is the difference between OOG and project cargo?", a: "Out-of-gauge describes cargo that exceeds container dimensions, while project cargo is a broader category of oversized, heavy, or complex shipments. Many OOG shipments are part of larger industrial projects and are handled with the same engineering-led planning.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 \u0648\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639\u061F", aAr: "\u064A\u0635\u0641 \u0645\u0635\u0637\u0644\u062D \xAB\u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633\xBB \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u062A\u062C\u0627\u0648\u0632 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u062D\u0627\u0648\u064A\u0629\u060C \u0628\u064A\u0646\u0645\u0627 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0641\u0626\u0629 \u0623\u0648\u0633\u0639 \u0645\u0646 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0623\u0648 \u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0623\u0648 \u0627\u0644\u0645\u0639\u0642\u0651\u062F\u0629. \u0648\u0627\u0644\u0639\u062F\u064A\u062F \u0645\u0646 \u0634\u062D\u0646\u0627\u062A \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 \u062C\u0632\u0621 \u0645\u0646 \u0645\u0634\u0627\u0631\u064A\u0639 \u0635\u0646\u0627\u0639\u064A\u0629 \u0623\u0643\u0628\u0631 \u0648\u062A\u064F\u0639\u0627\u0644\u064E\u062C \u0628\u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0647\u0646\u062F\u0633\u064A \u0646\u0641\u0633\u0647." },
      { q: "How might out-of-gauge cargo move by sea?", a: "A flat-rack, open-top or other arrangement may be considered after checking dimensions, weight, lashing, vessel capability, carrier acceptance and port handling. Suitability and availability are shipment-specific; a qualified operator must approve the final plan.", qAr: "\u0643\u064A\u0641 \u064A\u0645\u0643\u0646 \u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 \u0628\u062D\u0631\u0627\u064B\u061F", aAr: "\u0642\u062F \u064A\u064F\u0646\u0638\u0631 \u0641\u064A \u062D\u0627\u0648\u064A\u0629 \u0630\u0627\u062A \u0631\u0641 \u0645\u0633\u0637\u062D \u0623\u0648 \u0645\u0641\u062A\u0648\u062D\u0629 \u0623\u0648 \u062A\u0631\u062A\u064A\u0628 \u0622\u062E\u0631 \u0628\u0639\u062F \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0631\u0628\u0637 \u0648\u0642\u062F\u0631\u0629 \u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621. \u0648\u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0645\u0644\u0627\u0621\u0645\u0629 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u062D\u0633\u0628 \u0627\u0644\u0634\u062D\u0646\u0629\u061B \u0648\u064A\u062C\u0628 \u0623\u0646 \u064A\u0639\u062A\u0645\u062F \u0645\u0634\u063A\u0651\u0644 \u0645\u0624\u0647\u0644 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629." }
    ]
  },
  18: {
    id: 18,
    slug: "roro-shipping",
    gradient: "linear-gradient(135deg,#0a1420 0%,#0e1e30 50%,#060e18 100%)",
    accentHex: "#38bdf8",
    industries: ["Automotive", "Heavy Equipment", "Construction", "Agriculture", "Government Fleet"],
    industriesAr: ["\u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A", "\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", "\u0627\u0644\u0628\u0646\u0627\u0621", "\u0627\u0644\u0632\u0631\u0627\u0639\u0629", "\u0623\u0633\u0627\u0637\u064A\u0644 \u062D\u0643\u0648\u0645\u064A\u0629"],
    process: [
      { en: "Vehicle and cargo details", ar: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629" },
      { en: "Route and carrier options", ar: "\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0646\u0627\u0642\u0644" },
      { en: "Port and vessel availability", ar: "\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0627\u0644\u0633\u0641\u064A\u0646\u0629" },
      { en: "Import-document requirements", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" },
      { en: "Customs and operator responsibilities", ar: "\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644" },
      { en: "Collection or delivery planning", ar: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0623\u0648 \u0627\u0644\u062A\u0633\u0644\u064A\u0645" }
    ],
    subServices: [
      { name: "Private vehicle RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629", desc: "Vehicle eligibility, route, carrier acceptance, port requirements and import documents must be confirmed.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F." },
      { name: "Commercial vehicle RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", desc: "Share vehicle count, dimensions, weight, origin and destination to review route and vessel options.", descAr: "\u0623\u0631\u0633\u0644 \u0639\u062F\u062F \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0633\u0641\u064A\u0646\u0629." },
      { name: "Heavy-equipment RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", desc: "Cargo dimensions, operating condition, carrier acceptance and port handling requirements need review.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u062D\u0627\u0644\u062A\u0647\u0627 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0645\u0631\u0627\u062C\u0639\u0629." },
      { name: "Agricultural machinery RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u0622\u0644\u0627\u062A \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629", desc: "Confirm cargo type, measurements, route and applicable import requirements with the responsible operator.", descAr: "\u0623\u0643\u0651\u062F \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0642\u064A\u0627\u0633\u0627\u062A\u0647\u0627 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0645\u0639 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0633\u0624\u0648\u0644." },
      { name: "Bus and truck RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u062D\u0627\u0641\u0644\u0627\u062A \u0648\u0627\u0644\u0634\u0627\u062D\u0646\u0627\u062A", desc: "Vehicle dimensions, carrier acceptance, vessel availability and destination requirements are checked per shipment.", descAr: "\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629." },
      { name: "Motorcycle RoRo enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0631\u0648\u0631\u0648 \u0644\u0644\u062F\u0631\u0627\u062C\u0627\u062A \u0627\u0644\u0646\u0627\u0631\u064A\u0629", desc: "Review packing, securing, carrier acceptance and destination documents for the requested route.", descAr: "\u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u062A\u062B\u0628\u064A\u062A \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0637\u0644\u0648\u0628." },
      { name: "RoRo import-document review", nameAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0631\u0648\u0631\u0648", desc: "The responsible customs operator and authorities determine the applicable import and clearance requirements.", descAr: "\u064A\u062D\u062F\u062F \u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629." },
      { name: "RoRo export-document enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u062A\u0635\u062F\u064A\u0631 \u0631\u0648\u0631\u0648", desc: "Export documents, port handling and carrier responsibilities must be scoped and confirmed.", descAr: "\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0648\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u0646\u0627\u0621 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0644." },
      { name: "Vehicle collection or delivery enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0633\u062A\u0644\u0627\u0645 \u0623\u0648 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0631\u0643\u0628\u0629", desc: "Onward transport availability and delivery address requirements are checked for the route.", descAr: "\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0644\u0627\u062D\u0642 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0633\u0627\u0631." }
    ],
    whyEnvod: [
      { en: "Carrier, route and port options reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u064A\u0646\u0627\u0621" },
      { en: "Vehicle documents and import requirements checked", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" },
      { en: "Onward-transport scope confirmed separately", ar: "\u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0644\u0627\u062D\u0642 \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0635\u0644" }
    ],
    faq: [
      { q: "Which vehicles may be eligible for RoRo?", a: "RoRo may be considered for some cars, trucks, buses and wheeled machinery. Vessel and carrier acceptance, dimensions, operating condition, route and destination rules determine eligibility; confirm with the operator before booking.", qAr: "\u0645\u0627 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u062A\u064A \u0642\u062F \u062A\u0643\u0648\u0646 \u0645\u0624\u0647\u0644\u0629 \u0644\u0644\u0634\u062D\u0646 \u0628\u0627\u0644\u0631\u0648\u0631\u0648\u061F", aAr: "\u0642\u062F \u064A\u064F\u0646\u0638\u0631 \u0641\u064A \u0634\u062D\u0646 \u0628\u0639\u0636 \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0634\u0627\u062D\u0646\u0627\u062A \u0648\u0627\u0644\u062D\u0627\u0641\u0644\u0627\u062A \u0648\u0627\u0644\u0622\u0644\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0639\u062C\u0644\u0627\u062A. \u062A\u062D\u062F\u062F \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0633\u0641\u064A\u0646\u0629 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0648\u062C\u0647\u0629\u061B \u0623\u0643\u0651\u062F \u0630\u0644\u0643 \u0645\u0639 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ]
  },
  19: {
    id: 19,
    slug: "ata-carnet",
    pillar: ATA_CARNET_PILLAR,
    gradient: "linear-gradient(135deg,#0a2342 0%,#3a1206 52%,#07101f 100%)",
    accentHex: "#f59e0b",
    industries: ["Exhibitions & Events", "Broadcast & Media", "Oil & Gas", "Industrial Manufacturing", "Professional Services"],
    industriesAr: ["\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A", "\u0627\u0644\u0628\u062B \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0645", "\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A", "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629"],
    process: [
      { en: "Eligibility Review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0647\u0644\u064A\u0629" },
      { en: "General List & Values", ar: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u0642\u064A\u0645" },
      { en: "Issuing-Association Process", ar: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631" },
      { en: "Export Endorsement", ar: "\u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0639\u0646\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631" },
      { en: "Temporary Import", ar: "\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A" },
      { en: "Re-Export & Re-Import", ar: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" },
      { en: "Carnet Discharge", ar: "\u0625\u0628\u0631\u0627\u0621 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647" }
    ],
    subServices: [
      { name: "ATA Carnet Application Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0637\u0644\u0628 \u0643\u0627\u0631\u0646\u064A\u0647 ATA", desc: "Application requirements coordinated with the authorized issuing association.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629." },
      { name: "Exhibition Goods Carnet", nameAr: "\u0643\u0627\u0631\u0646\u064A\u0647 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636", desc: "Carnets for stands, displays, samples and demo units at trade shows.", descAr: "\u0643\u0627\u0631\u0646\u064A\u0647\u0627\u062A \u0644\u0644\u0623\u062C\u0646\u062D\u0629 \u0648\u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0627\u062A \u0648\u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0648\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0631\u0636." },
      { name: "Professional Equipment Carnet Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0643\u0627\u0631\u0646\u064A\u0647 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629", desc: "International ATA use may cover professional equipment; confirm current Saudi acceptance and item eligibility with the issuing association and authorities.", descAr: "\u0642\u062F \u064A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629\u061B \u0623\u0643\u0651\u062F \u0627\u0644\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u0627\u0644\u064A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A." },
      { name: "Commercial Samples Carnet Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0643\u0627\u0631\u0646\u064A\u0647 \u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", desc: "Do not assume commercial-sample eligibility in Saudi Arabia; confirm the intended use, goods and current rules with the authorized association.", descAr: "\u0644\u0627 \u062A\u0641\u062A\u0631\u0636 \u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061B \u0623\u0643\u0651\u062F \u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629." },
      { name: "Customs Endorsement Handling", nameAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0627\u0644\u062C\u0645\u0631\u0643\u064A", desc: "In-person endorsement at export, import, re-export and re-import.", descAr: "\u062A\u0635\u062F\u064A\u0642 \u0634\u062E\u0635\u064A \u0639\u0646\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F." },
      { name: "Carnet Discharge & Closure", nameAr: "\u0625\u0628\u0631\u0627\u0621 \u0648\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647", desc: "Track customs endorsements and re-export evidence for discharge review.", descAr: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0625\u062B\u0628\u0627\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0625\u0628\u0631\u0627\u0621." },
      { name: "Replacement & Extension Support", nameAr: "\u062F\u0639\u0645 \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0648\u0627\u0644\u062A\u0645\u062F\u064A\u062F", desc: "Replacement Carnets and validity guidance when plans change.", descAr: "\u0643\u0627\u0631\u0646\u064A\u0647\u0627\u062A \u0628\u062F\u064A\u0644\u0629 \u0648\u0625\u0631\u0634\u0627\u062F \u0628\u0634\u0623\u0646 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0639\u0646\u062F \u062A\u063A\u064A\u0651\u0631 \u0627\u0644\u062E\u0637\u0637." },
      { name: "Integrated Freight & Clearance", nameAr: "\u0634\u062D\u0646 \u0648\u062A\u062E\u0644\u064A\u0635 \u0645\u062A\u0643\u0627\u0645\u0644", desc: "Air, sea and road freight bundled with the Carnet and customs handling.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0648\u0628\u062D\u0631\u064A \u0648\u0628\u0631\u064A \u0645\u062F\u0645\u062C \u0645\u0639 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629." }
    ],
    whyEnvod: [
      { en: "Document planning for time-critical exhibition cargo", ar: "\u062A\u062E\u0637\u064A\u0637 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062D\u0633\u0651\u0627\u0633\u0629 \u0644\u0644\u0648\u0642\u062A" },
      { en: "One team for the document, the freight and customs endorsements", ar: "\u0641\u0631\u064A\u0642 \u0648\u0627\u062D\u062F \u0644\u0644\u0645\u0633\u062A\u0646\u062F \u0648\u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629" },
      { en: "Eligibility and current acceptance checked for each movement", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0643\u0644 \u062D\u0631\u0643\u0629" },
      { en: "Temporary-import requirements checked for each shipment", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0624\u0642\u062A \u0644\u0643\u0644 \u0634\u062D\u0646\u0629" },
      { en: "Endorsement and re-export records tracked for discharge", ar: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0642\u0627\u062A \u0648\u0633\u062C\u0644\u0627\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0644\u0625\u0628\u0631\u0627\u0621" }
    ],
    faq: [
      { q: "What is an ATA Carnet?", a: "An ATA Carnet is an international customs document used for eligible temporary movements of goods. Its validity, country acceptance, permitted use and guarantee conditions depend on the issuing terms and authorities. For Saudi Arabia, check the currently accepted purpose and goods before relying on a Carnet; it does not remove customs controls or other product approvals.", qAr: "\u0645\u0627 \u0647\u0648 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0645\u0633\u062A\u0646\u062F \u062C\u0645\u0631\u0643\u064A \u062F\u0648\u0644\u064A \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0624\u0642\u062A\u0629 \u0627\u0644\u0645\u0624\u0647\u0644\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639. \u0648\u062A\u0639\u062A\u0645\u062F \u0635\u0644\u0627\u062D\u064A\u062A\u0647 \u0648\u0642\u0628\u0648\u0644\u0647 \u0641\u064A \u0627\u0644\u0628\u0644\u062F\u0627\u0646 \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0636\u0645\u0627\u0646 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A. \u062A\u062D\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0642\u0628\u0648\u0644\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0642\u0628\u0644 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0639\u0644\u0649 \u0627\u0644\u0643\u0627\u0631\u0646\u064A\u0647\u061B \u0641\u0647\u0648 \u0644\u0627 \u064A\u0644\u063A\u064A \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0623\u0648 \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0623\u062E\u0631\u0649." },
      { q: "How quickly can ENVOD process an ATA Carnet?", a: "Timing depends on the issuing association, shipment eligibility, complete documents, any pre-approval and customs examination. Confirm the applicable process before shipping; ENVOD does not promise a fixed issuance or clearance time.", qAr: "\u0645\u0627 \u0645\u062F\u0649 \u0633\u0631\u0639\u0629 \u0625\u0646\u0641\u0648\u062F \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u062F\u0629 \u0639\u0644\u0649 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0633\u0628\u0642\u0629 \u0648\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A. \u0623\u0643\u0651\u062F \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0637\u0628\u0642 \u0642\u0628\u0644 \u0627\u0644\u0634\u062D\u0646\u061B \u0648\u0644\u0627 \u062A\u0639\u062F \u0625\u0646\u0641\u0648\u062F \u0628\u0645\u062F\u0629 \u0625\u0635\u062F\u0627\u0631 \u0623\u0648 \u0641\u0633\u062D \u062B\u0627\u0628\u062A\u0629." },
      { q: "What goods can travel on an ATA Carnet?", a: "The international ATA system covers certain categories, but Saudi acceptance should not be inferred from global eligibility. Confirm the goods, intended use, destination, issuing terms and re-export deadline with the authorized association and customs authorities. Consumables, giveaways and goods left or sold at an event may require a different import procedure.", qAr: "\u0645\u0627 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u064A\u0645\u0643\u0646 \u0646\u0642\u0644\u0647\u0627 \u0628\u0643\u0627\u0631\u0646\u064A\u0647 ATA\u061F", aAr: "\u064A\u0634\u0645\u0644 \u0646\u0638\u0627\u0645 ATA \u0627\u0644\u062F\u0648\u0644\u064A \u0641\u0626\u0627\u062A \u0645\u0639\u064A\u0646\u0629\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0646\u0628\u063A\u064A \u0627\u0633\u062A\u0646\u062A\u0627\u062C \u0627\u0644\u0642\u0628\u0648\u0644 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0645\u0646 \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629. \u0623\u0643\u0651\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0648\u0645\u0648\u0639\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0645\u0639 \u062C\u0647\u0629 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0645\u062E\u0648\u0651\u0644\u0629 \u0648\u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629. \u0648\u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0648\u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0648\u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u064F\u062A\u0631\u0643 \u0623\u0648 \u062A\u064F\u0628\u0627\u0639 \u0641\u064A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0645\u062E\u062A\u0644\u0641." }
    ]
  },
  20: {
    id: 20,
    slug: "white-glove-logistics",
    gradient: "linear-gradient(135deg,#1a1028 0%,#241536 50%,#0d0816 100%)",
    accentHex: "#e9b44c",
    industries: ["Luxury Retail", "Art & Galleries", "Healthcare", "Hospitality & Hotels", "Real Estate & Villas"],
    industriesAr: ["\u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629", "\u0627\u0644\u0641\u0646 \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0641\u0646\u064A\u0629", "\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629", "\u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0648\u0627\u0644\u0641\u0646\u0627\u062F\u0642", "\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0641\u0644\u0644"],
    process: [
      { en: "Item and site requirements review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0642\u0637\u0639\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639" },
      { en: "Packing and handling scope", ar: "\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629" },
      { en: "Provider and route availability", ar: "\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631" },
      { en: "Import-document requirements", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" },
      { en: "Inside-delivery access review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u062F\u0627\u062E\u0644\u064A" },
      { en: "Setup responsibilities to confirm", ar: "\u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0628" }
    ],
    subServices: [
      { name: "High-care furniture delivery enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0635\u064A\u0644 \u0623\u062B\u0627\u062B \u0628\u0639\u0646\u0627\u064A\u0629 \u062E\u0627\u0635\u0629", desc: "Item list, packing, access, placement and crew availability are reviewed for the requested site.", descAr: "\u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0642\u0637\u0639 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0637\u0627\u0642\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0637\u0644\u0648\u0628." },
      { name: "Art and antiques handling enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0641\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0641", desc: "Handling, packing, climate and insurance requirements need confirmation with the responsible provider.", descAr: "\u062A\u062A\u0637\u0644\u0628 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0645\u0646\u0627\u062E \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u062A\u0623\u0643\u064A\u062F\u0627\u064B \u0645\u0639 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644." },
      { name: "Medical-equipment movement enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629", desc: "Dimensions, sensitivity, handling instructions, route and any regulatory requirements must be reviewed.", descAr: "\u064A\u062C\u0628 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0623\u064A \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629." },
      { name: "Hotel FF&E shipment enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0623\u062B\u0627\u062B \u0648\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0627\u0644\u0641\u0646\u0627\u062F\u0642", desc: "Project dates, inventory, site access, delivery sequence and installation responsibilities are confirmed per project.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062A\u0633\u0644\u0633\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0644\u0643\u0644 \u0645\u0634\u0631\u0648\u0639." },
      { name: "Interior-project delivery enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0635\u064A\u0644 \u0644\u0645\u0634\u0631\u0648\u0639 \u062A\u0635\u0645\u064A\u0645 \u062F\u0627\u062E\u0644\u064A", desc: "Site access, item handling, delivery schedule and provider availability require confirmation.", descAr: "\u064A\u062A\u0637\u0644\u0628 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0642\u0637\u0639 \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u062A\u0623\u0643\u064A\u062F\u0627\u064B." },
      { name: "Installation and setup requirements", nameAr: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F", desc: "Confirm whether the venue permits the work and whether a qualified, authorized provider is available.", descAr: "\u0623\u0643\u0651\u062F \u0633\u0645\u0627\u062D \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0627\u0644\u0639\u0645\u0644 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u0648\u0645\u0635\u0631\u062D \u0644\u0647." }
    ],
    whyEnvod: [
      { en: "Item, access and handling requirements reviewed", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0642\u0637\u0639\u0629 \u0648\u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629" },
      { en: "Packing and specialist-provider availability confirmed", ar: "\u062A\u0623\u0643\u064A\u062F \u062A\u0648\u0641\u0631 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u062E\u0635\u0635" },
      { en: "Delivery and setup responsibilities agreed per request", ar: "\u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0644\u0643\u0644 \u0637\u0644\u0628" }
    ],
    faq: [
      { q: "What should be confirmed for high-care delivery?", a: "Confirm item value and fragility, packing method, building access, receiving appointment, placement or setup requirements, insurance and the provider's qualifications. The requested scope and availability must be agreed before booking.", qAr: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u0646\u0628\u063A\u064A \u062A\u0623\u0643\u064A\u062F\u0647 \u0644\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0627\u0644\u064A \u0627\u0644\u0639\u0646\u0627\u064A\u0629\u061F", aAr: "\u0623\u0643\u0651\u062F \u0642\u064A\u0645\u0629 \u0627\u0644\u0642\u0637\u0639\u0629 \u0648\u0642\u0627\u0628\u0644\u064A\u062A\u0647\u0627 \u0644\u0644\u0643\u0633\u0631 \u0648\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0628\u0646\u0649 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0623\u0648 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629. \u064A\u062C\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." }
    ]
  },
  21: {
    id: 21,
    slug: "temperature-controlled-logistics",
    gradient: "linear-gradient(135deg,#062030 0%,#0a3042 50%,#04141f 100%)",
    accentHex: "#22d3ee",
    industries: ["Food & Beverage", "Supermarkets & Retail", "Dairy & Meat", "Fresh Produce & Agriculture", "Chemicals"],
    industriesAr: ["\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0628\u0627\u062A", "\u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0648\u0627\u0644\u062A\u062C\u0632\u0626\u0629", "\u0627\u0644\u0623\u0644\u0628\u0627\u0646 \u0648\u0627\u0644\u0644\u062D\u0648\u0645", "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0637\u0627\u0632\u062C\u0629 \u0648\u0627\u0644\u0632\u0631\u0627\u0639\u0629", "\u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A"],
    process: [
      { en: "Temperature Requirements", ar: "\u062A\u062D\u062F\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629" },
      { en: "Pre-Cooling & Loading", ar: "\u0627\u0644\u062A\u0628\u0631\u064A\u062F \u0627\u0644\u0645\u0633\u0628\u0642 \u0648\u0627\u0644\u062A\u062D\u0645\u064A\u0644" },
      { en: "Monitored Transit", ar: "\u0646\u0642\u0644 \u0645\u0631\u0627\u0642\u064E\u0628" },
      { en: "Cold Storage", ar: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0628\u0631\u062F" },
      { en: "Customs & Inspection", ar: "\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0641\u062D\u0635" },
      { en: "Chilled Final Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0645\u0628\u0631\u062F\u0627\u064B" }
    ],
    subServices: [
      { name: "Refrigerated Trucking Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0628\u0627\u0644\u0634\u0627\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0628\u0631\u062F\u0629", desc: "Vehicle, temperature range, route, monitoring and availability must be confirmed for the cargo.", descAr: "\u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u062A\u0648\u0641\u0631 \u0644\u0644\u0628\u0636\u0627\u0639\u0629." },
      { name: "Frozen Cargo Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u062C\u0645\u062F\u0629", desc: "Confirm the required temperature, loading conditions, monitoring and operator capability before booking.", descAr: "\u0623\u0643\u0651\u062F \u062F\u0631\u062C\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0638\u0631\u0648\u0641 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0642\u062F\u0631\u0629 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632." },
      { name: "Chilled Distribution Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0628\u0631\u062F\u0629", desc: "Product acceptance, temperature range, destination and receiving schedule are reviewed per request.", descAr: "\u062A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0648\u0644 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0644\u0643\u0644 \u0637\u0644\u0628." },
      { name: "Cold Chain Coordination", nameAr: "\u062A\u0646\u0633\u064A\u0642 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0628\u0631\u064A\u062F", desc: "Confirm which party provides equipment, monitoring, temperature records and exception handling.", descAr: "\u0623\u0643\u0651\u062F \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u062A\u064A \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0627\u0646\u062D\u0631\u0627\u0641\u0627\u062A." },
      { name: "Food Logistics Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629", desc: "Review product, route and applicable food-import requirements; no compliance certification is implied.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0621 \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629\u061B \u0648\u0644\u0627 \u064A\u064F\u0641\u0647\u0645 \u0645\u0646 \u0630\u0644\u0643 \u0648\u062C\u0648\u062F \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0645\u062A\u062B\u0627\u0644." },
      { name: "Reefer Container Shipping Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0645\u0628\u0631\u062F\u0629", desc: "Carrier, container, temperature and terminal plug-in arrangements are confirmed for each route.", descAr: "\u064A\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0648\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u062A\u0631\u062A\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A \u0628\u0627\u0644\u0645\u062D\u0637\u0629 \u0644\u0643\u0644 \u0645\u0633\u0627\u0631." }
    ],
    whyEnvod: [
      { en: "Equipment, temperature monitoring and reporting confirmed per shipment", ar: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629" },
      { en: "Cargo compatibility and available temperature range checked before booking", ar: "\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u0644\u0627\u0621\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0645\u062A\u0627\u062D \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632" },
      { en: "Custody, handoffs and temperature responsibilities documented in the agreed scope", ar: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062D\u064A\u0627\u0632\u0629 \u0648\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0636\u0645\u0646 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647" }
    ],
    faq: [
      { q: "How is this different from medical & pharma logistics?", a: "Temperature-controlled logistics refers to cargo requiring specified handling conditions. Equipment, facilities, monitoring, route and regulatory requirements must be confirmed for each product. GDP compliance, validated equipment or SFDA clearance is not assumed.", qAr: "\u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646\u0647\u0627 \u0648\u0628\u064A\u0646 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0648\u0627\u0644\u0635\u064A\u062F\u0644\u0627\u0646\u064A\u0629\u061F", aAr: "\u062A\u0634\u064A\u0631 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0628\u062F\u0631\u062C\u0627\u062A \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629 \u0625\u0644\u0649 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062A\u064A \u062A\u062A\u0637\u0644\u0628 \u0638\u0631\u0648\u0641 \u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u062D\u062F\u062F\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u0634\u0622\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0643\u0644 \u0645\u0646\u062A\u062C. \u0648\u0644\u0627 \u064A\u064F\u0641\u062A\u0631\u0636 \u0627\u0645\u062A\u062B\u0627\u0644 GDP \u0623\u0648 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0623\u0648 \u062A\u062E\u0644\u064A\u0635 \u0647\u064A\u0626\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u062F\u0648\u0627\u0621." }
    ]
  },
  22: {
    id: 22,
    slug: "packaging-crating",
    gradient: "linear-gradient(135deg,#201409 0%,#2e1d0c 50%,#140c05 100%)",
    accentHex: "#d97706",
    industries: ["Industrial Manufacturing", "Oil & Gas", "Electronics", "Art & Antiques", "Exhibitions & Events"],
    industriesAr: ["\u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A", "\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", "\u0627\u0644\u0641\u0646 \u0648\u0627\u0644\u062A\u062D\u0641", "\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A"],
    process: [
      { en: "Cargo Survey", ar: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629" },
      { en: "Packing Design", ar: "\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u062A\u063A\u0644\u064A\u0641" },
      { en: "Crate Fabrication", ar: "\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642" },
      { en: "Packing & Sealing", ar: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0625\u063A\u0644\u0627\u0642" },
      { en: "Marking & Labeling", ar: "\u0627\u0644\u062A\u0631\u0645\u064A\u0632 \u0648\u0627\u0644\u0645\u0644\u0635\u0642\u0627\u062A" },
      { en: "Handover to Freight", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0634\u062D\u0646" }
    ],
    subServices: [
      { name: "Export Packing", nameAr: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0644\u0644\u062A\u0635\u062F\u064A\u0631", desc: "Professional export-grade packing for sea, air, and road shipments.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0628\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u0631\u064A." },
      { name: "ISPM-15 Wooden Crate Enquiry", nameAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0648\u0641\u0642 ISPM-15", desc: "Treatment, marking and provider records must be verified for the destination and shipment.", descAr: "\u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0633\u062C\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0641\u0642 \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "Heavy Equipment Packing", nameAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", desc: "Skidding, bracing, and crating for machinery and industrial equipment.", descAr: "\u062A\u062B\u0628\u064A\u062A \u0648\u062F\u0639\u0645 \u0648\u062A\u0635\u0646\u064A\u062F \u0644\u0644\u0622\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629." },
      { name: "Fragile Cargo Packing", nameAr: "\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0647\u0634\u0629", desc: "Shock-absorbing, custom-fit packing for glass, ceramics, and delicate items.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u0645\u062E\u0635\u0635 \u0645\u0627\u0635 \u0644\u0644\u0635\u062F\u0645\u0627\u062A \u0644\u0644\u0632\u062C\u0627\u062C \u0648\u0627\u0644\u0633\u064A\u0631\u0627\u0645\u064A\u0643 \u0648\u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629." },
      { name: "Vacuum & Barrier Packing", nameAr: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0641\u0631\u063A \u0648\u0627\u0644\u0639\u0627\u0632\u0644", desc: "Moisture-barrier and vacuum packing for corrosion-sensitive cargo.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u0639\u0627\u0632\u0644 \u0644\u0644\u0631\u0637\u0648\u0628\u0629 \u0648\u0645\u0641\u0631\u063A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062A\u0622\u0643\u0644." },
      { name: "On-Site Packing Teams", nameAr: "\u0641\u0631\u0642 \u062A\u063A\u0644\u064A\u0641 \u0645\u064A\u062F\u0627\u0646\u064A\u0629", desc: "Mobile crews that pack and crate at your factory, site, or warehouse.", descAr: "\u0641\u0631\u0642 \u0645\u062A\u0646\u0642\u0644\u0629 \u062A\u063A\u0644\u0641 \u0648\u062A\u0635\u0646\u0651\u062F \u0641\u064A \u0645\u0635\u0646\u0639\u0643 \u0623\u0648 \u0645\u0648\u0642\u0639\u0643 \u0623\u0648 \u0645\u0633\u062A\u0648\u062F\u0639\u0643." }
    ],
    whyEnvod: [
      { en: "Wood-packaging treatment and marking evidence confirmed for the destination", ar: "\u062A\u0623\u0643\u064A\u062F \u0623\u062F\u0644\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062E\u0634\u0628\u064A \u0648\u0639\u0644\u0627\u0645\u0627\u062A\u0647 \u0644\u0644\u0648\u062C\u0647\u0629" },
      { en: "Packing engineered to the cargo \u2014 not off-the-shelf boxes", ar: "\u062A\u063A\u0644\u064A\u0641 \u0645\u064F\u0647\u0646\u062F\u064E\u0633 \u062D\u0633\u0628 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u2014 \u0648\u0644\u064A\u0633 \u0635\u0646\u0627\u062F\u064A\u0642 \u062C\u0627\u0647\u0632\u0629" },
      { en: "Packing, crating, and freight combined under one provider", ar: "\u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u0635\u0646\u064A\u062F \u0648\u0634\u062D\u0646 \u0644\u062F\u0649 \u0645\u0632\u0648\u062F \u0648\u0627\u062D\u062F" }
    ],
    faq: [
      { q: "What is ISPM-15 and why does it matter?", a: "ISPM 15 sets requirements for wood packaging material in international trade. Confirm whether the destination requires treatment and marking, and verify the supplier's records before dispatch. ENVOD does not claim that every packaging item it arranges is certified.", qAr: "\u0645\u0627 \u0647\u0648 \u0645\u0639\u064A\u0627\u0631 ISPM-15 \u0648\u0644\u0645\u0627\u0630\u0627 \u064A\u0647\u0645\u061F", aAr: "\u064A\u062D\u062F\u062F \u0645\u0639\u064A\u0627\u0631 ISPM-15 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0648\u0627\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062E\u0634\u0628\u064A\u0629 \u0641\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629. \u062A\u062D\u0642\u0651\u0642 \u0645\u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0648\u062C\u0647\u0629 \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A\u060C \u0648\u0631\u0627\u062C\u0639 \u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F \u0642\u0628\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644. \u0648\u0644\u0627 \u064A\u062F\u0651\u0639\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0646 \u0643\u0644 \u0645\u0648\u0627\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062A\u064A \u062A\u064F\u0631\u062A\u0628\u0647\u0627 \u0625\u0646\u0641\u0648\u062F \u0645\u0639\u062A\u0645\u062F\u0629." }
    ]
  },
  23: {
    id: 23,
    slug: "express-courier",
    gradient: "linear-gradient(135deg,#220808 0%,#331010 50%,#140404 100%)",
    accentHex: "#f97316",
    industries: ["Banking & Legal", "Healthcare", "E-commerce", "Manufacturing", "Government"],
    industriesAr: ["\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646", "\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629", "\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639", "\u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629"],
    process: [
      { en: "Booking", ar: "\u0627\u0644\u062D\u062C\u0632" },
      { en: "Express Pickup", ar: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0633\u0631\u064A\u0639" },
      { en: "Sort & Dispatch", ar: "\u0627\u0644\u0641\u0631\u0632 \u0648\u0627\u0644\u0625\u0631\u0633\u0627\u0644" },
      { en: "Line-Haul / Air Uplift", ar: "\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A / \u0627\u0644\u062C\u0648\u064A" },
      { en: "Customs (International)", ar: "\u0627\u0644\u062C\u0645\u0627\u0631\u0643 (\u062F\u0648\u0644\u064A\u0627\u064B)" },
      { en: "Delivery & Proof of Delivery", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0625\u062B\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645" }
    ],
    subServices: [
      { name: "Urgent Pickup & Delivery", nameAr: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u0633\u0644\u064A\u0645 \u0639\u0627\u062C\u0644", desc: "Urgent pickup and delivery options can be checked for the route and requested schedule.", descAr: "\u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0627\u062C\u0644 \u0628\u062D\u0633\u0628 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628." },
      { name: "Scheduled Delivery", nameAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u062F\u0648\u0644", desc: "Delivery estimates depend on origin, destination, service availability, and shipment requirements.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062A\u0642\u062F\u064A\u0631\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0629." },
      { name: "International Express", nameAr: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u0633\u0631\u064A\u0639", desc: "International express options depend on destination, carrier schedules, cargo acceptance, and customs requirements.", descAr: "\u062A\u0639\u062A\u0645\u062F \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0639\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A." },
      { name: "Document Shipping", nameAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A", desc: "Secure, tracked shipping for contracts, tenders, and legal documents.", descAr: "\u0634\u062D\u0646 \u0622\u0645\u0646 \u0648\u0645\u062A\u062A\u0628\u0639 \u0644\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629." },
      { name: "Time-Critical Spare Parts", nameAr: "\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0627\u0644\u062D\u0631\u062C\u0629 \u0632\u0645\u0646\u064A\u0627\u064B", desc: "Emergency spare-part logistics to keep production lines and fleets running.", descAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0637\u0648\u0627\u0631\u0626 \u0644\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0644\u0625\u0628\u0642\u0627\u0621 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u0627\u0644\u0623\u0633\u0627\u0637\u064A\u0644 \u062A\u0639\u0645\u0644." }
    ],
    whyEnvod: [
      { en: "Urgent shipment enquiries are assessed using route, cargo, and deadline details", ar: "\u064A\u062A\u0645 \u062A\u0642\u064A\u064A\u0645 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0628\u0639\u062F \u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628" },
      { en: "Business accounts with priority handling and one contact", ar: "\u062D\u0633\u0627\u0628\u0627\u062A \u0623\u0639\u0645\u0627\u0644 \u0628\u0645\u0646\u0627\u0648\u0644\u0629 \u0630\u0627\u062A \u0623\u0648\u0644\u0648\u064A\u0629 \u0648\u062C\u0647\u0629 \u062A\u0648\u0627\u0635\u0644 \u0648\u0627\u062D\u062F\u0629" },
      { en: "Customs handled in-house so express stays express", ar: "\u062C\u0645\u0627\u0631\u0643 \u062F\u0627\u062E\u0644\u064A\u0629 \u062D\u062A\u0649 \u064A\u0628\u0642\u0649 \u0627\u0644\u0633\u0631\u064A\u0639 \u0633\u0631\u064A\u0639\u0627\u064B" }
    ],
    faq: [
      { q: "How fast can an urgent shipment move?", a: "Same-day or next-day options may be available on selected routes. Timing depends on origin, destination, cut-off time, capacity, and cargo requirements. Share the route and deadline for a shipment-specific estimate.", qAr: "\u0645\u0627 \u0645\u062F\u0649 \u0633\u0631\u0639\u0629 \u0646\u0642\u0644 \u0634\u062D\u0646\u0629 \u0639\u0627\u062C\u0644\u0629\u061F", aAr: "\u0642\u062F \u062A\u062A\u0648\u0641\u0631 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0630\u0627\u062A\u0647 \u0623\u0648 \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A \u0644\u0628\u0639\u0636 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A. \u0648\u062A\u0639\u062A\u0645\u062F \u0627\u0644\u0645\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0648\u0642\u062A \u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u0633\u0639\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0639\u0629. \u0623\u0631\u0633\u0644 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062A\u0642\u062F\u064A\u0631 \u062E\u0627\u0635 \u0628\u0627\u0644\u0634\u062D\u0646\u0629." }
    ]
  },
  24: {
    id: 24,
    slug: "cross-trade-shipping",
    gradient: "linear-gradient(135deg,#06201a 0%,#0a2f26 50%,#041410 100%)",
    accentHex: "#34d399",
    industries: ["Trading Companies", "Manufacturing", "Oil & Gas", "Retail Chains", "Project Contractors"],
    industriesAr: ["\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", "\u0627\u0644\u062A\u0635\u0646\u064A\u0639", "\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u063A\u0627\u0632", "\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u062C\u0632\u0626\u0629", "\u0645\u0642\u0627\u0648\u0644\u0648 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639"],
    process: [
      { en: "Trade Lane Review", ar: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u0627\u0631 \u0627\u0644\u062A\u062C\u0627\u0631\u0629" },
      { en: "Supplier Coordination", ar: "\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0645\u0639 \u0627\u0644\u0645\u0648\u0631\u062F" },
      { en: "Origin Pickup", ar: "\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0646 \u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623" },
      { en: "Documentation & Switch B/L", ar: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0648\u062A\u0628\u062F\u064A\u0644 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646" },
      { en: "International Freight", ar: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A" },
      { en: "Destination Clearance & Delivery", ar: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0628\u0627\u0644\u0648\u062C\u0647\u0629" }
    ],
    subServices: [
      { name: "China\u2013GCC Cross Trade", nameAr: "\u062A\u062C\u0627\u0631\u0629 \u0639\u0627\u0628\u0631\u0629 \u0627\u0644\u0635\u064A\u0646\u2013\u0627\u0644\u062E\u0644\u064A\u062C", desc: "Direct shipping from Chinese factories to the UAE and GCC markets.", descAr: "\u0634\u062D\u0646 \u0645\u0628\u0627\u0634\u0631 \u0645\u0646 \u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0635\u064A\u0646\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0648\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062E\u0644\u064A\u062C." },
      { name: "China\u2013USA Cross Trade", nameAr: "\u062A\u062C\u0627\u0631\u0629 \u0639\u0627\u0628\u0631\u0629 \u0627\u0644\u0635\u064A\u0646\u2013\u0623\u0645\u0631\u064A\u0643\u0627", desc: "Factory-to-door movements between China and the United States, managed from Riyadh.", descAr: "\u0634\u062D\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0645\u0635\u0646\u0639 \u0644\u0644\u0628\u0627\u0628 \u0628\u064A\u0646 \u0627\u0644\u0635\u064A\u0646 \u0648\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u062A\u064F\u062F\u0627\u0631 \u0645\u0646 \u0627\u0644\u0631\u064A\u0627\u0636." },
      { name: "Europe\u2013Middle East Cross Trade", nameAr: "\u062A\u062C\u0627\u0631\u0629 \u0639\u0627\u0628\u0631\u0629 \u0623\u0648\u0631\u0648\u0628\u0627\u2013\u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637", desc: "Direct routings such as Germany to Saudi Arabia and the wider region.", descAr: "\u0645\u0633\u0627\u0631\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u062B\u0644 \u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0623\u0648\u0633\u0639." },
      { name: "Switch Bill of Lading", nameAr: "\u062A\u0628\u062F\u064A\u0644 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646", desc: "Switch B/L handling that keeps your supplier and buyer confidential.", descAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0628\u0648\u0644\u064A\u0635\u0629 \u0628\u0645\u0627 \u064A\u062D\u0641\u0638 \u0633\u0631\u064A\u0629 \u0627\u0644\u0645\u0648\u0631\u062F \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u064A." },
      { name: "Third-Country Documentation", nameAr: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062F\u0648\u0644\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629", desc: "Invoicing, certificates, and compliance for goods that never enter Saudi Arabia.", descAr: "\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0634\u0647\u0627\u062F\u0627\u062A \u0648\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0628\u0636\u0627\u0626\u0639 \u0644\u0627 \u062A\u062F\u062E\u0644 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0625\u0637\u0644\u0627\u0642\u0627\u064B." },
      { name: "Multi-Origin Consolidation", nameAr: "\u062A\u062C\u0645\u064A\u0639 \u0645\u0646 \u0645\u0646\u0627\u0634\u0626 \u0645\u062A\u0639\u062F\u062F\u0629", desc: "Consolidating cargo from several origin countries into one destination shipment.", descAr: "\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0645\u0646 \u0639\u062F\u0629 \u062F\u0648\u0644 \u0645\u0646\u0634\u0623 \u0641\u064A \u0634\u062D\u0646\u0629 \u0648\u0627\u062D\u062F\u0629 \u0644\u0644\u0648\u062C\u0647\u0629." }
    ],
    whyEnvod: [
      { en: "Ship supplier-to-customer directly \u2014 cargo never transits Saudi", ar: "\u0627\u0634\u062D\u0646 \u0645\u0646 \u0627\u0644\u0645\u0648\u0631\u062F \u0644\u0644\u0639\u0645\u064A\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u2014 \u062F\u0648\u0646 \u0639\u0628\u0648\u0631 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0644\u0644\u0633\u0639\u0648\u062F\u064A\u0629" },
      { en: "Switch B/L protects your margins and your supplier relationships", ar: "\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0628\u0648\u0644\u064A\u0635\u0629 \u064A\u062D\u0645\u064A \u0647\u0648\u0627\u0645\u0634\u0643 \u0648\u0639\u0644\u0627\u0642\u0627\u062A\u0643 \u0645\u0639 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646" },
      { en: "One Riyadh-based team controlling both origin and destination", ar: "\u0641\u0631\u064A\u0642 \u0648\u0627\u062D\u062F \u0645\u0646 \u0627\u0644\u0631\u064A\u0627\u0636 \u064A\u062F\u064A\u0631 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0645\u0639\u0627\u064B" }
    ],
    faq: [
      { q: "What is cross trade shipping?", a: "Cross trade (triangular) shipping moves cargo directly between two foreign countries without it entering your home country \u2014 for example, China to the UAE, China to the USA, or Germany to Saudi Arabia. ENVOD manages the pickup, freight, documentation, and clearance on both ends while you stay in control from Saudi Arabia.", qAr: "\u0645\u0627 \u0647\u0648 \u0634\u062D\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0628\u0631\u0629\u061F", aAr: "\u0634\u062D\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0628\u0631\u0629 (\u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0629) \u064A\u0646\u0642\u0644 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u064A\u0646 \u062F\u0648\u0644\u062A\u064A\u0646 \u0623\u062C\u0646\u0628\u064A\u062A\u064A\u0646 \u062F\u0648\u0646 \u062F\u062E\u0648\u0644\u0647\u0627 \u0628\u0644\u062F\u0643 \u2014 \u0645\u062B\u0644 \u0627\u0644\u0635\u064A\u0646 \u0625\u0644\u0649 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u060C \u0623\u0648 \u0627\u0644\u0635\u064A\u0646 \u0625\u0644\u0649 \u0623\u0645\u0631\u064A\u0643\u0627\u060C \u0623\u0648 \u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629. \u062A\u062F\u064A\u0631 \u0625\u0646\u0641\u0648\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0641\u064A \u0627\u0644\u0637\u0631\u0641\u064A\u0646 \u0628\u064A\u0646\u0645\u0627 \u062A\u0628\u0642\u0649 \u0623\u0646\u062A \u0645\u062A\u062D\u0643\u0645\u0627\u064B \u0645\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629." },
      { q: "Will my buyer see my supplier's details?", a: "No. With a switch bill of lading and third-country documentation, the original supplier's identity and pricing are kept confidential from the final buyer.", qAr: "\u0647\u0644 \u0633\u064A\u0631\u0649 \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0648\u0631\u062F \u0627\u0644\u062E\u0627\u0635 \u0628\u064A\u061F", aAr: "\u0644\u0627. \u0645\u0639 \u062A\u0628\u062F\u064A\u0644 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646 \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062F\u0648\u0644\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629\u060C \u062A\u0628\u0642\u0649 \u0647\u0648\u064A\u0629 \u0627\u0644\u0645\u0648\u0631\u062F \u0627\u0644\u0623\u0635\u0644\u064A \u0648\u0623\u0633\u0639\u0627\u0631\u0647 \u0633\u0631\u064A\u0629 \u0639\u0646 \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0627\u0644\u0646\u0647\u0627\u0626\u064A." }
    ]
  }
};
SERVICE_META[25] = DOOR_TO_DOOR_META;
for (const meta of Object.values(SERVICE_META)) {
  meta.faq = [...meta.faq, ...SERVICE_REVIEW_FAQ[meta.slug] ?? []];
}
var SLUG_TO_ID = Object.fromEntries(
  Object.values(SERVICE_META).map((m) => [m.slug, m.id])
);
var ID_TO_SLUG = Object.fromEntries(
  Object.values(SERVICE_META).map((m) => [m.id, m.slug])
);

// src/lib/industry-data.ts
var G = (a, b) => `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
var INDUSTRY_META = [
  {
    slug: "automotive-logistics",
    icon: "Car",
    accentHex: "#3B82F6",
    gradient: G("#071426", "#0A2342"),
    nameEn: "Automotive Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A",
    shortEn: "Vehicle shipping, spare parts distribution, and RoRo services for dealers, importers, and workshops across Saudi Arabia.",
    shortAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u062A\u0648\u0632\u064A\u0639 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0644\u0644\u0648\u0643\u0644\u0627\u0621 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0648\u0631\u0634 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    introEn: "From complete vehicles on RoRo vessels to time-critical spare parts for workshops, ENVOD KINGDOM supports automotive importers, dealerships, and aftermarket distributors across Saudi Arabia and the GCC.",
    introAr: "\u0645\u0646 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0639\u0644\u0649 \u0633\u0641\u0646 \u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0625\u0644\u0649 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0644\u0644\u0648\u0631\u0634\u060C \u062A\u062F\u0639\u0645 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0645\u0633\u062A\u0648\u0631\u062F\u064A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u0648\u0645\u0648\u0632\u0639\u064A \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u062E\u0644\u064A\u062C.",
    overview: [
      {
        en: "Automotive logistics covers the movement of complete vehicles, spare parts, tyres, batteries, and workshop equipment into and across Saudi Arabia. The sector depends on precise coordination: dealers need showroom stock on schedule, workshops need parts quickly, and importers need clean customs documentation for every VIN.",
        ar: "\u062A\u0634\u0645\u0644 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0646\u0642\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0648\u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0648\u0631\u0634 \u0625\u0644\u0649 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0648\u0639\u0628\u0631\u0647\u0627. \u064A\u0639\u062A\u0645\u062F \u0627\u0644\u0642\u0637\u0627\u0639 \u0639\u0644\u0649 \u062A\u0646\u0633\u064A\u0642 \u062F\u0642\u064A\u0642: \u0641\u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u064A\u062D\u062A\u0627\u062C\u0648\u0646 \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0641\u064A \u0645\u0648\u0639\u062F\u0647\u060C \u0648\u0627\u0644\u0648\u0631\u0634 \u062A\u062D\u062A\u0627\u062C \u0627\u0644\u0642\u0637\u0639 \u0628\u0633\u0631\u0639\u0629\u060C \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u0648\u0646 \u064A\u062D\u062A\u0627\u062C\u0648\u0646 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u062C\u0645\u0631\u0643\u064A\u0629 \u0633\u0644\u064A\u0645\u0629 \u0644\u0643\u0644 \u0631\u0642\u0645 \u0647\u064A\u0643\u0644."
      },
      {
        en: "We handle RoRo bookings for driveable units, containerised shipments for parts and accessories, and SABER conformity coordination for regulated automotive products. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u062A\u0648\u0644\u0649 \u062D\u062C\u0648\u0632\u0627\u062A \u0633\u0641\u0646 \u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0644\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0642\u064A\u0627\u062F\u0629\u060C \u0648\u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u062D\u0648\u0627\u0629 \u0644\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0648\u0627\u0644\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A\u060C \u0648\u062A\u0646\u0633\u064A\u0642 \u0634\u0647\u0627\u062F\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0633\u0627\u0628\u0631 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u062A\u0646\u0638\u064A\u0645. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "SABER / SASO conformity requirements for vehicles and parts", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0633\u0627\u0628\u0631 / \u0633\u0627\u0633\u0648 \u0644\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631" },
      { en: "Workshop downtime while waiting for critical spare parts", ar: "\u062A\u0648\u0642\u0641 \u0627\u0644\u0648\u0631\u0634 \u0623\u062B\u0646\u0627\u0621 \u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0627\u0644\u062D\u0631\u062C\u0629" },
      { en: "Damage risk for vehicles and fragile components in transit", ar: "\u0645\u062E\u0627\u0637\u0631 \u062A\u0636\u0631\u0631 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0646\u0642\u0644" },
      { en: "Seasonal demand swings for tyres, batteries, and accessories", ar: "\u062A\u0642\u0644\u0628\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0648\u0627\u0644\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A" }
    ],
    solutions: [
      { titleEn: "RoRo Vehicle Shipping", titleAr: "\u0634\u062D\u0646 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0628\u0627\u0644\u062F\u062D\u0631\u062C\u0629", descEn: "Roll-on/roll-off bookings for cars, trucks, buses, and driveable machinery through Saudi ports.", descAr: "\u062D\u062C\u0648\u0632\u0627\u062A \u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0644\u0644\u0633\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0634\u0627\u062D\u0646\u0627\u062A \u0648\u0627\u0644\u062D\u0627\u0641\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0642\u064A\u0627\u062F\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.", serviceSlug: "roro-shipping" },
      { titleEn: "Spare Parts Air Freight", titleAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0644\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631", descEn: "Air freight for urgent parts and workshop equipment \u2014 air freight is the fastest mode of international shipping.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0644\u0644\u0642\u0637\u0639 \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0648\u0631\u0634 \u2014 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0647\u0648 \u0623\u0633\u0631\u0639 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A.", serviceSlug: "air-freight" },
      { titleEn: "Customs & SABER Coordination", titleAr: "\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u062A\u0646\u0633\u064A\u0642 \u0633\u0627\u0628\u0631", descEn: "Import clearance, VIN documentation, and conformity certificate coordination for automotive products.", descAr: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0648\u062A\u0646\u0633\u064A\u0642 \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A.", serviceSlug: "customs-clearance" },
      { titleEn: "Parts Warehousing & Distribution", titleAr: "\u062A\u062E\u0632\u064A\u0646 \u0648\u062A\u0648\u0632\u064A\u0639 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631", descEn: "Storage, inventory management, and scheduled replenishment to dealer and workshop networks.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0648\u0625\u062F\u0627\u0631\u0629 \u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u062C\u062F\u064A\u062F \u0645\u062C\u062F\u0648\u0644 \u0644\u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0648\u0643\u0644\u0627\u0621 \u0648\u0627\u0644\u0648\u0631\u0634.", serviceSlug: "warehousing" },
      { titleEn: "Express Courier for Critical Parts", titleAr: "\u0628\u0631\u064A\u062F \u0633\u0631\u064A\u0639 \u0644\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0631\u062C\u0629", descEn: "Urgent delivery options for vehicle-off-road situations, subject to route and service availability.", descAr: "\u062E\u064A\u0627\u0631\u0627\u062A \u062A\u0648\u0635\u064A\u0644 \u0639\u0627\u062C\u0644 \u0644\u0644\u0642\u0637\u0639 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A\u060C \u0628\u062D\u0633\u0628 \u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062E\u062F\u0645\u0629.", serviceSlug: "express-courier" }
    ],
    relatedServiceSlugs: ["roro-shipping", "air-freight", "customs-clearance", "warehousing", "express-courier"],
    faq: [
      {
        q: "Can you ship complete vehicles to Saudi Arabia?",
        a: "Yes. We arrange RoRo shipping for driveable vehicles and containerised shipping for high-value or non-running units, plus import customs clearance and SABER conformity coordination.",
        qAr: "\u0647\u0644 \u062A\u0634\u062D\u0646\u0648\u0646 \u0645\u0631\u0643\u0628\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u0631\u062A\u0628 \u0627\u0644\u0634\u062D\u0646 \u0628\u0627\u0644\u062F\u062D\u0631\u062C\u0629 \u0644\u0644\u0645\u0631\u0643\u0628\u0627\u062A \u0627\u0644\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u0644\u0634\u062D\u0646 \u0628\u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0644\u0644\u0648\u062D\u062F\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0627\u0644\u0639\u0627\u0645\u0644\u0629\u060C \u0645\u0639 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u062A\u0646\u0633\u064A\u0642 \u0645\u0637\u0627\u0628\u0642\u0629 \u0633\u0627\u0628\u0631."
      },
      {
        q: "How fast can spare parts be delivered to a workshop?",
        a: "For urgent vehicle-off-road cases we offer express courier and air freight options. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.",
        qAr: "\u0645\u0627 \u0645\u062F\u0649 \u0633\u0631\u0639\u0629 \u062A\u0648\u0635\u064A\u0644 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0625\u0644\u0649 \u0627\u0644\u0648\u0631\u0634\u0629\u061F",
        aAr: "\u0644\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0646\u0648\u0641\u0631 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0633\u0631\u064A\u0639 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A. \u0648\u0642\u062F \u062A\u062E\u062A\u0644\u0641 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629."
      },
      {
        q: "Do you handle SABER certificates for automotive parts?",
        a: "We coordinate SABER shipment certificates and guide you on product certificate requirements for regulated automotive categories as part of the clearance process.",
        qAr: "\u0647\u0644 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u0634\u0647\u0627\u062F\u0627\u062A \u0633\u0627\u0628\u0631 \u0644\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A\u061F",
        aAr: "\u0646\u0646\u0633\u0642 \u0634\u0647\u0627\u062F\u0627\u062A \u0633\u0627\u0628\u0631 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0648\u0646\u0631\u0634\u062F\u0643\u0645 \u0628\u0634\u0623\u0646 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0644\u0644\u0641\u0626\u0627\u062A \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u062A\u0646\u0638\u064A\u0645 \u0643\u062C\u0632\u0621 \u0645\u0646 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635."
      }
    ],
    seoTitle: "Automotive Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Automotive logistics across Saudi Arabia & the GCC \u2014 RoRo vehicle shipping, spare parts air freight, SABER coordination, customs clearance, and parts warehousing for dealers and importers."
  },
  {
    slug: "construction-logistics",
    icon: "HardHat",
    accentHex: "#F59E0B",
    gradient: G("#1c1206", "#0A2342"),
    nameEn: "Construction Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u0621",
    shortEn: "Construction-project cargo enquiries covering materials, equipment, routes and site-delivery requirements.",
    shortAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0628\u0636\u0627\u0626\u0639 \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u062A\u0634\u0645\u0644 \u0627\u0644\u0645\u0648\u0627\u062F \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0627\u0642\u0639.",
    introEn: "Construction projects may involve building materials, machinery and oversized components moving to multiple sites. Share cargo dimensions, origin, destination, site constraints and timing so the route, permits, qualified operators and available scope can be reviewed.",
    introAr: "\u0642\u062F \u062A\u0634\u0645\u0644 \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0628\u0646\u0627\u0621 \u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621 \u0648\u0622\u0644\u0627\u062A \u0648\u0645\u0643\u0648\u0646\u0627\u062A \u0636\u062E\u0645\u0629 \u062A\u064F\u0646\u0642\u0644 \u0625\u0644\u0649 \u0645\u0648\u0627\u0642\u0639 \u0645\u062A\u0639\u062F\u062F\u0629. \u0623\u0631\u0633\u0644 \u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0642\u064A\u0648\u062F \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644\u064A\u0646 \u0627\u0644\u0645\u0624\u0647\u0644\u064A\u0646 \u0648\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u0627\u062D.",
    overview: [
      {
        en: "Construction logistics is about sequence: steel, cement, MEP equipment, and finishing materials must arrive in the right order, at the right laydown area, with the right paperwork. Delays ripple through project schedules, so reliable inland transport and clean import clearance matter as much as price.",
        ar: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0628\u0646\u0627\u0621 \u062A\u0642\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u062A\u0633\u0644\u0633\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0635\u0644 \u0627\u0644\u062D\u062F\u064A\u062F \u0648\u0627\u0644\u0623\u0633\u0645\u0646\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0648\u0645\u064A\u0643\u0627\u0646\u064A\u0643 \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u062A\u0634\u0637\u064A\u0628 \u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0635\u062D\u064A\u062D \u0625\u0644\u0649 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0648\u0628\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u062D\u0629. \u0641\u0627\u0644\u062A\u0623\u062E\u064A\u0631 \u064A\u0646\u0639\u0643\u0633 \u0639\u0644\u0649 \u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639\u060C \u0644\u0630\u0627 \u0641\u0625\u0646 \u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A \u0648\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0627 \u062A\u0642\u0644 \u0623\u0647\u0645\u064A\u0629 \u0639\u0646 \u0627\u0644\u0633\u0639\u0631."
      },
      {
        en: "Enquiries may cover project cargo, out-of-gauge transport, breakbulk, site delivery and customs-document requirements. Route surveys, permits, equipment, qualified-provider availability and customs scope must be confirmed for each shipment. Customs timing depends on documentation, procedures and any approvals.",
        ar: "\u0642\u062F \u062A\u0634\u0645\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0627\u0644\u0646\u0642\u0644 \u062E\u0627\u0631\u062C \u0627\u0644\u0642\u064A\u0627\u0633 \u0648\u0628\u0631\u064A\u0643 \u0628\u0627\u0644\u0643 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0644\u0643\u0644 \u0634\u062D\u0646\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u0629 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A."
      }
    ],
    challenges: [
      { en: "Oversized and heavy-lift machinery requiring permits and escorts", ar: "\u0645\u0639\u062F\u0627\u062A \u0636\u062E\u0645\u0629 \u0648\u062B\u0642\u064A\u0644\u0629 \u062A\u062A\u0637\u0644\u0628 \u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u0631\u0627\u0641\u0642\u0629" },
      { en: "Tight site-delivery windows tied to project milestones", ar: "\u0646\u0648\u0627\u0641\u0630 \u062A\u0633\u0644\u064A\u0645 \u0636\u064A\u0642\u0629 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0645\u0634\u0631\u0648\u0639" },
      { en: "Deliveries to remote or newly developed project locations", ar: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0625\u0644\u0649 \u0645\u0648\u0627\u0642\u0639 \u0646\u0627\u0626\u064A\u0629 \u0623\u0648 \u062D\u062F\u064A\u062B\u0629 \u0627\u0644\u062A\u0637\u0648\u064A\u0631" },
      { en: "Coordinating multiple suppliers into one site schedule", ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0648\u0631\u062F\u064A\u0646 \u0645\u062A\u0639\u062F\u062F\u064A\u0646 \u0636\u0645\u0646 \u062C\u062F\u0648\u0644 \u0645\u0648\u0642\u0639 \u0648\u0627\u062D\u062F" }
    ],
    solutions: [
      { titleEn: "Project Cargo Management", titleAr: "\u0625\u062F\u0627\u0631\u0629 \u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", descEn: "End-to-end planning for plant, machinery, and multi-shipment project moves.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0622\u0644\u0627\u062A \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0646\u0642\u0644 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0634\u062D\u0646\u0627\u062A.", serviceSlug: "project-cargo" },
      { titleEn: "Out-of-Gauge & Heavy Transport", titleAr: "\u0627\u0644\u0646\u0642\u0644 \u062E\u0627\u0631\u062C \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u062B\u0642\u064A\u0644", descEn: "Lowbed trailers, permits, and route surveys for oversized construction equipment.", descAr: "\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0645\u0646\u062E\u0641\u0636\u0629 \u0648\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u0633\u0648\u062D\u0627\u062A \u0637\u0631\u0642 \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0625\u0646\u0634\u0627\u0626\u064A\u0629 \u0627\u0644\u0636\u062E\u0645\u0629.", serviceSlug: "oog-cargo" },
      { titleEn: "Breakbulk Shipping", titleAr: "\u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0639\u0627\u0645\u0629", descEn: "Steel structures, precast elements, and non-containerised materials via Saudi ports.", descAr: "\u0627\u0644\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u062D\u062F\u064A\u062F\u064A\u0629 \u0648\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0645\u0633\u0628\u0642\u0629 \u0627\u0644\u0635\u0628 \u0648\u0627\u0644\u0645\u0648\u0627\u062F \u063A\u064A\u0631 \u0627\u0644\u0645\u062D\u0648\u0627\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.", serviceSlug: "breakbulk-shipping" },
      { titleEn: "Import Clearance for Materials", titleAr: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0648\u0627\u062F", descEn: "HS classification, SABER coordination, and duty handling for building materials.", descAr: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u062A\u0646\u0633\u064A\u0642 \u0633\u0627\u0628\u0631 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0631\u0633\u0648\u0645 \u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621.", serviceSlug: "customs-clearance" },
      { titleEn: "Site Delivery & GCC Trucking", titleAr: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u062E\u0644\u064A\u062C\u064A", descEn: "Scheduled FTL/LTL deliveries to laydown areas across Saudi Arabia and the GCC.", descAr: "\u062A\u0633\u0644\u064A\u0645 \u0645\u062C\u062F\u0648\u0644 \u0628\u062D\u0645\u0648\u0644\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0648\u062C\u0632\u0626\u064A\u0629 \u0625\u0644\u0649 \u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0648\u0627\u0644\u062E\u0644\u064A\u062C.", serviceSlug: "gcc-transportation" }
    ],
    relatedServiceSlugs: ["project-cargo", "oog-cargo", "breakbulk-shipping", "customs-clearance", "gcc-transportation"],
    faq: [
      {
        q: "Can you deliver to remote construction sites?",
        a: "Share the site address, cargo, access restrictions and requested date. Route, permits, remote-site coverage, receiving windows and qualified-provider availability must be verified before a delivery plan is agreed.",
        qAr: "\u0645\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0645\u0648\u0642\u0639 \u0625\u0646\u0634\u0627\u0621\u061F",
        aAr: "\u0623\u0631\u0633\u0644 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0648\u0642\u064A\u0648\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0646\u0627\u0626\u064A\u0629 \u0648\u0646\u0648\u0627\u0641\u0630 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0642\u0628\u0644 \u0627\u0644\u0627\u062A\u0641\u0627\u0642 \u0639\u0644\u0649 \u062E\u0637\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645."
      },
      {
        q: "Do you move heavy construction machinery?",
        a: "Oversized and heavy equipment may require route surveys, permits, escorts, lifting plans and specialized trailers. Share dimensions, weight, origin, destination and site details so availability and qualified-provider responsibilities can be checked.",
        qAr: "\u0645\u0627 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0646\u0642\u0644 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u062B\u0642\u064A\u0644\u0629\u061F",
        aAr: "\u0642\u062F \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0648\u0627\u0644\u062B\u0642\u064A\u0644\u0629 \u0645\u0633\u062D \u0627\u0644\u0645\u0633\u0627\u0631 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0627\u0644\u0645\u0631\u0627\u0641\u0642\u0629 \u0648\u062E\u0637\u0637 \u0627\u0644\u0631\u0641\u0639 \u0648\u0627\u0644\u0645\u0642\u0637\u0648\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629. \u0623\u0631\u0633\u0644 \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062A\u0648\u0641\u0631 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644."
      },
      {
        q: "Can you support giga-project suppliers?",
        a: "Suppliers should confirm tender terms, approved-vendor conditions, import responsibilities, site access and delivery scope with the contracting entity. Share the project requirements for an initial logistics-scope review; no programme appointment or past-project role is implied.",
        qAr: "\u0645\u0627 \u0627\u0644\u0630\u064A \u064A\u0646\u0628\u063A\u064A \u0639\u0644\u0649 \u0645\u0648\u0631\u062F\u064A \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0643\u0628\u0631\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u061F",
        aAr: "\u064A\u0646\u0628\u063A\u064A \u0644\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u062A\u0623\u0643\u064A\u062F \u0634\u0631\u0648\u0637 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u062A\u0639\u0627\u0642\u062F\u0629. \u0623\u0631\u0633\u0644 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0623\u0648\u0644\u064A\u0629 \u0644\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u061B \u0648\u0644\u0627 \u064A\u0639\u0646\u064A \u0630\u0644\u0643 \u062A\u0639\u064A\u064A\u0646 \u0625\u0646\u0641\u0648\u062F \u0641\u064A \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u062A\u0647\u0627 \u0627\u0644\u0633\u0627\u0628\u0642\u0629."
      }
    ],
    seoTitle: "Construction Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Construction logistics for contractors & suppliers in Saudi Arabia \u2014 project cargo, heavy equipment transport, breakbulk shipping, customs clearance, and scheduled site deliveries."
  },
  {
    slug: "retail-logistics",
    icon: "ShoppingBag",
    accentHex: "#10B981",
    gradient: G("#051a12", "#0A2342"),
    nameEn: "Retail Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062A\u062C\u0632\u0626\u0629",
    shortEn: "Store replenishment, distribution-centre operations, and omnichannel fulfilment for retailers across Saudi Arabia.",
    shortAr: "\u062A\u062C\u062F\u064A\u062F \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0639\u0645\u0644\u064A\u0627\u062A \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0648\u062A\u0644\u0628\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0642\u0646\u0648\u0627\u062A \u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    introEn: "Retail runs on availability. ENVOD KINGDOM helps brands, distributors, and store networks keep shelves stocked \u2014 combining import clearance, warehousing, and scheduled distribution across Saudi cities and malls.",
    introAr: "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u062A\u0642\u0648\u0645 \u0639\u0644\u0649 \u062A\u0648\u0641\u0631 \u0627\u0644\u0628\u0636\u0627\u0639\u0629. \u062A\u0633\u0627\u0639\u062F \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0645\u0648\u0632\u0639\u064A\u0646 \u0648\u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0639\u0644\u0649 \u0625\u0628\u0642\u0627\u0621 \u0627\u0644\u0631\u0641\u0648\u0641 \u0645\u0645\u062A\u0644\u0626\u0629 \u2014 \u0639\u0628\u0631 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0641\u064A \u0627\u0644\u0645\u062F\u0646 \u0648\u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    overview: [
      {
        en: "Retail logistics in Saudi Arabia spans imported consumer goods, mall deliveries with restricted receiving hours, seasonal peaks around Ramadan and back-to-school, and the growing overlap with e-commerce fulfilment. Success depends on stock accuracy and dependable replenishment cycles.",
        ar: "\u062A\u0645\u062A\u062F \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0645\u0646 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0644\u0627\u062A \u0630\u0627\u062A \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u062D\u062F\u062F\u0629\u060C \u0648\u0627\u0644\u0630\u0631\u0648\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629 \u0641\u064A \u0631\u0645\u0636\u0627\u0646 \u0648\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0645\u062F\u0627\u0631\u0633\u060C \u0648\u0627\u0644\u062A\u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062A\u0646\u0627\u0645\u064A \u0645\u0639 \u062A\u0644\u0628\u064A\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629. \u0648\u0627\u0644\u0646\u062C\u0627\u062D \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062F\u0642\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062F\u0648\u0631\u0627\u062A \u062A\u062C\u062F\u064A\u062F \u0645\u0648\u062B\u0648\u0642\u0629."
      },
      {
        en: "We provide import consolidation, bonded and standard warehousing, pick-and-pack, and scheduled store deliveries \u2014 plus e-commerce fulfilment when your channels converge. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u0648\u0641\u0631 \u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0639\u0627\u062F\u064A \u0648\u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u2014 \u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u062A\u0644\u0628\u064A\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0639\u0646\u062F \u062A\u0642\u0627\u0637\u0639 \u0642\u0646\u0648\u0627\u062A\u0643\u0645. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Mall receiving windows and multi-store delivery routing", ar: "\u0646\u0648\u0627\u0641\u0630 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0648\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0644\u0639\u062F\u0629 \u0645\u062A\u0627\u062C\u0631" },
      { en: "Seasonal demand peaks that strain warehouse capacity", ar: "\u0630\u0631\u0648\u0627\u062A \u0645\u0648\u0633\u0645\u064A\u0629 \u062A\u0636\u063A\u0637 \u0639\u0644\u0649 \u0633\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A" },
      { en: "SKU-level accuracy across imports and replenishment", ar: "\u062F\u0642\u0629 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0635\u0646\u0641 \u0639\u0628\u0631 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u062C\u062F\u064A\u062F" },
      { en: "Blending store replenishment with e-commerce orders", ar: "\u0627\u0644\u062F\u0645\u062C \u0628\u064A\u0646 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629" }
    ],
    solutions: [
      { titleEn: "Import Consolidation & Clearance", titleAr: "\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635", descEn: "Consolidated ocean and air imports with clean documentation and duty handling.", descAr: "\u0648\u0627\u0631\u062F\u0627\u062A \u0628\u062D\u0631\u064A\u0629 \u0648\u062C\u0648\u064A\u0629 \u0645\u062C\u0645\u0639\u0629 \u0628\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0633\u0644\u064A\u0645\u0629 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0644\u0644\u0631\u0633\u0648\u0645.", serviceSlug: "customs-clearance" },
      { titleEn: "Distribution-Centre Warehousing", titleAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0641\u064A \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639", descEn: "Racked storage, inventory control, and pick-and-pack for store replenishment.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0639\u0644\u0649 \u0623\u0631\u0641\u0641 \u0648\u0636\u0628\u0637 \u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u062C\u0647\u064A\u0632 \u0648\u062A\u063A\u0644\u064A\u0641 \u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u062C\u0631.", serviceSlug: "warehousing" },
      { titleEn: "Store & Mall Distribution", titleAr: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0645\u0648\u0644\u0627\u062A", descEn: "Scheduled multi-drop deliveries aligned with mall receiving windows across Saudi cities.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u062F\u0648\u0644 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0646\u0642\u0627\u0637 \u0648\u0641\u0642 \u0646\u0648\u0627\u0641\u0630 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.", serviceSlug: "gcc-transportation" },
      { titleEn: "E-commerce Fulfilment", titleAr: "\u062A\u0644\u0628\u064A\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", descEn: "Order fulfilment, returns handling, and last-mile coordination for online channels.", descAr: "\u062A\u0644\u0628\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0627\u062A \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629.", serviceSlug: "ecommerce-logistics" },
      { titleEn: "Supply Chain Management", titleAr: "\u0625\u062F\u0627\u0631\u0629 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0625\u0645\u062F\u0627\u062F", descEn: "Forecast-aligned inbound planning and vendor coordination for retail networks.", descAr: "\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0641\u0642 \u0627\u0644\u062A\u0648\u0642\u0639\u0627\u062A \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0644\u0634\u0628\u0643\u0627\u062A \u0627\u0644\u062A\u062C\u0632\u0626\u0629.", serviceSlug: "supply-chain" }
    ],
    relatedServiceSlugs: ["warehousing", "ecommerce-logistics", "customs-clearance", "gcc-transportation", "supply-chain"],
    faq: [
      {
        q: "Can you deliver to malls across Saudi Arabia?",
        a: "Yes. We run scheduled multi-drop distribution aligned to mall receiving windows in Riyadh, Jeddah, Dammam, and other Saudi cities, with proof-of-delivery reporting.",
        qAr: "\u0647\u0644 \u062A\u0648\u0635\u0644\u0648\u0646 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0641\u064A \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u0646\u0641\u0630 \u062A\u0648\u0632\u064A\u0639\u0627\u064B \u0645\u062C\u062F\u0648\u0644\u0627\u064B \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0646\u0642\u0627\u0637 \u0648\u0641\u0642 \u0646\u0648\u0627\u0641\u0630 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062C\u062F\u0629 \u0648\u0627\u0644\u062F\u0645\u0627\u0645 \u0648\u063A\u064A\u0631\u0647\u0627\u060C \u0645\u0639 \u062A\u0642\u0627\u0631\u064A\u0631 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645."
      },
      {
        q: "Do you handle seasonal retail peaks?",
        a: "We plan warehouse capacity and delivery schedules around Ramadan, Eid, back-to-school, and sale seasons, scaling pick-and-pack teams to match your forecast.",
        qAr: "\u0647\u0644 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u0627\u0644\u0630\u0631\u0648\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629 \u0644\u0644\u062A\u062C\u0632\u0626\u0629\u061F",
        aAr: "\u0646\u062E\u0637\u0637 \u0633\u0639\u0629 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u062D\u0648\u0644 \u0631\u0645\u0636\u0627\u0646 \u0648\u0627\u0644\u0623\u0639\u064A\u0627\u062F \u0648\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0645\u062F\u0627\u0631\u0633 \u0648\u0645\u0648\u0627\u0633\u0645 \u0627\u0644\u062A\u062E\u0641\u064A\u0636\u0627\u062A\u060C \u0645\u0639 \u062A\u0648\u0633\u064A\u0639 \u0641\u0631\u0642 \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u062D\u0633\u0628 \u062A\u0648\u0642\u0639\u0627\u062A\u0643\u0645."
      },
      {
        q: "Can one warehouse serve stores and online orders?",
        a: "Yes. We support omnichannel setups where the same inventory pool feeds store replenishment and e-commerce fulfilment, with SKU-level inventory visibility.",
        qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u0648\u0627\u062D\u062F \u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062F\u0639\u0645 \u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0642\u0646\u0648\u0627\u062A \u062D\u064A\u062B \u064A\u063A\u0630\u064A \u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u062D\u062F \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u062A\u0644\u0628\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629\u060C \u0645\u0639 \u0631\u0624\u064A\u0629 \u0644\u0644\u0645\u062E\u0632\u0648\u0646 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0635\u0646\u0641."
      }
    ],
    seoTitle: "Retail Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Retail logistics in Saudi Arabia \u2014 import consolidation, distribution-centre warehousing, mall & store deliveries, and omnichannel e-commerce fulfilment for brands and distributors."
  },
  {
    slug: "fashion-logistics",
    icon: "Shirt",
    accentHex: "#EC4899",
    gradient: G("#1c0714", "#0A2342"),
    nameEn: "Fashion Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u0632\u064A\u0627\u0621",
    shortEn: "Seasonal collections, boutique distribution, and careful garment handling for fashion brands and retailers.",
    shortAr: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629 \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0639\u0646\u0627\u064A\u0629 \u0628\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u0623\u0632\u064A\u0627\u0621 \u0648\u062A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629.",
    introEn: "Fashion moves in seasons \u2014 and missing a launch window costs sell-through. ENVOD KINGDOM moves apparel, footwear, and accessories for brands, franchises, and boutiques across Saudi Arabia with speed and careful handling.",
    introAr: "\u0627\u0644\u0623\u0632\u064A\u0627\u0621 \u062A\u062A\u062D\u0631\u0643 \u0628\u0627\u0644\u0645\u0648\u0627\u0633\u0645 \u2014 \u0648\u062A\u0641\u0648\u064A\u062A \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0625\u0637\u0644\u0627\u0642 \u064A\u0643\u0644\u0641 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A. \u062A\u0646\u0642\u0644 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0623\u062D\u0630\u064A\u0629 \u0648\u0627\u0644\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0644\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u0627\u0645\u062A\u064A\u0627\u0632\u0627\u062A \u0648\u0627\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0628\u0633\u0631\u0639\u0629 \u0648\u0639\u0646\u0627\u064A\u0629.",
    overview: [
      {
        en: "Fashion logistics is calendar-driven: spring/summer and autumn/winter drops, capsule launches, Ramadan collections, and sale-season replenishment all arrive in compressed windows. Garments need careful handling \u2014 cartons managed to preserve retail-ready presentation and packaging.",
        ar: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u0632\u064A\u0627\u0621 \u062A\u062D\u0643\u0645\u0647\u0627 \u0627\u0644\u0631\u0632\u0646\u0627\u0645\u0629: \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0631\u0628\u064A\u0639/\u0627\u0644\u0635\u064A\u0641 \u0648\u0627\u0644\u062E\u0631\u064A\u0641/\u0627\u0644\u0634\u062A\u0627\u0621 \u0648\u0627\u0644\u0625\u0635\u062F\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0648\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0631\u0645\u0636\u0627\u0646 \u0648\u062A\u062C\u062F\u064A\u062F \u0645\u0648\u0627\u0633\u0645 \u0627\u0644\u062A\u062E\u0641\u064A\u0636\u0627\u062A \u0643\u0644\u0647\u0627 \u062A\u0635\u0644 \u0641\u064A \u0646\u0648\u0627\u0641\u0630 \u0636\u064A\u0642\u0629. \u0648\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u062A\u062D\u062A\u0627\u062C \u0645\u0646\u0627\u0648\u0644\u0629 \u0628\u0639\u0646\u0627\u064A\u0629 \u2014 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0643\u0631\u0627\u062A\u064A\u0646 \u0628\u0645\u0627 \u064A\u062D\u0641\u0638 \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0639\u0631\u0636 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641."
      },
      {
        en: "We combine air freight for launch-critical stock with ocean freight for volume replenishment, plus warehousing, quality-check support, and boutique-level distribution. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u0645\u0632\u062C \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062D\u0631\u062C\u0629 \u0644\u0644\u0625\u0637\u0644\u0627\u0642 \u0645\u0639 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0643\u0645\u064A\u0627\u062A\u060C \u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u062F\u0639\u0645 \u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Compressed launch windows for seasonal collections", ar: "\u0646\u0648\u0627\u0641\u0630 \u0625\u0637\u0644\u0627\u0642 \u0636\u064A\u0642\u0629 \u0644\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629" },
      { en: "Retail-ready packaging that must arrive undamaged", ar: "\u062A\u063A\u0644\u064A\u0641 \u062C\u0627\u0647\u0632 \u0644\u0644\u0639\u0631\u0636 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0635\u0644 \u0633\u0644\u064A\u0645\u0627\u064B" },
      { en: "Split deliveries across boutiques, malls, and online", ar: "\u062A\u0648\u0632\u064A\u0639 \u0645\u062C\u0632\u0623 \u0628\u064A\u0646 \u0627\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629" },
      { en: "Returns and end-of-season stock consolidation", ar: "\u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0627\u062A \u0648\u062A\u062C\u0645\u064A\u0639 \u0645\u062E\u0632\u0648\u0646 \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u0648\u0633\u0645" }
    ],
    solutions: [
      { titleEn: "Launch-Critical Air Freight", titleAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0644\u0644\u0625\u0637\u0644\u0627\u0642\u0627\u062A", descEn: "Air freight for new-collection drops \u2014 air freight is the fastest mode of international shipping.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0644\u0625\u0635\u062F\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u2014 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0647\u0648 \u0623\u0633\u0631\u0639 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A.", serviceSlug: "air-freight" },
      { titleEn: "Volume Ocean Replenishment", titleAr: "\u0627\u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0628\u062D\u0631\u064A \u0644\u0644\u0643\u0645\u064A\u0627\u062A", descEn: "FCL/LCL ocean freight for core lines and season-volume stock.", descAr: "\u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0628\u062D\u0627\u0648\u064A\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0648\u062C\u0632\u0626\u064A\u0629 \u0644\u0644\u062E\u0637\u0648\u0637 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0643\u0645\u064A\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645.", serviceSlug: "ocean-freight" },
      { titleEn: "Apparel Warehousing", titleAr: "\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0644\u0627\u0628\u0633", descEn: "Clean, organised storage with carton-level control and retail-ready handling.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0646\u0638\u064A\u0641 \u0648\u0645\u0646\u0638\u0645 \u0628\u0636\u0628\u0637 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0643\u0631\u062A\u0648\u0646 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0639\u0631\u0636.", serviceSlug: "warehousing" },
      { titleEn: "Boutique & Mall Distribution", titleAr: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0644\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0644\u0627\u062A", descEn: "Scheduled deliveries to boutiques and mall stores across Saudi cities.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u062F\u0648\u0644 \u0644\u0644\u0628\u0648\u062A\u064A\u0643\u0627\u062A \u0648\u0645\u062A\u0627\u062C\u0631 \u0627\u0644\u0645\u0648\u0644\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.", serviceSlug: "gcc-transportation" },
      { titleEn: "E-commerce Fulfilment", titleAr: "\u062A\u0644\u0628\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", descEn: "Order fulfilment and returns processing for fashion online channels.", descAr: "\u062A\u0644\u0628\u064A\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0627\u062A \u0644\u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0623\u0632\u064A\u0627\u0621 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629.", serviceSlug: "ecommerce-logistics" }
    ],
    relatedServiceSlugs: ["air-freight", "ocean-freight", "warehousing", "ecommerce-logistics", "express-courier"],
    faq: [
      {
        q: "Can you hit a fixed collection launch date?",
        a: "We plan backwards from your launch date, combining air freight and priority clearance for critical stock. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.",
        qAr: "\u0647\u0644 \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u0627\u0631\u064A\u062E \u0625\u0637\u0644\u0627\u0642 \u0645\u062D\u062F\u062F \u0644\u0644\u0645\u062C\u0645\u0648\u0639\u0629\u061F",
        aAr: "\u0646\u062E\u0637\u0637 \u0639\u0643\u0633\u064A\u0627\u064B \u0645\u0646 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0637\u0644\u0627\u0642\u060C \u0628\u0645\u0632\u064A\u062C \u0645\u0646 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0630\u064A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 \u0644\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062D\u0631\u062C\u0629. \u0648\u0642\u062F \u062A\u062E\u062A\u0644\u0641 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644\u064A\u0646 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629."
      },
      {
        q: "How do you protect retail-ready packaging?",
        a: "We use careful carton handling, palletisation where appropriate, and clean warehousing so garments and boxed footwear arrive presentation-ready.",
        qAr: "\u0643\u064A\u0641 \u062A\u062D\u0645\u0648\u0646 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062C\u0627\u0647\u0632 \u0644\u0644\u0639\u0631\u0636\u061F",
        aAr: "\u0646\u0639\u062A\u0645\u062F \u0645\u0646\u0627\u0648\u0644\u0629 \u0643\u0631\u0627\u062A\u064A\u0646 \u0628\u0639\u0646\u0627\u064A\u0629 \u0648\u062A\u062C\u0647\u064A\u0632\u0627\u064B \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629 \u0648\u062A\u062E\u0632\u064A\u0646\u0627\u064B \u0646\u0638\u064A\u0641\u0627\u064B \u0644\u062A\u0635\u0644 \u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0623\u062D\u0630\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0628\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0639\u0631\u0636."
      },
      {
        q: "Do you handle end-of-season returns?",
        a: "Yes. We consolidate end-of-season stock from stores, process returns, and arrange storage or re-export according to your instructions.",
        qAr: "\u0647\u0644 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u0645\u0631\u062A\u062C\u0639\u0627\u062A \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u0648\u0633\u0645\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062C\u0645\u0639 \u0645\u062E\u0632\u0648\u0646 \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u0648\u0633\u0645 \u0645\u0646 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0646\u0639\u0627\u0644\u062C \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0627\u062A \u0648\u0646\u0631\u062A\u0628 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u062D\u0633\u0628 \u062A\u0639\u0644\u064A\u0645\u0627\u062A\u0643\u0645."
      }
    ],
    seoTitle: "Fashion Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Fashion & apparel logistics in Saudi Arabia \u2014 launch-critical air freight, ocean replenishment, apparel warehousing, boutique and mall distribution, and e-commerce fulfilment."
  },
  {
    slug: "electronics-logistics",
    icon: "Cpu",
    accentHex: "#6366F1",
    gradient: G("#0b0a26", "#0A2342"),
    nameEn: "Electronics Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A",
    shortEn: "High-value handling, protective packing, and secure distribution for consumer and industrial electronics.",
    shortAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0648\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0642\u064D \u0648\u062A\u0648\u0632\u064A\u0639 \u0622\u0645\u0646 \u0644\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0648\u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629.",
    introEn: "Electronics combine high value, fragility, and strict conformity requirements. ENVOD KINGDOM moves consumer devices, components, and industrial electronics into Saudi Arabia with protective handling and careful documentation.",
    introAr: "\u062A\u062C\u0645\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0628\u064A\u0646 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0635\u0627\u0631\u0645\u0629. \u062A\u0646\u0642\u0644 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0648\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0628\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u0627\u0642\u064A\u0629 \u0648\u062A\u0648\u062B\u064A\u0642 \u062F\u0642\u064A\u0642.",
    overview: [
      {
        en: "Electronics logistics calls for secure, traceable handling: lithium batteries are subject to dangerous-goods rules, and some regulated devices may require SABER or CST-related conformity documents depending on the product and intended use.",
        ar: "\u062A\u062A\u0637\u0644\u0628 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0645\u0646\u0627\u0648\u0644\u0629 \u0622\u0645\u0646\u0629 \u0648\u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u062A\u0628\u0639: \u0648\u062A\u062E\u0636\u0639 \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0644\u064A\u062B\u064A\u0648\u0645 \u0644\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629\u060C \u0648\u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0628\u0639\u0636 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u062A\u0646\u0638\u064A\u0645 \u0625\u0644\u0649 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0625\u062C\u0631\u0627\u0621\u0627\u062A SABER \u0623\u0648 \u0647\u064A\u0626\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u0641\u0636\u0627\u0621 \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629 (CST) \u0628\u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0642\u0635\u0648\u062F."
      },
      {
        en: "We provide protective packing, secure warehousing, DG-compliant battery shipping, and coordinated conformity documentation. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u0648\u0641\u0631 \u062A\u063A\u0644\u064A\u0641\u0627\u064B \u0648\u0627\u0642\u064A\u0627\u064B \u0648\u062A\u062E\u0632\u064A\u0646\u0627\u064B \u0622\u0645\u0646\u0627\u064B \u0648\u0634\u062D\u0646 \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0645\u062A\u0648\u0627\u0641\u0642\u0627\u064B \u0645\u0639 \u0627\u0634\u062A\u0631\u0627\u0637\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629 \u0648\u062A\u0646\u0633\u064A\u0642\u0627\u064B \u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Lithium battery dangerous-goods compliance (UN3480/UN3481)", ar: "\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0627\u0634\u062A\u0631\u0627\u0637\u0627\u062A \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0644\u064A\u062B\u064A\u0648\u0645 (UN3480/UN3481)" },
      { en: "High-value cargo security through the supply chain", ar: "\u0623\u0645\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0639\u0628\u0631 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0625\u0645\u062F\u0627\u062F" },
      { en: "Product-conformity documents for regulated devices, where applicable", ar: "\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u062A\u0646\u0638\u064A\u0645 \u0639\u0646\u062F \u0627\u0646\u0637\u0628\u0627\u0642\u0647\u0627" },
      { en: "Fragile products needing shock-protected packing", ar: "\u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0633\u0627\u0633\u0629 \u062A\u062A\u0637\u0644\u0628 \u062A\u063A\u0644\u064A\u0641\u0627\u064B \u0645\u0642\u0627\u0648\u0645\u0627\u064B \u0644\u0644\u0635\u062F\u0645\u0627\u062A" }
    ],
    solutions: [
      { titleEn: "High-Value Air Freight", titleAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0639\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0645\u0629", descEn: "Secure air freight for devices and components with chain-of-custody focus.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0622\u0645\u0646 \u0644\u0644\u0623\u062C\u0647\u0632\u0629 \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0645\u0639 \u062A\u0631\u0643\u064A\u0632 \u0639\u0644\u0649 \u062A\u0633\u0644\u0633\u0644 \u0627\u0644\u0639\u0647\u062F\u0629.", serviceSlug: "air-freight" },
      { titleEn: "DG Battery Shipping", titleAr: "\u0634\u062D\u0646 \u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0643\u0628\u0636\u0627\u0626\u0639 \u062E\u0637\u0631\u0629", descEn: "Compliant handling and documentation for lithium-battery shipments.", descAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0648\u062A\u0648\u062B\u064A\u0642 \u0645\u062A\u0648\u0627\u0641\u0642\u0627\u0646 \u0644\u0634\u062D\u0646\u0627\u062A \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0644\u064A\u062B\u064A\u0648\u0645.", serviceSlug: "dangerous-goods" },
      { titleEn: "Protective Packing & Crating", titleAr: "\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0648\u0627\u0642\u064A \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u062F", descEn: "Shock-protected export packing for sensitive equipment and displays.", descAr: "\u062A\u063A\u0644\u064A\u0641 \u062A\u0635\u062F\u064A\u0631\u064A \u0645\u0642\u0627\u0648\u0645 \u0644\u0644\u0635\u062F\u0645\u0627\u062A \u0644\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0634\u0627\u0634\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629.", serviceSlug: "packaging-crating" },
      { titleEn: "Secure Warehousing", titleAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0622\u0645\u0646", descEn: "Controlled-access storage with serial-level inventory for high-value stock.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0628\u0648\u0635\u0648\u0644 \u0645\u0636\u0628\u0648\u0637 \u0648\u062C\u0631\u062F \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A \u0644\u0644\u0645\u062E\u0632\u0648\u0646 \u0639\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0645\u0629.", serviceSlug: "warehousing" },
      { titleEn: "Conformity & Customs Coordination", titleAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635", descEn: "SABER shipment certificates and clearance paperwork for regulated electronics.", descAr: "\u0634\u0647\u0627\u062F\u0627\u062A \u0633\u0627\u0628\u0631 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0638\u0645\u0629.", serviceSlug: "customs-clearance" }
    ],
    relatedServiceSlugs: ["air-freight", "dangerous-goods", "packaging-crating", "warehousing", "customs-clearance"],
    faq: [
      {
        q: "Can you ship products containing lithium batteries?",
        a: "Yes. We handle lithium-battery shipments under the applicable dangerous-goods provisions, including correct packing, marking, labelling, and declarations for air and sea transport.",
        qAr: "\u0647\u0644 \u062A\u0634\u062D\u0646\u0648\u0646 \u0645\u0646\u062A\u062C\u0627\u062A \u062A\u062D\u062A\u0648\u064A \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0644\u064A\u062B\u064A\u0648\u0645\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0634\u062D\u0646\u0627\u062A \u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0644\u064A\u062B\u064A\u0648\u0645 \u0648\u0641\u0642 \u0623\u062D\u0643\u0627\u0645 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629 \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u0628\u0647\u0627\u060C \u0628\u0645\u0627 \u064A\u0634\u0645\u0644 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u0644\u0635\u0642\u0627\u062A \u0648\u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0644\u0644\u0646\u0642\u0644 \u0627\u0644\u062C\u0648\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A."
      },
      {
        q: "How do you secure high-value electronics shipments?",
        a: "We use trusted carriers, controlled-access warehousing, serial-level inventory checks, and continuous shipment visibility to reduce pilferage and handling risk.",
        qAr: "\u0643\u064A\u0641 \u062A\u0624\u0645\u0646\u0648\u0646 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629\u061F",
        aAr: "\u0646\u0639\u062A\u0645\u062F \u0646\u0627\u0642\u0644\u064A\u0646 \u0645\u0648\u062B\u0648\u0642\u064A\u0646 \u0648\u062A\u062E\u0632\u064A\u0646\u0627\u064B \u0628\u0648\u0635\u0648\u0644 \u0645\u0636\u0628\u0648\u0637 \u0648\u0641\u062D\u0648\u0635\u0627\u062A \u062C\u0631\u062F \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A \u0648\u0631\u0624\u064A\u0629 \u0645\u0633\u062A\u0645\u0631\u0629 \u0644\u0644\u0634\u062D\u0646\u0629 \u0644\u062A\u0642\u0644\u064A\u0644 \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0633\u0631\u0642\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629."
      },
      {
        q: "Do you manage conformity paperwork for devices?",
        a: "We coordinate SABER shipment certificates and advise on conformity documentation requirements for regulated device categories as part of import clearance.",
        qAr: "\u0647\u0644 \u062A\u062F\u064A\u0631\u0648\u0646 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0623\u062C\u0647\u0632\u0629\u061F",
        aAr: "\u0646\u0646\u0633\u0642 \u0634\u0647\u0627\u062F\u0627\u062A \u0633\u0627\u0628\u0631 \u0644\u0644\u0634\u062D\u0646\u0627\u062A \u0648\u0646\u0642\u062F\u0645 \u0627\u0644\u0625\u0631\u0634\u0627\u062F \u062D\u0648\u0644 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0641\u0626\u0627\u062A \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0636\u0645\u0646 \u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F."
      }
    ],
    seoTitle: "Electronics Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Electronics logistics in Saudi Arabia \u2014 secure high-value air freight, lithium battery DG compliance, protective packing, secure warehousing, and conformity coordination."
  },
  {
    slug: "aerospace-logistics",
    icon: "Rocket",
    accentHex: "#0EA5E9",
    gradient: G("#03151f", "#0A2342"),
    nameEn: "Aerospace Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0627\u0644\u0641\u0636\u0627\u0621",
    shortEn: "AOG spares, aircraft components, and airshow logistics for aviation operators, MROs, and suppliers.",
    shortAr: "\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0641\u0629 \u0648\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0644\u0644\u0645\u0634\u063A\u0644\u064A\u0646 \u0648\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646.",
    introEn: "When an aircraft is on ground, every hour counts. ENVOD KINGDOM supports aviation operators, MRO providers, and aerospace suppliers in Saudi Arabia with time-critical spares movement, oversized component transport, and event logistics for airshows.",
    introAr: "\u0639\u0646\u062F\u0645\u0627 \u062A\u062A\u0648\u0642\u0641 \u0637\u0627\u0626\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0631\u0636\u060C \u0643\u0644 \u0633\u0627\u0639\u0629 \u0644\u0647\u0627 \u062B\u0645\u0646. \u062A\u062F\u0639\u0645 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0645\u0634\u063A\u0644\u064A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0645\u0632\u0648\u062F\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0645\u0648\u0631\u062F\u064A \u0642\u0637\u0627\u0639 \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0628\u0646\u0642\u0644 \u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0627\u0644\u062D\u0631\u062C\u0629 \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0648\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0637\u064A\u0631\u0627\u0646.",
    overview: [
      {
        en: "Aerospace logistics splits into two very different jobs: urgent AOG (aircraft-on-ground) spares that need door-to-door speed with full traceability, and planned moves of engines, landing gear, and ground-support equipment that need specialised crating, tilt-monitoring, and careful lifting.",
        ar: "\u062A\u0646\u0642\u0633\u0645 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0625\u0644\u0649 \u0645\u0647\u0645\u062A\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u062A\u064A\u0646: \u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0639\u0627\u062C\u0644\u0629 \u0644\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0641\u0629 \u062A\u062A\u0637\u0644\u0628 \u0633\u0631\u0639\u0629 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0645\u0639 \u062A\u062A\u0628\u0639 \u0643\u0627\u0645\u0644\u060C \u0648\u0646\u0642\u0644 \u0645\u062E\u0637\u0637 \u0644\u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0647\u0628\u0648\u0637 \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0623\u0631\u0636\u064A \u064A\u062A\u0637\u0644\u0628 \u062A\u0635\u0646\u064A\u062F\u0627\u064B \u0645\u062A\u062E\u0635\u0635\u0627\u064B \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0644\u0644\u0645\u064A\u0644 \u0648\u0631\u0641\u0639\u0627\u064B \u0628\u0639\u0646\u0627\u064A\u0629."
      },
      {
        en: "Saudi Arabia's aviation ambitions \u2014 new carriers, expanding airports, and events like the World Defense Show \u2014 are growing demand for both. We support suppliers with express spares handling, project moves, and ATA Carnet processing for demo equipment. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0637\u0645\u0648\u062D\u0627\u062A \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0641\u064A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u2014 \u0646\u0627\u0642\u0644\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0648\u0645\u0637\u0627\u0631\u0627\u062A \u0645\u062A\u0648\u0633\u0639\u0629 \u0648\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0645\u062B\u0644 \u0645\u0639\u0631\u0636 \u0627\u0644\u062F\u0641\u0627\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u2014 \u062A\u0632\u064A\u062F \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0627\u0644\u0646\u0648\u0639\u064A\u0646. \u0646\u062F\u0639\u0645 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0628\u0645\u0646\u0627\u0648\u0644\u0629 \u0633\u0631\u064A\u0639\u0629 \u0644\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0648\u0646\u0642\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "AOG situations demanding round-the-clock coordination", ar: "\u062D\u0627\u0644\u0627\u062A \u062A\u0648\u0642\u0641 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u062A\u062A\u0637\u0644\u0628 \u062A\u0646\u0633\u064A\u0642\u0627\u064B \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629" },
      { en: "Oversized engines and components needing special handling", ar: "\u0645\u062D\u0631\u0643\u0627\u062A \u0648\u0645\u0643\u0648\u0646\u0627\u062A \u0636\u062E\u0645\u0629 \u062A\u062D\u062A\u0627\u062C \u0645\u0646\u0627\u0648\u0644\u0629 \u062E\u0627\u0635\u0629" },
      { en: "Temporary imports for airshows and demo equipment", ar: "\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636" },
      { en: "Full traceability and documentation for certified parts", ar: "\u062A\u062A\u0628\u0639 \u0648\u062A\u0648\u062B\u064A\u0642 \u0643\u0627\u0645\u0644\u0627\u0646 \u0644\u0644\u0642\u0637\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629" }
    ],
    solutions: [
      { titleEn: "AOG Express Spares", titleAr: "\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631 \u0627\u0644\u0639\u0627\u062C\u0644\u0629 \u0644\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0641\u0629", descEn: "Time-critical door-to-door movement of aircraft spares with priority handling.", descAr: "\u0646\u0642\u0644 \u0639\u0627\u062C\u0644 \u0645\u0646 \u0627\u0644\u0628\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0628\u0627\u0628 \u0644\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0628\u0645\u0646\u0627\u0648\u0644\u0629 \u0630\u0627\u062A \u0623\u0648\u0644\u0648\u064A\u0629.", serviceSlug: "express-courier" },
      { titleEn: "Component Air Freight", titleAr: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062C\u0648\u064A \u0644\u0644\u0645\u0643\u0648\u0646\u0627\u062A", descEn: "Chartered and scheduled air freight for engines, APUs, and rotables.", descAr: "\u0634\u062D\u0646 \u062C\u0648\u064A \u0645\u0633\u062A\u0623\u062C\u0631 \u0648\u0645\u062C\u062F\u0648\u0644 \u0644\u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0648\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062F\u0648\u0627\u0631\u0629.", serviceSlug: "air-freight" },
      { titleEn: "Specialised Crating", titleAr: "\u0627\u0644\u062A\u0635\u0646\u064A\u062F \u0627\u0644\u0645\u062A\u062E\u0635\u0635", descEn: "Engineered crates and shock-protected packing for sensitive aerospace hardware.", descAr: "\u0635\u0646\u0627\u062F\u064A\u0642 \u0645\u0635\u0645\u0645\u0629 \u0647\u0646\u062F\u0633\u064A\u0627\u064B \u0648\u062A\u063A\u0644\u064A\u0641 \u0645\u0642\u0627\u0648\u0645 \u0644\u0644\u0635\u062F\u0645\u0627\u062A \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0627\u0644\u062D\u0633\u0627\u0633\u0629.", serviceSlug: "packaging-crating" },
      { titleEn: "ATA Carnet for Airshows", titleAr: "\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0637\u064A\u0631\u0627\u0646", descEn: "Temporary import processing for demo aircraft equipment and exhibition stands.", descAr: "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636 \u0648\u0623\u062C\u0646\u062D\u0629 \u0627\u0644\u0645\u0639\u0627\u0631\u0636.", serviceSlug: "ata-carnet" },
      { titleEn: "Project & Oversized Moves", titleAr: "\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0636\u062E\u0645 \u0648\u0646\u0642\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", descEn: "Ground-support equipment and oversized component transport with route planning.", descAr: "\u0646\u0642\u0644 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0623\u0631\u0636\u064A \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629 \u0645\u0639 \u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A.", serviceSlug: "oog-cargo" }
    ],
    relatedServiceSlugs: ["express-courier", "air-freight", "packaging-crating", "ata-carnet", "oog-cargo"],
    faq: [
      {
        q: "Can you handle AOG shipments outside working hours?",
        a: "AOG cases are treated as priority movements. Contact us via WhatsApp for urgent coordination \u2014 we align pickup, uplift, and clearance to get parts moving as quickly as the situation allows.",
        qAr: "\u0647\u0644 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0641\u0629 \u062E\u0627\u0631\u062C \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645\u061F",
        aAr: "\u062A\u064F\u0639\u0627\u0645\u0644 \u062D\u0627\u0644\u0627\u062A \u062A\u0648\u0642\u0641 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0643\u062A\u062D\u0631\u0643\u0627\u062A \u0630\u0627\u062A \u0623\u0648\u0644\u0648\u064A\u0629. \u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0645\u0639\u0646\u0627 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0639\u0627\u062C\u0644 \u2014 \u0646\u0646\u0633\u0642 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u062A\u062D\u0631\u064A\u0643 \u0627\u0644\u0642\u0637\u0639 \u0628\u0623\u0633\u0631\u0639 \u0645\u0627 \u062A\u0633\u0645\u062D \u0628\u0647 \u0627\u0644\u062D\u0627\u0644\u0629."
      },
      {
        q: "Do you support airshow and defence exhibition logistics?",
        a: "Yes. We handle exhibition logistics and ATA Carnet temporary imports for aviation and defence events in Saudi Arabia, including stand materials and demo equipment.",
        qAr: "\u0647\u0644 \u062A\u062F\u0639\u0645\u0648\u0646 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0627\u0644\u062F\u0641\u0627\u0639\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062A\u0648\u0644\u0649 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0628\u0643\u0627\u0631\u0646\u064A\u0647 ATA \u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0648\u0627\u0644\u062F\u0641\u0627\u0639 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u060C \u0628\u0645\u0627 \u064A\u0634\u0645\u0644 \u0645\u0648\u0627\u062F \u0627\u0644\u0623\u062C\u0646\u062D\u0629 \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0639\u0631\u0636."
      },
      {
        q: "Can you move aircraft engines and large components?",
        a: "We arrange specialised crating, tilt- and shock-monitored transport, and careful lifting for engines, landing gear, and other oversized aerospace hardware.",
        qAr: "\u0647\u0644 \u062A\u0646\u0642\u0644\u0648\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0643\u0628\u064A\u0631\u0629\u061F",
        aAr: "\u0646\u0631\u062A\u0628 \u0627\u0644\u062A\u0635\u0646\u064A\u062F \u0627\u0644\u0645\u062A\u062E\u0635\u0635 \u0648\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0631\u0627\u0642\u0628 \u0644\u0644\u0645\u064A\u0644 \u0648\u0627\u0644\u0635\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0631\u0641\u0639 \u0628\u0639\u0646\u0627\u064A\u0629 \u0644\u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0647\u0628\u0648\u0637 \u0648\u063A\u064A\u0631\u0647\u0627 \u0645\u0646 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0636\u062E\u0645\u0629."
      }
    ],
    seoTitle: "Aerospace Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Aerospace logistics in Saudi Arabia \u2014 AOG express spares, aircraft component air freight, specialised crating, ATA Carnet for airshows, and oversized aviation moves."
  },
  {
    slug: "hospitality-logistics",
    icon: "Hotel",
    accentHex: "#EAB308",
    gradient: G("#1c1503", "#0A2342"),
    nameEn: "Hospitality Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0636\u064A\u0627\u0641\u0629",
    shortEn: "Hotel FF&E, pre-opening programmes, and white glove installation for hotels, resorts, and restaurants.",
    shortAr: "\u0623\u062B\u0627\u062B \u0648\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0627\u0644\u0641\u0646\u0627\u062F\u0642 \u0648\u0628\u0631\u0627\u0645\u062C \u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0641\u0627\u062E\u0631 \u0644\u0644\u0641\u0646\u0627\u062F\u0642 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0637\u0627\u0639\u0645.",
    introEn: "Saudi Arabia is opening hotels at record pace. ENVOD KINGDOM supports hotel operators, FF&E procurement teams, and fit-out contractors with consolidated imports, staged warehousing, and floor-by-floor white glove delivery.",
    introAr: "\u062A\u0641\u062A\u062A\u062D \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0627\u0644\u0641\u0646\u0627\u062F\u0642 \u0628\u0648\u062A\u064A\u0631\u0629 \u0642\u064A\u0627\u0633\u064A\u0629. \u062A\u062F\u0639\u0645 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0645\u0634\u063A\u0644\u064A \u0627\u0644\u0641\u0646\u0627\u062F\u0642 \u0648\u0641\u0631\u0642 \u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0648\u0645\u0642\u0627\u0648\u0644\u064A \u0627\u0644\u062A\u0634\u0637\u064A\u0628 \u0628\u0648\u0627\u0631\u062F\u0627\u062A \u0645\u062C\u0645\u0639\u0629 \u0648\u062A\u062E\u0632\u064A\u0646 \u0645\u0631\u062D\u0644\u064A \u0648\u062A\u0633\u0644\u064A\u0645 \u0641\u0627\u062E\u0631 \u0637\u0627\u0628\u0642\u0627\u064B \u0628\u0637\u0627\u0628\u0642.",
    overview: [
      {
        en: "Hospitality logistics peaks at pre-opening: hundreds of containers of furniture, fixtures, and equipment (FF&E) and operating supplies (OS&E) arriving from dozens of vendors, all needing consolidation, staging, and sequenced delivery to site as floors complete.",
        ar: "\u062A\u0628\u0644\u063A \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0630\u0631\u0648\u062A\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D: \u0645\u0626\u0627\u062A \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0645\u0646 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u062A\u0635\u0644 \u0645\u0646 \u0639\u0634\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646\u060C \u0648\u0643\u0644\u0647\u0627 \u062A\u062D\u062A\u0627\u062C \u062A\u062C\u0645\u064A\u0639\u0627\u064B \u0648\u062A\u062E\u0632\u064A\u0646\u0627\u064B \u0645\u0631\u062D\u0644\u064A\u0627\u064B \u0648\u062A\u0633\u0644\u064A\u0645\u0627\u064B \u0645\u062A\u0633\u0644\u0633\u0644\u0627\u064B \u0644\u0644\u0645\u0648\u0642\u0639 \u0645\u0639 \u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0637\u0648\u0627\u0628\u0642."
      },
      {
        en: "We consolidate vendor shipments, manage staged warehousing, and deliver room-by-room with unpacking, placement, and debris removal \u2014 the white glove standard hotel openings demand. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u062C\u0645\u0639 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0646\u062F\u064A\u0631 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0631\u062D\u0644\u064A \u0648\u0646\u0633\u0644\u0645 \u063A\u0631\u0641\u0629 \u0628\u063A\u0631\u0641\u0629 \u0645\u0639 \u0627\u0644\u0641\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0648\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u062E\u0644\u0641\u0627\u062A \u2014 \u0648\u0647\u0648 \u0645\u0639\u064A\u0627\u0631 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0627\u0644\u0630\u064A \u062A\u062A\u0637\u0644\u0628\u0647 \u0627\u0641\u062A\u062A\u0627\u062D\u0627\u062A \u0627\u0644\u0641\u0646\u0627\u062F\u0642. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Multi-vendor FF&E consolidation from many origins", ar: "\u062A\u062C\u0645\u064A\u0639 \u0623\u062B\u0627\u062B \u0648\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0645\u0646 \u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0645\u0646\u0627\u0634\u0626 \u0645\u062A\u0639\u062F\u062F\u064A\u0646" },
      { en: "Sequenced deliveries matched to fit-out progress", ar: "\u062A\u0633\u0644\u064A\u0645 \u0645\u062A\u0633\u0644\u0633\u0644 \u064A\u0648\u0627\u0643\u0628 \u062A\u0642\u062F\u0645 \u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u062A\u0634\u0637\u064A\u0628" },
      { en: "High-value furniture needing careful inside delivery", ar: "\u0623\u062B\u0627\u062B \u0639\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0645\u0629 \u064A\u062A\u0637\u0644\u0628 \u062A\u0648\u0635\u064A\u0644\u0627\u064B \u062F\u0627\u062E\u0644\u064A\u0627\u064B \u0628\u0639\u0646\u0627\u064A\u0629" },
      { en: "Fixed opening dates with no room for slippage", ar: "\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0641\u062A\u062A\u0627\u062D \u062B\u0627\u0628\u062A\u0629 \u0644\u0627 \u062A\u062D\u062A\u0645\u0644 \u0627\u0644\u062A\u0623\u062C\u064A\u0644" }
    ],
    solutions: [
      { titleEn: "FF&E Consolidation", titleAr: "\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632\u0627\u062A", descEn: "Multi-origin vendor consolidation into managed shipments for hotel projects.", descAr: "\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0645\u062A\u0639\u062F\u062F\u064A \u0627\u0644\u0645\u0646\u0627\u0634\u0626 \u0641\u064A \u0634\u062D\u0646\u0627\u062A \u0645\u064F\u062F\u0627\u0631\u0629 \u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0641\u0646\u0627\u062F\u0642.", serviceSlug: "freight-forwarding" },
      { titleEn: "Pre-Opening Warehousing", titleAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0644\u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D", descEn: "Staged storage with room-level tagging ready for sequenced site delivery.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0645\u0631\u062D\u0644\u064A \u0628\u062A\u0631\u0645\u064A\u0632 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u063A\u0631\u0641 \u062C\u0627\u0647\u0632 \u0644\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062A\u0633\u0644\u0633\u0644 \u0644\u0644\u0645\u0648\u0642\u0639.", serviceSlug: "warehousing" },
      { titleEn: "White Glove Installation", titleAr: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u0641\u0627\u062E\u0631", descEn: "Inside delivery, unpacking, placement, and setup floor by floor.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u062F\u0627\u062E\u0644\u064A \u0648\u0641\u0643 \u0648\u062A\u0645\u0648\u0636\u0639 \u0648\u062A\u0631\u0643\u064A\u0628 \u0637\u0627\u0628\u0642\u0627\u064B \u0628\u0637\u0627\u0628\u0642.", serviceSlug: "white-glove-logistics" },
      { titleEn: "Hotel Project Cargo", titleAr: "\u0628\u0636\u0627\u0626\u0639 \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0641\u0646\u0627\u062F\u0642", descEn: "Kitchens, laundry plant, and back-of-house equipment moves with lifting plans.", descAr: "\u0646\u0642\u0644 \u0627\u0644\u0645\u0637\u0627\u0628\u062E \u0648\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u063A\u0627\u0633\u0644 \u0648\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0645\u0639 \u062E\u0637\u0637 \u0627\u0644\u0631\u0641\u0639.", serviceSlug: "project-cargo" },
      { titleEn: "F&B Supply Logistics", titleAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0625\u0645\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629", descEn: "Temperature-controlled supply chains for restaurant and banqueting operations.", descAr: "\u0633\u0644\u0627\u0633\u0644 \u0625\u0645\u062F\u0627\u062F \u0645\u0628\u0631\u062F\u0629 \u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0648\u0644\u0627\u0626\u0645.", serviceSlug: "temperature-controlled-logistics" }
    ],
    relatedServiceSlugs: ["white-glove-logistics", "warehousing", "project-cargo", "freight-forwarding", "temperature-controlled-logistics"],
    faq: [
      {
        q: "Can you manage a full hotel pre-opening programme?",
        a: "Yes. We consolidate vendor shipments, clear imports, stage FF&E and OS&E in our warehousing, and deliver in sequence as floors are handed over \u2014 coordinated with your project team.",
        qAr: "\u0647\u0644 \u062A\u062F\u064A\u0631\u0648\u0646 \u0628\u0631\u0646\u0627\u0645\u062C \u0645\u0627 \u0642\u0628\u0644 \u0627\u0641\u062A\u062A\u0627\u062D \u0641\u0646\u062F\u0642 \u0643\u0627\u0645\u0644\u0627\u064B\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062C\u0645\u0639 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0646\u062E\u0644\u0635 \u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0646\u062E\u0632\u0646 \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632\u0627\u062A \u0645\u0631\u062D\u0644\u064A\u0627\u064B \u0648\u0646\u0633\u0644\u0645 \u0628\u0627\u0644\u062A\u0633\u0644\u0633\u0644 \u0645\u0639 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0648\u0627\u0628\u0642 \u2014 \u0628\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0645\u0634\u0631\u0648\u0639\u0643\u0645."
      },
      {
        q: "Do you deliver inside the property?",
        a: "Our white glove service covers inside delivery, unpacking, placement in the designated room or area, light assembly, and packaging removal.",
        qAr: "\u0647\u0644 \u062A\u0648\u0635\u0644\u0648\u0646 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0646\u0634\u0623\u0629\u061F",
        aAr: "\u062A\u0634\u0645\u0644 \u062E\u062F\u0645\u062A\u0646\u0627 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u062F\u0627\u062E\u0644\u064A \u0648\u0627\u0644\u0641\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u0623\u0648 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0639 \u0627\u0644\u062E\u0641\u064A\u0641 \u0648\u0625\u0632\u0627\u0644\u0629 \u0645\u0648\u0627\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641."
      },
      {
        q: "Can you support resorts in remote destinations?",
        a: "We plan multi-leg deliveries to coastal and remote resort destinations, aligning transport modes and site access requirements with your construction schedule.",
        qAr: "\u0647\u0644 \u062A\u062F\u0639\u0645\u0648\u0646 \u0645\u0646\u062A\u062C\u0639\u0627\u062A \u0641\u064A \u0648\u062C\u0647\u0627\u062A \u0646\u0627\u0626\u064A\u0629\u061F",
        aAr: "\u0646\u062E\u0637\u0637 \u0639\u0645\u0644\u064A\u0627\u062A \u062A\u0633\u0644\u064A\u0645 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0644\u0644\u0648\u062C\u0647\u0627\u062A \u0627\u0644\u0633\u0627\u062D\u0644\u064A\u0629 \u0648\u0627\u0644\u0646\u0627\u0626\u064A\u0629\u060C \u0628\u0645\u0648\u0627\u0621\u0645\u0629 \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0642\u0644 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u0648\u0642\u0639 \u0645\u0639 \u062C\u062F\u0648\u0644 \u0627\u0644\u0625\u0646\u0634\u0627\u0621."
      }
    ],
    seoTitle: "Hospitality Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Hospitality & hotel logistics in Saudi Arabia \u2014 FF&E consolidation, pre-opening warehousing, white glove installation, and project cargo for hotels, resorts, and restaurants."
  },
  {
    slug: "furniture-logistics",
    icon: "Armchair",
    accentHex: "#8B5CF6",
    gradient: G("#120826", "#0A2342"),
    nameEn: "Furniture Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u062B\u0627\u062B",
    shortEn: "Furniture imports, showroom distribution, and white glove home delivery for retailers and designers.",
    shortAr: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0623\u062B\u0627\u062B \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u0632\u0644\u064A \u0627\u0644\u0641\u0627\u062E\u0631 \u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0648\u0627\u0644\u0645\u0635\u0645\u0645\u064A\u0646.",
    introEn: "Furniture is bulky, fragile, and unforgiving of poor handling. ENVOD KINGDOM moves furniture for retailers, interior designers, and project fit-outs \u2014 from container imports to assembled placement in the customer's room.",
    introAr: "\u0627\u0644\u0623\u062B\u0627\u062B \u0636\u062E\u0645 \u0648\u062D\u0633\u0627\u0633 \u0648\u0644\u0627 \u064A\u063A\u0641\u0631 \u0633\u0648\u0621 \u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629. \u062A\u0646\u0642\u0644 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0627\u0644\u0623\u062B\u0627\u062B \u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0648\u0627\u0644\u0645\u0635\u0645\u0645\u064A\u0646 \u0648\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062A\u0634\u0637\u064A\u0628 \u2014 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0628\u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0625\u0644\u0649 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0641\u064A \u063A\u0631\u0641\u0629 \u0627\u0644\u0639\u0645\u064A\u0644.",
    overview: [
      {
        en: "Furniture logistics combines volume shipping economics with delicate last-mile execution. Flat-packed lines move efficiently in containers, while assembled and designer pieces need blanket wrapping, crating, and two-person inside delivery to arrive unmarked.",
        ar: "\u062A\u062C\u0645\u0639 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u062B\u0627\u062B \u0628\u064A\u0646 \u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0627\u062A \u0627\u0644\u0634\u062D\u0646 \u0628\u0627\u0644\u062D\u062C\u0645 \u0648\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062F\u0642\u064A\u0642 \u0644\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u062E\u064A\u0631\u0629. \u0641\u0627\u0644\u062E\u0637\u0648\u0637 \u0627\u0644\u0645\u0641\u0643\u0643\u0629 \u062A\u064F\u0646\u0642\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 \u0641\u064A \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A\u060C \u0628\u064A\u0646\u0645\u0627 \u062A\u062D\u062A\u0627\u062C \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u0645\u062C\u0645\u0639\u0629 \u0648\u0627\u0644\u062A\u0635\u0645\u064A\u0645\u064A\u0629 \u0644\u0641\u0627\u064B \u0628\u0627\u0644\u0628\u0637\u0627\u0646\u064A\u0627\u062A \u0648\u062A\u0635\u0646\u064A\u062F\u0627\u064B \u0648\u062A\u0648\u0635\u064A\u0644\u0627\u064B \u062F\u0627\u062E\u0644\u064A\u0627\u064B \u0628\u0641\u0631\u064A\u0642 \u0645\u0632\u062F\u0648\u062C \u0644\u062A\u0635\u0644 \u062F\u0648\u0646 \u062E\u062F\u0634."
      },
      {
        en: "We handle container imports, showroom and DC warehousing, scheduled store distribution, and white glove home delivery with assembly. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u062A\u0648\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0628\u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0648\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0648\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u0632\u0644\u064A \u0627\u0644\u0641\u0627\u062E\u0631 \u0645\u0639 \u0627\u0644\u062A\u062C\u0645\u064A\u0639. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Bulky items with high per-unit damage cost", ar: "\u0642\u0637\u0639 \u0636\u062E\u0645\u0629 \u0628\u062A\u0643\u0644\u0641\u0629 \u062A\u0644\u0641 \u0645\u0631\u062A\u0641\u0639\u0629 \u0644\u0643\u0644 \u0648\u062D\u062F\u0629" },
      { en: "Home deliveries requiring assembly and placement", ar: "\u062A\u0648\u0635\u064A\u0644 \u0645\u0646\u0632\u0644\u064A \u064A\u062A\u0637\u0644\u0628 \u062A\u062C\u0645\u064A\u0639\u0627\u064B \u0648\u062A\u0645\u0648\u0636\u0639\u0627\u064B" },
      { en: "Mixed flat-pack and assembled inventory profiles", ar: "\u0645\u062E\u0632\u0648\u0646 \u0645\u062E\u062A\u0644\u0637 \u0628\u064A\u0646 \u0627\u0644\u0645\u0641\u0643\u0643 \u0648\u0627\u0644\u0645\u062C\u0645\u0639" },
      { en: "Showroom launches tied to collection arrivals", ar: "\u0625\u0637\u0644\u0627\u0642\u0627\u062A \u0645\u0639\u0627\u0631\u0636 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A" }
    ],
    solutions: [
      { titleEn: "Container Imports", titleAr: "\u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0628\u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A", descEn: "FCL/LCL ocean freight for furniture lines from global manufacturing origins.", descAr: "\u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0628\u062D\u0627\u0648\u064A\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0648\u062C\u0632\u0626\u064A\u0629 \u0644\u062E\u0637\u0648\u0637 \u0627\u0644\u0623\u062B\u0627\u062B \u0645\u0646 \u0645\u0646\u0627\u0634\u0626 \u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629.", serviceSlug: "ocean-freight" },
      { titleEn: "Furniture Warehousing", titleAr: "\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0623\u062B\u0627\u062B", descEn: "Clean, racked storage with piece-level tracking for showroom and DC stock.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0646\u0638\u064A\u0641 \u0639\u0644\u0649 \u0623\u0631\u0641\u0641 \u0628\u062A\u062A\u0628\u0639 \u0644\u0643\u0644 \u0642\u0637\u0639\u0629 \u0644\u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639.", serviceSlug: "warehousing" },
      { titleEn: "White Glove Home Delivery", titleAr: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u0632\u0644\u064A \u0627\u0644\u0641\u0627\u062E\u0631", descEn: "Two-person inside delivery, unpacking, assembly, placement, and debris removal.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u062F\u0627\u062E\u0644\u064A \u0628\u0641\u0631\u064A\u0642 \u0645\u0632\u062F\u0648\u062C \u0648\u0641\u0643 \u0648\u062A\u062C\u0645\u064A\u0639 \u0648\u062A\u0645\u0648\u0636\u0639 \u0648\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u062E\u0644\u0641\u0627\u062A.", serviceSlug: "white-glove-logistics" },
      { titleEn: "Crating for Designer Pieces", titleAr: "\u062A\u0635\u0646\u064A\u062F \u0627\u0644\u0642\u0637\u0639 \u0627\u0644\u062A\u0635\u0645\u064A\u0645\u064A\u0629", descEn: "Custom crates and blanket-wrap protection for high-value and fragile items.", descAr: "\u0635\u0646\u0627\u062F\u064A\u0642 \u0645\u062E\u0635\u0635\u0629 \u0648\u062D\u0645\u0627\u064A\u0629 \u0628\u0627\u0644\u0628\u0637\u0627\u0646\u064A\u0627\u062A \u0644\u0644\u0642\u0637\u0639 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0648\u0627\u0644\u062D\u0633\u0627\u0633\u0629.", serviceSlug: "packaging-crating" },
      { titleEn: "Store & Project Distribution", titleAr: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", descEn: "Scheduled deliveries to showrooms, stores, and fit-out sites across the Kingdom.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u062F\u0648\u0644 \u0644\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u062A\u0634\u0637\u064A\u0628 \u0641\u064A \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u0645\u0644\u0643\u0629.", serviceSlug: "gcc-transportation" }
    ],
    relatedServiceSlugs: ["white-glove-logistics", "ocean-freight", "warehousing", "packaging-crating", "relocation"],
    faq: [
      {
        q: "Do you offer home delivery with assembly?",
        a: "Yes. Our white glove teams deliver inside the home, unpack, assemble, place items in the chosen room, and remove all packaging debris.",
        qAr: "\u0647\u0644 \u062A\u0648\u0641\u0631\u0648\u0646 \u062A\u0648\u0635\u064A\u0644\u0627\u064B \u0645\u0646\u0632\u0644\u064A\u0627\u064B \u0645\u0639 \u0627\u0644\u062A\u062C\u0645\u064A\u0639\u061F",
        aAr: "\u0646\u0639\u0645. \u062A\u0642\u0648\u0645 \u0641\u0631\u0642\u0646\u0627 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0628\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0646\u0632\u0644 \u0648\u0627\u0644\u0641\u0643 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0639 \u0648\u0648\u0636\u0639 \u0627\u0644\u0642\u0637\u0639 \u0641\u064A \u0627\u0644\u063A\u0631\u0641\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0648\u0625\u0632\u0627\u0644\u0629 \u0643\u0644 \u0645\u062E\u0644\u0641\u0627\u062A \u0627\u0644\u062A\u063A\u0644\u064A\u0641."
      },
      {
        q: "How do you protect furniture from transit damage?",
        a: "We combine export packing at origin, careful container loading, blanket wrapping, and custom crating for fragile or high-value pieces.",
        qAr: "\u0643\u064A\u0641 \u062A\u062D\u0645\u0648\u0646 \u0627\u0644\u0623\u062B\u0627\u062B \u0645\u0646 \u0623\u0636\u0631\u0627\u0631 \u0627\u0644\u0646\u0642\u0644\u061F",
        aAr: "\u0646\u0645\u0632\u062C \u0628\u064A\u0646 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062A\u0635\u062F\u064A\u0631\u064A \u0641\u064A \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062F\u0642\u064A\u0642 \u0644\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0644\u0641 \u0628\u0627\u0644\u0628\u0637\u0627\u0646\u064A\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u062F \u0627\u0644\u0645\u062E\u0635\u0635 \u0644\u0644\u0642\u0637\u0639 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629."
      },
      {
        q: "Can you support furniture retailers with regular imports?",
        a: "We run recurring container programmes with clearance, warehousing, and store replenishment, so collections arrive predictably each season.",
        qAr: "\u0647\u0644 \u062A\u062F\u0639\u0645\u0648\u0646 \u062A\u062C\u0627\u0631 \u0627\u0644\u0623\u062B\u0627\u062B \u0628\u0648\u0627\u0631\u062F\u0627\u062A \u0645\u0646\u062A\u0638\u0645\u0629\u061F",
        aAr: "\u0646\u0646\u0641\u0630 \u0628\u0631\u0627\u0645\u062C \u062D\u0627\u0648\u064A\u0627\u062A \u062F\u0648\u0631\u064A\u0629 \u062A\u0634\u0645\u0644 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u062C\u0631\u060C \u0644\u062A\u0635\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0628\u0627\u0646\u062A\u0638\u0627\u0645 \u0643\u0644 \u0645\u0648\u0633\u0645."
      }
    ],
    seoTitle: "Furniture Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Furniture logistics in Saudi Arabia \u2014 container imports, furniture warehousing, showroom distribution, custom crating, and white glove home delivery with assembly."
  },
  {
    slug: "chemical-logistics",
    icon: "FlaskConical",
    accentHex: "#EF4444",
    gradient: G("#1c0606", "#0A2342"),
    nameEn: "Chemical Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A",
    shortEn: "Shipment-specific dangerous-goods document, carrier and operator requirements for chemical cargo enquiries.",
    shortAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629 \u0648\u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u062D\u0633\u0628 \u0634\u062D\u0646\u0629 \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A.",
    introEn: "Chemical shipments require product-specific classification, packaging, documentation and carrier checks. Share the safety data sheet, UN number, origin, destination and intended transport mode so applicable requirements and qualified-provider availability can be reviewed.",
    introAr: "\u062A\u062A\u0637\u0644\u0628 \u0634\u062D\u0646\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u062A\u062C. \u0623\u0631\u0633\u0644 \u0646\u0634\u0631\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0631\u0642\u0645 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0646\u0637\u0628\u0642\u0629 \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644.",
    overview: [
      {
        en: "Chemical logistics is governed by classification: the UN number, packing group, and hazard class of each product determine how it may be packed, documented, stowed, and moved. Errors cause rejected bookings, port holds, and safety risk.",
        ar: "\u062A\u062D\u0643\u0645 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062A\u0635\u0646\u064A\u0641: \u0641\u0631\u0642\u0645 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0641\u0626\u0629 \u0627\u0644\u062E\u0637\u0648\u0631\u0629 \u0644\u0643\u0644 \u0645\u0646\u062A\u062C \u062A\u062D\u062F\u062F \u0637\u0631\u064A\u0642\u0629 \u062A\u0639\u0628\u0626\u062A\u0647 \u0648\u062A\u0648\u062B\u064A\u0642\u0647 \u0648\u062A\u0633\u062A\u064A\u0641\u0647 \u0648\u0646\u0642\u0644\u0647. \u0648\u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u062A\u0633\u0628\u0628 \u0631\u0641\u0636 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u0648\u0627\u062D\u062A\u062C\u0627\u0632 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u0646\u0626 \u0648\u0645\u062E\u0627\u0637\u0631 \u0639\u0644\u0649 \u0627\u0644\u0633\u0644\u0627\u0645\u0629."
      },
      {
        en: "A shipment review may cover safety-data documents, classification, declarations, packaging and authority requirements. Responsibilities, provider qualifications, acceptance and customs scope must be confirmed for the specific shipment; clearance timing depends on documents, procedures, inspections and approvals.",
        ar: "\u0642\u062F \u062A\u0634\u0645\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0644\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629\u061B \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062F\u0629 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u0641\u062D\u0635 \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A."
      }
    ],
    challenges: [
      { en: "Correct UN classification and DG declarations", ar: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0635\u062D\u064A\u062D \u0648\u0641\u0642 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0625\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629" },
      { en: "Authority approvals for regulated substances", ar: "\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0635\u0629 \u0644\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0645\u0646\u0638\u0645\u0629" },
      { en: "Segregation rules for incompatible cargo", ar: "\u0642\u0648\u0627\u0639\u062F \u0627\u0644\u0641\u0635\u0644 \u0628\u064A\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u063A\u064A\u0631 \u0627\u0644\u0645\u062A\u0648\u0627\u0641\u0642\u0629" },
      { en: "Temperature-sensitive formulations in Gulf heat", ar: "\u062A\u0631\u0643\u064A\u0628\u0627\u062A \u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0641\u064A \u0645\u0646\u0627\u062E \u0627\u0644\u062E\u0644\u064A\u062C" }
    ],
    solutions: [
      { titleEn: "Dangerous Goods Shipping Enquiry", titleAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629", descEn: "Review classification, documents, packaging, carrier acceptance and qualified-operator availability.", descAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0642\u0628\u0648\u0644 \u0627\u0644\u0646\u0627\u0642\u0644 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0634\u063A\u0651\u0644 \u0627\u0644\u0645\u0624\u0647\u0644.", serviceSlug: "dangerous-goods" },
      { titleEn: "Packaging Requirements Review", titleAr: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629", descEn: "Confirm applicable UN packaging, marking and provider qualifications for the substance and mode.", descAr: "\u062A\u0623\u0643\u064A\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0644\u0644\u0645\u0627\u062F\u0629 \u0648\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u0646\u0642\u0644.", serviceSlug: "packaging-crating" },
      { titleEn: "Temperature-Controlled Transport Enquiry", titleAr: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0646\u0642\u0644 \u0628\u062F\u0631\u062C\u0629 \u062D\u0631\u0627\u0631\u0629 \u0645\u0636\u0628\u0648\u0637\u0629", descEn: "Confirm the product range, equipment, monitoring and route options with a qualified operator.", descAr: "\u062A\u0623\u0643\u064A\u062F \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0648\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u0627\u0631 \u0645\u0639 \u0645\u0634\u063A\u0651\u0644 \u0645\u0624\u0647\u0644.", serviceSlug: "temperature-controlled-logistics" },
      { titleEn: "Import Clearance & Permits", titleAr: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D", descEn: "HS classification, authority coordination, and clearance for chemical imports.", descAr: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A.", serviceSlug: "customs-clearance" },
      { titleEn: "Bulk & Project Moves", titleAr: "\u0627\u0644\u0646\u0642\u0644 \u0628\u0627\u0644\u062C\u0645\u0644\u0629 \u0648\u0646\u0642\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", descEn: "IBC, drum, and ISO-tank coordination plus plant-equipment project cargo.", descAr: "\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0648\u0633\u064A\u0637\u0629 \u0648\u0627\u0644\u0628\u0631\u0627\u0645\u064A\u0644 \u0648\u0635\u0647\u0627\u0631\u064A\u062C ISO \u0648\u0628\u0636\u0627\u0626\u0639 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u0635\u0627\u0646\u0639.", serviceSlug: "project-cargo" }
    ],
    relatedServiceSlugs: ["dangerous-goods", "customs-clearance", "temperature-controlled-logistics", "packaging-crating", "project-cargo"],
    faq: [
      {
        q: "What should I provide for a dangerous-goods enquiry?",
        a: "Provide the safety data sheet, UN number and hazard class if known, packing group, package type, origin, destination, quantity and requested dates. Acceptance, packaging, permits and qualified-provider availability must be checked before booking.",
        qAr: "\u0645\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u062E\u0637\u0631\u0629\u061F",
        aAr: "\u0623\u0631\u0633\u0644 \u0646\u0634\u0631\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0631\u0642\u0645 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0641\u0626\u0629 \u0627\u0644\u062E\u0637\u0631 \u0625\u0646 \u0639\u064F\u0631\u0641\u062A \u0648\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0646\u0648\u0639 \u0627\u0644\u0639\u0628\u0648\u0629 \u0648\u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u064A\u062C\u0628 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u062E\u062F\u0645\u0629 \u0645\u0624\u0647\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632."
      },
      {
        q: "Do you review our MSDS documentation?",
        a: "The available document-review scope should be confirmed for each request. The shipper and qualified dangerous-goods provider remain responsible for accurate classification and required declarations.",
        qAr: "\u0647\u0644 \u062A\u0631\u0627\u062C\u0639\u0648\u0646 \u0646\u0634\u0631\u0627\u062A \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u0648\u0627\u062F \u0644\u062F\u064A\u0646\u0627\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u0631\u0627\u062C\u0639 \u0627\u0644\u0646\u0634\u0631\u0627\u062A \u0644\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0623\u0645\u0645 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0648\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0642\u0628\u0644 \u0627\u0644\u062D\u062C\u0632\u060C \u0644\u062A\u0642\u0644\u064A\u0644 \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0631\u0641\u0636 \u0648\u0627\u0644\u0627\u062D\u062A\u062C\u0627\u0632."
      },
      {
        q: "Can you transport heat-sensitive chemicals in summer?",
        a: "Share the product temperature range, route and dates. Equipment, storage, monitoring, provider qualifications and availability must be confirmed for the shipment before any temperature-controlled arrangement is booked.",
        qAr: "\u0647\u0644 \u062A\u0646\u0642\u0644\u0648\u0646 \u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u062D\u0633\u0627\u0633\u0629 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0635\u064A\u0641\u0627\u064B\u061F",
        aAr: "\u0646\u0631\u062A\u0628 \u0646\u0642\u0644\u0627\u064B \u0648\u062A\u062E\u0632\u064A\u0646\u0627\u064B \u0645\u0628\u0631\u062F\u064A\u0646 \u0644\u0644\u062A\u0631\u0643\u064A\u0628\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u062A\u0623\u062B\u0631 \u0628\u062D\u0631\u0627\u0631\u0629 \u0635\u064A\u0641 \u0627\u0644\u062E\u0644\u064A\u062C\u060C \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062D\u062F\u062F \u0645\u0646 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0644\u0644\u0646\u0647\u0627\u064A\u0629."
      }
    ],
    seoTitle: "Chemical Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Chemical shipment enquiries in Saudi Arabia: review dangerous-goods classification, packaging, documents, carrier acceptance and route-specific requirements."
  },
  {
    slug: "telecommunications-logistics",
    icon: "RadioTower",
    accentHex: "#14B8A6",
    gradient: G("#04211d", "#0A2342"),
    nameEn: "Telecommunications Logistics",
    nameAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A",
    shortEn: "Telecom and data-centre shipment enquiries covering equipment, site access and handling requirements.",
    shortAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0634\u0628\u0643\u0627\u062A \u0648\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0623\u0628\u0631\u0627\u062C \u0648\u0623\u062C\u0647\u0632\u0629 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0645\u0634\u063A\u0644\u064A\u0646 \u0648\u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644\u064A\u0646.",
    introEn: "Telecom and data-centre moves can involve radio equipment, antennas, racks and network hardware. Share the equipment list, route, site-access rules, handling instructions and delivery schedule so carrier and qualified-provider options can be reviewed.",
    introAr: "\u0646\u062C\u0627\u062D \u0646\u0634\u0631 \u0627\u0644\u0634\u0628\u0643\u0627\u062A \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639. \u062A\u0646\u0642\u0644 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u2014 \u0645\u0646 \u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0631\u0627\u062F\u064A\u0648 \u0648\u0627\u0644\u0647\u0648\u0627\u0626\u064A\u0627\u062A \u0625\u0644\u0649 \u0627\u0644\u062E\u0632\u0627\u0626\u0646 \u0648\u0623\u062C\u0647\u0632\u0629 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u2014 \u0644\u0644\u0645\u0634\u063A\u0644\u064A\u0646 \u0648\u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644\u064A\u0646 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    overview: [
      {
        en: "Telecom logistics pairs high-value electronics handling with distributed field delivery: thousands of sites, staged rollout waves, and swap programmes that generate reverse logistics. Data-centre builds add heavy, sensitive racks needing specialised handling and tilt monitoring.",
        ar: "\u062A\u062C\u0645\u0639 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0628\u064A\u0646 \u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0627\u0644\u0645\u0648\u0632\u0639: \u0622\u0644\u0627\u0641 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0645\u0648\u062C\u0627\u062A \u0646\u0634\u0631 \u0645\u0631\u062D\u0644\u064A\u0629 \u0648\u0628\u0631\u0627\u0645\u062C \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062A\u0648\u0644\u0651\u062F \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0639\u0643\u0633\u064A\u0629. \u0648\u062A\u0636\u064A\u0641 \u0645\u0634\u0627\u0631\u064A\u0639 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u062E\u0632\u0627\u0626\u0646 \u062B\u0642\u064A\u0644\u0629 \u0648\u062D\u0633\u0627\u0633\u0629 \u062A\u062A\u0637\u0644\u0628 \u0645\u0646\u0627\u0648\u0644\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0648\u0645\u0631\u0627\u0642\u0628\u0629 \u0644\u0644\u0645\u064A\u0644."
      },
      {
        en: "Potential scope may include import-document review, storage, site deliveries and return-unit handling. Conformity responsibilities, facility and system availability, site access, provider qualifications and customs scope must be confirmed per request.",
        ar: "\u0642\u062F \u064A\u0634\u0645\u0644 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062D\u062A\u0645\u0644 \u0645\u0631\u0627\u062C\u0639\u0629 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0629. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0648\u062A\u0648\u0641\u0631 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0646\u0637\u0627\u0642 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0644\u0643\u0644 \u0637\u0644\u0628."
      }
    ],
    challenges: [
      { en: "Rollout waves needing staged, site-level delivery", ar: "\u0645\u0648\u062C\u0627\u062A \u0646\u0634\u0631 \u062A\u062A\u0637\u0644\u0628 \u062A\u0633\u0644\u064A\u0645\u0627\u064B \u0645\u0631\u062D\u0644\u064A\u0627\u064B \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u0648\u0627\u0642\u0639" },
      { en: "High-value, serial-tracked hardware security", ar: "\u0623\u0645\u0646 \u0623\u062C\u0647\u0632\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0645\u062A\u062A\u0628\u0639\u0629 \u0628\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A\u0629" },
      { en: "Conformity requirements for radio equipment", ar: "\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0631\u0627\u062F\u064A\u0648" },
      { en: "Heavy racks and batteries with special handling rules", ar: "\u062E\u0632\u0627\u0626\u0646 \u062B\u0642\u064A\u0644\u0629 \u0648\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0628\u0642\u0648\u0627\u0639\u062F \u0645\u0646\u0627\u0648\u0644\u0629 \u062E\u0627\u0635\u0629" }
    ],
    solutions: [
      { titleEn: "Network Equipment Imports", titleAr: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0634\u0628\u0643\u0627\u062A", descEn: "Air and ocean programmes for radio, transmission, and core network hardware.", descAr: "\u0628\u0631\u0627\u0645\u062C \u062C\u0648\u064A\u0629 \u0648\u0628\u062D\u0631\u064A\u0629 \u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0631\u0627\u062F\u064A\u0648 \u0648\u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0648\u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629.", serviceSlug: "freight-forwarding" },
      { titleEn: "Rollout Warehousing", titleAr: "\u062A\u062E\u0632\u064A\u0646 \u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0646\u0634\u0631", descEn: "Staged storage with serial-level control, kitting, and wave-based dispatch.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0645\u0631\u062D\u0644\u064A \u0628\u0636\u0628\u0637 \u062A\u0633\u0644\u0633\u0644\u064A \u0648\u062A\u062C\u0647\u064A\u0632 \u062D\u0632\u0645 \u0648\u0625\u0631\u0633\u0627\u0644 \u062D\u0633\u0628 \u0627\u0644\u0645\u0648\u062C\u0627\u062A.", serviceSlug: "warehousing" },
      { titleEn: "Site & Tower Deliveries", titleAr: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0623\u0628\u0631\u0627\u062C", descEn: "Distributed field delivery to urban rooftops and remote tower sites.", descAr: "\u062A\u0648\u0635\u064A\u0644 \u0645\u064A\u062F\u0627\u0646\u064A \u0645\u0648\u0632\u0639 \u0644\u0623\u0633\u0637\u062D \u0627\u0644\u0645\u062F\u0646 \u0648\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0646\u0627\u0626\u064A\u0629.", serviceSlug: "gcc-transportation" },
      { titleEn: "Data-Centre Hardware Moves", titleAr: "\u0646\u0642\u0644 \u0623\u062C\u0647\u0632\u0629 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A", descEn: "Shock- and tilt-monitored transport and positioning for racks and servers.", descAr: "\u0646\u0642\u0644 \u0648\u062A\u0645\u0648\u0636\u0639 \u0645\u0631\u0627\u0642\u0628\u0627\u0646 \u0644\u0644\u0635\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u064A\u0644 \u0644\u0644\u062E\u0632\u0627\u0626\u0646 \u0648\u0627\u0644\u062E\u0648\u0627\u062F\u0645.", serviceSlug: "white-glove-logistics" },
      { titleEn: "DG Battery Handling", titleAr: "\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u062E\u0637\u0631\u0629", descEn: "Compliant shipping for lithium backup batteries and power systems.", descAr: "\u0634\u062D\u0646 \u0645\u062A\u0648\u0627\u0641\u0642 \u0644\u0628\u0637\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0644\u064A\u062B\u064A\u0648\u0645 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0648\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0637\u0627\u0642\u0629.", serviceSlug: "dangerous-goods" }
    ],
    relatedServiceSlugs: ["freight-forwarding", "warehousing", "white-glove-logistics", "dangerous-goods", "express-courier"],
    faq: [
      {
        q: "Can you deliver to remote tower sites?",
        a: "Provide the site location, equipment dimensions, access restrictions and requested date. Coverage, permits, vehicle suitability, offloading responsibilities and qualified-provider availability need confirmation for that location.",
        qAr: "\u0645\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0625\u0644\u0649 \u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0623\u0628\u0631\u0627\u062C\u061F",
        aAr: "\u0623\u0631\u0633\u0644 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0642\u064A\u0648\u062F \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0637\u0644\u0648\u0628. \u064A\u062C\u0628 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u063A\u0637\u064A\u0629 \u0648\u0627\u0644\u062A\u0635\u0627\u0631\u064A\u062D \u0648\u0645\u0644\u0627\u0621\u0645\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0648\u062A\u0648\u0641\u0631 \u0645\u0642\u062F\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0624\u0647\u0644 \u0644\u0630\u0644\u0643 \u0627\u0644\u0645\u0648\u0642\u0639."
      },
      {
        q: "How do you handle data-centre rack deliveries?",
        a: "Share rack dimensions, weight, handling tolerances, route and data-hall access details. Suspension, shock/tilt monitoring, indoor placement, crew qualification and provider availability must be agreed before booking.",
        qAr: "\u0643\u064A\u0641 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u062A\u0633\u0644\u064A\u0645 \u062E\u0632\u0627\u0626\u0646 \u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A\u061F",
        aAr: "\u062A\u064F\u0646\u0642\u0644 \u0627\u0644\u062E\u0632\u0627\u0626\u0646 \u0628\u0646\u0642\u0644 \u0645\u0631\u0627\u0642\u0628 \u0644\u0644\u0645\u064A\u0644 \u0648\u0628\u062A\u0639\u0644\u064A\u0642 \u0647\u0648\u0627\u0626\u064A \u0645\u0639 \u062A\u0645\u0648\u0636\u0639 \u0641\u0627\u062E\u0631 \u062F\u0627\u062E\u0644 \u0642\u0627\u0639\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u2014 \u0628\u0645\u0627 \u064A\u0634\u0645\u0644 \u0641\u062D\u0635 \u0627\u0644\u0645\u0646\u062D\u062F\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0645\u0648\u0636\u0639 \u0627\u0644\u0646\u0647\u0627\u0626\u064A."
      },
      {
        q: "Do you manage return and swap-out units?",
        a: "Returns and swap-outs may require serial records, reverse transport, storage, redeployment or export documents. Confirm facility availability, inventory systems and the responsible providers for the requested scope.",
        qAr: "\u0647\u0644 \u062A\u062F\u064A\u0631\u0648\u0646 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0628\u062F\u0644\u0629\u061F",
        aAr: "\u0646\u062C\u0645\u0639 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0646\u062F\u064A\u0631 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A\u0629 \u0648\u0646\u0631\u062A\u0628 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0634\u0631 \u0623\u0648 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u062C\u0629."
      }
    ],
    seoTitle: "Telecommunications Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Telecom logistics in Saudi Arabia \u2014 network equipment imports, rollout warehousing, tower site deliveries, data-centre hardware moves, and DG battery handling."
  },
  {
    slug: "government-logistics",
    icon: "Landmark",
    accentHex: "#94A3B8",
    gradient: G("#0d1420", "#0A2342"),
    nameEn: "Government Logistics",
    nameAr: "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629",
    shortEn: "Tender-compliant logistics for suppliers and contractors serving ministries, agencies, and public projects.",
    shortAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0645\u062A\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0644\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0630\u064A\u0646 \u064A\u062E\u062F\u0645\u0648\u0646 \u0627\u0644\u0648\u0632\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062C\u0647\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0639\u0627\u0645\u0629.",
    introEn: "Public-sector deliveries carry their own rules: tender terms, documented chains of custody, and precise delivery protocols. ENVOD KINGDOM supports suppliers and contractors delivering goods and equipment to government entities across Saudi Arabia.",
    introAr: "\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0639\u0627\u0645 \u0644\u0647 \u0642\u0648\u0627\u0639\u062F\u0647: \u0634\u0631\u0648\u0637 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0648\u0633\u0644\u0627\u0633\u0644 \u0639\u0647\u062F\u0629 \u0645\u0648\u062B\u0642\u0629 \u0648\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u062A\u0633\u0644\u064A\u0645 \u062F\u0642\u064A\u0642\u0629. \u062A\u062F\u0639\u0645 \u0625\u0646\u0641\u0648\u062F \u0643\u064A\u0646\u062C\u062F\u0645 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u0630\u064A\u0646 \u064A\u0648\u0631\u062F\u0648\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0644\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    overview: [
      {
        en: "Government logistics is documentation-first: delivery notes matching purchase orders, inspection-ready consignments, and receiving procedures that vary by entity. Suppliers winning public tenders need a logistics partner who treats paperwork as seriously as transport.",
        ar: "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u062A\u0628\u062F\u0623 \u0628\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A: \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u062A\u0633\u0644\u064A\u0645 \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0634\u062D\u0646\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0641\u062D\u0635 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0633\u062A\u0644\u0627\u0645 \u062A\u062E\u062A\u0644\u0641 \u0628\u064A\u0646 \u0627\u0644\u062C\u0647\u0627\u062A. \u0648\u0627\u0644\u0645\u0648\u0631\u062F\u0648\u0646 \u0627\u0644\u0641\u0627\u0626\u0632\u0648\u0646 \u0628\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629 \u064A\u062D\u062A\u0627\u062C\u0648\u0646 \u0634\u0631\u064A\u0643\u0627\u064B \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u064B \u064A\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0628\u062C\u062F\u064A\u0629 \u0627\u0644\u0646\u0642\u0644 \u0646\u0641\u0633\u0647\u0627."
      },
      {
        en: "We support tender suppliers with import clearance, compliant documentation, secure warehousing, and coordinated deliveries to ministries, universities, hospitals, and public projects \u2014 including event and exhibition logistics for government-hosted programmes. Customs-clearance timing and requirements vary by shipment, documentation, customs procedures, and any regulatory approvals.",
        ar: "\u0646\u062F\u0639\u0645 \u0645\u0648\u0631\u062F\u064A \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0628\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0645\u062A\u0648\u0627\u0641\u0642 \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0622\u0645\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0646\u0633\u0642 \u0644\u0644\u0648\u0632\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062C\u0627\u0645\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0639\u0627\u0645\u0629 \u2014 \u0628\u0645\u0627 \u064A\u0634\u0645\u0644 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0644\u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629. \u0648\u062A\u0639\u062A\u0645\u062F \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0648\u0645\u062F\u062A\u0647 \u0639\u0644\u0649 \u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0623\u064A \u0645\u0648\u0627\u0641\u0642\u0627\u062A \u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0644\u0627\u0632\u0645\u0629."
      }
    ],
    challenges: [
      { en: "Tender delivery terms with strict documentation", ar: "\u0634\u0631\u0648\u0637 \u062A\u0633\u0644\u064A\u0645 \u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0628\u062A\u0648\u062B\u064A\u0642 \u0635\u0627\u0631\u0645" },
      { en: "Entity-specific receiving and inspection procedures", ar: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0641\u062D\u0635 \u062A\u062E\u062A\u0644\u0641 \u0628\u064A\u0646 \u0627\u0644\u062C\u0647\u0627\u062A" },
      { en: "Multi-site deliveries across regions and cities", ar: "\u062A\u0633\u0644\u064A\u0645 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0648\u0627\u0644\u0645\u062F\u0646" },
      { en: "Sensitive equipment needing secure handling", ar: "\u0645\u0639\u062F\u0627\u062A \u062D\u0633\u0627\u0633\u0629 \u062A\u062A\u0637\u0644\u0628 \u0645\u0646\u0627\u0648\u0644\u0629 \u0622\u0645\u0646\u0629" }
    ],
    solutions: [
      { titleEn: "Tender Delivery Coordination", titleAr: "\u062A\u0646\u0633\u064A\u0642 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A", descEn: "PO-matched documentation, inspection-ready consignments, and delivery protocols.", descAr: "\u062A\u0648\u062B\u064A\u0642 \u0645\u0637\u0627\u0628\u0642 \u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0634\u062D\u0646\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0641\u062D\u0635 \u0648\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u062A\u0633\u0644\u064A\u0645.", serviceSlug: "supply-chain" },
      { titleEn: "Import Clearance", titleAr: "\u062A\u062E\u0644\u064A\u0635 \u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A", descEn: "Clean clearance with exemption handling where applicable for public-sector goods.", descAr: "\u062A\u062E\u0644\u064A\u0635 \u0633\u0644\u064A\u0645 \u0645\u0639 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0625\u0639\u0641\u0627\u0621\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u0627\u0646\u0637\u0628\u0627\u0642 \u0644\u0628\u0636\u0627\u0626\u0639 \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0639\u0627\u0645.", serviceSlug: "customs-clearance" },
      { titleEn: "Secure Warehousing", titleAr: "\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0622\u0645\u0646", descEn: "Controlled-access storage and staging ahead of scheduled handovers.", descAr: "\u062A\u062E\u0632\u064A\u0646 \u0628\u0648\u0635\u0648\u0644 \u0645\u0636\u0628\u0648\u0637 \u0648\u062A\u062C\u0647\u064A\u0632 \u0642\u0628\u0644 \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u062C\u062F\u0648\u0644\u0629.", serviceSlug: "warehousing" },
      { titleEn: "Multi-Region Distribution", titleAr: "\u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0645\u0646\u0627\u0637\u0642", descEn: "Coordinated deliveries to entities across Riyadh, Jeddah, Dammam, and beyond.", descAr: "\u062A\u0633\u0644\u064A\u0645 \u0645\u0646\u0633\u0642 \u0644\u0644\u062C\u0647\u0627\u062A \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u062C\u062F\u0629 \u0648\u0627\u0644\u062F\u0645\u0627\u0645 \u0648\u063A\u064A\u0631\u0647\u0627.", serviceSlug: "gcc-transportation" },
      { titleEn: "Event & Exhibition Support", titleAr: "\u062F\u0639\u0645 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636", descEn: "Logistics for government-hosted conferences, exhibitions, and national events.", descAr: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0624\u062A\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0648\u0637\u0646\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0633\u062A\u0636\u064A\u0641\u0647\u0627 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629.", serviceSlug: "exhibition-logistics" }
    ],
    relatedServiceSlugs: ["customs-clearance", "supply-chain", "warehousing", "exhibition-logistics", "project-cargo"],
    faq: [
      {
        q: "Do you work directly with government entities?",
        a: "We primarily support the suppliers and contractors who hold government contracts \u2014 handling their import, storage, and delivery obligations in line with tender terms.",
        qAr: "\u0647\u0644 \u062A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629\u061F",
        aAr: "\u0646\u062F\u0639\u0645 \u0628\u0634\u0643\u0644 \u0623\u0633\u0627\u0633\u064A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0627\u0644\u062D\u0627\u0635\u0644\u064A\u0646 \u0639\u0644\u0649 \u0639\u0642\u0648\u062F \u062D\u0643\u0648\u0645\u064A\u0629 \u2014 \u0628\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A\u0647\u0645 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0641\u0642 \u0634\u0631\u0648\u0637 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A."
      },
      {
        q: "Can you match deliveries to purchase-order requirements?",
        a: "Yes. We prepare delivery documentation aligned to your PO and contract terms, and coordinate receiving appointments and inspection requirements with the receiving entity.",
        qAr: "\u0647\u0644 \u062A\u0637\u0627\u0628\u0642\u0648\u0646 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0645\u0639 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621\u061F",
        aAr: "\u0646\u0639\u0645. \u0646\u062C\u0647\u0632 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0641\u0642 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0642\u062F\u060C \u0648\u0646\u0646\u0633\u0642 \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0641\u062D\u0635 \u0645\u0639 \u0627\u0644\u062C\u0647\u0629 \u0627\u0644\u0645\u0633\u062A\u0644\u0645\u0629."
      },
      {
        q: "Do you support national events and exhibitions?",
        a: "We provide exhibition and event logistics for programmes hosted by public entities, including temporary import processing and on-site handling.",
        qAr: "\u0647\u0644 \u062A\u062F\u0639\u0645\u0648\u0646 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0648\u0637\u0646\u064A\u0629\u061F",
        aAr: "\u0646\u0648\u0641\u0631 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0644\u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u064A \u062A\u0633\u062A\u0636\u064A\u0641\u0647\u0627 \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629\u060C \u0628\u0645\u0627 \u064A\u0634\u0645\u0644 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0624\u0642\u062A \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0644\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629."
      }
    ],
    seoTitle: "Government Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Government-sector logistics in Saudi Arabia \u2014 tender-compliant deliveries, import clearance, secure warehousing, and multi-region distribution for public-sector suppliers."
  }
];
var INDUSTRY_BY_SLUG = Object.fromEntries(
  INDUSTRY_META.map((i) => [i.slug, i])
);

// src/lib/search-countries.ts
var pairs = "afg:AF ala:AX alb:AL dza:DZ asm:AS and:AD ago:AO aia:AI ata:AQ atg:AG arg:AR arm:AM abw:AW aus:AU aut:AT aze:AZ bhs:BS bhr:BH bgd:BD brb:BB blr:BY bel:BE blz:BZ ben:BJ bmu:BM btn:BT bol:BO bes:BQ bih:BA bwa:BW bvt:BV bra:BR iot:IO brn:BN bgr:BG bfa:BF bdi:BI cpv:CV khm:KH cmr:CM can:CA cym:KY caf:CF tcd:TD chl:CL chn:CN cxr:CX cck:CC col:CO com:KM cog:CG cod:CD cok:CK cri:CR civ:CI hrv:HR cub:CU cuw:CW cyp:CY cze:CZ dnk:DK dji:DJ dma:DM dom:DO ecu:EC egy:EG slv:SV gnq:GQ eri:ER est:EE swz:SZ eth:ET flk:FK fro:FO fji:FJ fin:FI fra:FR guf:GF pyf:PF atf:TF gab:GA gmb:GM geo:GE deu:DE gha:GH gib:GI grc:GR grl:GL grd:GD glp:GP gum:GU gtm:GT ggy:GG gin:GN gnb:GW guy:GY hti:HT hmd:HM vat:VA hnd:HN hkg:HK hun:HU isl:IS ind:IN idn:ID irn:IR irq:IQ irl:IE imn:IM isr:IL ita:IT jam:JM jpn:JP jey:JE jor:JO kaz:KZ ken:KE kir:KI prk:KP kor:KR kwt:KW kgz:KG lao:LA lva:LV lbn:LB lso:LS lbr:LR lby:LY lie:LI ltu:LT lux:LU mac:MO mdg:MG mwi:MW mys:MY mdv:MV mli:ML mlt:MT mhl:MH mtq:MQ mrt:MR mus:MU myt:YT mex:MX fsm:FM mda:MD mco:MC mng:MN mne:ME msr:MS mar:MA moz:MZ mmr:MM nam:NA nru:NR npl:NP nld:NL ncl:NC nzl:NZ nic:NI ner:NE nga:NG niu:NU nfk:NF mkd:MK mnp:MP nor:NO omn:OM pak:PK plw:PW pse:PS pan:PA png:PG pry:PY per:PE phl:PH pcn:PN pol:PL prt:PT pri:PR qat:QA reu:RE rou:RO rus:RU rwa:RW blm:BL shn:SH kna:KN lca:LC maf:MF spm:PM vct:VC wsm:WS smr:SM stp:ST sau:SA sen:SN srb:RS syc:SC sle:SL sgp:SG sxm:SX svk:SK svn:SI slb:SB som:SO zaf:ZA sgs:GS ssd:SS esp:ES lka:LK sdn:SD sur:SR sjm:SJ swe:SE che:CH syr:SY twn:TW tjk:TJ tza:TZ tha:TH tls:TL tgo:TG tkl:TK ton:TO tto:TT tun:TN tur:TR tkm:TM tca:TC tuv:TV uga:UG ukr:UA are:AE gbr:GB usa:US umi:UM ury:UY uzb:UZ vut:VU ven:VE vnm:VN vgb:VG vir:VI wlf:WF esh:EH yem:YE zmb:ZM zwe:ZW";
var codes = Object.fromEntries(pairs.split(" ").map((pair) => pair.split(":")));
var names = new Intl.DisplayNames(["en"], { type: "region" });
function normalizeCountry(raw) {
  const code = raw.trim();
  return codes[code.toLowerCase()] ? code.toLowerCase() : Object.keys(codes).find((key) => codes[key] === code.toUpperCase()) ?? null;
}

// src/lib/search-operations.ts
var PRODUCTION_ORIGIN = "https://www.envodkingdom.net";
var publicEnglishPaths = /* @__PURE__ */ new Set(["/", "/services", "/about", "/gallery", "/contact", "/privacy-policy", "/terms-and-conditions", "/cookie-notice", "/industries", "/vision-2030", "/track", ...Object.values(SERVICE_META).map((meta) => `/services/${meta.slug}`), ...INDUSTRY_META.map((meta) => `/industries/${meta.slug}`)]);
function performanceFilters(input) {
  const filters = [];
  if (input.country) {
    const country = normalizeCountry(input.country);
    if (!country) throw new Error("Use a valid ISO country code, for example sau.");
    filters.push({ dimension: "country", operator: "equals", expression: country });
  }
  if (input.device) {
    const device = input.device.toUpperCase();
    if (!["MOBILE", "DESKTOP", "TABLET"].includes(device)) throw new Error("Invalid device");
    filters.push({ dimension: "device", operator: "equals", expression: device });
  }
  if (input.language && !["en", "ar"].includes(input.language)) throw new Error("Invalid language");
  if (input.page && !publicEnglishPaths.has(input.page)) throw new Error("Choose a verified public route");
  if (input.page && input.language) filters.push({ dimension: "page", operator: "equals", expression: PRODUCTION_ORIGIN + (input.language === "ar" ? "/ar" : "") + (input.page === "/" && input.language === "ar" ? "" : input.page) });
  else if (input.language || input.page) {
    const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const paths = input.page ? [input.page] : [...publicEnglishPaths];
    const alternatives = paths.flatMap((path3) => (input.language ? [input.language] : ["en", "ar"]).map((lang) => (lang === "ar" ? "/ar" : "") + (path3 === "/" ? "" : path3)));
    filters.push({ dimension: "page", operator: "includingRegex", expression: `^https?://(www\\.)?envodkingdom\\.net(${alternatives.map(escaped).join("|")})/?(\\?.*)?$` });
  }
  if (input.query?.trim()) filters.push({ dimension: "query", operator: "contains", expression: input.query.trim().slice(0, 300) });
  return filters;
}

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
    availability: { current: currentTotal.length > 0, previous: previousTotal.length > 0 },
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
  router.get(
    "/research",
    (_req, res, next) => {
      res.setHeader("Cache-Control", "private, no-store");
      next();
    },
    requireAdmin,
    (_req, res) => {
      res.json(seoIntelligenceResearch);
    }
  );
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
        let filters;
        try {
          filters = performanceFilters(Object.fromEntries(["language", "page", "country", "device", "query"].map((key) => [key, typeof req.query[key] === "string" ? req.query[key] : void 0])));
        } catch (error) {
          responseError(res, 400, error instanceof Error ? error.message : "Invalid performance filters");
          return;
        }
        const cacheKey = `${connection.selectedProperty}|${startDate}|${endDate}|${JSON.stringify(filters)}`;
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
          type: "web",
          dataState: "final",
          ...filters.length ? { dimensionFilterGroups: [{ groupType: "and", filters }] } : {},
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

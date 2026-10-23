import type { AuditedPage, SiteAudit } from "../../src/lib/search-console-api";

const ALLOWED_HOSTS = new Set(["www.envodkingdom.net", "envodkingdom.net"]);
const AUDIT_AGENT = "EnvodKingdomSEOAudit";
const MAX_URLS = 300;
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const DEFAULT_CRAWL_DELAY_MS = 250;

interface RobotsRule {
  allow: boolean;
  pattern: string;
}

interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
  crawlDelayMs: number | null;
}

interface RobotsPolicy {
  rules: RobotsRule[];
  crawlDelayMs: number;
}

interface FetchResult {
  response: Response;
  finalUrl: URL;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);?/g, (_match, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function stripMarkup(value: string): string {
  return decodeHtml(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/<!--[\s\S]*?-->/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  const source = tag.replace(/^<[^\s>]+|\/?>$/g, "");
  const regex =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(regex)) {
    const key = match[1]?.toLowerCase();
    if (!key || key.startsWith("<")) continue;
    result[key] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function getMeta(html: string, name: string): string {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.name?.toLowerCase() === name.toLowerCase()) {
      return attrs.content ?? "";
    }
  }
  return "";
}

function getLinkByRel(html: string, rel: string): string | null {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    const relValues = (attrs.rel ?? "").toLowerCase().split(/\s+/);
    if (relValues.includes(rel.toLowerCase()) && attrs.href) {
      return attrs.href;
    }
  }
  return null;
}

function jsonLdTypes(html: string): string[] {
  const types = new Set<string>();
  for (const match of html.matchAll(
    /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi,
  )) {
    try {
      const json: unknown = JSON.parse(match[1] ?? "");
      const visit = (value: unknown) => {
        if (Array.isArray(value)) {
          for (const child of value) visit(child);
          return;
        }
        if (!value || typeof value !== "object") return;
        const record = value as Record<string, unknown>;
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

function canonicalUrl(value: string | null, base: URL): string | null {
  if (!value) return null;
  try {
    return new URL(value, base).href;
  } catch {
    return null;
  }
}

function normalizeInternalUrl(value: string, base: URL): string | null {
  try {
    const url = new URL(value, base);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      !ALLOWED_HOSTS.has(url.hostname.toLowerCase()) ||
      url.username ||
      url.password
    ) {
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

function regexFromRobotsPattern(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\\\$$/, "$");
  return new RegExp(`^${escaped}`);
}

function robotsGroupApplies(group: RobotsGroup): boolean {
  return (
    group.agents.includes("*") ||
    group.agents.some((agent) => agent.includes(AUDIT_AGENT.toLowerCase()))
  );
}

function parseRobots(content: string): RobotsPolicy {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
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
        current.crawlDelayMs = Math.min(seconds * 1000, 5000);
        hasRule = true;
      }
    }
  }

  const matching = groups.filter(robotsGroupApplies);
  const specific = matching.filter((group) =>
    group.agents.some((agent) => agent !== "*"),
  );
  const selected = specific.length ? specific : matching;
  const rules = selected.flatMap((group) => group.rules);
  const delays = selected
    .map((group) => group.crawlDelayMs)
    .filter((delay): delay is number => delay !== null);
  return {
    rules,
    crawlDelayMs: delays.length
      ? Math.max(...delays)
      : DEFAULT_CRAWL_DELAY_MS,
  };
}

function robotsAllows(policy: RobotsPolicy, url: URL): boolean {
  const pathAndQuery = `${url.pathname}${url.search}`;
  let winningRule: RobotsRule | null = null;
  let winningLength = -1;
  for (const rule of policy.rules) {
    if (!regexFromRobotsPattern(rule.pattern).test(pathAndQuery)) continue;
    const length = rule.pattern.replace(/[*$]/g, "").length;
    if (
      length > winningLength ||
      (length === winningLength && rule.allow)
    ) {
      winningRule = rule;
      winningLength = length;
    }
  }
  return winningRule?.allow ?? true;
}

async function readLimitedText(
  response: Response,
  maximumBytes: number,
): Promise<{ text: string; truncated: boolean }> {
  if (!response.body) return { text: "", truncated: false };
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
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
      "utf8",
    ),
    truncated,
  };
}

async function safeFetch(
  url: URL,
  fetchImpl: typeof fetch,
  maximumRedirects = 4,
): Promise<FetchResult> {
  let current = new URL(url.href);
  for (let redirects = 0; redirects <= maximumRedirects; redirects++) {
    const response = await fetchImpl(current.href, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": `${AUDIT_AGENT}/1.0 (+https://www.envodkingdom.net/)`,
        Accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.1",
      },
      signal: AbortSignal.timeout(10_000),
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

function sitemapLocations(xml: string): {
  isIndex: boolean;
  locations: string[];
} {
  const isIndex = /<sitemapindex\b/i.test(xml);
  const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)]
    .map((match) => decodeHtml(match[1] ?? "").trim())
    .filter(Boolean);
  return { isIndex, locations };
}

async function collectSitemapUrls(
  robotsSitemaps: string[],
  fetchImpl: typeof fetch,
  notes: string[],
): Promise<{ sitemapUrls: string[]; pageUrls: string[] }> {
  const queue = [
    ...robotsSitemaps,
    "https://www.envodkingdom.net/sitemap.xml",
  ];
  const visited = new Set<string>();
  const sitemapUrls: string[] = [];
  const pageUrls = new Set<string>();

  while (queue.length && visited.size < 20 && pageUrls.size < 2000) {
    const candidate = queue.shift();
    if (!candidate) continue;
    const normalized = normalizeInternalUrl(
      candidate,
      new URL("https://www.envodkingdom.net/"),
    );
    if (!normalized || visited.has(normalized)) continue;
    visited.add(normalized);
    try {
      const { response, finalUrl } = await safeFetch(
        new URL(normalized),
        fetchImpl,
      );
      if (!response.ok) {
        if (response.status !== 404) {
          notes.push(`Sitemap returned HTTP ${response.status}: ${normalized}`);
        }
        continue;
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (
        !contentType.includes("xml") &&
        !contentType.includes("text/plain")
      ) {
        notes.push(`Sitemap response was not XML: ${normalized}`);
        continue;
      }
      const { text, truncated } = await readLimitedText(
        response,
        MAX_DOCUMENT_BYTES,
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
          finalUrl,
        );
        if (!internal) continue;
        if (
          isIndex ||
          /\.xml(?:$|\?)/i.test(new URL(internal).pathname)
        ) {
          if (!visited.has(internal) && queue.length < 20) queue.push(internal);
        } else {
          pageUrls.add(internal);
        }
        if (pageUrls.size >= 2000) break;
      }
    } catch {
      notes.push(`Sitemap could not be fetched: ${normalized}`);
    }
  }
  return { sitemapUrls: [...new Set(sitemapUrls)], pageUrls: [...pageUrls] };
}

function extractPage(
  html: string,
  url: URL,
  status: number,
  truncated: boolean,
): { page: AuditedPage; internalLinks: string[] } {
  const title = stripMarkup(
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? "",
  );
  const description = getMeta(html, "description").trim();
  const canonical = canonicalUrl(getLinkByRel(html, "canonical"), url);
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)]
    .map((match) => stripMarkup(match[1] ?? ""))
    .filter(Boolean);
  const language = html.match(/<html\b[^>]*>/i)
    ? attributes(html.match(/<html\b[^>]*>/i)![0]).lang ?? null
    : null;
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const direction = attributes(htmlTag).dir ?? null;
  const hreflang: Array<{ language: string; url: string }> = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (
      (attrs.rel ?? "").toLowerCase().split(/\s+/).includes("alternate") &&
      attrs.hreflang &&
      attrs.href
    ) {
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

  const internalLinks = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attributes(match[0]).href;
    if (!href) continue;
    const normalized = normalizeInternalUrl(href, url);
    if (normalized) internalLinks.add(normalized);
  }

  const visibleText = stripMarkup(
    html.replace(/<(nav|footer|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " "),
  );
  const wordCount = visibleText
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

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
      error: truncated ? "HTML exceeded the 2 MB inspection limit; content was partially inspected." : null,
    },
    internalLinks: [...internalLinks],
  };
}

async function fetchRobots(
  fetchImpl: typeof fetch,
  notes: string[],
): Promise<{
  url: string;
  policy: RobotsPolicy;
  allowsCrawl: boolean;
  sitemapUrls: string[];
}> {
  const url = "https://www.envodkingdom.net/robots.txt";
  try {
    const { response } = await safeFetch(new URL(url), fetchImpl);
    if (response.status === 404) {
      notes.push("robots.txt returned 404; no robots directives were found.");
      return {
        url,
        policy: { rules: [], crawlDelayMs: DEFAULT_CRAWL_DELAY_MS },
        allowsCrawl: true,
        sitemapUrls: [],
      };
    }
    if (!response.ok) {
      notes.push(`robots.txt could not be read (HTTP ${response.status}); crawl stopped.`);
      return {
        url,
        policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5000 },
        allowsCrawl: false,
        sitemapUrls: [],
      };
    }
    const { text, truncated } = await readLimitedText(response, 256 * 1024);
    if (truncated) {
      notes.push("robots.txt exceeded the safety limit; crawl stopped.");
      return {
        url,
        policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5000 },
        allowsCrawl: false,
        sitemapUrls: [],
      };
    }
    const sitemapUrls = [...text.matchAll(/^sitemap\s*:\s*(\S+)/gim)]
      .map((match) => match[1] ?? "")
      .filter(Boolean);
    const policy = parseRobots(text);
    return {
      url,
      policy,
      allowsCrawl: robotsAllows(policy, new URL("https://www.envodkingdom.net/")),
      sitemapUrls,
    };
  } catch {
    notes.push("robots.txt could not be fetched; crawl stopped.");
    return {
      url,
      policy: { rules: [{ allow: false, pattern: "/" }], crawlDelayMs: 5000 },
      allowsCrawl: false,
      sitemapUrls: [],
    };
  }
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlEnvodKingdom(options: {
  fetchImpl?: typeof fetch;
  now?: () => number;
  maxUrls?: number;
} = {}): Promise<SiteAudit> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const startedAt = new Date(now()).toISOString();
  const notes: string[] = [
    "Read-only public-site crawl. No page content was changed and no indexing request was sent.",
  ];
  const robots = await fetchRobots(fetchImpl, notes);
  const sitemap = await collectSitemapUrls(
    robots.sitemapUrls,
    fetchImpl,
    notes,
  );
  const rootUrl = "https://www.envodkingdom.net/";
  const discovered = new Set<string>([rootUrl, ...sitemap.pageUrls]);
  const cap = Math.max(1, Math.min(options.maxUrls ?? MAX_URLS, MAX_URLS));
  const queue = [...discovered]
    .filter((candidate) =>
      robotsAllows(robots.policy, new URL(candidate)),
    )
    .slice(0, cap);
  const pagesByUrl = new Map<string, AuditedPage>();
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < queue.length) {
      const index = cursor++;
      const candidate = queue[index];
      if (!candidate || pagesByUrl.has(candidate)) continue;
      await sleep(robots.policy.crawlDelayMs);
      try {
        const { response, finalUrl } = await safeFetch(
          new URL(candidate),
          fetchImpl,
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
            error: response.ok ? "non_html_content" : null,
          });
          continue;
        }
        const { text, truncated } = await readLimitedText(
          response,
          MAX_DOCUMENT_BYTES,
        );
        const parsed = extractPage(
          text,
          finalUrl,
          response.status,
          truncated,
        );
        pagesByUrl.set(candidate, parsed.page);
        for (const linked of parsed.internalLinks) {
          if (discovered.has(linked)) continue;
          discovered.add(linked);
          const linkedUrl = new URL(linked);
          if (
            queue.length < cap &&
            robotsAllows(robots.policy, linkedUrl)
          ) {
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
          error: "page_fetch_failed",
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
    notes,
  };
}

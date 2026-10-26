/// <reference types="express" />

import { createHash, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express, {
  Router,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import type {} from "pino-http";
import { z } from "zod";
import { crawlEnvodKingdom } from "./crawler.js";
import { seoIntelligenceResearch } from "../../src/data/seo-intelligence-research.js";
import {
  exchangeAuthorizationCode,
  fetchGoogleUserInfo,
  GoogleApiError,
  refreshGoogleAccessToken,
  revokeGoogleToken,
  SearchConsoleClient,
  type SearchAnalyticsQuery,
  type SearchAnalyticsRow,
} from "./google-api.js";
import {
  clearAdminSessionCookie,
  clearOAuthStateCookie,
  getAdminSession,
  getOAuthStateCookie,
  setAdminSessionCookie,
  setOAuthStateCookie,
} from "./security.js";
import {
  emptySearchConsoleStore,
  EncryptedSearchConsoleStore,
  type SearchConsoleStorage,
  type SearchConsoleStore,
} from "./store.js";

import { performanceFilters } from "../../src/lib/search-operations";
const SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";
const IDENTITY_SCOPES = "openid email";
const MAX_GSC_RANGE_DAYS = 400;
const MAX_INSPECTION_URLS = 10;
const SEARCH_ROW_LIMIT = 25_000;
const AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

type Environment = NodeJS.ProcessEnv;
type Fetcher = typeof fetch;

interface Options {
  apiPrefix: string;
  basePath?: string;
  env?: Environment;
  fetchImpl?: Fetcher;
  now?: () => number;
  storeFilePath?: string;
  storeFactory?: (env: Environment) => SearchConsoleStorage | null;
  maxCrawlUrls?: number;
}

interface AccessTokenCache {
  value: string;
  expiresAt: number;
}

interface DashboardResponse {
  availability: {current:boolean;previous:boolean};
  property: string;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  retrievedAt: string;
  current: ReturnType<typeof metricSummary>;
  previous: ReturnType<typeof metricSummary>;
  timeSeries: Array<ReturnType<typeof metricRow> & { date: string }>;
  queries: Array<ReturnType<typeof metricRow>>;
  queryPages: Array<{
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  pages: Array<ReturnType<typeof metricRow>>;
  countries: Array<ReturnType<typeof metricRow>>;
  devices: Array<ReturnType<typeof metricRow>>;
  appearances: Array<ReturnType<typeof metricRow>>;
  notes: string[];
}

function metricSummary(row?: SearchAnalyticsRow) {
  return {
    key: "",
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

function metricRow(row: SearchAnalyticsRow) {
  return {
    key: row.keys?.[0] ?? "",
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  };
}

function isEnvodProperty(siteUrl: string): boolean {
  if (/^sc-domain:envodkingdom\.net$/i.test(siteUrl.trim())) return true;
  try {
    const url = new URL(siteUrl);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      ["envodkingdom.net", "www.envodkingdom.net"].includes(
        url.hostname.toLowerCase(),
      ) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function normalizeAdminEmail(value: string | undefined): string | null {
  const email = value?.trim().toLowerCase() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function getRedirectUri(env: Environment, apiPrefix: string): string | null {
  const callbackPath = `${apiPrefix}/search-console/oauth/callback`;
  const configured = env.GSC_REDIRECT_URI?.trim();
  if (configured) {
    try {
      const uri = new URL(configured);
      if (
        uri.protocol !== "https:" ||
        uri.pathname !== callbackPath ||
        uri.search ||
        uri.hash ||
        uri.username ||
        uri.password
      ) {
        return null;
      }
      if (
        (env.VERCEL === "1" || env.NODE_ENV === "production") &&
        uri.origin !== "https://www.envodkingdom.net"
      ) {
        return null;
      }
      const developmentDomain = env.REPLIT_DEV_DOMAIN?.trim().toLowerCase();
      if (
        env.VERCEL !== "1" &&
        env.NODE_ENV !== "production" &&
        developmentDomain &&
        uri.origin !== `https://${developmentDomain}`
      ) {
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

  if (
    env.NODE_ENV !== "production" &&
    (devDomain === "localhost" || devDomain === "127.0.0.1")
  ) {
    return `http://${devDomain}${callbackPath}`;
  }
  return null;
}

function configuration(env: Environment, apiPrefix: string) {
  const adminEmail = normalizeAdminEmail(env.GSC_ADMIN_EMAIL);
  const sessionSecret = env.SESSION_SECRET?.trim();
  const redirectUri = getRedirectUri(env, apiPrefix);
  const missing: string[] = [];
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
    redirectUri,
  };
}

export function isTrustedMutationOrigin(
  req: Request,
  env: Environment,
): boolean {
  const origin = req.get("origin")?.trim();
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || req.get("sec-fetch-site") === "cross-site") {
      return false;
    }
    if (env.VERCEL === "1" || env.NODE_ENV === "production") {
      return (
        parsed.protocol === "https:" &&
        (parsed.origin === "https://www.envodkingdom.net" ||
          parsed.origin === "https://envodkingdom.net")
      );
    }
    return origin === `${req.protocol}://${req.get("host")}`;
  } catch {
    return false;
  }
}

function parseCookiePath(apiPrefix: string): string {
  return `${apiPrefix}/search-console/oauth`;
}

function parseQueryString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function validIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
  );
}

function dateDaysBetweenInclusive(start: string, end: string): number {
  return (
    Math.floor(
      (Date.parse(`${end}T00:00:00.000Z`) -
        Date.parse(`${start}T00:00:00.000Z`)) /
        86_400_000,
    ) + 1
  );
}

function previousDateRange(start: string, days: number) {
  const previousEnd = new Date(
    Date.parse(`${start}T00:00:00.000Z`) - 86_400_000,
  );
  const previousStart = new Date(
    previousEnd.getTime() - (days - 1) * 86_400_000,
  );
  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10),
  };
}

function responseError(
  res: Response,
  status: number,
  message: string,
): void {
  res.status(status).json({ ok: false, error: message });
}

function sendProviderError(
  req: Request,
  res: Response,
  error: unknown,
  action: "oauth" | "analytics" | "inspection" | "disconnect",
): void {
  if (error instanceof GoogleApiError) {
    req.log?.warn(
      { providerStatus: error.status, provider: error.kind },
      "Google Search Console request failed",
    );
    if (error.status === 401 || error.status === 400) {
      responseError(
        res,
        401,
        "Google access expired or was declined. Reconnect the authorized account and try again.",
      );
      return;
    }
    if (error.status === 403) {
      responseError(
        res,
        403,
        "Google denied this request. Confirm that the Search Console API is enabled and the authorized account can access this property.",
      );
      return;
    }
    if (error.status === 429) {
      res.setHeader("Retry-After", "60");
      responseError(
        res,
        503,
        "Google is rate-limiting requests. Wait a little, then retry.",
      );
      return;
    }
  } else {
    req.log?.error(
      { action },
      "Search Console operation failed without safe provider details",
    );
  }

  responseError(
    res,
    502,
    action === "inspection"
      ? "URL Inspection could not complete. Retry later; no indexing request was sent."
      : "Google Search Console could not complete the request. Please retry later.",
  );
}

function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  now: () => number;
}): RequestHandler {
  const buckets = new Map<string, { count: number; expiresAt: number }>();
  let nextCleanup = 0;
  return (req, res, next) => {
    const time = options.now();
    if (time >= nextCleanup) {
      for (const [key, bucket] of buckets) {
        if (bucket.expiresAt <= time) buckets.delete(key);
      }
      nextCleanup = time + 60_000;
    }
    const key = req.ip ?? "unknown";
    let bucket = buckets.get(key);
    if (!bucket || bucket.expiresAt <= time) {
      if (buckets.size >= 5000 && !bucket) {
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
        String(Math.max(1, Math.ceil((bucket.expiresAt - time) / 1000))),
      );
      responseError(res, 429, "Too many requests. Please wait and retry.");
      return;
    }
    bucket.count++;
    next();
  };
}

function getInspectionDetails(
  url: string,
  response: unknown,
): {
  url: string;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  robotsTxtState: string | null;
  pageFetchState: string | null;
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  referringUrls: string[];
  sitemaps: string[];
} {
  const outer =
    response && typeof response === "object"
      ? (response as Record<string, unknown>)
      : {};
  const inspection =
    outer.inspectionResult &&
    typeof outer.inspectionResult === "object"
      ? (outer.inspectionResult as Record<string, unknown>)
      : {};
  const index =
    inspection.indexStatusResult &&
    typeof inspection.indexStatusResult === "object"
      ? (inspection.indexStatusResult as Record<string, unknown>)
      : {};
  const list = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === "string")
      : [];
  const stringValue = (value: unknown) =>
    typeof value === "string" ? value : null;
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
    sitemaps: list(index.sitemap),
  };
}

function normalizeInspectionUrl(value: string, property: string): string | null {
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !["envodkingdom.net", "www.envodkingdom.net"].includes(
        url.hostname.toLowerCase(),
      ) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    if (!property.startsWith("sc-domain:")) {
      const prefix = new URL(property);
      if (
        url.hostname.toLowerCase() !== prefix.hostname.toLowerCase() ||
        !url.pathname.startsWith(prefix.pathname)
      ) {
        return null;
      }
    }
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function toDashboardResponse(
  property: string,
  startDate: string,
  endDate: string,
  previousRange: { startDate: string; endDate: string },
  retrievedAt: string,
  currentTotal: SearchAnalyticsRow[],
  previousTotal: SearchAnalyticsRow[],
  trend: SearchAnalyticsRow[],
  queryRows: SearchAnalyticsRow[],
  queryPageRows: SearchAnalyticsRow[],
  pageRows: SearchAnalyticsRow[],
  countryRows: SearchAnalyticsRow[],
  deviceRows: SearchAnalyticsRow[],
  appearanceRows: SearchAnalyticsRow[],
): DashboardResponse {
  return {
    property,
    startDate,
    endDate,
    previousStartDate: previousRange.startDate,
    previousEndDate: previousRange.endDate,
    retrievedAt,
    availability: {current:currentTotal.length>0,previous:previousTotal.length>0},
    current: metricSummary(currentTotal[0]),
    previous: metricSummary(previousTotal[0]),
    timeSeries: trend.map((row) => ({
      ...metricRow(row),
      date: row.keys?.[0] ?? "",
    })),
    queries: queryRows.map(metricRow),
    queryPages: queryPageRows.map((row) => ({
      query: row.keys?.[0] ?? "",
      page: row.keys?.[1] ?? "",
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })),
    pages: pageRows.map(metricRow),
    countries: countryRows.map(metricRow),
    devices: deviceRows.map(metricRow),
    appearances: appearanceRows.map(metricRow),
    notes: [
      "Google Search Console data can be delayed; the newest dates may be incomplete.",
      "Query rows can omit anonymized searches and are limited to the rows Google returns for this request.",
      "Query-to-page associations come from Google’s query+page dimension and may also be limited by API row limits.",
      "Position is an aggregate Search Console metric for the selected property and date range, not a fixed rank for every searcher.",
    ],
  };
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function isAudit(
  value: unknown,
  now = Date.now(),
): value is { pages: unknown[]; completedAt: string } {
  if (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { pages?: unknown }).pages) &&
    typeof (value as { completedAt?: unknown }).completedAt === "string"
  ) {
    const completedAt = Date.parse((value as { completedAt: string }).completedAt);
    const age = now - completedAt;
    return Number.isFinite(completedAt) && age >= 0 && age < AUDIT_RETENTION_MS;
  }
  return false;
}

export function createSearchConsoleRouter(options: Options) {
  const router = Router();
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const basePath = options.basePath ?? "";
  const authConfig = () => configuration(env, options.apiPrefix);
  const oauthCookiePath = parseCookiePath(options.apiPrefix);
  const accessCache: { current: AccessTokenCache | null } = { current: null };
  const dashboardCache = new Map<
    string,
    { expiresAt: number; value: DashboardResponse }
  >();
  let lastCrawlStartedAt = 0;
  let inFlightCrawl: Promise<Awaited<ReturnType<typeof crawlEnvodKingdom>>> | null =
    null;

  const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
  const storePath =
    options.storeFilePath ??
    path.resolve(serverDirectory, "..", "..", ".private-data", "gsc.enc");
  let store: SearchConsoleStorage | null | undefined;
  const getStore = () => {
    if (store !== undefined) return store;
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

  const requireAdmin: RequestHandler = (req, res, next) => {
    const config = authConfig();
    const session = getAdminSession(
      req,
      config.sessionSecret,
      config.adminEmail ?? undefined,
      now(),
    );
    if (!config.configured || !session) {
      responseError(res, 401, "Sign in with the authorized ENVOD administrator account to continue.");
      return;
    }
    res.locals.adminEmail = session.email;
    next();
  };

  const requireSameOrigin: RequestHandler = (req, res, next) => {
    if (!isTrustedMutationOrigin(req, env)) {
      responseError(res, 403, "This request must come from the ENVOD KINGDOM site.");
      return;
    }
    next();
  };

  const requireConnection = async (
    req: Request,
    res: Response,
  ): Promise<{ connection: SearchConsoleStore; token: string } | null> => {
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

  async function accessToken(): Promise<string> {
    const config = authConfig();
    if (!config.configured || !config.clientId || !config.clientSecret) {
      throw new Error("search_console_not_configured");
    }
    if (
      accessCache.current &&
      accessCache.current.expiresAt > now() + 60_000
    ) {
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
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      fetchImpl,
    });
    accessCache.current = {
      value: refreshed.access_token,
      expiresAt: now() + Math.max(60, refreshed.expires_in) * 1000,
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
    const config = authConfig();
    const session = getAdminSession(
      req,
      config.sessionSecret,
      config.adminEmail ?? undefined,
      now(),
    );
    if (!config.configured) {
      res.json({
        configured: false,
        authenticated: false,
        connected: false,
        selectedProperty: null,
        lastSyncedAt: null,
        setupMessage:
          "The private dashboard needs server-side Google OAuth settings, the authorized administrator, and encrypted persistent storage.",
      });
      return;
    }
    if (!session) {
      res.json({
        configured: true,
        authenticated: false,
        connected: false,
        selectedProperty: null,
        lastSyncedAt: null,
      });
      return;
    }

    try {
      const storage = getStore();
      const connection = storage
        ? await storage.read()
        : emptySearchConsoleStore();
      res.json({
        configured: true,
        authenticated: true,
        connected: Boolean(connection.refreshToken),
        selectedProperty: connection.selectedProperty,
        lastSyncedAt: connection.lastSyncedAt,
      });
    } catch {
      req.log?.error("Search Console connection state could not be read");
      responseError(res, 503, "The private connection record could not be read.");
    }
  });

  router.get(
    "/oauth/start",
    createRateLimiter({ limit: 10, windowMs: 15 * 60_000, now }),
    (req, res) => {
      const config = authConfig();
      if (!config.configured || !config.redirectUri) {
        responseError(
          res,
          503,
          "Google OAuth is not configured. Set the OAuth client, administrator, encryption, storage, and matching redirect URI in the deployment environment.",
        );
        return;
      }

      const state = randomBytes(32).toString("base64url");
      const verifier = randomBytes(48).toString("base64url");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");
      setOAuthStateCookie(
        req,
        res,
        state,
        verifier,
        config.sessionSecret ?? "",
        oauthCookiePath,
        now(),
      );

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.search = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: `${IDENTITY_SCOPES} ${SEARCH_CONSOLE_SCOPE}`,
        access_type: "offline",
        prompt: "consent",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
      }).toString();
      res.redirect(302, authUrl.href);
    },
  );

  router.get("/oauth/callback", async (req, res) => {
    const config = authConfig();
    const state = parseQueryString(req.query.state);
    const providerError = parseQueryString(req.query.error);
    const code = parseQueryString(req.query.code);
    const pendingState = getOAuthStateCookie(
      req,
      config.sessionSecret,
      now(),
    );
    clearOAuthStateCookie(req, res, oauthCookiePath);
    if (providerError) {
      res.redirect(`${basePath}/admin/search-console?oauth=cancelled`);
      return;
    }

    const pending =
      state && pendingState?.state === state ? pendingState : null;
    if (
      !state ||
      !pending ||
      !code ||
      code.length > 4096 ||
      !config.configured ||
      !config.redirectUri ||
      !config.clientId ||
      !config.clientSecret ||
      !config.adminEmail
    ) {
      responseError(res, 400, "Google sign-in could not be verified. Start the connection again.");
      return;
    }

    try {
      const tokenResponse = await exchangeAuthorizationCode({
        code,
        codeVerifier: pending.verifier,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        fetchImpl,
      });
      if (
        !tokenResponse.scope ||
        !tokenResponse.scope
          .split(/\s+/)
          .includes(SEARCH_CONSOLE_SCOPE)
      ) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false,
        );
        responseError(
          res,
          403,
          "Google did not grant the requested read-only Search Console permission.",
        );
        return;
      }
      const googleUser = await fetchGoogleUserInfo(
        tokenResponse.access_token,
        fetchImpl,
      );
      if (googleUser.email.trim().toLowerCase() !== config.adminEmail) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false,
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
      const refreshToken =
        tokenResponse.refresh_token ?? current.refreshToken;
      if (!refreshToken) {
        await revokeGoogleToken(tokenResponse.access_token, fetchImpl).catch(
          () => false,
        );
        responseError(
          res,
          502,
          "Google did not return offline access. Restart sign-in and approve the requested access.",
        );
        return;
      }
      await storage.write({
        ...current,
        refreshToken,
        lastSyncedAt: null,
      });
      accessCache.current = {
        value: tokenResponse.access_token,
        expiresAt: now() + Math.max(60, tokenResponse.expires_in) * 1000,
      };
      setAdminSessionCookie(
        req,
        res,
        config.adminEmail,
        config.sessionSecret ?? "",
        now(),
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
    },
  );

  router.get("/properties", requireAdmin, async (req, res) => {
    try {
      const token = await accessToken();
      const client = new SearchConsoleClient(fetchImpl);
      const sites = await client.listSites(token);
      const properties = sites
        .filter((site) => isEnvodProperty(site.siteUrl))
        .map(({ siteUrl, permissionLevel }) => ({ siteUrl, permissionLevel }))
        .sort((a, b) => {
          const aDomain = a.siteUrl.startsWith("sc-domain:");
          const bDomain = b.siteUrl.startsWith("sc-domain:");
          return aDomain === bDomain ? a.siteUrl.localeCompare(b.siteUrl) : aDomain ? -1 : 1;
        });
      res.json({
        properties,
        preferredProperty:
          properties.find(
            (property) =>
              property.siteUrl.toLowerCase() ===
              "sc-domain:envodkingdom.net",
          )?.siteUrl ?? null,
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
    const body = z
      .object({ siteUrl: z.string().trim().min(1).max(500) })
      .safeParse(req.body);
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
        (site) => site.siteUrl === body.data.siteUrl,
      );
      if (!property) {
        responseError(
          res,
          403,
          "That exact property is not available to the authorized Google account.",
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
        lastSyncedAt: null,
      });
      dashboardCache.clear();
      res.json({ ok: true, selectedProperty: property.siteUrl });
    } catch (error) {
      sendProviderError(req, res, error, "oauth");
    }
    },
  );

  router.get(
    "/dashboard",
    requireAdmin,
    createRateLimiter({ limit: 8, windowMs: 5 * 60_000, now }),
    async (req, res) => {
      const startDate = parseQueryString(req.query.startDate);
      const endDate = parseQueryString(req.query.endDate);
      if (
        !startDate ||
        !endDate ||
        !validIsoDate(startDate) ||
        !validIsoDate(endDate)
      ) {
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
        let filters: ReturnType<typeof performanceFilters>;
        try {
          filters=performanceFilters(Object.fromEntries(["language","page","country","device","query"].map(key=>[key,typeof req.query[key]==="string"?req.query[key]:undefined])));
        } catch(error) {responseError(res,400,error instanceof Error?error.message:"Invalid performance filters");return;}
        const cacheKey = `${connection.selectedProperty}|${startDate}|${endDate}|${JSON.stringify(filters)}`;
        const force = req.query.force === "1";
        const cached = dashboardCache.get(cacheKey);
        if (!force && cached && cached.expiresAt > now()) {
          res.json(cached.value);
          return;
        }
        const client = new SearchConsoleClient(fetchImpl);
        const previous = previousDateRange(startDate, days);
        const baseQuery = (from: string, to: string, dimensions?: string[]) =>
          ({
            startDate: from,
            endDate: to,
            type: "web" as const,
            dataState: "final" as const,
            ...(filters.length ? {dimensionFilterGroups:[{groupType:"and" as const,filters}]} : {}),
            ...(dimensions ? { dimensions } : {}),
            rowLimit: SEARCH_ROW_LIMIT,
          }) satisfies SearchAnalyticsQuery;
        const [
          currentTotal,
          previousTotal,
          trend,
          queryRows,
          queryPageRows,
          pageRows,
          countryRows,
          deviceRows,
          appearanceRows,
        ] = await Promise.all([
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(previous.startDate, previous.endDate),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["date"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["query"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["query", "page"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["page"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["country"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["device"]),
          ),
          client.query(
            token,
            connection.selectedProperty,
            baseQuery(startDate, endDate, ["searchAppearance"]),
          ),
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
          appearanceRows,
        );
        dashboardCache.set(cacheKey, {
          value: result,
          expiresAt: now() + 5 * 60_000,
        });
        await getStore()?.write({
          ...connection,
          lastSyncedAt: retrievedAt,
        });
        res.json(result);
      } catch (error) {
        sendProviderError(req, res, error, "analytics");
      }
    },
  );

  router.get("/audit", requireAdmin, async (req, res) => {
    try {
      const storage = getStore();
      const saved = await storage?.read();
      if (
        !saved?.audit ||
        !isAudit(saved.audit, now())
      ) {
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
    createRateLimiter({ limit: 2, windowMs: 5 * 60_000, now }),
    async (req, res) => {
      const elapsed = now() - lastCrawlStartedAt;
      if (elapsed < 60_000) {
        res.setHeader("Retry-After", String(Math.ceil((60_000 - elapsed) / 1000)));
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
            maxUrls: options.maxCrawlUrls,
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
    },
  );

  router.post(
    "/inspection",
    requireAdmin,
    requireSameOrigin,
    createRateLimiter({ limit: 5, windowMs: 5 * 60_000, now }),
    async (req, res) => {
      const body = z
        .object({
          urls: z.array(z.string().trim().min(1).max(2000)).min(1).max(MAX_INSPECTION_URLS),
        })
        .safeParse(req.body);
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
        const urls = body.data.urls.map((url) =>
          normalizeInspectionUrl(url, connection.selectedProperty!),
        );
        if (urls.some((url) => !url)) {
          responseError(
            res,
            400,
            "Only URLs inside the selected ENVOD KINGDOM property can be inspected.",
          );
          return;
        }
        const client = new SearchConsoleClient(fetchImpl);
        const inspections = [];
        for (const url of urls as string[]) {
          try {
            const details = await client.inspectUrl(
              token,
              connection.selectedProperty,
              url,
            );
            inspections.push(getInspectionDetails(url, details));
          } catch (error) {
            if (error instanceof GoogleApiError) {
              req.log?.warn(
                { providerStatus: error.status },
                "URL Inspection request failed",
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
              error: "Google could not inspect this URL. Retry later.",
            });
          }
        }
        res.json({ inspections, indexingRequestsSent: 0 });
      } catch (error) {
        sendProviderError(req, res, error, "inspection");
      }
    },
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
          fetchImpl,
        ).catch(() => false);
      }
      await storage.clear();
      dashboardCache.clear();
      accessCache.current = null;
      res.json({ ok: true, revocationConfirmed });
    } catch (error) {
      sendProviderError(req, res, error, "disconnect");
    }
    },
  );

  router.use(
    (
      error: unknown,
      req: Request,
      res: Response,
      _next: (error?: unknown) => void,
    ) => {
      const type =
        error && typeof error === "object" && "type" in error
          ? String((error as { type?: unknown }).type)
          : "";
      const status =
        type === "entity.too.large"
          ? 413
          : type === "entity.parse.failed"
            ? 400
            : 500;
      req.log?.warn({ status }, "Search Console request could not be parsed");
      responseError(
        res,
        status,
        status === 413
          ? "The request is too large."
          : status === 400
            ? "The request body is invalid JSON."
            : "The Search Console request could not be processed.",
      );
    },
  );

  return router;
}

export function isAllowedEnvodProperty(siteUrl: string): boolean {
  return isEnvodProperty(siteUrl);
}

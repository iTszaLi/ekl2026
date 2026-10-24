import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import { test } from "node:test";
import type { Request, Response } from "express";
import {
  GoogleApiError,
  SearchConsoleClient,
} from "./google-api";
import {
  getOAuthStateCookie,
  getAdminSession,
  setOAuthStateCookie,
  setAdminSessionCookie,
} from "./security";
import { EncryptedSearchConsoleStore } from "./store";
import { crawlEnvodKingdom } from "./crawler";
import { EncryptedVercelBlobSearchConsoleStore } from "./vercel-blob-store";
import { isAudit, isTrustedMutationOrigin } from "./router";
import searchConsoleVercelHandler from "../../api/search-console/[...path]";

function fakeResponse() {
  const headers = new Map<string, string[]>();
  const response = {
    append(name: string, value: string) {
      headers.set(name, [...(headers.get(name) ?? []), value]);
      return this;
    },
  } as unknown as Response;
  return { response, headers };
}

function fakeRequest(cookie?: string) {
  return {
    secure: true,
    headers: cookie ? { cookie } : {},
  } as Request;
}

test("admin session cookies are signed, allowlisted, and expire", () => {
  const secret = "a".repeat(48);
  const { response, headers } = fakeResponse();
  setAdminSessionCookie(
    fakeRequest() as Request,
    response,
    "Admin@EnvodKingdom.net",
    secret,
    1000,
  );
  const cookieHeader = headers.get("Set-Cookie")?.[0];
  assert.ok(cookieHeader);
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /Secure/);
  assert.match(cookieHeader, /SameSite=Lax/);
  const cookie = cookieHeader.split(";")[0];
  const parsed = fakeRequest(cookie) as Request;
  assert.equal(
    getAdminSession(parsed, secret, "admin@envodkingdom.net", 2000)?.email,
    "admin@envodkingdom.net",
  );
  assert.equal(getAdminSession(parsed, secret, "other@example.com", 2000), null);
  assert.equal(getAdminSession(parsed, secret, "admin@envodkingdom.net", 30_000_000), null);
  const tampered = fakeRequest(`${cookie}tampered`) as Request;
  assert.equal(
    getAdminSession(tampered, secret, "admin@envodkingdom.net", 2000),
    null,
  );
});

test("OAuth state and PKCE verifier survive serverless instances only in a signed short-lived cookie", () => {
  const secret = "o".repeat(48);
  const state = "s".repeat(43);
  const verifier = "v".repeat(64);
  const { response, headers } = fakeResponse();
  setOAuthStateCookie(
    fakeRequest() as Request,
    response,
    state,
    verifier,
    secret,
    "/api/search-console/oauth",
    1000,
  );
  const cookieHeader = headers.get("Set-Cookie")?.[0];
  assert.ok(cookieHeader);
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /Secure/);
  assert.match(cookieHeader, /SameSite=Lax/);
  assert.match(cookieHeader, /Max-Age=600/);
  const cookie = cookieHeader.split(";")[0];
  assert.deepEqual(
    getOAuthStateCookie(fakeRequest(cookie) as Request, secret, 2000),
    { state, verifier, expiresAt: 601_000 },
  );
  assert.equal(
    getOAuthStateCookie(fakeRequest(cookie) as Request, secret, 601_000),
    null,
  );
  assert.equal(
    getOAuthStateCookie(fakeRequest(`${cookie}tampered`) as Request, secret, 2000),
    null,
  );
});

test("Search Console mutations reject cross-origin or missing-origin requests", () => {
  const makeRequest = (origin?: string, fetchSite?: string) =>
    ({
      protocol: "https",
      get(name: string) {
        if (name === "origin") return origin;
        if (name === "sec-fetch-site") return fetchSite;
        if (name === "host") return "www.envodkingdom.net";
        return undefined;
      },
    }) as unknown as Request;

  assert.equal(
    isTrustedMutationOrigin(makeRequest("https://www.envodkingdom.net", "same-origin"), {
      VERCEL: "1",
    }),
    true,
  );
  assert.equal(
    isTrustedMutationOrigin(makeRequest("https://attacker.example", "cross-site"), {
      VERCEL: "1",
    }),
    false,
  );
  assert.equal(
    isTrustedMutationOrigin(makeRequest(undefined), { VERCEL: "1" }),
    false,
  );
  assert.equal(
    isTrustedMutationOrigin(makeRequest("https://preview.replit.dev"), {
      NODE_ENV: "development",
    }),
    false,
  );
});

test("Vercel handler serves a safe unconfigured session and rejects cross-origin mutations", async () => {
  const server = createServer(searchConsoleVercelHandler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const session = await fetch(`${baseUrl}/api/search-console/session`);
    assert.equal(session.status, 200);
    assert.equal(session.headers.get("cache-control"), "no-store");
    const sessionBody = (await session.json()) as { configured: boolean };
    assert.equal(sessionBody.configured, false);

    const research = await fetch(`${baseUrl}/api/search-console/research`);
    assert.equal(research.status, 401);
    assert.equal(research.headers.get("cache-control"), "private, no-store");
    const researchBody = (await research.json()) as { services?: unknown[] };
    assert.equal(researchBody.services, undefined);

    const logout = await fetch(`${baseUrl}/api/search-console/logout`, {
      method: "POST",
      headers: {
        Origin: "https://attacker.example",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(logout.status, 403);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("Search Console refresh tokens are encrypted at rest", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "envod-gsc-store-"));
  const filePath = path.join(directory, "gsc.enc");
  const store = new EncryptedSearchConsoleStore(filePath, "s".repeat(48));
  try {
    await store.write({
      version: 1,
      refreshToken: "refresh-token-sensitive-value",
      selectedProperty: "sc-domain:envodkingdom.net",
      lastSyncedAt: null,
      audit: null,
    });
    const raw = await readFile(filePath, "utf8");
    assert.ok(!raw.includes("refresh-token-sensitive-value"));
    assert.equal((await store.read()).refreshToken, "refresh-token-sensitive-value");
    assert.equal((await stat(filePath)).mode & 0o777, 0o600);
    await store.clear();
    assert.equal((await store.read()).refreshToken, null);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("private Vercel Blob storage encrypts data and reads the latest version", async () => {
  let stored: string | null = null;
  let lastReadOptions: Record<string, unknown> | null = null;
  let lastPutOptions: Record<string, unknown> | null = null;
  const blobApi = {
    async get(_path: string, options: Record<string, unknown>) {
      lastReadOptions = options;
      if (!stored) return null;
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(stored ?? ""));
          controller.close();
        },
      });
      return {
        statusCode: 200,
        stream,
        headers: new Headers(),
        blob: {
          url: "https://example.private.blob.vercel-storage.com/private",
          downloadUrl: "https://example.private.blob.vercel-storage.com/private",
          pathname: "envod-private/search-console/connection-v1.enc",
          contentDisposition: "attachment",
          cacheControl: "no-cache",
          uploadedAt: new Date(0),
          etag: "etag",
          contentType: "application/json",
          size: stored.length,
        },
      };
    },
    async put(_path: string, body: unknown, options: Record<string, unknown>) {
      stored = String(body);
      lastPutOptions = options;
      return {};
    },
    async del() {
      stored = null;
    },
  } as unknown as NonNullable<
    ConstructorParameters<typeof EncryptedVercelBlobSearchConsoleStore>[2]
  >;
  const store = new EncryptedVercelBlobSearchConsoleStore(
    "private-read-write-token",
    "k".repeat(64),
    blobApi,
  );
  await store.write({
    version: 1,
    refreshToken: "secret-refresh-token",
    selectedProperty: "sc-domain:envodkingdom.net",
    lastSyncedAt: "2026-10-24T00:00:00.000Z",
    audit: null,
  });
  assert.ok(stored);
  assert.ok(!stored.includes("secret-refresh-token"));
  assert.equal(lastPutOptions?.access, "private");
  assert.equal(lastPutOptions?.allowOverwrite, true);
  assert.equal((await store.read()).refreshToken, "secret-refresh-token");
  assert.equal(lastReadOptions?.access, "private");
  assert.equal(lastReadOptions?.useCache, false);
  await store.clear();
  assert.equal((await store.read()).refreshToken, null);
});

test("crawl reports are accepted only within the configured retention window", () => {
  const now = Date.parse("2026-10-24T12:00:00.000Z");
  const recent = {
    completedAt: new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString(),
    pages: [],
  };
  const expired = {
    completedAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pages: [],
  };
  assert.equal(isAudit(recent, now), true);
  assert.equal(isAudit(expired, now), false);
});

test("Google Search Analytics limits rows and returns only validated metrics", async () => {
  let requestBody: Record<string, unknown> | null = null;
  const fetchMock: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        rows: [
          {
            keys: ["freight forwarding saudi"],
            clicks: 4,
            impressions: 32,
            ctr: 0.125,
            position: 9.2,
          },
          { keys: ["invalid"], clicks: "bad", impressions: 1, ctr: 0, position: 1 },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const client = new SearchConsoleClient(fetchMock);
  const rows = await client.query(
    "access-token",
    "sc-domain:envodkingdom.net",
    {
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      rowLimit: 100_000,
    },
  );
  assert.equal(requestBody?.rowLimit, 25_000);
  assert.equal(requestBody?.searchType, "web");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].clicks, 4);
  assert.equal(rows[0].ctr, 0.125);
});

test("Google API failures do not expose provider response text", async () => {
  const fetchMock: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "private provider payload" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  const client = new SearchConsoleClient(fetchMock);
  await assert.rejects(
    client.listSites("access-token"),
    (error: unknown) => {
      assert.ok(error instanceof GoogleApiError);
      assert.equal(error.status, 403);
      assert.equal(error.message, "google_api_request_failed");
      assert.ok(!error.message.includes("private provider payload"));
      return true;
    },
  );
});

test("site crawl honors robots.txt and extracts public SEO metadata", async () => {
  const requested: string[] = [];
  const home = `<!doctype html>
    <html lang="en" dir="ltr"><head>
    <title>ENVOD Kingdom</title>
    <meta name="description" content="Freight coordination across Saudi Arabia.">
    <link rel="canonical" href="https://www.envodkingdom.net/">
    <link rel="alternate" hreflang="ar-SA" href="https://www.envodkingdom.net/ar">
    <script type="application/ld+json">{"@type":"Organization"}</script>
    </head><body><h1>Shipping in Saudi Arabia</h1>
    <a href="/services">Services</a><a href="/private">Private</a>
    <img src="/hero.jpg"><img src="/logo.svg" alt="ENVOD"></body></html>`;
  const service = `<!doctype html><html lang="en"><head>
    <title>Freight services</title></head><body>
    <h1>Freight services</h1><p>Saudi logistics</p></body></html>`;
  const fetchMock: typeof fetch = async (input) => {
    const url = new URL(String(input));
    requested.push(url.href);
    if (url.pathname === "/robots.txt") {
      return new Response(
        "User-agent: *\nDisallow: /private\nSitemap: https://www.envodkingdom.net/sitemap.xml\n",
        { status: 200, headers: { "Content-Type": "text/plain" } },
      );
    }
    if (url.pathname === "/sitemap.xml") {
      return new Response(
        `<?xml version="1.0"?><urlset><url><loc>https://www.envodkingdom.net/</loc></url><url><loc>https://www.envodkingdom.net/services</loc></url><url><loc>https://www.envodkingdom.net/private</loc></url></urlset>`,
        { status: 200, headers: { "Content-Type": "application/xml" } },
      );
    }
    if (url.pathname === "/") {
      return new Response(home, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
    if (url.pathname === "/services") {
      return new Response(service, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
    return new Response("not found", { status: 404 });
  };
  const result = await crawlEnvodKingdom({
    fetchImpl: fetchMock,
    now: () => Date.parse("2026-10-21T00:00:00.000Z"),
    maxUrls: 20,
  });
  assert.equal(result.robotsAllowsCrawl, true);
  assert.equal(result.crawledUrls, 2);
  assert.ok(!requested.some((url) => new URL(url).pathname === "/private"));
  const page = result.pages.find((entry) => entry.url.endsWith("/"));
  assert.ok(page);
  assert.equal(page.title, "ENVOD Kingdom");
  assert.equal(page.language, "en");
  assert.equal(page.direction, "ltr");
  assert.equal(page.imagesMissingAlt, 1);
  assert.deepEqual(page.structuredDataTypes, ["Organization"]);
  assert.equal(page.hreflang[0]?.language, "ar-SA");
});

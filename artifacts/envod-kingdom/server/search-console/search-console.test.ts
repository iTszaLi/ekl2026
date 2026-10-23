import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import type { Request, Response } from "express";
import {
  GoogleApiError,
  SearchConsoleClient,
} from "./google-api";
import {
  getAdminSession,
  setAdminSessionCookie,
} from "./security";
import { EncryptedSearchConsoleStore } from "./store";
import { crawlEnvodKingdom } from "./crawler";

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

import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express from "express";
import { DataForSeoClient, DataForSeoError, describeStatus } from "./client.js";
import { createDataForSeoRouter } from "./router.js";
import { BudgetExceededError, DataForSeoService, normalizeSerp } from "./service.js";
import { MemoryJsonStore } from "./store.js";

const LOGIN = "test-login@example.com";
const PASSWORD = "test-api-password-not-real";
const SESSION_SECRET = "s".repeat(48);
const ADMIN = "admin@example.com";

function envelope(result: unknown[], cost = 0, taskStatus = 20000) {
  return {
    version: "0.1.20261101",
    status_code: 20000,
    status_message: "Ok.",
    time: "0.1 sec.",
    cost,
    tasks_count: 1,
    tasks_error: taskStatus === 20000 ? 0 : 1,
    tasks: [
      {
        id: "11061200-0000-0000-0000-000000000000",
        status_code: taskStatus,
        status_message: taskStatus === 20000 ? "Ok." : "Invalid Field.",
        cost,
        result_count: result.length,
        path: [],
        data: {},
        result: taskStatus === 20000 ? result : null,
      },
    ],
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function serpResult(positions: Record<string, number>) {
  return {
    keyword: "customs clearance saudi arabia",
    se_results_count: 1200000,
    item_types: ["organic", "people_also_ask", "local_pack"],
    items: Object.entries(positions).map(([domain, rank]) => ({
      type: "organic",
      rank_group: rank,
      rank_absolute: rank + 1,
      domain,
      url: `https://${domain}/page`,
    })),
  };
}

interface FakeCall {
  url: string;
  method: string;
  authorization: string | null;
  body: unknown;
}

function fakeFetch(handler: (call: FakeCall) => Response) {
  const calls: FakeCall[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const call: FakeCall = {
      url: String(input),
      method: init?.method ?? "GET",
      authorization: headers.get("authorization"),
      body: init?.body ? JSON.parse(String(init.body)) : null,
    };
    calls.push(call);
    return handler(call);
  }) as typeof fetch;
  return { impl, calls };
}

const credentialsEnv = { DATAFORSEO_LOGIN: LOGIN, DATAFORSEO_PASSWORD: PASSWORD } as NodeJS.ProcessEnv;

test("status reports Not Connected without credentials and makes no API call", async () => {
  const { impl, calls } = fakeFetch(() => json({}));
  const service = new DataForSeoService({ env: {}, fetchImpl: impl, store: new MemoryJsonStore() });
  const status = await service.status();
  assert.equal(status.configured, false);
  assert.equal(status.connected, false);
  assert.match(status.error ?? "", /DATAFORSEO_LOGIN/);
  assert.equal(calls.length, 0);
});

test("status authenticates with Basic auth against the free user_data endpoint", async () => {
  const { impl, calls } = fakeFetch(() =>
    json(envelope([{ login: LOGIN, money: { total: 50, balance: 49.25, limits: { day: { total: 10 } } } }])),
  );
  const service = new DataForSeoService({ env: credentialsEnv, fetchImpl: impl, store: new MemoryJsonStore() });
  const status = await service.status();
  assert.equal(status.connected, true);
  assert.equal(status.account?.balanceUsd, 49.25);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "GET");
  assert.equal(calls[0].url, "https://api.dataforseo.com/v3/appendix/user_data");
  assert.equal(calls[0].authorization, `Basic ${Buffer.from(`${LOGIN}:${PASSWORD}`).toString("base64")}`);
  assert.ok(!JSON.stringify(status).includes(PASSWORD));
  assert.ok(!JSON.stringify(status).includes(LOGIN));
});

test("authentication failures are explained without exposing credentials", async () => {
  const { impl } = fakeFetch(() =>
    json({ ...envelope([]), status_code: 40100, status_message: "You are not authorized to access this resource.", tasks: [] }),
  );
  const service = new DataForSeoService({ env: credentialsEnv, fetchImpl: impl, store: new MemoryJsonStore() });
  const status = await service.status();
  assert.equal(status.connected, false);
  assert.equal(status.errorCode, 40100);
  assert.match(status.error ?? "", /rejected the credentials/);
  assert.ok(!(status.error ?? "").includes(PASSWORD));

  const http401 = new DataForSeoService({
    env: credentialsEnv,
    fetchImpl: fakeFetch(() => json({}, 401)).impl,
    store: new MemoryJsonStore(),
  });
  assert.equal((await http401.status()).errorCode, 40100);
});

test("provider status codes map to safe error kinds", () => {
  assert.equal(describeStatus(40210, "Insufficient funds").kind, "payment");
  assert.equal(describeStatus(40202, "Rate limit").kind, "rate_limit");
  assert.equal(describeStatus(40501, "Invalid Field: 'x'").kind, "invalid_request");
  assert.equal(describeStatus(50000, "Internal").kind, "provider");
});

test("client rejects unexpected endpoint paths before sending credentials", async () => {
  const { impl, calls } = fakeFetch(() => json({}));
  const client = new DataForSeoClient({ login: LOGIN, password: PASSWORD }, impl);
  await assert.rejects(client.get("../../etc"), DataForSeoError);
  await assert.rejects(client.get("https://evil.example/x"), DataForSeoError);
  assert.equal(calls.length, 0);
});

test("Labs results are normalised, cost-recorded and cached to avoid duplicate charges", async () => {
  const store = new MemoryJsonStore();
  const { impl, calls } = fakeFetch(() =>
    json(
      envelope(
        [
          {
            seed_keyword: "exhibition logistics",
            items: [
              {
                keyword: "exhibition logistics riyadh",
                keyword_info: { search_volume: 90, competition: 0.31, competition_level: "LOW", cpc: 2.1, monthly_searches: [{ year: 2026, month: 9, search_volume: 110 }] },
                keyword_properties: { keyword_difficulty: 12 },
                search_intent_info: { main_intent: "commercial" },
                serp_info: { serp_item_types: ["organic", "local_pack"] },
              },
            ],
          },
        ],
        0.01812,
      ),
    ),
  );
  const service = new DataForSeoService({ env: credentialsEnv, fetchImpl: impl, store });
  const first = await service.runOperation("keyword_suggestions", { keyword: "Exhibition Logistics", limit: 50 });
  assert.equal(first.meta.cached, false);
  assert.equal(first.meta.costUsd, 0.01812);
  assert.equal(first.meta.locationCode, 2682);
  assert.equal(first.meta.locationName, "Saudi Arabia");
  assert.match(first.meta.source, /DataForSEO Labs/);
  assert.ok(first.meta.retrievedAt);
  const data = first.data as { keywords: Array<{ keyword: string; searchVolume: number; keywordDifficulty: number; mainIntent: string }> };
  assert.equal(data.keywords[0].searchVolume, 90);
  assert.equal(data.keywords[0].keywordDifficulty, 12);
  assert.equal(data.keywords[0].mainIntent, "commercial");
  assert.deepEqual(calls[0].body, [
    {
      location_code: 2682,
      language_code: "en",
      keyword: "exhibition logistics",
      limit: 50,
      include_seed_keyword: true,
      include_serp_info: true,
    },
  ]);

  const second = await service.runOperation("keyword_suggestions", { keyword: "exhibition logistics", limit: 50 });
  assert.equal(second.meta.cached, true);
  assert.equal(second.meta.costUsd, 0);
  assert.equal(calls.length, 1, "cached result must not trigger a second paid request");

  const usage = await service.usage();
  assert.equal(usage.paidRequests, 1);
  assert.equal(usage.spentUsd, 0.0181);
  assert.equal(usage.byOperation[0].operation, "keyword_suggestions");
});

test("concurrent identical requests share one paid call", async () => {
  const { impl, calls } = fakeFetch(() => json(envelope([{ items: [] }], 0.012)));
  const service = new DataForSeoService({ env: credentialsEnv, fetchImpl: impl, store: new MemoryJsonStore() });
  await Promise.all([
    service.runOperation("competitors_domain", { limit: 10 }),
    service.runOperation("competitors_domain", { limit: 10 }),
  ]);
  assert.equal(calls.length, 1);
});

test("the monthly budget blocks paid requests before they are sent", async () => {
  const { impl, calls } = fakeFetch(() => json(envelope([])));
  const service = new DataForSeoService({
    env: { ...credentialsEnv, DATAFORSEO_MONTHLY_BUDGET_USD: "0.01" },
    fetchImpl: impl,
    store: new MemoryJsonStore(),
  });
  await assert.rejects(service.runOperation("ranked_keywords", { limit: 100 }), BudgetExceededError);
  const estimate = await service.estimateRankCheck({ locationCodes: [2682] });
  assert.equal(estimate.withinBudget, false);
  await assert.rejects(service.startRankCheck({ locationCodes: [2682] }), BudgetExceededError);
  assert.equal(calls.length, 0);
});

test("SERP normalisation finds ENVOD and competitors including www subdomains", () => {
  const normalized = normalizeSerp(
    serpResult({ "www.fourwinds-ksa.com": 2, "www.envodkingdom.net": 7, "example.com": 1 }),
    { target: "envodkingdom.net", competitors: ["fourwinds-ksa.com", "agility.com"] },
  );
  assert.equal(normalized.position, 7);
  assert.equal(normalized.rankedUrl, "https://www.envodkingdom.net/page");
  assert.deepEqual(normalized.competitors, { "fourwinds-ksa.com": 2, "agility.com": null });
  assert.deepEqual(normalized.serpFeatures, ["organic", "people_also_ask", "local_pack"]);
  assert.equal(normalized.topDomains[0].domain, "www.fourwinds-ksa.com");
});

test("rank checks store history, distribution and position changes", async () => {
  const store = new MemoryJsonStore();
  let time = Date.parse("2026-11-06T09:00:00Z");
  let envodPosition = 14;
  const { impl, calls } = fakeFetch(() =>
    json(envelope([serpResult({ "envodkingdom.net": envodPosition, "fourwinds-ksa.com": 3 })], 0.01)),
  );
  const service = new DataForSeoService({ env: credentialsEnv, fetchImpl: impl, store, now: () => time });
  const keywords = ["customs clearance saudi arabia", "exhibition logistics saudi arabia"];

  const first = await service.startRankCheck({ locationCodes: [2682], keywords, device: "desktop" });
  assert.equal(first.run.totalTasks, 2);
  const finished = await service.continueRankCheck(first.run.id);
  assert.ok(finished.completedAt);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.find((call) => JSON.stringify(call.body).includes("customs"))?.body, [
    { keyword: "customs clearance saudi arabia", location_code: 2682, language_code: "en", device: "desktop", os: "windows", depth: 50 },
  ]);

  time += 13 * 60 * 60 * 1000; // past the 12-hour SERP cache
  envodPosition = 6;
  const second = await service.startRankCheck({ locationCodes: [2682], keywords, device: "desktop" });
  await service.continueRankCheck(second.run.id);

  const history = await service.rankHistory();
  assert.equal(history.rows.length, 2);
  const customs = history.rows.find((row) => row.keyword === "customs clearance saudi arabia");
  assert.equal(customs?.position, 6);
  assert.equal(customs?.previousPosition, 14);
  assert.equal(customs?.change, "improved");
  assert.equal(customs?.delta, 8);
  assert.equal(customs?.series.length, 2);
  assert.equal(history.distribution.tracked, 2);
  assert.equal(history.distribution.top4to10, 2);
  assert.equal(history.distribution.improved, 2);
  assert.equal(history.byLocation[0].locationName, "Saudi Arabia");
  const fourWinds = history.competitors.find((row) => row.domain === "fourwinds-ksa.com");
  assert.equal(fourWinds?.top10, 2);
  assert.equal(fourWinds?.betterThanEnvod, 2);
  assert.match(history.meta?.source ?? "", /SERP API/);
  assert.equal((await service.usage()).spentUsd, 0.04);
});

test("a second rank check cannot start while one is in progress", async () => {
  const service = new DataForSeoService({
    env: credentialsEnv,
    fetchImpl: fakeFetch(() => json(envelope([serpResult({})], 0.01))).impl,
    store: new MemoryJsonStore(),
  });
  await service.startRankCheck({ locationCodes: [2682], keywords: ["envod kingdom"] });
  await assert.rejects(service.startRankCheck({ locationCodes: [2682], keywords: ["envod kingdom"] }), /still in progress/);
});

function adminCookie(email = ADMIN): string {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + 60_000 })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `__Host-envod_gsc_admin=${payload}.${signature}`;
}

async function withServer(
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch,
  run: (base: string) => Promise<void>,
): Promise<void> {
  const app = express();
  app.use("/api/search-console/dataforseo", createDataForSeoRouter({ env, fetchImpl, store: new MemoryJsonStore() }));
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}/api/search-console/dataforseo`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("routes require the administrator session, same-origin mutations and explicit confirmation", async () => {
  const env = { ...credentialsEnv, SESSION_SECRET, GSC_ADMIN_EMAIL: ADMIN } as NodeJS.ProcessEnv;
  const provider = fakeFetch(() => json(envelope([{ money: { balance: 12.5 } }])));
  await withServer(env, provider.impl, async (base) => {
    const anonymous = await fetch(`${base}/status`);
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.headers.get("cache-control"), "no-store");

    const wrongAdmin = await fetch(`${base}/status`, { headers: { Cookie: adminCookie("someone@example.com") } });
    assert.equal(wrongAdmin.status, 401);

    const status = await fetch(`${base}/status`, { headers: { Cookie: adminCookie() } });
    assert.equal(status.status, 200);
    const text = await status.text();
    assert.ok(!text.includes(PASSWORD) && !text.includes(LOGIN));
    assert.equal(JSON.parse(text).connected, true);

    const crossOrigin = await fetch(`${base}/run`, {
      method: "POST",
      headers: { Cookie: adminCookie(), "Content-Type": "application/json", Origin: "https://evil.example" },
      body: JSON.stringify({ operation: "ranked_keywords", params: {}, confirm: true }),
    });
    assert.equal(crossOrigin.status, 403);

    const origin = new URL(base).origin;
    const unconfirmed = await fetch(`${base}/run`, {
      method: "POST",
      headers: { Cookie: adminCookie(), "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ operation: "ranked_keywords", params: {} }),
    });
    assert.equal(unconfirmed.status, 400);

    const invalid = await fetch(`${base}/run`, {
      method: "POST",
      headers: { Cookie: adminCookie(), "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ operation: "ranked_keywords", params: { target: "not a domain" }, confirm: true }),
    });
    assert.equal(invalid.status, 400);
    assert.equal(provider.calls.filter((call) => call.method === "POST").length, 0);
  });
});

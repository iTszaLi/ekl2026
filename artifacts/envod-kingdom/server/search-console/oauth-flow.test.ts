import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { test } from "node:test";
import express from "express";
import { createSearchConsoleRouter } from "./router";
import {
  emptySearchConsoleStore,
  type SearchConsoleStorage,
  type SearchConsoleStore,
} from "./store";

// End-to-end check of the admin sign-in: Google callback -> session cookie ->
// /session -> data request. Google is faked; nothing leaves the machine.

const ADMIN = "admin@envodkingdom.net";

function memoryStore(): SearchConsoleStorage {
  let value: SearchConsoleStore = emptySearchConsoleStore();
  return {
    read: async () => ({ ...value }),
    write: async (next) => { value = { ...next }; },
    clear: async () => { value = emptySearchConsoleStore(); },
  };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function startApp(sitesStatus: number): Promise<{ server: Server; baseUrl: string }> {
  const store = memoryStore();
  const fakeGoogle = (async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url === "https://oauth2.googleapis.com/token") {
      return json(200, {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
        token_type: "Bearer",
        scope: "openid email https://www.googleapis.com/auth/webmasters.readonly",
      });
    }
    if (url === "https://openidconnect.googleapis.com/v1/userinfo") {
      return json(200, { email: ADMIN, email_verified: true });
    }
    if (url.startsWith("https://searchconsole.googleapis.com/webmasters/v3/sites")) {
      return sitesStatus === 200
        ? json(200, { siteEntry: [{ siteUrl: "sc-domain:envodkingdom.net", permissionLevel: "siteOwner" }] })
        : json(sitesStatus, { error: { code: sitesStatus } });
    }
    if (url === "https://oauth2.googleapis.com/revoke") return json(200, {});
    throw new Error(`unexpected request in test: ${url}`);
  }) as typeof fetch;

  const app = express();
  app.use(
    "/api/search-console",
    createSearchConsoleRouter({
      apiPrefix: "/api",
      env: {
        GSC_CLIENT_ID: "test-client-id",
        GSC_CLIENT_SECRET: "test-client-secret",
        GSC_ADMIN_EMAIL: ADMIN,
        SESSION_SECRET: "s".repeat(48),
        GSC_TOKEN_ENCRYPTION_KEY: "k".repeat(48),
        GSC_REDIRECT_URI: "https://www.envodkingdom.net/api/search-console/oauth/callback",
      },
      fetchImpl: fakeGoogle,
      storeFactory: () => store,
    }),
  );
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

function cookiePair(setCookie: string): string {
  return setCookie.split(";")[0];
}

async function signIn(baseUrl: string): Promise<string> {
  const start = await fetch(`${baseUrl}/api/search-console/oauth/start`, { redirect: "manual" });
  assert.equal(start.status, 302);
  const state = new URL(start.headers.get("location") ?? "").searchParams.get("state");
  assert.ok(state);
  const stateCookie = start.headers.getSetCookie().find((c) => c.startsWith("envod_gsc_oauth_state="));
  assert.ok(stateCookie);

  const callback = await fetch(
    `${baseUrl}/api/search-console/oauth/callback?state=${encodeURIComponent(state)}&code=test-code`,
    { redirect: "manual", headers: { Cookie: cookiePair(stateCookie) } },
  );
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get("location"), "/admin/search-console?oauth=connected");
  const sessionCookie = callback.headers.getSetCookie().find((c) => c.startsWith("__Host-envod_gsc_admin="));
  assert.ok(sessionCookie, "the callback must set the admin session cookie");
  assert.match(sessionCookie, /Path=\//);
  assert.match(sessionCookie, /HttpOnly/);
  return cookiePair(sessionCookie);
}

async function stop(server: Server) {
  await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
}

test("Google sign-in sets a session cookie that /session and /properties accept", async () => {
  const { server, baseUrl } = await startApp(200);
  try {
    const cookie = await signIn(baseUrl);
    const session = await fetch(`${baseUrl}/api/search-console/session`, { headers: { Cookie: cookie } });
    assert.deepEqual(
      { ...(await session.json()) as object },
      { configured: true, authenticated: true, connected: true, selectedProperty: null, lastSyncedAt: null },
    );
    const properties = await fetch(`${baseUrl}/api/search-console/properties`, { headers: { Cookie: cookie } });
    assert.equal(properties.status, 200);
  } finally {
    await stop(server);
  }
});

// The dashboard treats HTTP 401 as "signed out" and shows "Sign in to continue".
// A Google-side refusal must not use that status, or a successful sign-in
// loops straight back to the sign-in screen.
for (const googleStatus of [400, 401]) {
  test(`a Google ${googleStatus} after sign-in is not reported as an admin sign-out`, async () => {
    const { server, baseUrl } = await startApp(googleStatus);
    try {
      const cookie = await signIn(baseUrl);
      const properties = await fetch(`${baseUrl}/api/search-console/properties`, { headers: { Cookie: cookie } });
      assert.notEqual(properties.status, 401);
      const body = (await properties.json()) as { code?: string };
      if (googleStatus === 401) {
        assert.equal(properties.status, 409);
        assert.equal(body.code, "google_reconnect_required");
      } else {
        assert.equal(properties.status, 502);
      }
      const session = await fetch(`${baseUrl}/api/search-console/session`, { headers: { Cookie: cookie } });
      assert.equal(((await session.json()) as { authenticated: boolean }).authenticated, true);
    } finally {
      await stop(server);
    }
  });
}

test("without the session cookie the data routes still answer 401", async () => {
  const { server, baseUrl } = await startApp(200);
  try {
    const properties = await fetch(`${baseUrl}/api/search-console/properties`);
    assert.equal(properties.status, 401);
  } finally {
    await stop(server);
  }
});

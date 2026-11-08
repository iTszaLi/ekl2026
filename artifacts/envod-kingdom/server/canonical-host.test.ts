import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const vercelConfig = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
) as {
  redirects?: Array<{
    source?: string;
    destination?: string;
    permanent?: boolean;
    has?: Array<{ type?: string; value?: string }>;
  }>;
};

test("the apex homepage and nested routes redirect to the www canonical host", () => {
  const redirects = vercelConfig.redirects ?? [];
  const apexHostRule = (source: string) =>
    redirects.find((rule) =>
      rule.source === source &&
      rule.has?.some((condition) => condition.type === "host" && condition.value === "envodkingdom.net"),
    );

  const rootRedirect = apexHostRule("/");
  assert.equal(rootRedirect?.destination, "https://www.envodkingdom.net/");
  assert.equal(rootRedirect?.permanent, true);

  const nestedRedirect = apexHostRule("/:path*");
  assert.equal(nestedRedirect?.destination, "https://www.envodkingdom.net/:path*");
  assert.equal(nestedRedirect?.permanent, true);
});

// Owner approved 2026-11-07 (P4). Only the production alias is redirected;
// branch and commit preview hosts must keep serving their own build.
test("the Vercel production alias redirects to www, and no rule redirects preview hosts", () => {
  const redirects = vercelConfig.redirects ?? [];
  const aliasRule = redirects.find((rule) =>
    rule.source === "/:path*" &&
    rule.has?.some((condition) => condition.type === "host" && condition.value === "ekl2026-envod-kingdom.vercel.app"),
  );
  assert.equal(aliasRule?.destination, "https://www.envodkingdom.net/:path*");
  assert.equal(aliasRule?.permanent, true);

  const hostValues = redirects.flatMap((rule) => rule.has ?? []).filter((c) => c.type === "host").map((c) => c.value);
  for (const host of hostValues) {
    assert.ok(host === "envodkingdom.net" || host === "ekl2026-envod-kingdom.vercel.app", `unexpected host redirect: ${host}`);
  }
});

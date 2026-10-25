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

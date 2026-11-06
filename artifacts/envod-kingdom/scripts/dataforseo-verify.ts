/**
 * DataForSEO connection check (server-side, never prints credentials).
 *
 *   pnpm run dataforseo:verify                    # free: authenticates via appendix/user_data
 *   pnpm run dataforseo:verify -- --minimal-paid  # + ONE live Google SERP request (1 keyword, Saudi Arabia, desktop)
 *
 * Credentials are read from the environment (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD),
 * e.g. from a git-ignored `.env.local` loaded with `tsx --env-file`.
 * Results are written to the same private store the dashboard uses
 * (local `.private-data/dataforseo` unless BLOB_READ_WRITE_TOKEN is set).
 */
import { readCredentials } from "../server/dataforseo/client.js";
import { defaultDataForSeoStore } from "../server/dataforseo/router.js";
import { DataForSeoService } from "../server/dataforseo/service.js";

const minimalPaid = process.argv.includes("--minimal-paid");
const keywordArg = process.argv.find((arg) => arg.startsWith("--keyword="))?.slice("--keyword=".length);
const keyword = keywordArg?.trim() || "envod kingdom";

async function main(): Promise<number> {
  const credentials = readCredentials(process.env);
  console.log(`DATAFORSEO_LOGIN:    ${process.env.DATAFORSEO_LOGIN?.trim() ? "set" : "MISSING"}`);
  console.log(`DATAFORSEO_PASSWORD: ${process.env.DATAFORSEO_PASSWORD?.trim() ? "set" : "MISSING"}`);
  if (!credentials) {
    console.log("\nNot Connected — add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD (API password from app.dataforseo.com/api-access).");
    return 1;
  }

  const service = new DataForSeoService({ env: process.env, store: defaultDataForSeoStore(process.env) });
  const status = await service.status(true);
  console.log(`\nConnection:   ${status.connected ? "Connected" : "Not Connected"}`);
  console.log(`Checked at:   ${status.checkedAt}`);
  if (status.error) console.log(`Error:        ${status.error}${status.errorCode ? ` (DataForSEO ${status.errorCode})` : ""}`);
  if (status.account) {
    console.log(`Balance:      ${status.account.balanceUsd === null ? "n/a" : `$${status.account.balanceUsd.toFixed(4)}`}`);
    console.log(`Daily limit:  ${status.account.dailySpendLimitUsd === null ? "not set" : `$${status.account.dailySpendLimitUsd}`}`);
  }
  console.log(`Budget:       $${status.budget.spentUsd.toFixed(4)} spent of $${status.budget.monthlyBudgetUsd.toFixed(2)} (${status.budget.month})`);
  console.log(`Storage:      ${status.storage}`);
  if (!status.connected) return 1;
  if (!minimalPaid) {
    console.log("\nFree check only. Add --minimal-paid to run one live SERP request.");
    return 0;
  }

  const params = { locationCodes: [2682], device: "desktop" as const, keywords: [keyword] };
  const estimate = await service.estimateRankCheck(params);
  console.log(`\nMinimal paid check: "${keyword}" · Saudi Arabia · desktop · depth ${50}`);
  console.log(`Estimate:     $${estimate.estimatedUsd.toFixed(4)} for ${estimate.requests} request(s) — ${estimate.basis}`);
  if (!estimate.withinBudget) {
    console.log("Blocked: estimate exceeds the remaining monthly budget.");
    return 1;
  }
  let { run } = await service.startRankCheck(params);
  while (!run.completedAt) run = await service.continueRankCheck(run.id);

  const history = await service.rankHistory();
  const row = history.rows.find((item) => item.keyword === keyword && item.locationCode === 2682);
  console.log(`Actual cost:  $${run.costUsd.toFixed(4)} (reported by DataForSEO)`);
  if (!row) {
    console.log("No result row was stored.");
    return 1;
  }
  console.log(`Retrieved:    ${row.retrievedAt} · ${row.locationName} · ${row.device}`);
  console.log(`ENVOD:        ${row.status === "error" ? `ERROR — ${row.error}` : row.positionUnconfirmed ? `NOT FOUND (unconfirmed) — ${row.positionNote}` : row.position === null ? `not in top ${row.depth}` : `#${row.position} — ${row.rankedUrl}`}`);
  console.log(`SERP features: ${row.serpFeatures.join(", ") || "none"}`);
  console.log("Top results:");
  for (const item of row.topDomains.slice(0, 10)) {
    console.log(`  #${item.position} ${item.domain}${item.title ? ` — ${item.title.slice(0, 70)}` : ""}${item.breadcrumb ? ` [${item.breadcrumb.slice(0, 60)}]` : ""}`);
  }
  if (row.unresolvedResults) console.log(`Unresolved destinations: ${row.unresolvedResults} of ${row.organicResults}`);
  return 0;
}

main().then(
  (code) => { process.exitCode = code; },
  (error: unknown) => {
    // Error messages from the client never contain credentials.
    console.error(`Failed: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  },
);

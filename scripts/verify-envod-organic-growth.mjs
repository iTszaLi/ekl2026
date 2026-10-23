import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:25185";
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) throw new Error("Local production server required");
const browser = await chromium.launch({
  executablePath: process.env.TEST_BROWSER_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({ viewport: { width: 402, height: 874 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
try {
  const explorer = pathToFileURL(resolve("generated-artifacts/envod-organic-growth/keyword-explorer.html")).href;
  await page.goto(explorer);
  await page.getByRole("status").filter({ hasText: "149 of 149" }).waitFor();
  await page.getByLabel("Language / اللغة", { exact: true }).selectOption("ar");
  assert.match(await page.getByRole("status").textContent(), /^63 of 149/);
  await page.getByLabel("Search / ابحث", { exact: true }).fill("دينا");
  assert.match(await page.getByRole("status").textContent(), /^4 of 149/);
  const downloadReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export filtered CSV" }).click();
  const csv = await readFile(await (await downloadReady).path(), "utf8");
  assert(csv.includes("actual_ranking_competitors") && csv.includes("دينا"));
  assert.equal(csv.trim().split(/\r?\n/).length, 5);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByLabel("Search / ابحث", { exact: true }).fill("no-such-keyword-987");
  assert.match(await page.getByRole("status").textContent(), /^0 of 149/);
  await page.getByRole("button", { name: "Reset filters" }).click();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: "/tmp/envod-keyword-explorer-mobile.png" });

  for (const language of ["en", "ar"]) {
    const prefix = language === "ar" ? "/ar" : "";
    await page.goto(origin + prefix + "/services/ocean-freight#fcl-lcl-comparison");
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => {
      const rect = document.getElementById("fcl-lcl-comparison")?.getBoundingClientRect();
      return rect && rect.top >= 50 && rect.top < 180;
    });
    assert.equal(await page.locator("#fcl-lcl-comparison tbody tr").count(), 4);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `/tmp/envod-fcl-lcl-${language}-mobile.png` });
    const related = page.locator('nav[aria-label]').filter({
      has: page.locator(`a[href="${prefix}/services/customs-clearance#shipment-preparation"]`),
    });
    await related.locator("a").first().click();
    await page.waitForURL(`**${prefix}/services/customs-clearance#shipment-preparation`);
    await page.waitForFunction(() => {
      const rect = document.getElementById("shipment-preparation")?.getBoundingClientRect();
      return rect && rect.top >= 50 && rect.top < 180;
    });
    for (const slug of ["project-cargo", "temperature-controlled-logistics"]) {
      await page.goto(origin + prefix + "/services/" + slug + "#shipment-preparation");
      await page.locator("#shipment-preparation h2").waitFor();
      assert.equal(await page.locator("#shipment-preparation ul > li").count(), 3);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
  }
  assert.deepEqual(errors, []);
  console.log("PASS: searchable explorer EN/AR filters, empty/reset states, filtered CSV download; FCL/LCL EN/AR mobile tables, direct fragments, client-side related-guide fragments, new checklists and no JS errors. No email or outreach sent.");
} finally {
  await browser.close();
}

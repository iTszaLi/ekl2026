// Local production-only checks. No form submission or provider request.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:25185";
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) throw new Error("Local test server required");
const browser = await chromium.launch({
  executablePath: process.env.TEST_BROWSER_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
try {
  for (const language of ["en", "ar"]) {
    const prefix = language === "ar" ? "/ar" : "";
    const context = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}${prefix}/services/exhibition-logistics`);
    const image = page.locator('img[fetchpriority="high"][srcset]');
    await image.evaluate(async (node) => { await node.decode(); });
    const photo = await image.evaluate((node) => ({
      current: node.currentSrc, fallback: node.getAttribute("src"),
      width: node.getAttribute("width"), height: node.getAttribute("height"),
      priority: node.fetchPriority, loading: node.loading,
    }));
    assert(photo.current.includes("exhibition_hero_1024"), photo.current);
    assert(photo.fallback.includes("image_1783173229953"), photo.fallback);
    assert.equal(photo.width, "1536");
    assert.equal(photo.height, "1024");
    assert.equal(photo.priority, "high");
    assert.equal(photo.loading, "eager");
    assert.equal(await page.locator("html").getAttribute("lang"), language);
    assert.equal(await page.locator("html").getAttribute("dir"), language === "ar" ? "rtl" : "ltr");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const footerLogo = page.locator('img[alt="ENVOD KINGDOM Shipping Services LLC"]');
    const dimensions = await footerLogo.evaluate((node) => ({
      width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height,
    }));
    assert(Math.abs(dimensions.height - 56) < 1, JSON.stringify(dimensions));
    assert(dimensions.width < 400, JSON.stringify(dimensions));
    assert.deepEqual(errors, []);
    await context.close();
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(`${origin}${prefix}/services/exhibition-logistics`);
    assert(await staticPage.locator("h1").isVisible());
    assert(await staticPage.locator("#shipment-preparation").isVisible());
    assert((await staticPage.locator("#shipment-preparation").innerText()).length > 100);
    await noJs.close();
  }
  const retina = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 });
  const page = await retina.newPage();
  await page.goto(`${origin}/services/exhibition-logistics`);
  const image = page.locator('img[fetchpriority="high"][srcset]');
  await image.evaluate(async (node) => { await node.decode(); });
  assert((await image.evaluate((node) => node.currentSrc)).includes("image_1783173229953"));
  await retina.close();
  console.log("PASS: EN/AR responsive hero selection, unchanged original fallback/high-DPI photo, intrinsic dimensions, footer size, mobile width and no-JS content. No emails sent.");
} finally { await browser.close(); }

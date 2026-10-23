// Small, reproducible local lab sample. This is not a production CWV assessment.
import { writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:25185";
if (!/^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin)) throw new Error("Local test server required");
const browser = await chromium.launch({
  executablePath: process.env.TEST_BROWSER_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
const samples = [];
const repeat = Number(process.env.PERF_SAMPLE_COUNT || 1);
if (!Number.isInteger(repeat) || repeat < 1 || repeat > 5) throw new Error("Use 1–5 cold samples per page");
const output = process.env.PERF_OUTPUT || "docs/seo-research/performance-lab-sample.json";
try {
  for (const path of ["/contact", "/services/exhibition-logistics"]) {
    for (let sample = 1; sample <= repeat; sample++) {
    const context = await browser.newContext({ viewport: { width: 402, height: 874 } });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", {
      offline: false, latency: 40, downloadThroughput: 200000, uploadThroughput: 100000,
    });
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__lab = { lcp: null, lcpElement: null, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lab.lcp = entry.startTime;
          window.__lab.lcpElement = entry.element ? {
            tag: entry.element.tagName,
            text: entry.element.textContent?.trim().slice(0, 160),
            image_path: entry.element.currentSrc ? new URL(entry.element.currentSrc).pathname : null,
          } : null;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lab.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(origin + path, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3500);
    samples.push(await page.evaluate((path) => ({
      path,
      lcp_ms: window.__lab.lcp,
      lcp_element: window.__lab.lcpElement,
      cls_sample: window.__lab.cls,
      script_resources: performance.getEntriesByType("resource").filter((entry) => entry.initiatorType === "script")
        .map((entry) => ({ name: new URL(entry.name).pathname, encoded_body_bytes: entry.encodedBodySize })),
      note: "Local cold-context lab sample; no field p75, production network, or INP result.",
    }), path));
    samples.at(-1).sample = sample;
    await context.close();
    }
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();
  await page.goto(origin + "/services/customs-clearance");
  if (!await page.locator("h1").isVisible()) throw new Error("Critical service H1 hidden without JavaScript");
  if (!await page.getByRole("heading", { name: "Prepare your Saudi customs clearance enquiry" }).isVisible()) {
    throw new Error("Service preparation content hidden without JavaScript");
  }
  await noJs.close();
  const report = {
    measured_at: new Date().toISOString(),
    settings: { viewport: "402x874", latency_ms: 40, download_bytes_per_second: 200000, cpu_slowdown: 4, cold_samples_per_page: repeat },
    inp: "Not measured; field interaction data is unavailable",
    no_javascript_service_content_check: "passed",
    samples,
  };
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}

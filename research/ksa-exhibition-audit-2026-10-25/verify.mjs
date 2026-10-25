// Local-only evidence generation; no API submissions, secrets or deployments.
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const reportDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(reportDir, "../..");
const dist = path.join(root, "artifacts/envod-kingdom/dist/public");
const output = path.join(root, "generated-artifacts/ksa-exhibition-audit");
await fs.mkdir(output, { recursive: true });
const sitemap = await fs.readFile(path.join(dist, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.equal(urls.length, 92);
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const text = (value) => value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const rows = [];
const brokenAssets = new Set();
const internalDestinations = new Set();
for (const url of urls) {
  const route = new URL(url).pathname;
  const html = await fs.readFile(path.join(dist, route, "index.html"), "utf8");
  const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map((m) => attributes(m[0]));
  const title = text(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "");
  const description = tags.find((tag) => tag.name === "description")?.content ?? "";
  const canonical = tags.find((tag) => tag.rel === "canonical")?.href;
  const hreflang = tags.filter((tag) => tag.hreflang).map((tag) => tag.hreflang);
  const headings = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map((m) => text(m[1]));
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  assert.ok(title && description, `metadata missing: ${route}`);
  assert.equal(canonical, url);
  assert.equal(headings.length, 1, `H1 count: ${route}`);
  for (const lang of ["en-SA", "ar-SA", "x-default"]) assert.ok(hreflang.includes(lang));
  for (const m of html.matchAll(/\b(?:src|poster)="(\/[^"]+)"/g)) {
    if (m[1].startsWith("//")) continue;
    const local = new URL(m[1], url).pathname;
    try { await fs.access(path.join(dist, decodeURIComponent(local))); } catch { brokenAssets.add(local); }
  }
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (m[1].startsWith("/") && !m[1].startsWith("//")) internalDestinations.add(new URL(m[1].replaceAll("&amp;", "&"), url).pathname);
  }
  rows.push({ route, title, description, h1: headings[0], canonical, hreflang: hreflang.join("|"), schemaCount: schemas.length });
}
const routes = new Set(rows.map((row) => row.route));
const nonSitemapLinks = [...internalDestinations].filter((route) => !routes.has(route));
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const headers = Object.keys(rows[0]);
await fs.writeFile(path.join(reportDir, "route-inventory.csv"), "\uFEFF" + [headers.join(","), ...rows.map((row) => headers.map((key) => quote(row[key])).join(","))].join("\r\n"));
assert.equal(brokenAssets.size, 0, `missing assets: ${[...brokenAssets]}`);
console.log(JSON.stringify({ routeCount: rows.length, metadataAndSchemaPass: true, brokenAssets: [...brokenAssets], nonSitemapLinks }, null, 2));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = spawn("python3", ["-m", "http.server", "5367", "--bind", "127.0.0.1", "--directory", dist], { stdio: "ignore" });
const browser = spawn("/repl/tools/bin/chromium", ["--headless", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=9462", "--user-data-dir=/tmp/ekl2026-ksa-browser"], { stdio: "ignore" });
let socket;
const browserResults = [];
try {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await fetch("http://127.0.0.1:9462/json/version");
      await fetch("http://127.0.0.1:5367/");
      break;
    } catch { await delay(250); }
  }
  const target = await (await fetch("http://127.0.0.1:9462/json/new?about:blank", { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const exceptions = [];
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    if (event.id) {
      const callbacks = pending.get(event.id);
      if (!callbacks) return;
      pending.delete(event.id);
      event.error ? callbacks.reject(new Error(JSON.stringify(event.error))) : callbacks.resolve(event.result);
    } else if (event.method === "Runtime.exceptionThrown") exceptions.push(event.params.exceptionDetails.text);
  };
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
  await command("Page.enable");
  await command("Runtime.enable");
  for (const language of ["en", "ar"]) {
    for (const width of [1440, 390]) {
      const route = `${language === "ar" ? "/ar" : ""}/services/exhibition-logistics`;
      await command("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
      await command("Page.navigate", { url: `http://127.0.0.1:5367${route}/` });
      await delay(2500);
      await command("Runtime.evaluate", { expression: `document.getElementById("exhibition-logistics-quote-checklist").scrollIntoView({block:"start"})` });
      await delay(300);
      const result = await command("Runtime.evaluate", { returnByValue: true, expression: `JSON.stringify({
        lang:document.documentElement.lang,dir:document.documentElement.dir,
        width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
        heading:document.querySelector("#exhibition-logistics-quote-checklist h2")?.textContent,
        headingTop:document.querySelector("#exhibition-logistics-quote-checklist h2").getBoundingClientRect().top,
        headerBottom:document.querySelector("header")?.getBoundingClientRect().bottom??0,
        bulletIconX:document.querySelector("#exhibition-logistics-quote-checklist li svg").getBoundingClientRect().x,
        bulletTextX:document.querySelector("#exhibition-logistics-quote-checklist li span").getBoundingClientRect().x,
        bulletCount:document.querySelectorAll("#exhibition-logistics-quote-checklist li").length,
        references:[...document.querySelectorAll('[data-testid^="link-pillar-reference-"]')].map(a=>({href:a.href,text:a.textContent,rel:a.rel,target:a.target})),
        packaging:[...document.querySelectorAll("a")].some(a=>a.getAttribute("href")?.includes("/services/packaging-crating"))
      })` });
      const data = JSON.parse(result.result.value);
      assert.equal(data.lang, language);
      assert.equal(data.references.length, 3);
      assert.equal(data.bulletCount, 6); // five checklist items plus one official reference
      assert.ok(data.packaging);
      assert.ok(data.headingTop >= data.headerBottom, `heading hidden by header: ${language}/${width}`);
      assert.ok(language === "ar" ? data.bulletIconX > data.bulletTextX : data.bulletIconX < data.bulletTextX, "bullet icon must follow the language reading direction");
      assert.ok(data.scrollWidth <= data.width + 1, `horizontal overflow: ${language}/${width}`);
      assert.ok(data.references.every((ref) => ref.target === "_blank" && ref.rel.includes("noopener")));
      if (language === "ar") assert.equal(data.dir, "rtl");
      const screenshot = await command("Page.captureScreenshot", { format: "png" });
      await fs.writeFile(path.join(output, `quote-checklist-${language}-${width}.png`), Buffer.from(screenshot.data, "base64"));
      browserResults.push({ language, viewport: width, ...data });
    }
  }
  assert.equal(exceptions.length, 0);
  await fs.writeFile(path.join(reportDir, "qa-results.json"), JSON.stringify({ routeCount: rows.length, brokenAssets: [...brokenAssets], nonSitemapLinks, browserResults, runtimeExceptions: exceptions }, null, 2));
  console.log("PASS: four EN/AR desktop/mobile browser cases; no runtime exceptions or horizontal overflow. Screenshots: " + output);
} finally {
  socket?.close();
  server.kill();
  browser.kill();
}

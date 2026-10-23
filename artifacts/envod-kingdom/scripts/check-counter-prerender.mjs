import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "dist", "public");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readTestId(html, testId) {
  const escaped = testId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`<([a-z][a-z0-9]*)[^>]*data-testid="${escaped}"[^>]*>([\\s\\S]*?)<\\/\\1>`, "i"),
  );
  return (
    match?.[2]
      ?.replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim() ?? null
  );
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function readHtml(relativePath) {
  try {
    return await readFile(path.join(PUBLIC_DIR, relativePath), "utf8");
  } catch {
    throw new Error(
      `Missing prerendered page ${relativePath}; run the artifact build first.`,
    );
  }
}

function assertTestIds(html, relativePath, expected) {
  for (const [testId, value] of Object.entries(expected)) {
    const actual = readTestId(html, testId);
    assert(
      actual === value,
      `${relativePath}: ${testId} expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`,
    );
  }
}

const homeEnglish = await readHtml("index.html");
const homeArabic = await readHtml("ar/index.html");
const servicesEnglish = await readHtml("services/index.html");
const servicesArabic = await readHtml("ar/services/index.html");

assertTestIds(homeEnglish, "index.html", {
  "text-company-stat-1": "Shipment Coordination",
  "text-company-stat-2": "Business Logistics Support",
  "text-company-stat-3": "Worldwide Freight Options",
  "text-company-stat-4": "98% On-Time Delivery Rate",
  "text-company-stat-5": "25+ Years of Excellence",
  "text-company-stat-6": "Customs Documentation Support",
  "text-trust-stat-2": "50+ Fleet Vehicles",
  "text-trust-stat-3": "25+ Years Experience",
  "text-trust-stat-4": "100% Shipment Tracking Support",
  "text-trust-stat-5": "24/7 Customer Support",
  "text-trust-stat-6": "98% On-Time Delivery",
});

assertTestIds(homeArabic, "ar/index.html", {
  "text-company-stat-4": "98% نسبة التسليم في الموعد",
  "text-company-stat-5": "25+ عاماً من التميز",
  "text-trust-stat-2": "50+ مركبة في الأسطول",
  "text-trust-stat-3": "25+ عاماً من الخبرة",
  "text-trust-stat-4": "100% دعم تحديث حالة الشحنات",
  "text-trust-stat-5": "24/7 دعم العملاء",
  "text-trust-stat-6": "98% نسبة التسليم في الموعد",
});

const serviceMetricIds = ["fleet", "tracking", "support", "on-time"];
const serviceEnglishValues = [
  "50+ Fleet vehicles",
  "100% Shipment tracking coordination",
  "24/7 Customer support",
  "98% On-time delivery",
];
const serviceArabicValues = [
  "50+ مركبة ضمن الأسطول",
  "100% تنسيق تتبع الشحنات",
  "24/7 دعم العملاء",
  "98% التسليم في الموعد",
];

assertTestIds(
  servicesEnglish,
  "services/index.html",
  Object.fromEntries(
    serviceMetricIds.map((metric, index) => [
      `text-stat-${metric}`,
      serviceEnglishValues[index],
    ]),
  ),
);

assertTestIds(
  servicesArabic,
  "ar/services/index.html",
  Object.fromEntries(
    serviceMetricIds.map((metric, index) => [
      `text-stat-${metric}`,
      serviceArabicValues[index],
    ]),
  ),
);

const exhibitionText = visibleText(servicesEnglish);
for (const phrase of [
  "25+ Years Supporting Exhibitions",
  "500+ Events Coordinated",
  "24hr ATA Carnet Processing",
  "GCC Wide Event Coverage",
]) {
  assert(exhibitionText.includes(phrase), `services/index.html is missing "${phrase}"`);
}

const htmlFiles = [];
async function collectHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectHtml(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}
await collectHtml(PUBLIC_DIR);

const unsafeFallbackPatterns = [
  /\b0\s*\+\s*(?:Shipments Delivered|Corporate Clients|Countries Served)\b/i,
  /\b0\.0\s*%\s*On-Time Delivery(?: Rate)?\b/i,
  /\b0\s*(?:hr|hours?)\s*Customs Clearance\b/i,
  /\b0\s*\/\s*7\s*Operations\b/i,
];
const blockedReviewCopyPatterns = [
  /\b10,000\s*\+\s*Shipments Delivered\b/i,
  /\b500\s*\+\s*Corporate Clients\b/i,
  /\b50\s*\+\s*Countries Served\b/i,
  /\b99\.(?:8|9)\s*%\s*On-Time Delivery(?: Rate)?\b/i,
  /\b(?:50|80)\s*\+\s*countries\b/i,
];

for (const fullPath of htmlFiles) {
  const html = await readFile(fullPath, "utf8");
  const text = visibleText(html);
  for (const pattern of unsafeFallbackPatterns) {
    assert(
      !pattern.test(text),
      `${path.relative(PUBLIC_DIR, fullPath)} contains a zero-valued or placeholder metric matching ${pattern}`,
    );
  }
  for (const pattern of blockedReviewCopyPatterns) {
    assert(
      !pattern.test(text),
      `${path.relative(PUBLIC_DIR, fullPath)} contains an unsupported or superseded metric matching ${pattern}`,
    );
  }
}

console.log(
  `Counter prerender check passed: English/Arabic home and services metrics are present; no unsafe zero placeholders or blocked metrics found in ${htmlFiles.length} prerendered HTML files.`,
);

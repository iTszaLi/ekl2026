import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/public");

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }

  return files;
}

function attribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return tag.match(new RegExp(`\\b${escapedName}=(["'])(.*?)\\1`, "i"))?.[2] ?? null;
}

const htmlFiles = await findHtmlFiles(publicDir);
if (htmlFiles.length === 0) {
  throw new Error(`No prerendered HTML found in ${publicDir}; run the production build first.`);
}

let imageCount = 0;
let sizedCount = 0;
let fixedInlineLogoCount = 0;
const failures = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];

  for (const tag of imageTags) {
    imageCount += 1;
    if (attribute(tag, "alt") === null) {
      failures.push(`${path.relative(publicDir, file)}: <img> has no alt attribute`);
      continue;
    }

    const width = Number(attribute(tag, "width"));
    const height = Number(attribute(tag, "height"));
    if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
      sizedCount += 1;
      continue;
    }

    const src = attribute(tag, "src") ?? "";
    const className = attribute(tag, "class") ?? "";
    if (src.startsWith("data:image/") && className.includes("max-h-8") && className.includes("max-w-full")) {
      fixedInlineLogoCount += 1;
      continue;
    }

    failures.push(`${path.relative(publicDir, file)}: missing intrinsic dimensions for ${src.slice(0, 140) || "(no src)"}`);
  }
}

console.log(`Prerendered pages: ${htmlFiles.length}`);
console.log(`Images with explicit intrinsic dimensions: ${sizedCount}/${imageCount}`);
console.log(`Inline client-logo images in fixed-size frames: ${fixedInlineLogoCount}`);

if (failures.length > 0) {
  console.error(`Image markup issues (${failures.length}):`);
  for (const failure of failures.slice(0, 30)) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("PASS: every image has alt markup; every non-inline image has measured width and height.");
}

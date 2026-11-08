/**
 * Small URL helpers shared by the client shell and the SEO config. They live
 * apart from seo-config.ts so the first page load does not have to download
 * every page's SEO data (seo-config imports all service, industry, gallery and
 * Vision 2030 content). seo-config.ts re-exports them unchanged.
 */

/** Canonical production origin. Single source of truth for absolute URLs. */
export const SITE_URL = "https://www.envodkingdom.net";
export const OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

export function toAbsolute(pathOrUrl?: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function normalizeRoutePath(path: string): string {
  let out = (path || "/").split("?")[0].split("#")[0];
  if (!out.startsWith("/")) out = `/${out}`;
  if (out.length > 1) out = out.replace(/\/+$/, "");
  return out || "/";
}

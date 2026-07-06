import { useEffect } from "react";
import { SITE_URL } from "./seo-config";

interface MetaTag {
  attr: "name" | "property";
  key: string;
  content: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  /** Absolute or root-relative canonical path, e.g. "/gallery". */
  canonicalPath?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  /** One or more JSON-LD objects injected as <script type="application/ld+json">. */
  jsonLd?: Array<Record<string, unknown>>;
}

const MANAGED = "data-seo-managed";
const PRERENDERED = "data-seo-ssg";

function upsertMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Build an absolute canonical URL from SITE_URL (never the runtime origin). */
function absoluteCanonical(canonicalPath?: string): string {
  const cp =
    canonicalPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  if (cp.startsWith("http")) return cp;
  return `${SITE_URL}${cp.startsWith("/") ? "" : "/"}${cp}`;
}

/**
 * Imperatively manage document <head> SEO tags. No external dependency.
 * Canonical URLs are always built from SITE_URL (not window.location.origin,
 * which is wrong on preview / non-custom domains). On mount it drops the
 * per-page JSON-LD the build-time prerenderer injected (tagged data-seo-ssg) so
 * client rendering and SPA navigation never duplicate or leave stale schema.
 */
export function useSeo(config: SeoConfig): void {
  const { title, description, canonicalPath, image, imageAlt, type = "website", jsonLd } = config;

  useEffect(() => {
    document
      .querySelectorAll(`script[type="application/ld+json"][${PRERENDERED}]`)
      .forEach((s) => s.remove());

    const canonicalUrl = absoluteCanonical(canonicalPath);

    const previousTitle = document.title;
    document.title = title;

    const metas: MetaTag[] = [
      { attr: "name", key: "description", content: description },
      { attr: "property", key: "og:title", content: title },
      { attr: "property", key: "og:description", content: description },
      { attr: "property", key: "og:type", content: type },
      { attr: "property", key: "og:url", content: canonicalUrl },
      { attr: "name", key: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { attr: "name", key: "twitter:title", content: title },
      { attr: "name", key: "twitter:description", content: description },
    ];
    if (image) {
      metas.push({ attr: "property", key: "og:image", content: image });
      metas.push({ attr: "name", key: "twitter:image", content: image });
      if (imageAlt) metas.push({ attr: "property", key: "og:image:alt", content: imageAlt });
    }

    for (const m of metas) upsertMeta(m.attr, m.key, m.content);
    upsertCanonical(canonicalUrl);

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd && jsonLd.length) {
      for (const obj of jsonLd) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute(MANAGED, "true");
        script.text = JSON.stringify(obj);
        document.head.appendChild(script);
        scripts.push(script);
      }
    }

    return () => {
      for (const s of scripts) s.remove();
      document.title = previousTitle;
    };
  }, [title, description, canonicalPath, image, imageAlt, type, JSON.stringify(jsonLd)]);
}

/**
 * Append page-specific JSON-LD (e.g. a dynamic ImageGallery) as managed scripts
 * without touching title/meta/canonical. Use together with useSeo / SeoManager.
 * Scripts are removed on unmount.
 */
export function useJsonLd(objects?: Array<Record<string, unknown>>): void {
  const serialized = JSON.stringify(objects ?? []);
  useEffect(() => {
    const list: Array<Record<string, unknown>> = JSON.parse(serialized);
    if (!list.length) return;
    const scripts = list.map((obj) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute(MANAGED, "true");
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    });
    return () => {
      for (const s of scripts) s.remove();
    };
  }, [serialized]);
}

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSeo } from "@/lib/seo";
import { normalizeRoutePath } from "@/lib/seo-paths";

type GetSeoForPath = typeof import("@/lib/seo-config").getSeoForPath;

// seo-config.ts imports every service, industry, gallery and Vision 2030 entry
// in both languages, so it is loaded on demand instead of with every page.
let loadedGetSeo: GetSeoForPath | undefined;
let loadingGetSeo: Promise<GetSeoForPath> | undefined;
function loadGetSeo(): Promise<GetSeoForPath> {
  return (loadingGetSeo ??= import("@/lib/seo-config").then((m) => {
    loadedGetSeo = m.getSeoForPath;
    return m.getSeoForPath;
  }));
}

/**
 * True when the HTML was prerendered for this exact route (prerender.mjs sets
 * data-ssr-path and tags its JSON-LD with data-seo-ssg), so its <head> is
 * already correct. Any other HTML, such as the spa.html shell or a fallback
 * page served for a different path, gets its tags from getSeoForPath().
 */
function hasPrerenderedHeadForCurrentUrl(): boolean {
  if (typeof document === "undefined") return false;
  const ssrPath = document.getElementById("root")?.getAttribute("data-ssr-path");
  // Same comparison as main.tsx: the full browser path minus the deploy base.
  // (wouter's location omits the /ar locale base, so it cannot be used here.)
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let currentPath = window.location.pathname;
  if (base && currentPath.startsWith(base)) currentPath = currentPath.slice(base.length);
  return (
    ssrPath != null &&
    normalizeRoutePath(ssrPath) === normalizeRoutePath(currentPath) &&
    document.querySelector('script[type="application/ld+json"][data-seo-ssg]') !== null
  );
}

/**
 * Centralized SEO head manager. Reads the current route and applies the exact
 * same getSeoForPath() config the build-time prerenderer uses, so
 * server-rendered and client-navigated <head> tags stay identical (single
 * source of truth). Pages needing extra dynamic structured data can add it with
 * useJsonLd. Renders nothing.
 *
 * A prerendered page already carries the correct tags for its first route, so
 * the config is only downloaded once the visitor navigates or switches
 * language (or straight away on pages without prerendered tags).
 */
export function SeoManager() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const routeKey = `${language}|${location}`;
  const firstRouteKey = useRef(routeKey);
  const [getSeo, setGetSeo] = useState<GetSeoForPath | undefined>(() => loadedGetSeo);

  useEffect(() => {
    if (getSeo) return;
    if (routeKey === firstRouteKey.current && hasPrerenderedHeadForCurrentUrl()) return;
    let cancelled = false;
    void loadGetSeo().then((fn) => {
      if (!cancelled) setGetSeo(() => fn);
    });
    return () => {
      cancelled = true;
    };
  }, [getSeo, routeKey]);

  useSeo(getSeo ? getSeo(location, language) : null);
  return null;
}

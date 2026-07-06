import { useLocation } from "wouter";
import { useSeo } from "@/lib/seo";
import { getSeoForPath } from "@/lib/seo-config";

/**
 * Centralized SEO head manager. Reads the current route and applies the exact
 * same getSeoForPath() config the build-time prerenderer uses, so
 * server-rendered and client-navigated <head> tags stay identical (single
 * source of truth). Pages needing extra dynamic structured data can add it with
 * useJsonLd. Renders nothing.
 */
export function SeoManager() {
  const [location] = useLocation();
  useSeo(getSeoForPath(location));
  return null;
}

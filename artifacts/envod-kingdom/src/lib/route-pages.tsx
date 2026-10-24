import { createElement, lazy, Suspense, type ComponentType } from "react";

function loadPage<Props extends object>(loader: () => Promise<{ default: ComponentType<Props> }>) {
  let resolved: ComponentType<Props> | undefined;
  let loading: Promise<void> | undefined;
  const preload = () => loading ??= loader().then((module) => { resolved = module.default; });
  const LazyPage = lazy(async () => {
    await preload();
    return { default: resolved! };
  });
  function Page(props: Props) {
    if (resolved) return createElement(resolved, props);
    return (
      <Suspense fallback={<div role="status" aria-live="polite" className="container mx-auto min-h-[50vh] px-4 py-24 text-white/70">Loading… / جارٍ التحميل…</div>}>
        <LazyPage {...props} />
      </Suspense>
    );
  }
  return { Page, preload };
}

export const routePages = {
  home: loadPage(() => import("../pages/home")),
  track: loadPage(() => import("../pages/track")),
  services: loadPage(() => import("../pages/services")),
  service: loadPage(() => import("../pages/service-detail")),
  industries: loadPage(() => import("../pages/industries")),
  industry: loadPage(() => import("../pages/industry-detail")),
  vision: loadPage(() => import("../pages/vision-2030")),
  about: loadPage(() => import("../pages/about")),
  gallery: loadPage(() => import("../pages/gallery/index")),
  contact: loadPage(() => import("../pages/contact")),
  legal: loadPage<{ page: "privacy" | "terms" | "cookies" }>(() => import("../pages/legal")),
  notFound: loadPage(() => import("../pages/not-found")),
};

/** Preload the initial page before SSR or hydration, preserving identical full HTML. */
export async function preloadRoute(path: string): Promise<void> {
  const route = path.split(/[?#]/)[0].replace(/^\/ar(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  const page = route === "/" ? routePages.home
    : route === "/services" ? routePages.services
    : route.startsWith("/services/") ? routePages.service
    : route === "/industries" ? routePages.industries
    : route.startsWith("/industries/") ? routePages.industry
    : route === "/vision-2030" ? routePages.vision
    : route === "/about" ? routePages.about
    : route === "/contact" ? routePages.contact
    : route === "/privacy-policy" || route === "/terms-and-conditions" || route === "/cookie-notice" ? routePages.legal
    : route === "/track" ? routePages.track
    : route === "/gallery" || route.startsWith("/blog") ? routePages.gallery
    : routePages.notFound;
  await page.preload();
}

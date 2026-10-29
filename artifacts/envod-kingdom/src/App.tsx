import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { routePages } from "@/lib/route-pages";
import { getLocaleBase, LanguageProvider } from "@/lib/language-context";
import { MainLayout } from "@/components/layout/MainLayout";
import { SeoManager } from "@/components/SeoManager";

const SearchConsoleDashboard = lazy(
  () => import("@/pages/admin/SearchConsoleDashboard"),
);

const Home = routePages.home.Page;
const Track = routePages.track.Page;
const Services = routePages.services.Page;
const Contact = routePages.contact.Page;
const About = routePages.about.Page;
const Gallery = routePages.gallery.Page;
const ServiceDetail = routePages.service.Page;
const Industries = routePages.industries.Page;
const IndustryDetail = routePages.industry.Page;
const Vision2030 = routePages.vision.Page;
const Legal = routePages.legal.Page;
const NotFound = routePages.notFound.Page;

import { RouteScrollRestoration } from "@/components/RouteScrollRestoration";
function ScrollToTop() {
  const [location] = useLocation();
  return <RouteScrollRestoration location={location} />;
}

function AdminRouteLoading() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f3f6fb] p-6 text-[#142238]"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm font-medium">Loading the private Search Console dashboard…</p>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout><Home /></MainLayout>
      </Route>
      <Route path="/track">
        <MainLayout><Track /></MainLayout>
      </Route>
      <Route path="/services">
        <MainLayout><Services /></MainLayout>
      </Route>
      <Route path="/services/:slug">
        <MainLayout><ServiceDetail /></MainLayout>
      </Route>
      <Route path="/industries">
        <MainLayout><Industries /></MainLayout>
      </Route>
      <Route path="/industries/:slug">
        <MainLayout><IndustryDetail /></MainLayout>
      </Route>
      <Route path="/vision-2030">
        <MainLayout><Vision2030 /></MainLayout>
      </Route>
      <Route path="/about">
        <MainLayout><About /></MainLayout>
      </Route>
      <Route path="/gallery">
        <MainLayout><Gallery /></MainLayout>
      </Route>
      <Route path="/blog"><Redirect to="/gallery" /></Route>
      <Route path="/blog/:slug"><Redirect to="/gallery" /></Route>
      <Route path="/contact">
        <MainLayout><Contact /></MainLayout>
      </Route>
      <Route path="/privacy-policy">
        <MainLayout><Legal page="privacy" /></MainLayout>
      </Route>
      <Route path="/terms-and-conditions">
        <MainLayout><Legal page="terms" /></MainLayout>
      </Route>
      <Route path="/cookie-notice">
        <MainLayout><Legal page="cookies" /></MainLayout>
      </Route>
      <Route path="/admin/search-console">
        <Suspense fallback={<AdminRouteLoading />}>
          <SearchConsoleDashboard />
        </Suspense>
      </Route>
      <Route>
        <MainLayout><NotFound /></MainLayout>
      </Route>
    </Switch>
  );
}

function App({ ssrPath }: { ssrPath?: string }) {
  const initialPath =
    ssrPath ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const initialLanguage = /^\/ar(?:\/|$)/.test(initialPath) ? "ar" : "en";
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (
      reducedMotion !== false ||
      window.matchMedia("(max-width: 767px)").matches
    ) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    void import("@/lib/scroll-engine").then((m) => {
      if (cancelled) return;
      m.initScrollEngine();
      destroy = m.destroyScrollEngine;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [reducedMotion]);

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <Analytics />
      <WouterRouter base={getLocaleBase(initialLanguage)} ssrPath={ssrPath}>
        <ScrollToTop />
        <SeoManager />
        <Router />
      </WouterRouter>
      <Toaster />
    </LanguageProvider>
  );
}

export default App;

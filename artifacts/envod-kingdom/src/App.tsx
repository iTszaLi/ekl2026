import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/lib/language-context";
import { MainLayout } from "@/components/layout/MainLayout";
import { SeoManager } from "@/components/SeoManager";

import Home from "@/pages/home";
import Track from "@/pages/track";
import Services from "@/pages/services";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Gallery from "@/pages/gallery/index";
import ServiceDetail from "@/pages/service-detail";
import Industries from "@/pages/industries";
import IndustryDetail from "@/pages/industry-detail";
import Vision2030 from "@/pages/vision-2030";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    let cancelled = false;
    void import("@/lib/scroll-engine").then((m) => {
      if (!cancelled) m.scrollToTop(true);
    });
    return () => {
      cancelled = true;
    };
  }, [location]);
  return null;
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
      <Route>
        <MainLayout><NotFound /></MainLayout>
      </Route>
    </Switch>
  );
}

function App({ ssrPath }: { ssrPath?: string }) {
  useEffect(() => {
    let destroy: (() => void) | undefined;
    void import("@/lib/scroll-engine").then((m) => {
      m.initScrollEngine();
      destroy = m.destroyScrollEngine;
    });
    return () => {
      destroy?.();
    };
  }, []);

  return (
    <LanguageProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
          <ScrollToTop />
          <SeoManager />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </LanguageProvider>
  );
}

export default App;

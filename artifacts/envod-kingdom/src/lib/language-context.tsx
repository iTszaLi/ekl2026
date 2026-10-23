import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ar: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function getLocalizedPath(path: string, language: Language): string {
  let route = path.split(/[?#]/)[0] || "/";
  if (appBasePath && (route === appBasePath || route.startsWith(`${appBasePath}/`))) {
    route = route.slice(appBasePath.length) || "/";
  }
  route = route.replace(/^\/ar(?=\/|$)/, "") || "/";
  if (!route.startsWith("/")) route = `/${route}`;

  const localePrefix = language === "ar" ? "/ar" : "";
  const localized = `${appBasePath}${localePrefix}${route === "/" ? "" : route}`;
  return localized || (language === "ar" ? "/ar" : "/");
}

export function getLocaleBase(language: Language): string {
  return `${appBasePath}${language === "ar" ? "/ar" : ""}`;
}

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined" && nextLanguage !== language) {
      const url = new URL(window.location.href);
      url.pathname = getLocalizedPath(url.pathname, nextLanguage);
      window.location.assign(url.toString());
    }
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (en: string, ar: string) => (language === "ar" ? ar : en);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl: language === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

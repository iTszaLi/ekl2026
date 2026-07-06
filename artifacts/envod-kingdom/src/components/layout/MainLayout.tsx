import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { GlobalNetworkMap } from "@/components/GlobalNetworkMap";
import {
  Globe, Menu, X, Clock, Shield, Globe2,
  MapPin, Phone, Printer, Mail, ChevronRight, ArrowUpRight,
} from "lucide-react";
import logoIcon from "@assets/image_1780532431289.png";
import logoFull from "@assets/image_1780437854819.png";
import logoJctrans from "@assets/logo_jctrans.webp";
import logoCooperative from "@assets/logo_cooperative.webp";
import logoWca from "@assets/logo_wca.webp";
import logoFiata from "@assets/logo_fiata.webp";
import logoPln from "@assets/logo_pln.webp";
import logoIconLn from "@assets/logo_iconln.webp";
import logoGla from "@assets/logo_gla.webp";
import { Button } from "@/components/ui/button";
import { QuoteModal } from "@/components/QuoteModal";

/* ─────────────────────────── Navbar ─────────────────────────── */
export function Navbar({ onGetQuote }: { onGetQuote?: () => void }) {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const measure = () => {
      if (headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mobileOpen]);

  const navLinks = [
    { href: "/", en: "Home", ar: "الرئيسية" },
    { href: "/services", en: "Services", ar: "خدماتنا" },
    { href: "/industries", en: "Industries", ar: "القطاعات" },
    { href: "/track", en: "Track", ar: "تتبع الشحنة" },
    { href: "/about", en: "About", ar: "عن الشركة" },
    { href: "/gallery", en: "Gallery", ar: "المعرض" },
    { href: "/contact", en: "Contact", ar: "اتصل بنا" },
  ];

  return (
    <header ref={headerRef} className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-primary/95 backdrop-blur-md shadow-md" : "bg-black/30 backdrop-blur-sm"}`}>
      <div className="bg-secondary/15 border-b border-secondary/20 py-1.5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`flex items-center justify-center gap-6 text-xs font-semibold flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className={`flex items-center gap-1.5 text-secondary ${isRtl ? "flex-row-reverse" : ""}`}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {t("CUSTOMS CLEARANCE OFTEN WITHIN 24 HOURS", "التخليص الجمركي غالباً خلال 24 ساعة")}
            </span>
            <span className="text-white/20 hidden sm:block">|</span>
            <span className={`flex items-center gap-1.5 text-white/60 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Globe2 className="w-3.5 h-3.5 flex-shrink-0" />
              {t("Serving Saudi Arabia, GCC & Global Markets — 25+ Years", "نخدم المملكة والخليج والأسواق العالمية — 25+ عام")}
            </span>
            <span className="text-white/20 hidden md:block">|</span>
            <span className={`hidden md:flex items-center gap-1.5 text-white/60 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              {t("Customs Clearance · Exhibition · Project Cargo Specialists", "التخليص الجمركي · معارض · بضائع مشاريع")}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-secondary/50 transition-all duration-300"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,.08) 0%,rgba(255,255,255,.02) 100%)", boxShadow: "0 0 12px rgba(214,40,40,.25),inset 0 0 8px rgba(0,0,0,.2)" }}
          >
            <img src={logoIcon} alt="إنفود كينغدوم" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%,transparent 60%,rgba(0,0,0,.25) 100%)" }} />
          </div>
          <div className={`hidden sm:flex flex-col leading-tight ${isRtl ? "items-end" : "items-start"}`} dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "'Cairo',sans-serif" : "inherit" }}>
            <span className="text-white font-bold text-[15px] tracking-wide">{t("ENVOD KINGDOM", "إنفود كينغدوم")}</span>
            <span className="text-white/55 font-normal text-[11px] tracking-wide mt-px">{t("SHIPPING SERVICES LLC", "خدمات الشحن ذ.م.م")}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => { if (link.href === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-white/85 hover:text-secondary font-medium transition-colors text-sm"
            >
              {t(link.en, link.ar)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="text-white hover:bg-white/10 text-sm">
            <Globe className="w-4 h-4 mr-1.5" />{language === "en" ? "عربي" : "EN"}
          </Button>
          <button
            onClick={onGetQuote}
            className="group relative whitespace-nowrap shrink-0 bg-secondary hover:bg-secondary/85 text-white px-5 lg:px-6 py-3 rounded-xl font-black text-[12px] lg:text-[13px] uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/35 hover:-translate-y-px overflow-hidden"
          >
            <span className="relative z-10">{t("Get a Free Quote", "احصل على تسعيرة")}</span>
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>

        <button
          className="md:hidden text-white p-1"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            if (!mobileOpen && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
            setMobileOpen(!mobileOpen);
          }}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen &&
        createPortal(
          <div
            className="md:hidden fixed left-0 right-0 bg-primary py-4 px-4 flex flex-col gap-4 shadow-lg border-t border-white/10 z-[60]"
            style={{ top: menuTop }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { setMobileOpen(false); if (link.href === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-white text-base hover:text-secondary font-medium transition-colors py-1"
              >
                {t(link.en, link.ar)}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="w-full justify-center">
                <Globe className="w-4 h-4 mr-2" />{language === "en" ? "عربي" : "EN"}
              </Button>
              <button
                onClick={() => { setMobileOpen(false); onGetQuote?.(); }}
                className="w-full text-center bg-secondary hover:bg-secondary/90 text-white px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-colors"
              >
                {t("Get a Free Quote", "احصل على تسعيرة مجانية")}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}

/* ─────────────────────────── Animated Counter ─────────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* Each stat item is its own component so hooks are called at top level */
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center group py-2">
      <div className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-secondary transition-colors duration-300">
        {count.toLocaleString()}<span className="text-secondary">{suffix}</span>
      </div>
      <div className="text-xs font-semibold text-white/45 uppercase tracking-widest">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Stats Strip ─────────────────────────── */
function StatsStrip() {
  const { t } = useLanguage();
  const stats = [
    { value: 25,    suffix: "+", label: t("Years Experience",      "سنة خبرة") },
    { value: 10000, suffix: "+", label: t("Shipments Delivered",   "شحنة مسلّمة") },
    { value: 500,   suffix: "+", label: t("Corporate Clients",     "عميل مؤسسي") },
    { value: 50,    suffix: "+", label: t("Countries Served",      "دولة نخدمها") },
  ];
  return (
    <div className="bg-[#070f1e] border-y border-white/8">
      <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatItem key={i} {...s} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────── Social Icons ─────────────────────────── */
function SocialIcons() {
  const socials: { label: string; href: string; path: string }[] = [
    {
      label: "LinkedIn",
      href: "https://linkedin.com",
      path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    },
    {
      label: "Instagram",
      href: "https://instagram.com",
      path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm4.5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.5a1 1 0 1 0-2 0 1 1 0 0 0 2 0z",
    },
    {
      label: "Facebook",
      href: "https://facebook.com",
      path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    },
    {
      label: "X (Twitter)",
      href: "https://x.com",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/966502260256",
      path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    },
  ];
  return (
    <div className="flex items-center gap-4 mt-8">
      {socials.map((s, i) => (
        <motion.a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          className="relative w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 group overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-tr from-secondary/80 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <svg className="relative z-10" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={s.path} />
          </svg>
        </motion.a>
      ))}
    </div>
  );
}

/* ─────────────────────────── Head Office Mini Map ─────────────────────────── */
function HeadOfficeMiniMap() {
  const { t, isRtl } = useLanguage();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only mount the embed once it nears the viewport — keeps the footer light
  // and protects LCP/CWV (the footer sits at the very bottom of the page).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const query =
    "Envod Kingdom Shipping Services LLC, Prince Mansour Bin Abdulaziz St, Al Malaz, Riyadh 12831, Saudi Arabia";
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-secondary shrink-0" />
        <span className="text-white font-bold text-[13px] tracking-wide">
          {t("Riyadh Head Office", "المقر الرئيسي — الرياض")}
        </span>
      </div>

      <div
        ref={ref}
        className="group relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#0a1526] shadow-[0_18px_50px_-16px_rgba(0,0,0,0.8)] hover:border-secondary/30 transition-colors duration-500"
      >
        {inView && (
          <iframe
            title={t("Riyadh Head Office Map", "خريطة المقر الرئيسي — الرياض")}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 pointer-events-none"
            style={{
              filter:
                "invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.92) saturate(0.9)",
            }}
          />
        )}

        {/* Depth + legibility wash (kept above the inverted iframe) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#06101e]/55 via-transparent to-[#06101e]/15" />

        {/* Whole-map click target → opens Google Maps directions in a new tab */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("Open Riyadh Head Office in Google Maps", "افتح المقر الرئيسي في خرائط جوجل")}
          className="absolute inset-0 z-10"
        >
          <span
            className={`absolute bottom-3 ${isRtl ? "left-3" : "right-3"} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-white text-[11px] font-bold tracking-wide shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300`}
          >
            {t("Get Directions", "الاتجاهات")}
            <ArrowUpRight className={`w-3.5 h-3.5 ${isRtl ? "-scale-x-100" : ""}`} />
          </span>
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────── Membership Logos ─────────────────────────── */
const MEMBERSHIPS: { name: string; logo: string; height: string }[] = [
  { name: "JCtrans",                            logo: logoJctrans,     height: "h-6 sm:h-7" },
  { name: "The Cooperative Logistics Network",  logo: logoCooperative, height: "h-11 sm:h-14" },
  { name: "WCA Worldwide",                      logo: logoWca,         height: "h-9 sm:h-11" },
  { name: "FIATA",                              logo: logoFiata,       height: "h-11 sm:h-14" },
  { name: "Planet Logistics Network",           logo: logoPln,         height: "h-8 sm:h-10" },
  { name: "ICON Logistics Network",             logo: logoIconLn,      height: "h-9 sm:h-11" },
  { name: "GLA — Global Logistics Alliance",    logo: logoGla,         height: "h-8 sm:h-10" },
];

/* ─────────────────────────── CTA Strip ─────────────────────────── */
function CTAStrip() {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-to-r from-[#b51f1f] via-secondary to-[#b51f1f] py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-white/80 text-sm font-semibold uppercase tracking-widest mb-6">
          {t("Ready to Ship? Get Started Today", "هل أنت مستعد للشحن؟ ابدأ اليوم")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact"
            className="w-full sm:w-auto text-center bg-white text-secondary font-black text-sm tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-white/95 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            {t("🚀 GET A FREE QUOTE", "🚀 احصل على تسعيرة مجانية")}
          </Link>
          <Link href="/track"
            className="w-full sm:w-auto text-center bg-white/10 backdrop-blur-sm border-2 border-white text-white font-black text-sm tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-white hover:text-secondary transition-all duration-300 hover:-translate-y-0.5"
          >
            {t("📦 TRACK SHIPMENT", "📦 تتبع شحنتك")}
          </Link>
          <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-[#25D366] text-white font-black text-sm tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-[#1EBE5D] hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            {t("💬 WHATSAPP US", "💬 راسلنا على واتساب")}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Enterprise Footer ─────────────────────────── */
export function Footer() {
  const { t, isRtl } = useLanguage();
  const year = new Date().getFullYear();

  const services: [string, string][] = [
    [t("Customs Clearance", "التخليص الجمركي"), "/services/customs-clearance"],
    [t("Ocean & Sea Freight", "الشحن البحري"), "/services/ocean-freight"],
    [t("Air Freight", "الشحن الجوي"), "/services/air-freight"],
    [t("Exhibition Logistics", "لوجستيات المعارض"), "/services/exhibition-logistics"],
    [t("ATA Carnet", "كارنيه ATA"), "/services/exhibition-logistics"],
    [t("Warehousing", "التخزين"), "/services/warehousing"],
    [t("Project Cargo", "بضائع المشاريع"), "/services/project-cargo"],
    [t("Freight Forwarding", "الشحن والتخليص"), "/services/freight-forwarding"],
    [t("GCC Transportation", "النقل الخليجي"), "/services/gcc-transportation"],
  ];

  const industries: [string, string][] = [
    [t("Automotive", "السيارات"), "/industries/automotive-logistics"],
    [t("Construction", "البناء والإنشاء"), "/industries/construction-logistics"],
    [t("Retail", "تجارة التجزئة"), "/industries/retail-logistics"],
    [t("Electronics", "الإلكترونيات"), "/industries/electronics-logistics"],
    [t("Government", "القطاع الحكومي"), "/industries/government-logistics"],
    [t("Vision 2030", "رؤية 2030"), "/vision-2030"],
    [t("All Industries", "جميع القطاعات"), "/industries"],
  ];

  const quickLinks: [string, string][] = [
    [t("Home", "الرئيسية"), "/"],
    [t("About", "عن الشركة"), "/about"],
    [t("Services", "الخدمات"), "/services"],
    [t("Gallery", "المعرض"), "/gallery"],
    [t("Track Shipment", "تتبع الشحنة"), "/track"],
    [t("Contact", "اتصل بنا"), "/contact"],
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
  };

  return (
    <footer className="bg-gradient-to-b from-[#0a1524] via-[#06101e] to-[#040b16] text-white relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <GlobalNetworkMap />
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-50" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0a192f] rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* ── Main grid ── */}
      <div className="container mx-auto px-6 pt-20 pb-14 relative z-10">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >

          {/* Brand */}
          <motion.div variants={itemVariants}>
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block mb-8 group"
            >
              <div className="bg-white/95 px-6 py-4 rounded-2xl inline-flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_8px_32px_rgba(214,40,40,0.25)] group-hover:-translate-y-1 group-hover:bg-white border border-white/10">
                <img src={logoFull} alt="ENVOD KINGDOM Shipping Services LLC" className="h-14 object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <p className="text-[14px] leading-relaxed text-white/60 mb-8 font-medium">
              {t(
                "Saudi Arabia's trusted partner for Exhibition Logistics, ATA Carnet, Customs Clearance, Project Cargo, and Global Shipping — 25+ years of expertise.",
                "الشريك الموثوق في المملكة للمعارض والتخليص الجمركي وكارنيه ATA وبضائع المشاريع والشحن العالمي — أكثر من 25 عاماً."
              )}
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {["SABER", "ISO 9001", "ATA Carnet", "SFDA"].map((b) => (
                <span key={b} className="text-[10px] font-black uppercase tracking-[0.15em] bg-white/[0.03] text-white/80 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary transition-all duration-300">
                  {b}
                </span>
              ))}
            </div>

            <SocialIcons />

            <HeadOfficeMiniMap />
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-[13px] uppercase tracking-[0.22em] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {t("Our Services", "خدماتنا")}
            </h4>
            <ul className="space-y-3.5">
              {services.map(([label, href], i) => (
                <li key={i}>
                  <Link href={href} className="flex items-center gap-3 text-[14px] text-white/60 hover:text-white transition-colors duration-300 group">
                    <ChevronRight className={`w-3.5 h-3.5 text-secondary/0 group-hover:text-secondary transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 ${isRtl ? "rotate-180 translate-x-2 group-hover:-translate-x-0" : ""}`} />
                    <span className="transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Industries + Quick Links */}
          <motion.div className="flex flex-col gap-10" variants={itemVariants}>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-[0.22em] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {t("Industries", "القطاعات")}
              </h4>
              <ul className="space-y-3.5">
                {industries.map(([label, href], i) => (
                  <li key={i}>
                    <Link href={href} className="flex items-center gap-3 text-[14px] text-white/60 hover:text-white transition-colors duration-300 group">
                      <ChevronRight className={`w-3.5 h-3.5 text-secondary/0 group-hover:text-secondary transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 ${isRtl ? "rotate-180 translate-x-2 group-hover:-translate-x-0" : ""}`} />
                      <span className="transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-[0.22em] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {t("Quick Links", "روابط سريعة")}
              </h4>
              <ul className="space-y-3.5">
                {quickLinks.map(([label, href], i) => (
                  <li key={i}>
                    <Link href={href} className="flex items-center gap-3 text-[14px] text-white/60 hover:text-white transition-colors duration-300 group">
                      <ChevronRight className={`w-3.5 h-3.5 text-secondary/0 group-hover:text-secondary transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 ${isRtl ? "rotate-180 translate-x-2 group-hover:-translate-x-0" : ""}`} />
                      <span className="transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-[13px] uppercase tracking-[0.22em] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {t("Contact Us", "اتصل بنا")}
            </h4>

            <ul className="space-y-6">
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <p className="text-white font-bold text-[14px] mb-1.5">{t("Riyadh Head Office", "المقر الرئيسي — الرياض")}</p>
                  <p className="text-white/50 text-[13px] leading-relaxed">
                    {t("Prince Mansour Bin Abdulaziz St.", "شارع الأمير منصور بن عبدالعزيز")}<br />
                    {t("Al Malaz, Riyadh 12831", "حي الملز، الرياض 12831")}<br />
                    {t("P.O. Box 2383", "ص.ب 2383")}<br />
                    {t("Saudi Arabia", "المملكة العربية السعودية")}
                  </p>
                </div>
              </li>

              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{t("Phone", "هاتف")}</p>
                  <a href="tel:+966502260256" className="text-white/80 text-[14px] hover:text-secondary transition-colors font-medium">
                    +966 50 226 0256
                  </a>
                </div>
              </li>

              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/10 group-hover:border-[#25D366]/30 transition-colors duration-300">
                  <svg className="w-4 h-4 text-white/60 group-hover:text-[#25D366] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">WhatsApp</p>
                  <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer" className="text-white/80 text-[14px] hover:text-[#25D366] transition-colors font-medium">
                    +966 50 226 0256
                  </a>
                </div>
              </li>

              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-colors duration-300">
                  <Printer className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{t("Fax", "فاكس")}</p>
                  <span className="text-white/80 text-[14px] font-medium" dir="ltr">+966 11 238 0517</span>
                </div>
              </li>

              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{t("Email", "البريد الإلكتروني")}</p>
                  <a href="mailto:info@envodkingdom.net" className="text-white/80 text-[14px] hover:text-secondary transition-colors font-medium">
                    info@envodkingdom.net
                  </a>
                </div>
              </li>

              <li className="flex gap-4 group pt-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-colors duration-300">
                  <Clock className="w-4 h-4 text-white/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{t("Business Hours", "ساعات العمل")}</p>
                  <p className="text-white/70 text-[13px] leading-relaxed mb-2">
                    {t("Sun – Thu: 8:00 AM – 6:00 PM", "الأحد – الخميس: 8ص – 6م")}<br />
                    {t("Sat: 9:00 AM – 2:00 PM", "السبت: 9ص – 2م")}
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <p className="text-secondary text-[11px] font-bold tracking-wide uppercase">{t("24/7 Tracking & Support", "دعم وتتبع على مدار الساعة")}</p>
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Proud Member Of ── */}
      <div className="border-t border-white/[0.04] bg-[#0a1526]/50 relative z-10">
        <div className="container mx-auto px-6 py-14">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-9">
            {t("Proud Member Of", "عضو فخور في")}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl rounded-3xl bg-white/[0.97] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] px-6 sm:px-10 lg:px-14 py-9 sm:py-11"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 lg:gap-x-16 gap-y-8" dir="ltr">
              {MEMBERSHIPS.map((m) => (
                <img
                  key={m.name}
                  src={m.logo}
                  alt={m.name}
                  title={m.name}
                  loading="lazy"
                  className={`${m.height} w-auto object-contain transition-all duration-300 ease-out hover:scale-105 hover:drop-shadow-[0_8px_20px_rgba(10,35,66,0.28)]`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/[0.04] bg-[#020610] relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/40 font-medium ${isRtl ? "md:flex-row-reverse" : ""}`}>
            <p className="text-center md:text-left">
              © {year} {t("ENVOD KINGDOM SHIPPING SERVICES LLC", "انفود كينغدوم لخدمات الشحن ذ.م.م")}.{" "}
              {t("All rights reserved.", "جميع الحقوق محفوظة.")}
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {([
                ["Privacy Policy", "سياسة الخصوصية"],
                ["Terms & Conditions", "الشروط والأحكام"],
                ["Cookie Policy", "سياسة الكوكيز"],
              ] as const).map(([en, ar], i) => (
                <React.Fragment key={en}>
                  {i > 0 && <span className="w-px h-3 bg-white/15" aria-hidden />}
                  <a href="#" className="hover:text-white transition-colors">{t(en, ar)}</a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Main Layout ─────────────────────────── */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onGetQuote={() => setQuoteOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />

      {/* Premium branded WhatsApp floating button */}
      <a
        href="https://wa.me/966502260256"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_36px_rgba(37,211,102,0.6)] hover:bg-[#1EBE5D] transition-all duration-300 hover:-translate-y-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-bold hidden sm:block">WhatsApp</span>
      </a>
    </div>
  );
}

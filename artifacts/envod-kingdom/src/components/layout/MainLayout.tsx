import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { GlobalNetworkMap } from "@/components/GlobalNetworkMap";
import {
  Globe, Menu, X, Clock, Shield, Globe2,
  MapPin, Phone, Printer, Mail, ChevronRight, ArrowUpRight,
} from "lucide-react";
import logoIcon from "@assets/image_1780532431289.png";
import logoFull from "@assets/image_1780437854819.png";
import { Button } from "@/components/ui/button";
import { QuoteModal } from "@/components/QuoteModal";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164 } from "@/lib/quote-mailto";

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
    { href: "/track", en: "Shipment Status", ar: "حالة الشحنة" },
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
              {t("YOUR TRUSTED PARTNER FOR SHIPPING INTO SAUDI ARABIA", "شريكك الموثوق للشحن إلى المملكة العربية السعودية")}
            </span>
            <span className="text-white/20 hidden sm:block">|</span>
            <span className={`flex items-center gap-1.5 text-white/60 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Globe2 className="w-3.5 h-3.5 flex-shrink-0" />
              {t("Saudi Arabia · GCC · Worldwide Freight Solutions", "السعودية · الخليج · حلول شحن حول العالم")}
            </span>
            <span className="text-white/20 hidden md:block">|</span>
            <span className={`hidden md:flex items-center gap-1.5 text-white/60 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              {t("Customs Clearance · Exhibition Logistics · Project Cargo", "التخليص الجمركي · لوجستيات المعارض · شحن المشاريع")}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between py-2">
        <Link
          href="/"
          aria-label={t("ENVOD KINGDOM home", "العودة إلى الصفحة الرئيسية لإنفود كينغدوم")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 group"
        >
          <div
            className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-secondary/50 transition-all duration-300"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,.08) 0%,rgba(255,255,255,.02) 100%)", boxShadow: "0 0 12px rgba(214,40,40,.25),inset 0 0 8px rgba(0,0,0,.2)" }}
          >
            <img src={logoIcon} width={223} height={171} alt="إنفود كينغدوم" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%,transparent 60%,rgba(0,0,0,.25) 100%)" }} />
          </div>
          <div className={`hidden sm:flex flex-col leading-tight ${isRtl ? "items-end" : "items-start"}`} dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: isRtl ? "'Cairo',sans-serif" : "inherit" }}>
            <span className="text-white font-bold text-[15px] tracking-wide">{t("ENVOD KINGDOM", "إنفود كينغدوم")}</span>
            <span className="text-white/55 font-normal text-[11px] tracking-wide mt-px">{t("SHIPPING SERVICES LLC", "خدمات الشحن ذ.م.م")}</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
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

        <div className="hidden lg:flex items-center gap-3">
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
          className="lg:hidden text-white p-1"
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
            className="lg:hidden fixed left-0 right-0 bg-primary py-4 px-4 flex flex-col gap-4 shadow-lg border-t border-white/10 z-[60]"
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

function ServiceItem({ title, label }: { title: string; label: string }) {
  return (
    <div className="text-center group py-2">
      <div className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-secondary transition-colors duration-300">
        {title}
      </div>
      <div className="text-xs font-semibold text-white/45 uppercase tracking-widest">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Stats Strip ─────────────────────────── */
function StatsStrip() {
  const { t } = useLanguage();
  const stats = [
    { title: t("Saudi Arabia", "السعودية"), label: t("Customs & freight coordination", "تنسيق التخليص والشحن") },
    { title: t("Sea & Air", "بحري وجوي"), label: t("Freight options", "خيارات الشحن") },
    { title: t("Exhibitions", "المعارض"), label: t("Event logistics coordination", "تنسيق لوجستيات الفعاليات") },
    { title: t("GCC", "الخليج"), label: t("Road-transport planning", "تخطيط النقل البري") },
  ];
  return (
    <div className="bg-[#070f1e] border-y border-white/8">
      <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <ServiceItem key={s.title} {...s} />)}
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
            {t("📦 REQUEST SHIPMENT STATUS", "📦 اطلب تحديث حالة الشحنة")}
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
    [t("Exhibition & Event Logistics", "لوجستيات المعارض والفعاليات"), "/services/exhibition-logistics"],
    [t("Customs Clearance in Saudi Arabia", "التخليص الجمركي في السعودية"), "/services/customs-clearance"],
    [t("Packing, Crating & Relocation", "التعبئة والتغليف والانتقال"), "/services/packaging-crating"],
    [t("Road Transportation & GCC Freight", "النقل البري والشحن الخليجي"), "/services/gcc-transportation"],
    [t("Breakbulk Shipping", "شحن البضائع غير المعبأة"), "/services/breakbulk-shipping"],
    [t("ATA Carnet & Temporary Admission", "دفتر ATA والإدخال المؤقت"), "/services/ata-carnet"],
    [t("Project Cargo & Oversized Cargo", "بضائع المشاريع والبضائع كبيرة الحجم"), "/services/project-cargo"],
    [t("Ocean & Sea Freight", "الشحن البحري"), "/services/ocean-freight"],
    [t("Air Freight", "الشحن الجوي"), "/services/air-freight"],
    [t("Freight Forwarding", "تخليص وتنسيق الشحن"), "/services/freight-forwarding"],
    [t("Warehousing & Distribution", "التخزين والتوزيع"), "/services/warehousing"],
    [t("Local Delivery & Site Handling", "التوصيل المحلي ومناولة المواقع"), "/services/white-glove-logistics"],
    [t("Temperature-Controlled Logistics", "الخدمات اللوجستية بدرجة حرارة مضبوطة"), "/services/temperature-controlled-logistics"],
    [t("Import & Export Logistics", "لوجستيات الاستيراد والتصدير"), "/services/cross-trade-shipping"],
    [t("Shipment Status Requests", "طلبات تحديث حالة الشحنات"), "/track"],
  ];

  const industries: [string, string][] = [
    [t("Automotive", "السيارات"), "/industries/automotive-logistics"],
    [t("Construction & Infrastructure", "الإنشاءات والبنية التحتية"), "/industries/construction-logistics"],
    [t("Retail & Consumer Goods", "التجزئة والسلع الاستهلاكية"), "/industries/retail-logistics"],
    [t("Electronics & Technology", "الإلكترونيات والتقنية"), "/industries/electronics-logistics"],
    [t("Government & Public Sector", "القطاع الحكومي والقطاع العام"), "/industries/government-logistics"],
    [t("Fashion", "الأزياء"), "/industries/fashion-logistics"],
    [t("Aerospace", "الطيران والفضاء"), "/industries/aerospace-logistics"],
    [t("Hospitality", "الضيافة"), "/industries/hospitality-logistics"],
    [t("Furniture", "الأثاث"), "/industries/furniture-logistics"],
    [t("Chemical", "الصناعات الكيميائية"), "/industries/chemical-logistics"],
    [t("Telecommunications", "الاتصالات"), "/industries/telecommunications-logistics"],
    [t("View All Industries", "عرض جميع القطاعات"), "/industries"],
  ];

  const quickLinks: [string, string][] = [
    [t("Home", "الرئيسية"), "/"],
    [t("About ENVOD", "عن إنفود كينغدوم"), "/about"],
    [t("Our Services", "خدماتنا"), "/services"],
    [t("Industries", "القطاعات"), "/industries"],
    [t("Exhibition Logistics", "لوجستيات المعارض"), "/services/exhibition-logistics"],
    [t("Request a Quote", "طلب عرض سعر"), "/contact"],
    [t("Request Shipment Status", "طلب تحديث حالة الشحنة"), "/track"],
    [t("Contact Us", "اتصل بنا"), "/contact"],
    [t("Frequently Asked Questions", "الأسئلة الشائعة"), "/#faq"],
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-8 gap-y-12"
          variants={containerVariants}
          initial="visible"
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
                <img src={logoFull} width={730} height={114} alt="ENVOD KINGDOM Shipping Services LLC" className="h-14 w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <p className="text-[14px] leading-relaxed text-white/60 mb-8 font-medium">
              {t(
                "Saudi Arabia-based shipping and logistics coordination for exhibition and event cargo, customs clearance, ATA Carnet enquiries, international freight and GCC transportation.",
                "تنسيق الشحن والخدمات اللوجستية من المملكة العربية السعودية لبضائع المعارض والفعاليات والتخليص الجمركي واستفسارات دفتر ATA والشحن الدولي والنقل الخليجي."
              )}
            </p>
            <p className="text-[13px] leading-relaxed text-white/50 mb-6">
              {t(
                "Freight, documentation, transportation and delivery arrangements are confirmed for each shipment.",
                "يتم تأكيد ترتيبات الشحن والوثائق والنقل والتسليم لكل شحنة على حدة."
              )}
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {[
                t("Freight Coordination", "تنسيق الشحن"),
                t("Customs Documentation", "وثائق الجمارك"),
                t("Exhibition Cargo", "بضائع المعارض"),
              ].map((badge) => (
                <span key={badge} className="text-[10px] font-black uppercase tracking-[0.15em] bg-white/[0.03] text-white/80 px-3.5 py-1.5 rounded-full border border-white/10">
                  {badge}
                </span>
              ))}
              <a
                href="https://www.jctrans.com/en/company/07f1r7u/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("Open ENVOD KINGDOM's verified JCtrans company profile", "افتح ملف ENVOD KINGDOM الموثق على JCtrans")}
                data-testid="footer-jctrans-profile"
                className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-secondary transition-colors hover:bg-secondary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                {t("JCtrans Profile", "ملف JCtrans")}
                <ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" />
              </a>
            </div>

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
                <li key={href} data-testid={`footer-service-${i + 1}`}>
                  <Link href={href} data-testid={`link-footer-service-${i + 1}`} className="flex items-start gap-2 text-[13px] leading-snug text-white/65 hover:text-white transition-colors duration-300 group">
                    <ChevronRight aria-hidden="true" className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-secondary/0 group-hover:text-secondary transition-all duration-300 ${isRtl ? "rotate-180" : ""}`} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Industries */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-[13px] uppercase tracking-[0.18em] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              {t("Industries", "القطاعات")}
            </h4>
            <ul className="space-y-3">
              {industries.map(([label, href], i) => (
                <li key={href}>
                  <Link href={href} data-testid={`link-footer-industry-${i + 1}`} className="flex items-start gap-2 text-[13px] leading-snug text-white/65 hover:text-white transition-colors duration-300 group">
                    <ChevronRight aria-hidden="true" className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-secondary/0 group-hover:text-secondary transition-all duration-300 ${isRtl ? "rotate-180" : ""}`} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-[13px] uppercase tracking-[0.18em] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              {t("Quick Links", "روابط سريعة")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(([label, href], i) => (
                <li key={`${href}-${i}`}>
                  <Link href={href} data-testid={`link-footer-quick-${i + 1}`} className="flex items-start gap-2 text-[13px] leading-snug text-white/65 hover:text-white transition-colors duration-300 group">
                    <ChevronRight aria-hidden="true" className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-secondary/0 group-hover:text-secondary transition-all duration-300 ${isRtl ? "rotate-180" : ""}`} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-[13px] uppercase tracking-[0.18em] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              {t("Contact Our Team", "تواصل مع فريقنا")}
            </h4>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <p className="text-white font-bold text-[13px] mb-1">{t("Riyadh Head Office", "المقر الرئيسي — الرياض")}</p>
                  <p className="text-white/55 text-[12px] leading-relaxed">
                    {t("Prince Mansour Bin Abdulaziz Street, Al Malaz, Riyadh 12831, Saudi Arabia", "شارع الأمير منصور بن عبدالعزيز، حي الملز، الرياض 12831، المملكة العربية السعودية")}<br />
                    {t("P.O. Box 2383", "ص.ب 2383")}
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Prince+Mansour+Bin+Abdulaziz+Street%2C+Al+Malaz%2C+Riyadh+12831%2C+Saudi+Arabia"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-footer-directions"
                    className="inline-flex items-center gap-1 mt-2 text-secondary text-xs font-semibold hover:text-white"
                  >
                    {t("Get Directions", "احصل على الاتجاهات")} <ArrowUpRight aria-hidden="true" className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <a href={`tel:${CONTACT_PHONE_E164}`} data-testid="link-footer-phone" className="text-white/80 text-[13px] hover:text-secondary">
                    {t(`Call Us: ${CONTACT_PHONE_DISPLAY}`, `اتصل بنا: ${CONTACT_PHONE_DISPLAY}`)}
                  </a>
                  <p className="text-white/45 text-[11px]">{t("Call Us", "اتصل بنا")}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Printer aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <p className="text-white/45 text-[11px]">{t("Fax", "فاكس")}</p>
                  <span className="text-white/80 text-[13px]" dir="ltr">+966 11 238 0517</span>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <a href="mailto:info@envodkingdom.net" data-testid="link-footer-email" aria-label={t("Email our team", "راسل فريقنا")} className="break-all text-white/80 text-[13px] hover:text-secondary">
                  {t("Email our team", "راسل فريقنا")}<br />info@envodkingdom.net
                </a>
              </li>
              <li className="flex gap-3">
                <Clock aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                <div>
                  <p className="text-white font-bold text-[12px] mb-1">{t("Business Hours", "ساعات العمل")}</p>
                  <p className="text-white/65 text-[12px] leading-relaxed">
                    {t("Sunday–Thursday: 8:00 AM–6:00 PM", "الأحد–الخميس: 8:00 صباحاً–6:00 مساءً")}<br />
                    {t("Saturday: 9:00 AM–2:00 PM", "السبت: 9:00 صباحاً–2:00 مساءً")}<br />
                    {t("Friday: Closed", "الجمعة: مغلق")}
                  </p>
                  <p className="text-white/45 text-[11px] mt-1">
                    {t("Saudi Arabia local time (AST, UTC+3)", "التوقيت المحلي للمملكة العربية السعودية (AST، UTC+3)")}
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer" data-testid="link-footer-whatsapp" className="rounded-lg bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#1EBE5D]">
                {t("Chat on WhatsApp", "تواصل عبر واتساب")}
              </a>
              <Link href="/contact" data-testid="link-footer-quote" className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white hover:bg-secondary/90">
                {t("Request a Quote", "اطلب عرض سعر")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/[0.04] bg-[#020610] relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white/40 font-medium ${isRtl ? "md:flex-row-reverse" : ""}`}>
            <p className="text-center md:text-left">
              © {year} {t("ENVOD KINGDOM SHIPPING SERVICES LLC", "انفود كينغدوم لخدمات الشحن ذ.م.م")}.{" "}
              {t("All rights reserved.", "جميع الحقوق محفوظة.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AnalyticsBridge() {
  const { language } = useLanguage();
  const [location] = useLocation();

  useEffect(() => {
    const handleClick = (clickEvent: MouseEvent) => {
      if (!(clickEvent.target instanceof Element)) return;
      const element = clickEvent.target.closest("a,button");
      if (!element) return;

      const href =
        element instanceof HTMLAnchorElement
          ? element.getAttribute("href") ?? ""
          : "";
      const label = (element.textContent ?? "").trim().toLowerCase();
      const serviceMatch = window.location.pathname.match(/\/services\/([^/]+)/);
      const serviceCategory = serviceMatch?.[1];
      const ctaLocation = element.closest("header")
        ? "header"
        : element.closest("footer")
          ? "footer"
          : element.closest("[role=dialog]")
            ? "quote_modal"
            : "content";
      const payload = {
        page_path: window.location.pathname,
        language,
        service_category: serviceCategory,
        cta_location: ctaLocation,
      };

      if (href.startsWith("tel:")) {
        emitAnalyticsEvent("call_click", payload);
      } else if (href.includes("wa.me")) {
        emitAnalyticsEvent("whatsapp_click", payload);
      } else if (href.startsWith("mailto:")) {
        emitAnalyticsEvent("email_click", payload);
      } else if (
        /\/contact(?:\/|$)/.test(href) ||
        (element instanceof HTMLButtonElement &&
          /quote|عرض سعر|تسعيرة/.test(label))
      ) {
        emitAnalyticsEvent("service_cta_click", payload);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [language, location]);

  return null;
}

/* ─────────────────────────── Main Layout ─────────────────────────── */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen">
      <AnalyticsBridge />
      <Navbar onGetQuote={() => setQuoteOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <a
          href={`tel:${CONTACT_PHONE_E164}`}
          aria-label={t(`Call Us: ${CONTACT_PHONE_DISPLAY}`, `اتصل بنا: ${CONTACT_PHONE_DISPLAY}`)}
          title={t(`Call Us: ${CONTACT_PHONE_DISPLAY}`, `اتصل بنا: ${CONTACT_PHONE_DISPLAY}`)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#17456F] text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#205D91] sm:h-14 sm:w-14"
        >
          <Phone className="h-5 w-5" />
          <span className="sr-only">{t("Call", "اتصال")}</span>
        </a>
        <a
          href="https://wa.me/966502260256"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("Chat on WhatsApp", "تواصل عبر واتساب")}
          className="flex items-center gap-2.5 rounded-full bg-[#25D366] py-3 pl-4 pr-5 text-white shadow-[0_4px_24px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1EBE5D] hover:shadow-[0_6px_36px_rgba(37,211,102,0.6)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-sm font-bold hidden sm:block">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

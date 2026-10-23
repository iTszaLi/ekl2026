import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollAnimSection, type AnimChapter } from "@/components/ScrollAnimSection";
import { StatsCounter } from "@/components/StatsCounter";
import { ClientMarquee } from "@/components/ClientMarquee";
import { ServicesSection } from "@/components/ServicesSection";
import { ExhibitionSection } from "@/components/ExhibitionSection";
import { CustomsClearanceSection } from "@/components/CustomsClearanceSection";
import { IndustriesSection } from "@/components/IndustriesSection";
import { TrustSection } from "@/components/TrustSection";
import { PremiumCTA } from "@/components/PremiumCTA";
import { FAQSection } from "@/components/FAQSection";
import { Building2, CalendarDays, Factory, Package, ShoppingBag, Truck } from "lucide-react";

const LOGISTICS_AUDIENCES = [
  { en: "Importers & exporters", ar: "المستوردون والمصدرون", icon: Building2 },
  { en: "Exhibitors & event teams", ar: "العارضون وفرق الفعاليات", icon: CalendarDays },
  { en: "Manufacturers", ar: "المصنّعون", icon: Factory },
  { en: "Project cargo buyers", ar: "مشترو شحن المشاريع", icon: Package },
  { en: "Retail & FMCG businesses", ar: "التجزئة والسلع الاستهلاكية", icon: ShoppingBag },
  { en: "Freight forwarders", ar: "وكلاء الشحن", icon: Truck },
];

function LogisticsLeadersSection() {
  const { t } = useLanguage();
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Subtle decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #0A2342 0%, transparent 70%)" }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
          >
            {t("BUSINESS SHIPMENT ENQUIRIES", "استفسارات شحن الأعمال")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black"
            style={{ color: "#0A2342" }}
          >
            {t("Logistics planning for", "تخطيط لوجستي لـ")}
            <span className="text-secondary"> {t("Saudi business shipments", "شحنات الأعمال في السعودية")}</span>
          </motion.h2>
        </div>

        {/* Logo showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {LOGISTICS_AUDIENCES.map(({ en, ar, icon: Icon }, i) => (
            <motion.div
              key={en}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 16px 40px -8px rgba(10,35,66,0.14)" }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-secondary/30 transition-all group cursor-default flex flex-col items-center justify-center gap-3 h-28 px-4 text-center"
            >
              <Icon aria-hidden="true" className="h-7 w-7 text-secondary" />
              <span className="text-sm font-bold text-[#0A2342]">{t(en, ar)}</span>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-center max-w-3xl mx-auto mt-12 text-[15px] leading-relaxed"
          style={{ color: "#475569" }}
        >
          {t(
            "Enquiries may cover customs-document coordination, freight planning and delivery requirements for business shipments in Saudi Arabia. Applicable documents, route, operator and service availability are reviewed for each request; customs release and approvals remain with the responsible authorities.",
            "قد تشمل الاستفسارات تنسيق مستندات الجمارك وتخطيط الشحن ومتطلبات التسليم لشحنات الأعمال في السعودية. تتم مراجعة المستندات والمسار والمشغّل وتوفر الخدمة لكل طلب؛ وتبقى قرارات الفسح والموافقات لدى الجهات المختصة.",
          )}
        </motion.p>

      </div>
    </section>
  );
}

const craneChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "25+ YEARS OF LOGISTICS EXCELLENCE.",
    titleAr: "أكثر من 25 عامًا من التميز اللوجستي.",
    subtitle: "Saudi Arabia's Trusted Partner For Exhibition Logistics, ATA Carnet Services, Customs Clearance and Global Freight Solutions.",
    subtitleAr: "شريككم الموثوق في المملكة العربية السعودية لخدمات لوجستيات المعارض وكارنيه ATA والتخليص الجمركي وحلول الشحن العالمية.",
    features: ["ATA Carnet Specialists", "Customs Clearance Often Within 24 Hours", "GCC Road Transport", "Air · Sea Freight", "Exhibition & Trade Shows"],
    featuresAr: ["خبراء كارنيه ATA", "التخليص الجمركي غالبًا خلال 24 ساعة", "النقل البري لدول مجلس التعاون الخليجي", "الشحن الجوي · البحري", "المعارض والفعاليات التجارية"],
    documentSupport: ["SABER", "SFDA", "IEC", "GACA", "FASAH", "SASO", "ZATCA"],
    documentSupportAr: ["SABER", "SFDA", "IEC", "GACA", "FASAH", "SASO", "ZATCA"],
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Connecting Saudi Arabia to the World.",
    titleAr: "نربط المملكة العربية السعودية بالعالم.",
    subtitle: "Over 25 Years of Trusted Logistics, Freight Forwarding, and Customs Clearance Across Saudi Arabia, the GCC, and Global Markets.",
    subtitleAr: "أكثر من 25 عامًا من الخدمات اللوجستية الموثوقة، وخدمات الشحن الدولي، والتخليص الجمركي في المملكة العربية السعودية ودول مجلس التعاون الخليجي والأسواق العالمية.",
  },
];

const airChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "Fast. Reliable. Worldwide.",
    titleAr: "سريع. موثوق. حول العالم.",
    subtitle: "Air and ocean freight solutions connecting Saudi Arabia to destinations worldwide.",
    subtitleAr: "حلول الشحن الجوي والبحري التي تربط المملكة العربية السعودية بوجهات حول العالم.",
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Customs Clearance. Often Within 24 Hours",
    titleAr: "التخليص الجمركي. غالبًا خلال 24 ساعة.",
    subtitle: "SABER and SFDA documentation support. ATA Carnet specialists. Customs clearance decisions remain with the relevant authorities.",
    subtitleAr: "دعم مستندات سابر وهيئة الغذاء والدواء. خبراء كارنيه ATA. وتبقى قرارات التخليص لدى الجهات المختصة.",
  },
];

const warehouseChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "Exhibition. Project. Transit. Cargo.",
    titleAr: "معارض. مشاريع. عبور. بضائع.",
    subtitle: "Enquiries for temporary imports, re-exports, project cargo and cross-border transit; route and operator availability must be confirmed.",
    subtitleAr: "خدمات لوجستية متخصصة للاستيراد المؤقت وإعادة التصدير وبضائع المشاريع.",
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Storage & distribution enquiries",
    titleAr: "استفسارات التخزين والتوزيع",
    subtitle: "Share the preferred location, cargo, handling needs and storage period; facility and operator availability must be confirmed.",
    subtitleAr: "أرسل الموقع المفضل ونوع البضاعة ومتطلبات المناولة ومدة التخزين؛ ويجب تأكيد توفر المنشأة والمشغّل.",
  },
];

export default function Home() {
  const { t, isRtl } = useLanguage();
  const [, setLocation] = useLocation();
  const [tracking, setTracking] = useState("");

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (tracking) setLocation(`/track?id=${tracking}`);
  };

  return (
    <div className="w-full">

      {/* Primary page heading — visually handled by the cinematic hero below,
          exposed here for crawlers and screen readers (single H1). */}
      <h1 className="sr-only">
        {t(
          "ENVOD KINGDOM Shipping Services LLC — 25+ Years of Logistics Excellence | Exhibition Logistics, ATA Carnet, Customs Clearance & Freight in Saudi Arabia",
          "إنفود كينغدوم لخدمات الشحن — أكثر من 25 عامًا من التميز اللوجستي | لوجستيات المعارض وكارنيه ATA والتخليص الجمركي والشحن في المملكة العربية السعودية",
        )}
      </h1>

      {/* ── Scroll-Driven Animation Sections (Autoplay) ── */}
      <ScrollAnimSection
        frameFolder="crane"
        frameCount={120}
        chapters={craneChapters}
        isRtl={isRtl}
      />

      <ScrollAnimSection
        frameFolder="air"
        frameCount={120}
        chapters={airChapters}
        isRtl={isRtl}
      />

      <ScrollAnimSection
        frameFolder="warehouse"
        frameCount={120}
        chapters={warehouseChapters}
        isRtl={isRtl}
      />

      {/* ── Stats Counter ── */}
      <StatsCounter />

      {/* ── Exhibition Logistics Highlight ── */}
      <ExhibitionSection />

      {/* ── Comprehensive Services ── */}
      <ServicesSection />

      {/* ── Customs Clearance ── */}
      <CustomsClearanceSection />

      {/* ── Client Logo Marquee ── */}
      <ClientMarquee />

      {/* ── Shipment Status Request ── */}
      <section className="py-20 border-y" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {t("SHIPMENT STATUS SUPPORT", "دعم حالة الشحنات")}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#0A2342" }}>
              {t("Request a Shipment Status Update", "اطلب تحديثاً عن حالة الشحنة")}
            </h3>
            <p className="mb-6 text-sm" style={{ color: "#64748B" }}>
              {t(
                "This page does not provide live online tracking. Enter your booking or shipment reference to request an update from our team.",
                "لا توفر هذه الصفحة تتبعاً مباشراً للشحنات عبر الإنترنت. أدخل رقم الحجز أو مرجع الشحنة لطلب تحديث من فريقنا.",
              )}
            </p>
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4`} style={{ color: "#94A3B8" }} />
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder={t("Booking or shipment reference", "رقم الحجز أو مرجع الشحنة")}
                  className={`bg-white border-[#E2E8F0] text-[#1A202C] placeholder:text-[#94A3B8] focus:border-secondary ${isRtl ? "pr-10" : "pl-10"} py-5`}
                />
              </div>
              <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white py-5 px-7 shrink-0 shadow-md shadow-secondary/20 hover:-translate-y-0.5 transition-transform">
                {t("Request status update", "اطلب تحديث الحالة")}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Customs Clearance & Delivery for Global Logistics Leaders ── */}
      <LogisticsLeadersSection />

      {/* ── Industries We Serve ── */}
      <IndustriesSection />

      {/* ── Trust Stats ── */}
      <TrustSection />

      {/* ── Premium CTA ── */}
      <PremiumCTA />

      {/* ── FAQ ── */}
      <FAQSection />

    </div>
  );
}

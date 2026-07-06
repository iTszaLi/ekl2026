import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import dhlLogo from "@assets/logo_dhl.webp";
import fedexLogo from "@assets/logo_fedex.webp";
import aramexLogo from "@assets/logo_aramex.webp";
import dsvLogo from "@assets/logo_dsv.webp";
import cevaLogo from "@assets/logo_ceva.webp";
import schenkerLogo from "@assets/logo_schenker.webp";

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

const LOGISTICS_LEADERS = [
  { name: "DHL",            logo: dhlLogo },
  { name: "FedEx",          logo: fedexLogo },
  { name: "Aramex",         logo: aramexLogo },
  { name: "DSV",            logo: dsvLogo },
  { name: "CEVA Logistics", logo: cevaLogo },
  { name: "DB Schenker",    logo: schenkerLogo },
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
            {t("SERVING GLOBAL LOGISTICS NETWORKS", "نخدم شبكات اللوجستيات العالمية")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black"
            style={{ color: "#0A2342" }}
          >
            {t("Customs Clearance & Delivery for", "التخليص الجمركي والتوصيل")}
            <span className="text-secondary"> {t("Global Logistics Leaders", "لكبرى شركات اللوجستيات العالمية")}</span>
          </motion.h2>
        </div>

        {/* Logo showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {LOGISTICS_LEADERS.map(({ name, logo }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 16px 40px -8px rgba(10,35,66,0.14)" }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-secondary/30 transition-all group cursor-default flex items-center justify-center h-28 px-6"
            >
              <img
                src={logo}
                alt={name}
                loading="lazy"
                className="max-h-14 w-full object-contain rounded-md [filter:grayscale(0.35)] opacity-90 group-hover:[filter:grayscale(0)] group-hover:opacity-100 transition-[filter,opacity] duration-300"
              />
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
            "We provide professional customs clearance and nationwide delivery services for leading international freight forwarders, courier companies, and logistics providers operating in Saudi Arabia. Our team ensures fast customs processing, compliant documentation, and reliable transportation from ports and airports to final destinations across the Kingdom.",
            "نقدم خدمات احترافية في التخليص الجمركي والتوصيل داخل المملكة لكبرى شركات الشحن الدولي وشركات البريد السريع ومزودي الخدمات اللوجستية العاملين في المملكة العربية السعودية. يحرص فريقنا على إنجاز الإجراءات الجمركية بسرعة، وإعداد مستندات متوافقة مع الأنظمة، وتوفير نقل موثوق من الموانئ والمطارات إلى الوجهات النهائية في مختلف أنحاء المملكة.",
          )}
        </motion.p>

        {/* Identification-only disclaimer */}
        <p className="text-center text-[11px] mt-5 max-w-2xl mx-auto" style={{ color: "#94A3B8" }}>
          {t(
            "Company logos are shown for identification purposes only and do not imply partnership, endorsement, or exclusivity.",
            "تُعرض شعارات الشركات لأغراض التعريف فقط ولا تعني أي شراكة رسمية أو تأييد أو حصرية.",
          )}
        </p>
      </div>
    </section>
  );
}

const craneChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "25+ YEARS OF LOGISTICS EXCELLENCE.",
    titleAr: "أكثر من 25 عاماً من التميز اللوجستي.",
    subtitle: "Saudi Arabia's Trusted Partner For Exhibition Logistics, ATA Carnet Services, Customs Clearance and Global Freight Solutions.",
    subtitleAr: "الشريك الموثوق للمملكة العربية السعودية في لوجستيات المعارض وكارنيه ATA والتخليص الجمركي.",
    features: ["ATA Carnet Specialists", "Customs Clearance Often Within 24 Hours", "GCC Road Transport", "Air · Sea · Land Freight", "Exhibition & Trade Shows"],
    featuresAr: ["متخصصون في كارنيه ATA", "تخليص جمركي غالباً خلال 24 ساعة", "نقل بري خليجي", "جوي · بحري · بري", "المعارض والمؤتمرات"],
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Connecting Saudi Arabia. To The World.",
    titleAr: "ربط المملكة العربية السعودية. بالعالم.",
    subtitle: "Serving Saudi Arabia, GCC Countries and Global Markets for More Than 25 Years.",
    subtitleAr: "نخدم المملكة العربية السعودية ودول الخليج والأسواق العالمية منذ أكثر من 25 عاماً.",
  },
];

const airChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "Fast. Reliable. Worldwide.",
    titleAr: "سريع. موثوق. عالمي.",
    subtitle: "Air and ocean freight solutions connecting Saudi Arabia to 50+ countries with reliable transit times.",
    subtitleAr: "حلول الشحن الجوي والبحري تربط المملكة بأكثر من 50 دولة بأوقات عبور موثوقة.",
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Customs Clearance. Often Within 24 Hours.",
    titleAr: "التخليص الجمركي. غالباً خلال 24 ساعة.",
    subtitle: "SABER & SFDA certified. ATA Carnet specialists. Direct Saudi Customs Authority relationships.",
    subtitleAr: "معتمد سابر وهيئة الغذاء والدواء. متخصصون كارنيه ATA. علاقات مباشرة مع هيئة الجمارك السعودية.",
  },
];

const warehouseChapters: AnimChapter[] = [
  {
    startProgress: 0,
    endProgress: 0.48,
    title: "Exhibition. Project. Transit. Cargo.",
    titleAr: "معارض. مشاريع. عبور. بضائع.",
    subtitle: "Specialized logistics for temporary imports, re-exports, project cargo and transit shipments across the GCC.",
    subtitleAr: "خدمات لوجستية متخصصة للاستيراد المؤقت وإعادة التصدير وبضائع المشاريع.",
  },
  {
    startProgress: 0.5,
    endProgress: 1,
    title: "Technology Driven. Saudi Excellence.",
    titleAr: "تقنيات متقدمة. تميز سعودي.",
    subtitle: "State-of-the-art warehousing, fleet management and supply chain solutions across Saudi Arabia.",
    subtitleAr: "تخزين وإدارة أسطول وحلول سلسلة التوريد المتطورة في جميع أنحاء المملكة العربية السعودية.",
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
          "ENVOD KINGDOM Shipping Services LLC — Logistics, Customs Clearance & Freight Forwarding in Saudi Arabia and the GCC",
          "إنفود كينغدوم لخدمات الشحن — الخدمات اللوجستية والتخليص الجمركي والشحن في المملكة العربية السعودية ودول الخليج",
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

      {/* ── Track Shipment ── */}
      <section className="py-20 border-y" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {t("REAL-TIME TRACKING", "التتبع الفوري")}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#0A2342" }}>
              {t("Track Your Cargo", "تتبع شحنتك")}
            </h3>
            <p className="mb-6 text-sm" style={{ color: "#64748B" }}>
              {t("Enter your tracking, reference, or invoice number.", "أدخل رقم التتبع أو المرجع أو الفاتورة.")}
            </p>
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4`} style={{ color: "#94A3B8" }} />
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder={t("e.g. ENVOD-2024-001", "مثال: ENVOD-2024-001")}
                  className={`bg-white border-[#E2E8F0] text-[#1A202C] placeholder:text-[#94A3B8] focus:border-secondary ${isRtl ? "pr-10" : "pl-10"} py-5`}
                />
              </div>
              <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white py-5 px-7 shrink-0 shadow-md shadow-secondary/20 hover:-translate-y-0.5 transition-transform">
                {t("Track", "تتبع")}
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

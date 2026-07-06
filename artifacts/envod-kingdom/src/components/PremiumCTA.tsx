import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { ArrowRight, Phone } from "lucide-react";

const BADGES = [
  { en: "25+ Years Experience",           ar: "أكثر من 25 عاماً" },
  { en: "GCC Coverage",                   ar: "تغطية خليجية" },
  { en: "24/7 Support",                   ar: "دعم 24/7" },
  { en: "Licensed Customs Broker",        ar: "وسيط جمركي مرخّص" },
  { en: "Fast Customs Clearance",         ar: "تخليص جمركي سريع" },
  { en: "Exhibition Logistics Experts",   ar: "خبراء لوجستيات المعارض" },
];

export function PremiumCTA() {
  const { t, isRtl } = useLanguage();

  return (
    <section
      className="relative overflow-hidden"
      aria-label={t("Get Started with ENVOD KINGDOM", "ابدأ مع انفود كينجدم")}
      style={{ background: "linear-gradient(135deg,#020d1c 0%,#041224 50%,#060a14 100%)" }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle,#D62828 0%,transparent 70%)", animation: "cta-orb1 12s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle,#1a4a8a 0%,transparent 70%)", animation: "cta-orb2 15s ease-in-out infinite alternate" }}
        />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className={`container mx-auto px-4 py-24 md:py-32 relative z-10 text-center ${isRtl ? "rtl" : ""}`}>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-secondary text-[10px] font-bold tracking-[0.45em] uppercase mb-5"
        >
          {t("YOUR TRUSTED LOGISTICS PARTNER", "شريكك اللوجستي الموثوق")}
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.7 }}
          className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 max-w-5xl mx-auto"
        >
          {t("Saudi Arabia's Trusted", "الشريك الموثوق للوجستيات")}
          <br />
          <span className="text-secondary">{t("Logistics & Customs Clearance", "والتخليص الجمركي")}</span>
          <br />
          {t("Partner", "في المملكة العربية السعودية")}
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/50 max-w-3xl mx-auto mb-10 text-base md:text-lg leading-relaxed"
        >
          {t(
            "Providing reliable Container Transportation, Road Freight, Air Freight, Sea Freight, Customs Clearance, Project Cargo, Exhibition Logistics, Warehousing, and GCC Cross-Border Shipping.",
            "نقدم خدمات موثوقة في نقل الحاويات والشحن البري والجوي والبحري والتخليص الجمركي وبضائع المشاريع ولوجستيات المعارض والتخزين والشحن العابر لدول الخليج.",
          )}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`flex flex-col sm:flex-row gap-4 justify-center mb-14 ${isRtl ? "sm:flex-row-reverse" : ""}`}
        >
          <Link
            href="/contact"
            className={`group inline-flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/85 text-white py-4 px-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-secondary/30 hover:-translate-y-0.5 hover:shadow-secondary/40 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {t("Get a Free Quote", "احصل على عرض سعر مجاني")}
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`} />
          </Link>
          <Link
            href="/contact"
            className={`group inline-flex items-center justify-center gap-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 text-white py-4 px-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all backdrop-blur-sm ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <Phone className="w-4 h-4" />
            {t("Contact Our Experts", "تواصل مع خبرائنا")}
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {BADGES.map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-none" />
              <span className="text-[11px] font-semibold text-white/70 whitespace-nowrap">
                {isRtl ? badge.ar : badge.en}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes cta-orb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(80px,-60px) scale(1.2); } }
        @keyframes cta-orb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px,80px) scale(1.15); } }
      `}</style>
    </section>
  );
}

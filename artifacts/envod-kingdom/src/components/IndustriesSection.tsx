import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import {
  Flame, HeartPulse, Pill, ShoppingBasket, Car, Building2,
  Gem, ShoppingBag, Landmark, Factory, MousePointerClick, Star,
} from "lucide-react";

interface Industry {
  icon: React.ElementType;
  color: string;
  bg: string;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  tagEn?: string;
  tagAr?: string;
  href?: string;
}

const INDUSTRIES: Industry[] = [
  {
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10 group-hover:bg-orange-500/20",
    en: "Oil & Gas",
    ar: "النفط والغاز",
    descEn: "Heavy-lift equipment, pipeline supplies, HAZMAT and project cargo for Saudi Aramco, SABIC and EPC contractors.",
    descAr: "معدات ثقيلة وإمدادات خطوط الأنابيب وبضائع المشاريع لأرامكو وسابك والمقاولين.",
    tagEn: "Project Cargo",
    tagAr: "بضائع المشاريع",
  },
  {
    icon: HeartPulse,
    color: "text-red-400",
    bg: "bg-red-500/10 group-hover:bg-red-500/20",
    en: "Healthcare",
    ar: "الرعاية الصحية",
    descEn: "Medical devices, hospital equipment and sensitive cargo with SFDA clearance and cold-chain management.",
    descAr: "أجهزة طبية ومعدات مستشفيات مع تخليص هيئة الغذاء والدواء وإدارة سلسلة التبريد.",
    tagEn: "SFDA Certified",
    tagAr: "معتمد SFDA",
  },
  {
    icon: Pill,
    color: "text-blue-400",
    bg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    en: "Pharmaceuticals",
    ar: "الأدوية",
    descEn: "GDP-compliant cold chain, temperature-controlled air freight and pharmaceutical import clearance.",
    descAr: "سلسلة برودة متوافقة مع GDP وشحن جوي مبرد وتخليص استيراد الأدوية.",
    tagEn: "Cold Chain",
    tagAr: "سلسلة التبريد",
  },
  {
    icon: ShoppingBasket,
    color: "text-green-400",
    bg: "bg-green-500/10 group-hover:bg-green-500/20",
    en: "Food & Beverage",
    ar: "الغذاء والمشروبات",
    descEn: "Reefer containers, SFDA & halal compliance, supermarket distribution and perishable goods handling.",
    descAr: "حاويات مبردة وامتثال هيئة الغذاء والدواء وشهادة الحلال وتوزيع لمتاجر التجزئة.",
    tagEn: "Halal Certified",
    tagAr: "شهادة الحلال",
  },
  {
    icon: Car,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 group-hover:bg-yellow-500/20",
    en: "Automotive",
    ar: "السيارات",
    descEn: "RoRo vehicle shipping, spare parts logistics, automotive plant supply and dealer deliveries.",
    descAr: "شحن مركبات RoRo ولوجستيات قطع الغيار وتوريد مصانع السيارات.",
    href: "/industries/automotive-logistics",
  },
  {
    icon: Building2,
    color: "text-stone-400",
    bg: "bg-stone-500/10 group-hover:bg-stone-500/20",
    en: "Construction",
    ar: "البناء والإنشاء",
    descEn: "Steel, cement, machinery, Vision 2030 project supplies and oversized construction equipment movement.",
    descAr: "الصلب والإسمنت والآلات وإمدادات مشاريع رؤية 2030 والمعدات الضخمة.",
    href: "/industries/construction-logistics",
  },
  {
    icon: Gem,
    color: "text-purple-400",
    bg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    en: "Mining",
    ar: "التعدين",
    descEn: "Ma'aden and mining sector logistics — heavy equipment, chemicals, explosives and mineral export.",
    descAr: "لوجستيات قطاع التعدين لمعادن والمناجم — معدات ثقيلة وكيماويات ومتفجرات وتصدير معادن.",
  },
  {
    icon: ShoppingBag,
    color: "text-pink-400",
    bg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    en: "Retail",
    ar: "تجارة التجزئة",
    descEn: "LCL consolidation, distribution center replenishment, retail import customs and last-mile delivery.",
    descAr: "تجميع LCL وتجديد مراكز التوزيع وتخليص استيراد التجزئة والتوصيل الأخير.",
    href: "/industries/retail-logistics",
  },
  {
    icon: Landmark,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    en: "Government Projects",
    ar: "المشاريع الحكومية",
    descEn: "NEOM, Qiddiya, Red Sea Project — specialized procurement logistics, ATA Carnet and bonded warehousing.",
    descAr: "نيوم وقدية ومشروع البحر الأحمر — لوجستيات المشتريات وكارنيه ATA والمستودعات الجمركية.",
    tagEn: "ATA Carnet",
    tagAr: "كارنيه ATA",
  },
  {
    icon: Factory,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    en: "Manufacturing",
    ar: "التصنيع",
    descEn: "Raw material imports, production line supply, bonded warehousing and finished goods export.",
    descAr: "استيراد المواد الخام وتوريد خطوط الإنتاج والتصدير والمستودعات الجمركية.",
  },
  {
    icon: MousePointerClick,
    color: "text-sky-400",
    bg: "bg-sky-500/10 group-hover:bg-sky-500/20",
    en: "E-Commerce",
    ar: "التجارة الإلكترونية",
    descEn: "Fulfillment, returns management, cross-border import duty handling and express last-mile delivery.",
    descAr: "الوفاء والمرتجعات وإدارة رسوم الاستيراد العابر والتوصيل السريع.",
  },
  {
    icon: Star,
    color: "text-secondary",
    bg: "bg-secondary/10 group-hover:bg-secondary/20",
    en: "Exhibition & Events",
    ar: "المعارض والفعاليات",
    descEn: "End-to-end exhibition logistics — ATA Carnet, temporary import, on-site handling and re-export.",
    descAr: "لوجستيات معارض متكاملة — كارنيه ATA واستيراد مؤقت ومناولة ميدانية وإعادة تصدير.",
    tagEn: "ENVOD Specialist",
    tagAr: "متخصص انفود",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function IndustriesSection() {
  const { t, isRtl } = useLanguage();

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Subtle light decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #0A2342 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #D62828 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div className={`text-center mb-16 ${isRtl ? "rtl" : ""}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
          >
            {t("INDUSTRIES WE SERVE", "القطاعات التي نخدمها")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl md:text-5xl font-black mb-4 leading-tight"
            style={{ color: "#0A2342" }}
          >
            {t("Logistics Expertise Across", "خبرة لوجستية عبر")}
            <span className="text-secondary"> {t("Every Industry", "كل القطاعات")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="max-w-2xl mx-auto text-sm leading-relaxed"
            style={{ color: "#64748B" }}
          >
            {t(
              "From Saudi Aramco's mega-projects to Qiddiya's entertainment cargo — ENVOD KINGDOM delivers specialised logistics solutions across 12 key industries.",
              "من مشاريع أرامكو العملاقة إلى شحنات قدية الترفيهية — يقدم انفود كينجدم حلولاً لوجستية متخصصة عبر 12 قطاعاً رئيسياً.",
            )}
          </motion.p>
        </div>

        {/* Industry grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            const name   = isRtl ? ind.ar    : ind.en;
            const desc   = isRtl ? ind.descAr : ind.descEn;
            const tag    = isRtl ? ind.tagAr  : ind.tagEn;
            const CardTag: React.ElementType = ind.href ? Link : "div";
            const cardProps = ind.href ? { href: ind.href } : {};

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="group relative"
              >
                <CardTag
                  {...cardProps}
                  className={`
                    relative flex flex-col items-center text-center p-5 rounded-2xl ${ind.href ? "cursor-pointer" : "cursor-default"}
                    bg-white border border-[#E2E8F0] hover:border-secondary/30
                    shadow-sm hover:shadow-md
                    transition-all duration-300 h-full
                  `}
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%,rgba(214,40,40,0.04) 0%,transparent 70%)" }}
                  />

                  {/* Tag badge */}
                  {tag && (
                    <span className="absolute top-3 right-3 text-[8px] font-bold tracking-widest uppercase text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${ind.bg}`}>
                    <Icon className={`w-6 h-6 ${ind.color} transition-transform duration-300 group-hover:scale-110`} />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-[13px] leading-tight mb-2" style={{ color: "#0A2342" }}>{name}</h3>

                  {/* Description */}
                  <p className="text-[10px] leading-relaxed transition-colors duration-300" style={{ color: "#94A3B8" }}>
                    {desc}
                  </p>
                </CardTag>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-sm mb-5" style={{ color: "#64748B" }}>
            {t(
              "Don't see your industry? We handle all cargo types.",
              "لا ترى قطاعك؟ نتعامل مع جميع أنواع البضائع.",
            )}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/85 text-white px-10 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-secondary/20 hover:-translate-y-0.5"
          >
            {t("Discuss Your Logistics Needs", "ناقش احتياجاتك اللوجستية")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

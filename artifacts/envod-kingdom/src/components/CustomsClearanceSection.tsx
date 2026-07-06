import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { Link } from "wouter";
import {
  ShieldCheck,
  Clock,
  FileCheck,
  Repeat2,
  Globe2,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Timer,
  ScrollText,
  Plane,
  FileUp,
  ScanSearch,
  PackageCheck,
  Check,
  Headset,
  MessagesSquare,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    en: "Saudi Customs Expertise",
    ar: "خبرة في الجمارك السعودية",
    descEn: "Licensed customs brokerage for smooth import and export clearance.",
    descAr: "وساطة جمركية مرخّصة لتخليص استيراد وتصدير سلس.",
  },
  {
    icon: BadgeCheck,
    en: "SABER Certification Support",
    ar: "دعم شهادة سابر",
    descEn: "Product registration and SABER certification handled end to end.",
    descAr: "تسجيل المنتجات وإصدار شهادات سابر من البداية إلى النهاية.",
  },
  {
    icon: ClipboardCheck,
    en: "SFDA Regulatory Support",
    ar: "دعم هيئة الغذاء والدواء (SFDA)",
    descEn: "Regulatory clearance for food, pharmaceutical, and medical shipments.",
    descAr: "تخليص تنظيمي لشحنات الغذاء والأدوية والمستلزمات الطبية.",
  },
  {
    icon: Timer,
    en: "Temporary Import Clearance",
    ar: "تخليص الاستيراد المؤقت",
    descEn: "Temporary admission handling for equipment, demos, and event cargo.",
    descAr: "إدخال مؤقت للمعدات والعينات وبضائع الفعاليات.",
  },
  {
    icon: FileCheck,
    en: "ATA Carnet Processing",
    ar: "معالجة كارنيه ATA",
    descEn: "Carnet documentation for duty-free temporary import and re-export.",
    descAr: "وثائق الكارنيه للاستيراد المؤقت وإعادة التصدير دون رسوم.",
  },
  {
    icon: Repeat2,
    en: "Re-Export Documentation",
    ar: "وثائق إعادة التصدير",
    descEn: "Complete paperwork for returning cargo after projects and exhibitions.",
    descAr: "أوراق كاملة لإعادة البضائع بعد المشاريع والمعارض.",
  },
  {
    icon: Globe2,
    en: "Import / Export Compliance",
    ar: "امتثال الاستيراد والتصدير",
    descEn: "Ongoing guidance across Saudi import and export regulations.",
    descAr: "إرشاد مستمر حول أنظمة الاستيراد والتصدير السعودية.",
  },
  {
    icon: ScrollText,
    en: "IEC Certificate Assistance",
    ar: "المساعدة في شهادة IEC",
    descEn: "Support for obtaining and managing Importer/Exporter Code documentation.",
    descAr: "دعم في استخراج وإدارة وثائق رمز المستورد والمصدر (IEC).",
  },
  {
    icon: Plane,
    en: "GACA Approvals",
    ar: "موافقات هيئة الطيران المدني",
    descEn: "GACA approvals and documentation for air cargo and regulated aviation imports.",
    descAr: "موافقات ووثائق الهيئة العامة للطيران المدني للشحن الجوي والواردات المنظمة.",
  },
];

const STEPS = [
  {
    step: "01",
    icon: FileUp,
    en: "Submit Documents",
    ar: "تقديم المستندات",
    descEn: "Upload invoices, packing lists, and shipment paperwork.",
    descAr: "ارفع الفواتير وقوائم التعبئة ومستندات الشحنة.",
  },
  {
    step: "02",
    icon: ScanSearch,
    en: "Customs Review",
    ar: "مراجعة الجمارك",
    descEn: "Authorities verify documentation and shipment compliance.",
    descAr: "تتحقق الجهات المختصة من المستندات وامتثال الشحنة.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    en: "Approval Issued",
    ar: "إصدار الموافقة",
    descEn: "Customs approval is processed electronically.",
    descAr: "تتم معالجة الموافقة الجمركية إلكترونياً.",
  },
  {
    step: "04",
    icon: PackageCheck,
    en: "Cargo Released",
    ar: "الإفراج عن البضاعة",
    descEn: "Shipment is cleared for final delivery.",
    descAr: "يتم الإفراج عن الشحنة للتسليم النهائي.",
  },
];

const WHY_CHOOSE = [
  { icon: Users,          en: "Experienced Saudi customs specialists",       ar: "متخصصون ذوو خبرة في الجمارك السعودية" },
  { icon: FileCheck,      en: "Fast documentation processing",               ar: "معالجة سريعة للمستندات" },
  { icon: ShieldCheck,    en: "Compliance with SABER & SFDA requirements",   ar: "الامتثال لمتطلبات سابر وهيئة الغذاء والدواء" },
  { icon: MessagesSquare, en: "Transparent communication",                   ar: "تواصل شفاف" },
  { icon: Headset,        en: "Dedicated customer support",                  ar: "دعم مخصص للعملاء" },
];

export function CustomsClearanceSection() {
  const { t, isRtl } = useLanguage();

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(160deg, #020c1b 0%, #041525 40%, #070e1f 100%)" }}>
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      {/* Navy sidebar accent */}
      <div
        className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-secondary to-transparent ${isRtl ? "right-0" : "left-0"}`}
      />
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 20% 50%, rgba(10,35,66,0.4) 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-20 ${isRtl ? "rtl" : ""}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-4"
          >
            {t("CUSTOMS EXPERTISE", "خبرة جمركية")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-4 mb-6"
          >
            <Clock className="w-10 h-10 text-secondary hidden md:block" />
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              {t("Customs Clearance", "التخليص الجمركي")}
              <br />
              <span className="text-secondary">{t("Often Within 24 Hours", "غالباً خلال 24 ساعة")}</span>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/55 max-w-xl mx-auto text-sm leading-relaxed"
          >
            {t(
              "Direct relationships with the Saudi Customs Authority enable us to deliver fast, reliable customs clearance across the Kingdom.",
              "علاقاتنا المباشرة مع هيئة الجمارك السعودية تمكّننا من تقديم تخليص جمركي سريع وموثوق في المملكة.",
            )}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left: Feature list */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-xs font-bold tracking-widest uppercase text-white/40 mb-6 ${isRtl ? "text-right" : ""}`}
            >
              {t("SERVICES INCLUDED", "الخدمات المشمولة")}
            </motion.p>

            <div className="space-y-3.5">
              {FEATURES.map(({ icon: Icon, en, ar, descEn, descAr }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`relative flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.025] backdrop-blur-sm transition-all duration-300 group cursor-default overflow-hidden
                    hover:border-secondary/35 hover:bg-white/[0.05] hover:shadow-[0_10px_36px_rgba(214,40,40,0.12),0_0_0_1px_rgba(214,40,40,0.15)]
                    ${isRtl ? "flex-row-reverse text-right" : ""}`}
                >
                  {/* Brand-red accent border */}
                  <div
                    className={`absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-secondary/70 via-secondary/35 to-secondary/10 opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${isRtl ? "right-0" : "left-0"}`}
                  />
                  <div className="w-11 h-11 rounded-lg bg-secondary/10 border border-secondary/15 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-secondary/20 group-hover:scale-110 group-hover:border-secondary/30">
                    <Icon className="w-5 h-5 text-secondary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white/85 font-semibold text-sm group-hover:text-white transition-colors leading-snug">
                      {isRtl ? ar : en}
                    </p>
                    <p className="text-white/40 text-[12.5px] leading-relaxed mt-1 group-hover:text-white/55 transition-colors">
                      {isRtl ? descAr : descEn}
                    </p>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 text-secondary/0 group-hover:text-secondary/70 transition-all shrink-0 mt-1.5 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true" />
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="mt-9 mb-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={isRtl ? "text-right" : ""}
            >
              <Link
                href="/contact"
                className={`relative inline-flex items-center gap-3 text-white px-10 py-4.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 group/cta overflow-hidden
                  shadow-[0_8px_30px_rgba(214,40,40,0.3)] hover:shadow-[0_12px_44px_rgba(214,40,40,0.45)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#041525]
                  ${isRtl ? "flex-row-reverse" : ""}`}
                style={{ background: "linear-gradient(135deg, #D62828 0%, #A31E1E 100%)" }}
              >
                {/* Hover glow sweep */}
                <span
                  className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)" }}
                  aria-hidden="true"
                />
                <span className="relative">{t("Start Customs Clearance", "ابدأ التخليص الجمركي")}</span>
                <ArrowRight
                  className={`relative w-4 h-4 transition-transform duration-300 ${isRtl ? "rotate-180 group-hover/cta:-translate-x-1" : "group-hover/cta:translate-x-1"}`}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>

          {/* Right: Process timeline */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-xs font-bold tracking-widest uppercase text-white/40 mb-6 ${isRtl ? "text-right" : ""}`}
            >
              {t("OUR PROCESS", "عمليتنا")}
            </motion.p>

            <div className="relative">
              {/* Animated vertical progress line — bubbles sit visually left in both
                  LTR and RTL (step rows use flex-row-reverse under dir=rtl) */}
              <div className="absolute top-7 bottom-7 left-7 w-px bg-white/8" aria-hidden="true">
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                  className="absolute inset-0 origin-top bg-gradient-to-b from-secondary/70 via-secondary/40 to-secondary/10"
                />
              </div>

              <div className="space-y-5">
                {STEPS.map(({ step, icon: Icon, en, ar, descEn, descAr }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className={`relative flex items-start gap-5 group ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    {/* Step bubble */}
                    <motion.div
                      whileInView={{ scale: [0.8, 1.08, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.1, duration: 0.4 }}
                      className="w-14 h-14 rounded-full border-2 border-secondary/40 bg-[#061428] flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 group-hover:border-secondary group-hover:shadow-[0_0_24px_rgba(214,40,40,0.35)]"
                    >
                      <span className="text-secondary font-black text-sm">{step}</span>
                    </motion.div>

                    {/* Content card */}
                    <div
                      className={`flex-1 p-5 rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm transition-all duration-300
                        group-hover:border-secondary/30 group-hover:bg-white/[0.055] group-hover:shadow-[0_8px_28px_rgba(214,40,40,0.1)]
                        ${isRtl ? "text-right" : ""}`}
                    >
                      <div className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <Icon className="w-4 h-4 text-secondary/80 shrink-0" aria-hidden="true" />
                        <p className="text-white font-semibold text-sm">{isRtl ? ar : en}</p>
                      </div>
                      <p className="text-white/45 text-[12.5px] leading-relaxed mt-1.5 group-hover:text-white/60 transition-colors">
                        {isRtl ? descAr : descEn}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Why Choose ENVOD — premium card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`relative mt-10 rounded-2xl border border-secondary/25 overflow-hidden backdrop-blur-sm ${isRtl ? "text-right" : ""}`}
              style={{ background: "linear-gradient(150deg, rgba(214,40,40,0.09) 0%, rgba(214,40,40,0.03) 45%, rgba(10,35,66,0.25) 100%)" }}
            >
              {/* Corner glow */}
              <div
                className={`absolute top-0 w-48 h-48 pointer-events-none opacity-50 ${isRtl ? "right-0" : "left-0"}`}
                style={{ background: `radial-gradient(circle at ${isRtl ? "100%" : "0%"} 0%, rgba(214,40,40,0.2) 0%, transparent 70%)` }}
                aria-hidden="true"
              />
              <div className="relative p-6 md:p-7">
                <div className={`flex items-center gap-3 mb-5 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className="w-9 h-9 rounded-lg bg-secondary/15 border border-secondary/25 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5 text-secondary" aria-hidden="true" />
                  </div>
                  <span className="text-white font-bold text-base tracking-wide">
                    {t("Why Choose ENVOD", "لماذا تختار انفود")}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {WHY_CHOOSE.map(({ icon: Icon, en, ar }, i) => (
                    <li key={i} className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span className="w-6 h-6 rounded-full bg-secondary/12 border border-secondary/25 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                      </span>
                      <span className={`flex items-center gap-2 text-white/70 text-[13px] leading-snug ${isRtl ? "flex-row-reverse" : ""}`}>
                        <Icon className="w-3.5 h-3.5 text-white/35 shrink-0 hidden sm:block" aria-hidden="true" />
                        {isRtl ? ar : en}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-secondary/25 via-white/8 to-transparent mb-5" />

                {/* Commitment note */}
                <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Clock className="w-4.5 h-4.5 text-secondary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-secondary font-bold text-[11px] tracking-wider uppercase mb-1">
                      {t("ENVOD COMMITMENT", "التزام انفود")}
                    </p>
                    <p className="text-white/60 text-[12.5px] leading-relaxed">
                      {t(
                        "We work to clear customs as quickly as possible — many shipments clear within 24 hours — and we personally follow up with the Saudi Customs Authority on your behalf.",
                        "نعمل على إنجاز التخليص الجمركي بأسرع وقت ممكن — وتُخلَّص العديد من الشحنات خلال 24 ساعة — ونتابع شخصياً مع هيئة الجمارك السعودية نيابةً عنك.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

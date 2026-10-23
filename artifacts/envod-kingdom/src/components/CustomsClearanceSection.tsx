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
    descEn: "Documentation and coordination support for import and export clearance.",
    descAr: "دعم المستندات والتنسيق لتخليص شحنات الاستيراد والتصدير.",
  },
  {
    icon: BadgeCheck,
    en: "SABER Certification Support",
    ar: "دعم شهادة سابر",
    descEn: "Discuss product-specific conformity steps; certificates and approvals follow the applicable process and authority.",
    descAr: "ناقش خطوات المطابقة الخاصة بالمنتج؛ وتخضع الشهادات والموافقات للإجراء والجهة المختصة.",
  },
  {
    icon: ClipboardCheck,
    en: "SFDA Regulatory Support",
    ar: "دعم هيئة الغذاء والدواء (SFDA)",
    descEn: "Review document requirements for regulated food, pharmaceutical, and medical shipments; approvals depend on the product and authority.",
    descAr: "مراجعة متطلبات مستندات شحنات الغذاء والأدوية والمستلزمات الطبية المنظمة؛ وتعتمد الموافقات على المنتج والجهة المختصة.",
  },
  {
    icon: Timer,
    en: "Temporary Import Clearance",
    ar: "تخليص الاستيراد المؤقت",
    descEn: "Check temporary-admission options and eligibility for the goods and intended use.",
    descAr: "التحقق من خيارات الإدخال المؤقت وأهلية البضائع والاستخدام المقصود.",
  },
  {
    icon: FileCheck,
    en: "ATA Carnet Processing",
    ar: "معالجة كارنيه ATA",
    descEn: "Coordinate shipment information with the authorized issuing association; issuance and acceptance are determined by the responsible bodies.",
    descAr: "تنسيق معلومات الشحنة مع جهة الإصدار المخوّلة؛ وتحدد الجهات المسؤولة الإصدار والقبول.",
  },
  {
    icon: Repeat2,
    en: "Re-Export Documentation",
    ar: "وثائق إعادة التصدير",
    descEn: "Review re-export documents and deadlines against the original procedure and cargo.",
    descAr: "مراجعة مستندات إعادة التصدير ومواعيدها وفق الإجراء الأصلي والبضاعة.",
  },
  {
    icon: Globe2,
    en: "Import / Export Compliance",
    ar: "امتثال الاستيراد والتصدير",
    descEn: "Discuss shipment-document questions; current requirements and decisions remain with the relevant authorities.",
    descAr: "ناقش استفسارات مستندات الشحنة؛ وتبقى المتطلبات والقرارات الحالية لدى الجهات المختصة.",
  },
  {
    icon: ScrollText,
    en: "Importer / Exporter Record Enquiry",
    ar: "استفسار عن سجلات المستورد والمصدر",
    descEn: "Confirm which registration or business records apply to the shipment and current procedure.",
    descAr: "تأكيد التسجيل أو سجلات الأعمال المنطبقة على الشحنة والإجراء الحالي.",
  },
  {
    icon: Plane,
    en: "GACA Approvals",
    ar: "موافقات هيئة الطيران المدني",
    descEn: "Review air-cargo documents and determine whether a permit or aviation-authority approval applies.",
    descAr: "مراجعة مستندات الشحن الجوي والتحقق مما إذا كان يلزم تصريح أو موافقة من جهة الطيران.",
  },
];

const STEPS = [
  {
    step: "01",
    icon: FileUp,
    en: "Share Shipment Details",
    ar: "مشاركة تفاصيل الشحنة",
    descEn: "Prepare the invoice, packing list, cargo details, and requested gateway.",
    descAr: "جهّز الفاتورة وقائمة التعبئة وتفاصيل البضاعة ومنفذ الدخول المطلوب.",
  },
  {
    step: "02",
    icon: ScanSearch,
    en: "Requirements Review",
    ar: "مراجعة المتطلبات",
    descEn: "Check shipment documents, product-specific requirements, and the responsible operator.",
    descAr: "تحقق من مستندات الشحنة ومتطلبات المنتج والجهة المشغّلة المسؤولة.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    en: "Submission & Authority Review",
    ar: "التقديم ومراجعة الجهة المختصة",
    descEn: "Any declaration or application follows the current operator and authority process.",
    descAr: "يتبع أي إقرار أو طلب الإجراء الحالي لدى المشغّل والجهة المختصة.",
  },
  {
    step: "04",
    icon: PackageCheck,
    en: "Release or Next Step",
    ar: "الفسح أو الخطوة التالية",
    descEn: "The responsible authority determines release; inspections, documents, and approvals may affect timing.",
    descAr: "تحدد الجهة المسؤولة الفسح؛ وقد تؤثر الفحوصات والمستندات والموافقات في المدة.",
  },
];

const WHY_CHOOSE = [
  { icon: Users,          en: "Shipment-specific customs coordination",      ar: "تنسيق جمركي حسب الشحنة" },
  { icon: FileCheck,      en: "Document and requirement review",              ar: "مراجعة المستندات والمتطلبات" },
  { icon: ShieldCheck,    en: "Product-specific conformity questions reviewed", ar: "مراجعة استفسارات مطابقة المنتج" },
  { icon: MessagesSquare, en: "Scope and responsible operator confirmed",      ar: "تأكيد النطاق والجهة المشغّلة المسؤولة" },
  { icon: Headset,        en: "Release decisions remain with authorities",     ar: "تبقى قرارات الفسح لدى الجهات المختصة" },
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
              <span className="text-secondary">{t("Timing Varies by Shipment", "تختلف المدة حسب الشحنة")}</span>
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
              "We can review document and logistics coordination for the requested cargo and gateway. Requirements, inspections, release decisions, and timing depend on the shipment and responsible authorities.",
              "يمكننا مراجعة تنسيق المستندات والخدمات اللوجستية للبضاعة والمنفذ المطلوبين. وتعتمد المتطلبات والفحوصات وقرارات الفسح والمدة على الشحنة والجهات المسؤولة.",
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
                        "We coordinate customs documentation and follow-up. Timing and requirements depend on the shipment, document readiness, customs procedures, and any required approvals.",
                        "ننسق مستندات التخليص ومتابعة الإجراءات. وتعتمد المدة والمتطلبات على الشحنة وجاهزية المستندات والإجراءات الجمركية وأي موافقات لازمة.",
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

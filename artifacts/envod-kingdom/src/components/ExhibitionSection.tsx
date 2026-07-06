import { type MouseEvent } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import {
  CheckCircle2,
  Check,
  ArrowRight,
  BadgeCheck,
  PhoneCall,
  ClipboardList,
  FileText,
  Truck,
  Building2,
  HardHat,
  PackageCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Link } from "wouter";

import logoLeap from "@assets/image_1783126648923.png";
import logoWorldDefense from "@assets/image_1783126675624.png";
import logoPlasticsPetrochem from "@assets/image_1783126624254.png";
import logoSaudiFood from "@assets/image_1783126766781.png";
import logoCityscape from "@assets/image_1783126855621.png";
import logoBig5 from "@assets/image_1783126714478.png";
import logoGlobalHealth from "@assets/image_1783126803493.png";
import logoBookFair from "@assets/image_1783126985787.png";
import logoSaudiBuild from "@assets/image_1783126930810.png";
import logoIndex from "@assets/image_1783126737093.png";
import logoSaudiAg from "@assets/image_1783126483702.png";
import logoFabex from "@assets/image_1783126783660.png";

const SERVICES_GROUP = [
  { en: "ATA Carnet",         ar: "كارنيه ATA" },
  { en: "Exhibition Cargo",   ar: "بضائع المعارض" },
  { en: "Temporary Imports",  ar: "الاستيراد المؤقت" },
  { en: "Temporary Exports",  ar: "التصدير المؤقت" },
];
const CAPABILITIES_GROUP = [
  { en: "Customs Clearance",       ar: "التخليص الجمركي" },
  { en: "Event Equipment",         ar: "معدات الفعاليات" },
  { en: "Trade Show Logistics",    ar: "لوجستيات المعارض" },
  { en: "Re-Exports",              ar: "إعادة التصدير" },
];

const EVENTS = [
  { name: "LEAP",                       year: "2026", city: "Riyadh", cityAr: "الرياض", logo: logoLeap },
  { name: "World Defense Show",         year: "2026", city: "Riyadh", cityAr: "الرياض", logo: logoWorldDefense },
  { name: "Saudi Plastics & Petrochem", year: "2026", city: "Riyadh", cityAr: "الرياض", logo: logoPlasticsPetrochem },
  { name: "Saudi Food Show",            year: "2026", city: "Riyadh", cityAr: "الرياض", logo: logoSaudiFood },
  { name: "Cityscape Global",           year: "2025", city: "Riyadh", cityAr: "الرياض", logo: logoCityscape },
  { name: "Big 5 Construct Saudi",      year: "2025", city: "Riyadh", cityAr: "الرياض", logo: logoBig5 },
  { name: "Global Health Exhibition",   year: "2025", city: "Riyadh", cityAr: "الرياض", logo: logoGlobalHealth },
  { name: "Riyadh Int'l Book Fair",     year: "2025", city: "Riyadh", cityAr: "الرياض", logo: logoBookFair },
  { name: "Saudi Build",                year: "2024", city: "Riyadh", cityAr: "الرياض", logo: logoSaudiBuild },
  { name: "INDEX Saudi Arabia",         year: "2024", city: "Riyadh", cityAr: "الرياض", logo: logoIndex },
  { name: "Saudi Agriculture",          year: "2024", city: "Riyadh", cityAr: "الرياض", logo: logoSaudiAg },
  { name: "FABEX Saudi Arabia",         year: "2024", city: "Jeddah", cityAr: "جدة",     logo: logoFabex },
];

const EVENTS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Major Saudi & GCC exhibitions served by ENVOD KINGDOM SHIPPING SERVICES LLC",
  itemListElement: EVENTS.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${e.name} ${e.year} — ${e.city}, Saudi Arabia`,
  })),
};

type ProcessStep = {
  num: string;
  en: string;
  ar: string;
  dEn: string;
  dAr: string;
  icon: LucideIcon;
  tEn?: string;
  tAr?: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    num: "01",
    en: "Consultation",
    ar: "الاستشارة",
    icon: PhoneCall,
    dEn: "We map your requirements — shipment size, venue, deadlines, and handling.",
    dAr: "نحدد متطلباتك: حجم الشحنة والموقع والمواعيد والمناولة الخاصة.",
    tEn: "Within 24 Hours",
    tAr: "خلال 24 ساعة",
  },
  {
    num: "02",
    en: "Planning",
    ar: "التخطيط",
    icon: ClipboardList,
    dEn: "We build the logistics plan, transport schedule, customs docs, and timeline.",
    dAr: "نُعد الخطة اللوجستية وجدول النقل ووثائق الجمارك والتسليم.",
    tEn: "1–2 Business Days",
    tAr: "1–2 يوم عمل",
  },
  {
    num: "03",
    en: "Documentation",
    ar: "التوثيق",
    icon: FileText,
    dEn: "We handle ATA Carnet, customs clearance, permits, and shipping paperwork.",
    dAr: "ندير كارنيه ATA والتخليص الجمركي والتصاريح ومستندات الشحن.",
    tEn: "ATA Carnet & Customs",
    tAr: "كارنيه ATA والجمارك",
  },
  {
    num: "04",
    en: "Transportation",
    ar: "النقل",
    icon: Truck,
    dEn: "We move cargo safely by air, sea, or road with real-time tracking.",
    dAr: "ننقل البضائع بأمان جواً أو بحراً أو براً مع تتبع مباشر.",
    tEn: "Live Tracking Available",
    tAr: "تتبع مباشر متاح",
  },
  {
    num: "05",
    en: "Venue Delivery",
    ar: "التسليم للموقع",
    icon: Building2,
    dEn: "We deliver to the venue on organizer and booth-setup schedules.",
    dAr: "نُسلّم إلى الموقع وفق جداول المنظمين وتجهيز الأجنحة.",
    tEn: "Organizer Schedule",
    tAr: "حسب جدول المنظم",
  },
  {
    num: "06",
    en: "On-site Support",
    ar: "الدعم الميداني",
    icon: HardHat,
    dEn: "Unloading, handling, storage, and on-site coordination during the event.",
    dAr: "التفريغ والمناولة والتخزين والتنسيق الميداني طوال الفعالية.",
    tEn: "Throughout Event",
    tAr: "طوال الفعالية",
  },
  {
    num: "07",
    en: "Return Logistics",
    ar: "اللوجستيات العكسية",
    icon: PackageCheck,
    dEn: "Packing, customs, and return shipping once the show wraps.",
    dAr: "التغليف والإجراءات الجمركية والشحن العكسي بعد المعرض.",
    tEn: "Post-Event Handling",
    tAr: "ما بعد الفعالية",
  },
];

const TRUST = [
  { en: "ATA Carnet Specialists", ar: "متخصصو كارنيه ATA" },
  { en: "Customs Clearance Experts", ar: "خبراء التخليص الجمركي" },
  { en: "24/7 Shipment Tracking", ar: "تتبع الشحنات على مدار الساعة" },
  { en: "On-Time Venue Delivery", ar: "تسليم في الموعد للموقع" },
  { en: "Dedicated Project Manager", ar: "مدير مشروع مخصص" },
];

const STATS = [
  { v: "25+",  en: "Years Serving\nSaudi Exhibitions",     ar: "عاماً في\nالمعارض السعودية" },
  { v: "500+", en: "Events\nCoordinated",                  ar: "فعالية\nمنسقة" },
  { v: "24hr", en: "ATA Carnet\nProcessing",               ar: "معالجة\nكارنيه ATA" },
];

function CategoryList({ items, label, labelAr, isRtl }: { items: typeof SERVICES_GROUP; label: string; labelAr: string; isRtl: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-bold tracking-[0.3em] uppercase text-secondary/80 mb-3 ${isRtl ? "text-right" : ""}`}>
        {isRtl ? labelAr : label}
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
            <span className="text-white/75 text-sm font-medium">{isRtl ? item.ar : item.en}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function EventCard({ event, index, isRtl }: { event: (typeof EVENTS)[number]; index: number; isRtl: boolean }) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const tooltip = isRtl
    ? `نجحت انفود في إدارة لوجستيات المعارض لـ ${event.name}.`
    : `ENVOD successfully managed exhibition logistics for ${event.name}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onMouseMove={handleMouseMove}
      className="group relative h-full"
    >
      {/* Card body (clips its own glow/shimmer) */}
      <div
        className="relative h-full flex flex-col items-center text-center rounded-[20px] p-5 md:p-6 overflow-hidden border border-white/10 transition-all duration-[350ms] ease-out will-change-transform group-hover:-translate-y-1.5 group-hover:border-secondary/40 group-hover:shadow-[0_22px_55px_-14px_rgba(214,40,40,0.32)]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 45%, rgba(2,13,28,0.35) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Mouse-follow light reflection */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgba(214,40,40,0.18), transparent 62%)" }}
        />
        {/* Shimmer sweep on hover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
          <div className="absolute -top-1/2 left-0 h-[200%] w-1/3 rotate-12 -translate-x-[250%] group-hover:translate-x-[420%] bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[900ms] ease-out" />
        </div>
        {/* Top border accent on hover */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Logo chip — white background for universal legibility across brand marks */}
        <div className="relative mb-4 w-full h-16 md:h-[72px] rounded-xl bg-white flex items-center justify-center px-3.5 py-2.5 shadow-sm ring-1 ring-black/5 overflow-hidden transition-transform duration-[350ms] ease-out will-change-transform group-hover:scale-[1.04]">
          <img
            src={event.logo}
            alt={`${event.name} logo`}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full w-auto object-contain"
          />
        </div>

        {/* Name + year + city */}
        <h4 className="text-white font-black text-[13px] leading-tight tracking-tight">{event.name}</h4>
        <p className="text-secondary text-sm font-bold mt-1">{event.year}</p>
        <p className="text-white/40 text-[10px] tracking-wider uppercase mt-1">{isRtl ? event.cityAr : event.city}</p>

        {/* Trust badge */}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-secondary/90">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
            {isRtl ? "تم التنفيذ" : "Delivered"}
          </span>
        </div>
      </div>

      {/* Tooltip (sibling of card so it escapes the clip) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-max max-w-[220px] rounded-lg border border-white/10 bg-[#020d1c] px-3 py-2 text-[11px] leading-snug text-white/85 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-20"
      >
        {tooltip}
      </div>
    </motion.div>
  );
}

function ProcessCard({
  step,
  index,
  isLast,
  isRtl,
}: {
  step: ProcessStep;
  index: number;
  isLast: boolean;
  isRtl: boolean;
}) {
  const Icon = step.icon;
  const timeframe = isRtl ? step.tAr : step.tEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.08 + index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="group relative h-full"
    >
      {/* Directional connector — subtle line + arrowhead centred in the gap (xl only, not on last card) */}
      {!isLast && (
        <div
          aria-hidden="true"
          className={`hidden xl:flex items-center justify-center absolute top-[36px] -translate-y-1/2 z-20 w-6 ${isRtl ? "right-full" : "left-full"}`}
        >
          <ArrowRight className={`w-[18px] h-[18px] text-secondary/70 ${isRtl ? "rotate-180" : ""}`} strokeWidth={2.25} aria-hidden="true" />
        </div>
      )}

      {/* Card */}
      <div className="relative z-10 h-full flex flex-col rounded-[16px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.75)] transition-all duration-300 ease-out will-change-transform group-hover:-translate-y-1.5 group-hover:border-secondary/40 group-hover:shadow-[0_18px_44px_-16px_rgba(214,40,40,0.28)]">
        {/* Icon + step number */}
        <div className={`flex items-center justify-between mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-secondary/20 bg-secondary/10 text-secondary transition-transform duration-300 will-change-transform group-hover:scale-105">
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <span className="text-2xl font-black leading-none tabular-nums text-secondary/25 transition-colors duration-300 group-hover:text-secondary/60">
            {step.num}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-white font-bold text-[14px] leading-snug mb-1.5 ${isRtl ? "text-right" : ""}`}>
          {isRtl ? step.ar : step.en}
        </h4>

        {/* Description — capped to 3 lines for scannability */}
        <p className={`text-white/50 text-[12px] leading-[1.55] line-clamp-3 ${isRtl ? "text-right" : ""}`}>
          {isRtl ? step.dAr : step.dEn}
        </p>

        {/* Duration badge — on every stage */}
        {timeframe && (
          <div className={`mt-auto pt-3 ${isRtl ? "text-right" : ""}`}>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/20 bg-secondary/[0.08] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-secondary/85">
              <Clock className="w-3 h-3 text-secondary/80 shrink-0" aria-hidden="true" />
              {timeframe}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ExhibitionSection() {
  const { t, isRtl } = useLanguage();

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #020d1c 0%, #030f22 60%, #020b18 100%)" }}>

      {/* ── Top accent ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/35 to-transparent" />

      {/* ── Ambient glow ── */}
      <div className="absolute pointer-events-none" style={{ top: "10%", left: "30%", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(214,40,40,0.06) 0%, transparent 70%)", transform: "translate(-50%,0)" }} />

      {/* ══════════════════════════════════════════════════════════
          MAIN TWO-COLUMN SECTION
      ══════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-8 xl:px-12 py-28">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start ${isRtl ? "direction-rtl" : ""}`}>

          {/* ── LEFT: Text Content ── */}
          <div className={isRtl ? "lg:order-2 text-right" : ""}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-6"
            >
              {t("EXHIBITION LOGISTICS SPECIALISTS", "متخصصو لوجستيات المعارض")}
            </motion.p>

            {/* Heading — large, bold, keyword highlighted */}
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.7, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
              className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.04] tracking-tight mb-8"
            >
              {isRtl ? (
                <>
                  متخصصو لوجستيات
                  <br />
                  <span className="text-secondary">المعارض والفعاليات</span>
                  <br />
                  في المملكة العربية السعودية
                </>
              ) : (
                <>
                  Saudi Arabia's
                  <br />
                  <span className="text-secondary">Exhibition & Event</span>
                  <br />
                  Logistics Experts
                </>
              )}
            </motion.h2>

            {/* Body — narrow for readability */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              className="text-white/58 text-base leading-[1.9] mb-10 max-w-lg"
            >
              {t(
                "ENVOD KINGDOM has more than 25 years of experience supporting exhibitions, trade shows, sporting events, and international conferences across Saudi Arabia and the GCC — with ATA Carnet processing typically completed within 24 hours.",
                "تمتلك انفود كينجدم أكثر من 25 عاماً من الخبرة في دعم المعارض والمؤتمرات والفعاليات الرياضية والأحداث الدولية عبر المملكة والخليج، مع معالجة كارنيه ATA التي تكتمل عادةً خلال 24 ساعة.",
              )}
            </motion.p>

            {/* Two-column specialisation groups */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26 }}
              className={`grid grid-cols-2 gap-8 mb-10 ${isRtl ? "text-right" : ""}`}
            >
              <CategoryList items={SERVICES_GROUP}     label="Services"      labelAr="الخدمات"    isRtl={isRtl} />
              <CategoryList items={CAPABILITIES_GROUP} label="Capabilities"  labelAr="القدرات"    isRtl={isRtl} />
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2.5 bg-secondary hover:bg-secondary/85 text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/35 hover:-translate-y-px ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t("Request Exhibition Quote", "اطلب عرض سعر للمعرض")}
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT: Cinematic Visual Panel ── */}
          <div className={`relative ${isRtl ? "lg:order-1" : ""}`}>
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
              className="relative rounded-3xl overflow-hidden"
              style={{ height: 480 }}
            >
              {/* Cinematic background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${import.meta.env.BASE_URL}E1_exhibition.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }}
              />
              {/* Strong overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(2,13,28,0.72) 0%, rgba(10,35,66,0.50) 50%, rgba(2,13,28,0.80) 100%)" }} />
              {/* Red glow */}
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 20% 70%, rgba(214,40,40,0.18) 0%, transparent 60%)" }} />
              {/* Border */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />

              {/* Stats overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className={`flex items-end justify-between gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                  {STATS.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex-1 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <div className="text-3xl xl:text-4xl font-black text-secondary leading-none mb-1">{s.v}</div>
                      <div className="text-white/50 text-[10px] uppercase tracking-wider leading-tight whitespace-pre-line">{isRtl ? s.ar : s.en}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top badge */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5">
                  <span className="text-white text-[11px] font-bold tracking-wider">EXHIBITION SPECIALISTS</span>
                </div>
                <div className="bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full px-3 py-1.5">
                  <span className="text-secondary text-[11px] font-black tracking-wider">ATA CARNET</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TRUSTED AT — Proven track record (premium event cards)
      ══════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/6 py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mb-12 ${isRtl ? "text-right" : "text-center"}`}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {t("PROVEN TRACK RECORD", "سجل حافل بالإنجازات")}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              {t("Trusted at Major Saudi & GCC Events", "موثوق به في كبرى الفعاليات السعودية والخليجية")}
            </h3>
            <p className={`text-white/45 text-sm mt-3 max-w-xl leading-relaxed ${isRtl ? "ml-auto" : "mx-auto"}`}>
              {t(
                "Official logistics support successfully delivered for the Kingdom's landmark exhibitions.",
                "دعم لوجستي رسمي تم تنفيذه بنجاح لأبرز معارض المملكة.",
              )}
            </p>
          </motion.div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5 items-stretch ${isRtl ? "direction-rtl" : ""}`}>
            {EVENTS.map((event, i) => (
              <EventCard key={event.name} event={event} index={i} isRtl={isRtl} />
            ))}
          </div>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENTS_SCHEMA) }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PROCESS — Premium enterprise workflow cards
      ══════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/6 py-20 md:py-24 overflow-hidden">
        <div className="container mx-auto px-6 md:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mb-14 ${isRtl ? "text-right" : "text-center"}`}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {t("OUR PROCESS", "عمليتنا")}
            </p>
            <h3 className="text-2xl md:text-3xl xl:text-4xl font-black text-white">
              {t("End-to-End Exhibition Logistics Workflow", "سير عمل لوجستيات المعارض من البداية للنهاية")}
            </h3>
            <p className={`text-white/45 text-sm mt-3 max-w-2xl leading-relaxed ${isRtl ? "ml-auto" : "mx-auto"}`}>
              {t(
                "A structured seven-stage process engineered for corporate exhibitors — transparent, reliable, and managed end to end.",
                "عملية منظمة من سبع مراحل مصممة للعارضين من الشركات — شفافة وموثوقة ومُدارة من البداية إلى النهاية.",
              )}
            </p>
          </motion.div>

          {/* Cards grid + subtle connectors */}
          <div className={`relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-4 xl:gap-x-6 items-stretch ${isRtl ? "direction-rtl" : ""}`}>
            {/* Subtle connecting rail — xl only, behind cards */}
            <div aria-hidden="true" className="hidden xl:block absolute top-[36px] left-0 right-0 h-px bg-gradient-to-r from-secondary/15 via-secondary/25 to-secondary/15 z-0" />

            {PROCESS_STEPS.map((step, i) => (
              <ProcessCard
                key={step.num}
                step={step}
                index={i}
                isLast={i === PROCESS_STEPS.length - 1}
                isRtl={isRtl}
              />
            ))}
          </div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`mt-12 flex flex-wrap items-center justify-center gap-2.5 ${isRtl ? "direction-rtl" : ""}`}
          >
            {TRUST.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11.5px] font-semibold text-white/70 transition-colors hover:border-secondary/35 hover:text-white ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Check className="w-3.5 h-3.5 text-secondary shrink-0" strokeWidth={3} aria-hidden="true" />
                {isRtl ? item.ar : item.en}
              </span>
            ))}
          </motion.div>

          {/* Subtle CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-2 text-center ${isRtl ? "sm:flex-row-reverse" : ""}`}
          >
            <span className="text-white/55 text-sm">
              {t("Need exhibition logistics support?", "هل تحتاج دعم لوجستيات المعارض؟")}
            </span>
            <Link
              href="/contact"
              className={`group inline-flex items-center gap-1.5 text-secondary font-bold text-sm hover:text-secondary/80 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {t("Get a Free Logistics Consultation", "احصل على استشارة لوجستية مجانية")}
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}

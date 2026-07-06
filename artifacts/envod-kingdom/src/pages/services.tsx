import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import type { Service } from "@/lib/service-data";
import {
  Ship, Plane, Truck, Package, ShieldCheck, Clock, FileCheck,
  Warehouse, GitBranch, MapPin, ShoppingCart, Star,
  Heart, UtensilsCrossed, PawPrint,
  Anchor, AlertTriangle, Maximize2, Car, Stamp,
  CheckCircle2, ArrowRight, Globe2, Award, Mail,
  Gem, Snowflake, Box, Zap,
} from "lucide-react";
import { SERVICE_META, SERVICE_CATALOG } from "@/lib/service-data";
import { SERVICE_IMAGES } from "@/lib/service-images";

// ─── Per-service features ─────────────────────────────────────────────────────
interface ServiceExt {
  features: string[];
  featuresAr: string[];
  tag?: string;
  tagAr?: string;
  spotlight?: boolean;
  featured?: boolean;
}

const EXT: Record<number, ServiceExt> = {
  1:  { features: ["FCL & LCL options", "Global port coverage", "Ro-Ro & break bulk"], featuresAr: ["خيارات FCL وLCL", "تغطية الموانئ العالمية", "شحن رورو والبضائع السائبة"] },
  2:  { features: ["Express & charter flights", "50+ country network", "Pharma & perishables"], featuresAr: ["رحلات سريعة ومستأجرة", "شبكة 50+ دولة", "الأدوية والبضائع القابلة للتلف"] },
  3:  { features: ["FTL & LTL options", "All 6 GCC countries", "Cross-border customs"], featuresAr: ["حمولات كاملة وجزئية", "جميع دول الخليج الست", "تخليص جمركي عبر الحدود"] },
  4:  { features: ["Customs clearance often within 24 hours", "SABER, SFDA & ATA Carnet", "Saudi Customs broker"], featuresAr: ["تخليص جمركي غالباً خلال 24 ساعة", "سابر وهيئة الغذاء وكارنيه ATA", "وسيط جمارك سعودي معتمد"], tag: "Fast Clearance", tagAr: "تخليص سريع", featured: true },
  5:  { features: ["Bonded warehousing", "Pick & pack + fulfillment", "24/7 security & CCTV"], featuresAr: ["مستودعات جمركية", "تجميع وتغليف وتوزيع", "أمن وكاميرات على مدار الساعة"] },
  6:  { features: ["Door-to-door coordination", "Multi-modal solutions", "Real-time cargo tracking"], featuresAr: ["تنسيق من الباب للباب", "حلول متعددة الوسائط", "تتبع الشحن في الوقت الفعلي"] },
  7:  { features: ["Supply chain optimization", "ERP integration", "Vendor & last-mile management"], featuresAr: ["تحسين سلسلة التوريد", "تكامل مع أنظمة ERP", "إدارة الموردين والمرحلة الأخيرة"] },
  8:  { features: ["Heavy lift & OOG cargo", "Oil & gas equipment", "Route survey & rigging"], featuresAr: ["رفع ثقيل وبضائع OOG", "معدات النفط والغاز", "مسح المسار وخدمات الرافعات"], tag: "Specialist", tagAr: "متخصص", featured: true },
  9:  { features: ["Residential & corporate moves", "International relocation", "Full packing & customs"], featuresAr: ["نقل سكني ومؤسسي", "انتقال دولي", "تغليف كامل وتخليص جمركي"] },
  10: { features: ["Last-mile delivery", "Returns management", "Salla, Zid & Amazon integration"], featuresAr: ["توصيل المرحلة الأخيرة", "إدارة المرتجعات", "تكامل سلة وZid وأمازون"] },
  11: { features: ["ATA Carnet — 24hr processing", "On-site logistics team", "Temporary import & re-export"], featuresAr: ["كارنيه ATA — معالجة في 24 ساعة", "فريق لوجستيات في الموقع", "الاستيراد المؤقت وإعادة التصدير"], tag: "ENVOD Specialist", tagAr: "متخصص انفود", spotlight: true },
  12: { features: ["GDP-certified cold chain", "SFDA pharma clearance", "Hospital direct delivery"], featuresAr: ["سلسلة باردة معتمدة GDP", "تخليص دوائي من هيئة SFDA", "توصيل مباشر للمستشفيات"], tag: "Cold Chain", tagAr: "سلسلة تبريد" },
  13: { features: ["SFDA food clearance", "Halal certification support", "Refrigerated transport"], featuresAr: ["تخليص غذائي من هيئة SFDA", "دعم شهادة الحلال", "نقل مبرد"] },
  14: { features: ["SFDA veterinary import", "Live animal IATA transport", "Quarantine coordination"], featuresAr: ["استيراد بيطري من SFDA", "نقل حيوانات حية وفق IATA", "تنسيق الحجر الصحي"] },
  15: { features: ["Heavy machinery & steel", "Non-containerized cargo", "Port-to-port handling"], featuresAr: ["آلات ثقيلة وحديد", "بضائع غير حاوية", "معالجة من ميناء لميناء"], tag: "Breakbulk", tagAr: "بريك بالك", featured: true },
  16: { features: ["IMO & IATA compliant", "All 9 DG classes", "Safe packaging & certified docs"], featuresAr: ["متوافق مع IMO وIATA", "جميع الفئات التسع للبضائع الخطرة", "تغليف آمن وتوثيق معتمد"], tag: "DG Certified", tagAr: "معتمد DG" },
  17: { features: ["Wind turbines & transformers", "Specialized trailers & rigging", "Saudi permit management"], featuresAr: ["توربينات الرياح والمحولات", "مقطورات ورافعات متخصصة", "إدارة التصاريح السعودية"], tag: "OOG Specialist", tagAr: "متخصص OOG" },
  18: { features: ["Vehicles, trucks & machinery", "Full Saudi customs clearance", "Major Saudi port access"], featuresAr: ["سيارات وشاحنات وآلات", "تخليص جمركي سعودي كامل", "وصول للموانئ السعودية الرئيسية"], tag: "RoRo", tagAr: "رورو" },
  19: { features: ["24-hour Carnet processing", "80+ country coverage", "Exhibitions, equipment & samples"], featuresAr: ["معالجة الكارنيه خلال 24 ساعة", "تغطية أكثر من 80 دولة", "معارض ومعدات وعينات"], tag: "ENVOD Specialist", tagAr: "متخصص انفود", featured: true },
  20: { features: ["Trained white glove crews", "Luxury furniture, art & medical gear", "Hotel & villa project delivery"], featuresAr: ["فرق قفاز أبيض مدربة", "أثاث فاخر وفن ومعدات طبية", "تسليم مشاريع الفنادق والفلل"], tag: "Premium", tagAr: "خدمة فاخرة" },
  21: { features: ["Refrigerated truck fleet", "Frozen & chilled cargo", "Unbroken cold chain monitoring"], featuresAr: ["أسطول شاحنات مبردة", "بضائع مجمدة ومبردة", "مراقبة سلسلة تبريد غير منقطعة"], tag: "Reefer", tagAr: "نقل مبرد" },
  22: { features: ["ISPM-15 certified wooden crates", "Export & heavy equipment packing", "Fragile cargo protection"], featuresAr: ["صناديق خشبية معتمدة ISPM-15", "تغليف للتصدير والمعدات الثقيلة", "حماية البضائع الهشة"] },
  23: { features: ["Same-day & next-day delivery", "International express network", "Secure document shipping"], featuresAr: ["توصيل نفس اليوم واليوم التالي", "شبكة بريد دولي سريع", "شحن آمن للمستندات"], tag: "Urgent", tagAr: "عاجل" },
  24: { features: ["China → UAE / USA direct routing", "Cargo never transits Saudi", "Switch B/L confidentiality"], featuresAr: ["مسارات مباشرة الصين → الإمارات / أمريكا", "البضاعة لا تعبر السعودية", "سرية تبديل بوليصة الشحن"], tag: "B2B", tagAr: "أعمال" },
};

// ─── Icon resolver ─────────────────────────────────────────────────────────────
function ServiceIcon({ name, className = "w-7 h-7" }: { name: string; className?: string }) {
  const map: Record<string, React.ElementType> = {
    Ship, Plane, Truck, Package, Warehouse, FileCheck, GitBranch,
    Container: Package, MapPin, ShoppingCart, Calendar: Star,
    Heart, UtensilsCrossed, PawPrint, ShieldCheck, Clock,
    Anchor, AlertTriangle, Maximize2, Car, Stamp,
    Gem, Snowflake, Box, Zap, Globe2,
  };
  const Icon = map[name] ?? Package;
  return <Icon className={className} />;
}

// ─── Card background media (photo + readability overlays) ──────────────────────
// Renders a service's dedicated hero photo as a full-card background with a dark
// overlay (~60%) and a bottom-to-top gradient so all foreground content stays
// readable. On hover the photo zooms, the overlay lightens, and an accent-tinted
// inner glow appears. Returns null (keeping the gradient banner) when no image.
function CardMedia({ image, accent }: { image?: string; accent: string }) {
  if (!image) return null;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />
      {/* Base dark overlay (~60%), lightens on hover */}
      <div className="absolute inset-0 bg-[#060c14]/60 transition-opacity duration-500 group-hover:opacity-75" />
      {/* Bottom-to-top gradient keeps title/description/bullets readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060c14] via-[#060c14]/80 to-[#060c14]/25" />
      {/* Accent inner glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 42px ${accent}30` }}
      />
    </div>
  );
}

// ─── Premium card (standard) ───────────────────────────────────────────────────
function PremiumCard({ service, index, isRtl }: { service: Service; index: number; isRtl: boolean }) {
  const { t } = useLanguage();
  const ext = EXT[service.id] ?? { features: [], featuresAr: [] };
  const meta = SERVICE_META[service.id];
  const features = (isRtl ? ext.featuresAr : ext.features).slice(0, 3);
  const name = isRtl ? service.nameAr : service.name;
  const desc = isRtl ? service.descriptionAr : service.description;
  const slug = meta?.slug ?? "";
  const gradient = meta?.gradient ?? "linear-gradient(135deg,#0a1a2e 0%,#0d2038 100%)";
  const accent = meta?.accentHex ?? "#D62828";
  const image = SERVICE_IMAGES[service.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: (index % 3) * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="group relative h-full rounded-[20px] overflow-hidden border border-white/8 hover:border-white/18 flex flex-col transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.30)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        style={{ background: "#080f1a" }}
      >
        <CardMedia image={image} accent={accent} />

        {/* ── Banner (dedicated photo shows through when present) ── */}
        <div
          className="relative z-10 h-32 flex items-center justify-center overflow-hidden flex-shrink-0"
          style={image ? undefined : { background: gradient }}
        >
          {!image && (
            <>
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px 128px" }} />
              {/* Radial accent */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 70% at 50% 60%, ${accent}22 0%, transparent 70%)` }} />
              {/* Animated border glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 30px ${accent}25` }} />
            </>
          )}

          {/* Icon */}
          <motion.div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm"
            style={{ background: `${accent}18` }}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          >
            <ServiceIcon name={service.icon} className="w-8 h-8 text-white" />
          </motion.div>

          {/* Tag badge */}
          {ext.tag && (
            <div
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-[9px] font-black tracking-[0.3em] uppercase px-2.5 py-1 rounded-full border"
              style={{ background: `${accent}25`, borderColor: `${accent}50`, color: accent }}
            >
              {isRtl ? ext.tagAr : ext.tag}
            </div>
          )}
        </div>

        {/* ── Card body ── */}
        <div className={`relative z-10 flex flex-col flex-1 p-5 ${isRtl ? "text-right" : ""}`}>
          <h3 className="font-black text-white text-[15px] leading-snug mb-2">{name}</h3>
          <p className="text-white/45 text-xs leading-relaxed mb-4 flex-shrink-0 line-clamp-2">{desc}</p>

          {/* 3 bullet points */}
          <ul className="space-y-2 mb-5 flex-1">
            {features.map((f, i) => (
              <li key={i} className={`flex items-center gap-2 text-xs text-white/65 ${isRtl ? "flex-row-reverse" : ""}`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                {f}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className={`flex items-center justify-between pt-4 border-t border-white/6 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link
              href={`/services/${slug}`}
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all group-hover:gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
              style={{ color: accent }}
            >
              {t("View Details", "التفاصيل")}
              <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
            <a
              href={`mailto:info@envodkingdom.net?subject=${encodeURIComponent(`Inquiry - ${service.name}`)}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all"
              title="Email inquiry"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5 text-white/40" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Featured (wide) card ──────────────────────────────────────────────────────
function FeaturedCard({ service, index, isRtl }: { service: Service; index: number; isRtl: boolean }) {
  const { t } = useLanguage();
  const ext = EXT[service.id] ?? { features: [], featuresAr: [] };
  const meta = SERVICE_META[service.id];
  const features = (isRtl ? ext.featuresAr : ext.features).slice(0, 3);
  const name = isRtl ? service.nameAr : service.name;
  const desc = isRtl ? service.descriptionAr : service.description;
  const slug = meta?.slug ?? "";
  const gradient = meta?.gradient ?? "linear-gradient(135deg,#0a1a2e 0%,#0d2038 100%)";
  const accent = meta?.accentHex ?? "#D62828";
  const image = SERVICE_IMAGES[service.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      className="sm:col-span-2"
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="group relative rounded-[22px] overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_6px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_22px_55px_rgba(0,0,0,0.55)]"
        style={{ background: "#080f1a" }}
      >
        <CardMedia image={image} accent={accent} />

        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` }} />

        <div className={`relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-0 ${isRtl ? "" : ""}`}>
          {/* Left: Banner (dedicated photo shows through when present) */}
          <div
            className="relative min-h-[200px] flex items-center justify-center overflow-hidden"
            style={image ? undefined : { background: gradient }}
          >
            {!image && (
              <>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${accent}22 0%, transparent 70%)` }} />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
              </>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                className="w-20 h-20 rounded-3xl flex items-center justify-center border border-white/15"
                style={{ background: `${accent}18` }}
                whileHover={{ scale: 1.08 }}
              >
                <ServiceIcon name={service.icon} className="w-10 h-10 text-white" />
              </motion.div>
              {ext.tag && (
                <span
                  className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1 rounded-full border"
                  style={{ background: `${accent}25`, borderColor: `${accent}50`, color: accent }}
                >
                  {isRtl ? ext.tagAr : ext.tag}
                </span>
              )}
            </div>
          </div>

          {/* Right: Content */}
          <div className={`relative p-7 flex flex-col justify-between ${isRtl ? "text-right" : ""}`}>
            {image && <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-l rtl:bg-gradient-to-r from-[#060c14]/88 via-[#060c14]/55 to-[#060c14]/10" aria-hidden="true" />}
            <div className="relative z-10">
              <h3 className="font-black text-white text-xl md:text-2xl leading-tight mb-2">{name}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">{desc}</p>
              <ul className="space-y-2.5 mb-6">
                {features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2.5 text-sm text-white/70 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`relative z-10 flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Link
                href={`/services/${slug}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-lg ${isRtl ? "flex-row-reverse" : ""}`}
                style={{ background: accent, boxShadow: `0 4px 16px ${accent}35` }}
              >
                {t("View Details", "التفاصيل")}
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
              <a
                href={`mailto:info@envodkingdom.net?subject=${encodeURIComponent(`Inquiry - ${service.name}`)}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border border-white/12 hover:bg-white/5 text-white/60 hover:text-white transition-all ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Mail className="w-3.5 h-3.5" />
                {t("Inquire", "استفسار")}
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Spotlight card (Exhibition) ───────────────────────────────────────────────
function SpotlightCard({ service, isRtl }: { service: Service; isRtl: boolean }) {
  const { t } = useLanguage();
  const ext = EXT[service.id] ?? { features: [], featuresAr: [] };
  const meta = SERVICE_META[service.id];
  const features = isRtl ? ext.featuresAr : ext.features;
  const name = isRtl ? service.nameAr : service.name;
  const desc = isRtl ? service.descriptionAr : service.description;
  const slug = meta?.slug ?? "";
  const image = SERVICE_IMAGES[service.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      className="group relative rounded-3xl overflow-hidden border border-secondary/25 hover:border-secondary/40 transition-all duration-300"
      style={image ? { background: "#060c14" } : { background: "linear-gradient(135deg, rgba(214,40,40,0.07) 0%, rgba(10,35,66,0.55) 100%)" }}
    >
      <CardMedia image={image} accent="#D62828" />

      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 55% at 25% 40%, rgba(214,40,40,0.09) 0%, transparent 70%)" }} />
      <div className="absolute inset-x-0 top-0 z-[1] h-0.5 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

      <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 ${isRtl ? "" : ""}`}>
        <div className={`p-8 md:p-12 ${isRtl ? "text-right" : ""}`}>
          <div className={`flex items-center gap-3 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-14 h-14 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center shrink-0">
              <ServiceIcon name={service.icon} className="w-7 h-7 text-secondary" />
            </div>
            {ext.tag && (
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full">
                {isRtl ? ext.tagAr : ext.tag}
              </span>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">{name}</h3>
          <p className="text-white/55 text-sm leading-relaxed mb-8">{desc}</p>

          <ul className="space-y-2.5 mb-8">
            {features.map((f, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: isRtl ? 12 : -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.055 }} className={`flex items-center gap-2.5 text-sm text-white/70 ${isRtl ? "flex-row-reverse" : ""}`}>
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                {f}
              </motion.li>
            ))}
          </ul>

          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link
              href={`/services/${slug}`}
              className={`inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {t("View Service", "استعراض الخدمة")}
              <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
            <a
              href={`mailto:info@envodkingdom.net?subject=${encodeURIComponent(`Inquiry - ${service.name}`)}`}
              className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/12 hover:bg-white/[0.1] text-white px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className={`border-t md:border-t-0 md:border-l border-white/8 p-8 md:p-12 flex flex-col justify-center gap-8 ${isRtl ? "text-right" : ""}`}>
          {[
            { v: "25+",  l: t("Years Supporting Exhibitions", "عاماً في دعم المعارض") },
            { v: "500+", l: t("Events Coordinated", "فعالية منسقة") },
            { v: "24hr", l: t("ATA Carnet Processing", "معالجة كارنيه ATA") },
            { v: "GCC",  l: t("Wide Event Coverage", "تغطية فعاليات خليجية") },
          ].map(({ v, l }) => (
            <div key={v}>
              <div className="text-3xl font-black text-secondary">{v}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
type Tab = "all" | "core" | "specialized";

export default function Services() {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const services = SERVICE_CATALOG;
  const spotlight = services.filter((s) => EXT[s.id]?.spotlight);
  const nonSpotlight = services.filter((s) => !EXT[s.id]?.spotlight);
  const totalCount = services.length;

  const baseFiltered =
    activeTab === "all"
      ? nonSpotlight
      : activeTab === "core"
        ? services.filter((s) => s.category === "core")
        : services.filter((s) => s.category === "specialized" && !EXT[s.id]?.spotlight);

  const tabs: { id: Tab; label: string; labelAr: string; count: number }[] = [
    { id: "all",         label: "All Services",  labelAr: "جميع الخدمات", count: nonSpotlight.length },
    { id: "core",        label: "Core Services", labelAr: "الأساسية",      count: services.filter((s) => s.category === "core").length },
    { id: "specialized", label: "Specialized",   labelAr: "المتخصصة",      count: services.filter((s) => s.category === "specialized" && !EXT[s.id]?.spotlight).length },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-24 overflow-hidden" style={{ background: "linear-gradient(180deg, #020d1c 0%, #030f22 60%, hsl(var(--background)) 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(214,40,40,0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className={`container mx-auto px-4 text-center ${isRtl ? "rtl" : ""}`}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">
            {t(`${totalCount} SPECIALIZED SERVICES`, `${totalCount} خدمة متخصصة`)}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.05] mb-6 max-w-5xl mx-auto">
            {t("Comprehensive", "خدمات لوجستية")}
            <span className="text-secondary"> {t("Logistics", "شاملة")}</span>
            <br />{t("Solutions", "ومتخصصة")}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/55 max-w-2xl mx-auto text-base leading-relaxed mb-10">
            {t(
              "From ATA Carnet and exhibition logistics to breakbulk, dangerous goods, OOG cargo, RoRo, project cargo, medical cold-chain and GCC transportation — backed by 25+ years of Saudi expertise.",
              "من كارنيه ATA ولوجستيات المعارض إلى بريك بالك والبضائع الخطرة وبضائع OOG ورورو وبضائع المشاريع والسلسلة الباردة الطبية والنقل الخليجي — مدعومة بأكثر من 25 عاماً من الخبرة السعودية.",
            )}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`flex flex-wrap justify-center gap-8 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
            {[
              { icon: Award,       v: "25+",          l: t("Years",     "سنة")    },
              { icon: Globe2,      v: "50+",           l: t("Countries", "دولة")   },
              { icon: Clock,       v: "24hr",          l: t("Clearance", "تخليص")  },
              { icon: ShieldCheck, v: `${totalCount}`, l: t("Services",  "خدمة")   },
            ].map(({ icon: Icon, v, l }) => (
              <div key={v} className={`flex items-center gap-2 text-white/60 ${isRtl ? "flex-row-reverse" : ""}`}>
                <Icon className="w-4 h-4 text-secondary" />
                <span className="font-bold text-white">{v}</span>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Spotlight: Exhibition & Event Logistics ──────────────────── */}
      {spotlight.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={`text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-6 ${isRtl ? "text-right" : ""}`}>
            {t("ENVOD SPECIALTY", "تخصص انفود")}
          </motion.p>
          <div className="space-y-5">
            {spotlight.map((s) => <SpotlightCard key={s.id} service={s} isRtl={isRtl} />)}
          </div>
        </section>
      )}

      {/* ── All Services Grid ─────────────────────────────────────────── */}
      <section className="py-6 pb-28 container mx-auto px-4">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={`text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-6 ${isRtl ? "text-right" : ""}`}>
          {t("ALL SERVICES", "جميع الخدمات")}
        </motion.p>

        {/* Tab strip */}
        <div className={`flex flex-wrap items-center gap-2 mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/8"}`}
            >
              {isRtl ? tab.labelAr : tab.label}
              <span className={`ml-2 rtl:ml-0 rtl:mr-2 text-xs font-bold tabular-nums ${activeTab === tab.id ? "text-white/70" : "text-white/25"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Animated grid — featured cards span 2 cols, regular span 1 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {baseFiltered.map((service, i) =>
              EXT[service.id]?.featured ? (
                <FeaturedCard key={service.id} service={service} index={i} isRtl={isRtl} />
              ) : (
                <PremiumCard key={service.id} service={service} index={i} isRtl={isRtl} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020d1c 0%, #030f22 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(214,40,40,0.07) 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />

        <div className={`container mx-auto px-4 text-center relative z-10 ${isRtl ? "rtl" : ""}`}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-6">{t("GET STARTED TODAY", "ابدأ اليوم")}</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 max-w-3xl mx-auto leading-tight">
              {t("Need a Custom Logistics", "تحتاج إلى حل لوجستي")}
              <span className="text-secondary"> {t("Solution?", "مخصص؟")}</span>
            </h2>
            <p className="text-white/48 max-w-xl mx-auto mb-10 text-sm leading-relaxed">
              {t("Our specialists will design a bespoke logistics plan for your exact requirements.", "سيصمم فريق المتخصصين لدينا خطة لوجستية مخصصة لمتطلباتك الدقيقة.")}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              <Link
                href="/contact"
                className={`inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-4 px-10 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t("Request a Quote", "اطلب عرض سعر")}
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
              <a
                href="https://wa.me/966502260256"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-4 px-10 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                {t("WhatsApp Us", "تواصل عبر واتساب")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

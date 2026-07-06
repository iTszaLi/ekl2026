import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowRight, ChevronRight, CheckCircle2, Mail,
  Ship, Plane, Truck, Package, ShieldCheck, FileCheck,
  Warehouse, GitBranch, MapPin, ShoppingCart, Star,
  Heart, UtensilsCrossed, PawPrint, Anchor, AlertTriangle, Maximize2,
  Car, Stamp, ChevronDown,
  Gem, Snowflake, Box, Zap, Globe2,
} from "lucide-react";
import { SERVICE_META, SLUG_TO_ID, SERVICE_CATALOG, buildMailto } from "@/lib/service-data";
import { SERVICE_IMAGES } from "@/lib/service-images";
import PillarSections from "@/components/service-pillar/PillarSections";

function ServiceIcon({ name, className = "w-8 h-8", style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const map: Record<string, React.ElementType> = {
    Ship, Plane, Truck, Package, Warehouse, FileCheck, GitBranch,
    Container: Package, MapPin, ShoppingCart, Calendar: Star,
    Heart, UtensilsCrossed, PawPrint, ShieldCheck,
    Anchor, AlertTriangle, Maximize2, Car, Stamp,
    Gem, Snowflake, Box, Zap, Globe2,
  };
  const Icon = map[name] ?? Package;
  return <Icon className={className} style={style} />;
}

function FAQItem({ q, a, qAr, aAr, isRtl }: { q: string; a: string; qAr: string; aAr: string; isRtl: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/[0.03] transition-colors ${isRtl ? "flex-row-reverse text-right" : ""}`}
      >
        <span className="text-white font-semibold text-sm leading-snug">{isRtl ? qAr : q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
        </motion.div>
      </button>
      {/* Answer stays in the DOM (crawlable / matches FAQPage schema); collapsed via CSS grid rows */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={`px-6 pb-5 text-white/55 text-sm leading-relaxed border-t border-white/8 pt-4 ${isRtl ? "text-right" : ""}`}>
            {isRtl ? aAr : a}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRtl } = useLanguage();
  const serviceId = SLUG_TO_ID[slug ?? ""] ?? null;
  const meta = serviceId ? SERVICE_META[serviceId] : null;
  const service = SERVICE_CATALOG.find((s) => s.id === serviceId);

  if (!service || !meta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">{t("Service not found", "الخدمة غير موجودة")}</p>
          <Link href="/services" className="text-secondary hover:underline text-sm">{t("← Back to Services", "← العودة للخدمات")}</Link>
        </div>
      </div>
    );
  }

  const serviceName = isRtl ? service.nameAr : service.name;
  const serviceDesc = isRtl ? service.descriptionAr : service.description;
  const heroImage = serviceId ? SERVICE_IMAGES[serviceId] : undefined;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Cinematic Hero ── */}
      <div
        className={`relative pt-24 pb-20 overflow-hidden ${heroImage ? "min-h-[460px] md:min-h-[560px] flex items-center" : ""}`}
        style={{ background: meta.gradient }}
      >
        {/* Dedicated service hero photo (eager — above the fold) */}
        {heroImage && (
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <img
              src={heroImage}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#060c14]/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060c14] via-[#08111f]/78 to-[#08111f]/40" />
          </div>
        )}
        {/* Grid overlay */}
        <div className="absolute inset-0 z-[1] opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1] w-[600px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${meta.accentHex}18 0%, transparent 70%)` }} />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className={`container mx-auto px-4 relative z-10 w-full ${isRtl ? "text-right" : ""}`}>
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-2 text-white/35 text-xs mb-8 ${isRtl ? "flex-row-reverse" : ""}`}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">{t("Home", "الرئيسية")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <Link href="/services" className="hover:text-white transition-colors">{t("Services", "الخدمات")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <span className="text-secondary font-medium">{serviceName}</span>
          </motion.nav>

          <div className={`flex items-start gap-6 mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
              style={{ background: `${meta.accentHex}18`, boxShadow: `0 0 30px ${meta.accentHex}25` }}
            >
              <ServiceIcon name={service.icon} className="w-10 h-10" style={{ color: meta.accentHex }} />
            </motion.div>

            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
              >
                ENVOD KINGDOM SHIPPING SERVICES
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl"
              >
                {serviceName}
              </motion.h1>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-white/60 text-lg leading-relaxed max-w-2xl mb-10"
          >
            {serviceDesc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className={`flex flex-wrap gap-4 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <a
              href={buildMailto(service.name, service.name + " — General Inquiry")}
              className={`inline-flex items-center gap-2.5 bg-secondary hover:bg-secondary/85 text-white px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 hover:-translate-y-px ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Mail className="w-4 h-4" />
              {t("Request a Quote", "اطلب عرض سعر")}
            </a>
            <a
              href="https://wa.me/966502260256"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 text-[#25D366] px-7 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              WhatsApp
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Overview (definition-led, entity-dense SEO/GEO body — crawlable static HTML) ── */}
      {meta.overview && meta.overview.length > 0 && (
        <section className="border-t border-white/6 py-16" aria-labelledby="service-overview-heading">
          <div className={`container mx-auto px-4 max-w-3xl ${isRtl ? "text-right" : ""}`}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {t("OVERVIEW", "نظرة عامة")}
            </p>
            <h2 id="service-overview-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
              {t(`What is ${serviceName}?`, `نبذة عن ${serviceName}`)}
            </h2>
            <div className="space-y-4">
              {meta.overview.map((p, i) => (
                <p key={i} className="text-white/60 text-base leading-relaxed">
                  {isRtl ? p.ar : p.en}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Pillar (long-form SEO content, plain HTML for crawlers) ── */}
      {meta.pillar && (
        <PillarSections pillar={meta.pillar} isRtl={isRtl} accentHex={meta.accentHex} />
      )}

      {/* ── Sub-Services Grid ── */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mb-12 ${isRtl ? "text-right" : ""}`}
        >
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {t("SUB-SERVICES", "الخدمات الفرعية")}
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
            {t("Complete", "كل ما تحتاجه")} <span className="text-secondary">{serviceName}</span> {t("Solutions", "من مكان واحد")}
          </h2>
          <p className="text-white/45 text-sm max-w-xl">
            {t("Click any sub-service to send us an inquiry — we'll respond within 2 hours.", "انقر على أي خدمة فرعية لإرسال استفساركم — سنرد في غضون ساعتين.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meta.subServices.map((sub, i) => (
            <motion.a
              key={i}
              href={buildMailto(service.name, isRtl ? sub.nameAr : sub.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              whileHover={{ y: -4, borderColor: `${meta.accentHex}50` }}
              className={`group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 cursor-pointer hover:bg-white/[0.06] ${isRtl ? "text-right" : ""}`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${meta.accentHex}10 0%, transparent 60%)` }} />
              {/* Top bar */}
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${meta.accentHex}80, transparent)` }} />

              <div className={`flex items-start gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${meta.accentHex}18` }}>
                  <Mail className="w-4 h-4" style={{ color: meta.accentHex }} />
                </div>
                <h3 className="text-white font-bold text-sm leading-snug flex-1">
                  {isRtl ? sub.nameAr : sub.name}
                </h3>
              </div>
              <p className="text-white/48 text-xs leading-relaxed mb-4">
                {isRtl ? sub.descAr : sub.desc}
              </p>
              <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors group-hover:text-white/80 text-white/35 ${isRtl ? "flex-row-reverse" : ""}`}>
                {t("Send Inquiry", "إرسال استفسار")}
                <ArrowRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Process Timeline ── */}
      {meta.process.length > 0 && (
        <section className="py-16 border-t border-white/6" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, #020d1c 100%)" }}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mb-12 ${isRtl ? "text-right" : "text-center"}`}
            >
              <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">{t("HOW IT WORKS", "كيف تعمل")}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white">{t("Our Process", "عمليتنا")}</h2>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-4">
              {meta.process.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: `${meta.accentHex}40`, background: `${meta.accentHex}12` }}>
                      <span className="text-xs font-black" style={{ color: meta.accentHex }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <span className="text-white/65 text-[11px] font-semibold text-center max-w-[72px] leading-tight">
                      {isRtl ? step.ar : step.en}
                    </span>
                  </div>
                  {i < meta.process.length - 1 && (
                    <ArrowRight className={`w-4 h-4 text-white/15 mb-5 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Industries + Why ENVOD ── */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Industries */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={isRtl ? "text-right" : ""}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-4">{t("INDUSTRIES SERVED", "القطاعات المخدومة")}</p>
            <h2 className="text-2xl font-black text-white mb-6">{t("Who We Serve", "من نخدم")}</h2>
            <div className="space-y-3">
              {meta.industries.map((ind, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRtl ? 12 : -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${meta.accentHex}18` }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: meta.accentHex }} />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{isRtl ? meta.industriesAr[i] : ind}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Why ENVOD */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={isRtl ? "text-right" : ""}
          >
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-4">{t("WHY CHOOSE US", "لماذا تختارنا")}</p>
            <h2 className="text-2xl font-black text-white mb-6">{t("The ENVOD Advantage", "ميزة إنفود")}</h2>
            <div className="space-y-4">
              {meta.whyEnvod.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRtl ? -12 : 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border" style={{ background: `${meta.accentHex}12`, borderColor: `${meta.accentHex}25` }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: meta.accentHex }} />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{isRtl ? point.ar : point.en}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      {meta.faq.length > 0 && (
        <section className="py-16 border-t border-white/6">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mb-10 ${isRtl ? "text-right" : "text-center"}`}
            >
              <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">{t("FAQ", "الأسئلة الشائعة")}</p>
              <h2 className="text-2xl md:text-3xl font-black text-white">{t("Frequently Asked Questions", "الأسئلة المتكررة")}</h2>
            </motion.div>
            <div className="space-y-3">
              {meta.faq.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <FAQItem {...item} isRtl={isRtl} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Services (pillar internal links) ── */}
      {meta.pillar && meta.pillar.relatedLinks.length > 0 && (
        <section className="py-14 border-t border-white/6">
          <div className={`container mx-auto px-4 max-w-5xl ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">
              {t("RELATED SERVICES", "خدمات ذات صلة")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {meta.pillar.relatedLinks.map((l, i) => (
                <Link
                  key={i}
                  href={l.href}
                  className={`group flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.06] transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-white/75 text-sm font-semibold">{isRtl ? l.labelAr : l.label}</span>
                  <ArrowRight className={`w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors ${isRtl ? "rotate-180" : ""}`} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#020d1c 0%,#030f22 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 40% at 50% 50%, ${meta.accentHex}08 0%, transparent 70%)` }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        <div className={`container mx-auto px-4 text-center relative z-10 ${isRtl ? "rtl" : ""}`}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">{t("GET STARTED", "ابدأ الآن")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto leading-tight">
              {t("Ready to Ship?", "مستعد للشحن؟")} <span className="text-secondary">{t("Let's Talk.", "دعنا نتحدث.")}</span>
            </h2>
            <p className="text-white/45 max-w-lg mx-auto mb-10 text-sm leading-relaxed">
              {t("Our logistics specialists will design a custom solution for your exact requirements.", "سيصمم متخصصو اللوجستيات لدينا حلاً مخصصاً لمتطلباتك الدقيقة.")}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              <a
                href={buildMailto(service.name, service.name + " — Quote Request")}
                className={`inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-4 px-10 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Mail className="w-4 h-4" />
                {t("Get Free Quote", "احصل على عرض سعر")}
              </a>
              <Link
                href="/services"
                className={`inline-flex items-center justify-center gap-2 bg-white/[0.06] border border-white/12 hover:bg-white/[0.1] text-white py-4 px-10 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t("All Services", "جميع الخدمات")}
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

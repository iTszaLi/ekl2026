import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { VISION_INTRO, VISION_SECTIONS, VISION_FAQ, type VisionSection } from "@/lib/vision-data";
import { buildMailto } from "@/lib/service-data";
import FAQCollapse from "@/components/FAQCollapse";
import {
  ArrowRight, ChevronRight, CheckCircle2, Mail, Sparkles,
  Hexagon, Waves, FerrisWheel, Castle, TrainFront, BrainCircuit,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Hexagon, Waves, FerrisWheel, Castle, TrainFront, BrainCircuit,
};

function SectionBlock({ s, isRtl, t }: { s: VisionSection; isRtl: boolean; t: (en: string, ar: string) => string }) {
  const Icon = ICONS[s.icon] ?? Hexagon;
  return (
    <section id={s.id} className="py-16 border-t border-white/6 scroll-mt-24" aria-labelledby={`vision-${s.id}-heading`}>
      <div className={`container mx-auto px-4 max-w-4xl ${isRtl ? "text-right" : ""}`}>
        <div className={`flex items-center gap-4 mb-5 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10" style={{ background: `${s.accentHex}15` }}>
            <Icon className="w-6 h-6" style={{ color: s.accentHex }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-1" style={{ color: s.accentHex }}>
              {isRtl ? s.kickerAr : s.kickerEn}
            </p>
            <h2 id={`vision-${s.id}-heading`} className="text-2xl md:text-3xl font-black text-white leading-tight">
              {isRtl ? s.titleAr : s.titleEn}
            </h2>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {s.body.map((p, i) => (
            <p key={i} className="text-white/60 text-base leading-relaxed">
              {isRtl ? p.ar : p.en}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {s.points.map((p, i) => (
            <div key={i} className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${s.accentHex}15` }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: s.accentHex }} />
              </div>
              <span className="text-white/70 text-sm font-medium leading-relaxed">{isRtl ? p.ar : p.en}</span>
            </div>
          ))}
        </div>

        <div className={`flex flex-wrap gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
          {s.links.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              className={`group inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {isRtl ? l.labelAr : l.labelEn}
              <ArrowRight className={`w-3 h-3 text-white/30 group-hover:text-white/70 transition-colors ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Vision2030() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <div className="relative pt-24 pb-16 overflow-hidden" style={{ background: "linear-gradient(135deg,#04151f 0%,#0A2342 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none" style={{ background: "radial-gradient(ellipse, #22D3EE15 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className={`container mx-auto px-4 relative z-10 ${isRtl ? "text-right" : ""}`}>
          <nav className={`flex items-center gap-2 text-white/35 text-xs mb-8 ${isRtl ? "flex-row-reverse" : ""}`} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">{t("Home", "الرئيسية")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <span className="text-secondary font-medium">{t("Vision 2030", "رؤية 2030")}</span>
          </nav>

          <p className={`text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {t("SAUDI VISION 2030", "رؤية السعودية 2030")}
          </p>
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl mb-6">
            {t("Logistics for the Kingdom's Giga-Projects", "لوجستيات مشاريع المملكة العملاقة")}
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-3xl mb-10">
            {isRtl ? VISION_INTRO.ar : VISION_INTRO.en}
          </p>

          {/* Section anchor chips */}
          <div className={`flex flex-wrap gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            {VISION_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors"
              >
                {isRtl ? s.titleAr : s.titleEn}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sections ── */}
      {VISION_SECTIONS.map((s) => (
        <SectionBlock key={s.id} s={s} isRtl={isRtl} t={t} />
      ))}

      {/* ── FAQ ── */}
      <section className="py-16 border-t border-white/6" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, #020d1c 100%)" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className={`mb-10 ${isRtl ? "text-right" : "text-center"}`}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">{t("FAQ", "الأسئلة الشائعة")}</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">{t("Frequently Asked Questions", "الأسئلة المتكررة")}</h2>
          </div>
          <div className="space-y-3">
            {VISION_FAQ.map((item, i) => (
              <FAQCollapse key={i} {...item} isRtl={isRtl} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries cross-link ── */}
      <section className="py-14 border-t border-white/6">
        <div className={`container mx-auto px-4 max-w-5xl ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">
            {t("EXPLORE MORE", "استكشفوا المزيد")}
          </p>
          <div className={`flex flex-wrap gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link href="/industries" className="text-xs font-bold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/25 border border-secondary/30 rounded-full px-4 py-2 transition-colors">
              {t("Industries We Serve", "القطاعات التي نخدمها")}
            </Link>
            <Link href="/services" className="text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors">
              {t("All Services", "كل الخدمات")}
            </Link>
            <Link href="/services/exhibition-logistics" className="text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors">
              {t("Exhibition Logistics", "لوجستيات المعارض")}
            </Link>
            <Link href="/services/project-cargo" className="text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors">
              {t("Project Cargo", "بضائع المشاريع")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#020d1c 0%,#030f22 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 40% at 50% 50%, #22D3EE08 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">{t("GET STARTED", "ابدأ الآن")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto leading-tight">
            {t("Supplying a Vision 2030 project?", "توردون لمشروع من مشاريع رؤية 2030؟")}
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">
            {t(
              "Share your scope and delivery destination — we'll map the clearance, transport, and site-delivery plan.",
              "شاركونا نطاق العمل ووجهة التسليم — وسنرسم خطة التخليص والنقل والتسليم للموقع.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={buildMailto("Vision 2030 Logistics", "Vision 2030 Project — Quote Request")}
              className="inline-flex items-center gap-2.5 bg-secondary hover:bg-secondary/85 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 hover:-translate-y-px"
            >
              <Mail className="w-4 h-4" />
              {t("Request a Quote", "اطلب عرض سعر")}
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/15 hover:bg-white/[0.1] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all">
              {t("Contact Us", "اتصلوا بنا")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

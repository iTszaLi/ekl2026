import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { INDUSTRY_META } from "@/lib/industry-data";
import {
  ArrowRight, ChevronRight, Sparkles,
  Car, HardHat, ShoppingBag, Shirt, Cpu, Rocket,
  Hotel, Armchair, FlaskConical, RadioTower, Landmark,
} from "lucide-react";

import { INDUSTRY_BG } from "@/lib/industry-images";
import vision2030Logo from "@assets/logo_vision2030.webp";

const ICONS: Record<string, React.ElementType> = {
  Car, HardHat, ShoppingBag, Shirt, Cpu, Rocket,
  Hotel, Armchair, FlaskConical, RadioTower, Landmark,
};

export default function Industries() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <div className="relative pt-24 pb-16 overflow-hidden" style={{ background: "linear-gradient(135deg,#071426 0%,#0A2342 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(ellipse, #D6282818 0%, transparent 70%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className={`container mx-auto px-4 relative z-10 ${isRtl ? "text-right" : ""}`}>
          <nav className={`flex items-center gap-2 text-white/35 text-xs mb-8 ${isRtl ? "flex-row-reverse" : ""}`} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">{t("Home", "الرئيسية")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <span className="text-secondary font-medium">{t("Industries", "القطاعات")}</span>
          </nav>

          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {t("INDUSTRY EXPERTISE", "خبرة قطاعية")}
          </p>
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl mb-6">
            {t("Logistics Built for Your Industry", "لوجستيات مصممة لقطاعكم")}
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            {t(
              "Every industry moves differently. From automotive spare parts to hotel pre-openings and government tenders, ENVOD KINGDOM tailors customs clearance, freight, warehousing, and delivery to the way your sector works.",
              "كل قطاع يتحرك بطريقته. من قطع غيار السيارات إلى افتتاحات الفنادق والمناقصات الحكومية، تصمم إنفود كينجدم التخليص والشحن والتخزين والتسليم وفق طبيعة عمل قطاعكم.",
            )}
          </p>
        </div>
      </div>

      {/* ── Industry Grid ── */}
      <section className="py-16 container mx-auto px-4" aria-labelledby="industries-grid-heading">
        <h2 id="industries-grid-heading" className="sr-only">{t("Industries We Serve", "القطاعات التي نخدمها")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRY_META.map((ind) => {
            const Icon = ICONS[ind.icon] ?? Car;
            return (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className={`group relative rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1 ${isRtl ? "text-right" : ""}`}
                style={{ boxShadow: "0 0 0 0 transparent" }}
              >
                {/* Background photo (behind the text, dimmed so copy stays legible) */}
                {INDUSTRY_BG[ind.slug] && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" aria-hidden="true">
                    <img
                      src={INDUSTRY_BG[ind.slug]}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover opacity-[0.18] transition-all duration-500 group-hover:opacity-30 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, rgba(5,14,28,0.42) 0%, rgba(5,14,28,0.68) 55%, rgba(5,14,28,0.9) 100%)" }}
                    />
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${ind.accentHex}80, transparent)` }} />
                <div className="relative z-10">
                  <div className={`flex items-center gap-4 mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-sm" style={{ background: `${ind.accentHex}18` }}>
                      <Icon className="w-6 h-6" style={{ color: ind.accentHex }} />
                    </div>
                    <h3 className="text-white font-black text-lg leading-snug">{isRtl ? ind.nameAr : ind.nameEn}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{isRtl ? ind.shortAr : ind.shortEn}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/40 group-hover:text-secondary transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                    {t("Explore", "استكشف")}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Vision 2030 band ── */}
      <section className="py-14 border-t border-white/6">
        <div className="container mx-auto px-4">
          <Link
            href="/vision-2030"
            className={`group relative block rounded-3xl border border-white/10 overflow-hidden p-8 md:p-12 transition-all duration-300 hover:border-secondary/30 ${isRtl ? "text-right" : ""}`}
            style={{ background: "linear-gradient(135deg,#04151f 0%,#0A2342 100%)" }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: "radial-gradient(ellipse 50% 60% at 85% 30%, #22D3EE12 0%, transparent 70%)" }} />
            <div className={`relative z-10 flex flex-col md:flex-row md:items-center gap-6 ${isRtl ? "md:flex-row-reverse" : ""}`}>
              <div className="flex-1">
                <p className={`text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("SAUDI VISION 2030", "رؤية السعودية 2030")}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {t("Delivering into NEOM, Red Sea, Qiddiya & Diriyah?", "توردون لنيوم والبحر الأحمر والقدية والدرعية؟")}
                </h2>
                <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-2xl">
                  {t(
                    "See how we support giga-project suppliers and contractors with project cargo, customs clearance, and site-delivery logistics.",
                    "اطلعوا على كيفية دعمنا لموردي ومقاولي المشاريع العملاقة ببضائع المشاريع والتخليص الجمركي ولوجستيات التسليم للمواقع.",
                  )}
                </p>
              </div>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0 self-start md:self-center ${isRtl ? "sm:flex-row-reverse" : ""}`}>
                <div className="flex-none bg-white rounded-2xl px-5 py-3.5 shadow-lg shadow-black/20 border border-white/20">
                  <img
                    src={vision2030Logo}
                    alt={t("Saudi Vision 2030 — Kingdom of Saudi Arabia", "رؤية السعودية 2030 — المملكة العربية السعودية")}
                    loading="lazy"
                    className="h-16 md:h-20 w-auto object-contain"
                  />
                </div>
                <span className={`inline-flex items-center gap-2.5 bg-secondary group-hover:bg-secondary/85 text-white px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 ${isRtl ? "flex-row-reverse" : ""}`}>
                  {t("Vision 2030 Logistics", "لوجستيات رؤية 2030")}
                  <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#020d1c 0%,#030f22 100%)" }}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">{t("GET STARTED", "ابدأ الآن")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto leading-tight">
            {t("Don't see your industry?", "لا ترون قطاعكم؟")}
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">
            {t(
              "We serve many more sectors — tell us what you move and we'll design the logistics around it.",
              "نخدم قطاعات أخرى كثيرة — أخبرونا بما تنقلونه وسنصمم اللوجستيات حوله.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2.5 bg-secondary hover:bg-secondary/85 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-secondary/20 hover:-translate-y-px">
              {t("Talk to Our Team", "تحدثوا مع فريقنا")}
              <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/15 hover:bg-white/[0.1] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all">
              {t("Browse All Services", "تصفحوا كل الخدمات")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

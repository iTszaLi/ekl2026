import { useParams, Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { INDUSTRY_BY_SLUG, INDUSTRY_META } from "@/lib/industry-data";
import { INDUSTRY_BG } from "@/lib/industry-images";
import vision2030Logo from "@assets/logo_vision2030.webp";
import { SLUG_TO_ID, SERVICE_CATALOG, buildMailto } from "@/lib/service-data";
import FAQCollapse from "@/components/FAQCollapse";
import {
  ArrowRight, ChevronRight, CheckCircle2, Mail, AlertTriangle,
  Car, HardHat, ShoppingBag, Shirt, Cpu, Rocket,
  Hotel, Armchair, FlaskConical, RadioTower, Landmark,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Car, HardHat, ShoppingBag, Shirt, Cpu, Rocket,
  Hotel, Armchair, FlaskConical, RadioTower, Landmark,
};

function serviceName(slug: string, isRtl: boolean): string {
  const id = SLUG_TO_ID[slug];
  const svc = SERVICE_CATALOG.find((s) => s.id === id);
  if (!svc) return slug;
  return isRtl ? svc.nameAr : svc.name;
}

export default function IndustryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRtl } = useLanguage();
  const ind = INDUSTRY_BY_SLUG[slug ?? ""];

  if (!ind) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">{t("Industry not found", "القطاع غير موجود")}</p>
          <Link href="/industries" className="text-secondary hover:underline text-sm">{t("← Back to Industries", "← العودة للقطاعات")}</Link>
        </div>
      </div>
    );
  }

  const Icon = ICONS[ind.icon] ?? Car;
  const name = isRtl ? ind.nameAr : ind.nameEn;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <div className="relative pt-24 pb-20 overflow-hidden" style={{ background: ind.gradient }}>
        {/* Industry photo backdrop (dimmed under a navy gradient so copy stays legible) */}
        {INDUSTRY_BG[ind.slug] && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <img
              src={INDUSTRY_BG[ind.slug]}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(5,14,28,0.55) 0%, rgba(5,14,28,0.72) 55%, rgba(5,14,28,0.92) 100%)" }}
            />
          </div>
        )}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${ind.accentHex}18 0%, transparent 70%)` }} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className={`container mx-auto px-4 relative z-10 ${isRtl ? "text-right" : ""}`}>
          <nav className={`flex items-center gap-2 text-white/35 text-xs mb-8 ${isRtl ? "flex-row-reverse" : ""}`} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">{t("Home", "الرئيسية")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <Link href="/industries" className="hover:text-white transition-colors">{t("Industries", "القطاعات")}</Link>
            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            <span className="text-secondary font-medium">{name}</span>
          </nav>

          <div className={`flex items-start gap-6 mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-white/10" style={{ background: `${ind.accentHex}18`, boxShadow: `0 0 30px ${ind.accentHex}25` }}>
              <Icon className="w-10 h-10" style={{ color: ind.accentHex }} />
            </div>
            <div>
              <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                ENVOD KINGDOM SHIPPING SERVICES
              </p>
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl">
                {name}
              </h1>
            </div>

            {/* Saudi Vision 2030 badge (in-flow, so it never overlaps the nav) */}
            <div className="hidden sm:block ml-auto shrink-0 bg-white rounded-xl px-4 py-3 shadow-lg shadow-black/30">
              <img
                src={vision2030Logo}
                alt={t("Saudi Vision 2030", "رؤية السعودية 2030")}
                className="h-12 lg:h-16 w-auto object-contain"
              />
            </div>
          </div>

          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mb-10">
            {isRtl ? ind.introAr : ind.introEn}
          </p>

          <div className={`flex flex-wrap gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
            <a
              href={buildMailto(ind.nameEn, `${ind.nameEn} — General Inquiry`)}
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
          </div>
        </div>
      </div>

      {/* ── Overview (SEO body — crawlable static HTML) ── */}
      <section className="border-t border-white/6 py-16" aria-labelledby="industry-overview-heading">
        <div className={`container mx-auto px-4 max-w-3xl ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {t("OVERVIEW", "نظرة عامة")}
          </p>
          <h2 id="industry-overview-heading" className="text-2xl md:text-3xl font-black text-white mb-6">
            {t(`${ind.nameEn} in Saudi Arabia`, `${ind.nameAr} في السعودية`)}
          </h2>
          <div className="space-y-4">
            {ind.overview.map((p, i) => (
              <p key={i} className="text-white/60 text-base leading-relaxed">
                {isRtl ? p.ar : p.en}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenges ── */}
      <section className="py-16 border-t border-white/6" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, #020d1c 100%)" }}>
        <div className={`container mx-auto px-4 max-w-4xl ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {t("THE CHALLENGE", "التحدي")}
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8">
            {t("What Makes This Sector Demanding", "ما الذي يجعل هذا القطاع متطلباً")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ind.challenges.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-5 ${isRtl ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${ind.accentHex}15` }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: ind.accentHex }} />
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-medium">{isRtl ? c.ar : c.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section className="py-20 container mx-auto px-4" aria-labelledby="industry-solutions-heading">
        <div className={`mb-12 ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {t("OUR SOLUTIONS", "حلولنا")}
          </p>
          <h2 id="industry-solutions-heading" className="text-2xl md:text-4xl font-black text-white mb-3">
            {t("How ENVOD Supports", "كيف تدعم إنفود")} <span className="text-secondary">{name}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ind.solutions.map((sol, i) => {
            const inner = (
              <>
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${ind.accentHex}80, transparent)` }} />
                <div className={`flex items-start gap-3 mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${ind.accentHex}18` }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: ind.accentHex }} />
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug flex-1">
                    {isRtl ? sol.titleAr : sol.titleEn}
                  </h3>
                </div>
                <p className="text-white/48 text-xs leading-relaxed mb-4">
                  {isRtl ? sol.descAr : sol.descEn}
                </p>
                {sol.serviceSlug && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold transition-colors group-hover:text-white/80 text-white/35 ${isRtl ? "flex-row-reverse" : ""}`}>
                    {t("View Service", "عرض الخدمة")}
                    <ArrowRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180" : ""}`} />
                  </span>
                )}
              </>
            );
            const cls = `group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1 block ${isRtl ? "text-right" : ""}`;
            return sol.serviceSlug ? (
              <Link key={i} href={`/services/${sol.serviceSlug}`} className={cls}>{inner}</Link>
            ) : (
              <div key={i} className={cls}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 border-t border-white/6">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className={`mb-10 ${isRtl ? "text-right" : "text-center"}`}>
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">{t("FAQ", "الأسئلة الشائعة")}</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">{t("Frequently Asked Questions", "الأسئلة المتكررة")}</h2>
          </div>
          <div className="space-y-3">
            {ind.faq.map((item, i) => (
              <FAQCollapse key={i} {...item} isRtl={isRtl} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Related Services ── */}
      <section className="py-14 border-t border-white/6">
        <div className={`container mx-auto px-4 max-w-5xl ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">
            {t("RELATED SERVICES", "خدمات ذات صلة")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ind.relatedServiceSlugs.map((s, i) => (
              <Link
                key={i}
                href={`/services/${s}`}
                className={`group flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.06] transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span className="text-white/75 text-sm font-semibold">{serviceName(s, isRtl)}</span>
                <ArrowRight className={`w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors shrink-0 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Industries ── */}
      <section className="py-14 border-t border-white/6">
        <div className={`container mx-auto px-4 max-w-5xl ${isRtl ? "text-right" : ""}`}>
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">
            {t("OTHER INDUSTRIES", "قطاعات أخرى")}
          </p>
          <div className={`flex flex-wrap gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            {INDUSTRY_META.filter((i2) => i2.slug !== ind.slug).map((i2) => (
              <Link
                key={i2.slug}
                href={`/industries/${i2.slug}`}
                className="text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 transition-colors"
              >
                {isRtl ? i2.nameAr : i2.nameEn}
              </Link>
            ))}
            <Link
              href="/industries"
              className="text-xs font-bold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/25 border border-secondary/30 rounded-full px-4 py-2 transition-colors"
            >
              {t("All Industries", "كل القطاعات")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#020d1c 0%,#030f22 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 40% at 50% 50%, ${ind.accentHex}08 0%, transparent 70%)` }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-5">{t("GET STARTED", "ابدأ الآن")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto leading-tight">
            {t(`Ready to move your ${ind.nameEn.replace(" Logistics", "").toLowerCase()} cargo?`, `جاهزون لنقل بضائع قطاعكم؟`)}
          </h2>
          <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">
            {t(
              "Tell us what you ship and where it needs to be — our team responds within 2 hours during business hours.",
              "أخبرونا بما تشحنون وإلى أين — يرد فريقنا خلال ساعتين في أوقات العمل.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={buildMailto(ind.nameEn, `${ind.nameEn} — Quote Request`)}
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

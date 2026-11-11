import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { EXHIBITION_GUIDE_BY_SLUG, EXHIBITION_HUB_PATH } from "@/lib/exhibition-authority-content";

export default function ExhibitionGuidePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const guide = EXHIBITION_GUIDE_BY_SLUG[slug];
  const { t, isRtl } = useLanguage();
  if (!guide) {
    return (
      <main className="min-h-[60vh] bg-[#071321] px-5 py-24 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">{t("Guide not found", "لم يتم العثور على الدليل")}</h1>
          <Link href={EXHIBITION_HUB_PATH} className="mt-6 inline-flex items-center gap-2 text-[#f06a70] underline underline-offset-4">
            {t("Explore exhibition logistics in Saudi Arabia", "استكشف لوجستيات المعارض في السعودية")}
          </Link>
        </div>
      </main>
    );
  }

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const localeText = (copy: { en: string; ar: string }) => t(copy.en, copy.ar);

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-screen overflow-hidden bg-[#071321] text-[#f4f2ee]">
      <header className="relative border-b border-white/10 bg-[radial-gradient(ellipse_at_top_right,rgba(213,43,54,.14),transparent_40%)]">
        <div className="mx-auto max-w-5xl px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:px-12">
          <nav aria-label={t("Breadcrumb", "مسار التنقل")} className="mb-12 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/" className="hover:text-white">{t("Home", "الرئيسية")}</Link>
            <span aria-hidden="true">/</span>
            <Link href={EXHIBITION_HUB_PATH} className="hover:text-white">{t("Exhibition logistics", "لوجستيات المعارض")}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/75">{localeText(guide.title)}</span>
          </nav>
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#f06a70] ${isRtl ? "flex-row-reverse" : ""}`}>
            <BookOpen className="h-4 w-4" />
            {t("ENVOD KINGDOM · PRACTICAL GUIDE", "إنفود كينغدوم · دليل عملي")}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {localeText(guide.title)}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            {localeText(guide.description)}
          </p>
          <p className="mt-8 max-w-3xl border-s-2 border-[#d52b36] ps-4 text-sm leading-7 text-white/55">
            {t(
              "Planning information, not customs, legal, conservation or insurance advice. Confirm shipment-specific requirements with the relevant authority and appointed providers.",
              "معلومات للتخطيط وليست استشارة جمركية أو قانونية أو للحفظ أو التأمين. أكّد متطلبات الشحنة مع الجهة المختصة ومقدمي الخدمة المعينين.",
            )}
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        {guide.intro.map((paragraph, index) => (
          <p key={index} className="mb-6 max-w-4xl text-base leading-8 text-white/75">
            {localeText(paragraph)}
          </p>
        ))}

        <div className="mt-12 space-y-14">
          {guide.sections.map((section, index) => (
            <section key={index} className="border-t border-white/12 pt-8">
              <div className={`mb-5 flex items-start gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="pt-1 font-mono text-xs text-[#f06a70]">0{index + 1}</span>
                <h2 className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {localeText(section.heading)}
                </h2>
              </div>
              <div className="space-y-5 ps-8">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="max-w-4xl text-sm leading-8 text-white/65 sm:text-base">
                    {localeText(paragraph)}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="max-w-4xl space-y-3 pt-1">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className={`flex gap-3 text-sm leading-7 text-white/70 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e94b55]" />
                        {localeText(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {guide.references?.length ? (
          <section className="mt-16 border-y border-white/12 bg-white/[.025] px-5 py-8 sm:px-8">
            <h2 className="text-xl font-bold text-white">{t("Official references", "مراجع رسمية")}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
              {t(
                "Use the current authority guidance to confirm eligibility, procedures and required documents for your shipment.",
                "استخدم الإرشادات الحالية للجهة المختصة لتأكيد الأهلية والإجراءات والمستندات المطلوبة لشحنتك.",
              )}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {guide.references.map((reference) => (
                <li key={reference.href}>
                  <a
                    href={isRtl ? reference.hrefAr ?? reference.href : reference.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-start gap-2 text-sm font-semibold leading-6 text-white/80 underline decoration-[#d52b36]/70 underline-offset-4 transition hover:text-white ${isRtl ? "flex-row-reverse text-right" : ""}`}
                  >
                    <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#f06a70]" />
                    {localeText(reference.label)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">{t("Frequently asked questions", "الأسئلة الشائعة")}</h2>
          <div className="mt-5 border-t border-white/15">
            {guide.faqs.map((faq, index) => (
              <details key={index} className="group border-b border-white/15">
                <summary className={`flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-start text-sm font-semibold leading-6 text-white marker:hidden ${isRtl ? "flex-row-reverse" : ""}`}>
                  {localeText(faq.question)}
                  <ChevronDown aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#e95b64] transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-4xl pb-5 text-sm leading-7 text-white/60">{localeText(faq.answer)}</p>
              </details>
            ))}
          </div>
        </section>

        <nav aria-label={t("Related exhibition logistics pages", "صفحات لوجستيات المعارض ذات الصلة")} className="mt-16 border-t border-white/15 pt-8">
          <h2 className="text-lg font-bold text-white">{t("Related services and guides", "خدمات وأدلة ذات صلة")}</h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {guide.relatedLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`inline-flex items-center gap-2 text-sm text-white/70 underline decoration-[#d52b36]/70 underline-offset-4 hover:text-white ${isRtl ? "flex-row-reverse" : ""}`}>
                  {localeText(item.label)}
                  <NextArrow aria-hidden="true" className="h-3.5 w-3.5 text-[#f06a70]" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>

      <footer className="border-t border-white/10 bg-[#0b1a2a]">
        <div className={`mx-auto flex max-w-5xl flex-col justify-between gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center lg:px-12 ${isRtl ? "md:flex-row-reverse" : ""}`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f06a70]">{t("Need to discuss a shipment?", "هل ترغب في مناقشة شحنة؟")}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              {t("Share the event, cargo, route and timing so the available scope can be reviewed.", "أرسل بيانات الفعالية والبضائع والمسار والتوقيت لمراجعة النطاق المتاح.")}
            </p>
          </div>
          <Link href="/contact?service=exhibition-logistics" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 bg-[#d52b36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b9232d]">
            {t("Request an exhibition quote", "اطلب عرض سعر للمعرض")}
            <NextArrow aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

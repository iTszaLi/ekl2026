import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Box, CalendarDays, Check,
  ChevronDown, ClipboardList, FileText, MapPin, Ship,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SERVICE_IMAGES } from "@/lib/service-images";
import { EXHIBITION_GUIDES, EXHIBITION_HUB } from "@/lib/exhibition-authority-content";

const exhibitionImage = SERVICE_IMAGES[11];
const carnetImage = SERVICE_IMAGES[19];

const workflowIcons = [ClipboardList, Box, FileText, CalendarDays, Ship, MapPin, Check];

export default function ExhibitionAuthorityHub() {
  const { t, isRtl } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const row = isRtl ? "flex-row-reverse" : "";
  const align = isRtl ? "text-right" : "";
  const quoteHref = "/contact?service=exhibition-logistics";

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-[100dvh] overflow-hidden bg-[#071321] text-[#f4f2ee]">
      <section className="relative isolate min-h-[660px] overflow-hidden border-b border-white/10">
        <img
          src={exhibitionImage}
          alt={t("Freight being prepared for an exhibition shipment", "تجهيز شحنة مخصصة لمعرض")}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: isRtl
              ? "linear-gradient(270deg, rgba(5,14,25,.96) 0%, rgba(5,14,25,.78) 53%, rgba(5,14,25,.25) 100%)"
              : "linear-gradient(90deg, rgba(5,14,25,.96) 0%, rgba(5,14,25,.78) 53%, rgba(5,14,25,.25) 100%)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071321] via-transparent to-[#071321]/25" />

        <div className={`mx-auto flex min-h-[660px] max-w-[1320px] flex-col justify-between px-5 pb-10 pt-28 sm:px-8 lg:px-14 ${align}`}>
          <div className={`flex items-center justify-between border-b border-white/20 pb-5 ${row}`}>
            <div className={`flex items-center gap-3 ${row}`}>
              <span className="h-8 w-1 bg-[#d52b36]" />
              <span className="text-[11px] font-bold uppercase tracking-[.24em] text-white/85">
                ENVOD KINGDOM <span className="text-white/50">/</span> {t("EXHIBITION LOGISTICS", "لوجستيات المعارض")}
              </span>
            </div>
            <a href="#field-guide" className={`hidden items-center gap-2 text-xs font-semibold text-white/75 transition hover:text-white sm:flex ${row}`}>
              {t("Explore the field guide", "استكشف الدليل")}
              <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="max-w-[760px] py-16">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[.35em] text-[#f06a70]">
              {t(EXHIBITION_HUB.eyebrow.en, EXHIBITION_HUB.eyebrow.ar)}
            </p>
            <h1 className="max-w-[760px] text-4xl font-extrabold leading-[1.08] tracking-[-.035em] text-white sm:text-6xl lg:text-[64px]">
              {t(EXHIBITION_HUB.title.en, EXHIBITION_HUB.title.ar)}
            </h1>
            <p className="mt-7 max-w-[640px] text-base leading-8 text-white/75 sm:text-lg">
              {t(EXHIBITION_HUB.subtitle.en, EXHIBITION_HUB.subtitle.ar)}
            </p>
            <p className="mt-4 max-w-[650px] text-sm leading-7 text-white/60">
              {t(EXHIBITION_HUB.intro.en, EXHIBITION_HUB.intro.ar)}
            </p>
            <div className={`mt-9 flex flex-wrap gap-3 ${row}`}>
              <Link href={quoteHref} data-testid="link-exhibition-quote-hero" className="inline-flex min-h-12 items-center gap-3 bg-[#d52b36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b9232d]">
                {t("Discuss your shipment", "ناقش شحنتك")}
                <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
              <Link href="/services/exhibition-logistics" data-testid="link-exhibition-service-hero" className="inline-flex min-h-12 items-center gap-3 border border-white/40 bg-[#071321]/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                {t("Exhibition logistics service", "خدمة لوجستيات المعارض")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className={`flex flex-wrap items-end justify-between gap-5 border-t border-white/20 pt-5 ${row}`}>
            <span className="max-w-xs text-xs leading-5 text-white/55">
              {t("Freight coordination and documentation support. Scope, routing and responsibilities are confirmed per enquiry.", "تنسيق الشحن ودعم المستندات. يُؤكد النطاق والمسار والمسؤوليات لكل استفسار.")}
            </span>
            <span className="font-mono text-[10px] tracking-[.18em] text-white/60">{t("HEAD OFFICE · AL MALAZ, RIYADH", "المكتب الرئيسي · الملز، الرياض")}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-14 lg:py-24">
        <div className={align}>
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("THE EXHIBITOR'S BRIEF", "موجز العارض")}</p>
          <h2 className="mt-5 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {t("A show date is fixed. The freight plan has moving parts.", "موعد المعرض ثابت، لكن خطة الشحن لها تفاصيل متغيرة.")}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/60">
            {t(
              "Exhibition shipments bring international freight, event schedules, venue rules and customs documentation into one timeline. Start with the organizer’s instructions, then make each handoff and responsibility explicit.",
              "تجمع شحنات المعارض بين الشحن الدولي وجداول الفعاليات وتعليمات المواقع ومستندات الجمارك ضمن خطة زمنية واحدة. ابدأ بتعليمات المنظّم، ثم وضّح كل مرحلة تسليم ومسؤولية.",
            )}
          </p>
          <a href="#planning-checklist" className={`mt-7 inline-flex items-center gap-2 border-b border-[#d52b36] pb-2 text-sm font-semibold text-white ${row}`}>
            {t("Use the planning checklist", "استخدم قائمة التخطيط")}
            <ArrowDown className="h-4 w-4 text-[#ed5b64]" />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            { icon: Ship, title: "International freight", titleAr: "الشحن الدولي", text: "Origin, mode and route", textAr: "المنشأ ووسيلة النقل والمسار" },
            { icon: FileText, title: "Document readiness", titleAr: "جاهزية المستندات", text: "Roles, records and review", textAr: "الأدوار والسجلات والمراجعة" },
            { icon: MapPin, title: "Venue handover", titleAr: "التسليم إلى الموقع", text: "Access, windows and scope", textAr: "الدخول والمواعيد والنطاق" },
          ].map(({ icon: Icon, title, titleAr, text, textAr }, index) => (
            <div key={title} className={`bg-[#0b1a2a] p-5 sm:p-6 ${align}`} data-testid={`panel-shipment-stage-${index + 1}`}>
              <span className="font-mono text-[10px] text-[#f06a70]">0{index + 1}</span>
              <Icon className="my-8 h-6 w-6 text-white/75" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-white">{t(title, titleAr)}</h3>
              <p className="mt-2 text-xs leading-5 text-white/50">{t(text, textAr)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="field-guide" className="border-y border-white/10 bg-[#0b1a2a]">
        <div className="mx-auto grid max-w-[1320px] gap-0 lg:grid-cols-[.65fr_1.35fr]">
          <div className={`flex flex-col justify-between border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-e ${align}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("FIELD GUIDE / 01", "الدليل العملي / ٠١")}</p>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white">
                {t("Seven handoffs from brief to return", "سبع مراحل من موجز الشحنة إلى العودة")}
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/60">
                {t(
                  "A show shipment can involve several parties. Agree who owns each step before cargo moves, and confirm route, timing and customs responsibilities for the shipment.",
                  "قد تشمل شحنة المعرض عدة أطراف. اتفق على مسؤول كل مرحلة قبل تحرك البضائع، وأكّد المسار والتوقيت والمسؤوليات الجمركية للشحنة.",
                )}
              </p>
            </div>
            <div className="mt-10 hidden border-t border-white/10 pt-5 lg:block">
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-white/45">{t("Planning note", "ملاحظة تخطيط")}</span>
              <p className="mt-2 text-xs leading-5 text-white/55">
                {t("The organizer and venue set their own access rules, deadlines and appointed contractor requirements.", "يحدد المنظّم والموقع قواعد الدخول والمواعيد ومتطلبات المقاول المعتمد الخاصة بهما.")}
              </p>
            </div>
          </div>
          <div id="planning-checklist" className="divide-y divide-white/10">
              {EXHIBITION_HUB.workflow.map((item, index) => {
              const Icon = workflowIcons[index % workflowIcons.length];
              return (
                <article key={item.title.en} className={`grid gap-4 px-6 py-6 sm:grid-cols-[56px_1fr] sm:gap-6 sm:px-10 sm:py-8 ${align}`}>
                  <div className={`flex items-center justify-between sm:block ${row}`}>
                    <span className="font-mono text-sm text-[#f06a70]">{String(index + 1).padStart(2, "0")}</span>
                    <Icon className="h-5 w-5 text-white/45 sm:mt-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t(item.title.en, item.title.ar)}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">{t(item.description.en, item.description.ar)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-14 lg:py-24">
        <div className={`grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr] ${isRtl ? "lg:[direction:rtl]" : ""}`}>
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[450px]">
            <img src={carnetImage} alt={t("Documents associated with temporary exhibition cargo", "مستندات مرتبطة بشحنات المعارض المؤقتة")} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071321]/85 via-transparent to-transparent" />
            <span className={`absolute bottom-5 text-[10px] font-bold uppercase tracking-[.23em] text-white/75 ${isRtl ? "right-5" : "left-5"}`}>
              {t("DOCUMENTS / HANDLE WITH CARE", "المستندات / عناية في التعامل")}
            </span>
          </div>
          <div className={align}>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("FIELD GUIDE / 02", "الدليل العملي / ٠٢")}</p>
            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {t("Temporary imports need a document plan.", "الشحنات المؤقتة تحتاج إلى خطة مستندات.")}
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/60">
              {t(
                "If goods are intended to return after the event, state that from the outset. Temporary admission options, eligibility, guarantees and paperwork depend on the cargo and the applicable process. ATA Carnets are issued by authorized national associations—not by ENVOD.",
                "إذا كان من المخطط إعادة البضائع بعد الفعالية، فاذكر ذلك من البداية. تعتمد خيارات الإدخال المؤقت والأهلية والضمانات والأوراق على البضائع والإجراءات المعمول بها. تصدر دفاتر ATA Carnet عن جمعيات وطنية مخوّلة، وليس عن إنفود.",
              )}
            </p>
            <div className="mt-7 border-s-2 border-[#d52b36] ps-4">
              <p className="text-sm font-semibold leading-6 text-white/85">
                {t("Keep the commercial invoice, packing list, transport document and event details consistent.", "احرص على اتساق الفاتورة التجارية وقائمة التعبئة ومستند النقل وبيانات الفعالية.")}
              </p>
            </div>
            <div className={`mt-7 flex flex-wrap gap-3 ${row}`}>
              <Link href="/services/ata-carnet" data-testid="link-ata-carnet-service" className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-[#d52b36] underline-offset-4 hover:text-white/75">
                {t("ATA Carnet enquiries", "استفسارات ATA Carnet")} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/services/customs-clearance" data-testid="link-customs-service" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white">
                {t("Customs clearance", "التخليص الجمركي")} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b1a2a]">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
          <div className={`mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end ${row} ${align}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("SERVICE & PLANNING PATHWAYS", "مسارات الخدمات والتخطيط")}</p>
              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white">
                {t("Build the plan around the cargo.", "ابنِ الخطة وفق طبيعة الشحنة.")}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/55">
              {t(EXHIBITION_HUB.capabilityIntro.en, EXHIBITION_HUB.capabilityIntro.ar)}
            </p>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {EXHIBITION_HUB.capabilities.map((item, index) => (
              <article key={item.title.en} className={`flex min-h-[220px] flex-col bg-[#0b1a2a] p-5 sm:p-6 ${align}`} data-testid={`card-exhibition-pathway-${index + 1}`}>
                <div className={`flex items-center justify-between ${row}`}>
                  <span className="font-mono text-xs text-[#f06a70]">{String(index + 1).padStart(2, "0")}</span>
                  <Check className="h-4 w-4 text-white/35" />
                </div>
                <h3 className="mt-7 text-sm font-bold text-white">{t(item.title.en, item.title.ar)}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-white/55">{t(item.description.en, item.description.ar)}</p>
                <Link href={item.href} className={`mt-5 inline-flex items-center gap-2 text-xs font-bold text-white/75 underline decoration-[#d52b36]/70 underline-offset-4 hover:text-white ${row}`}>
                  {t(item.linkLabel.en, item.linkLabel.ar)}
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#f06a70]" />
                </Link>
              </article>
            ))}
          </div>
          <div className={`mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between ${row} ${align}`}>
            <p className="max-w-2xl text-xs leading-6 text-white/50">
              {t("Specialist art handling, venue installation, construction, insurance and customs outcomes are not assumed; confirm the required provider and scope for each enquiry.", "لا يُفترض توفر مناولة الأعمال الفنية المتخصصة أو تركيب الموقع أو الإنشاء أو التأمين أو نتائج جمركية محددة؛ أكّد مقدم الخدمة والنطاق المطلوب لكل استفسار.")}
            </p>
            <Link href="/services/exhibition-logistics" data-testid="link-exhibition-service-details" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-white hover:text-[#f06a70]">
              {t("View exhibition service details", "اطلع على تفاصيل خدمة المعارض")}
              <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </section>

      <section id="exhibition-cities" className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-14 lg:py-24">
        <div className={`mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end ${row} ${align}`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("CITY-SPECIFIC EVENT PLANNING", "تخطيط الفعاليات بحسب المدينة")}</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {t("Riyadh, Jeddah and Dammam", "الرياض وجدة والدمام")}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/55">
            {t("Local venues, gateways and delivery instructions shape the plan. City coverage does not imply a local ENVOD branch or an appointment by an event venue.", "تحدد المواقع المحلية ومنافذ الدخول وتعليمات التسليم الخطة. ولا يعني نطاق المدن وجود فرع محلي لإنفود أو تعييناً من موقع الفعالية.")}
          </p>
        </div>
        <div className="grid gap-px border border-white/10 bg-white/10 lg:grid-cols-3">
          {EXHIBITION_HUB.cities.map((city, index) => (
            <article key={city.title.en} className={`min-h-[280px] bg-[#0b1a2a] p-6 sm:p-8 ${align}`} data-testid={`card-exhibition-city-${index + 1}`}>
              <span className="font-mono text-xs text-[#f06a70]">0{index + 1} / KSA</span>
              <h3 className="mt-8 text-xl font-bold leading-tight text-white">{t(city.title.en, city.title.ar)}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{t(city.description.en, city.description.ar)}</p>
              <p className="mt-5 border-t border-white/10 pt-4 text-[10px] font-semibold leading-5 text-white/40">{t(city.venues.en, city.venues.ar)}</p>
              <Link href={city.href} className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white/75 underline decoration-[#d52b36]/70 underline-offset-4 hover:text-white ${row}`}>
                {t("Venue and city planning details", "تفاصيل تخطيط المواقع والمدن")}
                <ArrowUpRight className="h-3.5 w-3.5 text-[#f06a70]" />
              </Link>
            </article>
          ))}
        </div>
        <p className={`mt-5 text-xs leading-6 text-white/45 ${align}`}>
          {t("ENVOD KINGDOM’s head office is in Al Malaz, Riyadh. Enquiries for other Saudi destinations are reviewed shipment by shipment.", "يقع المكتب الرئيسي لإنفود كينغدوم في حي الملز بالرياض. وتُراجع استفسارات الوجهات السعودية الأخرى لكل شحنة على حدة.")}
        </p>
        <div className={`mt-12 border-t border-white/10 pt-7 ${align}`}>
          <h3 className="text-sm font-bold text-white">{t("Event and cargo enquiry categories", "فئات استفسارات الفعاليات والبضائع")}</h3>
          <div className={`mt-4 flex flex-wrap gap-2 ${row}`}>
            {EXHIBITION_HUB.eventTypes.map((item) => (
              <span key={item.en} className="border border-white/12 bg-white/[.025] px-3 py-2 text-xs text-white/65">
                {t(item.en, item.ar)}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-white/45">
            {t("These are enquiry topics, not a claim of an event appointment, specialist certification or guaranteed service availability.", "هذه موضوعات للاستفسار وليست ادعاءً بتعيين لفعالية أو اعتماد تخصصي أو توفر مضمون للخدمة.")}
          </p>
        </div>
      </section>

      <section id="exhibition-resources" className="border-y border-white/10 bg-[#0b1a2a]">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-14 lg:py-24">
          <div className={`mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end ${row} ${align}`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("EXHIBITOR RESOURCE LIBRARY", "مكتبة موارد العارضين")}</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("Guidance for the decisions behind each move.", "إرشادات للقرارات التي تسبق كل حركة شحن.")}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/55">
              {t("Use the existing service pages for freight, customs and ATA Carnet details, and these focused guides for event-specific planning.", "استخدم صفحات الخدمات الحالية لتفاصيل الشحن والجمارك وكارنيه ATA، وهذه الأدلة للتخطيط الخاص بالفعاليات.")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXHIBITION_GUIDES.map((guide, index) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className={`group flex min-h-[245px] flex-col border border-white/10 bg-[#071321] p-6 transition-colors hover:border-[#d52b36]/70 ${align}`} data-testid={`link-exhibition-guide-${index + 1}`}>
                <span className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#f06a70] ${row}`}>
                  {t("PLANNING GUIDE", "دليل تخطيط")}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <h3 className="mt-7 text-lg font-bold leading-snug text-white">{t(guide.title.en, guide.title.ar)}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-white/55">{t(guide.description.en, guide.description.ar)}</p>
                <span className="mt-6 border-t border-white/10 pt-4 text-xs font-semibold text-white/70 group-hover:text-white">
                  {t("Read the guide", "اقرأ الدليل")}
                </span>
              </Link>
            ))}
          </div>
          <div className={`mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[.7fr_1.3fr] ${align}`}>
            <div>
              <h3 className="text-lg font-bold text-white">{t("Official Saudi customs references", "مراجع الجمارك السعودية الرسمية")}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {t("Check current authority guidance for ATA Carnets, temporary admission and event disclosure. Eligibility and procedures are decided by the relevant parties.", "راجع الإرشادات الحالية للجهات المختصة بشأن كارنيه ATA والإدخال المؤقت والإفصاح عن الفعاليات. وتحدد الجهات المعنية الأهلية والإجراءات.")}
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {EXHIBITION_HUB.authoritativeLinks.map((reference) => (
                <li key={reference.href}>
                  <a href={isRtl ? reference.hrefAr : reference.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-start gap-2 text-sm leading-6 text-white/75 underline decoration-[#d52b36]/70 underline-offset-4 hover:text-white ${row}`}>
                    <ArrowUpRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#f06a70]" />
                    {t(reference.label.en, reference.label.ar)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className={`mt-10 flex flex-col justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center ${row} ${align}`}>
            <div>
              <h3 className="text-lg font-bold text-white">{t(EXHIBITION_HUB.experience.heading.en, EXHIBITION_HUB.experience.heading.ar)}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{t(EXHIBITION_HUB.experience.description.en, EXHIBITION_HUB.experience.description.ar)}</p>
            </div>
            <Link href="/gallery" className={`inline-flex shrink-0 items-center gap-2 text-sm font-bold text-white underline decoration-[#d52b36]/70 underline-offset-4 hover:text-white/75 ${row}`}>
              {t(EXHIBITION_HUB.experience.linkLabel.en, EXHIBITION_HUB.experience.linkLabel.ar)}
              <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-14 lg:py-24">
        <div className={align}>
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e94b55]">{t("COMMON QUESTIONS", "أسئلة متكررة")}</p>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {t("Make the next step clearer.", "اجعل خطوتك التالية أوضح.")}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
            {t("Event requirements differ. The organizer’s current manual and venue rules remain the reference for each show.", "تختلف متطلبات الفعاليات. ويظل دليل المنظّم الحالي وتعليمات الموقع مرجع كل معرض.")}
          </p>
        </div>
        <div className="border-t border-white/15">
          {EXHIBITION_HUB.faqs.map((faq, index) => {
            const expanded = openFaq === index;
            return (
              <div key={faq.question.en} className="border-b border-white/15">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenFaq(expanded ? null : index)}
                  data-testid={`button-exhibition-faq-${index + 1}`}
                  className={`flex w-full items-start justify-between gap-5 py-5 text-start ${row}`}
                >
                  <span className="text-sm font-semibold leading-6 text-white">{t(faq.question.en, faq.question.ar)}</span>
                  <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[#e95b64] transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className={`max-w-2xl pb-5 text-sm leading-7 text-white/55 ${align}`}>{t(faq.answer.en, faq.answer.ar)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#0b1a2a]">
        <div className="absolute inset-y-0 w-1 bg-[#d52b36] ltr:left-0 rtl:right-0" />
        <div className={`mx-auto flex max-w-[1320px] flex-col justify-between gap-8 px-7 py-14 sm:px-12 lg:flex-row lg:items-center lg:px-14 lg:py-20 ${row} ${align}`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#ed5b64]">{t("READY TO PLAN?", "هل أنت مستعد للتخطيط؟")}</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {t("Send the brief. We’ll review the logistics.", "أرسل موجز الشحنة، وسنراجع متطلباتها اللوجستية.")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              {t("Share your origin, cargo details, event dates and delivery instructions. The proposed scope and responsibilities are confirmed before any booking.", "أرسل بلد المنشأ وتفاصيل الشحنة ومواعيد الفعالية وتعليمات التسليم. يُؤكد النطاق المقترح والمسؤوليات قبل أي حجز.")}
            </p>
          </div>
          <Link href={quoteHref} data-testid="link-exhibition-quote-final" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 bg-[#d52b36] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b9232d]">
            {t("Request a quote", "اطلب عرض سعر")}
            <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </section>
    </main>
  );
}

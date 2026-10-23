import { useEffect, useMemo, useRef, useState, type ElementType, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3,
  FileCheck2, Globe2, MapPin, MessageCircle, PackageCheck, Plane, ShieldCheck,
  Ship, Truck, Warehouse, Waypoints, Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SERVICE_CATALOG, SERVICE_DIRECTORY_ORDER, SERVICE_META } from "@/lib/service-data";
import { DOOR_TO_DOOR_IMAGE, SERVICE_IMAGES } from "@/lib/service-images";
import { SERVICE_FAQS } from "@/lib/services-faq";
import { getIntrinsicImageDimensions } from "@/lib/image-dimensions";

type LanguageText = { en: string; ar: string };
type Tab = "all" | "core" | "specialized";
type Offering = {
  id: number | "door-to-door";
  name: LanguageText;
  description: LanguageText;
  highlights?: LanguageText[];
  numberLabel?: string;
  icon: string;
  slug: string;
  category: "core" | "specialized";
  image?: string;
};

const tr = (en: string, ar: string): LanguageText => ({ en, ar });

function navigateFromServiceCardClick(
  event: ReactMouseEvent<HTMLElement>,
  navigate: (path: string) => void,
  href: string,
) {
  if (event.defaultPrevented || event.button !== 0) return;

  const target = event.target;
  if (target instanceof Element && target.closest("a, button, input, textarea, select, summary, [role='button']")) return;

  const selection = window.getSelection();
  const selectionTouchesCard =
    !!selection?.toString() &&
    [selection.anchorNode, selection.focusNode].some((node) => node !== null && event.currentTarget.contains(node));
  if (selectionTouchesCard) return;

  if (event.metaKey || event.ctrlKey) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  if (event.shiftKey || event.altKey) return;

  navigate(href);
}

function navigateFromServiceCardKey(
  event: ReactKeyboardEvent<HTMLElement>,
  navigate: (path: string) => void,
  href: string,
) {
  if (event.target !== event.currentTarget || event.key !== "Enter") return;
  event.preventDefault();
  navigate(href);
}

const SERVICE_NOTES: Record<number, LanguageText> = {
  1: tr("FCL, LCL and route options reviewed against your cargo.", "تُراجع خيارات FCL وLCL والمسار وفقاً لبضاعتك."),
  2: tr("Routing, carrier availability and cargo acceptance checked per shipment.", "تُراجع المسارات وتوفر الناقل وقبول البضاعة لكل شحنة."),
  3: tr("Saudi and GCC routes, operators and border documents scoped per request.", "تُحدد مسارات المملكة والخليج والناقلون ومستندات الحدود وفق كل طلب."),
  4: tr("Documentation and shipment requirements reviewed before the next step.", "تُراجع المستندات ومتطلبات الشحنة قبل الانتقال إلى الخطوة التالية."),
  5: tr("Storage and order-handling arrangements confirmed to match your scope.", "تُؤكد ترتيبات التخزين وتجهيز الطلبات بما يناسب نطاقك."),
  6: tr("Multi-modal shipment coordination from origin through onward delivery.", "تنسيق الشحن متعدد الوسائط من المنشأ حتى التسليم اللاحق."),
  7: tr("Supply-chain scope and provider arrangements assessed for your operation.", "تُقيّم احتياجات سلسلة التوريد وترتيبات مقدمي الخدمة لعملياتك."),
  8: tr("Project, heavy-lift and OOG needs reviewed against route and equipment.", "تُراجع احتياجات المشاريع والرفع الثقيل والبضائع الضخمة وفق المسار والمعدات."),
  9: tr("Residential and commercial move scope, packing and timing to confirm.", "يُؤكد نطاق النقل السكني والتجاري والتغليف والتوقيت."),
  10: tr("Fulfilment, last-mile and returns requirements reviewed per operation.", "تُراجع متطلبات التجهيز والتوصيل الأخير والمرتجعات وفق العملية."),
  11: tr(
    "Exhibition and event logistics is the end-to-end transport, customs handling, and on-site delivery of displays and equipment for trade shows and events — with ATA Carnet temporary import.",
    "لوجستيات المعارض والفعاليات هي النقل والمناولة الجمركية والتسليم في الموقع للمعروضات والمعدات المخصصة للمعارض والفعاليات — مع الاستيراد المؤقت باستخدام كارنيه ATA.",
  ),
  12: tr("Product handling, regulatory documents and temperature needs reviewed.", "تُراجع مناولة المنتج ومستنداته التنظيمية واحتياجات الحرارة."),
  13: tr("Food and FMCG documents, handling and temperature needs vary by cargo.", "تختلف مستندات الأغذية والسلع الاستهلاكية ومناولتها وحرارتها حسب البضاعة."),
  14: tr("Import eligibility, carrier acceptance and permit requirements to confirm.", "تُؤكد أهلية الاستيراد وقبول الناقل ومتطلبات التصاريح."),
  15: tr("Non-containerized cargo options, port handling and documents to review.", "تُراجع خيارات البضائع غير الحاوية ومناولة الميناء والمستندات."),
  16: tr("Classification, packaging, documents and carrier acceptance are shipment-specific.", "يعتمد التصنيف والتعبئة والمستندات وقبول الناقل على الشحنة."),
  17: tr("Dimensions, route, permits, equipment and qualified-provider availability to review.", "تُراجع الأبعاد والمسار والتصاريح والمعدات وتوفر مقدم الخدمة المناسب."),
  18: tr("RoRo suitability, vessel, port and onward transport confirmed per shipment.", "تُؤكد ملاءمة رورو والسفينة والميناء والنقل اللاحق لكل شحنة."),
  19: tr("Coordinate eligibility and document checks; issuance is by an authorized body.", "تنسيق مراجعة الأهلية والمستندات؛ ويصدر الكارنيه جهة مخوّلة."),
  20: tr("High-care handling, packing and site requirements scoped before booking.", "يُحدد نطاق المناولة عالية العناية والتغليف ومتطلبات الموقع قبل الحجز."),
  21: tr("Temperature range, monitoring and equipment availability require confirmation.", "يتطلب نطاق الحرارة والمراقبة وتوفر المعدات التأكيد."),
  22: tr("Packing and crating requirements depend on cargo, destination and standards.", "تعتمد متطلبات التغليف والتصنيد على البضاعة والوجهة والمعايير."),
  23: tr("Urgent document and parcel options depend on route and operator availability.", "تعتمد خيارات المستندات والطرود العاجلة على المسار وتوفر المشغّل."),
  24: tr("Third-country routing, documentation and customs responsibilities reviewed.", "تُراجع مسارات الدول الأخرى والمستندات ومسؤوليات الجمارك."),
};

const SERVICE_HIGHLIGHTS: Record<number, LanguageText[]> = {
  1: [tr("FCL and LCL options reviewed", "مراجعة خيارات FCL وLCL"), tr("Carrier and port availability checked", "التحقق من توفر الناقل والميناء"), tr("Origin-to-destination route scoped", "تحديد نطاق المسار من المنشأ إلى الوجهة")],
  2: [tr("Cargo handling and acceptance reviewed", "مراجعة مناولة الشحنة وقبول الناقل"), tr("Route and operator options checked", "دراسة المسار وخيارات المشغّل"), tr("Transit timing varies by carrier and customs", "تختلف مدة النقل حسب الناقل والجمارك")],
  3: [tr("Saudi and GCC routes considered", "دراسة المسارات داخل السعودية والخليج"), tr("Border documents reviewed", "مراجعة مستندات الحدود"), tr("Vehicle and operator availability confirmed", "تأكيد توفر المركبة والمشغّل")],
  4: [tr("Import and export paperwork reviewed", "مراجعة مستندات الاستيراد والتصدير"), tr("Applicable product documents assessed", "تقييم مستندات المنتج المنطبقة"), tr("Approvals and release remain with authorities", "تظل الموافقات والفسح لدى الجهات المختصة")],
  5: [tr("Storage and handling needs assessed", "تقييم احتياجات التخزين والمناولة"), tr("Inventory workflow reviewed", "مراجعة إجراءات المخزون"), tr("Capacity and location confirmed per request", "تأكيد السعة والموقع لكل طلب")],
  6: [tr("Air, sea and road options", "خيارات الشحن الجوي والبحري والبري"), tr("Route and shipment documents reviewed", "مراجعة المسار ومستندات الشحنة"), tr("Handoffs and delivery scope assessed", "تقييم نطاق التسليم ونقاط المناولة")],
  7: [tr("Supplier and provider coordination", "تنسيق الموردين ومقدمي الخدمات"), tr("Inventory and order workflows reviewed", "مراجعة إجراءات المخزون والطلبات"), tr("Last-mile requirements assessed", "دراسة متطلبات التوصيل للمرحلة الأخيرة")],
  8: [tr("Cargo size and handling reviewed", "مراجعة أبعاد الشحنة ومتطلبات المناولة"), tr("Route, permits and equipment assessed", "تقييم المسار والتصاريح والمعدات"), tr("Site delivery needs discussed", "مناقشة متطلبات التسليم في الموقع")],
  9: [tr("Residential and corporate move scope", "تحديد نطاق النقل السكني والتجاري"), tr("Packing and shipment documents reviewed", "مراجعة التغليف ومستندات الشحنة"), tr("Route and schedule coordinated", "تنسيق المسار والجدول الزمني")],
  10: [tr("Fulfilment and storage needs assessed", "تقييم احتياجات التخزين وتجهيز الطلبات"), tr("Last-mile and returns options reviewed", "دراسة خيارات التوصيل الأخير والمرتجعات"), tr("Platform requirements discussed", "مراجعة متطلبات المنصات")],
  11: [tr("Event and venue delivery planning", "تخطيط التسليم للفعالية والموقع"), tr("Temporary import and re-export documents reviewed", "مراجعة مستندات الإدخال المؤقت وإعادة التصدير"), tr("Return timing and routing assessed", "مراجعة توقيت الإعادة ومسارها")],
  12: [tr("Product and handling requirements", "متطلبات المنتج والمناولة"), tr("Temperature range and equipment reviewed", "مراجعة نطاق الحرارة والمعدات"), tr("Documents and carrier acceptance checked", "مراجعة المستندات وقبول الناقل")],
  13: [tr("Cargo condition and temperature needs", "احتياجات حالة البضاعة ودرجة الحرارة"), tr("Import documents assessed by product", "تقييم مستندات الاستيراد حسب المنتج"), tr("Storage, route and delivery scope reviewed", "مراجعة التخزين والمسار ونطاق التسليم")],
  14: [tr("Import eligibility and permits reviewed", "مراجعة أهلية الاستيراد والتصاريح"), tr("Health documents and requirements checked", "مراجعة المستندات والمتطلبات الصحية"), tr("Carrier and quarantine requirements assessed", "دراسة متطلبات الناقل والحجر")],
  15: [tr("Non-containerized cargo assessed", "تقييم البضائع غير المحواة"), tr("Port and handling needs reviewed", "مراجعة احتياجات الميناء والمناولة"), tr("Route and transport documents checked", "مراجعة المسار ومستندات النقل")],
  16: [tr("Cargo classification and safety documents", "تصنيف الشحنة ومستندات السلامة"), tr("Packaging and handling requirements reviewed", "مراجعة متطلبات التعبئة والمناولة"), tr("Carrier acceptance checked", "التحقق من قبول الناقل")],
  17: [tr("Dimensions, weight and route reviewed", "مراجعة الأبعاد والوزن والمسار"), tr("Permit and equipment availability assessed", "دراسة توفر التصاريح والمعدات"), tr("Handling and site delivery planned", "تخطيط المناولة والتسليم في الموقع")],
  18: [tr("Vehicle and machinery suitability", "ملاءمة المركبات والآليات"), tr("Port and sailing options reviewed", "مراجعة خيارات الموانئ ومواعيد الإبحار"), tr("Customs documents and onward transport assessed", "دراسة مستندات الجمارك والنقل اللاحق")],
  19: [tr("Temporary import and re-export reviewed", "مراجعة الإدخال المؤقت وإعادة التصدير"), tr("Supporting documents coordinated", "تنسيق المستندات الداعمة"), tr("Issuance and acceptance confirmed with authorized parties", "تأكيد الإصدار والقبول مع الجهات المخوّلة")],
  20: [tr("High-care handling requirements", "متطلبات المناولة عالية العناية"), tr("Packing, placement and setup scope reviewed", "مراجعة نطاق التغليف والترتيب والإعداد"), tr("Site access and provider availability confirmed", "تأكيد الوصول للموقع وتوفر مقدم الخدمة")],
  21: [tr("Temperature range and monitoring needs", "نطاق الحرارة واحتياجات المراقبة"), tr("Equipment and route capacity reviewed", "مراجعة سعة المعدات والمسار"), tr("Availability confirmed per request", "تأكيد التوفر لكل طلب")],
  22: [tr("Export packing and crating scope", "نطاق التعبئة والتصنيد للتصدير"), tr("Cargo-specific protection needs", "احتياجات حماية البضاعة"), tr("ISPM-15 requirements checked where applicable", "التحقق من متطلبات ISPM-15 عند انطباقها")],
  23: [tr("Urgent document and parcel options", "خيارات المستندات والطرود العاجلة"), tr("Carrier cut-offs and route checked", "التحقق من مواعيد استلام الناقل والمسار"), tr("Delivery timing confirmed with operator", "تأكيد توقيت التسليم مع المشغّل")],
  24: [tr("Origin-to-destination routing", "تخطيط المسار بين بلدين"), tr("Trade and transport documents reviewed", "مراجعة مستندات التجارة والنقل"), tr("Carrier and customs responsibilities assessed", "دراسة مسؤوليات الناقل والجمارك")],
};

const OFFERING_AR: Record<number, LanguageText> = {
  1: tr("Ocean Freight", "الشحن البحري"),
  2: tr("Air Freight", "الشحن الجوي"),
  3: tr("GCC Transportation", "النقل البري الخليجي"),
  4: tr("Customs Clearance", "التخليص الجمركي"),
  5: tr("Warehousing & Distribution", "التخزين والتوزيع"),
  6: tr("Freight Forwarding", "خدمات الشحن"),
  7: tr("Supply Chain Management", "إدارة سلسلة التوريد"),
  8: tr("Project Cargo Logistics", "لوجستيات شحن المشاريع"),
  9: tr("House Moving & Relocation", "نقل الأثاث والانتقال"),
  10: tr("E-commerce Logistics", "لوجستيات التجارة الإلكترونية"),
  11: tr("Exhibition & Event Logistics", "لوجستيات المعارض والفعاليات"),
  12: tr("Medical & Pharma Logistics", "لوجستيات الطب والأدوية"),
  13: tr("Food & FMCG Logistics", "لوجستيات الأغذية والسلع الاستهلاكية"),
  14: tr("Pet & Animal Import", "استيراد الحيوانات الأليفة"),
  15: tr("Breakbulk Shipping", "شحن البضائع غير الحاوية"),
  16: tr("Dangerous Goods", "البضائع الخطرة"),
  17: tr("Oversized / OOG Cargo", "البضائع الضخمة / OOG"),
  18: tr("RoRo Shipping", "الشحن الدحرجي (رورو)"),
  19: tr("ATA Carnet Coordination", "تنسيق كارنيه ATA"),
  20: tr("White Glove Logistics", "لوجستيات القفاز الأبيض"),
  21: tr("Temperature Controlled Logistics", "لوجستيات النقل بدرجة حرارة مضبوطة"),
  22: tr("Packaging & Crating", "التغليف والتصنيد"),
  23: tr("Express Courier", "البريد السريع"),
  24: tr("Cross Trade Shipping", "الشحن التجاري بين الدول"),
};

const DOOR_TO_DOOR: Offering = {
  id: "door-to-door",
  name: tr("Door-to-Door Logistics", "الخدمات اللوجستية من الباب إلى الباب"),
  description: tr(
    "A single enquiry for coordinated collection and delivery. Route, customs responsibilities, operators and service scope are confirmed for each shipment.",
    "استفسار واحد لتنسيق الاستلام والتسليم. يُؤكد المسار ومسؤوليات الجمارك والجهات المشغّلة ونطاق الخدمة لكل شحنة.",
  ),
  highlights: [
    tr("Collection and delivery requirements", "متطلبات الاستلام والتسليم"),
    tr("Route and transport options reviewed", "مراجعة المسار وخيارات النقل"),
    tr("Customs and operator responsibilities confirmed", "تأكيد مسؤوليات الجمارك والمشغّل"),
  ],
  icon: "Truck",
  slug: "freight-forwarding",
  category: "specialized",
};

const CUSTOMS_COPY = tr(
  "Customs clearance is the process of filing documentation and duties so goods can legally enter or leave Saudi Arabia — with support for applicable SABER, SFDA and CST documentation; ATA Carnet eligibility is checked per shipment.",
  "التخليص الجمركي هو تقديم المستندات والرسوم اللازمة لدخول البضائع إلى السعودية أو خروجها منها بصورة نظامية — مع دعم مستندات SABER وSFDA وCST عند انطباقها؛ وتُراجع أهلية كارنيه ATA لكل شحنة.",
);

const CUSTOMS_HIGHLIGHTS = [
  tr("Customs clearance often within 24 hours", "غالباً ما يتم التخليص الجمركي خلال 24 ساعة"),
  tr("SABER, SFDA & ATA Carnet", "دعم SABER وSFDA وكارنيه ATA"),
  tr("Saudi Customs broker", "وسيط جمركي سعودي"),
];

const ICONS: Record<string, ElementType> = {
  Ship, Plane, Truck, Warehouse, PackageCheck, FileCheck2, Waypoints,
  ShieldCheck, Globe2, Zap,
};

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? PackageCheck;
  return <Icon className={className} aria-hidden="true" />;
}

function CountStat({ metric, value, suffix = "", label, icon: Icon, reducedMotion }: {
  metric: string; value: number; suffix?: string; label: string; icon: ElementType; reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.35 });
  // Keep the final value in prerendered HTML; animate only after hydration and
  // when the statistic enters view.
  const [count, setCount] = useState(value);

  useEffect(() => {
    if (reducedMotion) {
      setCount(value);
      return;
    }
    if (!isInView) {
      setCount(value);
      return;
    }
    const started = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 650, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isInView, reducedMotion, value]);

  return (
    <div ref={ref} className="flex items-center gap-3 border-s border-white/10 px-4 first:border-0 first:ps-0 last:pe-0" data-testid={`stat-${metric}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-secondary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <div className="font-mono text-xl font-semibold tabular-nums text-[#f5f3ee]" dir="ltr" aria-hidden="true">{count}{suffix}</div>
        <span className="sr-only" data-testid={`text-stat-${metric}`}>{value}{suffix} {label}</span>
        <div className="text-[11px] leading-snug text-white/55" aria-hidden="true">{label}</div>
      </div>
    </div>
  );
}

function ServiceCard({ offering, index, isRtl, compact = false, wide = false }: {
  offering: Offering; index: number; isRtl: boolean; compact?: boolean; wide?: boolean;
}) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const name = isRtl ? offering.name.ar : offering.name.en;
  const description = isRtl ? offering.description.ar : offering.description.en;
  const href = `/services/${offering.slug}`;
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={false}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.38, delay: Math.min(index % 4, 3) * 0.035 }}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[#091523] shadow-[0_16px_40px_rgba(0,0,0,.18)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/25 focus-within:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#091523] ${wide ? "min-h-[285px] p-6 sm:col-span-2 sm:p-8 lg:col-span-3" : compact ? "min-h-[255px] p-5 md:p-6" : "min-h-[255px] p-5 md:p-6"}`}
      data-testid={`card-service-${offering.id}`}
      role="group"
      tabIndex={0}
      aria-label={t(`Service card for ${name}; press Enter to open details`, `بطاقة خدمة ${name}؛ اضغط Enter لعرض التفاصيل`)}
      onClick={(event) => navigateFromServiceCardClick(event, navigate, href)}
      onKeyDown={(event) => navigateFromServiceCardKey(event, navigate, href)}
    >
      {offering.image && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <img {...getIntrinsicImageDimensions(offering.image)} src={offering.image} alt="" loading="lazy" decoding="async" className="h-full w-full scale-100 object-cover opacity-65 transition duration-700 group-hover:scale-[1.045] group-hover:opacity-80" />
          <div className={`absolute inset-0 ${wide ? "bg-gradient-to-r from-[#03070e]/95 via-[#06101b]/70 to-[#06101b]/15" : "bg-gradient-to-t from-[#03070e] via-[#06101b]/76 to-[#06101b]/18"}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06101b]/30 via-transparent to-transparent" />
        </div>
      )}
      <div className={`relative flex items-start justify-between gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/15 bg-[#0a1725]/65 text-secondary shadow-lg backdrop-blur-sm">
          <ServiceIcon name={offering.icon} className="h-[18px] w-[18px]" />
        </div>
        <span className="rounded-full border border-white/15 bg-[#07111d]/55 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-white/70 backdrop-blur-sm">
          {offering.numberLabel ?? String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className={`relative mt-auto pt-8 ${isRtl ? "text-right" : ""}`}>
        <h3 className="text-[17px] font-semibold leading-snug text-[#fff] drop-shadow-sm">{name}</h3>
        <p className="mt-2 line-clamp-3 text-[12px] leading-[1.7] text-white/75">{description}</p>
      </div>
      {!!offering.highlights?.length && (
        <ul className={`relative mt-3 space-y-1.5 text-[11px] leading-snug text-white/70 ${isRtl ? "text-right" : ""}`} aria-label={t("Service details", "تفاصيل الخدمة")}>
          {offering.highlights.map((highlight, highlightIndex) => (
            <li key={highlightIndex} className={`flex items-start gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
              <span>{isRtl ? highlight.ar : highlight.en}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={`relative mt-4 flex flex-wrap items-center justify-between gap-x-4 border-t border-white/20 pt-3 ${isRtl ? "text-right" : ""}`}>
        <Link href={href} className={`inline-flex min-h-9 items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-secondary transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-[#091523] ${isRtl ? "flex-row-reverse" : ""}`} data-testid={`link-service-${offering.id}`}>
          {t("View Details", "عرض التفاصيل")}
          <ArrowUpRight className={`h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isRtl ? "-rotate-90" : ""}`} />
        </Link>
        {offering.id === "door-to-door" && (
          <Link
            href="/contact?service=freight-forwarding&topic=door-to-door"
            className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-white/75 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-[#091523]"
            data-testid="link-door-to-door-enquiry"
          >
            {t("Request a Door-to-Door Quote", "اطلب عرض سعر للشحن من الباب إلى الباب")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export default function Services() {
  const { t, isRtl } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const reducedMotion = useReducedMotion();

  const offers = useMemo(() => {
    const catalog = new Map(SERVICE_CATALOG.map((service) => [service.id, service]));
    const orderedServiceIds = [...SERVICE_DIRECTORY_ORDER.filter((id) => id !== 22), 22];
    return orderedServiceIds.map((id): Offering | null => {
      if (id === "door-to-door") return { ...DOOR_TO_DOOR, image: DOOR_TO_DOOR_IMAGE };
      const service = catalog.get(id);
      if (!service) return null;
      const meta = SERVICE_META[id];
      const names = OFFERING_AR[id];
      const notes = SERVICE_NOTES[id];
      return {
        id,
        name: tr(service.name, names?.ar ?? service.nameAr),
        description: notes ?? tr(service.description, service.descriptionAr),
        highlights: SERVICE_HIGHLIGHTS[id] ?? [],
        numberLabel: id === 22 ? "03" : undefined,
        icon: service.icon,
        slug: meta?.slug ?? "",
        category: service.category === "core" ? "core" : "specialized",
        image: SERVICE_IMAGES[id],
      };
    }).filter((item): item is Offering => item !== null && item.slug.length > 0);
  }, []);

  const exhibition = offers.find((item) => item.id === 11)!;
  const coreCount = offers.filter((item) => item.category === "core").length;
  const specializedCount = offers.filter((item) => item.category === "specialized").length;
  const tabOffers = offers.filter((item) => {
    if (item.id === 11 || item.id === 4) return false;
    return activeTab === "all" || item.category === activeTab;
  });
  const directoryOffers = activeTab === "all"
    ? offers.filter((item) => item.id !== 11 && item.id !== 4)
    : tabOffers;

  const tabs: { id: Tab; label: LanguageText; count: number }[] = [
    { id: "all", label: tr("All offerings", "جميع الخدمات"), count: offers.length },
    { id: "core", label: tr("Core", "الأساسية"), count: coreCount },
    { id: "specialized", label: tr("Specialized", "المتخصصة"), count: specializedCount },
  ];

  const exhibitionHighlights = [
    tr("ATA Carnet — 24hr processing", "كارنيه ATA — معالجة خلال 24 ساعة"),
    tr("On-site logistics team", "فريق لوجستي في الموقع"),
    tr("Temporary import & re-export", "الاستيراد المؤقت وإعادة التصدير"),
  ];
  const exhibitionStats = [
    { value: "25+", label: tr("Years Supporting Exhibitions", "أكثر من 25 عاماً في دعم المعارض") },
    { value: "500+", label: tr("Events Coordinated", "أكثر من 500 فعالية منسقة") },
    { value: "24hr", label: tr("ATA Carnet Processing", "إجراءات كارنيه ATA خلال 24 ساعة") },
    { value: "GCC", label: tr("Wide Event Coverage", "تغطية فعاليات على نطاق دول الخليج") },
  ];

  const showExhibition = activeTab !== "core";
  const showCustoms = activeTab !== "specialized";
  const contactHref = "/contact";

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#07111d] text-[#f5f3ee]" dir={isRtl ? "rtl" : "ltr"}>
      <section className="relative border-b border-white/[0.09] bg-[#081523]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-40 h-[460px] w-[560px] rounded-full bg-[#18304a]/45 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
          <div className="absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.45) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 pb-9 pt-40 text-center sm:px-8 sm:pb-11 sm:pt-36 lg:px-10 lg:pt-28">
          <div className="mx-auto max-w-[900px]">
              <p className="mb-4 flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[0.19em] text-secondary">
                <span className="h-px w-8 bg-secondary" />
                {t(`${offers.length} LOGISTICS OFFERINGS`, `${offers.length} خياراً للخدمات اللوجستية`)}
                <span className="h-px w-8 bg-secondary" />
              </p>
              <h1 className="mx-auto max-w-[900px] text-[clamp(2.45rem,6vw,4.85rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#f4f2ed]">
                {t("Comprehensive ", "حلول ")}<span className="text-secondary">{t("Logistics", "لوجستية")}</span>{t(" Solutions", " متكاملة")}
              </h1>
              <p className="mx-auto mt-5 max-w-[790px] text-sm leading-[1.9] text-[#bac5d0] sm:text-[15px]">
                {t(
                  "From exhibition and ATA Carnet coordination to customs clearance, international freight, project cargo, specialist transportation and GCC distribution, ENVOD KINGDOM helps businesses coordinate complex shipments across Saudi Arabia and international markets.",
                  "من تنسيق المعارض وكارنيه ATA إلى التخليص الجمركي والشحن الدولي وبضائع المشاريع والنقل المتخصص والتوزيع الخليجي، تساعد إنفود كينجدوم الشركات على تنسيق الشحنات المعقدة في المملكة العربية السعودية والأسواق الدولية.",
                )}
              </p>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-white/60">
                <MapPin className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                {t("Saudi Arabia · GCC · International Freight", "السعودية · دول مجلس التعاون · الشحن الدولي")}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href="#services-directory" className="inline-flex min-h-11 items-center justify-center gap-2 bg-secondary px-5 text-xs font-semibold text-white transition-[background-color,filter,box-shadow] duration-300 ease-out hover:bg-secondary hover:brightness-110 hover:shadow-[0_0_18px_rgba(220,40,40,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523]" data-testid="link-explore-services">
                  {t("Explore Our Services", "استكشف خدماتنا")}
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <Link href={contactHref} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-5 text-xs font-semibold text-white transition-colors hover:border-white/45 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523]" data-testid="link-request-quote-hero">
                  {t("Request a Quote", "اطلب عرض سعر")}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link href="/contact" className="inline-flex min-h-11 items-center justify-center px-3 text-xs font-medium text-white/65 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523]" data-testid="link-contact-team-hero">
                  {t("Contact Our Team", "تواصل مع فريقنا")}
                </Link>
              </div>
          </div>
        </div>
      </section>

      <section aria-label={t("Service commitments", "مؤشرات الخدمة")} className="border-b border-white/[0.08] bg-[#0a1725]">
        <div className={`mx-auto flex max-w-[1240px] flex-wrap justify-between gap-y-5 px-5 py-5 sm:px-8 lg:px-10 ${isRtl ? "flex-row-reverse" : ""}`}>
          <CountStat metric="fleet" value={50} suffix="+" label={t("Fleet vehicles", "مركبة ضمن الأسطول")} icon={Truck} reducedMotion={!!reducedMotion} />
          <CountStat metric="tracking" value={100} suffix="%" label={t("Shipment tracking coordination", "تنسيق تتبع الشحنات")} icon={Waypoints} reducedMotion={!!reducedMotion} />
          <CountStat metric="support" value={24} suffix="/7" label={t("Customer support", "دعم العملاء")} icon={Clock3} reducedMotion={!!reducedMotion} />
          <CountStat metric="on-time" value={98} suffix="%" label={t("On-time delivery", "التسليم في الموعد")} icon={Check} reducedMotion={!!reducedMotion} />
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {showExhibition && (
          <section className="pb-9 pt-12 sm:pb-12 sm:pt-16" aria-labelledby="exhibition-heading">
            <div className={`mb-5 flex items-end justify-between gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-secondary">{t("ENVOD SPECIALTY", "من تخصصات إنفود")}</p>
                <h2 id="exhibition-heading" className="text-2xl font-semibold tracking-tight text-[#f2f0eb] sm:text-[30px]">{t("ENVOD Specialist", "متخصصو إنفود")}</h2>
              </div>
              <span className="hidden text-xs text-white/60 sm:block">{t("Freight, documents & venue coordination", "تنسيق الشحن والمستندات والموقع")}</span>
            </div>
            <div
              className="relative isolate grid min-h-[390px] cursor-pointer overflow-hidden rounded-2xl border border-white/25 bg-[#14283b] shadow-[0_24px_70px_rgba(0,0,0,.2)] transition-[border-color,transform,scale,box-shadow] duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/40 hover:shadow-[0_32px_88px_rgba(0,0,0,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523] lg:grid-cols-[1.1fr_.9fr]"
              role="group"
              tabIndex={0}
              aria-label={t("Exhibition & Event Logistics card; press Enter to open details", "بطاقة لوجستيات المعارض والفعاليات؛ اضغط Enter لعرض التفاصيل")}
              onClick={(event) => navigateFromServiceCardClick(event, navigate, `/services/${SERVICE_META[11]?.slug}`)}
              onKeyDown={(event) => navigateFromServiceCardKey(event, navigate, `/services/${SERVICE_META[11]?.slug}`)}
            >
              <img {...getIntrinsicImageDimensions(SERVICE_IMAGES[11])} src={SERVICE_IMAGES[11]} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-90" aria-hidden="true" />
              <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-l from-[#07111d]/58 via-[#07111d]/34 to-[#07111d]/12" : "bg-gradient-to-r from-[#07111d]/58 via-[#07111d]/34 to-[#07111d]/12"}`} aria-hidden="true" />
              <div className={`relative flex flex-col justify-center p-6 sm:p-9 lg:p-10 ${isRtl ? "text-right" : ""}`}>
                <div className={`mb-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-secondary ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("EXHIBITION FREIGHT · ATA CARNET COORDINATION", "شحن المعارض · تنسيق كارنيه ATA")}
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{t("Exhibition & Event Logistics", "لوجستيات المعارض والفعاليات")}</h3>
                <p className="mt-3 max-w-[620px] text-[14px] leading-[1.8] text-white/95">{isRtl ? exhibition.description.ar : exhibition.description.en}</p>
                <ul className={`mt-5 flex flex-wrap gap-2 ${isRtl ? "flex-row-reverse" : ""}`} aria-label={t("Exhibition service highlights", "مزايا خدمات المعارض")}>
                  {exhibitionHighlights.map((highlight, index) => (
                    <li key={index} className="border border-white/25 bg-[#07111d]/35 px-3 py-2 text-[11px] leading-snug text-white/95">{isRtl ? highlight.ar : highlight.en}</li>
                  ))}
                </ul>
                <div className={`mt-6 flex flex-wrap gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Link href={`/services/${SERVICE_META[11]?.slug}`} className="inline-flex min-h-10 items-center gap-2 bg-secondary px-4 text-xs font-semibold text-white transition-[background-color,filter,box-shadow] duration-300 ease-out hover:bg-secondary hover:brightness-110 hover:shadow-[0_0_18px_rgba(220,40,40,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1725]" data-testid="link-exhibition-details">
                    {t("View Service", "عرض الخدمة")}
                    <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Link>
                  <Link href="/contact?service=exhibition-logistics" className="inline-flex min-h-10 items-center text-xs font-semibold text-white/65 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" data-testid="link-exhibition-enquiry">
                    {t("Plan an exhibition shipment", "خطط لشحنة معرض")}
                  </Link>
                </div>
              </div>
              <div className={`relative flex flex-col justify-center border-t border-white/20 bg-[#102236]/45 p-6 backdrop-blur-[1px] sm:p-9 lg:border-s lg:border-t-0 lg:p-10 ${isRtl ? "text-right" : ""}`}>
                <p className="mb-5 text-[10px] font-semibold tracking-[0.16em] text-white/80">{t("EXHIBITION EXPERIENCE", "خبرة المعارض")}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {exhibitionStats.map((stat) => (
                    <div key={stat.value} className="border-t border-white/20 pt-3">
                  <p dir="ltr" className={`font-mono text-2xl font-semibold tracking-tight text-secondary sm:text-3xl ${isRtl ? "text-right" : "text-left"}`}>{stat.value}</p>
                      <p className="mt-1 text-[11px] leading-snug text-white/90">{isRtl ? stat.label.ar : stat.label.en}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[11px] leading-relaxed text-white/75">
                  {t("ATA Carnet eligibility is shipment-specific; issuance and acceptance depend on the authorized body and relevant authorities.", "تعتمد أهلية كارنيه ATA على الشحنة؛ ويخضع الإصدار والقبول للجهة المخوّلة والسلطات المعنية.")}
                </p>
              </div>
            </div>
          </section>
        )}

        <section id="services-directory" className="scroll-mt-20 pb-14 pt-5 sm:pb-20 sm:pt-8" aria-labelledby="directory-heading">
          <div className={`mb-6 flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between ${isRtl ? "md:flex-row-reverse" : ""}`}>
            <div className={isRtl ? "text-right" : ""}>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-secondary">{t("ALL SERVICES", "جميع الخدمات")}</p>
              <h2 id="directory-heading" className="text-2xl font-semibold tracking-tight text-[#f2f0eb] sm:text-[32px]">{t("Logistics Services", "الخدمات اللوجستية")}</h2>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/50">{t("Explore services from customs documentation coordination and international freight to specialist cargo and temperature-controlled transportation. Route and availability are confirmed per enquiry.", "استكشف خدمات تنسيق مستندات الجمارك والشحن الدولي والبضائع المتخصصة والنقل بدرجة حرارة مضبوطة. يُؤكد المسار والتوفر لكل استفسار.")}</p>
            </div>
            <div className={`flex flex-wrap gap-2 ${isRtl ? "md:flex-row-reverse" : ""}`} role="group" aria-label={t("Filter services", "تصفية الخدمات")}>
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-10 items-center gap-2 border px-3.5 text-xs font-semibold transition-[color,background-color,border-color,filter,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111d] ${activeTab === tab.id ? "border-secondary bg-secondary text-white hover:brightness-110 hover:shadow-[0_0_16px_rgba(220,40,40,.28)]" : "border-white/15 bg-white/[0.025] text-white/60 hover:border-white/30 hover:text-white"}`}
                  data-testid={`button-filter-${tab.id}`}
                >
                  {isRtl ? tab.label.ar : tab.label.en}
                  <span className={`font-mono text-[10px] ${activeTab === tab.id ? "text-white/75" : "text-white/35"}`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {showCustoms && (
            <article
              className={`relative isolate mb-5 grid cursor-pointer overflow-hidden rounded-xl border border-white/25 bg-[#14283b] shadow-[0_18px_50px_rgba(0,0,0,.16)] transition-[border-color,transform,scale,box-shadow] duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/40 hover:shadow-[0_28px_72px_rgba(0,0,0,.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523] lg:grid-cols-[1fr_310px] ${isRtl ? "text-right" : ""}`}
              data-testid="card-customs-priority"
              role="group"
              tabIndex={0}
              aria-label={t("Customs Clearance card; press Enter to open details", "بطاقة التخليص الجمركي؛ اضغط Enter لعرض التفاصيل")}
              onClick={(event) => navigateFromServiceCardClick(event, navigate, `/services/${SERVICE_META[4]?.slug}`)}
              onKeyDown={(event) => navigateFromServiceCardKey(event, navigate, `/services/${SERVICE_META[4]?.slug}`)}
            >
              <img {...getIntrinsicImageDimensions(SERVICE_IMAGES[4])} src={SERVICE_IMAGES[4]} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-95" aria-hidden="true" />
              <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-l from-[#07111d]/52 via-[#07111d]/30 to-[#07111d]/12" : "bg-gradient-to-r from-[#07111d]/52 via-[#07111d]/30 to-[#07111d]/12"}`} aria-hidden="true" />
              <div className="relative p-6 sm:p-8">
                <div className={`mb-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-secondary ${isRtl ? "flex-row-reverse" : ""}`}>
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                  {t("FAST CLEARANCE", "تخليص سريع")}
                </div>
                <h3 className="max-w-[700px] text-xl font-semibold leading-snug text-[#f4f1eb] sm:text-[25px]">
                  {t("Customs Clearance", "التخليص الجمركي")}
                </h3>
                <p className="mt-3 max-w-[720px] text-sm leading-[1.8] text-white/90">{isRtl ? CUSTOMS_COPY.ar : CUSTOMS_COPY.en}</p>
              </div>
              <div className={`relative flex flex-col justify-between border-t border-white/20 bg-[#102236]/30 p-5 backdrop-blur-[1px] lg:border-s lg:border-t-0 lg:p-6 ${isRtl ? "text-right" : ""}`}>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-white/80">{t("CLEARANCE SUPPORT", "دعم التخليص")}</p>
                  <ul className="mt-4 space-y-2 text-[11px] leading-relaxed text-white/90" aria-label={t("Customs service details", "تفاصيل خدمة الجمارك")}>
                    {CUSTOMS_HIGHLIGHTS.map((highlight, index) => (
                      <li key={index} className={`flex items-start gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                        <span>{isRtl ? highlight.ar : highlight.en}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[10px] leading-relaxed text-white/75">{t("Timing depends on shipment documents, inspections and authority decisions.", "يعتمد التوقيت على مستندات الشحنة والفحوصات وقرارات الجهات المختصة.")}</p>
                </div>
                <div className={`mt-6 flex flex-wrap items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Link href={`/services/${SERVICE_META[4]?.slug}`} className="inline-flex min-h-11 items-center gap-2 bg-secondary px-4 text-xs font-semibold text-white transition-[background-color,filter,box-shadow] duration-300 ease-out hover:bg-secondary hover:brightness-110 hover:shadow-[0_0_18px_rgba(220,40,40,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#101f2d]" data-testid="link-customs-details">
                    {t("View Details", "عرض التفاصيل")}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <Link href="/contact?service=customs-clearance" className="text-xs font-medium text-white/80 underline decoration-white/40 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" data-testid="link-customs-enquiry">
                    {t("Inquire", "استفسر")}
                  </Link>
                </div>
              </div>
            </article>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              id="services-results"
              key={activeTab}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              aria-live="polite"
            >
              {directoryOffers.map((offering) => (
                <ServiceCard
                  key={offering.id}
                  offering={offering}
                  index={offers.indexOf(offering)}
                  isRtl={isRtl}
                  compact={offering.id === "door-to-door"}
                  wide={offering.id === 4 || offering.id === 9 || offering.id === 11}
                />
              ))}
            </motion.div>
          </AnimatePresence>
          <div className={`mt-4 flex items-center gap-2 text-[11px] text-white/40 ${isRtl ? "flex-row-reverse" : ""}`}>
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
            {t(
              `${offers.length} displayed offerings · ${coreCount} core · ${specializedCount} specialized`,
              `${offers.length} خدمة معروضة · ${coreCount} أساسية · ${specializedCount} متخصصة`,
            )}
          </div>
        </section>
      </div>

      <section className="border-y border-white/[0.09] bg-[#091724]" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className={`mb-7 max-w-2xl ${isRtl ? "mr-auto text-right" : ""}`}>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-secondary">{t("BEFORE YOU ENQUIRE", "قبل إرسال استفسارك")}</p>
            <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight sm:text-[32px]">{t("Planning a shipment?", "هل تخطط لشحنة؟")}</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/50">{t("A few useful details can help us review the right scope.", "تساعد بعض التفاصيل في مراجعة نطاق الخدمة المناسب.")}</p>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {SERVICE_FAQS.map((faq, index) => (
              <details key={index} className="group border border-white/10 bg-[#0b1a28] open:border-white/20" data-testid={`faq-item-${index + 1}`}>
                <summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium text-white/85 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                  <span>{isRtl ? faq.q.ar : faq.q.en}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-secondary transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <p className={`px-4 pb-4 text-[13px] leading-[1.85] text-white/58 ${isRtl ? "text-right" : ""}`}>{isRtl ? faq.a.ar : faq.a.en}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#081523]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(220,40,40,.14),transparent_57%)]" aria-hidden="true" />
        <div className={`relative mx-auto flex max-w-[1240px] flex-col gap-7 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between md:py-14 lg:px-10 ${isRtl ? "md:flex-row-reverse" : ""}`}>
          <div className={`max-w-xl ${isRtl ? "text-right" : ""}`}>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-secondary">{t("START WITH THE SHIPMENT", "ابدأ بتفاصيل الشحنة")}</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[30px]">{t("Let’s plan the next move.", "لنتفق على الخطوة التالية.")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{t("Tell our Riyadh team what you are moving, where it is going and when it needs to move.", "أخبر فريقنا في الرياض بما ستشحنه ووجهته والموعد المطلوب.")}</p>
          </div>
          <div className={`flex flex-wrap gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link href="/contact" className="inline-flex min-h-12 items-center gap-2 bg-secondary px-5 text-xs font-semibold text-white transition-[background-color,filter,box-shadow] duration-300 ease-out hover:bg-secondary hover:brightness-110 hover:shadow-[0_0_18px_rgba(220,40,40,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523]" data-testid="link-request-quote-bottom">
              {t("Request a Quote", "اطلب عرض سعر")}
              <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true" />
            </Link>
            <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-white/20 px-5 text-xs font-semibold text-white/80 transition-colors hover:border-white/40 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#081523]" data-testid="link-whatsapp-bottom">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("WhatsApp Our Team", "تواصل معنا عبر واتساب")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

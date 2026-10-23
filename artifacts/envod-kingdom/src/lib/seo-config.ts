import type { SeoConfig } from "./seo";
import { SERVICE_CATALOG, SERVICE_META, SLUG_TO_ID, ID_TO_SLUG } from "./service-data";
import { SERVICE_FAQS } from "./services-faq";
import { INDUSTRY_META, INDUSTRY_BY_SLUG } from "./industry-data";
import { VISION_SEO, VISION_FAQ } from "./vision-data";
import { GALLERY_ITEMS } from "./gallery-content";

/** Canonical production origin. Single source of truth for absolute URLs. */
export const SITE_URL = "https://www.envodkingdom.net";
export const OG_IMAGE = `${SITE_URL}/opengraph.jpg`;
const ORG_ID = `${SITE_URL}/#organization`;

export function toAbsolute(pathOrUrl?: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function normalizeRoutePath(path: string): string {
  let out = (path || "/").split("?")[0].split("#")[0];
  if (!out.startsWith("/")) out = `/${out}`;
  if (out.length > 1) out = out.replace(/\/+$/, "");
  return out || "/";
}

function breadcrumb(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: toAbsolute(it.path),
    })),
  };
}

function galleryStructuredData(language: "en" | "ar"): Array<Record<string, unknown>> {
  const path = language === "ar" ? "/ar/gallery" : "/gallery";
  const pageUrl = toAbsolute(path);
  const galleryName =
    language === "ar" ? "معرض عمليات إنفود كينغدوم" : "ENVOD KINGDOM Operations Gallery";
  const pageDescription =
    language === "ar"
      ? "مجموعة من الصور التي قدمتها إنفود كينغدوم لنقل الشحنات ومناولة المستودعات وشحنات المشاريع ومعدات المعارض."
      : "A selection of ENVOD-provided photographs showing freight transport, warehouse handling, project cargo, and exhibition equipment.";
  const objects: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: galleryName,
      url: pageUrl,
      description: pageDescription,
      inLanguage: language,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  ];

  if (GALLERY_ITEMS.length > 0) {
    objects.push({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: galleryName,
      url: pageUrl,
      inLanguage: language,
      associatedMedia: GALLERY_ITEMS.filter((item) => item.isPublished).map((item) => {
        const objectKey = item.objectKey
          .split("/")
          .filter(Boolean)
          .map(encodeURIComponent)
          .join("/");
        const width = item.widths.length ? Math.max(...item.widths) : item.width;
        const name = language === "ar" ? item.titleAr || item.title : item.title;
        const description =
          language === "ar"
            ? item.descriptionAr || item.altTextAr || name
            : item.description || item.altText || name;
        return {
          "@type": "ImageObject",
          contentUrl: toAbsolute(`/gallery/${objectKey}/${width}.webp`),
          name,
          description,
          width: item.width,
          height: item.height,
        };
      }),
    });
  }

  objects.push(
    breadcrumb([
      { name: language === "ar" ? "الرئيسية" : "Home", path: language === "ar" ? "/ar" : "/" },
      { name: language === "ar" ? "معرض الصور" : "Gallery", path },
    ]),
  );
  return objects;
}

/** ItemList of every service, each linking to its detail page. */
function servicesItemList(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ENVOD KINGDOM Logistics Services",
    itemListElement: SERVICE_CATALOG.map((s, i) => ({
      "@type": "Service",
      position: i + 1,
      name: s.name,
      description: s.description,
      serviceType: s.category,
      areaServed: "Saudi Arabia",
      provider: { "@id": ORG_ID },
      url: toAbsolute(`/services/${ID_TO_SLUG[s.id]}`),
    })),
  };
}

/**
 * The organisation's OfferCatalog of every service. Emitted as an Organization
 * node carrying `hasOfferCatalog` and keyed with the shared ORG_ID, so JSON-LD
 * @id graph-merging attaches the catalog to the static Organization node in
 * index.html (the canonical Organization → OfferCatalog linkage) rather than
 * leaving an orphan node. Built from SERVICE_CATALOG so it stays in lockstep
 * with the live service list (no hand-maintained duplication).
 */
function offerCatalog(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "ENVOD KINGDOM Logistics & Freight Services",
      itemListElement: SERVICE_CATALOG.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.description,
          serviceType: s.category,
          areaServed: "Saudi Arabia",
          provider: { "@id": ORG_ID },
          url: toAbsolute(`/services/${ID_TO_SLUG[s.id]}`),
        },
      })),
    },
  };
}

function servicesFaqPage(language: "en" | "ar"): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SERVICE_FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q[language],
      acceptedAnswer: {
        "@type": "Answer",
        text: a[language],
      },
    })),
  };
}

/** English content routes; Arabic counterparts are generated below. */
export const ENGLISH_CONTENT_ROUTES: string[] = [
  "/",
  "/services",
  "/about",
  "/gallery",
  "/contact",
  "/industries",
  "/vision-2030",
  "/track",
  ...SERVICE_CATALOG.map((s) => `/services/${ID_TO_SLUG[s.id]}`).filter(
    (p) => !p.endsWith("/undefined"),
  ),
  ...INDUSTRY_META.map((i) => `/industries/${i.slug}`),
];

function arabicRoute(path: string): string {
  return path === "/" ? "/ar" : `/ar${path}`;
}

/** Every English and Arabic URL emitted as a prerendered HTML page. */
export const CONTENT_ROUTES: string[] = [
  ...ENGLISH_CONTENT_ROUTES,
  ...ENGLISH_CONTENT_ROUTES.map(arabicRoute),
];

const STATIC: Record<string, SeoConfig> = {
  "/": {
    title:
      "ENVOD KINGDOM | Logistics & Shipping in Saudi Arabia",
    description:
      "Saudi Arabia-based shipping coordination for exhibition cargo, customs clearance, ATA Carnet enquiries and international freight. Ask about shipment scope.",
    canonicalPath: "/",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "ENVOD KINGDOM Shipping Services LLC",
        url: SITE_URL,
        description:
          "Saudi Arabia-based shipping coordination for exhibition cargo, customs clearance, ATA Carnet enquiries and international freight. Ask about shipment scope.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      servicesItemList(),
      offerCatalog(),
      breadcrumb([{ name: "Home", path: "/" }]),
    ],
  },
  "/services": {
    title: "Logistics & Freight Services in Saudi Arabia | ENVOD KINGDOM",
    description:
      "Explore exhibition logistics, customs documents, ATA Carnet, air and ocean freight, GCC transport and specialist cargo. Confirm scope per shipment.",
    canonicalPath: "/services",
    image: OG_IMAGE,
    jsonLd: [
      servicesItemList(),
      offerCatalog(),
      servicesFaqPage("en"),
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ]),
    ],
  },
  "/about": {
    title: "About ENVOD KINGDOM | Saudi Shipping & Logistics Company",
    description:
      "Meet ENVOD KINGDOM Shipping Services LLC, a Riyadh-based company coordinating freight, customs-document enquiries, exhibition logistics and project cargo.",
    canonicalPath: "/about",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About ENVOD KINGDOM SHIPPING SERVICES LLC",
        url: toAbsolute("/about"),
        about: { "@id": ORG_ID },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    ],
  },
  "/gallery": {
    title: "Operations Gallery — ENVOD KINGDOM Shipping Services LLC",
    description:
      "ENVOD-provided photos of freight transport, warehouse handling, project cargo, and exhibition equipment. Captions describe visible details without unverified customer, location, or project claims.",
    canonicalPath: "/gallery",
    image: OG_IMAGE,
    jsonLd: galleryStructuredData("en"),
  },
  "/contact": {
    title: "Contact ENVOD KINGDOM — Request a Freight & Logistics Quote",
    description:
      "Contact ENVOD KINGDOM in Riyadh about customs clearance, freight forwarding, exhibition logistics, or shipping across Saudi Arabia and the GCC.",
    canonicalPath: "/contact",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact ENVOD KINGDOM",
        url: toAbsolute("/contact"),
        about: { "@id": ORG_ID },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ],
  },
  "/industries": {
    title: "Logistics by Industry in Saudi Arabia | ENVOD KINGDOM",
    description:
      "Explore logistics services for automotive, construction, retail, aerospace, hospitality, and other industries in Saudi Arabia.",
    canonicalPath: "/industries",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Industries Served by ENVOD KINGDOM",
        itemListElement: INDUSTRY_META.map((ind, i) => ({
          "@type": "Service",
          position: i + 1,
          name: ind.nameEn,
          description: ind.shortEn,
          serviceType: ind.nameEn,
          areaServed: "Saudi Arabia",
          provider: { "@id": ORG_ID },
          url: toAbsolute(`/industries/${ind.slug}`),
        })),
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Industries", path: "/industries" },
      ]),
    ],
  },
  "/vision-2030": {
    title: VISION_SEO.title,
    description: VISION_SEO.description,
    canonicalPath: "/vision-2030",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Vision 2030 Logistics Support — ENVOD KINGDOM",
        url: toAbsolute("/vision-2030"),
        description: VISION_SEO.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: VISION_FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Vision 2030", path: "/vision-2030" },
      ]),
    ],
  },
  "/track": {
    title: "Shipment Status Assistance | ENVOD KINGDOM",
    description:
      "Need an update on an ENVOD KINGDOM shipment? Contact our team with your booking or shipment reference. This page does not provide live online tracking.",
    canonicalPath: "/track",
    image: OG_IMAGE,
    jsonLd: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Shipment Status Assistance", path: "/track" },
      ]),
    ],
  },
};

const STATIC_AR: Record<string, { title: string; description: string }> = {
  "/": {
    title: "إنفود كينغدوم | خدمات الشحن واللوجستيات في السعودية",
    description:
      "تنسيق الشحن من المملكة العربية السعودية لبضائع المعارض والتخليص الجمركي واستفسارات دفتر ATA والشحن الدولي. تواصل لتحديد نطاق الشحنة.",
  },
  "/services": {
    title: "خدمات الشحن واللوجستيات في السعودية | إنفود كينغدوم",
    description:
      "استكشف لوجستيات المعارض ودعم المستندات الجمركية وتنسيق دفتر ATA والشحن الجوي والبحري والنقل الخليجي والبضائع المتخصصة. يُؤكد نطاق كل شحنة.",
  },
  "/about": {
    title: "عن إنفود كينغدوم | الشحن والخدمات اللوجستية في السعودية",
    description:
      "تعرّف على شركة إنفود كينغدوم لخدمات الشحن ذ.م.م في الرياض: تنسيق الشحن الجوي والبحري والبري والتخليص الجمركي ولوجستيات المعارض وبضائع المشاريع في السعودية.",
  },
  "/gallery": {
    title: "معرض الصور والعمليات | إنفود كينغدوم",
    description:
      "صور قدمتها إنفود كينغدوم لنقل الشحنات ومناولة المستودعات وشحنات المشاريع ومعدات المعارض، مع تعليقات تقتصر على التفاصيل الظاهرة دون ادعاءات غير مؤكدة.",
  },
  "/contact": {
    title: "تواصل مع إنفود كينغدوم | اطلب عرض سعر للشحن",
    description:
      "تواصل مع إنفود كينغدوم في الرياض للاستفسار عن التخليص الجمركي والشحن والخدمات اللوجستية في السعودية والخليج.",
  },
  "/industries": {
    title: "الخدمات اللوجستية للقطاعات | إنفود كينغدوم",
    description:
      "حلول نقل وشحن مخصصة لقطاعات السيارات والبناء والتجزئة والأزياء والإلكترونيات والصناعات الأخرى في السعودية.",
  },
  "/vision-2030": {
    title: "الخدمات اللوجستية ورؤية السعودية 2030 | إنفود كينغدوم",
    description:
      "استكشف دور النقل وسلاسل الإمداد في دعم القطاعات والمشاريع المرتبطة برؤية السعودية 2030.",
  },
  "/track": {
    title: "المساعدة في تحديث حالة الشحنة | إنفود كينغدوم",
    description:
      "للاستفسار عن شحنة لدى إنفود كينغدوم، تواصل مع فريقنا واذكر رقم الحجز أو مرجع الشحنة. لا توفر هذه الصفحة تتبعاً مباشراً.",
  },
};

type SeoLanguage = "en" | "ar";

function localizedPath(path: string, language: SeoLanguage): string {
  if (language === "en") return path;
  return path === "/" ? "/ar" : `/ar${path}`;
}

function withHreflang(
  seo: SeoConfig,
  path: string,
  language: SeoLanguage,
): SeoConfig {
  const englishPath = path;
  const arabicPath = localizedPath(path, "ar");
  return {
    ...seo,
    canonicalPath: localizedPath(path, language),
    locale: language === "ar" ? "ar_SA" : "en_SA",
    alternateLocale: language === "ar" ? "en_SA" : "ar_SA",
    alternates: [
      { hreflang: "en-SA", href: toAbsolute(englishPath) },
      { hreflang: "ar-SA", href: toAbsolute(arabicPath) },
      { hreflang: "x-default", href: toAbsolute(englishPath) },
    ],
  };
}

/**
 * Fallback for routes with no dedicated entry (e.g. /admin, unknown URLs):
 * a self-referential canonical and generic title, with no page-specific
 * structured data. These routes are excluded from indexing via robots.txt.
 */
function defaultSeo(path: string): SeoConfig {
  return {
    title: "ENVOD KINGDOM Shipping Services LLC",
    description: STATIC["/"].description,
    canonicalPath: path,
    image: OG_IMAGE,
    robots: "noindex, nofollow",
    jsonLd: [],
  };
}

const PRIORITY_SERVICE_DESCRIPTIONS: Record<string, Record<SeoLanguage, string>> = {
  warehousing: {
    en: "Discuss storage, inventory, order handling and distribution in Saudi Arabia. Facility, temperature range, operator and bonded status are confirmed before booking.",
    ar: "ناقش التخزين وإدارة المخزون وتجهيز الطلبات والتوزيع في السعودية. تُؤكد المنشأة ودرجة الحرارة والمشغّل وحالة التخزين الجمركي قبل الحجز.",
  },
  "project-cargo": {
    en: "Plan heavy or oversized project cargo in Saudi Arabia. Share dimensions, route, permits and lifting needs; qualified-provider availability is confirmed before booking.",
    ar: "خطط لشحن المعدات الثقيلة أو كبيرة الحجم في السعودية. شارك الأبعاد والمسار والتصاريح واحتياجات الرفع لتأكيد توفر مزود مؤهل.",
  },
  relocation: {
    en: "Request residential or commercial moving in Saudi Arabia. Share inventory, packing needs, dates and route so the service scope can be confirmed.",
    ar: "اطلب خدمات نقل سكنية أو تجارية في السعودية. شارك قائمة الأثاث واحتياجات التغليف والتواريخ والمسار لتحديد نطاق الخدمة.",
  },
  "ecommerce-logistics": {
    en: "Discuss e-commerce delivery, returns and fulfillment in Saudi Arabia. Provider coverage, facilities, integrations and tracking options depend on confirmed scope.",
    ar: "ناقش توصيل التجارة الإلكترونية والمرتجعات وتجهيز الطلبات في السعودية. يعتمد التغطية والمنشأة والتكامل والتتبع على نطاق المزوّد المتاح.",
  },
  "medical-pharma": {
    en: "Medical and pharmaceutical cargo requires product-specific handling, temperature, carrier and regulatory checks. Confirm route, facility and authorization before booking.",
    ar: "تتطلب الشحنات الطبية والدوائية مراجعة المنتج ودرجة الحرارة والناقل والاشتراطات التنظيمية. تُؤكد المنشأة والمسار والتصاريح قبل الحجز.",
  },
  "food-fmcg": {
    en: "Review food-cargo documents, temperature needs, route and operator availability. Product approvals, certification and clearance remain subject to authorities.",
    ar: "راجع مستندات الأغذية ودرجة الحرارة والمسار وتوفر المشغّل. تظل الموافقات والشهادات والتخليص خاضعة للجهات المختصة.",
  },
  "breakbulk-shipping": {
    en: "Plan non-containerized breakbulk cargo for Saudi Arabia. Port, terminal, vessel, handling partner and carrier acceptance are confirmed per shipment.",
    ar: "خطط لشحن البضائع غير المحواة إلى السعودية. يُؤكد توفر الميناء والمحطة والسفينة ومقدم المناولة وقبول الناقل لكل شحنة.",
  },
  "dangerous-goods": {
    en: "Send dangerous-goods details for classification and route review. Packaging, documents, carrier acceptance and operator availability are checked per shipment.",
    ar: "أرسل تفاصيل البضائع الخطرة لمراجعة التصنيف والمسار. تُؤكد العبوات والمستندات وقبول الناقل وتوفر المشغّل المؤهل لكل شحنة.",
  },
  "roro-shipping": {
    en: "Review RoRo options for vehicles, machinery and wheeled cargo. Route, vessel, port acceptance, customs and onward transport are confirmed per shipment.",
    ar: "استكشف شحن المركبات والآليات والبضائع ذات العجلات بنظام RoRo. يُؤكد المسار والسفينة والميناء والجمارك والنقل اللاحق لكل شحنة.",
  },
  "white-glove-logistics": {
    en: "Discuss careful handling, packing, inside delivery or setup for delicate or high-value items. Provider, crew, site access and scope are confirmed before booking.",
    ar: "ناقش المناولة الدقيقة والتغليف والتسليم الداخلي أو التركيب للمواد الحساسة أو عالية القيمة. يُؤكد الفريق والموقع والمزوّد قبل الحجز.",
  },
  "temperature-controlled-logistics": {
    en: "Share the cargo temperature range, route, dates and monitoring needs. Equipment, facilities, carrier acceptance and availability are confirmed per shipment.",
    ar: "شارك نطاق الحرارة والمسار والتواريخ ومتطلبات المراقبة. تُؤكد المعدات والمنشآت وقبول الناقل والتوفر لكل شحنة.",
  },
  "express-courier": {
    en: "Discuss urgent business-document and parcel shipments. Route, carrier schedule, cargo acceptance, security and delivery estimates depend on the selected operator.",
    ar: "ناقش الشحن العاجل لمستندات الأعمال والطرود. يعتمد المسار وجدول الناقل والقبول والأمان والموعد على المشغّل المختار.",
  },
  "cross-trade-shipping": {
    en: "Coordinate shipments between two countries outside your home market. Origin, destination, carrier, customs responsibilities and confidentiality are confirmed per request.",
    ar: "نسّق الشحن بين بلدين خارج سوق بلد الشاحن. يُؤكد المنشأ والوجهة والناقل ومسؤوليات الجمارك وشروط السرية لكل طلب.",
  },
  "customs-clearance": {
    en: "Customs clearance coordination for Riyadh Dry Port, Jeddah Islamic Port and King Abdulaziz Port Dammam. Prepare documents and check cargo-specific requirements.",
    ar: "تنسيق التخليص الجمركي للميناء الجاف بالرياض وميناء جدة الإسلامي وميناء الملك عبدالعزيز بالدمام، وتجهيز المستندات والتحقق من متطلبات البضاعة.",
  },
  "exhibition-logistics": {
    en: "Compare leading exhibition logistics providers in KSA: ENVOD reviews international event freight, customs and ATA Carnet documents, venue delivery and returns.",
    ar: "تنسيق لوجستيات المعارض في السعودية: الشحن الدولي ومستندات الجمارك واستفسارات كارنيه ATA والتسليم للموقع وتخطيط شحنات العودة حسب كل فعالية.",
  },
  "ata-carnet": {
    en: "ATA Carnet and temporary-import coordination in Saudi Arabia: eligibility, equipment lists, customs endorsements and re-export planning for exhibition cargo.",
    ar: "تنسيق كارنيه ATA والإدخال المؤقت في السعودية: أهلية الشحنة وقائمة المعدات والتصديقات الجمركية والتخطيط لإعادة تصدير بضائع المعارض.",
  },
  "freight-forwarding": {
    en: "Freight forwarding in Saudi Arabia: coordinate air, ocean and road cargo, shipment documents, customs responsibilities and delivery requirements.",
    ar: "خدمات الشحن المتكامل في السعودية: تنسيق الشحن الجوي والبحري والبري ومستندات الشحنة ومسؤوليات التخليص ومتطلبات التسليم.",
  },
  "ocean-freight": {
    en: "Ocean freight in Saudi Arabia: compare FCL and LCL, prepare shipment details, and plan customs and inland delivery through Jeddah or Dammam gateways.",
    ar: "الشحن البحري في السعودية: مقارنة الحاوية الكاملة FCL والشحن المشترك LCL وتجهيز تفاصيل الشحنة وتخطيط التخليص والنقل الداخلي عبر جدة أو الدمام.",
  },
  "gcc-transportation": {
    en: "GCC transportation from Saudi Arabia: plan cross-border road freight, cargo documents, border requirements and vehicle suitability before booking.",
    ar: "النقل الخليجي من السعودية: تخطيط الشحن البري العابر للحدود ومستندات البضائع ومتطلبات المنافذ وملاءمة المركبة قبل الحجز.",
  },
};

function serviceSeo(id: number, language: SeoLanguage): SeoConfig {
  const slug = ID_TO_SLUG[id];
  const svc = SERVICE_CATALOG.find((s) => s.id === id)!;
  const meta = SERVICE_META[id];
  const pillar = meta?.pillar;
  const path = localizedPath(`/services/${slug}`, language);
  const serviceName = language === "ar" ? svc.nameAr : svc.name;
  const serviceDescription = PRIORITY_SERVICE_DESCRIPTIONS[slug]?.[language] ?? (
    language === "ar"
      ? meta?.pillar?.intro.map((paragraph) => paragraph.ar).join(" ") ||
        svc.descriptionAr
      : pillar?.seoDescription ?? svc.description);

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: serviceName,
      description: serviceDescription,
      serviceType: svc.category,
      areaServed: "Saudi Arabia",
      provider: { "@id": ORG_ID },
      url: toAbsolute(path),
    },
    breadcrumb([
      { name: language === "ar" ? "الرئيسية" : "Home", path: localizedPath("/", language) },
      { name: language === "ar" ? "الخدمات" : "Services", path: localizedPath("/services", language) },
      { name: serviceName, path },
    ]),
  ];

  if (meta?.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faq.map((f) => ({
        "@type": "Question",
        name: language === "ar" ? f.qAr : f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: language === "ar" ? f.aAr : f.a,
        },
      })),
    });
  }

  return {
    title:
      language === "ar"
        ? `${svc.nameAr} في السعودية | إنفود كينغدوم`
        : slug === "oog-cargo"
          ? "Out-of-Gauge Cargo in Saudi Arabia | ENVOD KINGDOM"
        : pillar?.seoTitle ?? `${svc.name} in Saudi Arabia | ENVOD KINGDOM`,
    description: serviceDescription,
    canonicalPath: path,
    image: OG_IMAGE,
    jsonLd,
  };
}

function industrySeo(slug: string, language: SeoLanguage): SeoConfig {
  const ind = INDUSTRY_BY_SLUG[slug]!;
  const path = localizedPath(`/industries/${slug}`, language);
  const industryName = language === "ar" ? ind.nameAr : ind.nameEn;
  const industryDescription =
    language === "ar"
      ? ind.overview.map((paragraph) => paragraph.ar).join(" ")
      : ind.seoDescription;
  const metaDescription = language === "ar" ? ind.shortAr : ind.shortEn;

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: industryName,
      description: industryDescription,
      serviceType: industryName,
      areaServed: "Saudi Arabia",
      provider: { "@id": ORG_ID },
      url: toAbsolute(path),
    },
    breadcrumb([
      { name: language === "ar" ? "الرئيسية" : "Home", path: localizedPath("/", language) },
      { name: language === "ar" ? "القطاعات" : "Industries", path: localizedPath("/industries", language) },
      { name: industryName, path },
    ]),
  ];

  if (ind.faq.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ind.faq.map((f) => ({
        "@type": "Question",
        name: language === "ar" ? f.qAr : f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: language === "ar" ? f.aAr : f.a,
        },
      })),
    });
  }

  return {
    title:
      language === "ar"
        ? `${industryName} في السعودية | إنفود كينغدوم`
        : ind.seoTitle,
    description: metaDescription,
    canonicalPath: path,
    image: OG_IMAGE,
    jsonLd,
  };
}

/** Resolve locale-aware SEO for any route. Unknown routes are explicitly noindex. */
export function getSeoForPath(
  rawPath: string,
  requestedLanguage?: SeoLanguage,
): SeoConfig {
  const raw = normalizeRoutePath(rawPath);
  const hasArabicPrefix = raw === "/ar" || raw.startsWith("/ar/");
  const language = requestedLanguage ?? (hasArabicPrefix ? "ar" : "en");
  const path = hasArabicPrefix ? normalizeRoutePath(raw.slice(3) || "/") : raw;

  if (STATIC[path]) {
    const seo =
      language === "ar"
        ? {
            ...STATIC[path],
            ...STATIC_AR[path],
            jsonLd:
              path === "/services"
                ? [servicesFaqPage("ar")]
                : path === "/gallery"
                  ? galleryStructuredData("ar")
                  : [],
          }
        : STATIC[path];
    return withHreflang(seo, path, language);
  }

  const m = path.match(/^\/services\/([^/]+)$/);
  if (m) {
    const id = SLUG_TO_ID[m[1]];
    if (id) return withHreflang(serviceSeo(id, language), path, language);
  }
  const mi = path.match(/^\/industries\/([^/]+)$/);
  if (mi && INDUSTRY_BY_SLUG[mi[1]]) {
    return withHreflang(industrySeo(mi[1], language), path, language);
  }
  return defaultSeo(localizedPath(path, language));
}

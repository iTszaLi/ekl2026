import type { SeoConfig } from "./seo";
import { SERVICE_CATALOG, SERVICE_META, SLUG_TO_ID, ID_TO_SLUG } from "./service-data";
import { INDUSTRY_META, INDUSTRY_BY_SLUG } from "./industry-data";
import { VISION_SEO, VISION_FAQ } from "./vision-data";

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

/** Every content route that gets a statically prerendered HTML file. */
export const CONTENT_ROUTES: string[] = [
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

const STATIC: Record<string, SeoConfig> = {
  "/": {
    title:
      "ENVOD KINGDOM Shipping Services LLC — Logistics, Customs Clearance & Freight Saudi Arabia",
    description:
      "ENVOD KINGDOM — Saudi Arabia's trusted logistics partner. Expert customs clearance, container transportation, road freight, air freight, sea freight, exhibition logistics & project cargo in Riyadh, Jeddah, Dammam & the GCC.",
    canonicalPath: "/",
    image: OG_IMAGE,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "ENVOD KINGDOM Shipping Services LLC",
        url: SITE_URL,
        description:
          "Saudi Arabia's trusted logistics partner for customs clearance, freight forwarding, exhibition logistics, project cargo, and GCC shipping.",
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
      "Explore ENVOD KINGDOM's full range of logistics services across Saudi Arabia and the GCC — ocean freight, air freight, GCC transportation, customs clearance, warehousing, project cargo, exhibition logistics and more.",
    canonicalPath: "/services",
    image: OG_IMAGE,
    jsonLd: [
      servicesItemList(),
      offerCatalog(),
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ]),
    ],
  },
  "/about": {
    title: "About ENVOD KINGDOM — Saudi Arabia Logistics Company",
    description:
      "Learn about ENVOD KINGDOM SHIPPING SERVICES LLC — a Riyadh-based logistics company delivering customs clearance, freight forwarding, and supply chain solutions across Saudi Arabia and the GCC.",
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
      "Explore ENVOD KINGDOM's logistics operations in pictures — customs clearance, exhibition logistics, project cargo, warehousing, and freight forwarding across Saudi Arabia and the GCC.",
    canonicalPath: "/gallery",
    image: OG_IMAGE,
    jsonLd: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Gallery", path: "/gallery" },
      ]),
    ],
  },
  "/contact": {
    title: "Contact ENVOD KINGDOM — Request a Freight & Logistics Quote",
    description:
      "Contact ENVOD KINGDOM SHIPPING SERVICES LLC in Riyadh for customs clearance, freight forwarding, and logistics across Saudi Arabia and the GCC. Request a free quote today.",
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
    title: "Industries We Serve — Logistics by Sector in Saudi Arabia | ENVOD KINGDOM",
    description:
      "Industry-specific logistics across Saudi Arabia — automotive, construction, retail, fashion, electronics, aerospace, hospitality, furniture, chemical, telecom, and government-sector supply chains.",
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
  // Client-only route (not prerendered / not in the sitemap) — still gets a
  // proper self-referential title/canonical for shared links and JS crawlers.
  "/track": {
    title: "Track Your Shipment — ENVOD KINGDOM Shipping Services LLC",
    description:
      "Track your ENVOD KINGDOM shipment in real time. Enter your tracking number, booking reference, or invoice number for live status and delivery updates across Saudi Arabia and the GCC.",
    canonicalPath: "/track",
    image: OG_IMAGE,
    jsonLd: [
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Track Shipment", path: "/track" },
      ]),
    ],
  },
};

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
    jsonLd: [],
  };
}

function serviceSeo(id: number): SeoConfig {
  const slug = ID_TO_SLUG[id];
  const svc = SERVICE_CATALOG.find((s) => s.id === id)!;
  const meta = SERVICE_META[id];
  const pillar = meta?.pillar;
  const path = `/services/${slug}`;

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: svc.name,
      description: pillar?.seoDescription ?? svc.description,
      serviceType: svc.category,
      areaServed: "Saudi Arabia",
      provider: { "@id": ORG_ID },
      url: toAbsolute(path),
    },
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: svc.name, path },
    ]),
  ];

  if (meta?.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return {
    title: pillar?.seoTitle ?? `${svc.name} in Saudi Arabia | ENVOD KINGDOM`,
    description: pillar?.seoDescription ?? svc.description,
    canonicalPath: path,
    image: OG_IMAGE,
    jsonLd,
  };
}

function industrySeo(slug: string): SeoConfig {
  const ind = INDUSTRY_BY_SLUG[slug]!;
  const path = `/industries/${slug}`;

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: ind.nameEn,
      description: ind.seoDescription,
      serviceType: ind.nameEn,
      areaServed: "Saudi Arabia",
      provider: { "@id": ORG_ID },
      url: toAbsolute(path),
    },
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Industries", path: "/industries" },
      { name: ind.nameEn, path },
    ]),
  ];

  if (ind.faq.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ind.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return {
    title: ind.seoTitle,
    description: ind.seoDescription,
    canonicalPath: path,
    image: OG_IMAGE,
    jsonLd,
  };
}

/** Resolve the SEO config for any route. Falls back to the home config. */
export function getSeoForPath(rawPath: string): SeoConfig {
  const path = normalizeRoutePath(rawPath);
  if (STATIC[path]) return STATIC[path];
  const m = path.match(/^\/services\/([^/]+)$/);
  if (m) {
    const id = SLUG_TO_ID[m[1]];
    if (id) return serviceSeo(id);
  }
  const mi = path.match(/^\/industries\/([^/]+)$/);
  if (mi && INDUSTRY_BY_SLUG[mi[1]]) {
    return industrySeo(mi[1]);
  }
  return defaultSeo(path);
}

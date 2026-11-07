import type {
  CompetitorDomain,
  TrackedKeyword,
  TrackingConfig,
} from "../../src/lib/dataforseo-types.js";

export const TARGET_DOMAIN = "envodkingdom.net";

/**
 * Google Ads geo-target / DataForSEO country codes. Country-level codes are
 * stable; city codes are resolved at runtime from DataForSEO's free
 * `serp/google/locations/sa` endpoint rather than hard-coded.
 */
export const COUNTRY_LOCATIONS = {
  saudiArabia: { code: 2682, name: "Saudi Arabia", iso: "SA" },
  unitedArabEmirates: { code: 2784, name: "United Arab Emirates", iso: "AE" },
  bahrain: { code: 2048, name: "Bahrain", iso: "BH" },
  kuwait: { code: 2414, name: "Kuwait", iso: "KW" },
  qatar: { code: 2634, name: "Qatar", iso: "QA" },
  oman: { code: 2512, name: "Oman", iso: "OM" },
} as const;

export const PRIMARY_LOCATION_CODE = COUNTRY_LOCATIONS.saudiArabia.code;

/** KSA markets the owner asked to track separately where DataForSEO supports them. */
export const KSA_CITY_NAMES = ["Riyadh", "Jeddah", "Dammam", "Jubail", "Al Khobar", "Mecca", "Medina"];

/**
 * Default tracked set. Keywords come from the repository's existing
 * keyword-to-page research (docs/seo-research/keyword-to-page-{en,ar}.csv),
 * ordered by the owner's service priority. They are research candidates, not
 * measured demand; DataForSEO supplies the measurements.
 */
export const DEFAULT_TRACKED_KEYWORDS: TrackedKeyword[] = [
  { keyword: "envod kingdom", language: "en", targetUrl: "/", service: "Brand" },
  { keyword: "exhibition logistics saudi arabia", language: "en", targetUrl: "/services/exhibition-logistics", service: "Exhibition & Event Logistics" },
  { keyword: "house moving and corporate relocation saudi arabia", language: "en", targetUrl: "/services/relocation", service: "House Moving & Relocation" },
  { keyword: "customs clearance saudi arabia", language: "en", targetUrl: "/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "customs clearance riyadh", language: "en", targetUrl: "/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "customs clearance jeddah", language: "en", targetUrl: "/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "customs clearance dammam", language: "en", targetUrl: "/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "ata carnet saudi arabia", language: "en", targetUrl: "/services/ata-carnet", service: "ATA Carnet" },
  { keyword: "gcc road freight saudi arabia", language: "en", targetUrl: "/services/gcc-transportation", service: "GCC Transportation" },
  { keyword: "freight forwarder in saudi arabia", language: "en", targetUrl: "/services/freight-forwarding", service: "Freight Forwarding" },
  { keyword: "air freight saudi arabia", language: "en", targetUrl: "/services/air-freight", service: "Air Freight" },
  { keyword: "sea freight saudi arabia", language: "en", targetUrl: "/services/ocean-freight", service: "Sea Freight" },
  { keyword: "logistics company in riyadh", language: "en", targetUrl: "/", service: "General logistics" },
  { keyword: "لوجستيات المعارض والفعاليات في السعودية", language: "ar", targetUrl: "/ar/services/exhibition-logistics", service: "Exhibition & Event Logistics" },
  { keyword: "نقل أثاث ومكاتب في السعودية", language: "ar", targetUrl: "/ar/services/relocation", service: "House Moving & Relocation" },
  { keyword: "خدمات التخليص الجمركي في السعودية", language: "ar", targetUrl: "/ar/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "تخليص جمركي الرياض", language: "ar", targetUrl: "/ar/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "تخليص جمركي جدة", language: "ar", targetUrl: "/ar/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "تخليص جمركي الدمام", language: "ar", targetUrl: "/ar/services/customs-clearance", service: "Customs Clearance" },
  { keyword: "خدمات كرنية ATA في السعودية", language: "ar", targetUrl: "/ar/services/ata-carnet", service: "ATA Carnet" },
  { keyword: "النقل بين السعودية ودول الخليج", language: "ar", targetUrl: "/ar/services/gcc-transportation", service: "GCC Transportation" },
  { keyword: "وكيل شحن في السعودية", language: "ar", targetUrl: "/ar/services/freight-forwarding", service: "Freight Forwarding" },
  { keyword: "شركة لوجستية في الرياض", language: "ar", targetUrl: "/ar", service: "General logistics" },
];

/**
 * Competitors named by the owner. Domains were checked on 2026-11-06 by
 * fetching the homepage title; unconfirmed entries are never queried.
 */
export const DEFAULT_COMPETITORS: CompetitorDomain[] = [
  { name: "Four Winds Saudi Arabia", domain: "fourwinds-ksa.com", verification: "verified", note: "Homepage title: \"Four Winds Saudi Arabia | Moving & Logistics Services\"." },
  { name: "Glaube Logistics", domain: "glaubelogistics.com", verification: "verified", note: "Homepage title names Glaube Logistics." },
  { name: "Falcon Freight", domain: "thefalconfreight.com", verification: "verified", note: "Homepage title: \"Falcon Freight | Trusted Freight Forwarding Experts in Saudi Arabia\". Owner to confirm this is the intended Falcon." },
  { name: "Agility", domain: "agility.com", verification: "verified", note: "Global Agility group domain; site blocks automated fetches (Cloudflare). Owner to confirm a KSA-specific domain is not preferred." },
  { name: "Maxon", domain: "maxon.sa", verification: "likely", note: "Referenced as Maxon logistics (maxon.sa / logistics.maxon.sa) in earlier repo competitor research; site rejects automated fetches." },
  { name: "Expat Logistics", domain: "expatlogistics.com", verification: "likely", note: "Saudi pet-relocation business per homepage title; owner to confirm it is the intended Expat Logistics." },
  { name: "BCC Logistics", domain: null, verification: "unconfirmed", note: "bcclogistics.com did not respond; owner to supply the official domain." },
  { name: "Aegis", domain: null, verification: "unconfirmed", note: "aegislogistics.com is an unrelated US trucking firm; owner to supply the correct domain." },
  { name: "Luxe Events", domain: null, verification: "unconfirmed", note: "No official KSA domain found; owner to supply it." },
];

export function defaultTrackingConfig(): TrackingConfig {
  return {
    version: 1,
    updatedAt: null,
    targetDomain: TARGET_DOMAIN,
    keywords: DEFAULT_TRACKED_KEYWORDS.map((keyword) => ({ ...keyword })),
    competitors: DEFAULT_COMPETITORS.map((competitor) => ({ ...competitor })),
  };
}

/** Only competitors with a domain and at least "likely" verification are queried. */
export function activeCompetitorDomains(config: TrackingConfig): string[] {
  return config.competitors
    .filter((competitor) => competitor.domain && competitor.verification !== "unconfirmed")
    .map((competitor) => competitor.domain as string);
}

/**
 * Conservative pre-request estimates (USD). DataForSEO pricing checked on
 * 2026-11-06: Labs live = $0.012 per task + $0.00012 per returned item;
 * SERP is billed per 10-result page (standard queue from $0.0006; live is
 * higher and assumed $0.002 here). The actual `cost` returned by DataForSEO is
 * what gets recorded in the usage ledger.
 */
export const PRICING = {
  serpLivePerPageUsd: 0.002,
  labsTaskUsd: 0.012,
  labsItemUsd: 0.00012,
} as const;

export const DEFAULT_MONTHLY_BUDGET_USD = 5;
export const SERP_DEPTH = 50;
export const MAX_SERP_TASKS_PER_BATCH = 8;
export const MAX_TRACKED_KEYWORDS = 100;
export const MAX_RANK_TASKS_PER_RUN = 200;

/** Cache lifetimes per operation (ms). Cached results cost nothing. */
export const CACHE_TTL_MS: Record<string, number> = {
  serp_rank: 12 * 60 * 60 * 1000,
  ranked_keywords: 7 * 24 * 60 * 60 * 1000,
  domain_overview: 7 * 24 * 60 * 60 * 1000,
  competitors_domain: 7 * 24 * 60 * 60 * 1000,
  keyword_overview: 14 * 24 * 60 * 60 * 1000,
  keyword_suggestions: 14 * 24 * 60 * 60 * 1000,
  related_keywords: 14 * 24 * 60 * 60 * 1000,
  locations: 30 * 24 * 60 * 60 * 1000,
};

export interface SearchConsoleStatus {
  configured: boolean;
  authenticated: boolean;
  connected: boolean;
  selectedProperty: string | null;
  lastSyncedAt: string | null;
  setupMessage?: string;
}

export interface SearchConsoleProperty {
  siteUrl: string;
  permissionLevel: string;
}

export interface SearchConsolePropertiesResponse {
  properties: SearchConsoleProperty[];
  preferredProperty: string | null;
}

export interface SearchMetricRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchTimePoint extends SearchMetricRow {
  date: string;
}

export interface SearchQueryPageRow extends SearchMetricRow {
  query: string;
  page: string;
}

export interface SearchConsoleDashboard {
  property: string;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  retrievedAt: string;
  current: SearchMetricRow;
  previous: SearchMetricRow;
  timeSeries: SearchTimePoint[];
  queries: SearchMetricRow[];
  queryPages: SearchQueryPageRow[];
  pages: SearchMetricRow[];
  countries: SearchMetricRow[];
  devices: SearchMetricRow[];
  appearances: SearchMetricRow[];
  notes: string[];
}

export interface AuditedPage {
  url: string;
  status: number | null;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string | null;
  robots: string | null;
  language: string | null;
  direction?: string | null;
  h1: string[];
  hreflang: Array<{ language: string; url: string }>;
  internalLinks: number;
  imageCount: number;
  imagesMissingAlt: number;
  structuredDataTypes: string[];
  wordCount: number;
  error: string | null;
}

export interface SiteAudit {
  origin: string;
  startedAt: string;
  completedAt: string;
  robotsUrl: string;
  robotsAllowsCrawl: boolean;
  sitemapUrls: string[];
  discoveredUrls: number;
  crawledUrls: number;
  pages: AuditedPage[];
  notes: string[];
}

export interface UrlInspection {
  url: string;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  robotsTxtState: string | null;
  pageFetchState: string | null;
  lastCrawlTime: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  referringUrls: string[];
  sitemaps: string[];
  error?: string;
}

export interface SeoResearchSource {
  title: string;
  url: string;
  tier: number;
  evidenceMode: string;
  evidencePath: string;
}

export interface SeoResearchService {
  priority: string;
  service: string;
  queryEn: string;
  queryAr: string;
  targetUrlEn: string;
  targetUrlAr: string;
  routeType: string;
  journeyFocus: string;
  ksaScope: string;
  cityScope: string;
  uaeScope: string;
  gccScope: string;
  searchVolume: string;
  keywordDifficulty: string;
  envodRank: string;
  competitorRank: string;
  aiCitationStatus: string;
  technicalStatus: string;
  nextAction: string;
  competitorCoverage: string;
  competitorObservation: string;
  competitorLimitations: string;
  competitorNextResearch: string;
  effortEstimate: string;
  confidence: string;
  recommendedChange: string;
  testMethod: string;
  actualOutcome: string;
  evidence: SeoResearchSource[];
}

export interface SeoIntelligenceResearch {
  researchDate: string;
  keywordCandidateRows: number;
  sourceRecords: number;
  measuredKeywordVolume: boolean;
  measuredRank: boolean;
  measuredAiCitations: boolean;
  services: SeoResearchService[];
  markets: Array<Record<string, string>>;
}

export class SearchConsoleApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SearchConsoleApiError";
  }
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const apiRoot = `${basePath}/api/search-console`;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiRoot}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "The Search Console request could not be completed.";
    throw new SearchConsoleApiError(message, response.status);
  }
  return body as T;
}

export const searchConsoleApi = {
  getStatus: () => request<SearchConsoleStatus>("/session"),
  getResearch: () => request<SeoIntelligenceResearch>("/research"),
  listProperties: () =>
    request<SearchConsolePropertiesResponse>("/properties"),
  selectProperty: (siteUrl: string) =>
    request<{ ok: true; selectedProperty: string }>("/property", {
      method: "POST",
      body: JSON.stringify({ siteUrl }),
    }),
  getDashboard: (startDate: string, endDate: string, force = false) => {
    const query = new URLSearchParams({
      startDate,
      endDate,
      ...(force ? { force: "1" } : {}),
    });
    return request<SearchConsoleDashboard>(`/dashboard?${query.toString()}`);
  },
  getAudit: () => request<SiteAudit>("/audit"),
  runAudit: () =>
    request<SiteAudit>("/audit/run", { method: "POST", body: "{}" }),
  inspectUrls: (urls: string[]) =>
    request<{ inspections: UrlInspection[] }>("/inspection", {
      method: "POST",
      body: JSON.stringify({ urls }),
    }),
  disconnect: () =>
    request<{ ok: true }>("/disconnect", { method: "POST", body: "{}" }),
  logout: () =>
    request<{ ok: true }>("/logout", { method: "POST", body: "{}" }),
  startOAuth: () => {
    window.location.assign(`${apiRoot}/oauth/start`);
  },
};

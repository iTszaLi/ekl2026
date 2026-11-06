/**
 * Shared types for the private DataForSEO integration.
 *
 * Every value returned to the dashboard carries a `DataSourceMeta` so the UI
 * can show where a figure came from, when it was retrieved and for which
 * location/language/device. DataForSEO figures are third-party measurements
 * or estimates; they are never Google Search Console data.
 */

export type DataForSeoOperationId =
  | "serp_rank"
  | "ranked_keywords"
  | "domain_overview"
  | "competitors_domain"
  | "keyword_overview"
  | "keyword_suggestions"
  | "related_keywords";

export type Device = "desktop" | "mobile";
export type LanguageCode = "en" | "ar";

export interface DataSourceMeta {
  /** Human-readable source, e.g. "DataForSEO SERP API — Google Organic (live, advanced)". */
  source: string;
  endpoint: string;
  retrievedAt: string;
  locationCode: number | null;
  locationName: string | null;
  languageCode: string | null;
  device: Device | null;
  /** Actual cost reported by DataForSEO for this response, in USD. 0 for cached/free responses. */
  costUsd: number;
  cached: boolean;
  notes: string[];
}

export interface DataForSeoStatus {
  configured: boolean;
  connected: boolean;
  checkedAt: string;
  /** Plain-language error; never contains credentials. */
  error: string | null;
  errorCode: number | null;
  account: {
    balanceUsd: number | null;
    totalDepositedUsd: number | null;
    dailySpendLimitUsd: number | null;
  } | null;
  budget: BudgetSummary;
  storage: "vercel-blob" | "local-file" | "memory" | "unavailable";
}

export interface BudgetSummary {
  month: string;
  monthlyBudgetUsd: number;
  spentUsd: number;
  remainingUsd: number;
  paidRequests: number;
}

export interface UsageEntry {
  at: string;
  operation: string;
  endpoint: string;
  estimatedUsd: number;
  actualUsd: number;
  statusCode: number | null;
  ok: boolean;
}

export interface UsageReport extends BudgetSummary {
  byOperation: Array<{ operation: string; requests: number; actualUsd: number }>;
  recent: UsageEntry[];
}

export interface TrackedKeyword {
  keyword: string;
  language: LanguageCode;
  targetUrl: string;
  service: string;
}

export interface CompetitorDomain {
  name: string;
  domain: string | null;
  /** verified = domain checked and matches the named company; likely = strong evidence; unconfirmed = owner must confirm the domain. */
  verification: "verified" | "likely" | "unconfirmed";
  note: string;
}

export interface MarketLocation {
  code: number;
  name: string;
  type: "Country" | "City" | "Region" | string;
  countryIso: string;
}

export interface TrackingConfig {
  version: 1;
  updatedAt: string | null;
  targetDomain: string;
  keywords: TrackedKeyword[];
  competitors: CompetitorDomain[];
}

export interface CostEstimate {
  operation: DataForSeoOperationId | "rank_check";
  requests: number;
  estimatedUsd: number;
  cachedRequests: number;
  basis: string;
  withinBudget: boolean;
  budget: BudgetSummary;
}

export interface KeywordMetricsRow {
  keyword: string;
  searchVolume: number | null;
  competition: number | null;
  competitionLevel: string | null;
  cpcUsd: number | null;
  keywordDifficulty: number | null;
  mainIntent: string | null;
  serpFeatures: string[];
  monthlySearches: Array<{ year: number; month: number; searchVolume: number | null }>;
  /** Present for ranked-keyword results: ENVOD/target position in DataForSEO's database. */
  rankGroup?: number | null;
  rankedUrl?: string | null;
  estimatedTraffic?: number | null;
}

export interface PositionDistribution {
  pos_1: number;
  pos_2_3: number;
  pos_4_10: number;
  pos_11_20: number;
  pos_21_30: number;
  pos_31_40: number;
  pos_41_50: number;
  pos_51_100: number;
  count: number;
  estimatedTraffic: number | null;
}

export interface DomainOverviewRow {
  domain: string;
  organic: PositionDistribution | null;
}

export interface CompetitorRow {
  domain: string;
  avgPosition: number | null;
  intersections: number | null;
  organicKeywords: number | null;
  estimatedTraffic: number | null;
}

export interface SerpRankResult {
  keyword: string;
  language: LanguageCode;
  targetUrl: string;
  locationCode: number;
  locationName: string;
  device: Device;
  depth: number;
  status: "ok" | "error";
  error: string | null;
  /** ENVOD's best organic position (rank_group). null = not found within `depth`. */
  position: number | null;
  rankAbsolute: number | null;
  rankedUrl: string | null;
  competitors: Record<string, number | null>;
  topDomains: Array<{ position: number; domain: string; url: string; title?: string | null; breadcrumb?: string | null }>;
  /** Organic items in the snapshot, and how many had no readable destination (e.g. Google redirect links). */
  organicResults?: number;
  unresolvedResults?: number;
  /** True when ENVOD was not found but some results had unreadable destinations, so "not in top 50" is not confirmed. */
  positionUnconfirmed?: boolean;
  positionNote?: string | null;
  serpFeatures: string[];
  seResultsCount: number | null;
  retrievedAt: string;
  costUsd: number;
  cached: boolean;
}

export interface RankRunSummary {
  id: string;
  startedAt: string;
  completedAt: string | null;
  device: Device;
  depth: number;
  locations: MarketLocation[];
  totalTasks: number;
  completedTasks: number;
  costUsd: number;
}

export interface RankRun extends RankRunSummary {
  results: SerpRankResult[];
  tasks: Array<{ keyword: string; language: LanguageCode; targetUrl: string; locationCode: number }>;
}

export type RankChange = "improved" | "declined" | "unchanged" | "new" | "lost" | "not_ranked" | "no_previous";

export interface RankHistoryRow extends SerpRankResult {
  previousPosition: number | null;
  change: RankChange;
  delta: number | null;
  series: Array<{ at: string; position: number | null }>;
}

export interface RankHistoryResponse {
  latestRun: RankRunSummary | null;
  previousRun: RankRunSummary | null;
  runs: RankRunSummary[];
  rows: RankHistoryRow[];
  distribution: {
    tracked: number;
    top3: number;
    top4to10: number;
    top11to20: number;
    top21to50: number;
    outsideTop50: number;
    /** Not found among readable results, but some destinations were unreadable. */
    notFoundUnconfirmed: number;
    improved: number;
    declined: number;
  };
  byLocation: Array<{
    locationCode: number;
    locationName: string;
    tracked: number;
    top10: number;
    ranked: number;
    averagePosition: number | null;
  }>;
  competitors: Array<{
    domain: string;
    top10: number;
    ranked: number;
    averagePosition: number | null;
    betterThanEnvod: number;
  }>;
  meta: DataSourceMeta | null;
}

export interface OperationResult<T = unknown> {
  operation: DataForSeoOperationId;
  meta: DataSourceMeta;
  data: T;
}

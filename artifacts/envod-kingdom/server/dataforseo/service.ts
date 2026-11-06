import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type {
  BudgetSummary,
  CompetitorRow,
  CostEstimate,
  DataForSeoOperationId,
  DataForSeoStatus,
  DataSourceMeta,
  Device,
  DomainOverviewRow,
  KeywordMetricsRow,
  LanguageCode,
  MarketLocation,
  OperationResult,
  PositionDistribution,
  RankChange,
  RankHistoryResponse,
  RankHistoryRow,
  RankRun,
  RankRunSummary,
  SerpRankResult,
  TrackingConfig,
  UsageEntry,
  UsageReport,
} from "../../src/lib/dataforseo-types.js";
import {
  DataForSeoClient,
  DataForSeoError,
  envelopeCost,
  firstTask,
  readCredentials,
  type DataForSeoEnvelope,
} from "./client.js";
import {
  activeCompetitorDomains,
  CACHE_TTL_MS,
  COUNTRY_LOCATIONS,
  DEFAULT_MONTHLY_BUDGET_USD,
  defaultTrackingConfig,
  KSA_CITY_NAMES,
  MAX_RANK_TASKS_PER_RUN,
  MAX_SERP_TASKS_PER_BATCH,
  MAX_TRACKED_KEYWORDS,
  PRICING,
  PRIMARY_LOCATION_CODE,
  SERP_DEPTH,
  TARGET_DOMAIN,
} from "./config.js";
import type { JsonStore } from "./store.js";

type Environment = NodeJS.ProcessEnv;
type Fetcher = typeof fetch;

export class BudgetExceededError extends Error {
  constructor(readonly estimate: CostEstimate) {
    super("dataforseo_budget_exceeded");
  }
}

export class ConflictError extends Error {}

const COUNTRY_CODES = new Set<number>(Object.values(COUNTRY_LOCATIONS).map((country) => country.code));
const COUNTRY_BY_CODE = new Map<number, { code: number; name: string; iso: string }>(
  Object.values(COUNTRY_LOCATIONS).map((country) => [country.code, country]),
);

const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""))
  .pipe(z.string().regex(/^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/));
const keywordSchema = z.string().trim().min(1).max(80).transform((value) => value.toLowerCase());
const languageSchema = z.enum(["en", "ar"]);
const countrySchema = z.coerce.number().int().refine((code) => COUNTRY_CODES.has(code), {
  message: "Unsupported country location",
});

export const operationSchemas = {
  ranked_keywords: z.object({
    target: domainSchema.default(TARGET_DOMAIN),
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
    limit: z.coerce.number().int().min(1).max(200).default(100),
  }),
  domain_overview: z.object({
    targets: z.array(domainSchema).min(1).max(10),
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
  }),
  competitors_domain: z.object({
    target: domainSchema.default(TARGET_DOMAIN),
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
  keyword_overview: z.object({
    keywords: z.array(keywordSchema).min(1).max(200),
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
  }),
  keyword_suggestions: z.object({
    keyword: keywordSchema,
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
  related_keywords: z.object({
    keyword: keywordSchema,
    locationCode: countrySchema.default(PRIMARY_LOCATION_CODE),
    languageCode: languageSchema.default("en"),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
} as const;

export type LabsOperationId = keyof typeof operationSchemas;
export const LABS_OPERATIONS = Object.keys(operationSchemas) as LabsOperationId[];

export const rankStartSchema = z.object({
  locationCodes: z.array(z.coerce.number().int().positive()).min(1).max(8).default([PRIMARY_LOCATION_CODE]),
  device: z.enum(["desktop", "mobile"]).default("desktop"),
  keywords: z.array(z.string().trim().min(1).max(80)).max(MAX_TRACKED_KEYWORDS).optional(),
});

export const trackingConfigSchema = z.object({
  keywords: z
    .array(
      z.object({
        keyword: keywordSchema,
        language: languageSchema,
        targetUrl: z.string().trim().regex(/^\/[a-z0-9/#_-]*$/i).max(200),
        service: z.string().trim().min(1).max(80),
      }),
    )
    .min(1)
    .max(MAX_TRACKED_KEYWORDS),
  competitors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        domain: domainSchema.nullable(),
        verification: z.enum(["verified", "likely", "unconfirmed"]),
        note: z.string().trim().max(300).default(""),
      }),
    )
    .max(20),
});

const SOURCES: Record<DataForSeoOperationId, { source: string; endpoint: string }> = {
  serp_rank: {
    source: "DataForSEO SERP API — Google Organic (live, advanced)",
    endpoint: "serp/google/organic/live/advanced",
  },
  ranked_keywords: {
    source: "DataForSEO Labs — Google Ranked Keywords (DataForSEO database estimate)",
    endpoint: "dataforseo_labs/google/ranked_keywords/live",
  },
  domain_overview: {
    source: "DataForSEO Labs — Google Domain Rank Overview (DataForSEO database estimate)",
    endpoint: "dataforseo_labs/google/domain_rank_overview/live",
  },
  competitors_domain: {
    source: "DataForSEO Labs — Google Competitors Domain (DataForSEO database estimate)",
    endpoint: "dataforseo_labs/google/competitors_domain/live",
  },
  keyword_overview: {
    source: "DataForSEO Labs — Google Keyword Overview",
    endpoint: "dataforseo_labs/google/keyword_overview/live",
  },
  keyword_suggestions: {
    source: "DataForSEO Labs — Google Keyword Suggestions",
    endpoint: "dataforseo_labs/google/keyword_suggestions/live",
  },
  related_keywords: {
    source: "DataForSEO Labs — Google Related Keywords",
    endpoint: "dataforseo_labs/google/related_keywords/live",
  },
};

const ESTIMATE_NOTE =
  "Third-party DataForSEO data for the stated location and language. It is not Google Search Console data; search volume and traffic are DataForSEO estimates.";

function round(value: number, places = 4): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function monthKey(time: number): string {
  return new Date(time).toISOString().slice(0, 7);
}

function hashParams(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 40);
}

function num(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

const GOOGLE_HOST = /(^|\.)google\.[a-z.]{2,}$/i;
const GOOGLE_REDIRECT_PATH = /^\/(goto|url|aclk|imgres)(\/|$)/i;

function hostOf(value: string | null): string | null {
  if (!value) return null;
  const candidate = value.trim().split(/\s+[›>]\s*|\s/)[0] ?? "";
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    return /^[a-z0-9.-]+\.[a-z]{2,63}$/i.test(url.hostname) ? url.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Real destination host of an organic SERP item. Google sometimes serves results
 * as google.com/goto or /url redirect links, so the `domain`/`url` fields can
 * read "google.com". Then fall back to an embedded destination URL or the
 * displayed breadcrumb. Returns null when the destination cannot be determined.
 */
export function resolveResultHost(item: Record<string, unknown>): string | null {
  const rawUrl = str(item.url);
  let wrapped = false;
  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      if (GOOGLE_HOST.test(url.hostname) && GOOGLE_REDIRECT_PATH.test(url.pathname)) {
        wrapped = true;
        for (const key of ["url", "q", "adurl"]) {
          const embedded = hostOf(url.searchParams.get(key));
          const value = url.searchParams.get(key) ?? "";
          if (embedded && /^https?:\/\//i.test(value) && !GOOGLE_HOST.test(embedded)) return embedded;
        }
      } else if (/^https?:$/.test(url.protocol)) {
        return url.hostname.toLowerCase();
      }
    } catch {
      // fall through to the other fields
    }
  }
  const domain = hostOf(str(item.domain));
  if (domain && !(wrapped && GOOGLE_HOST.test(domain))) return domain;
  const breadcrumb = hostOf(str(item.breadcrumb));
  if (breadcrumb && !GOOGLE_HOST.test(breadcrumb)) return breadcrumb;
  return null;
}

function matchesDomain(domain: string | null, target: string): boolean {
  if (!domain) return false;
  const normalized = domain.toLowerCase().replace(/^www\./, "");
  return normalized === target || normalized.endsWith(`.${target}`);
}

export function normalizeDistribution(value: unknown): PositionDistribution | null {
  const metrics = record(value);
  if (!Object.keys(metrics).length) return null;
  const pick = (key: string) => num(metrics[key]) ?? 0;
  const pos31to40 = pick("pos_31_40");
  const pos41to50 = pick("pos_41_50");
  const pos51to100 =
    pick("pos_51_60") + pick("pos_61_70") + pick("pos_71_80") + pick("pos_81_90") + pick("pos_91_100");
  return {
    pos_1: pick("pos_1"),
    pos_2_3: pick("pos_2_3"),
    pos_4_10: pick("pos_4_10"),
    pos_11_20: pick("pos_11_20"),
    pos_21_30: pick("pos_21_30"),
    pos_31_40: pos31to40,
    pos_41_50: pos41to50,
    pos_51_100: pos51to100,
    count: pick("count"),
    estimatedTraffic: num(metrics.etv),
  };
}

/** Normalise the keyword shapes used by keyword_overview / suggestions / related / ranked_keywords. */
export function normalizeKeywordItem(item: unknown): KeywordMetricsRow | null {
  const source = record(item);
  const keywordData = Object.keys(record(source.keyword_data)).length ? record(source.keyword_data) : source;
  const keyword = str(keywordData.keyword);
  if (!keyword) return null;
  const info = record(keywordData.keyword_info);
  const properties = record(keywordData.keyword_properties);
  const intent = record(keywordData.search_intent_info);
  const serpInfo = record(keywordData.serp_info);
  const ranked = record(record(source.ranked_serp_element).serp_item);
  return {
    keyword,
    searchVolume: num(info.search_volume),
    competition: num(info.competition),
    competitionLevel: str(info.competition_level),
    cpcUsd: num(info.cpc),
    keywordDifficulty: num(properties.keyword_difficulty),
    mainIntent: str(intent.main_intent),
    serpFeatures: list(serpInfo.serp_item_types).filter((type): type is string => typeof type === "string"),
    monthlySearches: list(info.monthly_searches)
      .map((entry) => record(entry))
      .map((entry) => ({
        year: num(entry.year) ?? 0,
        month: num(entry.month) ?? 0,
        searchVolume: num(entry.search_volume),
      }))
      .filter((entry) => entry.year > 0)
      .slice(0, 24),
    ...(Object.keys(ranked).length
      ? {
          rankGroup: num(ranked.rank_group),
          rankedUrl: str(ranked.url),
          estimatedTraffic: num(ranked.etv),
        }
      : {}),
  };
}

export function normalizeSerp(
  result: unknown,
  options: { target: string; competitors: string[] },
): Pick<SerpRankResult, "position" | "rankAbsolute" | "rankedUrl" | "competitors" | "topDomains" | "serpFeatures" | "seResultsCount" | "organicResults" | "unresolvedResults"> {
  const data = record(result);
  const organic = list(data.items)
    .map((item) => record(item))
    .filter((item) => item.type === "organic");
  const resolved = organic.map((item) => ({ item, host: resolveResultHost(item) }));
  const envod = resolved.find((entry) => matchesDomain(entry.host, options.target))?.item;
  const competitors: Record<string, number | null> = {};
  for (const competitor of options.competitors) {
    const hit = resolved.find((entry) => matchesDomain(entry.host, competitor))?.item;
    competitors[competitor] = hit ? num(hit.rank_group) : null;
  }
  const unresolvedResults = resolved.filter((entry) => !entry.host).length;
  return {
    organicResults: organic.length,
    unresolvedResults,
    position: envod ? num(envod.rank_group) : null,
    rankAbsolute: envod ? num(envod.rank_absolute) : null,
    rankedUrl: envod ? str(envod.url) : null,
    competitors,
    topDomains: resolved.slice(0, 10).map(({ item, host }) => ({
      position: num(item.rank_group) ?? 0,
      domain: host ?? "unresolved (Google redirect link)",
      url: str(item.url) ?? "",
      title: str(item.title),
      breadcrumb: str(item.breadcrumb),
    })),
    serpFeatures: list(data.item_types).filter((type): type is string => typeof type === "string"),
    seResultsCount: num(data.se_results_count),
  };
}

interface CacheRecord<T> {
  storedAt: string;
  expiresAt: number;
  meta: DataSourceMeta;
  data: T;
}

interface UsageLedger {
  month: string;
  spentUsd: number;
  paidRequests: number;
  entries: UsageEntry[];
}

interface RankIndex {
  runs: RankRunSummary[];
}

type RankSeries = Record<string, Array<{ at: string; position: number | null }>>;

interface LocationsDocument {
  retrievedAt: string;
  serpLocations: MarketLocation[];
  labsLocations: Array<{ code: number; name: string; languages: string[] }>;
}

export interface DataForSeoServiceOptions {
  env?: Environment;
  fetchImpl?: Fetcher;
  now?: () => number;
  store: JsonStore | null;
  log?: (event: Record<string, unknown>, message: string) => void;
}

function seriesKey(keyword: string, locationCode: number, device: Device): string {
  return `${keyword}|${locationCode}|${device}`;
}

function locationLabel(code: number, locations: MarketLocation[]): string {
  return locations.find((location) => location.code === code)?.name ?? COUNTRY_BY_CODE.get(code)?.name ?? String(code);
}

export class DataForSeoService {
  private readonly env: Environment;
  private readonly fetchImpl: Fetcher;
  private readonly now: () => number;
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly runLocks = new Set<string>();
  private ledgerQueue: Promise<unknown> = Promise.resolve();
  private statusCache: { value: DataForSeoStatus; expiresAt: number } | null = null;

  constructor(private readonly options: DataForSeoServiceOptions) {
    this.env = options.env ?? process.env;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
  }

  get configured(): boolean {
    return readCredentials(this.env) !== null;
  }

  get storageKind(): DataForSeoStatus["storage"] {
    return this.options.store?.kind ?? "unavailable";
  }

  get monthlyBudgetUsd(): number {
    const configured = Number(this.env.DATAFORSEO_MONTHLY_BUDGET_USD);
    return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_MONTHLY_BUDGET_USD;
  }

  private client(): DataForSeoClient {
    const credentials = readCredentials(this.env);
    if (!credentials) {
      throw new DataForSeoError(
        "not_configured",
        "DataForSEO is not configured. Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to the server environment.",
      );
    }
    return new DataForSeoClient(credentials, this.fetchImpl);
  }

  private store(): JsonStore {
    const store = this.options.store;
    if (!store) {
      throw new DataForSeoError(
        "not_configured",
        "Private storage for DataForSEO results is not configured (Vercel Blob token missing).",
      );
    }
    return store;
  }

  private log(event: Record<string, unknown>, message: string): void {
    this.options.log?.(event, message);
  }

  // ---------------------------------------------------------------- budget

  private async readLedger(time = this.now()): Promise<UsageLedger> {
    const month = monthKey(time);
    const ledger = await this.store().read<UsageLedger>(`usage/${month}.json`);
    return ledger ?? { month, spentUsd: 0, paidRequests: 0, entries: [] };
  }

  async budget(): Promise<BudgetSummary> {
    const ledger = await this.readLedger();
    const monthlyBudgetUsd = this.monthlyBudgetUsd;
    return {
      month: ledger.month,
      monthlyBudgetUsd,
      spentUsd: round(ledger.spentUsd),
      remainingUsd: round(Math.max(0, monthlyBudgetUsd - ledger.spentUsd)),
      paidRequests: ledger.paidRequests,
    };
  }

  private recordUsage(entry: UsageEntry): Promise<void> {
    const next = this.ledgerQueue.then(async () => {
      const ledger = await this.readLedger(Date.parse(entry.at));
      ledger.entries.push(entry);
      if (ledger.entries.length > 2000) ledger.entries.splice(0, ledger.entries.length - 2000);
      ledger.spentUsd = round(ledger.spentUsd + entry.actualUsd, 6);
      ledger.paidRequests += 1;
      await this.store().write(`usage/${ledger.month}.json`, ledger);
    });
    this.ledgerQueue = next.catch(() => undefined);
    return next;
  }

  async usage(): Promise<UsageReport> {
    const ledger = await this.readLedger();
    const budget = await this.budget();
    const byOperation = new Map<string, { operation: string; requests: number; actualUsd: number }>();
    for (const entry of ledger.entries) {
      const current = byOperation.get(entry.operation) ?? { operation: entry.operation, requests: 0, actualUsd: 0 };
      current.requests += 1;
      current.actualUsd = round(current.actualUsd + entry.actualUsd, 6);
      byOperation.set(entry.operation, current);
    }
    return {
      ...budget,
      byOperation: [...byOperation.values()].sort((a, b) => b.actualUsd - a.actualUsd),
      recent: ledger.entries.slice(-25).reverse(),
    };
  }

  private async assertBudget(estimate: Omit<CostEstimate, "withinBudget" | "budget">): Promise<CostEstimate> {
    const budget = await this.budget();
    const full: CostEstimate = {
      ...estimate,
      estimatedUsd: round(estimate.estimatedUsd),
      withinBudget: estimate.estimatedUsd <= budget.remainingUsd + 1e-9,
      budget,
    };
    return full;
  }

  /** Execute one paid DataForSEO POST, recording the actual cost reported by the provider. */
  private async paidPost<T>(
    operation: string,
    endpoint: string,
    task: Record<string, unknown>,
    estimatedUsd: number,
  ): Promise<DataForSeoEnvelope<T>> {
    const budget = await this.budget();
    if (estimatedUsd > budget.remainingUsd + 1e-9) {
      throw new BudgetExceededError({
        operation: operation as CostEstimate["operation"],
        requests: 1,
        estimatedUsd,
        cachedRequests: 0,
        basis: "Single request",
        withinBudget: false,
        budget,
      });
    }
    const at = new Date(this.now()).toISOString();
    try {
      const envelope = await this.client().post<T>(endpoint, task);
      const actualUsd = envelopeCost(envelope);
      await this.recordUsage({
        at,
        operation,
        endpoint,
        estimatedUsd: round(estimatedUsd, 6),
        actualUsd,
        statusCode: envelope.tasks[0]?.status_code ?? envelope.status_code,
        ok: envelope.tasks[0]?.status_code === 20000,
      });
      this.log({ operation, endpoint, costUsd: actualUsd, taskStatus: envelope.tasks[0]?.status_code }, "DataForSEO request completed");
      return envelope;
    } catch (error) {
      if (error instanceof DataForSeoError) {
        this.log({ operation, endpoint, kind: error.kind, statusCode: error.statusCode }, "DataForSEO request failed");
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------- status

  async status(force = false): Promise<DataForSeoStatus> {
    const time = this.now();
    if (!force && this.statusCache && this.statusCache.expiresAt > time) return this.statusCache.value;
    let budget: BudgetSummary;
    try {
      budget = await this.budget();
    } catch {
      budget = {
        month: monthKey(time),
        monthlyBudgetUsd: this.monthlyBudgetUsd,
        spentUsd: 0,
        remainingUsd: 0,
        paidRequests: 0,
      };
    }
    const base: DataForSeoStatus = {
      configured: this.configured,
      connected: false,
      checkedAt: new Date(time).toISOString(),
      error: null,
      errorCode: null,
      account: null,
      budget,
      storage: this.storageKind,
    };
    if (!base.configured) {
      base.error = "Not configured: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are not set on the server.";
      return base;
    }
    try {
      // appendix/user_data is free and confirms authentication.
      const envelope = await this.client().get<Record<string, unknown>>("appendix/user_data");
      const task = firstTask(envelope);
      const account = record(task.result?.[0]);
      const money = record(account.money);
      const limits = record(money.limits);
      base.connected = true;
      base.account = {
        balanceUsd: num(money.balance),
        totalDepositedUsd: num(money.total),
        dailySpendLimitUsd: num(record(limits.day).total) ?? num(limits.day),
      };
    } catch (error) {
      base.connected = false;
      base.error = error instanceof DataForSeoError ? error.message : "DataForSEO status could not be checked.";
      base.errorCode = error instanceof DataForSeoError ? error.statusCode : null;
    }
    this.statusCache = { value: base, expiresAt: time + 60_000 };
    return base;
  }

  // ---------------------------------------------------------------- config

  async trackingConfig(): Promise<TrackingConfig> {
    return (await this.store().read<TrackingConfig>("config.json")) ?? defaultTrackingConfig();
  }

  async saveTrackingConfig(input: unknown): Promise<TrackingConfig> {
    const parsed = trackingConfigSchema.parse(input);
    const unique = new Map(parsed.keywords.map((keyword) => [`${keyword.language}|${keyword.keyword}`, keyword]));
    const config: TrackingConfig = {
      version: 1,
      updatedAt: new Date(this.now()).toISOString(),
      targetDomain: TARGET_DOMAIN,
      keywords: [...unique.values()],
      competitors: parsed.competitors.map((competitor) => ({
        ...competitor,
        verification: competitor.domain ? competitor.verification : "unconfirmed",
      })),
    };
    await this.store().write("config.json", config);
    return config;
  }

  // ---------------------------------------------------------------- locations (free)

  async locations(refresh = false): Promise<LocationsDocument> {
    const cached = await this.store().read<LocationsDocument>("locations.json");
    if (!refresh && cached && Date.parse(cached.retrievedAt) + CACHE_TTL_MS.locations > this.now()) return cached;
    const client = this.client();
    const serp = firstTask(await client.get<Record<string, unknown>>("serp/google/locations/sa"));
    const serpLocations: MarketLocation[] = list(serp.result)
      .map((entry) => record(entry))
      .map((entry) => ({
        code: num(entry.location_code) ?? 0,
        name: str(entry.location_name) ?? "",
        type: str(entry.location_type) ?? "",
        countryIso: str(entry.country_iso_code) ?? "",
      }))
      .filter(
        (location) =>
          location.code > 0 &&
          (location.code === PRIMARY_LOCATION_CODE ||
            (location.type === "City" &&
              KSA_CITY_NAMES.some((city) => location.name.toLowerCase().startsWith(`${city.toLowerCase()},`)))),
      );
    if (!serpLocations.some((location) => location.code === PRIMARY_LOCATION_CODE)) {
      serpLocations.unshift({ code: PRIMARY_LOCATION_CODE, name: "Saudi Arabia", type: "Country", countryIso: "SA" });
    }
    const labs = firstTask(await client.get<Record<string, unknown>>("dataforseo_labs/locations_and_languages"));
    const labsLocations = list(labs.result)
      .map((entry) => record(entry))
      .filter((entry) => COUNTRY_CODES.has(num(entry.location_code) ?? -1))
      .map((entry) => ({
        code: num(entry.location_code) ?? 0,
        name: str(entry.location_name) ?? "",
        languages: list(entry.available_languages)
          .map((language) => str(record(language).language_code))
          .filter((code): code is string => Boolean(code)),
      }));
    const document: LocationsDocument = {
      retrievedAt: new Date(this.now()).toISOString(),
      serpLocations,
      labsLocations,
    };
    await this.store().write("locations.json", document);
    return document;
  }

  // ---------------------------------------------------------------- Labs operations

  estimateLabs(operation: LabsOperationId, params: unknown): { requests: number; estimatedUsd: number; basis: string } {
    const parsed = operationSchemas[operation].parse(params) as Record<string, unknown>;
    const perTask = PRICING.labsTaskUsd;
    const perItem = PRICING.labsItemUsd;
    switch (operation) {
      case "domain_overview": {
        const targets = (parsed.targets as string[]).length;
        return { requests: targets, estimatedUsd: targets * (perTask + perItem), basis: `${targets} × ($0.012 task + $0.00012 item)` };
      }
      case "keyword_overview": {
        const keywords = (parsed.keywords as string[]).length;
        return { requests: 1, estimatedUsd: perTask + keywords * perItem, basis: `$0.012 task + ${keywords} × $0.00012` };
      }
      default: {
        const limit = Number(parsed.limit ?? 100);
        return { requests: 1, estimatedUsd: perTask + limit * perItem, basis: `$0.012 task + up to ${limit} × $0.00012` };
      }
    }
  }

  private labsTask(operation: LabsOperationId, parsed: Record<string, unknown>, target?: string): Record<string, unknown> {
    const common = { location_code: parsed.locationCode, language_code: parsed.languageCode };
    switch (operation) {
      case "ranked_keywords":
        return { ...common, target: parsed.target, limit: parsed.limit, item_types: ["organic"], load_rank_absolute: true };
      case "domain_overview":
        return { ...common, target };
      case "competitors_domain":
        return { ...common, target: parsed.target, limit: parsed.limit, item_types: ["organic"], exclude_top_domains: true };
      case "keyword_overview":
        return { ...common, keywords: parsed.keywords, include_serp_info: true };
      case "keyword_suggestions":
        return { ...common, keyword: parsed.keyword, limit: parsed.limit, include_seed_keyword: true, include_serp_info: true };
      case "related_keywords":
        return { ...common, keyword: parsed.keyword, limit: parsed.limit, depth: 1, include_seed_keyword: true, include_serp_info: true };
    }
  }

  private normalizeLabs(operation: LabsOperationId, results: unknown[]): unknown {
    const first = record(results[0]);
    switch (operation) {
      case "ranked_keywords":
        return {
          target: str(first.target),
          totalCount: num(first.total_count),
          distribution: normalizeDistribution(record(first.metrics).organic),
          keywords: list(first.items).map(normalizeKeywordItem).filter(Boolean),
        };
      case "domain_overview":
        return results.map((result): DomainOverviewRow => {
          const item = record(list(record(result).items)[0]);
          return { domain: str(record(result).target) ?? "", organic: normalizeDistribution(record(item.metrics).organic) };
        });
      case "competitors_domain":
        return list(first.items).map((entry): CompetitorRow => {
          const item = record(entry);
          const full = record(record(item.full_domain_metrics).organic);
          return {
            domain: str(item.domain) ?? "",
            avgPosition: num(item.avg_position),
            intersections: num(item.intersections),
            organicKeywords: num(full.count),
            estimatedTraffic: num(full.etv),
          };
        });
      default:
        return {
          seedKeyword: str(first.seed_keyword),
          keywords: list(first.items).map(normalizeKeywordItem).filter(Boolean),
        };
    }
  }

  async estimateOperation(operation: LabsOperationId, params: unknown): Promise<CostEstimate> {
    const estimate = this.estimateLabs(operation, params);
    const parsed = operationSchemas[operation].parse(params);
    const cached = await this.store().read<CacheRecord<unknown>>(`cache/${operation}/${hashParams(parsed)}.json`);
    const fresh = cached && cached.expiresAt > this.now();
    return this.assertBudget({
      operation,
      requests: fresh ? 0 : estimate.requests,
      estimatedUsd: fresh ? 0 : estimate.estimatedUsd,
      cachedRequests: fresh ? estimate.requests : 0,
      basis: fresh ? "Served from cache (no charge)" : estimate.basis,
    });
  }

  async runOperation(operation: LabsOperationId, params: unknown, refresh = false): Promise<OperationResult> {
    const parsed = operationSchemas[operation].parse(params) as Record<string, unknown>;
    const cacheKey = `cache/${operation}/${hashParams(parsed)}.json`;
    const pending = this.inFlight.get(cacheKey);
    if (pending) return pending as Promise<OperationResult>;
    const work = (async (): Promise<OperationResult> => {
      const store = this.store();
      if (!refresh) {
        const cached = await store.read<CacheRecord<unknown>>(cacheKey);
        if (cached && cached.expiresAt > this.now()) {
          return { operation, meta: { ...cached.meta, cached: true, costUsd: 0 }, data: cached.data };
        }
      }
      const estimate = this.estimateLabs(operation, parsed);
      const budget = await this.budget();
      if (estimate.estimatedUsd > budget.remainingUsd + 1e-9) {
        throw new BudgetExceededError({ operation, ...estimate, cachedRequests: 0, withinBudget: false, budget });
      }
      const { endpoint, source } = SOURCES[operation];
      const results: unknown[] = [];
      let costUsd = 0;
      const targets = operation === "domain_overview" ? (parsed.targets as string[]) : [undefined];
      for (const target of targets) {
        const envelope = await this.paidPost<unknown>(
          operation,
          endpoint,
          this.labsTask(operation, parsed, target),
          estimate.estimatedUsd / targets.length,
        );
        costUsd += envelopeCost(envelope);
        const task = firstTask(envelope);
        results.push(...(task.result ?? []));
      }
      const locationCode = Number(parsed.locationCode);
      const meta: DataSourceMeta = {
        source,
        endpoint,
        retrievedAt: new Date(this.now()).toISOString(),
        locationCode,
        locationName: COUNTRY_BY_CODE.get(locationCode)?.name ?? null,
        languageCode: String(parsed.languageCode),
        device: null,
        costUsd: round(costUsd, 6),
        cached: false,
        notes: [ESTIMATE_NOTE],
      };
      const data = this.normalizeLabs(operation, results);
      await store.write(cacheKey, {
        storedAt: meta.retrievedAt,
        expiresAt: this.now() + CACHE_TTL_MS[operation],
        meta,
        data,
      } satisfies CacheRecord<unknown>);
      return { operation, meta, data };
    })();
    this.inFlight.set(cacheKey, work);
    try {
      return await work;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  // ---------------------------------------------------------------- rank tracking (SERP API)

  private serpEstimatePerTask(): number {
    return (SERP_DEPTH / 10) * PRICING.serpLivePerPageUsd;
  }

  private async serpRank(
    keyword: { keyword: string; language: LanguageCode; targetUrl: string },
    locationCode: number,
    locationName: string,
    device: Device,
    competitors: string[],
  ): Promise<SerpRankResult> {
    // `parser` versions the cache: bump it when normalisation changes so stale snapshots are not reused.
    const params = { keyword: keyword.keyword, language: keyword.language, locationCode, device, depth: SERP_DEPTH, parser: 2 };
    const cacheKey = `cache/serp_rank/${hashParams(params)}.json`;
    const store = this.store();
    const cached = await store.read<CacheRecord<SerpRankResult>>(cacheKey);
    if (cached && cached.expiresAt > this.now()) {
      const competitorPositions = Object.fromEntries(
        competitors.map((domain) => [domain, cached.data.competitors[domain] ?? null]),
      );
      return { ...cached.data, targetUrl: keyword.targetUrl, competitors: competitorPositions, cached: true, costUsd: 0 };
    }
    const envelope = await this.paidPost<unknown>(
      "serp_rank",
      SOURCES.serp_rank.endpoint,
      {
        keyword: keyword.keyword,
        location_code: locationCode,
        language_code: keyword.language,
        device,
        os: device === "mobile" ? "android" : "windows",
        depth: SERP_DEPTH,
      },
      this.serpEstimatePerTask(),
    );
    const task = firstTask(envelope);
    const normalized = normalizeSerp(task.result?.[0], { target: TARGET_DOMAIN, competitors });
    const result: SerpRankResult = {
      keyword: keyword.keyword,
      language: keyword.language,
      targetUrl: keyword.targetUrl,
      locationCode,
      locationName,
      device,
      depth: SERP_DEPTH,
      ...normalized,
      // Never report "not ranked" when some result destinations could not be read.
      ...(normalized.position === null && (normalized.unresolvedResults ?? 0) > 0
        ? {
            status: "error" as const,
            error: `${normalized.unresolvedResults} of ${normalized.organicResults} organic results were Google redirect links without a readable destination, so ENVOD's position cannot be confirmed from this snapshot.`,
          }
        : { status: "ok" as const, error: null }),
      retrievedAt: new Date(this.now()).toISOString(),
      costUsd: envelopeCost(envelope),
      cached: false,
    };
    await store.write(cacheKey, {
      storedAt: result.retrievedAt,
      expiresAt: this.now() + CACHE_TTL_MS.serp_rank,
      meta: this.serpMeta(result.retrievedAt, locationCode, locationName, keyword.language, device, result.costUsd),
      data: result,
    } satisfies CacheRecord<SerpRankResult>);
    return result;
  }

  private serpMeta(
    retrievedAt: string,
    locationCode: number | null,
    locationName: string | null,
    languageCode: string | null,
    device: Device | null,
    costUsd: number,
  ): DataSourceMeta {
    return {
      ...SOURCES.serp_rank,
      retrievedAt,
      locationCode,
      locationName,
      languageCode,
      device,
      costUsd: round(costUsd, 6),
      cached: false,
      notes: [
        `Live Google results captured by DataForSEO at depth ${SERP_DEPTH}. Position = organic rank_group; "not found" means outside the top ${SERP_DEPTH}. A single SERP snapshot, not Search Console average position.`,
      ],
    };
  }

  private async knownLocations(): Promise<MarketLocation[]> {
    const cached = await this.store().read<LocationsDocument>("locations.json");
    const fromCache = cached?.serpLocations ?? [];
    const countries = Object.values(COUNTRY_LOCATIONS).map((country) => ({
      code: country.code,
      name: country.name,
      type: "Country",
      countryIso: country.iso,
    }));
    return [...countries, ...fromCache.filter((location) => !COUNTRY_CODES.has(location.code))];
  }

  async estimateRankCheck(input: unknown): Promise<CostEstimate & { tasks: number }> {
    const plan = await this.planRankRun(input);
    const estimate = await this.assertBudget({
      operation: "rank_check",
      requests: plan.tasks.length,
      estimatedUsd: plan.tasks.length * this.serpEstimatePerTask(),
      cachedRequests: 0,
      basis: `${plan.tasks.length} SERP request(s) × depth ${SERP_DEPTH} (${SERP_DEPTH / 10} pages × ~$${PRICING.serpLivePerPageUsd}); cached results within 12 hours are free`,
    });
    return { ...estimate, tasks: plan.tasks.length };
  }

  private async planRankRun(input: unknown) {
    const parsed = rankStartSchema.parse(input);
    const config = await this.trackingConfig();
    const locations = await this.knownLocations();
    const selected = [...new Set(parsed.locationCodes)].map((code) => {
      const location = locations.find((candidate) => candidate.code === code);
      if (!location) {
        throw new z.ZodError([
          { code: "custom", path: ["locationCodes"], message: `Unknown location ${code}. Load locations first.`, input: code },
        ]);
      }
      return location;
    });
    const wanted = parsed.keywords ? new Set(parsed.keywords.map((keyword) => keyword.toLowerCase())) : null;
    const keywords = config.keywords.filter((keyword) => !wanted || wanted.has(keyword.keyword));
    const tasks = selected.flatMap((location) =>
      keywords.map((keyword) => ({
        keyword: keyword.keyword,
        language: keyword.language,
        targetUrl: keyword.targetUrl,
        locationCode: location.code,
      })),
    );
    if (!tasks.length) throw new ConflictError("No tracked keywords match the request.");
    if (tasks.length > MAX_RANK_TASKS_PER_RUN) {
      throw new ConflictError(`A rank check is limited to ${MAX_RANK_TASKS_PER_RUN} keyword-location requests.`);
    }
    return { device: parsed.device, locations: selected, tasks };
  }

  private async rankIndex(): Promise<RankIndex> {
    return (await this.store().read<RankIndex>("rank-index.json")) ?? { runs: [] };
  }

  private async saveRunSummary(summary: RankRunSummary): Promise<void> {
    const index = await this.rankIndex();
    const position = index.runs.findIndex((run) => run.id === summary.id);
    if (position >= 0) index.runs[position] = summary;
    else index.runs.push(summary);
    index.runs.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    if (index.runs.length > 200) index.runs.splice(0, index.runs.length - 200);
    await this.store().write("rank-index.json", index);
  }

  async startRankCheck(input: unknown): Promise<{ run: RankRunSummary; estimate: CostEstimate }> {
    const plan = await this.planRankRun(input);
    const estimate = await this.estimateRankCheck(input);
    if (!estimate.withinBudget) throw new BudgetExceededError(estimate);
    const index = await this.rankIndex();
    const active = index.runs.find((run) => !run.completedAt && Date.parse(run.startedAt) > this.now() - 30 * 60_000);
    if (active) throw new ConflictError(`Rank check ${active.id} is still in progress. Continue or wait for it to finish.`);
    const startedAt = new Date(this.now()).toISOString();
    const run: RankRun = {
      id: `${startedAt.replace(/[:.]/g, "-")}-${randomBytes(3).toString("hex")}`.toLowerCase(),
      startedAt,
      completedAt: null,
      device: plan.device,
      depth: SERP_DEPTH,
      locations: plan.locations,
      totalTasks: plan.tasks.length,
      completedTasks: 0,
      costUsd: 0,
      tasks: plan.tasks,
      results: [],
    };
    await this.store().write(`rank-runs/${run.id}.json`, run);
    const { tasks: _tasks, results: _results, ...summary } = run;
    await this.saveRunSummary(summary);
    return { run: summary, estimate };
  }

  async continueRankCheck(runId: string): Promise<RankRunSummary> {
    if (!/^[a-z0-9-]{10,80}$/.test(runId)) throw new ConflictError("Unknown rank check.");
    if (this.runLocks.has(runId)) throw new ConflictError("This rank check batch is already running.");
    this.runLocks.add(runId);
    try {
      const store = this.store();
      const run = await store.read<RankRun>(`rank-runs/${runId}.json`);
      if (!run) throw new ConflictError("Unknown rank check.");
      if (run.completedAt) {
        const { tasks: _tasks, results: _results, ...summary } = run;
        return summary;
      }
      const config = await this.trackingConfig();
      const competitors = activeCompetitorDomains(config);
      const batch = run.tasks.slice(run.results.length, run.results.length + MAX_SERP_TASKS_PER_BATCH);
      const results: SerpRankResult[] = [];
      let fatal: unknown = null;
      for (let index = 0; index < batch.length; index += 4) {
        const slice = batch.slice(index, index + 4);
        const settled = await Promise.allSettled(
          slice.map((task) =>
            this.serpRank(task, task.locationCode, locationLabel(task.locationCode, run.locations), run.device, competitors),
          ),
        );
        settled.forEach((outcome, offset) => {
          const task = slice[offset];
          if (outcome.status === "fulfilled") {
            results.push(outcome.value);
            return;
          }
          const error = outcome.reason;
          if (
            error instanceof BudgetExceededError ||
            (error instanceof DataForSeoError && ["auth", "payment", "not_configured", "rate_limit"].includes(error.kind))
          ) {
            fatal ??= error;
            return;
          }
          results.push({
            keyword: task.keyword,
            language: task.language,
            targetUrl: task.targetUrl,
            locationCode: task.locationCode,
            locationName: locationLabel(task.locationCode, run.locations),
            device: run.device,
            depth: SERP_DEPTH,
            status: "error",
            error: error instanceof DataForSeoError ? error.message : "The SERP request failed.",
            position: null,
            rankAbsolute: null,
            rankedUrl: null,
            competitors: {},
            topDomains: [],
            serpFeatures: [],
            seResultsCount: null,
            retrievedAt: new Date(this.now()).toISOString(),
            costUsd: 0,
            cached: false,
          });
        });
        if (fatal) break;
      }
      // Keep result order aligned with the task list so the next batch resumes correctly.
      const contiguous: SerpRankResult[] = [];
      for (const task of batch) {
        const match = results.find(
          (result) =>
            result.keyword === task.keyword && result.locationCode === task.locationCode && result.language === task.language,
        );
        if (!match) break;
        contiguous.push(match);
      }
      run.results.push(...contiguous);
      run.completedTasks = run.results.length;
      run.costUsd = round(run.results.reduce((sum, result) => sum + result.costUsd, 0), 6);
      if (run.results.length >= run.tasks.length) {
        run.completedAt = new Date(this.now()).toISOString();
        await this.appendSeries(run);
      }
      await store.write(`rank-runs/${run.id}.json`, run);
      const { tasks: _tasks, results: _results, ...summary } = run;
      await this.saveRunSummary(summary);
      if (fatal) throw fatal;
      return summary;
    } finally {
      this.runLocks.delete(runId);
    }
  }

  private async appendSeries(run: RankRun): Promise<void> {
    const series = (await this.store().read<RankSeries>("rank-series.json")) ?? {};
    for (const result of run.results) {
      if (result.status !== "ok") continue;
      const key = seriesKey(result.keyword, result.locationCode, result.device);
      const points = series[key] ?? [];
      points.push({ at: result.retrievedAt, position: result.position });
      if (points.length > 120) points.splice(0, points.length - 120);
      series[key] = points;
    }
    await this.store().write("rank-series.json", series);
  }

  async rankHistory(): Promise<RankHistoryResponse> {
    const store = this.store();
    const index = await this.rankIndex();
    const completed = index.runs.filter((run) => run.completedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const empty: RankHistoryResponse = {
      latestRun: null,
      previousRun: null,
      runs: index.runs.slice().reverse().slice(0, 30),
      rows: [],
      distribution: { tracked: 0, top3: 0, top4to10: 0, top11to20: 0, top21to50: 0, outsideTop50: 0, improved: 0, declined: 0 },
      byLocation: [],
      competitors: [],
      meta: null,
    };
    const latestSummary = completed[0];
    if (!latestSummary) return empty;
    const latest = await store.read<RankRun>(`rank-runs/${latestSummary.id}.json`);
    if (!latest) return empty;
    const previousSummary = completed.slice(1).find((run) => run.device === latest.device) ?? null;
    const previous = previousSummary ? await store.read<RankRun>(`rank-runs/${previousSummary.id}.json`) : null;
    const series = (await store.read<RankSeries>("rank-series.json")) ?? {};
    const previousByKey = new Map(
      (previous?.results ?? [])
        .filter((result) => result.status === "ok")
        .map((result) => [seriesKey(result.keyword, result.locationCode, result.device), result]),
    );

    const rows: RankHistoryRow[] = latest.results.map((result) => {
      const key = seriesKey(result.keyword, result.locationCode, result.device);
      const before = previousByKey.get(key);
      let change: RankChange;
      let delta: number | null = null;
      if (!before) change = result.position === null ? "not_ranked" : "no_previous";
      else if (before.position === null && result.position === null) change = "not_ranked";
      else if (before.position === null) change = "new";
      else if (result.position === null) change = "lost";
      else {
        delta = before.position - result.position;
        change = delta > 0 ? "improved" : delta < 0 ? "declined" : "unchanged";
      }
      return {
        ...result,
        previousPosition: before?.position ?? null,
        change,
        delta,
        series: series[key] ?? [],
      };
    });

    const ok = rows.filter((row) => row.status === "ok");
    const between = (min: number, max: number) =>
      ok.filter((row) => row.position !== null && row.position >= min && row.position <= max).length;
    const distribution = {
      tracked: ok.length,
      top3: between(1, 3),
      top4to10: between(4, 10),
      top11to20: between(11, 20),
      top21to50: between(21, 50),
      outsideTop50: ok.filter((row) => row.position === null || row.position > 50).length,
      improved: ok.filter((row) => row.change === "improved" || row.change === "new").length,
      declined: ok.filter((row) => row.change === "declined" || row.change === "lost").length,
    };

    const average = (values: number[]) =>
      values.length ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 1) : null;
    const byLocation = latest.locations.map((location) => {
      const subset = ok.filter((row) => row.locationCode === location.code);
      const ranked = subset.filter((row) => row.position !== null).map((row) => row.position as number);
      return {
        locationCode: location.code,
        locationName: location.name,
        tracked: subset.length,
        top10: ranked.filter((position) => position <= 10).length,
        ranked: ranked.length,
        averagePosition: average(ranked),
      };
    });

    const competitorDomains = [...new Set(ok.flatMap((row) => Object.keys(row.competitors)))];
    const competitors = competitorDomains.map((domain) => {
      const positions = ok.map((row) => row.competitors[domain]).filter((value): value is number => typeof value === "number");
      return {
        domain,
        top10: positions.filter((position) => position <= 10).length,
        ranked: positions.length,
        averagePosition: average(positions),
        betterThanEnvod: ok.filter((row) => {
          const theirs = row.competitors[domain];
          return typeof theirs === "number" && (row.position === null || theirs < row.position);
        }).length,
      };
    });

    const { tasks: _tasks, results: _results, ...latestRun } = latest;
    return {
      latestRun,
      previousRun: previousSummary,
      runs: empty.runs,
      rows,
      distribution,
      byLocation,
      competitors,
      meta: this.serpMeta(
        latest.completedAt ?? latest.startedAt,
        latest.locations.length === 1 ? latest.locations[0].code : null,
        latest.locations.map((location) => location.name).join(", "),
        "en / ar (per keyword)",
        latest.device,
        latest.costUsd,
      ),
    };
  }
}

import { SearchConsoleApiError } from "./search-console-api";
import type {
  CostEstimate,
  DataForSeoOperationId,
  DataForSeoStatus,
  MarketLocation,
  OperationResult,
  RankHistoryResponse,
  RankRunSummary,
  TrackingConfig,
  UsageReport,
} from "./dataforseo-types";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const apiRoot = `${basePath}/api/search-console/dataforseo`;

/** Error from the private DataForSEO routes. 401 means the admin session expired (same as Search Console). */
export class DataForSeoApiError extends SearchConsoleApiError {
  constructor(
    message: string,
    status: number,
    readonly estimate: CostEstimate | null = null,
    readonly issues: string[] = [],
  ) {
    super(message, status);
    this.name = "DataForSeoApiError";
  }
}

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
    const value = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    throw new DataForSeoApiError(
      typeof value.error === "string" ? value.error : "The DataForSEO request could not be completed.",
      response.status,
      (value.estimate as CostEstimate | undefined) ?? null,
      Array.isArray(value.issues) ? (value.issues as string[]) : [],
    );
  }
  return body as T;
}

const post = <T,>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });

export interface LocationsResponse {
  retrievedAt: string;
  serpLocations: MarketLocation[];
  labsLocations: Array<{ code: number; name: string; languages: string[] }>;
}

export type LabsOperation = Exclude<DataForSeoOperationId, "serp_rank">;

export const dataForSeoApi = {
  status: (refresh = false) => request<DataForSeoStatus>(`/status${refresh ? "?refresh=1" : ""}`),
  usage: () => request<UsageReport>("/usage"),
  config: () => request<TrackingConfig>("/config"),
  saveConfig: (config: Pick<TrackingConfig, "keywords" | "competitors">) =>
    request<TrackingConfig>("/config", { method: "PUT", body: JSON.stringify(config) }),
  locations: (refresh = false) => request<LocationsResponse>(`/locations${refresh ? "?refresh=1" : ""}`),
  rankHistory: () => request<RankHistoryResponse>("/rank-history"),
  estimate: (operation: LabsOperation | "rank_check", params: unknown) =>
    post<CostEstimate>("/estimate", { operation, params }),
  run: <T,>(operation: LabsOperation, params: unknown, refresh = false) =>
    post<OperationResult<T>>("/run", { operation, params, refresh, confirm: true }),
  startRankCheck: (params: { locationCodes: number[]; device: "desktop" | "mobile"; keywords?: string[] }) =>
    post<{ run: RankRunSummary; estimate: CostEstimate }>("/rank-check/start", { ...params, confirm: true }),
  continueRankCheck: (runId: string) => post<RankRunSummary>(`/rank-check/${encodeURIComponent(runId)}/continue`, {}),
};

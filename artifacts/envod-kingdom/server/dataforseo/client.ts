/**
 * Minimal server-only DataForSEO v3 client.
 *
 * - Credentials come from DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD and are only
 *   ever placed in the Authorization header. They are never logged, returned
 *   or included in error messages.
 * - Every response is validated against DataForSEO's envelope
 *   (status_code 20000 = OK) and each task's own status_code.
 */

export const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3/";

type Fetcher = typeof fetch;

export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface DataForSeoTask<T = unknown> {
  id: string;
  status_code: number;
  status_message: string;
  cost: number;
  result_count: number;
  path: string[];
  data: Record<string, unknown>;
  result: T[] | null;
}

export interface DataForSeoEnvelope<T = unknown> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Array<DataForSeoTask<T>>;
}

export type DataForSeoErrorKind =
  | "not_configured"
  | "auth"
  | "payment"
  | "rate_limit"
  | "invalid_request"
  | "provider"
  | "network"
  | "timeout"
  | "malformed";

export class DataForSeoError extends Error {
  constructor(
    readonly kind: DataForSeoErrorKind,
    message: string,
    readonly statusCode: number | null = null,
    readonly httpStatus: number | null = null,
  ) {
    super(message);
    this.name = "DataForSeoError";
  }
}

export function readCredentials(env: NodeJS.ProcessEnv): DataForSeoCredentials | null {
  const login = env.DATAFORSEO_LOGIN?.trim();
  const password = env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) return null;
  return { login, password };
}

/** Task-level codes that mean "this one search failed, try again" (docs: appendix/errors). */
export const TRANSIENT_TASK_CODES = new Set([40101, 40103]);

/** Map DataForSEO status codes (docs: appendix/errors) to safe, actionable messages. */
export function describeStatus(code: number, providerMessage: string): DataForSeoError {
  const safeProviderMessage = providerMessage.replace(/[\r\n]+/g, " ").slice(0, 200);
  if (code === 40100) {
    return new DataForSeoError(
      "auth",
      `DataForSEO rejected the credentials (${code}). Check DATAFORSEO_LOGIN and the API password from app.dataforseo.com → API Access (not the account login password).`,
      code,
    );
  }
  if (code === 40104 || code === 40201) {
    return new DataForSeoError(
      "auth",
      code === 40104
        ? `DataForSEO requires account verification before API use (${code}). Complete it in the DataForSEO user panel.`
        : `DataForSEO has temporarily paused API access for this account (${code}). Contact DataForSEO support.`,
      code,
    );
  }
  if (code === 40106) {
    return new DataForSeoError(
      "provider",
      `DataForSEO returned only partial results for this search (${code}); unretrieved pages were not charged. Re-run later for a complete snapshot.`,
      code,
    );
  }
  if (TRANSIENT_TASK_CODES.has(code)) {
    // 40101 = internal search-engine error, 40103 = task execution failed: per task, retryable.
    return new DataForSeoError(
      "provider",
      `DataForSEO could not complete this search (${code}): ${safeProviderMessage}`,
      code,
    );
  }
  if (code === 40200 || code === 40210) {
    return new DataForSeoError(
      "payment",
      `DataForSEO reports insufficient funds or payment required (${code}). Top up the DataForSEO balance before running paid requests.`,
      code,
    );
  }
  if (code === 40203) {
    return new DataForSeoError(
      "payment",
      `The daily spend limit set in the DataForSEO dashboard has been reached (${code}).`,
      code,
    );
  }
  if (code === 40202 || code === 40209) {
    return new DataForSeoError(
      "rate_limit",
      `DataForSEO rate limit reached (${code}). Wait a minute and retry.`,
      code,
    );
  }
  if (code >= 40000 && code < 50000) {
    return new DataForSeoError(
      "invalid_request",
      `DataForSEO rejected the request (${code}): ${safeProviderMessage}`,
      code,
    );
  }
  return new DataForSeoError(
    "provider",
    `DataForSEO could not complete the request (${code}): ${safeProviderMessage}`,
    code,
  );
}

export class DataForSeoClient {
  private readonly authorization: string;

  constructor(
    credentials: DataForSeoCredentials,
    private readonly fetchImpl: Fetcher = fetch,
    private readonly baseUrl = DATAFORSEO_BASE_URL,
    private readonly timeoutMs = 60_000,
  ) {
    this.authorization = `Basic ${Buffer.from(
      `${credentials.login}:${credentials.password}`,
      "utf8",
    ).toString("base64")}`;
  }

  /** GET request (used for free endpoints such as appendix/user_data and locations). */
  get<T>(path: string): Promise<DataForSeoEnvelope<T>> {
    return this.request<T>("GET", path);
  }

  /** POST a single task. Live endpoints accept exactly one task per call. */
  post<T>(path: string, task: Record<string, unknown>): Promise<DataForSeoEnvelope<T>> {
    return this.request<T>("POST", path, [task]);
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<DataForSeoEnvelope<T>> {
    if (!/^[a-z0-9_/.-]+$/i.test(path) || path.includes("..")) {
      throw new DataForSeoError("invalid_request", "Unsupported DataForSEO endpoint path.");
    }
    const url = new URL(path.replace(/^\/+/, ""), this.baseUrl);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: this.authorization,
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new DataForSeoError("timeout", "DataForSEO did not respond in time. Retry later.");
      }
      throw new DataForSeoError("network", "DataForSEO could not be reached from the server.");
    }

    if (response.status === 401) {
      throw new DataForSeoError(
        "auth",
        "DataForSEO rejected the credentials (HTTP 401). Check DATAFORSEO_LOGIN and the API password.",
        40100,
        401,
      );
    }
    if (response.status === 402) {
      throw new DataForSeoError("payment", "DataForSEO requires payment (HTTP 402). Top up the balance.", 40200, 402);
    }
    if (response.status === 429) {
      throw new DataForSeoError("rate_limit", "DataForSEO rate limit reached (HTTP 429). Retry shortly.", 40202, 429);
    }

    let envelope: DataForSeoEnvelope<T>;
    try {
      envelope = (await response.json()) as DataForSeoEnvelope<T>;
    } catch {
      throw new DataForSeoError(
        "malformed",
        `DataForSEO returned an unreadable response (HTTP ${response.status}).`,
        null,
        response.status,
      );
    }
    if (!envelope || typeof envelope.status_code !== "number" || !Array.isArray(envelope.tasks)) {
      throw new DataForSeoError(
        "malformed",
        `DataForSEO returned an unexpected response shape (HTTP ${response.status}).`,
        null,
        response.status,
      );
    }
    if (envelope.status_code !== 20000) {
      const error = describeStatus(envelope.status_code, String(envelope.status_message ?? ""));
      throw new DataForSeoError(error.kind, error.message, envelope.status_code, response.status);
    }
    return envelope;
  }
}

/** Return the first task, throwing a safe error if the task itself failed. */
export function firstTask<T>(envelope: DataForSeoEnvelope<T>): DataForSeoTask<T> {
  const task = envelope.tasks[0];
  if (!task) {
    throw new DataForSeoError("malformed", "DataForSEO returned no task in the response.");
  }
  if (task.status_code !== 20000) {
    throw describeStatus(task.status_code, String(task.status_message ?? ""));
  }
  return task;
}

/** Total cost reported by DataForSEO for an envelope (USD). */
export function envelopeCost(envelope: DataForSeoEnvelope<unknown>): number {
  const cost = Number(envelope.cost);
  return Number.isFinite(cost) && cost >= 0 ? cost : 0;
}

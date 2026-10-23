export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  scope?: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  email: string;
  email_verified: boolean;
}

export interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
  startRow?: number;
}

export interface SearchAnalyticsRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export class GoogleApiError extends Error {
  constructor(
    readonly status: number,
    readonly kind: "oauth" | "search_console" | "inspection",
  ) {
    super("google_api_request_failed");
    this.name = "GoogleApiError";
  }
}

type Fetcher = typeof fetch;

async function jsonOrNull(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTokenResponse(value: unknown): value is GoogleTokenResponse {
  return (
    isRecord(value) &&
    typeof value.access_token === "string" &&
    typeof value.expires_in === "number" &&
    typeof value.token_type === "string"
  );
}

export async function exchangeAuthorizationCode(options: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetchImpl?: Fetcher;
}): Promise<GoogleTokenResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const form = new URLSearchParams({
    code: options.code,
    code_verifier: options.codeVerifier,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: options.redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });
  const body = await jsonOrNull(response);
  if (!response.ok || !isTokenResponse(body)) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return body;
}

export async function refreshGoogleAccessToken(options: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  fetchImpl?: Fetcher;
}): Promise<GoogleTokenResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const form = new URLSearchParams({
    refresh_token: options.refreshToken,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    grant_type: "refresh_token",
  });
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });
  const body = await jsonOrNull(response);
  if (!response.ok || !isTokenResponse(body)) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return body;
}

export async function fetchGoogleUserInfo(
  accessToken: string,
  fetchImpl: Fetcher = fetch,
): Promise<GoogleUserInfo> {
  const response = await fetchImpl(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const body = await jsonOrNull(response);
  if (
    !response.ok ||
    !isRecord(body) ||
    typeof body.email !== "string" ||
    body.email_verified !== true
  ) {
    throw new GoogleApiError(response.status, "oauth");
  }
  return { email: body.email, email_verified: true };
}

export class SearchConsoleClient {
  constructor(private readonly fetchImpl: Fetcher = fetch) {}

  async listSites(accessToken: string): Promise<SearchConsoleSite[]> {
    const response = await this.fetchImpl(
      "https://searchconsole.googleapis.com/webmasters/v3/sites",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(15_000),
      },
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "search_console");
    }
    const sites =
      isRecord(body) && Array.isArray(body.siteEntry) ? body.siteEntry : [];
    return sites.flatMap((entry) => {
      if (
        !isRecord(entry) ||
        typeof entry.siteUrl !== "string" ||
        typeof entry.permissionLevel !== "string"
      ) {
        return [];
      }
      return [
        { siteUrl: entry.siteUrl, permissionLevel: entry.permissionLevel },
      ];
    });
  }

  async query(
    accessToken: string,
    siteUrl: string,
    query: SearchAnalyticsQuery,
  ): Promise<SearchAnalyticsRow[]> {
    const response = await this.fetchImpl(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...query,
          searchType: "web",
          aggregationType: "auto",
          rowLimit: Math.min(Math.max(query.rowLimit ?? 25_000, 1), 25_000),
          startRow: Math.max(query.startRow ?? 0, 0),
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "search_console");
    }
    const rows = isRecord(body) && Array.isArray(body.rows) ? body.rows : [];
    return rows.flatMap((row) => {
      if (
        !isRecord(row) ||
        typeof row.clicks !== "number" ||
        typeof row.impressions !== "number" ||
        typeof row.ctr !== "number" ||
        typeof row.position !== "number"
      ) {
        return [];
      }
      return [
        {
          keys: Array.isArray(row.keys)
            ? row.keys.filter((key): key is string => typeof key === "string")
            : [],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      ];
    });
  }

  async inspectUrl(
    accessToken: string,
    siteUrl: string,
    inspectionUrl: string,
  ): Promise<unknown> {
    const response = await this.fetchImpl(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl,
          languageCode: "en-US",
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );
    const body = await jsonOrNull(response);
    if (!response.ok) {
      throw new GoogleApiError(response.status, "inspection");
    }
    return body;
  }
}

export async function revokeGoogleToken(
  token: string,
  fetchImpl: Fetcher = fetch,
): Promise<boolean> {
  const response = await fetchImpl("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
    signal: AbortSignal.timeout(10_000),
  });
  return response.ok || response.status === 400;
}

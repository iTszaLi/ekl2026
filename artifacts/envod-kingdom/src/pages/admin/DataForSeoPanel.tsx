import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, PlugZap, RefreshCw, Save, Unplug } from "lucide-react";
import "./DataForSeoPanel.css";
import { dataForSeoApi, DataForSeoApiError, type LabsOperation, type LocationsResponse } from "@/lib/dataforseo-api";
import type {
  CompetitorRow,
  CostEstimate,
  DataForSeoStatus,
  DataSourceMeta,
  DomainOverviewRow,
  KeywordMetricsRow,
  MarketLocation,
  PositionDistribution,
  RankHistoryResponse,
  TrackingConfig,
  UsageReport,
} from "@/lib/dataforseo-types";

const MARKETS = [
  { code: 2682, name: "Saudi Arabia" },
  { code: 2784, name: "United Arab Emirates" },
  { code: 2048, name: "Bahrain" },
  { code: 2414, name: "Kuwait" },
  { code: 2634, name: "Qatar" },
  { code: 2512, name: "Oman" },
];

const usd = (value: number | null | undefined, digits = 4) =>
  value === null || value === undefined ? "—" : `$${value.toFixed(digits)}`;
const n = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : new Intl.NumberFormat("en").format(value);
const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

function errorText(error: unknown): string {
  if (error instanceof DataForSeoApiError) {
    return error.issues.length ? `${error.message} ${error.issues.join("; ")}` : error.message;
  }
  return "The DataForSEO request could not be completed.";
}

function SourceLine({ meta }: { meta: DataSourceMeta | null }) {
  if (!meta) return null;
  return (
    <div className="dfs-meta" data-testid="dfs-source">
      <span><b>Source:</b> {meta.source}</span>
      <span><b>Retrieved:</b> {when(meta.retrievedAt)}{meta.cached ? " (cached — no charge)" : ""}</span>
      <span><b>Location:</b> {meta.locationName ?? meta.locationCode ?? "—"}</span>
      <span><b>Language:</b> {meta.languageCode ?? "—"}</span>
      {meta.device && <span><b>Device:</b> {meta.device}</span>}
      <span><b>Cost:</b> {usd(meta.costUsd)}</span>
      {meta.notes.map((note) => <span className="dfs-note" key={note}>{note}</span>)}
    </div>
  );
}

function Card({ eyebrow, title, detail, children, actions }: { eyebrow: string; title: string; detail?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="sc-card dfs-card">
      <header className="sc-card-head">
        <div><span className="sc-eyebrow">{eyebrow}</span><h2>{title}</h2>{detail && <p>{detail}</p>}</div>
        {actions && <div className="dfs-actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

function Spark({ points }: { points: Array<{ position: number | null }> }) {
  const values = points.map((point) => point.position);
  if (values.filter((value) => value !== null).length < 2) return <span className="dfs-muted">—</span>;
  const width = 90;
  const height = 24;
  const max = 51;
  const step = width / Math.max(1, values.length - 1);
  const path = values
    .map((value, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)},${(((value ?? max) - 1) / (max - 1) * height).toFixed(1)}`)
    .join(" ");
  return <svg className="dfs-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Position trend (higher line = better position)"><path d={path} /></svg>;
}

function Distribution({ value }: { value: PositionDistribution | null }) {
  if (!value) return <span className="dfs-muted">No data returned</span>;
  return <>{n(value.pos_1)} / {n(value.pos_2_3)} / {n(value.pos_4_10)} / {n(value.pos_11_20)} / {n(value.pos_21_30 + value.pos_31_40 + value.pos_41_50)} / {n(value.pos_51_100)}</>;
}

function KeywordTable({ rows, showRank = false }: { rows: KeywordMetricsRow[]; showRank?: boolean }) {
  if (!rows.length) return <p className="dfs-muted">DataForSEO returned no keywords for this request.</p>;
  return (
    <div className="sc-table-scroll"><table><thead><tr>
      <th>Keyword</th>{showRank && <th>Position</th>}{showRank && <th>Ranked URL</th>}<th>Search volume</th><th>KD</th><th>Competition</th><th>CPC</th><th>Intent</th><th>SERP features</th>
    </tr></thead><tbody>{rows.map((row) => <tr key={row.keyword + (row.rankedUrl ?? "")}>
      <td dir="auto">{row.keyword}</td>
      {showRank && <td>{row.rankGroup ?? "—"}</td>}
      {showRank && <td className="sc-url-cell">{row.rankedUrl ?? "—"}</td>}
      <td>{n(row.searchVolume)}</td><td>{n(row.keywordDifficulty)}</td>
      <td>{row.competitionLevel ?? (row.competition === null ? "—" : row.competition.toFixed(2))}</td>
      <td>{usd(row.cpcUsd, 2)}</td><td>{row.mainIntent ?? "—"}</td><td>{row.serpFeatures.join(", ") || "—"}</td>
    </tr>)}</tbody></table></div>
  );
}

interface ToolProps<T> {
  eyebrow: string;
  title: string;
  detail: string;
  operation: LabsOperation;
  params: unknown;
  controls?: ReactNode;
  render: (data: T) => ReactNode;
  onUnauthorized: (error: unknown) => void;
  onSpent: () => void;
  disabled: boolean;
}

function LabsTool<T>({ eyebrow, title, detail, operation, params, controls, render, onUnauthorized, onSpent, disabled }: ToolProps<T>) {
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [result, setResult] = useState<{ meta: DataSourceMeta; data: T } | null>(null);
  const [busy, setBusy] = useState<"estimate" | "run" | null>(null);
  const [error, setError] = useState("");
  const paramsKey = JSON.stringify(params);
  useEffect(() => { setEstimate(null); }, [paramsKey]);

  const fail = (caught: unknown) => {
    if (caught instanceof DataForSeoApiError && caught.status === 401) { onUnauthorized(caught); return; }
    setError(errorText(caught));
  };
  const doEstimate = async () => {
    setBusy("estimate"); setError("");
    try { setEstimate(await dataForSeoApi.estimate(operation, params)); } catch (caught) { fail(caught); } finally { setBusy(null); }
  };
  const doRun = async () => {
    setBusy("run"); setError("");
    try { const response = await dataForSeoApi.run<T>(operation, params); setResult(response); setEstimate(null); onSpent(); } catch (caught) { fail(caught); } finally { setBusy(null); }
  };

  return (
    <Card eyebrow={eyebrow} title={title} detail={detail}>
      <div className="dfs-toolbar">
        {controls}
        <button className="sc-button sc-button-outline" onClick={() => void doEstimate()} disabled={disabled || !!busy}>{busy === "estimate" ? <LoaderCircle size={14} className="sc-spin" /> : null} Estimate cost</button>
        {estimate && <span className={estimate.withinBudget ? "dfs-estimate" : "dfs-estimate dfs-bad"}>
          {estimate.cachedRequests ? "Cached — no charge" : `≈ ${usd(estimate.estimatedUsd)} (${estimate.basis})`}{!estimate.withinBudget && " — exceeds remaining monthly budget"}
        </span>}
        {estimate && estimate.withinBudget && <button className="sc-button sc-button-primary" onClick={() => void doRun()} disabled={!!busy} data-testid={`dfs-run-${operation}`}>{busy === "run" ? <LoaderCircle size={14} className="sc-spin" /> : null} Confirm &amp; run</button>}
      </div>
      {error && <div className="sc-alert sc-alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
      {result ? <>{render(result.data)}<SourceLine meta={result.meta} /></> : <p className="dfs-muted">Not run yet. Estimate first; nothing is charged until you confirm.</p>}
    </Card>
  );
}

function parseKeywordLines(text: string): TrackingConfig["keywords"] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [language, keyword, targetUrl, service] = line.split("|").map((part) => part.trim());
    return { language: language === "ar" ? "ar" : "en", keyword: keyword ?? "", targetUrl: targetUrl || "/", service: service || "General" };
  });
}

export default function DataForSeoPanel({ onUnauthorized }: { onUnauthorized: (error: unknown) => void }) {
  const [status, setStatus] = useState<DataForSeoStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [history, setHistory] = useState<RankHistoryResponse | null>(null);
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [locations, setLocations] = useState<LocationsResponse | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([2682]);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [rankEstimate, setRankEstimate] = useState<CostEstimate | null>(null);
  const [rankProgress, setRankProgress] = useState<string>("");
  const [rankBusy, setRankBusy] = useState(false);
  const [error, setError] = useState("");
  const [keywordText, setKeywordText] = useState("");
  const [market, setMarket] = useState(2682);
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [seed, setSeed] = useState("exhibition logistics");

  const fail = useCallback((caught: unknown) => {
    if (caught instanceof DataForSeoApiError && caught.status === 401) { onUnauthorized(caught); return; }
    setError(errorText(caught));
  }, [onUnauthorized]);

  const loadStatus = useCallback(async (refresh = false) => {
    setChecking(true);
    try { setStatus(await dataForSeoApi.status(refresh)); } catch (caught) { fail(caught); } finally { setChecking(false); }
  }, [fail]);
  const loadUsage = useCallback(async () => { try { setUsage(await dataForSeoApi.usage()); } catch (caught) { fail(caught); } }, [fail]);
  const loadHistory = useCallback(async () => { try { setHistory(await dataForSeoApi.rankHistory()); } catch (caught) { fail(caught); } }, [fail]);

  useEffect(() => {
    void loadStatus();
    void (async () => {
      try {
        const loaded = await dataForSeoApi.config();
        setConfig(loaded);
        setKeywordText(loaded.keywords.map((row) => `${row.language} | ${row.keyword} | ${row.targetUrl} | ${row.service}`).join("\n"));
      } catch (caught) { fail(caught); }
    })();
    void loadHistory();
    void loadUsage();
  }, [fail, loadHistory, loadStatus, loadUsage]);

  const connected = !!status?.connected;
  const spent = useCallback(() => { void loadUsage(); void loadStatus(true); }, [loadStatus, loadUsage]);

  const locationOptions: MarketLocation[] = useMemo(() => {
    const base: MarketLocation[] = [{ code: 2682, name: "Saudi Arabia", type: "Country", countryIso: "SA" }];
    return [...base, ...(locations?.serpLocations ?? []).filter((location) => location.code !== 2682)];
  }, [locations]);

  const loadLocations = async (refresh = false) => {
    setError("");
    try { setLocations(await dataForSeoApi.locations(refresh)); } catch (caught) { fail(caught); }
  };

  const estimateRank = async () => {
    setError("");
    try { setRankEstimate(await dataForSeoApi.estimate("rank_check", { locationCodes: selectedLocations, device })); } catch (caught) { fail(caught); }
  };

  const runRankCheck = async () => {
    setRankBusy(true); setError("");
    try {
      const { run } = await dataForSeoApi.startRankCheck({ locationCodes: selectedLocations, device });
      let summary = run;
      setRankProgress(`0 / ${summary.totalTasks}`);
      while (!summary.completedAt) {
        summary = await dataForSeoApi.continueRankCheck(summary.id);
        setRankProgress(`${summary.completedTasks} / ${summary.totalTasks} · ${usd(summary.costUsd)}`);
      }
      setRankEstimate(null);
      await loadHistory();
      spent();
    } catch (caught) { fail(caught); } finally { setRankBusy(false); }
  };

  const saveKeywords = async () => {
    if (!config) return;
    setError("");
    try {
      const saved = await dataForSeoApi.saveConfig({ keywords: parseKeywordLines(keywordText), competitors: config.competitors });
      setConfig(saved);
    } catch (caught) { fail(caught); }
  };

  const activeCompetitors = (config?.competitors ?? []).filter((competitor) => competitor.domain && competitor.verification !== "unconfirmed").map((competitor) => competitor.domain as string);
  const opportunities = (history?.rows ?? []).filter((row) => row.status === "ok" && row.position !== null && row.position >= 11 && row.position <= 50);
  const notRanking = (history?.rows ?? []).filter((row) => row.status === "ok" && row.position === null);
  const dist = history?.distribution;

  return (
    <div className="dfs-panel" data-testid="panel-dataforseo">
      <Card
        eyebrow="DATAFORSEO API"
        title="Connection"
        detail="Server-side connection to your DataForSEO account. Credentials stay in the server environment and are never sent to the browser."
        actions={<button className="sc-button sc-button-outline" onClick={() => void loadStatus(true)} disabled={checking}><RefreshCw size={14} className={checking ? "sc-spin" : ""} /> Re-check</button>}
      >
        <div className="dfs-status-row">
          <span className={connected ? "dfs-pill dfs-pill-ok" : "dfs-pill dfs-pill-bad"} data-testid="dfs-connection-status">
            {connected ? <CheckCircle2 size={14} /> : <Unplug size={14} />} {status ? (connected ? "Connected" : "Not Connected") : "Checking…"}
          </span>
          {status?.account && <span><b>Balance:</b> {usd(status.account.balanceUsd, 2)}</span>}
          {status && <span><b>This month:</b> {usd(status.budget.spentUsd)} of {usd(status.budget.monthlyBudgetUsd, 2)} budget ({status.budget.paidRequests} paid requests)</span>}
          {status && <span><b>Storage:</b> {status.storage}</span>}
          {status && <span><b>Checked:</b> {when(status.checkedAt)}</span>}
        </div>
        {status?.error && <div className="sc-alert sc-alert-error" role="alert"><AlertCircle size={16} /><span>{status.error}</span></div>}
        <p className="dfs-muted">Connection check uses DataForSEO's free <code>appendix/user_data</code> endpoint. Paid requests always show an estimate first and stop at the monthly budget cap (<code>DATAFORSEO_MONTHLY_BUDGET_USD</code>).</p>
      </Card>

      {error && <div className="sc-alert sc-alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span><button className="sc-alert-close" onClick={() => setError("")}>Dismiss</button></div>}

      <Card eyebrow="RANK TRACKING · GOOGLE ORGANIC" title="Tracked keyword positions" detail={`${config?.keywords.length ?? 0} tracked keywords for envodkingdom.net. Each check captures live Google results to depth 50 per keyword and location.`}>
        <div className="dfs-toolbar">
          <fieldset className="dfs-locations"><legend>Locations</legend>
            {locationOptions.map((location) => <label key={location.code}><input type="checkbox" checked={selectedLocations.includes(location.code)} onChange={(event) => { setRankEstimate(null); setSelectedLocations((current) => event.target.checked ? [...current, location.code] : current.filter((code) => code !== location.code)); }} /> {location.name.split(",")[0]}</label>)}
            <button className="sc-button sc-button-outline" onClick={() => void loadLocations(false)} disabled={!connected}>Load KSA city locations (free)</button>
          </fieldset>
          <label>Device <select value={device} onChange={(event) => { setRankEstimate(null); setDevice(event.target.value as "desktop" | "mobile"); }}><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select></label>
          <button className="sc-button sc-button-outline" onClick={() => void estimateRank()} disabled={!connected || rankBusy || !selectedLocations.length}>Estimate cost</button>
          {rankEstimate && <span className={rankEstimate.withinBudget ? "dfs-estimate" : "dfs-estimate dfs-bad"}>≈ {usd(rankEstimate.estimatedUsd)} for {rankEstimate.requests} SERP requests{!rankEstimate.withinBudget && " — exceeds remaining monthly budget"}</span>}
          {rankEstimate?.withinBudget && <button className="sc-button sc-button-primary" onClick={() => void runRankCheck()} disabled={rankBusy} data-testid="dfs-run-rank-check">{rankBusy ? <LoaderCircle size={14} className="sc-spin" /> : <PlugZap size={14} />} Confirm &amp; run rank check</button>}
          {rankProgress && <span className="dfs-muted">Progress: {rankProgress}</span>}
        </div>

        <div className="dfs-buckets" data-testid="dfs-distribution">
          {([
            ["Tracked", dist?.tracked], ["Positions 1–3", dist?.top3], ["Positions 4–10", dist?.top4to10], ["Positions 11–20", dist?.top11to20],
            ["Positions 21–50", dist?.top21to50], ["Outside top 50", dist?.outsideTop50], ["Not found (unconfirmed)", dist?.notFoundUnconfirmed], ["Improved", dist?.improved], ["Declined", dist?.declined],
          ] as const).map(([label, value]) => <div className="sc-metric" key={label}><span className="sc-metric-label">{label}</span><strong>{history?.latestRun ? n(value ?? 0) : "—"}</strong></div>)}
        </div>

        {history?.latestRun ? <>
          <div className="sc-table-scroll"><table><thead><tr><th>Keyword</th><th>Location</th><th>Position</th><th>Previous</th><th>Change</th><th>Trend</th><th>Ranked URL</th><th>Target page</th><th>Best competitor</th><th>SERP features</th></tr></thead>
            <tbody>{history.rows.map((row) => {
              const best = Object.entries(row.competitors).filter(([, position]) => position !== null).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
              return <tr key={`${row.keyword}-${row.locationCode}`}>
                <td dir="auto">{row.keyword}<small className="dfs-muted"> · {row.language}</small></td>
                <td>{row.locationName.split(",")[0]}</td>
                <td>{row.status === "error" ? <span className="dfs-bad" title={row.error ?? ""}>Error</span> : row.position ?? (row.positionUnconfirmed ? <span title={row.positionNote ?? ""}>Not found*</span> : `> ${row.depth}`)}</td>
                <td>{row.previousPosition ?? "—"}</td>
                <td className={row.change === "improved" || row.change === "new" ? "sc-good" : row.change === "declined" || row.change === "lost" ? "dfs-bad" : ""}>{row.change.replace("_", " ")}{row.delta ? ` (${row.delta > 0 ? "+" : ""}${row.delta})` : ""}</td>
                <td><Spark points={row.series} /></td>
                <td className="sc-url-cell">{row.rankedUrl ?? "—"}</td>
                <td>{row.targetUrl}</td>
                <td>{best ? `${best[0]} #${best[1]}` : "—"}</td>
                <td>{row.serpFeatures.filter((feature) => feature !== "organic").join(", ") || "—"}</td>
              </tr>;
            })}</tbody></table></div>
          {history.rows.some((row) => row.positionUnconfirmed) && <p className="dfs-muted">* Not found among the readable results, but Google returned some results as redirect links whose destination could not be read, so “not in the top 50” is not fully confirmed. Hover for details.</p>}
          <SourceLine meta={history.meta} />
        </> : <p className="dfs-muted">No rank check has been run yet. Rankings appear here only after a real DataForSEO request.</p>}
      </Card>

      {history?.latestRun && <div className="dfs-two">
        <Card eyebrow="LOCAL VISIBILITY" title="By country and city">
          <div className="sc-table-scroll"><table><thead><tr><th>Location</th><th>Tracked</th><th>Ranked (top 50)</th><th>Top 10</th><th>Avg. position</th></tr></thead>
            <tbody>{history.byLocation.map((row) => <tr key={row.locationCode}><td>{row.locationName}</td><td>{row.tracked}</td><td>{row.ranked}</td><td>{row.top10}</td><td>{row.averagePosition ?? "—"}</td></tr>)}</tbody></table></div>
        </Card>
        <Card eyebrow="COMPETITORS ON TRACKED KEYWORDS" title="Competitor comparison" detail="From the same SERP snapshots. Only verified/likely competitor domains are matched.">
          <div className="sc-table-scroll"><table><thead><tr><th>Domain</th><th>Ranked</th><th>Top 10</th><th>Avg. position</th><th>Outranks ENVOD</th></tr></thead>
            <tbody>{history.competitors.map((row) => <tr key={row.domain}><td>{row.domain}</td><td>{row.ranked}</td><td>{row.top10}</td><td>{row.averagePosition ?? "—"}</td><td>{row.betterThanEnvod}</td></tr>)}</tbody></table></div>
        </Card>
      </div>}

      {history?.latestRun && <Card eyebrow="OPPORTUNITIES" title="Keyword opportunities from the latest rank check" detail="Striking distance = ENVOD ranks 11–50; improving the target page may move it onto page one. Not found = no ENVOD URL among the top-50 results that could be read (* = some results were unreadable Google redirect links).">
        <div className="dfs-two">
          <div><h3>Striking distance ({opportunities.length})</h3><ul className="dfs-list">{opportunities.map((row) => <li key={row.keyword + row.locationCode} dir="auto">{row.keyword} — #{row.position} in {row.locationName.split(",")[0]} → {row.targetUrl}</li>)}</ul></div>
          <div><h3>Not found in top 50 ({notRanking.length})</h3><ul className="dfs-list">{notRanking.map((row) => <li key={row.keyword + row.locationCode} dir="auto">{row.keyword}{row.positionUnconfirmed ? "*" : ""} ({row.locationName.split(",")[0]}) → {row.targetUrl}</li>)}</ul></div>
        </div>
      </Card>}

      <div className="dfs-toolbar dfs-market-bar">
        <label>Market <select value={market} onChange={(event) => setMarket(Number(event.target.value))}>{MARKETS.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}</select></label>
        <label>Language <select value={language} onChange={(event) => setLanguage(event.target.value as "en" | "ar")}><option value="en">English</option><option value="ar">Arabic</option></select></label>
        <span className="dfs-muted">Applies to the DataForSEO Labs tools below (country-level only; Labs does not support city locations).</span>
      </div>

      <LabsTool<{ totalCount: number | null; distribution: PositionDistribution | null; keywords: KeywordMetricsRow[] }>
        eyebrow="WEBSITE VISIBILITY · DATAFORSEO LABS" title="Keywords envodkingdom.net ranks for" detail="DataForSEO's database of Google rankings for the domain (estimate; refreshed by DataForSEO every 30–90 days)."
        operation="ranked_keywords" params={{ target: "envodkingdom.net", locationCode: market, languageCode: language, limit: 100 }}
        disabled={!connected} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(data) => <>
          <p><b>Total ranked keywords:</b> {n(data.totalCount)} · <b>Distribution (1 / 2–3 / 4–10 / 11–20 / 21–50 / 51–100):</b> <Distribution value={data.distribution} /> · <b>Estimated traffic (ETV):</b> {n(data.distribution?.estimatedTraffic ?? null)}</p>
          <KeywordTable rows={data.keywords} showRank />
        </>}
      />

      <LabsTool<DomainOverviewRow[]>
        eyebrow="COMPETITOR VISIBILITY · DATAFORSEO LABS" title="ENVOD vs competitor domains" detail={`Domain rank overview for envodkingdom.net and ${activeCompetitors.length} competitor domains.`}
        operation="domain_overview" params={{ targets: ["envodkingdom.net", ...activeCompetitors].slice(0, 10), locationCode: market, languageCode: language }}
        disabled={!connected} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(rows) => <div className="sc-table-scroll"><table><thead><tr><th>Domain</th><th>Organic keywords</th><th>Pos 1</th><th>2–3</th><th>4–10</th><th>11–20</th><th>21–50</th><th>Est. traffic (ETV)</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.domain}><td>{row.domain}</td><td>{n(row.organic?.count)}</td><td>{n(row.organic?.pos_1)}</td><td>{n(row.organic?.pos_2_3)}</td><td>{n(row.organic?.pos_4_10)}</td><td>{n(row.organic?.pos_11_20)}</td><td>{row.organic ? n(row.organic.pos_21_30 + row.organic.pos_31_40 + row.organic.pos_41_50) : "—"}</td><td>{n(row.organic?.estimatedTraffic)}</td></tr>)}</tbody></table></div>}
      />

      <LabsTool<CompetitorRow[]>
        eyebrow="ORGANIC COMPETITORS · DATAFORSEO LABS" title="Domains competing for ENVOD's keywords" detail="Domains that rank for the same keywords as envodkingdom.net (large global sites excluded)."
        operation="competitors_domain" params={{ target: "envodkingdom.net", locationCode: market, languageCode: language, limit: 20 }}
        disabled={!connected} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(rows) => <div className="sc-table-scroll"><table><thead><tr><th>Domain</th><th>Shared keywords</th><th>Avg. position</th><th>Organic keywords</th><th>Est. traffic</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.domain}><td>{row.domain}</td><td>{n(row.intersections)}</td><td>{row.avgPosition?.toFixed(1) ?? "—"}</td><td>{n(row.organicKeywords)}</td><td>{n(row.estimatedTraffic)}</td></tr>)}</tbody></table></div>}
      />

      <LabsTool<{ keywords: KeywordMetricsRow[] }>
        eyebrow="SEARCH VOLUME · DATAFORSEO LABS" title="Metrics for tracked keywords" detail="Search volume, keyword difficulty, competition, CPC and intent for the tracked keywords in the selected language."
        operation="keyword_overview" params={{ keywords: (config?.keywords ?? []).filter((row) => row.language === language).map((row) => row.keyword).slice(0, 200), locationCode: market, languageCode: language }}
        disabled={!connected || !(config?.keywords ?? []).some((row) => row.language === language)} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(data) => <KeywordTable rows={data.keywords} />}
      />

      <LabsTool<{ keywords: KeywordMetricsRow[] }>
        eyebrow="KEYWORD RESEARCH · DATAFORSEO LABS" title="Suggestions for a seed keyword" detail="Long-tail keywords containing the seed, with measured metrics."
        operation="keyword_suggestions" params={{ keyword: seed, locationCode: market, languageCode: language, limit: 50 }}
        controls={<label>Seed <input className="dfs-input" value={seed} onChange={(event) => setSeed(event.target.value)} dir="auto" maxLength={80} /></label>}
        disabled={!connected || !seed.trim()} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(data) => <KeywordTable rows={data.keywords} />}
      />

      <LabsTool<{ keywords: KeywordMetricsRow[] }>
        eyebrow="KEYWORD RESEARCH · DATAFORSEO LABS" title="Related keywords (Google “searches related to”)" detail="Related searches for the same seed keyword."
        operation="related_keywords" params={{ keyword: seed, locationCode: market, languageCode: language, limit: 50 }}
        disabled={!connected || !seed.trim()} onUnauthorized={onUnauthorized} onSpent={spent}
        render={(data) => <KeywordTable rows={data.keywords} />}
      />

      <div className="dfs-two">
        <Card eyebrow="CONFIGURATION" title="Tracked keywords" detail="One per line: language | keyword | target URL | service. Saved to private storage; no API call."
          actions={<button className="sc-button sc-button-outline" onClick={() => void saveKeywords()} disabled={!config}><Save size={14} /> Save</button>}>
          <textarea className="dfs-textarea" value={keywordText} onChange={(event) => setKeywordText(event.target.value)} dir="auto" rows={14} spellCheck={false} />
          {config?.updatedAt && <p className="dfs-muted">Last saved {when(config.updatedAt)}</p>}
        </Card>
        <Card eyebrow="CONFIGURATION" title="Competitor domains" detail="Unconfirmed competitors are never queried until the owner supplies the official domain.">
          <div className="sc-table-scroll"><table><thead><tr><th>Competitor</th><th>Domain</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>{(config?.competitors ?? []).map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.domain ?? "—"}</td><td className={row.verification === "verified" ? "sc-good" : row.verification === "unconfirmed" ? "dfs-bad" : ""}>{row.verification}</td><td>{row.note}</td></tr>)}</tbody></table></div>
        </Card>
      </div>

      <Card eyebrow="API USAGE" title="DataForSEO spend this month" detail="Actual costs reported by DataForSEO for each paid request. Cached and free requests are not charged."
        actions={<button className="sc-button sc-button-outline" onClick={() => void loadUsage()}><RefreshCw size={14} /> Refresh</button>}>
        {usage ? <>
          <p><b>{usage.month}:</b> {usd(usage.spentUsd)} of {usd(usage.monthlyBudgetUsd, 2)} · {usage.paidRequests} paid requests · remaining {usd(usage.remainingUsd)}</p>
          <div className="sc-table-scroll"><table><thead><tr><th>Time</th><th>Operation</th><th>Estimated</th><th>Actual</th><th>Status</th></tr></thead>
            <tbody>{usage.recent.map((entry, index) => <tr key={entry.at + index}><td>{when(entry.at)}</td><td>{entry.operation}</td><td>{usd(entry.estimatedUsd)}</td><td>{usd(entry.actualUsd)}</td><td>{entry.ok ? "OK" : entry.statusCode}</td></tr>)}</tbody></table></div>
        </> : <p className="dfs-muted">Loading usage…</p>}
      </Card>
    </div>
  );
}

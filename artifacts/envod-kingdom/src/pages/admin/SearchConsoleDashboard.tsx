import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, Check,
  ChevronDown, CircleHelp, Download, ExternalLink, FileSearch,
  Globe2, LoaderCircle, LogOut, Moon, Printer, RefreshCw, Search,
  Settings2, ShieldCheck, Sun, Unplug, X,
} from "lucide-react";
import {
  SearchConsoleApiError, searchConsoleApi,
  type AuditedPage, type SearchConsoleDashboard as DashboardData,
  type SearchQueryPageRow,
  type SearchConsoleProperty, type SearchConsoleStatus, type SiteAudit,
  type UrlInspection,
} from "@/lib/search-console-api";
import SeoResearchPanel from "@/pages/admin/SeoResearchPanel";
import "./SearchConsoleDashboard.css";

type DatePreset = "7" | "28" | "90" | "180" | "365" | "custom";
type PageState = "loading" | "signed-out" | "unconfigured" | "unconnected" | "connected" | "error";
type SectionKey = "queries" | "pages" | "countries" | "devices" | "appearances";

const PERIODS = [
  { label: "7 days", value: "7" as const },
  { label: "28 days", value: "28" as const },
  { label: "3 months", value: "90" as const },
  { label: "6 months", value: "180" as const },
  { label: "12 months", value: "365" as const },
];
const AUTO_OPTIONS = [
  { label: "5 minutes", ms: 5 * 60_000 },
  { label: "15 minutes", ms: 15 * 60_000 },
  { label: "1 hour", ms: 60 * 60_000 },
];
const TABLES: { key: SectionKey; title: string; description: string }[] = [
  { key: "queries", title: "Search queries", description: "Queries that surfaced this property in Google Search." },
  { key: "pages", title: "Top pages", description: "Landing pages receiving organic search activity." },
  { key: "countries", title: "Countries", description: "Search performance by the reporting country." },
  { key: "devices", title: "Devices", description: "Search performance by device category." },
  { key: "appearances", title: "Search appearance", description: "Search-result appearance types reported by Google." },
];

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function rangeFor(days: number): { start: string; end: string } {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return { start: isoDate(start), end: isoDate(end) };
}
function fmtNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
function fmtCtr(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 }).format(value);
}
function fmtPosition(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}
function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(quote).join(","), ...rows.map((row) => headers.map((key) => quote(row[key])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}
function TrendChart({ data, onExport }: { data: DashboardData["timeSeries"]; onExport: () => void }) {
  const points = data.map((point) => point.clicks);
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const width = 900, height = 240, padX = 14, padY = 22;
  const coords = points.map((value, index) => ({
    x: padX + (points.length <= 1 ? 0 : index * (width - padX * 2) / (points.length - 1)),
    y: height - padY - ((value - min) / Math.max(1, max - min)) * (height - padY * 2),
  }));
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = coords.length ? `${padX},${height - padY} ${line} ${coords[coords.length - 1].x},${height - padY}` : "";
  return (
    <section className="sc-card sc-trend-card">
      <header className="sc-card-head">
        <div><div className="sc-eyebrow">Performance trend</div><h2>Clicks over time</h2><p>Daily clicks reported by Google Search Console</p></div>
        <button className="sc-icon-button" onClick={onExport} disabled={!data.length} aria-label="Export trend as CSV" title="Export CSV"><Download size={16} /></button>
      </header>
      {data.length ? (
        <>
          <div className="sc-chart-wrap">
            <svg className="sc-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily search clicks trend">
              {[0, 1, 2, 3].map((step) => {
                const y = padY + step * (height - padY * 2) / 3;
                return <line key={step} x1={padX} x2={width - padX} y1={y} y2={y} className="sc-chart-grid" />;
              })}
              <polygon points={area} className="sc-chart-area" />
              <polyline points={line} className="sc-chart-line" />
              {coords.map((point, index) => <circle key={data[index].date} cx={point.x} cy={point.y} r="2.8" className="sc-chart-dot"><title>{`${data[index].date}: ${fmtNumber(data[index].clicks)} clicks`}</title></circle>)}
            </svg>
          </div>
          <div className="sc-chart-axis"><span>{data[0]?.date}</span><span>{data[Math.floor(data.length / 2)]?.date}</span><span>{data[data.length - 1]?.date}</span></div>
          <div className="sc-legend"><i /> Clicks</div>
        </>
      ) : <EmptyInline title="No trend data for this range" detail="Google Search Console returned no daily observations." />}
    </section>
  );
}

function MetricsTable({ section, rows, queryPages = [], onInspect, onExport }: {
  section: typeof TABLES[number];
  rows: DashboardData["queries"];
  queryPages?: SearchQueryPageRow[];
  onInspect?: (urls: string[]) => void;
  onExport: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<"key" | "clicks" | "impressions" | "ctr" | "position">("clicks");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState<10 | 25>(10);
  const [pageIndex, setPageIndex] = useState(0);
  const columns = section.key === "queries" ? ["Query", "Destination pages", "Clicks", "Impressions", "CTR", "Position"] :
    section.key === "pages" ? ["Page", "Clicks", "Impressions", "CTR", "Position"] :
      section.key === "countries" ? ["Country", "Clicks", "Impressions", "CTR", "Position"] :
        section.key === "devices" ? ["Device", "Clicks", "Impressions", "CTR", "Position"] :
          ["Appearance", "Clicks", "Impressions", "CTR", "Position"];
  const filteredRows = rows.filter((row) => {
    if (!filter.trim()) return true;
    const normalized = filter.toLocaleLowerCase();
    const destinations = section.key === "queries" ? queryPages.filter((item) => item.query === row.key).map((item) => item.page).join(" ") : "";
    return `${row.key} ${destinations}`.toLocaleLowerCase().includes(normalized);
  }).sort((left, right) => {
    const a = left[sortKey];
    const b = right[sortKey];
    const comparison = typeof a === "string" ? a.localeCompare(String(b)) : Number(a) - Number(b);
    return sortDirection === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const sortBy = (column: string) => {
    const map: Record<string, typeof sortKey> = { [section.key === "queries" ? "Query" : columns[0]]: "key", Clicks: "clicks", Impressions: "impressions", CTR: "ctr", Position: "position" };
    const next = map[column];
    if (!next) return;
    if (sortKey === next) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(next); setSortDirection(next === "key" ? "asc" : "desc"); }
    setPageIndex(0);
  };
  return (
    <section className="sc-card sc-table-card">
      <header className="sc-card-head">
        <div><div className="sc-eyebrow">Search performance</div><h2>{section.title}</h2><p>{section.description}</p></div>
        <button className="sc-icon-button" onClick={onExport} disabled={!rows.length} aria-label={`Export ${section.title} as CSV`} title="Export CSV"><Download size={16} /></button>
      </header>
      {rows.length ? <>
        <div className="sc-table-tools"><label className="sc-table-filter"><Search size={14} /><input value={filter} onChange={(event) => { setFilter(event.target.value); setPageIndex(0); }} placeholder={`Filter ${section.title.toLowerCase()}…`} /></label><span>{filteredRows.length} returned rows</span></div>
        <div className="sc-table-scroll"><table><thead><tr>{columns.map((column) => <th key={column}><button className="sc-sort-button" onClick={() => sortBy(column)}>{column}{(column === (section.key === "queries" ? "Query" : columns[0]) && sortKey === "key") || column.toLowerCase() === sortKey ? <span aria-hidden="true">{sortDirection === "asc" ? " ↑" : " ↓"}</span> : null}</button></th>)}</tr></thead>
          <tbody>{visibleRows.map((row, index) => {
            const destinations = section.key === "queries" ? queryPages.filter((item) => item.query === row.key) : [];
            return <tr key={`${row.key}-${index}`}>
              <td className={section.key === "pages" ? "sc-url-cell" : ""}>{row.key || "—"}</td>
              {section.key === "queries" && <td className="sc-destination-cell">{destinations.length ? destinations.map((destination) => <span className="sc-destination-item" key={`${destination.query}-${destination.page}`}><a href={destination.page} target="_blank" rel="noreferrer" title={destination.page}>{destination.page}</a>{onInspect && <button className="sc-inline-action" onClick={() => onInspect([destination.page])}>Inspect</button>}</span>) : <span className="sc-not-returned">Not returned</span>}</td>}
              <td>{fmtNumber(row.clicks)}</td><td>{fmtNumber(row.impressions)}</td><td>{fmtCtr(row.ctr)}</td><td>{fmtPosition(row.position)}</td>
            </tr>;
          })}</tbody>
        </table></div>
        <div className="sc-table-pagination"><label>Rows per page <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as 10 | 25); setPageIndex(0); }}><option value={10}>10</option><option value={25}>25</option></select></label><span>{filteredRows.length ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, filteredRows.length)} of ${filteredRows.length}` : "0 rows"}</span><button onClick={() => setPageIndex((current) => Math.max(0, current - 1))} disabled={pageIndex === 0}>Previous</button><button onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))} disabled={pageIndex >= pageCount - 1}>Next</button></div>
      </> : <EmptyInline title="No rows returned" detail="There is no data for this dimension in the selected range." />}
    </section>
  );
}
function QueryPageTable({ rows, onInspect, onExport }: { rows: SearchQueryPageRow[]; onInspect: (urls: string[]) => void; onExport: () => void }) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof SearchQueryPageRow>("impressions");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState<10 | 25>(10);
  const [pageIndex, setPageIndex] = useState(0);
  const filteredRows = rows.filter((row) => `${row.query} ${row.page}`.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()));
  const sortedRows = [...filteredRows].sort((left, right) => {
    const a = left[sortKey], b = right[sortKey];
    const comparison = typeof a === "string" ? a.localeCompare(String(b)) : Number(a) - Number(b);
    return sortDirection === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visibleRows = sortedRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const sortBy = (key: keyof SearchQueryPageRow) => {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection(typeof rows[0]?.[key] === "string" ? "asc" : "desc"); }
    setPageIndex(0);
  };
  const headers: Array<{ label: string; key?: keyof SearchQueryPageRow }> = [
    { label: "Query", key: "query" }, { label: "Destination URL", key: "page" },
    { label: "Clicks", key: "clicks" }, { label: "Impressions", key: "impressions" },
    { label: "CTR", key: "ctr" }, { label: "Position", key: "position" }, { label: "Inspect" },
  ];
  return <section className="sc-card sc-table-card sc-query-page-card">
    <header className="sc-card-head"><div><div className="sc-eyebrow">Returned query × page dimensions</div><h2>Query destinations</h2><p>Exact query-to-URL pairs returned by Search Console. No destination is inferred.</p></div><button className="sc-icon-button" onClick={onExport} disabled={!rows.length} aria-label="Export query destinations as CSV" title="Export CSV"><Download size={16} /></button></header>
    {rows.length ? <>
      <div className="sc-table-tools"><label className="sc-table-filter"><Search size={14} /><input value={filter} onChange={(event) => { setFilter(event.target.value); setPageIndex(0); }} placeholder="Filter queries and destination URLs…" /></label><span>{filteredRows.length} returned pairs</span></div>
      <div className="sc-table-scroll"><table><thead><tr>{headers.map(({ label, key }) => <th key={label}>{key ? <button className="sc-sort-button" onClick={() => sortBy(key)}>{label}{sortKey === key ? ` ${sortDirection === "asc" ? "↑" : "↓"}` : ""}</button> : label}</th>)}</tr></thead>
        <tbody>{visibleRows.map((row, index) => <tr key={`${row.query}-${row.page}-${index}`}><td>{row.query || "—"}</td><td className="sc-url-cell"><a href={row.page} target="_blank" rel="noreferrer">{row.page}</a></td><td>{fmtNumber(row.clicks)}</td><td>{fmtNumber(row.impressions)}</td><td>{fmtCtr(row.ctr)}</td><td>{fmtPosition(row.position)}</td><td><button className="sc-inline-action" onClick={() => onInspect([row.page])} aria-label={`Inspect ${row.page}`}>Inspect URL</button></td></tr>)}</tbody>
      </table></div>
      <div className="sc-table-pagination"><label>Rows per page <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as 10 | 25); setPageIndex(0); }}><option value={10}>10</option><option value={25}>25</option></select></label><span>{sortedRows.length ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, sortedRows.length)} of ${sortedRows.length}` : "0 rows"}</span><button onClick={() => setPageIndex((current) => Math.max(0, current - 1))} disabled={pageIndex === 0}>Previous</button><button onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))} disabled={pageIndex >= pageCount - 1}>Next</button></div>
    </> : <EmptyInline title="No query-to-page pairs returned" detail="Google Search Console did not return query and destination associations for this range." />}
  </section>;
}
function EmptyInline({ title, detail }: { title: string; detail: string }) {
  return <div className="sc-empty-inline"><span className="sc-empty-mark"><BarChart3 size={18} /></span><strong>{title}</strong><span>{detail}</span></div>;
}
function MetricCard({ label, value, previous, current, format, lowerIsBetter = false }: { label: string; value: number; previous: number; current: number; format: (n: number) => string; lowerIsBetter?: boolean }) {
  const delta = previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
  const favorable = delta !== null && (lowerIsBetter ? delta <= 0 : delta >= 0);
  return <article className="sc-metric">
    <span className="sc-metric-label">{label}</span>
    <strong>{format(value)}</strong>
    <span className={`sc-delta ${delta === null ? "neutral" : favorable ? "positive" : "negative"}`}>
      {delta === null ? <CircleHelp size={13} /> : delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {delta === null ? "No comparison available" : `${Math.abs(delta).toFixed(1)}% vs previous period`}
    </span>
  </article>;
}
function OpportunityReview({ dashboard, onInspect }: { dashboard: DashboardData; onInspect: (urls: string[]) => void }) {
  const queryRows = dashboard.queries;
  const branded = queryRows.filter((row) => /\benvod\b/i.test(row.key));
  const nonBranded = queryRows.filter((row) => !/\benvod\b/i.test(row.key));
  const belowReportCtr = queryRows.filter((row) => row.impressions > 0 && row.ctr < dashboard.current.ctr);
  const position4to20 = dashboard.queryPages.filter((row) => row.position >= 4 && row.position <= 20);
  const position11to30 = dashboard.queryPages.filter((row) => row.position > 10 && row.position <= 30);
  const saudi = dashboard.countries.find((row) => row.key.trim().toUpperCase() === "SA");
  const languagePages = dashboard.pages.reduce((result, row) => {
    try {
      const pathname = new URL(row.key).pathname;
      if (/^\/en(?:\/|$)/i.test(pathname)) result.english.add(row.key);
      if (/^\/ar(?:\/|$)/i.test(pathname)) result.arabic.add(row.key);
    } catch {
      // Only parse and classify explicit, returned absolute URLs.
    }
    return result;
  }, { english: new Set<string>(), arabic: new Set<string>() });
  const aggregate = (rows: typeof queryRows) => {
    const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
    const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    return { clicks, impressions, ctr: impressions ? clicks / impressions : null };
  };
  const brandedMetrics = aggregate(branded);
  const nonBrandedMetrics = aggregate(nonBranded);
  const returnedQueryImpressions = aggregate(queryRows).impressions;
  const positionSummary = (rows: SearchQueryPageRow[]) => ({
    rows: rows.length,
    impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
    destinations: [...new Set(rows.map((row) => row.page))],
  });
  const bandA = positionSummary(position4to20);
  const bandB = positionSummary(position11to30);
  const metricText = (value: number | null, format: (n: number) => string) => value === null ? "Not returned" : format(value);
  const relativeText = (rows: typeof queryRows, metrics: ReturnType<typeof aggregate>) => {
    if (!rows.length) return queryRows.length ? "No matching returned rows" : "Not returned";
    const share = returnedQueryImpressions > 0 ? `${((metrics.impressions / returnedQueryImpressions) * 100).toFixed(1)}% of returned-query impressions` : "Impression share not returned";
    const ctrDifference = metrics.ctr === null ? "CTR not returned" : `CTR ${(metrics.ctr - dashboard.current.ctr >= 0 ? "+" : "")}${((metrics.ctr - dashboard.current.ctr) * 100).toFixed(2)} pp vs property report`;
    return `${share} · ${ctrDifference}`;
  };
  const reviewLinkList = (urls: string[]) => urls.length
    ? <span className="sc-review-links">{urls.slice(0, 4).map((url) => <span key={url}><a href={url} target="_blank" rel="noreferrer">{url}</a><button className="sc-inline-action" onClick={() => onInspect([url])}>Inspect</button></span>)}{urls.length > 4 && <small>+{urls.length - 4} more returned URLs</small>}</span>
    : <span className="sc-not-returned">Not returned</span>;
  return <section className="sc-card sc-opportunity">
    <header className="sc-card-head"><div><div className="sc-eyebrow">Evidence-led review filters</div><h2>Where to investigate</h2><p>Calculated only from rows returned for this property and date range.</p></div></header>
    <div className="sc-opportunity-caveat"><CircleHelp size={15} /><span>These are review filters, not ranking or search-demand guarantees. Search Console may omit anonymized or low-volume queries; absent evidence is labeled “Not returned.”</span></div>
    <div className="sc-opportunity-grid">
      <article className="sc-review-panel"><h3>Query classification</h3><p>Brand heuristic: query text contains “ENVOD”. Remaining returned queries are grouped as non-branded for review.</p><div className="sc-review-pair"><div><small>BRANDED · {queryRows.length ? `${branded.length} returned queries` : "Not returned"}</small><b>{branded.length ? `${fmtNumber(brandedMetrics.impressions)} impressions` : queryRows.length ? "No matching rows" : "Not returned"}</b><span>CTR {metricText(branded.length ? brandedMetrics.ctr : null, fmtCtr)}</span><span>{relativeText(branded, brandedMetrics)}</span></div><div><small>NON-BRANDED · {queryRows.length ? `${nonBranded.length} returned queries` : "Not returned"}</small><b>{nonBranded.length ? `${fmtNumber(nonBrandedMetrics.impressions)} impressions` : queryRows.length ? "No matching rows" : "Not returned"}</b><span>CTR {metricText(nonBranded.length ? nonBrandedMetrics.ctr : null, fmtCtr)}</span><span>{relativeText(nonBranded, nonBrandedMetrics)}</span></div></div></article>
      <article className="sc-review-panel"><h3>Impressions with below-report CTR</h3><p>Returned queries with impressions and CTR below this report’s overall CTR ({fmtCtr(dashboard.current.ctr)}).</p><b className="sc-review-number">{queryRows.length ? fmtNumber(belowReportCtr.length) : "Not returned"}</b><span className="sc-review-sub">{queryRows.length ? `of ${queryRows.length} returned query rows` : "No query rows in this report"}</span></article>
      <article className="sc-review-panel"><h3>Position bands · query × page rows</h3><p>Observed pairs in the selected period; the 11–20 range appears in both filters by design.</p><div className="sc-band-row"><div><small>POSITIONS 4–20</small><b>{bandA.rows ? `${bandA.rows} rows · ${fmtNumber(bandA.impressions)} impr.` : dashboard.queryPages.length ? "No rows returned in band" : "Not returned"}</b>{reviewLinkList(bandA.destinations)}</div><div><small>POSITIONS 11–30</small><b>{bandB.rows ? `${bandB.rows} rows · ${fmtNumber(bandB.impressions)} impr.` : dashboard.queryPages.length ? "No rows returned in band" : "Not returned"}</b>{reviewLinkList(bandB.destinations)}</div></div></article>
      <article className="sc-review-panel"><h3>Saudi Arabia</h3><p>Country dimension matched on the returned Search Console country code.</p>{saudi ? <><b className="sc-review-number">{fmtNumber(saudi.impressions)} impressions</b><span className="sc-review-sub">{fmtNumber(saudi.clicks)} clicks · CTR {fmtCtr(saudi.ctr)}</span></> : <span className="sc-not-returned">{dashboard.countries.length ? "SA not returned" : "Country data not returned"}</span>}</article>
      <article className="sc-review-panel sc-language-panel"><h3>Language URL paths</h3><p>Only explicit /en and /ar paths present in returned page URLs are classified.</p><div className="sc-language-split"><div><small>ENGLISH PATHS</small><b>{languagePages.english.size || (dashboard.pages.length ? "No /en paths returned" : "Not returned")}</b>{reviewLinkList([...languagePages.english])}</div><div><small>ARABIC PATHS</small><b>{languagePages.arabic.size || (dashboard.pages.length ? "No /ar paths returned" : "Not returned")}</b>{reviewLinkList([...languagePages.arabic])}</div></div></article>
    </div>
  </section>;
}

export default function SearchConsoleDashboard() {
  const [status, setStatus] = useState<SearchConsoleStatus | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [providerError, setProviderError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [audit, setAudit] = useState<SiteAudit | null>(null);
  const [properties, setProperties] = useState<SearchConsoleProperty[]>([]);
  const [preset, setPreset] = useState<DatePreset>("28");
  const initialRange = useMemo(() => rangeFor(28), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [draftStart, setDraftStart] = useState(initialRange.start);
  const [draftEnd, setDraftEnd] = useState(initialRange.end);
  const [busy, setBusy] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalMs, setIntervalMs] = useState(AUTO_OPTIONS[0].ms);
  const [refreshMenu, setRefreshMenu] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [inspection, setInspection] = useState<UrlInspection[] | null>(null);
  const [inspectInput, setInspectInput] = useState("");
  const [auditError, setAuditError] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<"performance" | "research">("performance");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const initialStatusLoaded = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof SearchConsoleApiError && error.status === 401) {
      setStatus((current) => current ? { ...current, authenticated: false, connected: false } : current);
      setPageState("signed-out");
      setDashboard(null);
      setAudit(null);
      setProperties([]);
      setProviderError("");
      return;
    }
    setProviderError(errorMessage(error));
    setPageState("error");
  }, []);

  const loadStatus = useCallback(async () => {
    setProviderError("");
    setPageState("loading");
    try {
      const result = await searchConsoleApi.getStatus();
      if (!mounted.current) return;
      setStatus(result);
      if (!result.configured) { setPageState("unconfigured"); return; }
      if (!result.authenticated) { setPageState("signed-out"); return; }
      if (!result.connected) { setPageState("unconnected"); return; }
      const propertyResponse = await searchConsoleApi.listProperties();
      if (!mounted.current) return;
      const returnedProperties = propertyResponse.properties;
      setProperties(returnedProperties);
      const serverSelection = returnedProperties.find((property) => property.siteUrl === result.selectedProperty);
      const preferredSelection = returnedProperties.find((property) => property.siteUrl === propertyResponse.preferredProperty);
      const availableSelection = serverSelection ?? preferredSelection;
      if (!availableSelection) {
        setDashboard(null);
        setStatus({ ...result, selectedProperty: null });
        setPageState("connected");
        return;
      }
      let selectedProperty = availableSelection.siteUrl;
      if (result.selectedProperty !== selectedProperty) {
        const selected = await searchConsoleApi.selectProperty(selectedProperty);
        if (selected.selectedProperty !== selectedProperty) {
          setDashboard(null);
          setStatus({ ...result, selectedProperty: null });
          setPageState("connected");
          return;
        }
        selectedProperty = selected.selectedProperty;
      }
      setStatus({ ...result, selectedProperty });
      setPageState("connected");
      setBusy("performance");
      try {
        const data = await searchConsoleApi.getDashboard(startDate, endDate, false);
        if (mounted.current) setDashboard(data);
      } catch (error) {
        if (mounted.current) handleError(error);
      } finally {
        if (mounted.current) setBusy("");
      }
    } catch (error) { if (mounted.current) handleError(error); }
  }, [endDate, handleError, startDate]);

  const loadPerformance = useCallback(async (
    dates = { start: startDate, end: endDate },
    force = false,
    propertyOverride?: string,
  ) => {
    const selectedProperty = propertyOverride ?? status?.selectedProperty;
    if (!selectedProperty || (!propertyOverride && (!status?.connected || !properties.some((property) => property.siteUrl === selectedProperty)))) return;
    setBusy("performance");
    setProviderError("");
    try {
      const data = await searchConsoleApi.getDashboard(dates.start, dates.end, force);
      if (!mounted.current) return;
      setDashboard(data);
      setPageState("connected");
    } catch (error) { if (mounted.current) handleError(error); }
    finally { if (mounted.current) setBusy(""); }
  }, [endDate, handleError, properties, startDate, status?.connected, status?.selectedProperty]);

  const loadAudit = useCallback(async () => {
    if (!status?.authenticated || !status.configured) return;
    setBusy("audit");
    setAuditError("");
    try {
      const result = await searchConsoleApi.getAudit();
      if (mounted.current) setAudit(result);
    } catch (error) {
      if (error instanceof SearchConsoleApiError && error.status === 401) handleError(error);
      else if (mounted.current) setAuditError(errorMessage(error));
    } finally { if (mounted.current) setBusy(""); }
  }, [handleError, status?.authenticated, status?.configured]);

  useEffect(() => {
    if (initialStatusLoaded.current) return;
    initialStatusLoaded.current = true;
    void loadStatus();
  }, [loadStatus]);
  useEffect(() => {
    if (status?.authenticated && status.configured) {
      void loadAudit();
    }
  }, [loadAudit, status?.authenticated, status?.configured]);
  useEffect(() => {
    if (!autoRefresh || pageState !== "connected") return;
    const timer = window.setInterval(() => { void loadPerformance(undefined, true); }, Math.max(5 * 60_000, intervalMs));
    return () => window.clearInterval(timer);
  }, [autoRefresh, intervalMs, loadPerformance, pageState]);
  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setRefreshMenu(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("sc-admin-dark", isDark);
    return () => document.documentElement.classList.remove("sc-admin-dark");
  }, [isDark]);

  const refreshAll = async () => {
    if (!status?.connected) { await loadStatus(); return; }
    await Promise.all([loadPerformance(undefined, true), loadAudit()]);
  };
  const choosePeriod = (days: number) => {
    const range = rangeFor(days);
    setPreset(String(days) as DatePreset);
    setStartDate(range.start); setEndDate(range.end);
    setDraftStart(range.start); setDraftEnd(range.end);
    if (status?.connected) void loadPerformance(range, false);
  };
  const applyCustomRange = () => {
    if (!draftStart || !draftEnd || draftStart > draftEnd) return;
    setPreset("custom"); setStartDate(draftStart); setEndDate(draftEnd);
    if (status?.connected) void loadPerformance({ start: draftStart, end: draftEnd }, false);
  };
  const changeProperty = async (siteUrl: string) => {
    if (!siteUrl || siteUrl === status?.selectedProperty) return;
    setBusy("property");
    try {
      const result = await searchConsoleApi.selectProperty(siteUrl);
      setStatus((current) => current ? { ...current, selectedProperty: result.selectedProperty } : current);
      setDashboard(null); setAudit(null); setInspection(null);
      const verifiedProperty = properties.find((property) => property.siteUrl === result.selectedProperty);
      if (!verifiedProperty) {
        setStatus((current) => current ? { ...current, selectedProperty: null } : current);
        return;
      }
      await Promise.all([loadPerformance(undefined, false, verifiedProperty.siteUrl), loadAudit()]);
    } catch (error) { handleError(error); }
    finally { setBusy(""); }
  };
  const connect = () => searchConsoleApi.startOAuth();
  const signOut = async () => {
    setBusy("logout");
    try { await searchConsoleApi.logout(); setStatus((current) => current ? { ...current, authenticated: false, connected: false } : current); setPageState("signed-out"); }
    catch (error) { handleError(error); }
    finally { setBusy(""); }
  };
  const disconnect = async () => {
    if (!window.confirm("Disconnect the Google Search Console connection?")) return;
    setBusy("disconnect");
    try {
      await searchConsoleApi.disconnect();
      setDashboard(null); setAudit(null); setProperties([]); setInspection(null);
      await loadStatus();
    } catch (error) { handleError(error); }
    finally { setBusy(""); }
  };
  const runAudit = async () => {
    setBusy("audit");
    setAuditError("");
    try { setAudit(await searchConsoleApi.runAudit()); setSelectedUrls([]); setInspection(null); }
    catch (error) {
      if (error instanceof SearchConsoleApiError && error.status === 401) handleError(error);
      else setAuditError(errorMessage(error));
    } finally { setBusy(""); }
  };
  const inspect = async (urls: string[]) => {
    const valid = [...new Set(urls.map((url) => url.trim()).filter(Boolean))].slice(0, 10);
    if (!valid.length) return;
    setBusy("inspect");
    setAuditError("");
    try { const result = await searchConsoleApi.inspectUrls(valid); setInspection(result.inspections); }
    catch (error) {
      if (error instanceof SearchConsoleApiError && error.status === 401) handleError(error);
      else setAuditError(errorMessage(error));
    } finally { setBusy(""); }
  };

  const dateLabel = `${startDate} — ${endDate}`;
  const chartExport = () => dashboard && downloadCsv("search-console-clicks-trend.csv", dashboard.timeSeries.map(({ date, clicks, impressions, ctr, position }) => ({ date, clicks, impressions, ctr, position })));
  const rowsFor = (key: SectionKey) => dashboard?.[key] ?? [];
  const setSelection = (url: string) => setSelectedUrls((current) => current.includes(url) ? current.filter((item) => item !== url) : [...current, url]);
  const auditRows = audit?.pages ?? [];
  const auditExportRows = auditRows.map((page) => ({
    url: page.url, status: page.status, title: page.title, titleLength: page.titleLength,
    description: page.description, descriptionLength: page.descriptionLength, canonical: page.canonical,
    robots: page.robots, language: page.language, direction: page.direction ?? "",
    hreflang: page.hreflang.map((entry) => `${entry.language}=${entry.url}`).join(" | "), h1: page.h1.join(" | "),
    internalLinks: page.internalLinks, imageCount: page.imageCount, imagesMissingAlt: page.imagesMissingAlt,
    structuredDataTypes: page.structuredDataTypes.join(" | "), wordCount: page.wordCount, error: page.error,
  }));
  const incomplete = !!dashboard && (TABLES.some(({ key }) => !dashboard[key]?.length) || !dashboard.timeSeries.length);

  return (
    <main className="sc-admin" data-theme={isDark ? "dark" : "light"}>
      <div className="sc-shell">
        <header className="sc-topbar">
          <div className="sc-brand-lockup"><span className="sc-brand-mark">E</span><span><b>ENVOD KINGDOM</b><small>SEARCH OPERATIONS</small></span></div>
          <div className="sc-header-actions">
            <span className="sc-private-label"><ShieldCheck size={14} /> Private workspace</span>
            <button className="sc-quiet-button" onClick={() => setIsDark((value) => !value)} aria-label="Toggle theme" title="Toggle theme">{isDark ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button className="sc-quiet-button" onClick={() => window.print()} aria-label="Print or save as PDF" title="Print / Save PDF"><Printer size={16} /></button>
          </div>
        </header>

        <section className="sc-heading">
          <div>
            <div className="sc-kicker"><span className="sc-kicker-dot" /> SEARCH CONSOLE / ADMIN</div>
            <h1>Search <em>visibility.</em></h1>
            <p>{activeAdminTab === "performance" ? "Performance from Google Search, alongside a read-only site crawl audit." : "Bilingual service-keyword candidates, sampled competitor evidence and market coverage. Unmeasured fields are labelled."}</p>
          </div>
          <div className="sc-heading-controls">
            <button className="sc-button sc-button-outline" onClick={() => void refreshAll()} disabled={pageState === "loading" || !!busy}><RefreshCw size={15} className={busy === "performance" ? "sc-spin" : ""} /> Refresh</button>
            <div className="sc-split-wrap" ref={dropdownRef}>
              <button className="sc-split-main" onClick={() => setRefreshMenu((open) => !open)}><Activity size={15} /> Auto-refresh <ChevronDown size={14} /></button>
              {refreshMenu && <div className="sc-menu">
                <label className="sc-auto-toggle"><span><b>Automatic refresh</b><small>Minimum interval is 5 minutes</small></span><input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /></label>
                <div className="sc-menu-caption">INTERVAL</div>
                {AUTO_OPTIONS.map((option) => <button key={option.ms} className="sc-menu-item" onClick={() => { setIntervalMs(option.ms); setRefreshMenu(false); }}>{option.label}{intervalMs === option.ms && <Check size={14} />}</button>)}
                <button className="sc-menu-item sc-menu-off" onClick={() => { setAutoRefresh(false); setRefreshMenu(false); }}>Turn off automatic refresh</button>
              </div>}
            </div>
            {status?.authenticated && <button className="sc-quiet-button sc-logout" onClick={() => void signOut()} disabled={!!busy} title="Sign out" aria-label="Sign out"><LogOut size={16} /></button>}
          </div>
        </section>

        <div className="sc-source-line">
          {pageState === "connected" && activeAdminTab === "research"
            ? <><span><Globe2 size={14} /> Source: curated project research register</span><i /><span>Not live performance data</span></>
            : <><span><Globe2 size={14} /> Source: Google Search Console</span><i /><span>Range: {dateLabel}</span>{status?.lastSyncedAt && <><i /><span>Last sync: {fmtDate(status.lastSyncedAt)}</span></>}</>}
        </div>

        {providerError && <div className="sc-alert sc-alert-error" role="alert"><AlertCircle size={17} /><div><b>Search Console request failed</b><span>{providerError}</span></div><button onClick={() => void loadStatus()} aria-label="Retry"><RefreshCw size={15} /> Retry</button><button className="sc-alert-close" onClick={() => setProviderError("")} aria-label="Dismiss"><X size={15} /></button></div>}

        {pageState === "loading" && <section className="sc-state-panel"><div className="sc-state-icon sc-loading-icon"><LoaderCircle size={22} /></div><span className="sc-eyebrow">SECURE SESSION</span><h2>Checking the connection</h2><p>Verifying the private Search Console session and available property.</p><div className="sc-skeleton-line" /><div className="sc-skeleton-line short" /></section>}
        {pageState === "signed-out" && <section className="sc-state-panel"><div className="sc-state-icon"><ShieldCheck size={22} /></div><span className="sc-eyebrow">ADMIN ACCESS</span><h2>Sign in to continue</h2><p>This dashboard is restricted to the ENVOD Kingdom administrator. Sign in to connect the Google account with Search Console access.</p><button className="sc-button sc-button-primary" onClick={connect}><ExternalLink size={15} /> Sign in with Google</button></section>}
        {pageState === "unconfigured" && <section className="sc-state-panel"><div className="sc-state-icon"><Settings2 size={22} /></div><span className="sc-eyebrow">CONNECTION SETUP</span><h2>Search Console is not configured</h2><p>{status?.setupMessage || "The server has not been configured for Google Search Console access yet."}</p><div className="sc-readonly-note"><CircleHelp size={16} /> Ask the administrator to complete the server-side Google OAuth setup. No dashboard data is shown until configured.</div></section>}
        {pageState === "unconnected" && <>
          <section className="sc-state-panel"><div className="sc-state-icon"><Unplug size={22} /></div><span className="sc-eyebrow">GOOGLE AUTHORIZATION</span><h2>Connect a Search Console account</h2><p>Authorize the Google account that has access to ENVOD Kingdom’s verified Search Console property.</p><button className="sc-button sc-button-primary" onClick={connect}><ExternalLink size={15} /> Connect Google Search Console</button><div className="sc-readonly-note"><ShieldCheck size={16} /> Access is used to read search performance and inspection data only.</div></section>
          <section className="sc-audit-section sc-unconnected-audit"><header className="sc-audit-heading"><div><span className="sc-eyebrow">READ-ONLY CRAWL AUDIT</span><h2>Site inventory</h2><p>Google authorization is not required for the local crawl audit, subject to server access rules.</p></div><div className="sc-audit-actions"><button className="sc-button sc-button-outline" onClick={() => void loadAudit()}><FileSearch size={15} /> Load latest audit</button><button className="sc-button sc-button-primary" onClick={() => void runAudit()} disabled={busy === "audit"}><RefreshCw size={15} className={busy === "audit" ? "sc-spin" : ""} /> Run crawl audit</button></div></header>
            {auditError && <div className="sc-alert sc-alert-error"><AlertCircle size={16} /><span>{auditError}</span><button onClick={() => void loadAudit()}>Retry</button></div>}
            {audit && <div className="sc-audit-meta"><div><small>ORIGIN</small><b>{audit.origin}</b></div><div><small>DISCOVERED</small><b>{fmtNumber(audit.discoveredUrls)} URLs</b></div><div><small>CRAWLED</small><b>{fmtNumber(audit.crawledUrls)} URLs</b></div><div><small>ROBOTS.TXT</small><b className={audit.robotsAllowsCrawl ? "sc-good" : "sc-warning"}>{audit.robotsAllowsCrawl ? "Crawl allowed" : "Crawl restricted"}</b></div><div className="sc-audit-time"><small>COMPLETED</small><b>{fmtDate(audit.completedAt)}</b></div></div>}
            {!audit && !auditError && <EmptyInline title="No crawl audit loaded" detail="Load the latest audit or run a new read-only crawl." />}
          </section>
        </>}

        {pageState === "connected" && <>
          <nav className="sc-dashboard-tabs" aria-label="Search administration sections" data-testid="nav-search-admin-sections">
            <button type="button" aria-pressed={activeAdminTab === "performance"} className={activeAdminTab === "performance" ? "active" : ""} onClick={() => setActiveAdminTab("performance")} data-testid="tab-admin-performance">
              <BarChart3 size={15} /> Search performance &amp; site audit
            </button>
            <button type="button" aria-pressed={activeAdminTab === "research"} className={activeAdminTab === "research" ? "active" : ""} onClick={() => setActiveAdminTab("research")} data-testid="tab-admin-research">
              <Search size={15} /> SEO intelligence research
            </button>
          </nav>
          {activeAdminTab === "performance" && <>
          <section className="sc-controls">
            <div className="sc-property-control">
              <label htmlFor="sc-property">PROPERTY</label>
              <select id="sc-property" value={status?.selectedProperty ?? ""} onChange={(event) => void changeProperty(event.target.value)} disabled={!!busy}>
                {!status?.selectedProperty && <option value="">Choose a Search Console property</option>}
                {!properties.length && status?.selectedProperty && <option value={status.selectedProperty}>{status.selectedProperty}</option>}
                {properties.map((property) => <option value={property.siteUrl} key={property.siteUrl}>{property.siteUrl} · {property.permissionLevel}</option>)}
              </select>
            </div>
            <div className="sc-dates-control">
              <div className="sc-presets">{PERIODS.map((period) => <button key={period.value} onClick={() => choosePeriod(Number(period.value))} className={preset === period.value ? "active" : ""}>{period.label}</button>)}<button onClick={() => setPreset("custom")} className={preset === "custom" ? "active" : ""}>Custom</button></div>
              <div className="sc-custom-dates"><label>From <input type="date" value={draftStart} max={draftEnd} onChange={(event) => setDraftStart(event.target.value)} /></label><label>To <input type="date" value={draftEnd} min={draftStart} onChange={(event) => setDraftEnd(event.target.value)} /></label><button className="sc-button sc-button-outline sc-apply" onClick={applyCustomRange} disabled={!draftStart || !draftEnd || draftStart > draftEnd}>Apply</button></div>
            </div>
          </section>
          {!status?.selectedProperty && <section className="sc-state-panel sc-state-compact sc-property-empty"><div className="sc-state-icon"><Globe2 size={21} /></div><span className="sc-eyebrow">PROPERTY REQUIRED</span><h2>Choose a Search Console property</h2><p>{properties.length ? "Select a property above to load its real Search Console performance. No property is selected automatically unless Google returns an exact preferred-property match." : "No Search Console properties were returned for this account. Check the Google account permissions, then refresh."}</p>{!properties.length && <button className="sc-button sc-button-outline" onClick={() => void loadStatus()}><RefreshCw size={15} /> Reload properties</button>}</section>}
          {status?.selectedProperty && !dashboard && busy === "performance" && <div className="sc-metric-grid">{[0, 1, 2, 3].map((item) => <div className="sc-metric sc-metric-skeleton" key={item}><div /><div /><div /></div>)}</div>}
          {status?.selectedProperty && !dashboard && busy !== "performance" && !providerError && <section className="sc-state-panel sc-state-compact"><div className="sc-state-icon"><Search size={21} /></div><span className="sc-eyebrow">PROPERTY DATA</span><h2>No Search Console data loaded</h2><p>Refresh to request performance data. Missing data is never replaced with estimates.</p><button className="sc-button sc-button-primary" onClick={() => void loadPerformance(undefined, true)}><RefreshCw size={15} /> Load data</button></section>}
          {status?.selectedProperty && dashboard && <>
            {incomplete && <div className="sc-alert sc-alert-partial"><AlertCircle size={16} /><span>Partial data: some dimensions or dates were not returned by Google Search Console. Empty sections remain blank rather than showing substitute values.</span></div>}
            <section className="sc-metric-grid">
              <MetricCard label="Total clicks" value={dashboard.current.clicks} current={dashboard.current.clicks} previous={dashboard.previous.clicks} format={fmtNumber} />
              <MetricCard label="Impressions" value={dashboard.current.impressions} current={dashboard.current.impressions} previous={dashboard.previous.impressions} format={fmtNumber} />
              <MetricCard label="Average CTR" value={dashboard.current.ctr} current={dashboard.current.ctr} previous={dashboard.previous.ctr} format={fmtCtr} />
              <MetricCard label="Average position" value={dashboard.current.position} current={dashboard.current.position} previous={dashboard.previous.position} format={fmtPosition} lowerIsBetter />
            </section>
            <div className="sc-period-caption"><span>Current period</span><b>{dashboard.startDate} — {dashboard.endDate}</b><i /> <span>Compared with</span><b>{dashboard.previousStartDate} — {dashboard.previousEndDate}</b></div>
            <TrendChart data={dashboard.timeSeries} onExport={chartExport} />
            <OpportunityReview dashboard={dashboard} onInspect={(urls) => void inspect(urls)} />
            <QueryPageTable rows={dashboard.queryPages} onInspect={(urls) => void inspect(urls)} onExport={() => downloadCsv("search-console-query-destinations.csv", dashboard.queryPages.map((row) => ({ query: row.query, page: row.page, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position })))} />
            <div className="sc-table-grid">{TABLES.map((section) => <MetricsTable key={section.key} section={section} rows={rowsFor(section.key)} queryPages={dashboard.queryPages} onInspect={(urls) => void inspect(urls)} onExport={() => downloadCsv(`search-console-${section.key}.csv`, rowsFor(section.key).map((row) => ({ dimension: row.key, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position })))} />)}</div>
            {dashboard.notes.length > 0 && <section className="sc-notes"><div className="sc-eyebrow">SOURCE NOTES</div>{dashboard.notes.map((note, index) => <p key={`${index}-${note}`}>{note}</p>)}</section>}
          </>}

          <section className="sc-audit-section">
            <header className="sc-audit-heading"><div><span className="sc-eyebrow">READ-ONLY CRAWL / INDEXING AUDIT</span><h2>Site health inventory</h2><p>A local crawl snapshot and Google URL inspection status. This dashboard does not request indexing or edit website content.</p></div>
              <div className="sc-audit-actions"><button className="sc-button sc-button-outline" onClick={() => { setAuditOpen((open) => !open); if (!audit) void loadAudit(); }}><FileSearch size={15} /> {auditOpen ? "Hide audit" : "View audit"}</button><button className="sc-button sc-button-primary" onClick={() => void runAudit()} disabled={busy === "audit"}><RefreshCw size={15} className={busy === "audit" ? "sc-spin" : ""} /> Run crawl audit</button></div>
            </header>
            {auditOpen && <div className="sc-audit-body">
              {auditError && <div className="sc-alert sc-alert-error"><AlertCircle size={16} /><span>{auditError}</span><button onClick={() => void loadAudit()}>Retry</button></div>}
              {busy === "audit" && !audit && <div className="sc-audit-loading"><div className="sc-skeleton-line" /><div className="sc-skeleton-line" /></div>}
              {audit && <>
                <div className="sc-audit-meta">
                  <div><small>ORIGIN</small><b>{audit.origin}</b></div><div><small>DISCOVERED</small><b>{fmtNumber(audit.discoveredUrls)} URLs</b></div><div><small>CRAWLED</small><b>{fmtNumber(audit.crawledUrls)} URLs</b></div><div><small>ROBOTS.TXT</small><b className={audit.robotsAllowsCrawl ? "sc-good" : "sc-warning"}>{audit.robotsAllowsCrawl ? "Crawl allowed" : "Crawl restricted"}</b></div>
                  <div className="sc-audit-time"><small>COMPLETED</small><b>{fmtDate(audit.completedAt)}</b></div>
                  <button className="sc-icon-button" onClick={() => downloadCsv("envod-crawl-inventory.csv", auditExportRows)} disabled={!auditRows.length} aria-label="Export crawl inventory as CSV"><Download size={16} /></button>
                </div>
                <div className="sc-audit-links"><b>Sitemaps</b>{audit.sitemapUrls.length ? audit.sitemapUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}<ExternalLink size={12} /></a>) : <span>No sitemap URLs returned.</span>}</div>
                {audit.notes.map((note, index) => <p className="sc-audit-note" key={`${index}-${note}`}>{note}</p>)}
                <div className="sc-inspection-tools">
                  <div className="sc-inspect-select"><button onClick={() => setSelectedUrls(selectedUrls.length === auditRows.length ? [] : auditRows.map((page) => page.url))}>{selectedUrls.length === auditRows.length && auditRows.length ? "Clear selection" : "Select all URLs"}</button><span>{selectedUrls.length} selected · up to 10 URLs per inspection request</span><button className="sc-button sc-button-outline" onClick={() => void inspect(selectedUrls)} disabled={!selectedUrls.length || busy === "inspect"}><Search size={14} /> Inspect selected {selectedUrls.length > 10 ? "(first 10)" : ""}</button></div>
                  <form className="sc-inspect-form" onSubmit={(event) => { event.preventDefault(); void inspect(inspectInput.split(/\r?\n|,/)); }}><textarea aria-label="URLs to inspect" placeholder="Paste up to 10 URLs, one per line" value={inspectInput} onChange={(event) => setInspectInput(event.target.value)} /><button className="sc-button sc-button-outline" type="submit" disabled={!inspectInput.trim() || busy === "inspect"}>{busy === "inspect" ? <LoaderCircle size={14} className="sc-spin" /> : <Search size={14} />} Inspect URLs</button></form>
                </div>
                {auditRows.length ? <div className="sc-table-scroll sc-audit-table-wrap"><table className="sc-audit-table"><thead><tr><th aria-label="Select" /><th>URL</th><th>HTTP</th><th>Title</th><th>Meta description</th><th>Canonical</th><th>H1</th><th>Images / missing alt</th><th>Links</th><th>Audit result</th></tr></thead><tbody>
                  {auditRows.map((page: AuditedPage) => <tr key={page.url}><td><input type="checkbox" checked={selectedUrls.includes(page.url)} onChange={() => setSelection(page.url)} aria-label={`Select ${page.url}`} /></td><td className="sc-url-cell"><a href={page.url} target="_blank" rel="noreferrer">{page.url}</a></td><td>{page.status ?? "—"}</td><td title={page.title}>{page.title || "—"}<small>{page.titleLength} chars</small></td><td title={page.description}>{page.description || "—"}<small>{page.descriptionLength} chars</small></td><td>{page.canonical || "—"}</td><td>{page.h1.length ? page.h1.join(" / ") : "—"}</td><td>{page.imageCount} / {page.imagesMissingAlt}</td><td>{page.internalLinks}</td><td>{page.error ? <span className="sc-audit-error">{page.error}</span> : <span className="sc-good">Audited</span>}</td></tr>)}
                </tbody></table></div> : <EmptyInline title="No crawled URLs" detail="The crawl audit returned no page inventory." />}
                {inspection && <section className="sc-inspection-results"><header><div><b>URL inspection results</b><span>Google Search Console URL Inspection API</span></div><button className="sc-icon-button" onClick={() => setInspection(null)} aria-label="Close inspection results"><X size={15} /></button><button className="sc-icon-button" onClick={() => downloadCsv("google-url-inspections.csv", inspection.map((item) => ({ ...item, referringUrls: item.referringUrls.join(" | "), sitemaps: item.sitemaps.join(" | ") })))} aria-label="Export URL inspections as CSV"><Download size={15} /></button></header>
                  <div className="sc-inspection-list">{inspection.map((item) => <article key={item.url}><b>{item.url}</b>{item.error ? <span className="sc-audit-error">{item.error}</span> : <dl>{[["Verdict", item.verdict], ["Indexing state", item.indexingState], ["Coverage", item.coverageState], ["Robots", item.robotsTxtState], ["Fetch", item.pageFetchState], ["Last crawl", fmtDate(item.lastCrawlTime)], ["Google canonical", item.googleCanonical], ["User canonical", item.userCanonical]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not returned"}</dd></div>)}</dl>}</article>)}</div>
                </section>}
              </>}
              {!audit && !busy && !auditError && <EmptyInline title="No crawl audit available" detail="Run a read-only crawl audit to build the URL inventory." />}
            </div>}
          </section>
          <footer className="sc-footer"><span><ShieldCheck size={14} /> Read-only Search Console reporting</span><span>Search Console data may be delayed by Google. No indexing requests or website edits are made.</span>{status?.connected && <button onClick={() => void disconnect()} disabled={!!busy}><Unplug size={13} /> Disconnect Google</button>}</footer>
          </>}
          {activeAdminTab === "research" && <SeoResearchPanel onUnauthorized={handleError} />}
        </>}
      </div>
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { searchConsoleApi, SearchConsoleApiError, type SeoIntelligenceResearch } from "@/lib/search-console-api";

type ResearchView = "keywords" | "competitors" | "markets" | "recommendations";
type LanguageView = "en" | "ar";

const VIEWS: Array<{ key: ResearchView; label: string }> = [
  { key: "keywords", label: "Keyword map" },
  { key: "competitors", label: "Competitor evidence" },
  { key: "markets", label: "Markets" },
  { key: "recommendations", label: "Prioritized actions" },
];
const EMPTY_RESEARCH: SeoIntelligenceResearch = {
  researchDate: "",
  keywordCandidateRows: 0,
  sourceRecords: 0,
  measuredKeywordVolume: false,
  measuredRank: false,
  measuredAiCitations: false,
  services: [],
  markets: [],
};

import {downloadCsv as exportCsv} from "@/lib/csv-export";

function EvidenceLinks({ priority, research }: { priority: string; research: SeoIntelligenceResearch }) {
  const service = research.services.find((row) => row.priority === priority);
  if (!service?.evidence.length) return <span className="sc-not-returned">No fresh linked source in this review</span>;
  return (
    <span className="sc-research-evidence">
      {service.evidence.map((source, index) => (
        <a
          href={source.url}
          key={`${source.url}-${source.title}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`link-research-source-${priority}-${index + 1}`}
          title={`${source.title} · ${source.evidenceMode}`}
        >
          {source.title} <ExternalLink size={11} aria-hidden="true" />
        </a>
      ))}
    </span>
  );
}

export default function SeoResearchPanel({ onUnauthorized }: { onUnauthorized: (error: unknown) => void }) {
  const [research, setResearch] = useState<SeoIntelligenceResearch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<ResearchView>("keywords");
  const [language, setLanguage] = useState<LanguageView>("en");
  const [filter, setFilter] = useState("");
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const seoIntelligenceResearch = research ?? EMPTY_RESEARCH;

  const loadResearch = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setResearch(await searchConsoleApi.getResearch());
    } catch (error) {
      if (error instanceof SearchConsoleApiError && error.status === 401) {
        onUnauthorized(error);
        return;
      }
      setLoadError(error instanceof Error ? error.message : "The research snapshot could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadResearch();
  }, [loadResearch]);

  const services = useMemo(
    () => seoIntelligenceResearch.services.filter((row) =>
      `${row.priority} ${row.service} ${row.queryEn} ${row.queryAr} ${row.nextAction}`
        .toLocaleLowerCase()
        .includes(normalizedFilter),
    ),
    [normalizedFilter, seoIntelligenceResearch.services],
  );
  const competitors = useMemo(
    () => seoIntelligenceResearch.services.filter((row) =>
      `${row.priority} ${row.service} ${row.competitorCoverage} ${row.competitorObservation} ${row.competitorLimitations}`
        .toLocaleLowerCase()
        .includes(normalizedFilter),
    ),
    [normalizedFilter, seoIntelligenceResearch.services],
  );
  const markets = useMemo(
    () => seoIntelligenceResearch.markets.filter((row) =>
      Object.values(row).join(" ").toLocaleLowerCase().includes(normalizedFilter),
    ),
    [normalizedFilter, seoIntelligenceResearch.markets],
  );
  const recommendations = useMemo(
    () => seoIntelligenceResearch.services.filter((row) =>
      `${row.priority} ${row.service} ${row.nextAction} ${row.recommendedChange}`
        .toLocaleLowerCase()
        .includes(normalizedFilter),
    ),
    [normalizedFilter, seoIntelligenceResearch.services],
  );

  if (loading) {
    return <section className="sc-research-panel" aria-live="polite" data-testid="status-research-loading">
      <div className="sc-eyebrow">PRIVATE RESEARCH REGISTER</div>
      <h2>Loading the evidence snapshot</h2>
      <p>Retrieving the current research data through the administrator-only endpoint.</p>
    </section>;
  }
  if (loadError || !research) {
    return <section className="sc-research-panel" data-testid="status-research-error">
      <div className="sc-eyebrow">RESEARCH REGISTER</div>
      <h2>Research data unavailable</h2>
      <p role="alert">{loadError || "No research snapshot was returned."}</p>
      <button className="sc-button sc-button-outline" onClick={() => void loadResearch()} data-testid="button-retry-research">Retry</button>
    </section>;
  }

  const downloadCurrentView = () => {
    if (view === "keywords") {
      exportCsv("envod-service-keyword-candidates.csv", services.map((row) => ({
        priority: row.priority,
        service: row.service,
        candidateKeyword: language === "ar" ? row.queryAr : row.queryEn,
        language,
        targetUrlEn: row.targetUrlEn,
        targetUrlAr: row.targetUrlAr,
        targetMarket: row.ksaScope,
        searchVolume: row.searchVolume,
        rank: row.envodRank,
        competitorCoverage: row.competitorCoverage,
        actualOutcome: row.actualOutcome,
      })));
    } else if (view === "competitors") {
      exportCsv("envod-competitor-evidence-review.csv", competitors.map((row) => ({
        priority: row.priority,
        service: row.service,
        coverageStatus: row.competitorCoverage,
        observedContent: row.competitorObservation,
        limitations: row.competitorLimitations,
        furtherResearch: row.competitorNextResearch,
        linkedEvidence: row.evidence.map((source) => source.url).join(" | "),
      })));
    } else if (view === "markets") {
      exportCsv("envod-market-opportunity-review.csv", markets);
    } else {
      exportCsv("envod-prioritized-seo-actions.csv", recommendations.map((row) => ({
        priority: row.priority,
        service: row.service,
        businessObjective: `Improve qualified ${row.service} enquiries`,
        language: "English and Arabic",
        geography: "Saudi Arabia primary; regional scope requires verification",
        targetUrlEn: row.targetUrlEn,
        targetUrlAr: row.targetUrlAr,
        supportingEvidence: row.competitorCoverage,
        recommendedChange: row.nextAction,
        estimatedEffort: "Medium — editorial estimate",
        confidence: "Low for demand; page mapping only",
        testMethod: row.testMethod,
        actualOutcome: row.actualOutcome,
      })));
    }
  };

  return (
    <section className="sc-research-panel" aria-labelledby="sc-research-title" data-testid="panel-seo-research">
      <header className="sc-research-heading">
        <div>
          <span className="sc-eyebrow">KEYWORDS / COMPETITORS / MARKET EVIDENCE</span>
          <h2 id="sc-research-title">SEO intelligence research</h2>
          <p>Evidence-backed planning for the current 25-service catalogue. Search Console metrics remain in the live performance view.</p>
        </div>
        <button className="sc-button sc-button-outline" onClick={downloadCurrentView} data-testid="button-export-research">
          <Download size={14} /> Export current view
        </button>
      </header>

      <div className="sc-research-summary" aria-label="Research coverage summary">
        <article data-testid="stat-prioritized-services"><small>PRIORITIZED SERVICES</small><b>{seoIntelligenceResearch.services.length}</b><span>Owner-approved P1–P25 sequence</span></article>
        <article data-testid="stat-keyword-candidates"><small>KEYWORD CANDIDATES</small><b>{seoIntelligenceResearch.keywordCandidateRows}</b><span>Research rows; not search volume</span></article>
        <article data-testid="stat-research-sources"><small>REGISTERED SOURCES</small><b>{seoIntelligenceResearch.sourceRecords}</b><span>Evidence register records</span></article>
        <article data-testid="stat-measured-rankings"><small>MEASURED RANKINGS</small><b>Not available</b><span>No rank-tracking dataset connected</span></article>
      </div>

      <div className="sc-opportunity-caveat" role="note" data-testid="notice-research-limitations">
        <span><b>Research, not measured performance.</b> Keyword phrases are candidates only. Search volume, difficulty, organic rank, competitor rank and AI-search citations are not inferred or fabricated. Market observations describe sampled public pages, not market share.</span>
      </div>

      <div className="sc-research-toolbar">
        <div className="sc-research-tabs" role="tablist" aria-label="SEO intelligence views">
          {VIEWS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={view === item.key}
              className={view === item.key ? "active" : ""}
              onClick={() => setView(item.key)}
              data-testid={`tab-research-${item.key}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="sc-table-filter sc-research-filter">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter services, phrases or evidence"
            aria-label="Filter SEO research"
            data-testid="input-filter-research"
          />
        </label>
      </div>

      <div role="tabpanel" className="sc-research-body" data-testid={`content-research-${view}`}>
        {view === "keywords" && <>
          <div className="sc-research-view-head">
            <div><b>Service-to-keyword map</b><span>25 prioritized service targets · all demand and rank fields remain unmeasured</span></div>
            <label className="sc-research-language">Candidate language
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageView)} aria-label="Candidate keyword language" data-testid="select-research-language">
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
          </div>
          <div className="sc-table-scroll sc-research-table-wrap">
            <table className="sc-research-table">
              <thead><tr><th>Priority</th><th>Service</th><th>Candidate phrase</th><th>Target page</th><th>Market scope</th><th>Volume</th><th>Rank</th><th>Evidence</th></tr></thead>
              <tbody>{services.map((row) => <tr key={row.priority} data-testid={`row-keyword-${row.priority}`}>
                <td><b>{row.priority}</b></td>
                <td>{row.service}</td>
                <td dir={language === "ar" ? "rtl" : "auto"}>{language === "ar" ? row.queryAr : row.queryEn}</td>
                <td><code>{row.targetUrlEn}<br />{row.targetUrlAr}</code></td>
                <td>{row.ksaScope}</td>
                <td>{row.searchVolume || "Not measured"}</td>
                <td>{row.envodRank || "Not measured"}</td>
                <td><EvidenceLinks priority={row.priority} research={seoIntelligenceResearch} /></td>
              </tr>)}</tbody>
            </table>
            {!services.length && <div className="sc-empty-inline"><strong>No matching services</strong><span>Clear the filter to view the full candidate map.</span></div>}
          </div>
        </>}

        {view === "competitors" && <>
          <div className="sc-research-view-head"><div><b>Competitor intelligence by service</b><span>Public-page observations only; no backlink counts, rankings or market-share claims</span></div></div>
          <div className="sc-table-scroll sc-research-table-wrap">
            <table className="sc-research-table">
              <thead><tr><th>Service</th><th>Coverage status</th><th>Observed public-page content</th><th>Limitations</th><th>Sources</th><th>Next research</th></tr></thead>
              <tbody>{competitors.map((row) => <tr key={row.priority} data-testid={`row-competitor-${row.priority}`}>
                <td><b>{row.priority}</b><br />{row.service}</td>
                <td>{row.competitorCoverage}</td>
                <td>{row.competitorObservation}</td>
                <td>{row.competitorLimitations}</td>
                <td><EvidenceLinks priority={row.priority} research={seoIntelligenceResearch} /></td>
                <td>{row.competitorNextResearch || "No further research scoped"}</td>
              </tr>)}</tbody>
            </table>
            {!competitors.length && <div className="sc-empty-inline"><strong>No matching observations</strong><span>Clear the filter to view the full service map.</span></div>}
          </div>
        </>}

        {view === "markets" && <>
          <div className="sc-research-view-head"><div><b>Market and language coverage</b><span>Saudi Arabia is primary; other markets remain research scopes until operational coverage is verified.</span></div></div>
          <div className="sc-research-market-grid">
            {markets.map((market, index) => (
              <article className="sc-research-market-card" key={`${market.market_group}-${index}`} data-testid={`card-market-${index + 1}`}>
                {Object.entries(market).map(([key, value]) => (
                  <div key={key}><small>{key.replaceAll("_", " ")}</small><span>{value || "Not verified"}</span></div>
                ))}
              </article>
            ))}
            {!markets.length && <div className="sc-empty-inline"><strong>No matching markets</strong><span>Clear the filter to view the coverage map.</span></div>}
          </div>
        </>}

        {view === "recommendations" && <>
          <div className="sc-research-view-head"><div><b>Prioritized, testable actions</b><span>Effort is an editorial estimate. Confidence is low for demand until first-party data is available.</span></div></div>
          <div className="sc-table-scroll sc-research-table-wrap">
            <table className="sc-research-table sc-recommendation-table">
              <thead><tr><th>Priority</th><th>Objective / service</th><th>Language &amp; market</th><th>Target page</th><th>Evidence &amp; recommended action</th><th>Effort / confidence</th><th>Test and outcome</th></tr></thead>
              <tbody>{recommendations.map((row) => <tr key={row.priority} data-testid={`row-recommendation-${row.priority}`}>
                <td><b>{row.priority}</b></td>
                <td><b>{row.service}</b><br />Improve qualified service enquiries</td>
                <td>English + Arabic<br />Saudi Arabia primary; regional claims require verification</td>
                <td><code>{row.targetUrlEn}<br />{row.targetUrlAr}</code></td>
                <td><span>{row.nextAction}</span><EvidenceLinks priority={row.priority} research={seoIntelligenceResearch} /></td>
                <td>Medium (estimated)<br />Low for demand</td>
                <td>{row.testMethod}<br /><b>{row.actualOutcome}</b></td>
              </tr>)}</tbody>
            </table>
            {!recommendations.length && <div className="sc-empty-inline"><strong>No matching recommendations</strong><span>Clear the filter to view prioritized actions.</span></div>}
          </div>
        </>}
      </div>

      <footer className="sc-research-footer" data-testid="text-research-updated">
        Evidence snapshot: {seoIntelligenceResearch.researchDate} · SEO source register: {seoIntelligenceResearch.sourceRecords} records · live Google Search Console data is shown in the performance view, not copied into this research snapshot.
      </footer>
    </section>
  );
}

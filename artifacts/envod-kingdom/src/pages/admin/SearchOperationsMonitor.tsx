import {useEffect,useRef,useState} from "react";
import "./SearchOperationsMonitor.css";
import {searchConsoleApi,type SiteAudit} from "@/lib/search-console-api";
import {seoIntelligenceResearch} from "@/data/seo-intelligence-research";
import {countryDisplay} from "@/lib/search-countries";
import {classifyPage,compareMetric,equalPeriods,publicEnglishPaths,type PerformanceFilters} from "@/lib/search-operations";
import {downloadCsv} from "@/lib/csv-export";
type Data=Awaited<ReturnType<typeof searchConsoleApi.getDashboard>>;
const candidates=[
  ["/services/exhibition-logistics","لوجستيات المعارض والمؤتمرات"],["/services/exhibition-logistics","شحن معدات المعارض إلى السعودية"],["/services/exhibition-logistics","تخليص شحنات المعارض"],
  ["/services/relocation","نقل عفش بالرياض"],["/services/relocation","شركة نقل أثاث بالرياض"],["/services/relocation","نقل عفش من الرياض إلى جدة"],
  ["/services/customs-clearance","التخليص الجمركي في السعودية"],["/services/customs-clearance","التخليص الجمركي في ميناء جدة الإسلامي"],["/services/customs-clearance","متطلبات التخليص الجمركي عبر فسح"],
];
export function SearchOperationsMonitor({baseline,audit,onUnauthorized}:{baseline:Data;audit:SiteAudit|null;onUnauthorized:(error:unknown)=>void}) {
  const [draft,setDraft]=useState<PerformanceFilters>({language:"ar",country:"sau"});
  const [applied,setApplied]=useState<PerformanceFilters>({});
  const active=useRef<PerformanceFilters>({language:"ar",country:"sau"});
  const sequence=useRef(0);
  const [data,setData]=useState<Data|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function load(filters:PerformanceFilters) {
    const id=++sequence.current;setBusy(true);setError("");setData(null);
    try {
      const result=await searchConsoleApi.getDashboard(baseline.startDate,baseline.endDate,true,filters);
      if(id!==sequence.current)return;
      active.current={...filters};setApplied({...filters});setData(result);
    } catch(cause) {
      if(id!==sequence.current)return;
      setError(cause instanceof Error?cause.message:"Filtered report unavailable");
      if((cause as {status?:number})?.status===401)onUnauthorized(cause);
    } finally {if(id===sequence.current)setBusy(false);}
  }
  useEffect(()=>{void load(active.current);return()=>{sequence.current++;};},[baseline.retrievedAt,baseline.startDate,baseline.endDate]);
  const set=(key:keyof PerformanceFilters,value:string)=>setDraft(current=>({...current,[key]:value}));
  const context=(resultSet:string)=>({property:data?.property,start_date:data?.startDate,end_date:data?.endDate,retrieved_at:data?.retrievedAt,filters:JSON.stringify(applied),result_set:resultSet,search_type:"web",data_state:"final"});
  const comparable=!!data&&data.availability?.current!==false&&data.availability?.previous!==false&&equalPeriods(data.startDate,data.endDate,data.previousStartDate,data.previousEndDate);
  const directions=data?["clicks","impressions","ctr","position"].map(key=>compareMetric(data.current[key as keyof Data["current"]] as number,comparable?data.previous[key as keyof Data["previous"]] as number:null,key==="position").direction):[];
  return <>
    <section className="sc-card" data-testid="search-operations-monitor">
      <header className="sc-card-head"><div><div className="sc-eyebrow">Read-only Search Operations</div><h2>Arabic, service and market monitoring</h2>
        <p>Filters are applied to real Search Analytics requests, not joined across unrelated tables. Dates follow the loaded report. A service filter uses its exact current canonical URL; all-page language filters include known historical host variants.</p></div></header>
      <form className="sc-monitor-form" style={{padding:20,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:16}} onSubmit={event=>{event.preventDefault();void load(draft);}}>
        <label>Language<select aria-label="Monitor language" value={draft.language||""} onChange={event=>set("language",event.target.value)}><option value="">English and Arabic</option><option value="en">English</option><option value="ar">Arabic</option></select></label>
        <label>Service<select aria-label="Monitor service" value={draft.page||""} onChange={event=>set("page",event.target.value)}><option value="">All verified public pages</option>{seoIntelligenceResearch.services.filter(service=>publicEnglishPaths.has(service.targetUrlEn)).map(service=><option key={service.priority} value={service.targetUrlEn}>{service.priority}: {service.service}</option>)}</select></label>
        <label>Country (ISO code)<input aria-label="Monitor country" value={draft.country||""} onChange={event=>set("country",event.target.value)} placeholder="sau or SA" /></label>
        <label>Device<select aria-label="Monitor device" value={draft.device||""} onChange={event=>set("device",event.target.value)}><option value="">All devices</option>{["MOBILE","DESKTOP","TABLET"].map(value=><option key={value}>{value}</option>)}</select></label>
        <label>Query contains<input aria-label="Monitor query" value={draft.query||""} maxLength={300} onChange={event=>set("query",event.target.value)} /></label>
        <button className="sc-button" disabled={busy}>{busy?"Loading…":"Apply / refresh filtered data"}</button>
      </form>
      <div style={{padding:20,overflowWrap:"anywhere"}}>
        {error&&<p role="alert">{error}. No previous filtered result is presented as current data.</p>}
        <p>Applied: {JSON.stringify(applied)} · {data?`${data.startDate} — ${data.endDate}; retrieved ${data.retrievedAt}`:"Not retrieved"}</p>
        {data&&<>
          <p>{directions.includes("Improved")&&directions.includes("Worsened")?"Mixed metric directions":comparable?"Comparable periods":"Comparison unavailable"} · previous {data.previousStartDate} — {data.previousEndDate} · web / final · Google reporting dates use Pacific Time.</p>
          {data.endDate<"2026-10-25"&&<p>Pre-deployment baseline relative to the owner-reported 25 October 2026 release; these dates do not measure that release’s effects.</p>}
          <div className="sc-review-grid">{(["clicks","impressions","ctr","position"] as const).map(key=>{
            const meaningful=key==="clicks"||key==="impressions"||data.current.impressions>0;
            const comparison=compareMetric(data.current[key],comparable&&(key==="clicks"||key==="impressions"||data.previous.impressions>0)&&meaningful?data.previous[key]:null,key==="position");
            const format=(value:number)=>key==="ctr"?`${(value*100).toFixed(2)}%`:value.toLocaleString(undefined,{maximumFractionDigits:2});
            return <article className="sc-review-panel" key={key}><h3>{key==="position"?"Average position (lower is better)":key}</h3><b>{data.availability?.current===false||!meaningful?"Unavailable":format(data.current[key])}</b><p>Previous: {data.availability?.previous===false?"Unavailable":format(data.previous[key])}</p><p>Absolute: {comparison.absolute===null?"Unavailable":key==="ctr"?`${(comparison.absolute*100).toFixed(2)} percentage points`:`${comparison.absolute>0?"+":""}${comparison.absolute.toFixed(2)}`}</p><p>{comparison.percent===null?"Percentage unavailable":`${comparison.percent>0?"+":""}${comparison.percent.toFixed(1)}%`} · {comparison.direction}</p></article>;
          })}</div>
          <div className="sc-review-grid">{(["en","ar"] as const).map(language=>{
            const rows=data.pages.filter(row=>classifyPage(row.key)===language);
            return <article key={language} className="sc-review-panel"><h3>{language==="en"?"Default English routes":"Arabic /ar/ routes"}</h3><p>{rows.length?`${rows.length} returned page rows · ${rows.reduce((sum,row)=>sum+row.clicks,0)} clicks · ${rows.reduce((sum,row)=>sum+row.impressions,0)} impressions`:"No matching rows returned — not proof of no demand or indexing"}</p><p>Row sums are not property totals. Path classification does not establish indexing, crawlability or a Google-selected canonical.</p></article>;
          })}</div>
          <p>Country rows: {data.countries.map(row=>countryDisplay(row.key)).join(", ")||"Not returned"}. Query anonymity, row limits, sparse dimensions and property/page aggregation can prevent displayed query totals from matching property totals.</p>
          <button className="sc-button sc-button-outline" disabled={!data.queryPages.length} onClick={()=>downloadCsv("search-operations-query-pages.csv",data.queryPages.map(row=>({...context("filtered_query_page_rows"),...row})))}>Export filtered query-page rows</button>
          <button className="sc-button sc-button-outline" disabled={!data.pages.length} onClick={()=>downloadCsv("search-operations-pages.csv",data.pages.map(row=>({...context("filtered_page_rows"),...row})))}>Export filtered pages</button>
          <div className="sc-table-scroll"><table className="sc-table"><thead><tr><th>Query</th><th>Destination URL</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{data.queryPages.map((row,index)=><tr key={row.query+row.page+index}><td dir="auto">{row.query}</td><td>{row.page}</td><td>{row.clicks}</td><td>{row.impressions}</td><td>{(row.ctr*100).toFixed(2)}%</td><td>{row.position.toFixed(2)}</td></tr>)}</tbody></table></div>
          <h3>Arabic phrase candidates — not measured demand</h3><p>Matches below refer only to the actual filtered query-page rows returned. No match does not mean no searches, traffic or indexing.</p>
          {candidates.map(([path,phrase])=>{
            const rows=data.queryPages.filter(row=>row.page===`https://www.envodkingdom.net/ar${path}`&&row.query.normalize("NFKC").includes(phrase.normalize("NFKC")));
            return <p key={phrase}><span dir="rtl">{phrase}</span> · {path} · {rows.length?`${rows.reduce((sum,row)=>sum+row.clicks,0)} returned clicks / ${rows.reduce((sum,row)=>sum+row.impressions,0)} returned impressions`:"Not present in returned rows"}</p>;
          })}
          <h3>Page performance and separate technical evidence</h3>
          <p>Audit snapshot: {audit?.completedAt||"Not retrieved"}. Stored audits predating sitemap-page extraction show membership as not verified, not absent. URL Inspection and Google-selected canonical results remain in the existing inspection panel.</p>
          <div className="sc-table-scroll"><table><thead><tr><th>Returned URL</th><th>Verified route language</th><th>Clicks / impressions</th><th>CTR / position</th><th>Crawl status</th><th>HTML canonical</th><th>Robots meta</th><th>Sitemap membership</th></tr></thead><tbody>{data.pages.map(row=>{
            const page=audit?.pages.find(page=>page.url===row.key);
            return <tr key={row.key}><td>{row.key}</td><td>{classifyPage(row.key)||"Unknown / excluded"}</td><td>{row.clicks} / {row.impressions}</td><td>{(row.ctr*100).toFixed(2)}% / {row.position.toFixed(2)}</td><td>{page?.status??"Not retrieved"}</td><td>{page?.canonical||"Not retrieved"}</td><td>{page? page.robots||"No robots meta recorded":"Not retrieved"}</td><td>{audit?.sitemapPageUrls?(audit.sitemapPageUrls.includes(row.key)?"Present in snapshot":"Not listed in snapshot"):"Not verified"}</td></tr>;
          })}</tbody></table></div>
        </>}
        <p>Indexing evidence is separate: use the preserved URL Inspection results and technical-audit panels. A sitemap entry is not proof of indexing; a crawl/HTML canonical snapshot is not a Google-selected canonical. A historical non-canonical URL in Search Console is not, by itself, a current redirect defect.</p>
      </div>
    </section>
    <section className="sc-card" data-testid="ai-performance-status"><header className="sc-card-head"><div><div className="sc-eyebrow">Separate reporting surface</div><h2>Generative AI performance — NOT VERIFIED for this account</h2><p>No AI dataset, selected period or retrieval timestamp has been obtained here. Empty standard Search appearance rows do not prove missing AI visibility. No unsupported AI API type or expanded OAuth scope is used.</p>
      <a href={`https://search.google.com/search-console?resource_id=${encodeURIComponent(baseline.property)}`} target="_blank" rel="noopener noreferrer">Open the selected property in Google Search Console</a> · <a href="https://support.google.com/webmasters/answer/16984139" target="_blank" rel="noopener noreferrer">Official Generative AI report documentation</a> · <a href="https://developers.google.com/webmaster-tools/v1/searchanalytics/query" target="_blank" rel="noopener noreferrer">Documented Search Analytics API</a></div></header></section>
  </>;
}

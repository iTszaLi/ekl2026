"""Build evidence-labelled research exports and an offline, searchable explorer."""
import csv
import html
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs/seo-research"
OUTPUT = ROOT / "generated-artifacts/envod-organic-growth"
OUTPUT.mkdir(parents=True, exist_ok=True)
DATE = "2026-10-17"
TRIAD = "https://triadlogistics-sa.com/services"
SHAHEN = "https://shahen-sa.com/"
DAR = "https://www.dar-alshamel.sa/"
NQL = "https://nqlyat.com/ar"
MAERSK = "https://www.maersk.com/support/faqs/what-is-fcl"

# Deliberately curated seeds, not a city × vehicle phrase generator.
# Public terminology observations are not measurements of these exact queries.
CANDIDATES = [
    ("en", "lowbed transport Saudi Arabia", "project-cargo", TRIAD),
    ("en", "flatbed transport Saudi Arabia", "project-cargo", TRIAD),
    ("en", "curtainside transport Saudi Arabia", "gcc-transportation", TRIAD),
    ("en", "closed box truck transport Saudi Arabia", "gcc-transportation", TRIAD),
    ("en", "open box Dyna delivery Riyadh", "gcc-transportation", TRIAD),
    ("en", "refrigerated Dyna transport Riyadh", "temperature-controlled-logistics", TRIAD),
    ("en", "temperature controlled trailer Saudi Arabia", "temperature-controlled-logistics", TRIAD),
    ("en", "car carrier transport Saudi Arabia", "gcc-transportation", "Owner brief seed; external verification pending"),
    ("en", "local B2B distribution Riyadh", "warehousing", "Owner brief seed; scope confirmation pending"),
    ("en", "temperature controlled warehouse Riyadh", "warehousing", "Owner brief seed; facility evidence pending"),
    ("en", "temperature controlled warehouse Jeddah", "warehousing", "Owner brief seed; facility evidence pending"),
    ("en", "temperature controlled warehouse Dammam", "warehousing", "Owner brief seed; facility evidence pending"),
    ("en", "container stuffing and destuffing Saudi Arabia", "warehousing", "Owner brief seed; operator confirmation pending"),
    ("en", "FCL or LCL for Saudi imports", "ocean-freight", MAERSK),
    ("en", "what documents to prepare for Saudi customs clearance", "customs-clearance", "Checked ZATCA instructions; see competitor-gap-analysis.md"),
    ("en", "ATA Carnet exhibition return shipment checklist", "ata-carnet", "Existing preparation guide; exact-query research pending"),
    ("en", "Riyadh dry port inland delivery planning", "customs-clearance", "Official SPA gateway context; exact-query research pending"),
    ("en", "GCC cross border cargo document checklist", "gcc-transportation", "Existing preparation guide; exact-query research pending"),
    ("en", "project cargo lifting and route survey checklist", "project-cargo", "Existing service intent; exact-query research pending"),
    ("en", "refrigerated cargo handover temperature records", "temperature-controlled-logistics", DAR),
    ("ar", "نقل لوبد في السعودية", "project-cargo", NQL),
    ("ar", "نقل معدات ثقيلة بسطحة", "project-cargo", SHAHEN),
    ("ar", "نقل تريلا ستائر", "gcc-transportation", "Arabic vehicle term; exact service intent needs validation"),
    ("ar", "دينا مغلقة لنقل البضائع", "gcc-transportation", SHAHEN),
    ("ar", "دينا شبك داخل الرياض", "gcc-transportation", SHAHEN),
    ("ar", "دينا ثلاجة بالرياض", "temperature-controlled-logistics", SHAHEN),
    ("ar", "نقل دينا مبردة", "temperature-controlled-logistics", DAR),
    ("ar", "نقل سيارات للشركات في السعودية", "gcc-transportation", "Owner brief seed; service intent needs validation"),
    ("ar", "توزيع بضائع للشركات في الرياض", "warehousing", "Owner brief seed; scope confirmation pending"),
    ("ar", "مستودعات مبردة في الرياض", "warehousing", "Owner brief seed; facility evidence pending"),
    ("ar", "تخزين مبرد في جدة", "warehousing", "Owner brief seed; facility evidence pending"),
    ("ar", "مستودعات تبريد في الدمام", "warehousing", "Owner brief seed; facility evidence pending"),
    ("ar", "تحميل وتفريغ الحاويات", "warehousing", "Owner brief seed; operator confirmation pending"),
    ("ar", "الفرق بين الحاوية الكاملة والشحن الجزئي", "ocean-freight", MAERSK),
    ("ar", "مستندات فسح البضائع في السعودية", "customs-clearance", "Checked ZATCA instructions; see competitor-gap-analysis.md"),
    ("ar", "تجهيز كارنيه ATA للمعارض", "ata-carnet", "Existing preparation guide; exact-query research pending"),
    ("ar", "نقل بضائع الميناء الجاف بالرياض", "customs-clearance", "Official SPA gateway context; exact-query research pending"),
    ("ar", "أوراق الشحن البري بين دول الخليج", "gcc-transportation", "Existing preparation guide; exact-query research pending"),
    ("ar", "متطلبات نقل حمولات المشاريع", "project-cargo", "Existing service intent; exact-query research pending"),
    ("ar", "سجل درجات الحرارة عند تسليم الشحنة", "temperature-controlled-logistics", DAR),
]

with (DOCS / "bilingual-keyword-database.csv").open(encoding="utf-8-sig") as handle:
    base = list(csv.DictReader(handle))

records = []
for row in base:
    supplied = "User-provided SAL" in row["evidence_source"]
    records.append({
        **row,
        "volume_source": row["evidence_source"] if supplied and row["volume"] != "Unavailable" else "Unavailable",
        "difficulty_source": row["evidence_source"] if supplied and row["difficulty"] != "Unavailable" else "Unavailable",
        "metric_market_and_date": "Unspecified in supplied SAL report" if supplied else "No keyword-tool measurement",
        "actual_ranking_competitors": "Unavailable — no Saudi Google rank-tracker data",
        "observed_web_pages": row["evidence_source"] if row["evidence_source"].startswith("https://") else "See supplied benchmark provenance",
        "conversion_potential": "Commercial planning estimate; unvalidated" if row["priority"] in ("P1", "P2") else "Research / lower commercial certainty",
        "evidence_status": "Existing mapped opportunity; exact-query Saudi demand unverified",
        "capability_gate": "Existing copy is not proof of regulated credentials, equipment or city premises",
        "recorded_on": DATE,
    })

backlog = []
for index, (language, query, service, source) in enumerate(CANDIDATES):
    guide = index % 20 >= 13
    target = ("/ar" if language == "ar" else "") + "/services/" + service
    if service == "ocean-freight": target += "#fcl-lcl-comparison"
    elif guide: target += "#shipment-preparation"
    row = {
        "keyword": query, "language": language,
        "intent": "Informational / commercial preparation" if guide else "Transactional research candidate",
        "location": "Saudi Arabia; named city where specified", "service": service,
        "volume": "Unavailable", "difficulty": "Unavailable",
        "current_rank": "Unavailable — no verified ENVOD rank",
        "target_URL": target, "priority": "P1" if guide else "P2",
        "evidence_source": source,
        "notes": "Curated backlog, not proven demand or a claim that ENVOD owns/provides the named equipment. Arabic terms researched separately; sources establish terminology only.",
        "volume_source": "Unavailable", "difficulty_source": "Unavailable",
        "metric_market_and_date": "No keyword-tool measurement",
        "actual_ranking_competitors": "Unavailable — no Saudi Google rank-tracker data",
        "observed_web_pages": source if source.startswith("https://") else "Not established",
        "conversion_potential": "Potential business enquiry; unvalidated",
        "evidence_status": "Research backlog — exact-query demand unmeasured; source confidence in research log",
        "capability_gate": "Preparation guidance only; confirm any operational scope" if guide else "Hold promotional targeting until vehicle/operator/facility/coverage is confirmed",
        "recorded_on": DATE,
    }
    backlog.append(row)
    records.append(row)

def key(row):
    query = "".join(c for c in unicodedata.normalize("NFKC", row["keyword"]) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", query.casefold()).strip(), row["language"], row["intent"]

seen = set()
unique = []
for row in records:
    if key(row) not in seen:
        seen.add(key(row))
        unique.append(row)
unique.sort(key=lambda r: (r["priority"], r["language"], r["service"], r["keyword"]))
fields = list(unique[0])

def write_csv(name, rows, columns=fields):
    with (DOCS / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

write_csv("ksa-organic-keyword-database.csv", unique)
write_csv("keyword-research-backlog.csv", backlog)
mapping_columns = ["keyword", "language", "intent", "service", "target_URL", "priority", "evidence_status", "capability_gate"]
for language in ("en", "ar"):
    write_csv(f"keyword-to-page-{language}.csv", [r for r in unique if r["language"] == language], mapping_columns)

opportunities = json.loads((DOCS / "backlink-opportunity-sources.json").read_text())
for row in opportunities:
    row.update(checked_on=DATE, current_status="Not contacted — owner approval pending",
               contacted_on="", placement_URL="", link_attributes="Unconfirmed", outcome="No submission or placement",
               owner="Unassigned")
write_csv("backlink-outreach-tracker.csv", opportunities, list(opportunities[0]))

display = ["keyword", "language", "intent", "service", "target_URL", "priority", "evidence_status"]
table = "".join(
    "<tr data-row='" + str(i) + "'>" + "".join("<td dir='auto'>" + html.escape(str(r[k])) + "</td>" for k in display) + "</tr>"
    for i, r in enumerate(unique)
)
data = json.dumps(unique, ensure_ascii=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
page = """<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ENVOD Saudi keyword research explorer</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f6f9;color:#172638;font:15px/1.55 system-ui,sans-serif}
header{background:#102538;color:white;border-top:6px solid #e0272c;padding:32px max(20px,4vw)}h1{margin:6px 0;font-size:clamp(24px,4vw,38px)}
header p{max-width:960px;color:#cfdae4}main{padding:24px max(20px,4vw)}.filters{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:14px}
label{display:grid;gap:5px;font-weight:650}input,select,button{font:inherit;border:1px solid #b6c4d1;border-radius:6px;padding:10px;background:white;color:#172638}
.filters>*{min-width:0}.filters>div{display:grid;gap:5px}input,select{width:100%;min-width:0}
button{cursor:pointer;background:#17456f;color:white}button.secondary{background:white;color:#17456f}
.toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:20px 0}.table{overflow:auto;background:white;border:1px solid #d6dfe8;border-radius:8px}
table{border-collapse:collapse;width:100%;min-width:1100px}th,td{text-align:start;border-bottom:1px solid #e2e7ed;padding:13px;vertical-align:top}
thead{background:#e9eef4}td:nth-child(1){font-weight:650;min-width:220px}td:nth-child(5){font-size:12px;overflow-wrap:anywhere;min-width:200px}
.notice{border-left:4px solid #e0272c;padding:14px;background:#fff;margin-bottom:24px}.small{font-size:13px;color:#52657a}
@media(max-width:760px){.filters{grid-template-columns:1fr 1fr}.filters>div:first-child{grid-column:1/-1}}
</style><header><div>ENVOD KINGDOM · INTERNAL RESEARCH · 17 OCTOBER 2026</div>
<h1>Saudi keyword research explorer</h1><p>Search English and Arabic opportunities by phrase, service, language and priority. This is an offline research export, not a live ranking tracker.</p></header>
<main><div class="notice"><strong>No invented demand or ranking data.</strong> New seeds are a research backlog. SAL estimates retain their separate source and unspecified market/date. Vehicle and facility terms do not establish ENVOD capabilities. Target paths may contain workspace-only sections pending publication.</div>
<div class="filters"><div><label for="query">Search / ابحث</label><input id="query" type="search" placeholder="Query, intent, city or service"></div>
<div><label for="language">Language / اللغة</label><select id="language"><option value="">All languages</option><option value="en">English</option><option value="ar">العربية</option></select></div>
<div><label for="service">Service / الخدمة</label><select id="service"><option value="">All services</option></select></div>
<div><label for="priority">Priority / الأولوية</label><select id="priority"><option value="">All priorities</option><option>P1</option><option>P2</option><option>P3</option></select></div></div>
<div class="toolbar"><strong id="count" role="status" aria-live="polite">__COUNT__ opportunities</strong><button id="export" type="button">Export filtered CSV</button><button id="reset" class="secondary" type="button">Reset filters</button></div>
<p class="small">CSV export includes all evidence, volume/difficulty sources, capability gates and unavailable-ranking fields. No analytics, remote fonts, network requests or external scripts are used.</p>
<div class="table" role="region" aria-label="Keyword opportunity results" tabindex="0"><table><caption class="small">English and Arabic topic clusters — not separate-page recommendations for every phrase</caption>
<thead><tr><th scope="col">Query</th><th scope="col">Language</th><th scope="col">Intent</th><th scope="col">Service</th><th scope="col">Target path</th><th scope="col">Priority</th><th scope="col">Evidence status</th></tr></thead><tbody>__TABLE__</tbody></table></div>
<noscript><p>All rows are shown. JavaScript is required only for filtering and exporting.</p></noscript></main>
<script type="application/json" id="records">__DATA__</script><script>
const records=JSON.parse(document.getElementById('records').textContent),rows=Array.from(document.querySelectorAll('tbody tr'));
const query=document.getElementById('query'),language=document.getElementById('language'),service=document.getElementById('service'),priority=document.getElementById('priority');
for(const value of Array.from(new Set(records.map(r=>r.service))).sort()){const o=document.createElement('option');o.value=value;o.textContent=value;service.append(o);}
let matched=records;
function filter(){const q=query.value.normalize('NFKC').toLowerCase().trim();matched=[];records.forEach((r,i)=>{const show=(!q||[r.keyword,r.intent,r.location,r.service,r.target_URL].join(' ').normalize('NFKC').toLowerCase().includes(q))&&(!language.value||r.language===language.value)&&(!service.value||r.service===service.value)&&(!priority.value||r.priority===priority.value);rows[i].hidden=!show;if(show)matched.push(r);});document.getElementById('count').textContent=matched.length+' of '+records.length+' opportunities';}
for(const el of [query,language,service,priority])el.addEventListener(el===query?'input':'change',filter);
document.getElementById('reset').onclick=()=>{for(const el of [query,language,service,priority])el.value='';filter();query.focus();};
document.getElementById('export').onclick=()=>{const fields=Object.keys(records[0]);const cell=(v)=>{v=String(v??'');if(/^[=+@-]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};const csv=[fields,...matched.map(r=>fields.map(f=>r[f]))].map(r=>r.map(cell).join(',')).join('\\r\\n');const u=URL.createObjectURL(new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='envod-filtered-keywords.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
filter();
</script></html>"""
page = page.replace("__COUNT__", str(len(unique))).replace("__TABLE__", table).replace("__DATA__", data)
(OUTPUT / "keyword-explorer.html").write_text(page, encoding="utf-8")
summary = {
    "recorded_on": DATE, "keyword_rows": len(unique), "existing_rows": len(base),
    "new_backlog_candidates": len(backlog), "normalized_duplicates_removed": len(records) - len(unique),
    "english_rows": sum(r["language"] == "en" for r in unique),
    "arabic_rows": sum(r["language"] == "ar" for r in unique),
    "public_backlink_pathways": 7, "chamber_research_candidates": 3,
    "outreach_sent": 0, "profiles_updated": 0, "backlinks_acquired": "Unmeasured; no submissions made",
    "first_party_google_data": "No attached or already-authorized connection returned",
}
(DOCS / "organic-growth-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))

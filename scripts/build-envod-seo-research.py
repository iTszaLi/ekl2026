"""Reproducible import of the owner-supplied benchmark and local page audit.

No network access, search-volume inference, or ENVOD rank estimation.
"""
import csv
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/seo-research"
SOURCE = ROOT / "attached_assets/Pasted--REPLIT-MASTER-PROMPT-ENVOD-KINGDOM-SEO-AEO-GEO-COMPETI_1792240483487.txt"
PUBLIC = ROOT / "artifacts/envod-kingdom/dist/public"
OUT.mkdir(parents=True, exist_ok=True)


def save_csv(name, headers, rows):
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


pattern = re.compile(
    r"^\d+\. `([^`]+)` — Difficulty (\d+), Volume ([^,]+), CPC \$([\d.]+), "
    r"Traffic (\d+), Position ([^,]+), URL ([^,]+), Updated (.+)\.$", re.M
)
benchmark = pattern.findall(SOURCE.read_text())
assert len(benchmark) == 40, f"Expected all 40 supplied rows; found {len(benchmark)}"
assert len({row[0] for row in benchmark}) == 40, "Duplicate benchmark keyword"
save_csv("sal-competitor-keywords.csv",
         ["keyword", "difficulty", "volume", "CPC_USD", "traffic", "position", "ranking_URL", "updated"],
         benchmark)

SAL_ONLY = {"sal", "sal logistics", "sal careers", "sal tadawul", "سال",
            "شركة سال السعودية للخدمات اللوجستية", "الشركة السعودية للخدمات اللوجستية"}
AMBIGUOUS = {"saudi logistics company", "saudi logistics", "saudi cargo", "cargo saudi"}
LISTS = {"top 10 logistics companies in saudi arabia",
         "list of logistics companies in saudi arabia"}
DISPOSITIONS = []
opportunities = []
PROVENANCE = "User-provided SAL competitor data; report date/tool/market unspecified"


def add(keyword, language, intent, location, source, url, priority,
        evidence, volume="Unavailable", difficulty="Unavailable", role="secondary"):
    opportunities.append([keyword, language, intent, location, source, volume,
                          difficulty, url, url, role, priority, evidence])


for keyword, difficulty, volume, cpc, traffic, position, url, updated in benchmark:
    if keyword in SAL_ONLY:
        DISPOSITIONS.append([keyword, "Exclude", "", "SAL navigational/employment/investor intent; competitor benchmark only"])
        continue
    if keyword in AMBIGUOUS:
        DISPOSITIONS.append([keyword, "Hold for intent validation", "", "Possible company/airline navigation; do not assume generic commercial intent"])
        continue
    if keyword in LISTS:
        DISPOSITIONS.append([keyword, "Educational research only", "", "Do not claim a top-ten position; any future comparison needs transparent independent criteria"])
        continue
    target = "/"
    intent = "Commercial investigation"
    priority = "P1"
    if "freight forwarder" in keyword:
        target = "/services/freight-forwarding"
    elif keyword in {"cargo shipping", "cargo saudi arabia"}:
        target = "/services/freight-forwarding"
    elif keyword == "logistics transportation":
        target = "/services/gcc-transportation"
    elif "service" in keyword or "shipping" in keyword:
        target = "/services"
    if keyword in {"logistic", "logistics", "logestic", "logistic companies"}:
        priority = "P3"
    location = next((city.title() for city in ["riyadh", "jeddah", "dammam"] if city in keyword), "Saudi Arabia")
    note = "Competitor estimates only; ENVOD rank and demand unverified; retain existing URL"
    if keyword == "logestic":
        note += "; spelling variant only, never an exact-match headline"
    if location != "Saudi Arabia":
        note += "; no verified branch or separate city page"
    add(keyword, "en", intent, location, PROVENANCE, target, priority, note, volume, difficulty)
    DISPOSITIONS.append([keyword, "Optimize existing page", target, note])

save_csv("sal-keyword-disposition.csv",
         ["keyword", "action", "preferred_ENVOD_URL", "rationale"], DISPOSITIONS)
assert len(DISPOSITIONS) == 40

# Natural service terms are planning hypotheses unless separately backed by data.
# A competitor page establishes topic relevance, never numerical search demand.
SERVICES = [
    ("ocean-freight", "sea freight Saudi Arabia", "الشحن البحري في السعودية", "https://www.saadlogistic.com/", "P1"),
    ("air-freight", "air freight Saudi Arabia", "الشحن الجوي في السعودية", "https://www.saadlogistic.com/", "P1"),
    ("gcc-transportation", "GCC road freight Saudi Arabia", "النقل بين السعودية ودول الخليج", "https://gbe.sa/", "P1"),
    ("customs-clearance", "customs clearance Saudi Arabia", "خدمات التخليص الجمركي في السعودية", "https://www.saadlogistic.com/customs-clearance-saudi-arabia", "P1"),
    ("warehousing", "warehousing and distribution Saudi Arabia", "خدمات التخزين والتوزيع في السعودية", "https://sal.sa/fulfillment-services", "P1"),
    ("freight-forwarding", "freight forwarder in Saudi Arabia", "وكيل شحن في السعودية", "https://gbe.sa/", "P1"),
    ("supply-chain", "supply chain logistics Saudi Arabia", "إدارة سلسلة الإمداد في السعودية", "https://sal.sa/fulfillment-services", "P2"),
    ("project-cargo", "project cargo Saudi Arabia", "شحن معدات المشاريع في السعودية", "https://alhamdaanlogistics.com/", "P2"),
    ("relocation", "house moving and corporate relocation Saudi Arabia", "نقل أثاث ومكاتب في السعودية", "https://aljawad.sa.com/", "P2"),
    ("ecommerce-logistics", "ecommerce fulfillment Saudi Arabia", "تجهيز طلبات المتاجر الإلكترونية في السعودية", "https://sal.sa/fulfillment-services", "P2"),
    ("exhibition-logistics", "exhibition logistics Saudi Arabia", "لوجستيات المعارض والفعاليات في السعودية", "https://www.smilogistics.com/fairs-exhibition-logistics", "P1"),
    ("medical-pharma", "pharmaceutical logistics Saudi Arabia", "نقل الأدوية في السعودية", "https://wtm.sa/en/services/pharma-transport", "P2"),
    ("food-fmcg", "food logistics Saudi Arabia", "نقل وتخزين المواد الغذائية في السعودية", "Existing ENVOD catalog; hypothesis", "P2"),
    ("pet-animal-import", "pet import logistics Saudi Arabia", "إجراءات شحن الحيوانات الأليفة إلى السعودية", "Existing ENVOD catalog; hypothesis", "P3"),
    ("breakbulk-shipping", "breakbulk shipping Saudi Arabia", "شحن البضائع غير المحواة في السعودية", "Existing ENVOD catalog; hypothesis", "P2"),
    ("dangerous-goods", "dangerous goods shipping Saudi Arabia", "شحن البضائع الخطرة في السعودية", "https://sal.sa/sal-handling", "P2"),
    ("oog-cargo", "out of gauge cargo Saudi Arabia", "شحن الحمولات ذات الأبعاد الاستثنائية", "Existing ENVOD catalog; hypothesis", "P2"),
    ("roro-shipping", "RoRo vehicle shipping Saudi Arabia", "شحن المركبات بنظام رورو إلى السعودية", "Existing ENVOD catalog; hypothesis", "P2"),
    ("ata-carnet", "ATA Carnet Saudi Arabia", "خدمات كرنية ATA في السعودية", "https://www.smilogistics.com/fairs-exhibition-logistics", "P1"),
    ("white-glove-logistics", "white glove delivery Saudi Arabia", "نقل ومناولة المقتنيات الحساسة في السعودية", "Existing ENVOD catalog; hypothesis", "P3"),
    ("temperature-controlled-logistics", "temperature controlled transport Saudi Arabia", "نقل مبرد ومجمد في السعودية", "https://www.saadlogistic.com/refrigerated-transport-saudi-arabia", "P2"),
    ("packaging-crating", "export packing and crating Saudi Arabia", "تغليف وتعبئة البضائع للتصدير في السعودية", "https://aljawad.sa.com/", "P2"),
    ("express-courier", "express cargo delivery Saudi Arabia", "شحن سريع للبضائع في السعودية", "https://sbt.sa/", "P2"),
    ("cross-trade-shipping", "cross trade shipping Saudi Arabia", "الشحن بين دولتين عبر وكيل في السعودية", "Existing ENVOD catalog; hypothesis", "P3"),
]

for slug, english, arabic, source, priority in SERVICES:
    for keyword, language in [(english, "en"), (arabic, "ar")]:
        url = ("/ar" if language == "ar" else "") + "/services/" + slug
        add(keyword, language, "Transactional", "Saudi Arabia", source, url, priority,
            "Topic relevance observed or catalog-derived; exact-query demand and ENVOD rank unverified",
            role="primary")

EXTRAS = [
    ("logistics services in Saudi Arabia", "خدمات لوجستية في السعودية", "/services", "Transactional", "P1"),
    ("ENVOD KINGDOM", "إنفود كينغدوم", "/", "Navigational", "P1"),
    ("ENVOD KINGDOM LOGISTICS", "إنفود كينغدوم للخدمات اللوجستية", "/about", "Navigational", "P1"),
    ("ENVOD KINGDOM SHIPPING SERVICES LLC", "إنفود كينغدوم لخدمات الشحن", "/contact", "Navigational", "P1"),
    ("Saudi import documentation", "مستندات الاستيراد في السعودية", "/services/customs-clearance", "Informational", "P1"),
    ("SABER documentation support", "المستندات المطلوبة لسابر", "/services/customs-clearance", "Informational", "P1"),
    ("SFDA import documentation", "مستندات فسح منتجات هيئة الغذاء والدواء", "/services/customs-clearance", "Informational", "P1"),
    ("Fasah customs declaration", "البيان الجمركي في منصة فسح", "/services/customs-clearance", "Informational", "P1"),
    ("3PL logistics Saudi Arabia", "خدمات الطرف الثالث اللوجستية في السعودية", "/services/warehousing", "Transactional", "P2"),
    ("last mile B2B delivery Saudi Arabia", "توزيع البضائع للشركات في السعودية", "/services/warehousing", "Transactional", "P2"),
    ("domestic cargo transportation Saudi Arabia", "النقل البري داخل السعودية", "/services/gcc-transportation", "Transactional", "P2"),
    ("temperature controlled storage Saudi Arabia", "تخزين مبرد في السعودية", "/services/temperature-controlled-logistics", "Transactional", "P2"),
    ("shipping quote Saudi Arabia", "طلب عرض سعر شحن في السعودية", "/contact", "Transactional", "P1"),
]
for en, ar, target, intent, priority in EXTRAS:
    for keyword, language in [(en, "en"), (ar, "ar")]:
        url = ("/ar" if language == "ar" else "") + (target if target != "/" or language == "en" else "")
        source = "Brief and existing catalog; keyword hypothesis"
        if "Fasah" in en or "import documentation" in en:
            source = "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx"
        evidence = "Demand/rank unverified; confirm exact operational capability before expanding"
        if target == "/services/gcc-transportation":
            evidence += "; existing page includes domestic scope; dedicated domestic page conditional on verified fleet/service details"
        add(keyword, language, intent, "Saudi Arabia", source, url, priority, evidence)

for city, arabic_city in [("Riyadh", "الرياض"), ("Jeddah", "جدة"), ("Dammam", "الدمام")]:
    for en, ar, target in [
        (f"logistics company in {city}", f"شركة لوجستية في {arabic_city}", "/"),
        (f"customs clearance {city}", f"تخليص جمركي {arabic_city}", "/services/customs-clearance"),
    ]:
        for keyword, language in [(en, "en"), (ar, "ar")]:
            target_url = ("/ar" if language == "ar" else "") + (target if target != "/" or language == "en" else "")
            add(keyword, language, "Transactional", city, "Independent city-query research and brief",
                target_url, "P1", "Service-area intent; no verified branch; no thin city page")

# Retain first source metrics but prefer deliberate primary roles where repeated.
unique = {}
for row in opportunities:
    key = (row[0].casefold(), row[1])
    if key not in unique:
        unique[key] = row
    elif row[9] == "primary":
        unique[key][9] = "primary"
opportunities = list(unique.values())
HEADERS = ["keyword", "language", "intent", "location", "source", "volume", "difficulty",
           "current ENVOD URL", "recommended URL", "primary/secondary", "priority", "evidence status"]
save_csv("envod-keyword-opportunity-map.csv", HEADERS, opportunities)


class AuditPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.headings = []
        self.links = []
        self.images = []
        self.jsonld = []
        self.mode = None
        self.buffer = ""
        self.html = {}
        self.canonical = ""
        self.hreflangs = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "html":
            self.html = d
        if tag == "meta" and d.get("name") == "description":
            self.description = d.get("content", "")
        if tag == "link" and d.get("rel") == "canonical":
            self.canonical = d.get("href", "")
        if tag == "link" and d.get("hreflang"):
            self.hreflangs.append(d)
        if tag == "a":
            self.links.append(d.get("href", ""))
        if tag == "img":
            self.images.append(d)
        if tag == "title" or re.fullmatch(r"h[1-6]", tag) or (tag == "script" and d.get("type") == "application/ld+json"):
            self.mode = tag
            self.buffer = ""

    def handle_data(self, text):
        if self.mode:
            self.buffer += text

    def handle_endtag(self, tag):
        if tag != self.mode:
            return
        text = self.buffer.strip()
        if tag == "title":
            self.title = text
        elif tag == "script":
            self.jsonld.append(json.loads(text))
        else:
            self.headings.append((int(tag[1]), text))
        self.mode = None


audit = {}
for file in PUBLIC.rglob("index.html"):
    path = "/" + str(file.parent.relative_to(PUBLIC))
    if path == "/.":
        path = "/"
    page = AuditPage()
    page.feed(file.read_text())
    audit[path] = page

page_rows = []
for path, p in sorted(audit.items()):
    if path == "/ar" or path.startswith("/ar/"):
        continue
    ar = audit.get("/ar" + (path if path != "/" else ""))
    primary = next((r[0] for r in opportunities if r[8] == path and r[9] == "primary"),
                   next((r[0] for r in opportunities if r[8] == path), "Existing page; map intent before expansion"))
    secondary = "; ".join(r[0] for r in opportunities if r[8] == path and r[0] != primary)
    primary_intent = next((r[2] for r in opportunities if r[8] == path and r[0] == primary),
                          "Informational / navigational; review page purpose")
    skipped = any(b[0] > a[0] + 1 for a, b in zip(p.headings, p.headings[1:]))
    page_rows.append([path, primary, primary_intent, secondary, p.title, p.description,
                      ar.title if ar else "", ar.description if ar else "",
                      " | ".join(s for n, s in p.headings if n == 1),
                      "Heading skip observed" if skipped else "No heading skip in rendered markup",
                      "; ".join(sorted({l for l in p.links if "/services/" in l or "/contact" in l})),
                      "Phone/WhatsApp/contact links; test actual form delivery",
                      "First-party Search Console/analytics unavailable",
                      "Verify numerical/credential/capability claims and professional Arabic copy"])
save_csv("keyword-to-page-map.csv",
         ["existing_URL", "primary_keyword", "primary_intent", "secondary_keywords", "English_title",
          "English_meta_description", "Arabic_title", "Arabic_meta_description", "H1",
          "heading_hierarchy", "related_service_contact_links", "conversion_path",
          "search_performance_baseline", "evidence_and_content_gaps"], page_rows)

raw_claims = []
claim_pattern = re.compile(r"(?:25\+|50\+|200\+|500\+|99\.8|24/7|certified|licensed|guaranteed|ISO 9001|معتمد|مرخص)", re.I)
for file in (ROOT / "artifacts/envod-kingdom/src").rglob("*.tsx"):
    if "/ui/" in str(file):
        continue
    for line_number, line in enumerate(file.read_text().splitlines(), 1):
        if claim_pattern.search(line) and not line.strip().startswith(("import ", "//")):
            raw_claims.append([str(file.relative_to(ROOT)), line_number, line.strip()[:1600], "Unverified candidate; review in context", "Owner documentary evidence or remove/qualify EN+AR"])
for file in (ROOT / "artifacts/envod-kingdom/src/lib").rglob("*.ts"):
    for line_number, line in enumerate(file.read_text().splitlines(), 1):
        if claim_pattern.search(line) and not line.strip().startswith(("import ", "//")):
            raw_claims.append([str(file.relative_to(ROOT)), line_number, line.strip()[:1600], "Unverified candidate; review in context", "Owner documentary evidence or remove/qualify EN+AR"])
save_csv("business-claims-candidates.csv", ["file", "line", "candidate", "status", "required_action"], raw_claims)

summary = {
    "supplied_benchmark_rows": len(benchmark), "benchmark_dispositions": len(DISPOSITIONS),
    "opportunity_rows": len(opportunities), "english_pages_audited": len(page_rows),
    "built_pages": len(audit), "claims_candidates_for_review": len(raw_claims),
    "metrics_note": "SAL estimates are user-supplied; no ENVOD ranking or performance inferred.",
}
(OUT / "audit-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))

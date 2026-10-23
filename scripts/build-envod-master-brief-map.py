"""Derive traceable master-brief exports without inventing demand or operations."""
import csv
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / "docs/seo-research"
with (out / "envod-keyword-opportunity-map.csv").open(encoding="utf-8-sig") as handle:
    reader = csv.reader(handle)
    headings = next(reader)
    opportunities = list(reader)
assert len(headings) == 12 and len(opportunities) >= 109, headings

with (out / "bilingual-keyword-database.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(["keyword", "language", "intent", "location", "service", "volume", "difficulty",
                     "current_rank", "target_URL", "priority", "evidence_source", "notes"])
    for row in opportunities:
        keyword, language, intent, location, source, volume, difficulty, current, target, role, priority, evidence = row
        service = target.split("#")[0].rstrip("/").split("/")[-1]
        if service in ("", "ar"): service = "General logistics / brand"
        writer.writerow([keyword, language, intent, location, service, volume, difficulty,
                         "Unavailable — no verified ENVOD rank", target, priority, source, f"{role}; {evidence}"])

services = [
    ("General Logistics Services", "/services"),
    ("Customs Clearance Saudi Arabia", "/services/customs-clearance"),
    ("Customs Clearance Riyadh", "/services/customs-clearance#gateway-riyadh"),
    ("Customs Clearance Jeddah / Jeddah Islamic Port", "/services/customs-clearance#gateway-jeddah"),
    ("Customs Clearance Dammam / King Abdulaziz Port", "/services/customs-clearance#gateway-dammam"),
    ("Ocean Freight", "/services/ocean-freight"),
    ("Air Freight", "/services/air-freight"),
    ("Freight Forwarding", "/services/freight-forwarding"),
    ("ATA Carnet Processing", "/services/ata-carnet"),
    ("Exhibition and Event Logistics", "/services/exhibition-logistics"),
    ("GCC Transportation", "/services/gcc-transportation"),
    ("Domestic Transportation", "/services/gcc-transportation"),
    ("3PL Logistics", "/services/warehousing"),
    ("Warehousing and Distribution", "/services/warehousing"),
    ("Temperature-Controlled Warehousing", "/services/warehousing"),
    ("Temperature-Controlled Transportation", "/services/temperature-controlled-logistics"),
    ("Supply Chain Management", "/services/supply-chain"),
    ("Project Cargo", "/services/project-cargo"),
    ("Breakbulk Shipping", "/services/breakbulk-shipping"),
    ("Oversized / Out-of-Gauge Cargo", "/services/oog-cargo"),
    ("RoRo Shipping", "/services/roro-shipping"),
    ("Dangerous Goods Logistics", "/services/dangerous-goods"),
    ("Door-to-Door Shipping", "/services/freight-forwarding"),
    ("Container Stuffing and De-stuffing", "/services/warehousing"),
    ("Vessel Chartering", "/services/ocean-freight"),
    ("Packaging and Crating", "/services/packaging-crating"),
    ("White-Glove Logistics", "/services/white-glove-logistics"),
    ("Express Courier", "/services/express-courier"),
    ("Cross-Trade Shipping", "/services/cross-trade-shipping"),
    ("Medical and Pharmaceutical Logistics", "/services/medical-pharma"),
    ("Food and FMCG Logistics", "/services/food-fmcg"),
    ("Pet and Animal Import Logistics", "/services/pet-animal-import"),
    ("E-commerce Logistics", "/services/ecommerce-logistics"),
    ("House Moving and Corporate Relocation", "/services/relocation"),
    ("Local Distribution and B2B Delivery", "/services/warehousing"),
]
shared_intents = {12, 13, 15, 23, 24, 25, 35}
with (out / "master-service-coverage-map.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(["brief_item", "service", "existing_English_destination", "existing_Arabic_destination",
                     "implementation_disposition", "business_evidence_status", "standalone_page_gate"])
    for index, (service, path) in enumerate(services, 1):
        writer.writerow([index, service, path, "/ar" + path,
                         "Shared existing pillar; standalone expansion pending" if index in shared_intents
                         else "Existing service page or distinct gateway section retained",
                         "Existing content is not proof of licenses, facilities or operational capability",
                         "Unique user need + confirmed scope/operator + useful EN/AR content; no speculative branch"])
print(f"Exported {len(opportunities)} bilingual keyword rows and all {len(services)} requested service dispositions.")

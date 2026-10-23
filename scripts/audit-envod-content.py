"""Read-only built-site inventory, complementing HTTP/browser SEO verification."""
import argparse
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "artifacts/envod-kingdom/dist/public"

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.images, self.ids, self.headings, self.text = [], [], [], [], []
        self.script_depth = 0
        self.title, self.description, self.canonical = "", "", ""
        self.capture_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script": self.script_depth += 1
        if tag == "title": self.capture_title = True
        if attrs.get("id"): self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href"): self.links.append(attrs["href"])
        if tag == "img": self.images.append(attrs)
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"): self.headings.append(tag)
        if tag == "meta" and attrs.get("name") == "description": self.description = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical": self.canonical = attrs.get("href", "")

    def handle_endtag(self, tag):
        if tag == "script": self.script_depth = max(0, self.script_depth - 1)
        if tag == "title": self.capture_title = False

    def handle_data(self, text):
        if self.capture_title: self.title += text
        if not self.script_depth and text.strip(): self.text.append(text.strip())

parser = argparse.ArgumentParser()
parser.add_argument("--output", default="docs/seo-research/controlled-stage-1-audit.json")
args = parser.parse_args()
pages = {}
for file in PUBLIC.rglob("index.html"):
    route = "/" + str(file.parent.relative_to(PUBLIC)).replace("\\", "/")
    if route == "/.": route = "/"
    p = Page()
    p.feed(file.read_text())
    pages[route.rstrip("/") or "/"] = p
assert len(pages) == 92, f"Unexpected content-route inventory: {len(pages)}"

broken_links, broken_fragments, missing_alts, missing_sizes, missing_images = [], [], [], [], []
duplicate_titles, duplicate_descriptions = {}, {}
inventory = []
for route, page in pages.items():
    inventory.append({
        "route": route, "title": page.title, "description": page.description,
        "canonical": page.canonical, "h1_count": page.headings.count("h1"),
        "image_count": len(page.images), "link_count": len(page.links),
        "fragment_ids": sorted(set(page.ids)),
        "image_sources": [image.get("src", "") for image in page.images],
    })
    for href in page.links:
        if href.startswith(("mailto:", "tel:", "javascript:", "data:")): continue
        url = urlsplit(urljoin("https://audit.invalid" + route, href))
        if url.netloc != "audit.invalid": continue
        target = unquote(url.path).rstrip("/") or "/"
        if target in pages:
            if url.fragment and unquote(url.fragment) not in pages[target].ids:
                broken_fragments.append({"from": route, "href": href})
        elif not (PUBLIC / target.lstrip("/")).is_file():
            broken_links.append({"from": route, "href": href})
    for image in page.images:
        if "alt" not in image: missing_alts.append({"route": route, "src": image.get("src")})
        if not image.get("width") or not image.get("height"):
            missing_sizes.append({"route": route, "src": image.get("src")})
        src = urlsplit(image.get("src", ""))
        if src.path.startswith("/") and not src.netloc and not (PUBLIC / unquote(src.path).lstrip("/")).is_file():
            missing_images.append({"route": route, "src": image.get("src")})

for name, result in [("title", duplicate_titles), ("description", duplicate_descriptions)]:
    for value, count in Counter(getattr(p, name) for p in pages.values()).items():
        if count > 1: result[value] = [route for route, p in pages.items() if getattr(p, name) == value]

priorities = ["customs-clearance", "exhibition-logistics", "ata-carnet", "freight-forwarding", "ocean-freight", "gcc-transportation"]
claim_pattern = re.compile(r"24\s*(?:hours|hour)|24 ساعة|25\s*(?:years|عام)|25\+|licensed|certified|dedicated fleet|owned fleet", re.I)
priority_claims = []
for route, page in pages.items():
    if any(route.endswith("/services/" + slug) for slug in priorities):
        for text in page.text:
            if claim_pattern.search(text):
                priority_claims.append({"route": route, "text": text})

report = {
    "scope": "All 92 built content URLs; read-only static audit, not a production indexing/ranking report",
    "counts": {"routes": len(pages), "english": sum(not r.startswith("/ar") for r in pages),
               "arabic": sum(r.startswith("/ar") for r in pages), "broken_internal_links": len(broken_links),
               "broken_fragments": len(broken_fragments), "missing_image_files": len(missing_images),
               "images_missing_alt": len(missing_alts), "images_missing_dimensions": len(missing_sizes),
               "duplicate_title_groups": len(duplicate_titles), "duplicate_description_groups": len(duplicate_descriptions),
               "priority_claim_review_candidates": len(priority_claims)},
    "inventory": sorted(inventory, key=lambda r: r["route"]),
    "broken_internal_links": broken_links, "broken_fragments": broken_fragments,
    "missing_image_files": missing_images, "images_missing_alt": missing_alts,
    "images_missing_dimensions": missing_sizes,
    "duplicate_titles": duplicate_titles, "duplicate_descriptions": duplicate_descriptions,
    "priority_claim_review_candidates": priority_claims,
    "limitations": "Claim regex includes disclaimers and general facts: candidates require contextual review. Image dimensions alone do not establish CLS. Static checks do not prove authorization, delivery, field CWV, Google indexing or rankings.",
}
(ROOT / args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(report["counts"], indent=2))

"""Read-only production route checks and invalid/honeypot API tests; never sends email."""
import argparse
import csv
import json
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("research", Path(__file__).with_name("build-envod-seo-research.py"))
research = module_from_spec(spec)
spec.loader.exec_module(research)
parser = argparse.ArgumentParser()
parser.add_argument("--origin", required=True, help="Temporary local production server, not the public website")
origin = parser.parse_args().origin.rstrip("/")
assert origin.startswith(("http://localhost:", "http://127.0.0.1:")), "Only local test servers are allowed"


def request(path, body=None):
    headers = {"Content-Type": "application/json"} if body is not None else {}
    req = urllib.request.Request(origin + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


for path, expected in research.audit.items():
    status, html = request(path)
    assert status == 200, (path, status)
    page = research.AuditPage()
    page.feed(html)
    ar = path == "/ar" or path.startswith("/ar/")
    assert page.html.get("lang") == ("ar" if ar else "en"), path
    assert page.html.get("dir") == ("rtl" if ar else "ltr"), path
    assert page.canonical == "https://www.envodkingdom.net" + (path if path != "/" else "/"), (path, page.canonical)
    assert len(page.hreflangs) == 3, path
    assert {h["hreflang"] for h in page.hreflangs} == {"en-SA", "ar-SA", "x-default"}, path
    assert sum(n == 1 for n, text in page.headings) == 1, path
    assert not any(b[0] > a[0] + 1 for a, b in zip(page.headings, page.headings[1:])), (path, "heading hierarchy")
    assert page.title and page.description, path

status, sitemap = request("/sitemap.xml")
assert status == 200
assert len(ET.fromstring(sitemap).findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url")) == len(research.audit)
status, unknown = request("/this-route-does-not-exist-seo-test")
assert status == 404 and "noindex" in unknown
assert request("/api/enquiries", {})[0] == 400
assert request("/api/enquiries", {"privacyConsent": False})[0] == 400
spam_status, spam_body = request("/api/enquiries", {"website": "non-delivering-honeypot-test"})
assert spam_status == 202 and json.loads(spam_body)["ok"] is False
for _ in range(2):
    assert request("/api/enquiries", {})[0] == 400
assert request("/api/enquiries", {})[0] == 429
print(f"PASS: {len(research.audit)} HTTP routes, JSON-LD, metadata, lang/dir, canonical, hreflang, H1/hierarchy, sitemap, 404/noindex, validation, honeypot and rate limit. No email sent.")

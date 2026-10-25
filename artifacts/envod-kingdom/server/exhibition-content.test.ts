import assert from "node:assert/strict";
import test from "node:test";
import { EXHIBITION_PILLAR } from "../src/lib/pillar-data/exhibition";
import { SERVICE_META } from "../src/lib/service-data";

test("exhibition additions preserve established section anchors and service destinations", () => {
  const ids = EXHIBITION_PILLAR.sections.map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of [
    "what-is-exhibition-logistics", "trade-show-logistics-saudi-arabia",
    "ata-carnet-temporary-import", "on-site-handling",
    "live-events-and-specialist-cargo", "why-envod-exhibition-logistics",
    "event-transport-and-specialist-support", "event-logistics-coordination-benefits",
    "exhibition-logistics-quote-checklist",
  ]) assert.ok(ids.includes(id), `missing section ${id}`);
  const slugs = new Set(Object.values(SERVICE_META).map((service) => `/services/${service.slug}`));
  for (const link of EXHIBITION_PILLAR.relatedLinks) {
    assert.ok(slugs.has(link.href), `unknown destination ${link.href}`);
    assert.ok(link.label.trim() && link.labelAr.trim());
  }
});

test("quote checklist and official references are bilingual and use specific authority pages", () => {
  const checklist = EXHIBITION_PILLAR.sections.find((section) => section.id === "exhibition-logistics-quote-checklist");
  assert.ok(checklist);
  assert.equal(checklist.bullets?.length, 5);
  for (const section of EXHIBITION_PILLAR.sections) {
    assert.ok(section.heading.en.trim() && section.heading.ar.trim());
    for (const text of [...section.paragraphs, ...(section.bullets ?? [])]) {
      assert.ok(text.en.trim() && text.ar.trim());
    }
    for (const reference of section.references ?? []) {
      assert.ok(reference.label.en.trim() && reference.label.ar.trim());
      assert.ok(["zatca.gov.sa", "iccwbo.org"].includes(new URL(reference.href).hostname));
      assert.equal(new URL(reference.href).protocol, "https:");
      if (reference.hrefAr) {
        assert.equal(new URL(reference.hrefAr).pathname, new URL(reference.href).pathname.replace("/en/", "/ar/"));
      }
      assert.ok(!reference.href.includes("eServices_294"));
    }
  }
});

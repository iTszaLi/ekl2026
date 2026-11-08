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

// Owner approved 2026-11-08: one bilingual planning note per venue, no appointment
// or venue-rule claims, and a single Arabic spelling of the brand name.
test("every exhibition venue has a bilingual planning note without appointment claims", () => {
  assert.equal(EXHIBITION_PILLAR.venues.length, 6);
  for (const venue of EXHIBITION_PILLAR.venues) {
    assert.ok(venue.note?.en.trim() && venue.note.ar.trim(), `missing note for ${venue.name}`);
    assert.ok(!/\b(appointed|official partner|guarantee)/i.test(venue.note.en), `claim in note for ${venue.name}`);
  }
});

test("the venue paragraph lists each Jeddah venue once and uses the card names", () => {
  const paragraph = EXHIBITION_PILLAR.sections
    .flatMap((section) => section.paragraphs)
    .find((text) => text.en.startsWith("Planning references include"));
  assert.ok(paragraph);
  assert.ok(!paragraph.en.includes("Malham Exhibition Centre"));
  assert.ok(paragraph.en.includes("(also called Jeddah Center for Forums & Events)"));
  assert.ok(paragraph.en.includes("Dhahran Expo") && paragraph.ar.includes("ظهران إكسبو"));
  assert.ok(!paragraph.ar.includes("، ومركز جدة للمنتديات والفعاليات"));
});

test("Arabic brand name uses one spelling", () => {
  const text = JSON.stringify([EXHIBITION_PILLAR, SERVICE_META]);
  assert.ok(!text.includes("كينجدوم"));
});

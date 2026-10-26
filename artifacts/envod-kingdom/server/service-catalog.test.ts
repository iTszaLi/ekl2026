import assert from "node:assert/strict";
import test from "node:test";
import {
  SERVICE_CATALOG,
  SERVICE_DIRECTORY_ORDER,
  SERVICE_META,
} from "../src/lib/service-data";
import {
  ENQUIRY_SERVICES,
  getEnquiryServiceByValue,
  getEnquiryServiceForCatalogId,
} from "../src/lib/enquiry-services";
import { getSeoForPath } from "../src/lib/seo-config";

const activeServices = SERVICE_CATALOG.filter((service) => service.isActive !== false);
const activeIds = new Set(activeServices.map((service) => service.id));

test("the service directory includes every canonical service once and keeps Door-to-Door separate", () => {
  const catalogIds = SERVICE_DIRECTORY_ORDER.filter(
    (id): id is number => typeof id === "number",
  );
  const directoryInsertIds = SERVICE_DIRECTORY_ORDER.filter(
    (id): id is "door-to-door" => id === "door-to-door",
  );

  assert.equal(activeServices.length, 24);
  assert.equal(activeServices.filter((service) => service.category === "core").length, 7);
  assert.equal(activeServices.filter((service) => service.category !== "core").length, 17);
  assert.equal(directoryInsertIds.length, 1);
  assert.equal(SERVICE_DIRECTORY_ORDER.length, activeServices.length + 1);
  assert.deepEqual([...catalogIds].sort((a, b) => a - b), [...activeIds].sort((a, b) => a - b));
  assert.deepEqual(SERVICE_DIRECTORY_ORDER.slice(0, 12), [
    11, 4, 22, 9, 3, 15, 19, 1, 2, 6, 8, 17,
  ]);

  for (const service of activeServices) {
    assert.ok(SERVICE_META[service.id]?.slug, `service ${service.id} needs a detail-page slug`);
  }
});

test("every catalog service is represented by the shared contact and quote enquiry choices", () => {
  const mappedCatalogIds = new Set(
    ENQUIRY_SERVICES.flatMap((service) => [...service.catalogIds]),
  );

  for (const service of activeServices) {
    assert.ok(mappedCatalogIds.has(service.id), `${service.name} is missing from enquiry choices`);
    assert.ok(getEnquiryServiceForCatalogId(service.id), `${service.name} has no enquiry group`);
    assert.ok(getEnquiryServiceByValue(service.name), `${service.name} has no selectable alias`);
  }

  for (const service of ENQUIRY_SERVICES) {
    for (const id of service.catalogIds) {
      assert.ok(activeIds.has(id), `${service.id} references unknown catalog service ${id}`);
    }
  }
});

test("Riyadh relocation content, metadata, internal services and optional move-access field stay aligned in both languages", () => {
  const relocation = SERVICE_META[9];
  const seoEn = getSeoForPath("/services/relocation");
  const seoAr = getSeoForPath("/ar/services/relocation");
  const enquiry = ENQUIRY_SERVICES.find((service) => service.id === "relocation");

  assert.match(relocation.overview?.[0]?.en ?? "", /house moving.*Riyadh/i);
  assert.match(relocation.overview?.[0]?.ar ?? "", /نقل المنازل والأثاث في الرياض/);
  assert.equal(relocation.subServices.length, 18);
  assert.equal(relocation.process.length, 4);
  assert.ok(relocation.faq.length >= 4);
  assert.ok(!relocation.process.some((step) => /customs|الجمارك/i.test(`${step.en} ${step.ar}`)));

  assert.equal(seoEn.title, "House Moving & Relocation in Riyadh | ENVOD KINGDOM");
  assert.equal(seoEn.canonicalPath, "/services/relocation");
  assert.match(seoEn.description, /home move in Riyadh/i);
  assert.equal(seoAr.title, "نقل الأثاث والمنازل في الرياض | إنفود كينغدوم");
  assert.equal(seoAr.canonicalPath, "/ar/services/relocation");
  assert.match(seoAr.description, /نقل منزل في الرياض/);

  const accessField = enquiry?.fields.find((field) => field.id === "buildingAccess");
  assert.ok(accessField, "the relocation enquiry should offer an optional building-access field");
  assert.equal(accessField.kind, "textarea");
  assert.equal(accessField.maxLength, 1200);
});

test("Search Console service opportunities have useful bilingual answers and aligned exhibition metadata", () => {
  const requiredQuestions = [
    { id: 1, en: /container shipping to Saudi Arabia/i },
    { id: 3, en: /what is GCC transportation/i },
    { id: 4, en: /customs clearance in Saudi Arabia/i },
    { id: 11, en: /exhibition shipments to Saudi Arabia/i },
  ];

  for (const { id, en } of requiredQuestions) {
    const answer = SERVICE_META[id].faq.find((item) => en.test(item.q));
    assert.ok(answer, `service ${id} should answer its observed search intent in both languages`);
    assert.ok(
      answer.qAr.trim() && answer.a.trim() && answer.aAr.trim(),
      `service ${id} should have visible questions and answers in both languages`,
    );
  }

  const exhibitionEn = getSeoForPath("/services/exhibition-logistics");
  const exhibitionAr = getSeoForPath("/ar/services/exhibition-logistics");
  assert.match(exhibitionEn.description, /Exhibition shipments to Saudi Arabia/i);
  assert.match(exhibitionEn.description, /leading exhibition logistics providers in KSA/i);
  assert.match(exhibitionAr.description, /شحن المعارض إلى السعودية/);
});

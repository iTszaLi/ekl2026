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

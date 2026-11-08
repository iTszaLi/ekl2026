import assert from "node:assert/strict";
import test from "node:test";
import {
  SERVICE_CATALOG as CATALOG_FROM_DATA,
  ID_TO_SLUG,
  SLUG_TO_ID,
} from "../src/lib/service-data";
import {
  SERVICE_CATALOG,
  SERVICE_ID_BY_SLUG,
  SERVICE_SLUG_BY_ID,
} from "../src/lib/service-catalog";

test("service-data re-exports the same catalog object as service-catalog", () => {
  assert.equal(CATALOG_FROM_DATA, SERVICE_CATALOG);
});

test("the lightweight slug maps match the slugs derived from SERVICE_META", () => {
  assert.deepEqual(SERVICE_SLUG_BY_ID, ID_TO_SLUG);
  assert.deepEqual(SERVICE_ID_BY_SLUG, SLUG_TO_ID);
});

test("every catalog service has a page slug", () => {
  for (const service of SERVICE_CATALOG) {
    assert.ok(SERVICE_SLUG_BY_ID[service.id], `missing slug for service ${service.id}`);
  }
});

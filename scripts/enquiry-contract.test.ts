import test from "node:test";
import assert from "node:assert/strict";
import { EnquirySubmissionSchema, QuoteCargoSchema } from "../artifacts/envod-kingdom/src/lib/enquiry-contract";
import { isQuoteCargoValid } from "../artifacts/envod-kingdom/src/lib/enquiry-cargo-validation";

test("existing contact/status inputs remain compatible with optional cargo fields", () => {
  const parsed = EnquirySubmissionSchema.parse({
    formType: "contact", language: "ar", name: "Test Enquiry",
    email: "test@example.com", phone: "TEST ONLY", service: "Customs Clearance",
    privacyConsent: true,
  });
  assert.equal(parsed.weightKg, "");
  assert.equal(parsed.preferredShippingDate, "");
});

test("accepts useful cargo fields without converting dimensions or units silently", () => {
  assert.deepEqual(QuoteCargoSchema.parse({
    dimensions: "120 × 80 × 100 cm", weightKg: "250.125",
    preferredShippingDate: "2030-01-15", eventDetails: "Test event, test venue",
  }), {
    dimensions: "120 × 80 × 100 cm", packageCount: "", weightKg: "250.125",
    preferredShippingDate: "2030-01-15", eventDetails: "Test event, test venue",
  });
});

test("rejects nonpositive, nonnumeric, excessive or overprecise weight", () => {
  for (const weightKg of ["0", "-1", "NaN", "Infinity", "250kg", "1.1234", "1000000001"]) {
    assert.equal(QuoteCargoSchema.safeParse({ weightKg }).success, false, weightKg);
  }
});

test("rejects impossible dates rather than allowing JavaScript date rollover", () => {
  for (const preferredShippingDate of ["2030-02-30", "2030-13-01", "15/01/2030", "not-a-date"]) {
    assert.equal(QuoteCargoSchema.safeParse({ preferredShippingDate }).success, false, preferredShippingDate);
  }
  assert.equal(QuoteCargoSchema.safeParse({ preferredShippingDate: "2032-02-29" }).success, true);
});

test("bounds dimensions and venue details, and requires explicit privacy consent", () => {
  assert.equal(QuoteCargoSchema.safeParse({ dimensions: "x".repeat(161) }).success, false);
  assert.equal(QuoteCargoSchema.safeParse({ eventDetails: "x".repeat(301) }).success, false);
  assert.equal(EnquirySubmissionSchema.safeParse({
    formType: "quote", language: "en", name: "Test", email: "test@example.com",
    phone: "TEST ONLY", service: "Air Freight", privacyConsent: false,
  }).success, false);
});

test("lightweight browser cargo checks agree with the server schema", () => {
  const cases = [
    {}, { dimensions: "  120 x 80 cm  ", weightKg: " 250.125 " },
    { weightKg: "" }, { weightKg: "0" }, { weightKg: "-1" },
    { weightKg: "1e3" }, { weightKg: "1.1234" }, { weightKg: "1000000000" },
    { weightKg: "1000000001" }, { weightKg: "NaN" }, { weightKg: "250kg" },
    { weightKg: "x".repeat(31) }, { weightKg: null }, { weightKg: 250 },
    { dimensions: "x".repeat(160) }, { dimensions: "x".repeat(161) },
    { preferredShippingDate: "2032-02-29" }, { preferredShippingDate: "2030-02-30" },
    { preferredShippingDate: "2030-13-01" }, { preferredShippingDate: "15/01/2030" },
    { preferredShippingDate: " 2030-01-15 " }, { preferredShippingDate: null },
    { eventDetails: "x".repeat(300) }, { eventDetails: "x".repeat(301) },
  ];
  for (const value of cases) {
    assert.equal(isQuoteCargoValid(value), QuoteCargoSchema.safeParse(value).success, JSON.stringify(value));
  }
});

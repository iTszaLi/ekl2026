import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { createEnquiryRouter, enquiryApiErrorHandler, ENQUIRY_RECIPIENT } from "./enquiries";
import { renderEnquiryEmail, contactLinks, mailtoHref } from "./enquiry-email";
import { EnquirySubmissionSchema } from "../src/lib/enquiry-contract";
import { ENQUIRY_SERVICES, getEnquiryServiceForCatalogId, getEnquiryServiceByValue, getEnquiryServiceFormLabel, getServiceRequirementLabel, formatServiceRequirementValue, OTHER_SERVICE_VALUE } from "../src/lib/enquiry-services";

const valid = {
  formType: "contact", language: "en", name: "Test Customer", company: "Test Company",
  email: "test@example.com", phone: "+966501234567", service: "Customs Clearance",
  message: "Test enquiry only", privacyConsent: true,
  submissionId: "b720ac51-78f6-413e-9a6a-0f5d259901bb",
};
const accepted = () => new Response(JSON.stringify({ id: "test_provider_message" }), { status: 200 });
type Options = NonNullable<Parameters<typeof createEnquiryRouter>[0]>;

async function fixture(t: TestContext, options: Options = {}) {
  const app = express();
  app.set("trust proxy", 1);
  app.use("/api/enquiries", createEnquiryRouter({ sendEmail: async () => accepted(), ...options }));
  app.use("/api", enquiryApiErrorHandler);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/enquiries`;
  return {
    url,
    post: (body: unknown, headers: Record<string, string> = {}) => fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  };
}

test("both enquiry types send complete escaped content to the unchanged recipient", async (t) => {
  const emails: Array<{ to: string[]; reply_to: string; subject: string; text: string; html: string }> = [];
  const f = await fixture(t, { sendEmail: async (email) => { emails.push(email); return accepted(); } });
  for (const formType of ["contact", "quote"]) {
    const result = await f.post({
      ...valid, formType, name: "<b>Test Customer</b>", language: "ar",
      service: "Air Freight\r\nBcc: not-a-real-header",
      origin: "Test origin", destination: "Test destination", cargoDescription: "Test cargo",
      dimensions: "120 x 80 x 100 cm", weightKg: "250.125",
      preferredShippingDate: "2030-01-15", eventDetails: "Test event",
      message: "<script>test only</script>\nSecond line",
    });
    assert.equal(result.status, 201);
    assert.deepEqual(await result.json(), { ok: true, accepted: true });
  }
  assert.equal(emails.length, 2);
  for (const email of emails) {
    assert.deepEqual(email.to, [ENQUIRY_RECIPIENT]);
    assert.equal(email.reply_to, valid.email);
    for (const value of ["Test Customer", valid.company, valid.email, valid.phone, "Test cargo",
      "Test origin", "Test destination", "120 x 80 x 100 cm", "250.125", "2030-01-15", "Test event", "Second line", "Arabic"]) {
      assert(email.text.includes(value), value);
    }
    assert(!/[\r\n]/.test(email.subject));
    assert(!email.html.includes("<script>"));
    assert(email.html.includes("&lt;script&gt;"));
    assert(email.html.includes("&lt;b&gt;Test Customer&lt;/b&gt;"));
  }
});

test("missing consent, invalid fields and attempted recipient overrides never send", async (t) => {
  let calls = 0;
  const f = await fixture(t, { sendEmail: async () => { calls++; return accepted(); } });
  const cases = [
    { ...valid, privacyConsent: false }, { ...valid, privacyConsent: undefined },
    { ...valid, email: "invalid" }, { ...valid, name: "" }, { ...valid, phone: "" },
    { ...valid, to: "not-authorized@example.com" }, { ...valid, from: "spoof@example.com" },
    { ...valid, message: "x".repeat(4001) }, { ...valid, submissionId: "not-a-uuid" },
    { ...valid, weightKg: "-1" }, { ...valid, preferredShippingDate: "2030-02-30" },
  ];
  for (const [index, body] of cases.entries()) {
    assert.equal((await f.post(body, { "X-Forwarded-For": `198.51.100.${index + 1}` })).status, 400);
  }
  assert.equal(calls, 0);
});

test("honeypot is dropped without claiming provider acceptance or consent", async (t) => {
  let calls = 0;
  const f = await fixture(t, { sendEmail: async () => { calls++; return accepted(); } });
  const result = await f.post({ website: "bot", privacyConsent: false });
  assert.equal(result.status, 202);
  const body = await result.json();
  assert.equal(body.ok, false);
  assert.equal(body.accepted, false);
  assert.equal(calls, 0);
});

test("malformed JSON, oversized bodies, unsupported types and wrong methods are safe", async (t) => {
  let calls = 0;
  const f = await fixture(t, { sendEmail: async () => { calls++; return accepted(); } });
  const malformed = await f.post('{"private-input":');
  assert.equal(malformed.status, 400);
  assert(!JSON.stringify(await malformed.json()).includes("private-input"));
  assert.equal((await f.post({ ...valid, message: "x".repeat(25_000) })).status, 413);
  assert.equal((await f.post(valid, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await fetch(f.url)).status, 405);
  assert.equal(calls, 0);
});

test("five attempts per IP per fifteen minutes, Retry-After, then expiry", async (t) => {
  let time = 1_000_000;
  const f = await fixture(t, { now: () => time });
  for (let i = 0; i < 5; i++) assert.equal((await f.post({})).status, 400);
  const limited = await f.post({});
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "900");
  assert.equal((await f.post({}, { "X-Forwarded-For": "198.51.100.20" })).status, 400);
  time += 900_001;
  assert.equal((await f.post({})).status, 400);
});

test("rate-limit memory is bounded and expired buckets are reclaimed", async (t) => {
  let time = 1_000_000;
  const f = await fixture(t, { maxBuckets: 1, now: () => time });
  assert.equal((await f.post({})).status, 400);
  assert.equal((await f.post({}, { "X-Forwarded-For": "198.51.100.21" })).status, 429);
  time += 900_001;
  assert.equal((await f.post({}, { "X-Forwarded-For": "198.51.100.21" })).status, 400);
});

test("provider rejection and quota errors cannot return acceptance", async (t) => {
  for (const status of [401, 403, 422, 429, 500]) {
    const f = await fixture(t, { sendEmail: async () => new Response(JSON.stringify({ message: "private provider detail" }), { status }) });
    const result = await f.post(valid);
    assert.equal(result.status, status === 429 ? 503 : 502);
    const body = await result.json();
    assert.equal(body.ok, false);
    assert(!JSON.stringify(body).includes("private provider detail"));
  }
});

test("2xx without a valid provider receipt is not accepted", async (t) => {
  for (const body of [{}, { id: "" }, { id: 123 }, { id: "bad id\n" }]) {
    const f = await fixture(t, { sendEmail: async () => new Response(JSON.stringify(body), { status: 200 }) });
    const result = await f.post(valid);
    assert.equal(result.status, 502);
    assert.equal((await result.json()).ok, false);
  }
  const f = await fixture(t, { sendEmail: async () => new Response("not json", { status: 200 }) });
  assert.equal((await f.post(valid)).status, 502);
});

test("provider exception or timeout returns retryable failure, not delivery", async (t) => {
  const thrown = await fixture(t, { sendEmail: async () => { throw new Error("private SDK detail"); } });
  const failure = await thrown.post(valid);
  assert.equal(failure.status, 503);
  assert(!JSON.stringify(await failure.json()).includes("private SDK detail"));
  const pending = await fixture(t, { timeoutMs: 15, sendEmail: async () => new Promise<Response>(() => {}) });
  const result = await pending.post(valid);
  assert.equal(result.status, 503);
  assert.equal((await result.json()).ok, false);
});

test("unchanged retries share a provider key; changed content does not", async (t) => {
  const keys: string[] = [];
  const payloads: string[] = [];
  let time = Date.parse("2026-10-17T16:09:00Z");
  const f = await fixture(t, { now: () => time, sendEmail: async (email, key) => {
    keys.push(key); payloads.push(JSON.stringify(email)); return accepted();
  } });
  await f.post(valid);
  time += 60_000;
  await f.post(valid);
  await f.post({ ...valid, message: "A changed enquiry" });
  assert.equal(keys[0], keys[1]);
  assert.equal(payloads[0], payloads[1], "timestamps must not change retry payloads");
  assert.notEqual(keys[1], keys[2]);
  assert(keys.every((key) => key.length <= 256));
});

test("all service-page enquiries preselect their canonical category", () => {
  assert.equal(ENQUIRY_SERVICES.length, 22);
  assert.equal(new Set(ENQUIRY_SERVICES.map(({ en }) => en)).size, ENQUIRY_SERVICES.length);
  assert.deepEqual(ENQUIRY_SERVICES.map((service) => getEnquiryServiceFormLabel(service, "en")), [
    "Exhibition & Event Logistics",
    "Customs Clearance",
    "Packing & Relocation / Household Moving",
    "Road Transportation — Saudi Arabia & GCC",
    "Breakbulk",
    "ATA Carnet & Temporary Imports",
    "Supply Chain Management",
    "Freight Forwarding",
    "Sea Freight (Ocean Freight)",
    "Air Freight",
    "Project Cargo & OOG",
    "Warehousing & Storage",
    "Temperature-Controlled Logistics",
    "Local Delivery & Distribution",
    "Site Handling & On-Site Logistics",
    "Medical & Pharma Logistics",
    "Food & FMCG Logistics",
    "Pet & Animal Import",
    "Dangerous Goods (DG Cargo)",
    "White Glove Logistics",
    "Import & Export Documentation",
    "Other / General Enquiry",
  ]);
  assert.equal(getEnquiryServiceForCatalogId(4)?.id, "customs");
  assert.equal(getEnquiryServiceForCatalogId(1)?.id, "sea");
  assert.equal(getEnquiryServiceForCatalogId(5)?.id, "warehouse");
  assert.equal(getEnquiryServiceForCatalogId(9)?.id, "relocation");
  for (const service of ENQUIRY_SERVICES) {
    assert.equal(getEnquiryServiceByValue(getEnquiryServiceFormLabel(service, "en"))?.id, service.id);
  }
  assert.equal(getEnquiryServiceByValue("Door-to-Door Logistics")?.id, "forwarding");
  assert.equal(getEnquiryServiceByValue("Ocean & Sea Freight")?.id, "sea");
  assert.equal(getEnquiryServiceByValue("Import & Export Documentation")?.id, "documentation");
  assert.equal(getEnquiryServiceByValue("Temporary Import & Export")?.id, "ata");
});

test("priority services and catalog mapping put exhibition and breakbulk enquiries ahead of generic sea freight", () => {
  assert.deepEqual(ENQUIRY_SERVICES.slice(0, 5).map(({ id }) => id),
    ["exhibition", "customs", "relocation", "road", "breakbulk"]);
  assert.equal(getEnquiryServiceForCatalogId(11)?.id, "exhibition");
  assert.equal(getEnquiryServiceForCatalogId(15)?.id, "breakbulk");
  assert.equal(getEnquiryServiceByValue("Exhibition & Event Logistics")?.id, "exhibition");
  assert.equal(getEnquiryServiceByValue("Breakbulk")?.id, "breakbulk");
});

test("customs, exhibition, breakbulk, sea freight, warehousing, relocation and other service emails carry their own submitted details", () => {
  const scenarios = [
    {
      service: "Customs Clearance",
      serviceDetails: { tradeDirection: "Import", borderCrossing: "Jeddah Islamic Port", documentsAvailable: "Yes" },
    },
    {
      service: "Sea Freight (Ocean Freight)",
      serviceDetails: { seaFreightType: "FCL", containerType: "1 × 40 ft high cube" },
    },
    {
      service: "Exhibition & Event Logistics",
      serviceDetails: {
        eventName: "Sample Expo (test only)", eventVenue: "Riyadh (test venue)",
        eventDates: "2030-01-15", ataAssistance: "Yes",
        eventServices: "Return-shipping scope to confirm",
      },
    },
    {
      service: "Breakbulk",
      serviceDetails: {
        breakbulkLoad: "Breakbulk",
        handlingRequirements: "Sample port / lashing requirement",
      },
    },
    {
      service: "Warehousing & Storage",
      serviceDetails: { warehouseCity: "Riyadh", storageTemperature: "Chilled", storageDuration: "3 months" },
    },
    {
      service: "Packing, Moving & Relocation",
      serviceDetails: {
        moveType: "Residential",
        estimatedContents: "2 rooms",
        packingService: "Packing and unpacking",
        buildingAccess: "Third-floor walk-up; fragile cabinet (test only)",
      },
    },
    {
      service: "Import & Export Documentation",
      serviceDetails: { tradeDirection: "Export", documentsAvailable: "Certificate of origin", documentRequirements: "Destination attestation requirements are not yet confirmed." },
    },
    {
      service: OTHER_SERVICE_VALUE,
      requirementsText: "Help needed with a one-off logistics project; no shipment booked.",
      serviceDetails: {},
    },
  ];

  for (const [index, scenario] of scenarios.entries()) {
    const enquiry = EnquirySubmissionSchema.parse({
      ...valid,
      formType: "quote",
      service: scenario.service,
      origin: index === 2 ? "" : "Shanghai",
      destination: index === 2 ? "" : "Riyadh",
      cargoDescription: index === 2 ? "Packaged food products" : "Sample goods — no actual shipment",
      requirementsText: scenario.requirementsText ?? "Optional project details for this clearly labeled fixture.",
      serviceDetails: scenario.serviceDetails,
      message: "",
    });
    const email = renderEnquiryEmail(enquiry, Date.parse("2026-10-17T17:00:00Z"));
    assert(email.text.includes(scenario.service), "the selected service label should remain in the email");
    assert(getEnquiryServiceByValue(scenario.service), "the selected label should map to a known service");
    if (Object.keys(scenario.serviceDetails).length) assert(email.html.includes("Service requirements"), scenario.service);
    else assert(!email.html.includes("Service requirements"), "empty service-detail sections should be omitted");
    assert(email.text.includes("Customer's description"), scenario.service);
    const service = getEnquiryServiceByValue(scenario.service);
    for (const [fieldId, value] of Object.entries(scenario.serviceDetails)) {
      assert(email.html.includes(value), `${scenario.service}: ${fieldId} value`);
      const label = service && getServiceRequirementLabel(service.id, fieldId, enquiry.language);
      if (label) assert(email.html.includes(label), `${scenario.service}: ${fieldId} label`);
      const formatted = service && formatServiceRequirementValue(service.id, fieldId, value, enquiry.language);
      if (formatted) assert(email.text.includes(formatted), `${scenario.service}: ${fieldId} plain-text value`);
    }
    assert(!/<td[^>]*>\s*<\/td>/i.test(email.html));
    assert(!email.text.includes("||||"));
  }

  assert(!EnquirySubmissionSchema.safeParse({ ...valid, service: OTHER_SERVICE_VALUE, requirementsText: "" }).success);
  assert(!EnquirySubmissionSchema.safeParse({
    ...valid, service: "Customs Clearance", serviceDetails: { seaFreightType: "FCL" },
  }).success);
  assert(!EnquirySubmissionSchema.safeParse({
    ...valid, service: "Customs Clearance", serviceDetails: { tradeDirection: "Pickpocketing" },
  }).success);
  assert(!EnquirySubmissionSchema.safeParse({
    ...valid, service: "Customs Clearance", serviceDetails: { tradeDirection: "Import", borderCrossing: "x".repeat(241) },
  }).success);
});

test("normal and explicit test templates share grouped data, Riyadh time and safe links", () => {
  const enquiry = EnquirySubmissionSchema.parse({
    ...valid, name: "Example Buyer", company: "Example Trading",
    email: "buyer+logistics@example.com", phone: "+966 50 123 4567",
    origin: "Jeddah", destination: "Riyadh", cargoDescription: "2 pallets — exhibition materials",
    message: "Please confirm document requirements.\nموعد التسليم حسب الاتفاق\nCondition: A | B",
  });
  const normal = renderEnquiryEmail(enquiry, Date.parse("2026-10-17T16:09:00Z"));
  assert.equal(normal.subject, "New Enquiry — Customs Clearance | Envod Kingdom");
  assert(!normal.subject.includes(valid.submissionId));
  assert(!normal.html.includes("TEST SUBMISSION"));
  for (const content of ["New Website Enquiry", "Enquiry summary", "Customer information", "Shipment information",
    "Submission details", "19:09 (Riyadh time, UTC+03:00)", "Example Buyer", enquiry.message.split("\n")[1]]) {
    assert(normal.html.includes(content), content);
    assert(normal.text.includes(content), content);
  }
  assert(normal.html.indexOf("Enquiry summary") < normal.html.indexOf("Customer information"));
  assert(normal.html.indexOf("Customer information") < normal.html.indexOf("Shipment information"));
  assert(normal.html.includes('href="mailto:buyer%2Blogistics@example.com"'));
  assert(normal.html.includes('href="tel:+966501234567"'));
  assert(normal.html.includes('href="https://wa.me/966501234567"'));
  assert(normal.html.includes(`title="Full enquiry identifier: ${valid.submissionId}"`));
  assert(!/<script|<link|<iframe/i.test(normal.html));
  assert(normal.html.includes("<style>") && normal.html.includes("@media"));
  assert(!/<(?:img|link|iframe)[^>]+(?:src|href)=/i.test(normal.html));
  assert(!/<(?:table|br|td)\b/i.test(normal.text));
  assert(normal.text.includes("Condition: A | B"), "plain text must preserve customer characters");
  assert(!/^\s*\|.*\|\s*$/m.test(normal.text), "plain text must not contain Markdown table rows");
  assert(!/<td[^>]*>\s*<\/td>/i.test(normal.html), "layout must not contain empty data cells");
  const sample = renderEnquiryEmail({ ...enquiry, service: "[TEST] Customs Clearance" }, 0);
  assert.equal(sample.subject, "[TEST] Enquiry Email Preview | Envod Kingdom");
  assert(sample.html.includes("TEST SUBMISSION — Not a genuine customer enquiry."));
  assert(sample.text.includes("TEST SUBMISSION"));
  assert(sample.text.includes("Simulated for this test only — no genuine customer consent is recorded."));
  assert(!sample.text.includes("Acknowledged by the submitter."));
  assert(!sample.html.includes("wa.me"), "test phone values do not get fake contact actions");
  assert(!sample.html.includes('href="tel:'));
});

test("empty optionals disappear, absent references are not invented, and malicious content is escaped", () => {
  const enquiry = EnquirySubmissionSchema.parse({
    ...valid, submissionId: undefined, company: "", message: "",
    phone: '"><script>alert(1)</script>', name: '<img src=x onerror="alert(1)">',
  });
  const email = renderEnquiryEmail(enquiry, 0);
  assert.equal(email.subject, "New Enquiry — Customs Clearance | Envod Kingdom");
  for (const omitted of ["Enquiry reference", "Company name", "Shipment information", "Additional message or requirements"]) {
    assert(!email.html.includes(omitted), omitted);
    assert(!email.text.includes(omitted), omitted);
  }
  assert(!email.html.includes("<img"));
  assert(!email.html.includes("<script"));
  assert(email.html.includes("&lt;img"));
  assert(email.text.includes(enquiry.name), "plain text must preserve the original content");
  assert.equal(renderEnquiryEmail({ ...enquiry, service: "" }, 0).subject, "New Website Enquiry — Envod Kingdom");
  assert(!email.html.includes("wa.me"));
  assert(!email.html.includes('href="tel:'));
  for (const phone of ["TEST ONLY - DO NOT CALL", "0501234567", "+0123456789", "+123", "+1234567890123456", "+1-202-555-0123 ext 4"]) {
    assert.deepEqual(contactLinks(phone), {}, phone);
  }
  assert.deepEqual(contactLinks("0012025550123"), {});
  assert.deepEqual(contactLinks("00966501234567"), { href: "tel:+966501234567", whatsapp: "https://wa.me/966501234567" });
  assert.deepEqual(contactLinks("+966501234567", true), {});
  assert.equal(mailtoHref("info@envodkingdom.net"), "mailto:info@envodkingdom.net");
});

test("an exhibition quote reaches the provider payload with its service and event details", async (t) => {
  let sent: { subject: string; text: string; html: string } | undefined;
  const f = await fixture(t, { sendEmail: async (email) => {
    sent = email;
    return accepted();
  } });
  const response = await f.post({
    ...valid,
    formType: "quote",
    service: "Exhibition & Event Logistics",
    origin: "Dubai",
    destination: "Riyadh Front",
    cargoDescription: "Exhibition stand samples (test only)",
    eventDetails: "Sample Expo (test only), Riyadh",
    serviceDetails: {
      eventName: "Sample Expo (test only)",
      eventVenue: "Riyadh Front (test venue)",
      eventDates: "2030-01-15",
      ataAssistance: "Yes",
      eventServices: "Return-shipping scope to confirm",
    },
  });
  assert.equal(response.status, 201);
  assert.equal(sent?.to[0], ENQUIRY_RECIPIENT);
  for (const detail of ["Exhibition & Event Logistics", "Sample Expo (test only)", "Riyadh Front (test venue)", "Return-shipping scope to confirm"]) {
    assert(sent?.text.includes(detail), detail);
  }
  assert(sent?.html.includes("Exhibition &amp; Event Logistics"));
  for (const detail of ["Sample Expo (test only)", "Riyadh Front (test venue)", "Return-shipping scope to confirm"]) {
    assert(sent?.html.includes(detail), detail);
  }
});

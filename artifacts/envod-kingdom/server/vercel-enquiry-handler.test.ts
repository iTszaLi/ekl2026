import assert from "node:assert/strict";
import { test } from "node:test";
import { createVercelEnquiryHandler } from "./vercel-enquiry-handler";

const origin = "https://envodkingdom.net";
const baseSubmission = {
  formType: "contact" as const,
  submissionId: "4a3a0e26-93ef-43f6-97f8-bb9bf8d1f57b",
  language: "en" as const,
  name: "Test Customer",
  company: "Test Company",
  email: "customer@example.com",
  phone: "+966501234567",
  service: "Customs Clearance",
  origin: "Riyadh",
  destination: "Jeddah",
  cargoDescription: "A clearly labeled test shipment",
  requirementsText: "",
  serviceDetails: {},
  message: "Vercel function test only",
  privacyConsent: true as const,
  website: "",
  dimensions: "",
  packageCount: "",
  weightKg: "",
  preferredShippingDate: "",
  eventDetails: "",
};

function makeRequest(
  body: unknown,
  options: { method?: string; origin?: string; address?: string } = {},
) {
  const headers = new Headers({
    Origin: options.origin ?? origin,
    "Content-Type": "application/json",
    "X-Forwarded-For": options.address ?? "203.0.113.18",
  });
  return new Request(`${origin}/api/enquiries`, {
    method: options.method ?? "POST",
    headers,
    ...(options.method === "OPTIONS" ? {} : { body: JSON.stringify(body) }),
  });
}

const successfulProviderResponse = () =>
  Response.json({ id: "resend_test_message_123" }, { status: 200 });

test("Vercel enquiry handler accepts valid contact and quote forms only after provider acceptance", async () => {
  const sent: Array<{ email: unknown; key: string }> = [];
  const handler = createVercelEnquiryHandler({
    sendEmail: async (email, key) => {
      sent.push({ email, key });
      return successfulProviderResponse();
    },
    now: () => Date.UTC(2026, 9, 22, 12),
  });

  for (const formType of ["contact", "quote"] as const) {
    const response = await handler(
      makeRequest({
        ...baseSubmission,
        formType,
        ...(formType === "quote"
          ? { packageCount: "4 cartons", eventDetails: "Test venue details" }
          : {}),
      }),
    );
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { ok: true, accepted: true });
  }

  assert.equal(sent.length, 2);
  for (const { email, key } of sent) {
    assert.match(key, /^envod-[0-9a-f-]{36}-[a-f0-9]{64}$/);
    assert.equal((email as { to: string[] }).to[0], "info@envodkingdom.net");
    assert.equal((email as { reply_to: string }).reply_to, "customer@example.com");
    assert.match((email as { subject: string }).subject, /Enquiry/);
  }
});

test("Vercel enquiry handler rejects invalid submissions without sending email", async () => {
  let sends = 0;
  const handler = createVercelEnquiryHandler({
    sendEmail: async () => {
      sends++;
      return successfulProviderResponse();
    },
  });

  const response = await handler(makeRequest({}));
  assert.equal(response.status, 400);
  assert.equal(sends, 0);
  assert.ok("fieldErrors" in (await response.json()));
});

test("Vercel enquiry handler drops honeypot spam without sending email", async () => {
  let sends = 0;
  const handler = createVercelEnquiryHandler({
    sendEmail: async () => {
      sends++;
      return successfulProviderResponse();
    },
  });

  const response = await handler(
    makeRequest({ ...baseSubmission, website: "bot-filled-field" }),
  );
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), {
    ok: false,
    accepted: false,
    error: "Unable to accept this request. Please contact us directly.",
  });
  assert.equal(sends, 0);
});

test("Vercel enquiry handler reports provider failures without exposing provider details", async () => {
  const handler = createVercelEnquiryHandler({
    sendEmail: async () =>
      Response.json({ message: "sensitive provider detail" }, { status: 500 }),
  });

  const response = await handler(makeRequest(baseSubmission));
  assert.equal(response.status, 502);
  const body = await response.text();
  assert.match(body, /acceptance could not be confirmed/i);
  assert.doesNotMatch(body, /sensitive provider detail/);
  assert.doesNotMatch(body, /customer@example\.com/);
});

test("Vercel enquiry handler rate limits repeated submissions per warm instance", async () => {
  let sends = 0;
  const handler = createVercelEnquiryHandler({
    sendEmail: async () => {
      sends++;
      return successfulProviderResponse();
    },
    now: () => Date.UTC(2026, 9, 22, 12),
  });

  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await handler(
      makeRequest({
        ...baseSubmission,
        submissionId: `4a3a0e26-93ef-43f6-97f8-bb9bf8d1f5${String(attempt).padStart(2, "0")}`,
      }),
    );
    assert.equal(response.status, 201);
  }
  const limited = await handler(
    makeRequest({
      ...baseSubmission,
      submissionId: "4a3a0e26-93ef-43f6-97f8-bb9bf8d1f599",
    }),
  );
  assert.equal(limited.status, 429);
  assert.equal(sends, 5);
});

test("Vercel enquiry handler requires a same-origin request and handles preflight", async () => {
  const handler = createVercelEnquiryHandler({
    sendEmail: async () => successfulProviderResponse(),
  });
  const preflight = await handler(makeRequest(null, { method: "OPTIONS" }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);

  const rejected = await handler(
    makeRequest(baseSubmission, { origin: "https://attacker.example" }),
  );
  assert.equal(rejected.status, 403);
});

test("Vercel enquiry handler does not claim acceptance when its Resend key is missing", async () => {
  const handler = createVercelEnquiryHandler({
    getApiKey: () => undefined,
  });

  const response = await handler(makeRequest(baseSubmission));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Email delivery is not configured yet. Please contact us directly.",
  });
});

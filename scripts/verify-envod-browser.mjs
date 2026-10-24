// Run against a local production test server. All valid POSTs are intercepted:
// this verifies UI behavior, not Resend or inbox delivery.
import assert from "node:assert/strict";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:25185";
assert.match(origin, /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.TEST_BROWSER_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let acceptedRequests = 0;
let respondWithError = true;
let failNextQuote = true;
let unconfirmedContact = true;
let unconfirmedQuote = true;
let otherValidationCase = false;
const submissionIds = { contact: [], quote: [] };
let forcedResponse = null;
await page.route("**/api/enquiries", async (route) => {
  const payload = route.request().postDataJSON();
  submissionIds[payload.formType].push(payload.submissionId);
  assert.match(payload.submissionId, /^[0-9a-f-]{36}$/);
  if (otherValidationCase) {
    assert.equal(payload.formType, "contact");
    assert.equal(payload.service, "Other Logistics Requirements");
    assert.equal(payload.requirementsText, "Sample other service request for validation only.");
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false }) });
    return;
  }
  assert.equal(payload.serviceDetails && typeof payload.serviceDetails, "object");
  if (payload.formType === "contact") {
    assert.equal(payload.service, "Customs Clearance");
    if (!forcedResponse) {
      assert.equal(payload.serviceDetails.tradeDirection, "Import", `service details: ${JSON.stringify(payload.serviceDetails)}`);
      assert.equal(payload.serviceDetails.borderCrossing, "Jeddah Islamic Port");
      assert.match(payload.requirementsText, /Customs Clearance/i);
    }
  } else {
    assert.equal(payload.service, "Air Freight");
  }
  if (forcedResponse) {
    await route.fulfill({ status: forcedResponse.status, contentType: "application/json", body: JSON.stringify(forcedResponse.body) });
    return;
  }
  assert.equal(payload.privacyConsent, true);
  if (payload.formType === "quote") {
    assert.equal(payload.weightKg, "250.125");
    assert.equal(payload.dimensions, "120 × 80 × 100 cm");
    assert.equal(payload.preferredShippingDate, "2030-01-15");
  }
  acceptedRequests++;
  const fail = respondWithError || (payload.formType === "quote" && failNextQuote);
  if (payload.formType === "quote") failNextQuote = false;
  const unconfirmed = !fail && (payload.formType === "quote" ? unconfirmedQuote : unconfirmedContact);
  if (unconfirmed) {
    if (payload.formType === "quote") unconfirmedQuote = false;
    else unconfirmedContact = false;
  }
  await route.fulfill({
    status: fail ? 503 : 201,
    contentType: "application/json",
    body: JSON.stringify({ ok: !fail, ...(unconfirmed ? {} : { accepted: !fail }) }),
  });
});

try {
  await page.goto(`${origin}/contact`);
  await page.locator("#name").fill("Automated other-service test");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#phone").fill("+966500000000");
  await page.locator('input[type="checkbox"]').check();
  await page.getByLabel("Service Interested In", { exact: false }).click();
  await page.getByRole("option", { name: "Other / General Enquiry", exact: true }).click();
  await page.locator('form button[type="submit"]').click();
  await page.locator("#requirementsText-error").waitFor();
  assert.equal(acceptedRequests, 0, "Other must be described before submitting");
  otherValidationCase = true;
  await page.locator("#requirementsText").fill("Sample other service request for validation only.");
  await page.locator('form button[type="submit"]').click();
  await page.getByText("Your enquiry could not be sent.", { exact: false }).waitFor();
  otherValidationCase = false;
  assert.equal(acceptedRequests, 0, "test interceptor must not count the validation scenario as accepted");
  submissionIds.contact.length = 0;

  await page.goto(`${origin}/services/customs-clearance`);
  await page.getByRole("heading", { name: "Prepare your Saudi customs clearance enquiry" }).waitFor();
  await page.getByRole("main").getByRole("link", { name: "Request a Quote", exact: true }).click();
  await page.waitForURL("**/contact?service=customs-clearance");
  await page.locator("#requirementsText").waitFor();
  assert.equal(await page.locator("form").getByRole("link", { name: "Privacy Notice", exact: true }).count(), 1);
  assert.match(await page.locator("#requirementsText").inputValue(), /Customs Clearance/);
  await page.getByLabel("Import or export?", { exact: false }).selectOption("Import");
  assert.equal(await page.locator("#contact-service-tradeDirection").inputValue(), "Import");
  await page.locator("#contact-service-borderCrossing").fill("Jeddah Islamic Port");
  await page.getByLabel("Service Interested In", { exact: false }).click();
  await page.getByRole("option", { name: "Sea Freight (Ocean Freight)", exact: true }).click();
  await page.getByLabel("Service Interested In", { exact: false }).click();
  await page.getByRole("option", { name: "Customs Clearance", exact: true }).click();
  assert.equal(await page.locator("#contact-service-tradeDirection").inputValue(), "Import");
  assert.equal(await page.locator("#contact-service-borderCrossing").inputValue(), "Jeddah Islamic Port");
  await page.locator("#name").fill("Automated test");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#phone").fill("+966500000000");
  await page.locator('input[type="checkbox"]').check();
  await page.locator('form button[type="submit"]').click();
  await page.getByText("Your enquiry could not be sent.", { exact: false }).waitFor();
  assert.equal(await page.locator("#name").inputValue(), "Automated test");
  assert.equal(await page.locator("#contact-service-tradeDirection").inputValue(), "Import", "a failed send must retain service-specific fields");
  respondWithError = false;
  await page.locator('form button[type="submit"]').click();
  await page.getByText("Your enquiry could not be sent.", { exact: false }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Send another message", exact: true }).count(), 0);
  assert.equal(await page.locator("#contact-service-tradeDirection").inputValue(), "Import", "an unconfirmed provider response must retain service-specific fields");
  await page.locator('form button[type="submit"]').click();
  await page.getByRole("button", { name: "Send another message", exact: true }).waitFor();
  assert.equal(acceptedRequests, 3);
  assert.equal(new Set(submissionIds.contact).size, 1);
  const contactEvents = await page.evaluate(() =>
    (window.vaq || [])
      .filter(([type]) => type === "event")
      .map(([, event]) => event),
  );
  assert.equal(contactEvents.filter((event) => event.name === "contact_form_submit_success").length, 1);
  assert.equal(contactEvents.filter((event) => event.name === "contact_form_submit_failure").length, 2);
  assert(contactEvents.filter((event) => event.name === "contact_form_submit_failure").every((event) => event.data.service_category === "Customs Clearance"));
  assert(!JSON.stringify(contactEvents).includes("test@example.com"));
  assert(!JSON.stringify(contactEvents).includes("Automated test"));
  assert(!JSON.stringify(contactEvents).includes("+966500000000"));

  await page.goto(`${origin}/services/air-freight`);
  await page.getByRole("button", { name: "Get a Free Quote", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Air Freight", exact: false }).click();
  await dialog.getByPlaceholder("e.g. Shanghai").fill("Shanghai");
  await dialog.getByPlaceholder("e.g. Riyadh").fill("Riyadh");
  await dialog.getByLabel("Cargo dimensions (include units)", { exact: false }).fill("120 × 80 × 100 cm");
  await dialog.getByLabel("Gross weight (kg)", { exact: false }).fill("-1");
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await dialog.getByRole("alert").waitFor();
  await dialog.getByLabel("Gross weight (kg)", { exact: false }).fill("250.125");
  await dialog.getByLabel("Ready or preferred shipping date", { exact: false }).fill("2030-01-15");
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await dialog.getByPlaceholder("Your name").fill("Automated quote test");
  await dialog.getByPlaceholder("email@company.com").fill("test@example.com");
  await dialog.getByPlaceholder("+966 5X XXX XXXX").fill("+966500000000");
  const submit = dialog.locator("button").filter({ hasText: /Submit|Send Request/i }).last();
  assert.equal(await dialog.locator('a[href="/privacy-policy"]').count(), 1);
  assert.equal(await submit.isDisabled(), true);
  await dialog.locator('input[type="checkbox"]').check();
  await submit.click();
  await dialog.getByText("Your request could not be sent.", { exact: false }).waitFor();
  assert.equal(await dialog.getByPlaceholder("Your name").inputValue(), "Automated quote test");
  await submit.click();
  await dialog.getByText("Your request could not be sent.", { exact: false }).waitFor();
  assert.equal(await dialog.getByRole("heading", { name: "Request Accepted", exact: true }).count(), 0);
  await submit.click();
  await dialog.getByRole("heading", { name: "Request Accepted", exact: true }).waitFor();
  assert.equal(acceptedRequests, 6);
  assert.equal(new Set(submissionIds.quote).size, 1);
  const quoteEvents = await page.evaluate(() =>
    (window.vaq || [])
      .filter(([type]) => type === "event")
      .map(([, event]) => event),
  );
  assert.equal(quoteEvents.filter((event) => event.name === "quote_form_submit_success").length, 1);
  assert.equal(quoteEvents.filter((event) => event.name === "quote_form_submit_failure").length, 2);
  assert(quoteEvents.filter((event) => event.name === "quote_form_submit_failure").every((event) => event.data.service_category === "Air Freight"));
  assert(!JSON.stringify(quoteEvents).includes("test@example.com"));
  assert(!JSON.stringify(quoteEvents).includes("Automated quote test"));
  assert(!JSON.stringify(quoteEvents).includes("+966500000000"));
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Get a Free Quote", exact: true }).first().click();
  await dialog.getByRole("button", { name: "ATA Carnet", exact: false }).click();
  await dialog.getByLabel("Event or temporary-import purpose", { exact: false }).waitFor();
  assert.equal(await dialog.locator("#quote-weight").count(), 0);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });

  assert(await page.locator('a[href="tel:+966583671739"]').count() > 0);
  assert.equal(await page.locator('a[href="tel:+966502260256"]').count(), 0);
  assert(await page.locator('a[href^="https://wa.me/966502260256"]').count() > 0);

  await page.goto(`${origin}/contact?service=customs-clearance`);
  await page.locator("#name").fill("Automated test");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#phone").fill("+966500000000");
  await page.locator('input[type="checkbox"]').check();
  forcedResponse = { status: 202, body: { ok: false, accepted: false } };
  await page.locator('form button[type="submit"]').click();
  await page.getByText("Your enquiry could not be sent.", { exact: false }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Send another message", exact: true }).count(), 0);
  forcedResponse = { status: 429, body: { ok: false } };
  await page.locator('form button[type="submit"]').click();
  await page.getByText("Too many attempts.", { exact: false }).waitFor();
  assert.equal(await page.locator("#name").inputValue(), "Automated test");
  assert.equal(await page.locator('form button[type="submit"]').isEnabled(), true);
  forcedResponse = null;

  for (const route of ["/ar/services/customs-clearance", "/ar/contact?service=air-freight", "/ar/track"]) {
    await page.setViewportSize({ width: 402, height: 874 });
    await page.goto(origin + route);
    await page.locator("h1").waitFor();
    assert.equal(await page.locator("html").getAttribute("lang"), "ar");
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route);
    if (route.startsWith("/ar/contact")) await page.screenshot({ path: "/tmp/envod-verified-ar-contact.png" });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/services/customs-clearance`);
  await page.waitForLoadState("networkidle");
  await page.getByText("عربي", { exact: true }).first().click();
  await page.waitForURL("**/ar/services/customs-clearance");
  await page.locator("html[lang=ar][dir=rtl]").waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS: canonical service preselection, customs-specific fields, contact failure/retry/success, quote shipment validation and payload, conditional ATA fields, consent/success/Escape, call/WhatsApp links, equivalent language switch, Arabic mobile layouts. All emails intercepted; none sent.");
} catch (error) {
  console.error("Browser test context:", JSON.stringify({
    requestsIntercepted: acceptedRequests,
    url: page.url(),
    visibleText: (await page.locator("body").innerText()).slice(-6500),
    errors,
  }));
  throw error;
} finally {
  await browser.close();
}

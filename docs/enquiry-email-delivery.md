# ENVOD KINGDOM — enquiry email delivery

## Status

Implemented and automatically tested for the contact form and quote modal. **Live provider acceptance is verified, and the owner confirmed receipt of the sample email.** Following the owner's updated domain-verification status, one labeled sample enquiry to the unchanged recipient was submitted through the real preview endpoint on 17 October 2026 at 16:09 UTC. The endpoint returned HTTP 201 with `{"ok":true,"accepted":true}`, which requires a successful provider response and valid provider receipt. The owner subsequently confirmed receipt on 17 October 2026. No automatic retry was made. Earlier tests returned provider-integration HTTP 403 and website HTTP 502; the exact earlier rejection cause was not captured. This test verifies the preview environment, not a separately published deployment, and does not guarantee delivery of future messages.

The existing recipient remains **info@envodkingdom.net**. Public submissions cannot select recipients, senders, CC or BCC. The recipient is server-owned; changing it requires explicit owner authorization. There is no `ENQUIRY_TO_EMAIL` override.

## What is implemented

- `POST /api/enquiries` uses the connected Resend service exclusively on the server.
- Strict shared validation covers form type, language, required contact fields, email format, string lengths, optional shipment data, valid dates, positive weight, an optional UUID submission ID and explicit privacy acknowledgement. Unexpected fields are rejected.
- Messages include the customer's name, company, email, phone/WhatsApp, service, origin, destination, cargo description, packed dimensions with units, weight, preferred date, event/venue and message when supplied. Customer email is Reply-To, never the sender.
- A shared bilingual catalog of 14 enquiry categories drives both the contact form and quote modal, with service-page preselection and mappings from existing catalog IDs. Service-specific fields are optional; only the free-text description for “Other” is required. Common shipment details remain optional.
- The selected category's fields are retained when users switch categories, and only the active category's details are submitted. Server validation rejects service fields that do not belong to that selected category.
- Service-specific answers are grouped in both HTML and plain-text emails with category-aware field labels and translated choice values; empty sections are omitted.
- Plain-text and escaped HTML email bodies are generated server-side. Subject line breaks are removed. Customer details and raw SDK/provider errors are not written to application logs.
- The honeypot drops submissions without contacting Resend and returns `202` with `ok: false, accepted: false`. Neither form treats that response as success.
- Five POST attempts per client IP per 15 minutes, including invalid submissions. Limits return `429` with `Retry-After`. Expired buckets are cleaned up; the map is capped at 10,000 IP buckets and fails closed when full.
- Origin restrictions, JSON-only requests, a 20 KB request-body limit, safe JSON parser errors, method restrictions and non-cacheable API responses are in place.
- The backend waits at most 15 seconds for the provider response and its JSON receipt. A provider 2xx response alone is insufficient: a valid message ID is required before returning `201 { "ok": true, "accepted": true }`.
- Both forms require that explicit acceptance response. English and Arabic success copy states provider acceptance, not confirmed inbox delivery. Errors retain inputs and permit retry; rate-limit errors explain that the user should wait or contact the business directly.
- Identical retries within the same loaded browser page reuse a submission ID; the server combines it with an email-content hash for Resend's idempotency key. Changed content gets a different key. Browser fingerprints and IDs are bounded in memory, not persisted to browser storage.
- Required, initially unchecked privacy acknowledgements and privacy-policy links remain near both forms. Spam suppression does not assert consent.
- Existing design, English URLs, bilingual routing, mobile layouts, service prefill, quote steps, floating WhatsApp and call CTAs remain intact. No database, CMS or frontend credential was added.
- Form-success analytics occur only after explicit provider acceptance. Events contain limited metadata, not enquiry contents or contact details.

## Exact remaining provider setup

1. Use the **existing attached Resend connection**. No additional provider connection or frontend API key is needed.
2. The owner reports that `envodkingdom.net` is verified. Check that this verification is in the same Resend account used by the attached connection and that sending is enabled. Do not change DNS blindly or assume that the HTTP 403 proves verification failed.
3. Ensure the API key held by the existing connection has permission to send from that domain. A sending-only key can send mail but cannot necessarily list domains; failure to list domains does not establish their verification status.
4. The default sender is `ENVOD KINGDOM Website <info@envodkingdom.net>`. `RESEND_FROM_EMAIL` can select an owner-approved, verified sender on the server. It does not change the recipient.
5. The authorized live attempt returned HTTP 403 from the provider integration. Inspect the error details for the failed request around 14:59 UTC on 17 October 2026. If no matching request appears in Resend, investigate the connector layer rather than assuming Resend processed it. After resolving the issue, obtain fresh approval before another live test to **info@envodkingdom.net**. Inbox delivery is a separate check from provider acceptance.
6. If authentication or permissions still fail, repair the existing connection in the project's integration settings. Do not paste credentials into chat, commit them, or place them in any `VITE_` variable.

There is deliberately no fallback sender, sandbox-recipient substitution, mailto success fallback or simulated production provider.

## Deployment: same-origin frontend and backend

Keep the existing prerendered frontend and run the small Express server alongside it. From the workspace root:

```sh
pnpm install --frozen-lockfile --prod=false
pnpm run typecheck
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build
pnpm --filter @workspace/envod-kingdom run start
```

The build produces 92 static content pages, the SPA shell and sitemap. The production start command serves those files and the enquiry endpoint. It binds to the runtime `PORT` on `0.0.0.0`; the build-time port above is not a production URL. Keep `BASE_PATH` consistent between build and runtime; this artifact is mounted at `/`.

The published backend must retain access to the attached Resend connection. The SDK manages credentials and authorization server-side. Verify that access in the actual published environment before calling production mail operational.

Do **not** use `run serve`/Vite preview or publish only `dist/public` expecting them to run the API. `/api/healthz` confirms the web server is running; it does not certify sender verification or email readiness.

## Deployment: separately hosted static frontend

- Host the Express API in a runtime that can use the attached connection, while keeping the frontend on the static host.
- At frontend build time, set public `VITE_API_BASE_URL` to the **actual published backend origin plus its base path and `/api`**. Do not append `/enquiries`; the client adds it. Never put credentials in this URL. Cross-origin endpoints must use HTTPS.
- Allow the actual frontend origin through server-side `ENQUIRY_ALLOWED_ORIGINS` (comma-separated origins, not paths). The business origins `https://envodkingdom.net` and `https://www.envodkingdom.net` are already allowlisted; same-origin requests are supported.
- Add the actual backend origin to `connect-src` in both the prerendered CSP generation and the static host's `_headers` policy, then rebuild. Changing an environment variable without rebuilding static files is insufficient.
- Publish compatible frontend and API response contracts together. The updated frontend intentionally rejects an older API that returns only `{ "ok": true }`.
- The separate `envod-kingdom-standalone/` snapshot was not regenerated in this stage and must not be described as containing this backend or its updated form behavior.

## Security and operational limits

- The application limiter is **per process**, not a distributed global limiter. Use a single API instance with a correctly configured trusted ingress, or install shared/edge rate limiting before enabling multiple instances or serverless fan-out.
- The server currently trusts one proxy hop. The ingress must append/normalize forwarding headers so a public client cannot choose its own effective IP. Revalidate this setting if the proxy chain changes; local tests alone cannot establish production ingress behavior.
- Honeypot, origin controls, validation and rate limiting reduce abuse; they do not prove that a submitter is human. Monitor provider quotas and add an appropriate challenge or stronger edge controls if abuse warrants it.
- This connector SDK does not expose request cancellation through its proxy options. A 15-second deadline stops the handler waiting but cannot guarantee cancellation of an already-running provider request. An uncertain request might still be accepted later; same-page retry idempotency reduces duplicates. Refreshing the page loses that browser ID, and provider idempotency has its own retention window.
- No durable job queue was added. A success response means provider acceptance, not inbox delivery. Provider rejection, missing/malformed receipts, exceptions and timeouts produce failure, never fabricated delivery.
- No publication or deployment-settings change was performed in this stage.

## Verification completed

- Full workspace TypeScript checks: passed.
- Production frontend/SSR build and 92-route prerender: passed.
- 10 server integration-test groups: both form types and all email fields; escaping and header safety; fixed recipient and Reply-To; invalid/missing fields and consent; recipient/sender tampering; honeypot; malformed JSON; oversized body; wrong content type/method; rate limits, expiry and bounded storage; provider 401/403/422/429/500; malformed or missing receipts even on 2xx; thrown errors; timeout; stable retry keys.
- Five existing enquiry-contract tests: passed.
- Production HTTP verification: all 92 routes, canonical/hreflang/lang/dir, metadata, schema, sitemap and 404 behavior passed. API validation, spam suppression and rate limiting also passed without mail calls.
- Additional production HTTP checks: malformed JSON, disallowed origin, allowed preflight, method restrictions and no-store headers passed.
- Browser tests: both forms reject provider errors and unconfirmed success responses, retain values and retry successfully after explicit mocked acceptance. The contact form retains category-specific values when changing categories. Both privacy links, stable retry IDs, consent gating, quote cargo fields, conditional ATA fields, spam responses and rate-limit guidance passed. Call/WhatsApp links, equivalent-language navigation and Arabic mobile layouts passed.
- Running preview restarted; logs and a contact-page screenshot showed no manifest breakage.

**Test boundary:** successful automated sends and provider errors use injected providers in server tests or intercepted browser requests. They prove application behavior, not real Resend acceptance or mailbox delivery. Earlier live tests received HTTP 403 from the provider integration. A later authorized contact test on 17 October 2026 at 16:09 UTC was accepted, and the owner confirmed receipt, as recorded above. Quote-form live sending and published-environment acceptance have not been verified.

## Branded email template update — 17 October 2026

The working Resend integration, verified sender, fixed recipient, Reply-To behavior, credentials, API validation and public form contracts remain unchanged. No DNS or inbound-receiving settings were changed.

Changed files:
- `artifacts/envod-kingdom/server/enquiry-email.ts`: focused HTML/plain-text renderer, shared section data, safe contact links and subject generation.
- `artifacts/envod-kingdom/server/enquiries.ts`: invokes the renderer and retains original receipt-time metadata for retries.
- `artifacts/envod-kingdom/server/enquiries.test.ts`: expanded template and advancing-clock retry assertions.
- This guide and the project memory note describing timestamp/idempotency constraints.

The email uses a restrained navy/red wordmark header, a maximum 600px table-based layout, inline CSS and an Outlook conditional-width wrapper. It has no remote assets, external CSS or JavaScript. Summary, customer, shipment and privacy sections omit empty optional fields and cells; table markup is only used for layout. User text is HTML-escaped with line breaks retained; Arabic values use automatic direction detection. The same populated fields generate concise plain text without table or Markdown formatting. The email includes a direct reply-to button and the automatic-notification footer.

The displayed reference is the last 12 hexadecimal characters of the existing submission UUID, when provided—not a generated or sequential reference. The full UUID remains in the original submission and in the email's reference title text. The subject never contains the UUID. Time is server receipt time formatted in `Asia/Riyadh` as Riyadh local time with `UTC+03:00`. The `mailto:` links preserve the `@` separator (for example, `mailto:info@envodkingdom.net`) and safely encode unusual local-part characters. Phone/WhatsApp links require syntactically valid international notation (`+` or `00`, 8–15 digits, no extension); local-format numbers remain readable without guessing the country. Obvious dummy numbers, known reserved North American fictional numbers and all test-submission phone values receive no contact actions. A WhatsApp link does not verify account availability.

For an explicitly authorized sample, prefix the submitted service with `[TEST]`. The subject and body then clearly identify a test. Ordinary names containing “Test” do not trigger the label. Never put sample content in production template defaults, and do not send realistic test fixtures to real recipients.

Retry metadata is bounded to 10,000 hash/timestamp entries with 24-hour expiry and contains no customer text. Same-process unchanged retries retain the identical body and key even when the clock advances. Across a restart, a regenerated timestamp may cause the provider to reject an unchanged key with different content rather than confirm acceptance. There is no durable multi-instance ledger; do not claim unlimited or cross-deployment duplicate prevention, particularly across template upgrades or the provider's idempotency retention window.

Checks actually run for this template update:
- All **14 server enquiry tests** passed, including both form types, fixed recipient/Reply-To, normal/test subjects, absent optional fields/reference, Riyadh time, links, escaping, privacy, provider failures, rate limiting and identical retry payloads.
- Full workspace typecheck and production/SSR build passed; 92 pages prerendered.
- Existing production browser regression passed for contact and quote validation, failures, retries, explicit acceptance, ATA fields, consent, language navigation and mobile layouts. All valid email calls were intercepted.
- Nine Chromium email renders passed: normal, explicit test and Arabic/long-content fixtures at 320px, 402px and 1200px, without horizontal overflow. Desktop and mobile screenshots were inspected.
- Rendered HTML and plain-text previews are under `generated-artifacts/enquiry-email-*`; they contain fictitious preview data only.

## Service-specific enquiry forms — 17 October 2026

The contact form and quote modal now use the same 14-category English/Arabic service list, with existing service-catalog links mapped to their matching category. Service pages preselect the relevant category on the contact form. Optional category-specific questions cover customs clearance, sea freight, warehousing, relocation, exhibition logistics, ATA Carnet, road transport, air freight, and the other existing categories. “Other” alone requires a description. The forms preserve a category's entered details when switching away and back, while sending only the selected category's answers.

Server-side validation checks that submitted service-detail keys belong to the selected category, applies each field's length/type/range constraints, and rejects a non-empty “Other” description only when it is missing. The HTML and plain-text email group service answers separately from customer requirements and shipment details, translate fixed-choice values, and omit empty fields. Test-labelled email content explicitly marks the consent value as simulated and does not claim genuine customer consent.

**Live acceptance tests:** five clearly labeled `[TEST]` submissions using fake sample information were sent to the unchanged recipient, `info@envodkingdom.net`: Customs Clearance, Sea Freight, Warehousing, Relocation, and an ATA Carnet quote. All five returned HTTP `201` with `ok: true` and `accepted: true` between **17:34:46 and 17:34:49 UTC** (**20:34:46–20:34:49 Riyadh time**) on 17 October 2026. No request was retried. This confirms provider acceptance only; receipt of these five messages and their rendering in the mailbox remain unconfirmed.

Final verification after this update: workspace typecheck passed; all 14 server enquiry tests and 6 cargo/contract tests passed; the production build prerendered 92 routes; the browser regression suite passed with valid submissions intercepted and no additional email sent. The managed web workflow restarted, and `/api/healthz` returned `{"status":"ok"}`.

Before separate authorization for each redesigned-template preview, no live email was sent during template development. A previous `[TEST]` preview returned provider acceptance at 16:18:49 UTC on 17 October 2026, using the earlier layout. Following the final refinement and explicit in-brief instruction, one final-layout `[TEST]` submission was sent through the running preview endpoint. It returned HTTP 201 and `{"ok":true,"accepted":true}` at **16:32:51 UTC on 17 October 2026**. The unchanged recipient is `info@envodkingdom.net`; no retry was made. This confirms provider acceptance, but the owner has not yet confirmed receipt of this latest layout. Gmail and Outlook rendering have **not** been independently inspected; local browser previews and email-safe markup do not establish third-party client compatibility.

Pre-change source backup: `generated-artifacts/backups/enquiry-before-template-20261017.tar.gz`.

## Reproduce automated checks

```sh
pnpm run typecheck
pnpm --filter @workspace/envod-kingdom run test:enquiries
pnpm --filter @workspace/envod-kingdom exec tsx --test ../../scripts/enquiry-contract.test.ts
```

Run `scripts/verify-envod-seo.py --origin` and `scripts/verify-envod-browser.mjs` against an isolated local production server. The browser script requires Playwright and a Chromium executable and intercepts every valid email submission; do not remove that interception to test real mail without explicit authorization.

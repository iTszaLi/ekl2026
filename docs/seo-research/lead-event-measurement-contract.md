# Lead-event measurement contract

## Implemented client-side events

| Events | Meaning | Does not prove |
|---|---|---|
| `call_click`, `whatsapp_click`, `email_click` | User clicked a contact link | Connected call, message sent, enquiry received or qualified lead |
| `service_cta_click` | User followed a service/contact CTA | A submitted form |
| `quote_form_start`, `contact_form_start` | User began the relevant interaction | Intent quality or a completed submission |
| `quote_form_submit_failure`, `contact_form_submit_failure` | An attempted submission failed at the request/API stage | Invalid-field validation totals or a lost qualified customer |
| `quote_form_submit_success`, `contact_form_submit_success` | The UI received a successful API response | Inbox delivery, organic attribution or qualification |

Payloads are limited by the application contract to event name, page path, language, optional service category and CTA location. New failure events do not contain server error bodies or entered names, email addresses, telephone numbers, shipment descriptions, dates, dimensions or weights.

## What was verified

The local production browser test intercepted valid POSTs and exercised a failure followed by a successful retry for **both** forms. It asserted one failure and one success event per test flow and checked that test names, email and telephone values were absent from the event queue. These are test fixtures, not business leads. No valid live enquiry was sent.

The server's intentionally non-revealing honeypot response and untrusted client-side events mean the frontend success queue alone must never be an authoritative sales count.

## Still required for real lead measurement

1. Connect the owner's authorized measurement property and review privacy/consent requirements before installing a vendor collector. The current `dataLayer` queue sends nothing to a vendor by itself.
2. Establish a Saudi organic baseline using consistent dates, country, device, language, service and attribution definitions. Preserve a separate unknown/unattributed category.
3. Verify Resend sender-domain setup, provider acceptance and delivery evidence separately. No new live-send permission is implied by a browser test.
4. Define private lead qualification with the business: genuine relevant shipment, suitable lane/service, workable schedule and contact follow-up outcome. Never copy customer details into analytics.
5. Join only approved aggregate outcomes to attribution. A referrer/session, contact-link click, API acceptance, delivered email and qualified enquiry are separate stages.
6. Exclude internal tests, bots and duplicates before reporting. Report failures as reliability signals, not automatically as lost leads.

No organic session, delivered enquiry, conversion rate, revenue, customer or qualification baseline is available. Use the blank reporting templates; do not fill them with zero or simulated test results.

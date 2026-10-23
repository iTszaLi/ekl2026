# Tracking and lead measurement

## Baseline status

No authenticated Search Console, GA4 or verified SEO-provider report for ENVOD was supplied. The code currently queues privacy-safe dataLayer events but does not install a vendor measurement tag. Therefore actual ENVOD impressions, clicks, CTR, average positions, sessions, qualified leads and conversion rates are **unavailable**, not zero.

The integration inventory was rechecked during the organic-growth continuation on 17 October 2026; no attached/already-authorized Google analytics or profile connection was returned. `organic-measurement-baseline.csv` and `organic-reporting-template.csv` provide blank, defined baseline/weekly/monthly records without manufacturing results. `backlink-outreach-tracker.csv` records candidate actions separately from actual referring-domain evidence.

The later controlled-stage implementation added `quote_form_submit_failure` and `contact_form_submit_failure`, with intercepted local production tests for failure/retry/success and absence of test PII in queued events. See `lead-event-measurement-contract.md`. These client-side events are not an authoritative delivered or qualified-lead count.

The SAL benchmark is owner-supplied, time-sensitive competitor data. Do not import its position/traffic columns as ENVOD metrics or add together overlapping estimated traffic values.

## Four datasets

1. Immutable owner-supplied SAL benchmark, including branded and spelling-variant queries.
2. Dated third-party estimates, only when a provider and filters are recorded.
3. First-party Search Console/analytics exports for ENVOD, with dates, country, device, page and query definitions.
4. Research hypotheses from the opportunity map, explicitly unmeasured.

## Setup needed

- Verify ownership of the appropriate Google Search Console property, submit the canonical sitemap after publication and inspect a sample of EN/AR service URLs.
- Obtain authorized access to an existing GA4 property or the owner's selected measurement platform. Do not invent a Measurement ID or put credentials into research files.
- Agree on consent/privacy requirements and tag behavior before adding a vendor. Review and update privacy/cookie notices when tracking changes.
- In GTM, map existing dataLayer events to GA4 custom events with language, page_path, service_category and cta_location only. Do not include names, email addresses, telephone values, message bodies, shipment references or URL query strings.
- Filter internal/testing traffic and mark key events only after end-to-end validation.

## Current events

| Event | Meaning | What it does not prove |
|---|---|---|
| `call_click` | Visitor clicked a telephone link | Call connected or became a customer |
| `whatsapp_click` | Visitor clicked a WhatsApp link | Message was sent or qualified |
| `email_click` | Visitor opened a mailto action | Email was actually sent |
| `service_cta_click` | Service/contact or quote action clicked | Completed enquiry |
| `quote_form_start` | Quote dialog opened | Visitor entered all required information |
| `quote_form_submit_success` | API success reported to quote UI | Inbox delivery or qualified lead |
| `contact_form_start` | Contact/status form first focused | Submission |
| `contact_form_submit_success` | API success reported to contact/status UI | Inbox delivery or qualified lead |

Honeypot submissions are intentionally accepted without forwarding; analytics is not a legally authoritative sent-email ledger. Provider acceptance is different from delivered/bounced status. Further bot filtering and delivery reporting should use authorized provider evidence.

## Reporting cadence

Weekly: query/page pairs, country/device/language, indexing errors, form failures and checked lead quality. Monthly: consistent 28-day comparisons, branded versus generic trends and landing-page improvements, with explicit timezone/date filters.

Monitor all 40 benchmark terms for competitive context, but exclude SAL brand, employment and investor searches from ENVOD commercial targeting. Keep ambiguous terms in their own review segment. Do not create SEO headlines from misspellings.

Store first-party lead qualification only in an authorized private workflow. Public research reports should contain aggregates with no customer or shipment identifiers.

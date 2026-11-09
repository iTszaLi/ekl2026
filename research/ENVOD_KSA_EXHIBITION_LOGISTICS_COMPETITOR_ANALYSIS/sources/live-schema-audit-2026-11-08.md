# Live JSON-LD inspection — 8 November 2026

Read-only extraction from the homepage and English/Arabic exhibition pages; this is not Google’s Rich Results Test or Schema Markup Validator.

## Homepage

- Nine JSON-LD scripts/nodes were parsed in the inspected HTML.
- Two Organization nodes share `https://www.envodkingdom.net/#organization`: one is a minimal node with only its type/id, the other contains the company name, URL, description, Riyadh postal address, phone and sameAs links to a Maps CID and JCTRANS profile.
- A separate LocalBusiness node uses `https://www.envodkingdom.net/#localbusiness` with the sameAs links.
- The homepage includes an ItemList named “ENVOD KINGDOM Logistics Services” with 24 service entries and a second name-only ItemList titled “Major Saudi & GCC exhibitions served by ENVOD KINGDOM SHIPPING SERVICES LLC” with 12 entries. It does not encode the named exhibitions as Event entities in this sample.
- Confirm that each “served by” association is supported by company records. The list’s name-only ItemList format is not a substitute for evidence.

## Exhibition pages

- English and Arabic service pages return a Service node, BreadcrumbList, FAQPage, Organization, LocalBusiness and WebSite data in the inspected output.
- No duplicate @id was found in the two service-page samples.
- JSON-LD parse success confirms syntax only; it does not validate Google policies, eligibility, entity resolution or factual accuracy.

## Analytics endpoint

- Direct GET to `https://www.envodkingdom.net/_vercel/insights/script.js` returned HTTP 404 on 8 Nov.
- The literal path was not present in the homepage HTML response. Check emitted JS or deployment configuration before concluding that a visitor sees a runtime error.

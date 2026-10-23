# Saudi English/Arabic keyword and competitor audit

Research and continuation date: **17 October 2026**.

## Evidence and limits

The initial research package contains the complete 40-row user-supplied SAL benchmark, 109 mapped EN/AR opportunities, a 46-English-page audit paired with Arabic metadata, and a disposition for each benchmark term. The supplied SAL report is not ENVOD rank/traffic data. The tool, report date, country/device filters and many numerical demand fields are unspecified.

Live English and Arabic web searches were conducted separately. This search service is **not a Saudi Google rank tracker**: no exact Google Saudi positions, paid/map/AI feature classification, backlinks or competitor traffic were measured. Unavailable metrics remain unavailable. See `competitor-gap-analysis.md` for page observations and source confidence, and `brand-search-strategy.md` for ambiguous business names.

`bilingual-keyword-database.csv` presents the master brief's requested keyword/language/intent/location/service/volume/difficulty/current-rank/target/priority/source/notes columns. It derives from the existing opportunity map, not another invented set of demand estimates. Every ENVOD current-rank cell explicitly states the evidence gap.

## New exact searches in this continuation

| Language | Exact search | Market / intent | Evidence |
|---|---|---|---|
| EN | `site.mawani.gov.sa Jeddah Islamic Port King Abdulaziz Dammam` | Saudi gateways, informational | Mawani port URLs and official SPA reporting returned; not a provider rank measurement |
| EN | `site.sar.com.sa Riyadh dry port freight` | Saudi inland logistics, informational | No definitive relevant SAR freight page established in the returned results |
| AR | `site.mawani.gov.sa ميناء جدة الإسلامي ميناء الملك عبدالعزيز` | Saudi gateway names, informational | Mawani pages returned |
| AR | `site.sar.com.sa الميناء الجاف الرياض` | Riyadh inland logistics, informational | Search results included secondary sources; no secondary claim was adopted as an ENVOD capability |
| EN | `site.sar.com.sa dry port Riyadh freight Dammam` | Dry-port connection, informational | Passenger guidance is not freight eligibility evidence |
| EN | `site.spa.gov.sa Riyadh Dry Port railway Dammam` | Dry-port connection, informational | SPA article `https://spa.gov.sa/N2092746` returned in search; connection reference is excerpt-level evidence |

These official-source queries supplement the earlier commercial EN/AR competitor searches; they do not establish demand for the exact query syntax.

## Sources and confidence

- **Fetched:** `https://www.spa.gov.sa/en/N2153933`, article dated 14 August 2024. It identifies Jeddah Islamic Port and King Abdulaziz Port in Dammam as distinct locations. High confidence for those named gateways; no claim about ENVOD facilities, capacity or appointments.
- **Access blocked:** `https://mawani.gov.sa/ports?port=King%20Abdulaziz%20Port%20Dammam` returned only an access/error image through extraction. Its port text was not treated as successfully fetched.
- **Earlier official source fetched:** ZATCA import instructions, linked in `competitor-gap-analysis.md` and on the customs page. Requirements and approvals are commodity-dependent.
- SAL, Saad, GBE and SMI service observations remain competitor page content, not verification of their operations or market position.

## Architecture decision

`master-service-coverage-map.csv` accounts for all **35** requested service categories. The 24 existing service pages are retained. Riyadh/Jeddah/Dammam customs intent uses distinct, linkable gateway sections within the existing customs page. Shared concepts such as 3PL, local distribution, temperature-controlled storage, stuffing and chartering remain mapped to relevant existing pillars pending verified business scope and differentiated content.

This avoids publishing thin city-service duplicates or claiming new offices. Each existing service's English and Arabic route stays unchanged.

## FAQ research process

1. Review verified Search Console query/page pairs once authorized access exists.
2. Collect genuine customer questions in an authorized private workflow, stripping identifiers before editorial use.
3. Compare EN and AR wording with live competitor and official regulatory sources.
4. Draft concise service-specific answers and record source/review date for regulated matters.
5. Review EN/AR accuracy and visible-content/schema agreement before publication.

No invented customer-question frequency, AI citation guarantee, review markup or special “AI indexing” file was added.

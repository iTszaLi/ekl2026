# Private Search Console Dashboard

## Scope and current state

The dashboard is a private, read-only admin tool at:

`https://www.envodkingdom.net/admin/search-console`

Its API is served at `/api/search-console/*`. The production UI is excluded from the sitemap and marked `noindex, nofollow`; authenticated API responses use `Cache-Control: no-store`. The dashboard is not connected to Google until the owner configures the production environment and an authorized administrator completes OAuth. A successful site build alone does not provide Search Console metrics.

The API only requests Google identity (`openid`, `email`) and the Search Console read-only scope:

`https://www.googleapis.com/auth/webmasters.readonly`

It does not submit URLs, alter pages, request indexing, or use Google's write scope.

## Production setup in Vercel

The Vercel project is `ekl2026-envod-kingdom` with the site rooted at `artifacts/envod-kingdom`.

1. In Vercel, create or attach a **private** Blob store to this project. The attached store must provide `BLOB_READ_WRITE_TOKEN` to the Production environment. Do not use a public Blob store for OAuth state.
2. In Google Cloud, enable the **Google Search Console API** and configure the OAuth consent screen. Create a Web application OAuth client.
3. Set the authorized JavaScript origin to `https://www.envodkingdom.net` and add this exact authorized redirect URI:

   `https://www.envodkingdom.net/api/search-console/oauth/callback`

4. Add the variable names below to the Vercel project's **Production** environment. Secret values must be entered directly in Vercel; never paste them into chat, source files, frontend variables, or a committed `.env`.
5. Redeploy the production branch after environment setup.
6. Open the dashboard, sign in with the allowlisted Google account, and select the exact ENVOD property returned by Google—prefer `sc-domain:envodkingdom.net` if available. URL-prefix properties are not treated as interchangeable.
7. Verify that the account can load live metrics, run the read-only site crawl, and inspect a small set of ENVOD URLs.

| Variable | Requirement | Purpose |
|---|---|---|
| `GSC_CLIENT_ID` | Required | Google OAuth Web application client ID. |
| `GSC_CLIENT_SECRET` | Required secret | Google OAuth Web application client secret. |
| `GSC_ADMIN_EMAIL` | Required | Exact Google account email allowed to use the dashboard. |
| `GSC_REDIRECT_URI` | Required | Exact callback URI above; it must match the OAuth client registration. |
| `SESSION_SECRET` | Required secret, at least 32 characters | Signs the administrator session and OAuth state cookie. Keep it separate from the encryption key. |
| `GSC_TOKEN_ENCRYPTION_KEY` | Required secret, at least 32 characters | Independent key used to derive the AES-256-GCM key for the encrypted connection record. Generate a high-entropy value (for example, `openssl rand -hex 32`) and enter it only in Vercel. |
| `BLOB_READ_WRITE_TOKEN` | Required in Vercel | Read/write token for the attached private Blob store. Vercel provides this when the store is attached. |

For a Google OAuth consent screen in **Testing**, Google documents that refresh tokens expire after seven days when the app requests scopes beyond basic profile scopes. The read-only Search Console scope is beyond those basic scopes. Complete Google's applicable OAuth publishing/verification requirements before relying on long-lived production access. See [Google OAuth 2.0 token expiration](https://developers.google.com/identity/protocols/oauth2#expiration) and [Search Console API authorization](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing).

## Local development

The local Express server uses the encrypted `.private-data/gsc.enc` file only outside Vercel. For local development, set `GSC_TOKEN_ENCRYPTION_KEY` and the required OAuth settings through Replit Secrets or another local secret manager. Use the current HTTPS development callback only if it is registered in the Google OAuth client. Never copy the local token file into Vercel.

Vercel requests are deliberately not allowed to fall back to local disk. If the private Blob store, OAuth values, or encryption key are missing, the API reports that setup is incomplete and does not attempt to persist credentials.

## Security and data handling

- The client secret, access token, refresh token, and OAuth PKCE verifier are never returned in API responses.
- OAuth state and the PKCE verifier are held in a short-lived, signed, `HttpOnly`, `SameSite=Lax` cookie so the flow works across separate serverless instances. HTTPS requests set `Secure`.
- The Google refresh token, selected property, sync timestamp, and latest crawl report are encrypted with AES-256-GCM before private Blob storage. `SESSION_SECRET` and `GSC_TOKEN_ENCRYPTION_KEY` are separate.
- The private Blob object uses a fixed path, private access, and uncached consistent reads. Vercel's temporary filesystem is not used.
- State-changing requests require a same-origin request from the production ENVOD domain. The server also validates the allowlisted administrator's signed session.
- The crawler first reads robots.txt and sitemap declarations, stays on ENVOD domains, limits pages and response sizes, and makes no content changes or indexing requests.
- The Vercel Search Console function sets a 120-second request ceiling to accommodate the read-only crawl; actual duration remains subject to the Vercel plan limit.
- URL Inspection is limited to ten ENVOD URLs per request. The Google API flow does not include write scopes or indexing submission.
- Dashboard analytics are fetched from Search Console on demand and are not persisted as query-level reports. The in-memory dashboard response cache is short-lived and instance-local.
- Only the latest crawl report is retained. It is cleared when an expired report is accessed after 30 days or replaced by the next crawl. The current implementation has no scheduled purge for an idle Blob record.
- Disconnect attempts to revoke the Google token and deletes the private connection object. If Google revocation is unavailable, deleting the local record still removes this app's stored credential.
- Avoid logging request bodies, OAuth codes, access tokens, refresh tokens, or the contents of the encrypted store.

## Limits and verification

Search Console can delay or omit recent data, anonymized queries, or rows beyond API limits. Average position is the selected property's aggregate Search Console metric, not a fixed rank for every searcher. URL Inspection is not a complete indexing report.

Before owner configuration, `/api/search-console/session` should return a safe unconfigured status and the admin screen should remain non-indexable. After setup, verify:

1. OAuth succeeds only for `GSC_ADMIN_EMAIL`.
2. The selected property is an exact property returned by Google.
3. Dashboard dates, query dimensions, and URL Inspection data match live API responses.
4. A cross-origin POST is rejected.
5. Disconnect clears the stored record and the admin session.
6. `/robots.txt`, `/sitemap.xml`, and public page metadata remain unchanged by the admin route.

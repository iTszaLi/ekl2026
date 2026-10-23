# Private Search Console Dashboard Setup

## Current status

The review copy contains a server-side Google OAuth flow, an allowlisted admin session, encrypted token storage, a private dashboard, a read-only crawler and URL Inspection requests. The integration is **not connected or live-tested** until the required secrets are added and the administrator completes Google authorization.

This setup applies to the Replit review copy only. It does not alter the Vercel project, GitHub production branch, domain configuration, or production website.

## Google Cloud setup

1. In Google Cloud Console, create or select a project for this private dashboard.
2. Enable the **Google Search Console API**.
3. Configure the OAuth consent screen. Add the Google account that owns or has access to the ENVOD KINGDOM Search Console property as an authorized test user if the app remains in Testing.
4. Request only these identity and data scopes:
   - `openid`
   - `email`
   - `https://www.googleapis.com/auth/webmasters.readonly`
5. Create an OAuth 2.0 Client ID with application type **Web application**.
6. Add the exact callback URL below under **Authorized redirect URIs**:

   `https://a7ebb319-37a0-4861-9dc2-9136d55cda1e-00-2znz0ahbzqskl.sisko.replit.dev/api/search-console/oauth/callback`

   This was derived from the current Replit development domain and the app's `/api/search-console/oauth/callback` route. If that development domain changes, use the current `REPLIT_DEV_DOMAIN` with the same path and update the Google OAuth client to match. Do not register a guessed production callback.

Google may require the consent-screen domain to be verified or may restrict the unverified testing setup. If Google rejects the Replit callback/domain, do not substitute an unrelated redirect or expose tokens; a verified HTTPS domain that actually routes to this backend will be needed.

## Replit Secrets

Add these values through the Replit Secrets flow, never in chat, source files, frontend variables, or a committed `.env`:

| Secret name | Value to provide |
|---|---|
| `GSC_CLIENT_ID` | OAuth Web application client ID from Google Cloud |
| `GSC_CLIENT_SECRET` | OAuth Web application client secret from Google Cloud |
| `GSC_ADMIN_EMAIL` | The exact Google account email authorized to use this private dashboard |
| `SESSION_SECRET` | Already configured for this project; retain it and do not replace it for this setup |

`GSC_REDIRECT_URI` is optional for the current Replit development domain. If it is set, it must be the exact registered HTTPS callback URL, including `/api/search-console/oauth/callback`.

## Connect and verify

1. Open `/admin/search-console` in the Replit review copy.
2. Choose **Sign in with Google** and authorize the listed identity and read-only Search Console scope.
3. Select the exact available `sc-domain:envodkingdom.net` property if present. Otherwise select the exact available `https://envodkingdom.net/` or `https://www.envodkingdom.net/` URL-prefix property. The dashboard does not assume those properties are interchangeable.
4. Confirm that the dashboard shows the chosen property and the actual API response before using its metrics.
5. Use the dashboard's disconnect control to revoke the Google token and remove the locally stored connection.

## Security and data handling

- OAuth code exchange, token refresh, identity verification, Search Console requests, and URL Inspection requests run on the server.
- The browser receives only dashboard data and safe connection status. Client secret, access token, and refresh token are not returned to it.
- A signed, `HttpOnly`, `SameSite=Lax` admin cookie is limited to the configured `GSC_ADMIN_EMAIL`; HTTPS requests set `Secure`.
- The Google refresh token is encrypted with AES-256-GCM and a key derived from the existing `SESSION_SECRET`. The encrypted file is placed in `.private-data`, outside the static public build, and excluded from Git and deployment packaging.
- Search Console analytics are fetched only for an exact property returned by Google's API and selected by the administrator.
- The crawler is limited to `www.envodkingdom.net` and `envodkingdom.net`, reads robots.txt and sitemap declarations first, caps the crawl at 300 URLs, limits each response body, and does not send indexing requests or change page content.
- URL Inspection is limited to ten ENVOD URLs per request. No Indexing API or submit/publish operation is implemented.
- The dashboard uses Google's read-only Search Console scope. It does not include the Search Console Links report, Manual Actions report, or all indexing coverage data; those remain unavailable through this API flow.

## Deployment limitation

The website is deployed on Vercel, but this Search Console dashboard and its OAuth routes are not. The encrypted token file is workspace-local and is not a durable deployment database. Before enabling the dashboard in production, configure durable private storage, a production-safe callback, the authorized administrator identity, and HTTPS session behavior for that deployment. Do not copy the development callback or the local token file into production by assumption.

The current Vercel deployment serves the static site and enquiry function, not these Search Console routes. See the repository-level `docs/production-environment-variables.md` for the variable names and deployment boundary; adding OAuth secrets alone will not make this filesystem-backed dashboard available on Vercel.

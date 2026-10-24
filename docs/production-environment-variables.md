# ENVOD KINGDOM production environment variables

This document records variable names and purposes only. Never commit actual secret values, paste them into chat, or expose them through a `VITE_` variable. Configure production secrets in Vercel's encrypted project settings.

## Vercel production site and enquiry delivery

| Variable | Requirement | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Required for contact and quote email delivery | Server-only credential used by `artifacts/envod-kingdom/api/enquiries.ts` to submit accepted enquiries to Resend. |
| `RESEND_FROM_EMAIL` | Optional | Owner-approved, verified sender address. If unset, the server uses `ENVOD KINGDOM Website <info@envodkingdom.net>`. |

The website and `/api/enquiries` function use the same origin, so `VITE_API_BASE_URL` is not required for this Vercel deployment. Never expose `RESEND_API_KEY` through a frontend variable. A successful build does not verify that Resend accepts or delivers messages; perform a separately authorized test only after the production key and recipient are configured.

## Private Search Console dashboard

The production route is `/admin/search-console`; its API is `/api/search-console/*`. The Vercel function uses an attached **private** Blob store, not the deployment filesystem. Configure the following in Vercel under the `ekl2026-envod-kingdom` project, whose root directory is `artifacts/envod-kingdom`:

| Variable | Requirement | Purpose |
|---|---|---|
| `GSC_CLIENT_ID` | Required | Google OAuth Web application client ID. |
| `GSC_CLIENT_SECRET` | Required secret | Google OAuth Web application client secret. |
| `GSC_ADMIN_EMAIL` | Required | Exact Google account allowed to use the private dashboard. |
| `GSC_REDIRECT_URI` | Required | Exact OAuth callback: `https://www.envodkingdom.net/api/search-console/oauth/callback`. |
| `SESSION_SECRET` | Required secret, at least 32 characters | Signs the administrator session and OAuth state cookie. |
| `GSC_TOKEN_ENCRYPTION_KEY` | Required secret, at least 32 characters | Independent key used to derive the AES-256-GCM key for the encrypted Google connection record. Generate a high-entropy value and store it only in Vercel. |
| `BLOB_READ_WRITE_TOKEN` | Required | Vercel-provided read/write token for the attached private Blob store. Attach the store to the Vercel project rather than copying a token into source control. |

Register `https://www.envodkingdom.net` as the OAuth JavaScript origin, enable the Google Search Console API, and register the exact callback above in the OAuth client. Only the identity scopes and `https://www.googleapis.com/auth/webmasters.readonly` are requested. Read the [dashboard setup guide](artifacts/envod-kingdom/docs/search-console-dashboard-setup.md) before enabling production access.

The API fails closed when required settings or private storage are missing; it does not fall back to ephemeral Vercel disk. Do not use `SESSION_SECRET` as a substitute for `GSC_TOKEN_ENCRYPTION_KEY`.

## Local Express server and separate static-host options

These variables apply only when using the local Express server or a separately hosted frontend; they do not all apply to the Vercel serverless enquiry function.

| Variable | Requirement | Purpose |
|---|---|---|
| `PORT` | Runtime-provided; defaults to `3000` locally | HTTP listening port. |
| `BASE_PATH` | Optional; defaults to `/` | Build/runtime mount path for the site. Keep build and server values consistent. |
| `LOG_LEVEL` | Optional; defaults to `info` | Server log verbosity. |
| `ENQUIRY_ALLOWED_ORIGINS` | Optional for the Express server | Comma-separated allowed web origins, without paths. The Vercel enquiry handler has its own fixed origin allowlist and does not read this variable. |
| `VITE_API_BASE_URL` | Optional build-time value for a separate static frontend | Public HTTPS API origin plus base path and `/api`; contains no credentials. The client appends `/enquiries`. |

For local Search Console development, `GSC_TOKEN_ENCRYPTION_KEY` and OAuth values belong in Replit Secrets or another local secret manager. Local file storage is only a development fallback; it must not be copied to production. `NODE_ENV` and `VERCEL` are runtime-provided, not secrets. Do not point a production API base URL at a local or development host.

## Configuration and verification status

The repository contains no production secret values. The production Vercel project must be configured independently. As of the current review, no Search Console OAuth or Blob configuration was available in the Vercel project, and production enquiry delivery had not been verified. Confirm environment-variable names and deployment status after owner setup; never infer working delivery or live Search Console access from a successful build.

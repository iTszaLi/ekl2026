# ENVOD KINGDOM production environment variables

Do not put secret values in this repository, chat, browser code or a `VITE_` variable. Configure secrets using the hosting provider's encrypted environment-variable settings. This file records names and purposes only.

## Vercel production site

| Variable | Requirement | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Required for contact and quote email delivery | Server-only credential used by `artifacts/envod-kingdom/api/enquiries.ts` to submit accepted enquiries to Resend. |
| `RESEND_FROM_EMAIL` | Optional | Owner-approved, verified sender address. If unset, the server uses `ENVOD KINGDOM Website <info@envodkingdom.net>`. |

The website and `/api/enquiries` function use the same origin, so `VITE_API_BASE_URL` is not required for this Vercel deployment. Never expose `RESEND_API_KEY` through a frontend variable.

## Search Console admin server

The current Search Console dashboard and OAuth routes run in the Express server. They are not exposed by the current Vercel deployment, which serves the static site and the enquiry function only. The encrypted OAuth token file is local filesystem storage and is not durable across serverless instances. Do not treat these variables alone as enabling the admin panel on Vercel; a compatible protected API and durable encrypted storage must be implemented first.

When deploying that server on a compatible persistent host, its required server-side variables are:

| Variable | Requirement | Purpose |
|---|---|---|
| `GSC_CLIENT_ID` | Required | Google OAuth web-application client ID. |
| `GSC_CLIENT_SECRET` | Required secret | Google OAuth web-application client secret. |
| `GSC_ADMIN_EMAIL` | Required | Exact Google account authorized for the private dashboard. |
| `SESSION_SECRET` | Required secret, at least 32 characters | Signs admin sessions and derives the encryption key for stored Google refresh tokens. Use a strong value and keep it server-side. |
| `GSC_REDIRECT_URI` | Required outside the supported Replit development setup | Exact registered HTTPS OAuth callback URL, including `/api/search-console/oauth/callback`. |

Register a production callback only after the protected route is actually served at that URL. Never copy a development callback or local token file into production.

## Express server and separate static-host options

These variables apply only when using the Express server or a separately hosted frontend; they do not all apply to the Vercel serverless enquiry function.

| Variable | Requirement | Purpose |
|---|---|---|
| `PORT` | Runtime-provided; defaults to `3000` locally | HTTP listening port. |
| `BASE_PATH` | Optional; defaults to `/` | Build/runtime mount path for the site. Keep the build and server values consistent. |
| `LOG_LEVEL` | Optional; defaults to `info` | Server log verbosity. |
| `ENQUIRY_ALLOWED_ORIGINS` | Optional for the Express server | Comma-separated allowed web origins, without paths. The Vercel enquiry handler has its own fixed origin allowlist and does not read this variable. |
| `VITE_API_BASE_URL` | Optional build-time value for a separate static frontend | Public HTTPS API origin plus base path and `/api`; contains no credentials. The client appends `/enquiries`. |

`NODE_ENV` is supplied by the runtime/build system and is not a secret. Do not set a Vercel API base URL to a local or development host.

## Current configuration status

The repository contains no production secret values. The Vercel project must be checked and configured separately; a successful build does not mean email sending or Search Console administration is configured.

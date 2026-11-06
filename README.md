# ENVOD KINGDOM SHIPPING SERVICES LLC

A modern cinematic marketing website for logistics and shipping services.
Live at https://www.envodkingdom.net (hosted on Vercel; every merge to `main` deploys to production).

All public pages are prerendered static HTML. A small set of Vercel serverless functions handles enquiry email delivery and the private Search Console admin dashboard. There is no database.

Bilingual (English / Arabic) with full LTR / RTL support.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Wouter

## Features

- Services catalog (logistics, freight, customs clearance, and more)
- Industry showcase sections
- Bilingual support (English / Arabic, RTL / LTR)
- Animated UI with smooth transitions
- Gallery and branding sections
- Contact and quotation forms delivered by email through the `/api/enquiries` function (Resend)
- Private, noindex Search Console dashboard at `/admin/search-console` (Google sign-in for one allowlisted account)

## Project Structure

```
artifacts/envod-kingdom/        Website (Vercel root directory)
artifacts/envod-kingdom/api/    Vercel serverless functions (enquiries, Search Console)
artifacts/envod-kingdom/server/ Shared server code, local Express server and tests
attached_assets/                Images, logos, media
scripts/                        Utility scripts
docs/                           Operations, environment-variable and SEO documentation
```

Developer and AI-assistant rules are in [CLAUDE.md](CLAUDE.md). Environment variable names (never values) are in [docs/production-environment-variables.md](docs/production-environment-variables.md).

## Installation

```bash
pnpm install --frozen-lockfile
```

## Development

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/envod-kingdom run dev
```

## Build

```bash
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build
```

On Windows Git Bash, leave `BASE_PATH` unset or prefix the command with `MSYS_NO_PATHCONV=1`; see CLAUDE.md.

## Tests

```bash
pnpm run typecheck
pnpm --filter @workspace/envod-kingdom run build   # also runs the SEO route tests
pnpm run test                                      # all unit tests plus checks on the built output
```

GitHub Actions runs the same steps on every pull request (`.github/workflows/ci.yml`).

## Notes

- Public content is prebuilt into static HTML for all English and Arabic routes
- Server-side code runs only in the Vercel functions under `artifacts/envod-kingdom/api/`
- No database is included; the Search Console connection record is stored encrypted in private Vercel Blob storage
- Earlier versions of this README described the site as having no backend and mailto-based forms; that is no longer accurate

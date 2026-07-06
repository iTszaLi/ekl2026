# ENVOD KINGDOM SHIPPING SERVICES LLC

A modern cinematic marketing website for logistics and shipping services.
Fully static frontend application with no backend or database.

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
- Contact option using mailto-based form (no backend)

## Project Structure

```
artifacts/envod-kingdom/   Main frontend application
attached_assets/           Images, logos, media
scripts/                   Utility scripts
```

## Installation

```bash
pnpm install
```

## Development

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/envod-kingdom run dev
```

## Build

```bash
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/envod-kingdom run build
```

## Notes

- This is a fully static frontend project
- No backend, API server, or database is included
- All content is prebuilt into static files
- Contact forms use mailto email links instead of server requests

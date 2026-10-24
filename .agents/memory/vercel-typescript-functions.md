---
name: Vercel TypeScript function builds
description: NodeNext import and emission requirements for Vercel serverless TypeScript endpoints in this monorepo.
---

For Vercel Node functions, keep explicit `.js` extensions on relative imports throughout the function's dependency graph; TypeScript resolves those specifiers to the matching `.ts` sources. Do not set `allowImportingTsExtensions` when Vercel needs emitted JavaScript. Vercel's TypeScript builder forces emission, while that option is only valid with `noEmit` or declaration-only output. The app's local typecheck can continue to pass `--noEmit` on the command line.

The Vercel function compiler can report type errors in an imported server module even when the workspace typecheck passes. A local typecheck is not a substitute for verifying the actual Vercel function build, especially for Express handlers and ambient request augmentations.

**Why:** the function compiler exposed NodeNext import/emission requirements and later reported Express request/response type errors that the local workspace check did not catch.

**How to apply:** if Vercel reports TS2835, fix `.js` specifiers across the API dependency graph. If it reports `Emit skipped`, inspect TypeScript options that conflict with output emission. For handler type errors, inspect the actual deployment log and ensure required types/augmentations are reachable from the function graph; verify with the real Vercel build, not only local `tsc`.

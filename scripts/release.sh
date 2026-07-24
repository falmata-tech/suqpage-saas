#!/usr/bin/env bash
set -euo pipefail

printf '\n=== Specification and traceability validation ===\n'
node scripts/validate-specs.mjs

printf '\n=== Production build ===\n'
NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build

printf '\n=== Output-file trace privacy validation ===\n'
node scripts/test-build-trace.mjs

printf '\n=== Production HTTP smoke tests ===\n'
node scripts/http-smoke.mjs

printf '\n=== TypeScript validation ===\n'
node node_modules/typescript/bin/tsc --noEmit

printf '\n=== Showroom integration validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/validate-designs.ts

printf '\n=== Stockless catalog and recovery validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-stockless-catalog.ts

printf '\n=== Versioned product upkeep validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-product-upkeep.ts

printf '\n=== Security integration tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-security.ts

printf '\n=== Adapter boundary tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-adapters.ts

printf '\n=== Managed request integration tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-requests.ts

printf '\n=== Revision publication integration tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-revisions.ts

printf '\n=== Production dependency audit ===\n'
npm audit --omit=dev --audit-level=moderate

printf '\nAll SuqPage release checks passed.\n'

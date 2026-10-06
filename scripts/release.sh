#!/usr/bin/env bash
set -euo pipefail

release_target="${SUQPAGE_RELEASE_TARGET:-all}"
if [[ "$release_target" == "web" ]]; then
  node scripts/check-web-install.cjs
  npm audit --workspace=@suqpage/contracts --include-workspace-root --audit-level=moderate
elif [[ "$release_target" != "all" ]]; then
  printf 'Unknown release target.\n' >&2
  exit 1
fi

scale_fixture_root=""
cleanup_release_fixtures() {
  if [[ -n "$scale_fixture_root" && -d "$scale_fixture_root" ]]; then
    rm -rf -- "$scale_fixture_root"
  fi
}
trap cleanup_release_fixtures EXIT

printf '\n=== Specification and traceability validation ===\n'
node scripts/validate-specs.mjs

node scripts/test-source-map-security.cjs

printf '\n=== Production build ===\n'
NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build

printf '\n=== Output-file trace privacy validation ===\n'
node scripts/test-build-trace.mjs

printf '\n=== Provider-backed production HTTP smoke tests ===\n'
if [[ "${SUQPAGE_DELEGATE_PROVIDER_SMOKE:-0}" == "1" ]]; then
  printf 'Delegated to the required provider-backed browser CI job.\n'
elif command -v supabase >/dev/null 2>&1; then
  node scripts/acceptance-runner.mjs --grep "API authorization, validation, health, and security headers"
else
  printf 'Supabase CLI is required for the provider-backed release smoke.\n' >&2
  exit 1
fi

printf '\n=== Server pagination and scale fixture validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-pagination.ts
node node_modules/tsx/dist/cli.mjs scripts/test-scalable-queries.ts
node --import tsx scripts/test-native-postgres.ts
node --import tsx scripts/test-scale-fixtures.ts

printf '\n=== TypeScript validation ===\n'
node node_modules/typescript/bin/tsc --noEmit

printf '\n=== Showroom integration validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/validate-designs.ts

printf '\n=== Stockless catalog and recovery validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-stockless-catalog.ts

printf '\n=== Versioned product upkeep validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-product-upkeep.ts

printf '\n=== Showroom recipe validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-showroom-recipe.ts

printf '\n=== Typed showroom content-block validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-showroom-content-blocks.ts

printf '\n=== Additive design-v2 compatibility validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-showroom-composition-v2.ts

printf '\n=== Additive revision-v4 domain validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-revision-v4.ts

printf '\n=== Controlled YouTube provider normalization ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-youtube-provider.ts

printf '\n=== Controlled live-showroom validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-live-showroom.ts

printf '\n=== Rich offering additive migration validation ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-rich-offering-migration.ts

printf '\n=== Security integration tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-security.ts

printf '\n=== Adapter boundary tests ===\n'
node node_modules/tsx/dist/cli.mjs scripts/test-adapters.ts

printf '\n=== Standard owner page and launch wiring tests ===\n'
node --import tsx scripts/test-page-review.ts
node --import tsx scripts/test-standard-invitations.ts
node --import tsx scripts/test-launch-wiring.ts
node --import tsx scripts/test-media-reconciliation.ts

printf '\n=== Production dependency audit ===\n'
if [[ "$release_target" == "web" ]]; then
  npm audit --workspace=@suqpage/contracts --include-workspace-root --audit-level=moderate
else
  npm audit --omit=dev --audit-level=moderate
fi

printf '\nAll Suqpage release checks passed.\n'

---
id: DEP-020
title: MirtPage marketplace rollout
status: done
related: [FE-024, FE-025, BE-023, DEP-017, DEP-019, DEP-021]
owners: [operations, engineering, design]
last_updated: 2026-08-02
change_level: L3
---

# DEP-020 - MirtPage marketplace rollout

## Problem and scope

Admit the MirtPage identity, broader producer positioning, reviewed production
scale, dashboard attention summary, and refined marketplace interaction into the
local pre-launch environment without changing stable showroom routes.

## Rollout sequence

1. Validate FE-024 and BE-023 contracts and reciprocal links.
2. Apply additive migration 25 and verify existing profiles default safely.
3. Reset disposable fixtures with existing showrooms plus authored growing
   factories and reviewed discovery scale.
4. Verify public filter composition and role-scoped attention counts.
5. Capture homepage, map preview, Expo, Sunday showcase, login, intake, and
   dashboard at desktop, 390px, and 320px widths.
6. Run `npm run check`, `npm run test:acceptance`, and `npm run release`.
7. Apply additive migration 26, seed five sponsored showrooms per industry, and
   seed independently curated Sunday enterprises for every rotating industry.
8. Replace desktop/mobile evidence for the sponsored rail, detailed schedule,
   weekday Expo, Sunday Featured Enterprises floor, city marketplace, and
   centered showroom modal.

## Rollback

Revert the task commit and deploy the prior application. Migration 25 may remain
because its column and index are additive. The local fixture database may be
reset; production rollout and domain/DNS changes are excluded.

## Admission criteria

- No active public/dashboard UI contains the retired platform identity or labels
  a showroom with the retired marketplace destination term.
- Existing `/@handle` routes continue to resolve.
- Scale filters and attention summaries pass scope and query-plan tests.
- Preview dialogs and primary marketplace workflows pass 1440/390/320 browser
  evidence with no overflow, focus trap, unreadable action, or console error.
- Sunday and weekday program surfaces share one coherent visual floor language.
- Every industry has at least five disclosed sponsored placements in fixtures.
- Sunday industry rotation and admin-curated participants remain independent
  from sponsorship and pass authorization tests.

## Scenarios

```gherkin
Scenario: Additive local admission succeeds
  GIVEN the retained showrooms and migration-24 database are available
  WHEN migration 25 and the MirtPage application are applied
  THEN existing handle routes remain reachable
  AND reviewed production scale is available without rewriting showroom content

Scenario: Application rollback is required
  GIVEN migration 25 has already committed
  WHEN the prior application version is restored
  THEN it ignores the additive discovery column safely
  AND no published showroom or tenant record is removed
```

## Test plan

| Gate | Evidence |
|---|---|
| Additive migration and fixtures | `scripts/test-discovery.ts`, `scripts/test-scale-fixtures.ts` |
| Identity and dashboard projections | `scripts/test-platform-identity.mjs`, `scripts/test-support.ts` |
| Desktop/mobile public workflows | `scripts/capture-discovery-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| Complete repository regression | `npm run check`, `npm run test:acceptance`, `npm run release` |
| Sponsored and Sunday program migration | `scripts/test-discovery.ts`, `scripts/test-scale-fixtures.ts` |

## Readiness checklist

- [x] Additive migration boundary explicit
- [x] Stable route compatibility explicit
- [x] Security and visual gates defined
- [x] Production rollout and DNS excluded

## Admission evidence

Prior evidence: admitted to the disposable local pre-launch environment on 2026-08-02.
`npm run check`, 10/10 ordered browser acceptance, and `npm run release` passed,
including the production build, HTTP smoke test, migration and rollback
contracts, tenant-security tests, output-trace privacy validation, and a
production dependency audit with zero vulnerabilities. No remote or production
rollout was performed.

The additive sponsored-placement and rotating Sunday-program extension was
admitted to the disposable local pre-launch environment on 2026-08-02.
Migration 26 and scale fixtures passed; `npm run check`, the ordered 10/10
production-browser suite, and `npm run release` passed with zero production
dependency vulnerabilities. Desktop, 390px, and 320px evidence is stored in
`/tmp/mirtpage-sponsored-sunday`. No remote or production rollout was performed.

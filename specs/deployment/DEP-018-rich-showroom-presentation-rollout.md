---
id: DEP-018
title: Rich showroom presentation rollout
status: done
related: [FE-022, BE-021]
owners: [operations, engineering]
last_updated: 2026-08-01
change_level: L3
---

# DEP-018 - Rich showroom presentation rollout

## Problem and scope

Roll out additive rich-offering and live-showroom storage, the reviewed product
detail patterns, updated authoring, and refreshed disposable benchmark fixtures.

## Rollout sequence

1. Back up any non-disposable database before migration 24.
2. Apply nullable compatible columns and verify schema/foreign-key checks.
3. Deploy readers, validators, and renderers before staff/client writes are used.
4. Run focused security, provider, recipe, revision, and browser tests.
5. Reset the explicitly disposable local database to republish all ten
   brief-driven benchmark showrooms, 48 scale fixtures, and attached booths.
6. Capture desktop and mobile showroom plus homepage evidence.
7. Run `npm run check`, `npm run test:acceptance`, and `npm run release`.

## Rollback

Disable new form controls and renderers while retaining additive columns.
Existing rows remain readable with empty/default values. Restore a retained
catalog version if publication evidence fails; do not destructively remove
columns during an emergency rollback.

## Scenarios

```gherkin
Scenario: Existing showroom crosses migration 24
  GIVEN a catalog created before rich presentation fields
  WHEN migration and the new reader run
  THEN the showroom remains valid with all optional fields absent

Scenario: Disposable benchmark reset completes
  GIVEN local fixture data is explicitly disposable
  WHEN the reset workflow republishes the benchmark suite
  THEN all ten benchmark showrooms have admitted manifests, attached booth media,
  and distinct business-specific brief evidence
```

## Test plan

| Gate | Evidence |
|---|---|
| Additive migration and retained snapshots | `scripts/test-rich-offering-migration.ts`, `scripts/test-revisions.ts` |
| Provider and tenant security | `scripts/test-live-showroom.ts`, `scripts/test-product-upkeep.ts` |
| Desktop/mobile rendering | `tests/acceptance/app.spec.ts`, `scripts/capture-showroom-benchmarks.mjs` |
| Complete release | `npm run check`, `npm run test:acceptance`, `npm run release` |

## Readiness checklist

- [x] Additive migration and rollback defined
- [x] Disposable fixture reset separated from production migration
- [x] Required security and browser gates identified
- [x] No production rollout is claimed by local evidence

## Evidence

Evidence: completed locally on 2026-08-01 against the explicitly disposable database.
Reset published 58 active fixtures, exactly ten featured profiles, 58 process
videos, 217 product videos, 215 priced offerings, and all four product-detail
patterns. `npm run check`, the ten-workflow production acceptance suite, the
desktop/mobile browser suites, and `npm run release` passed; the release gate
included production build, HTTP smoke, trace privacy, scale, security, and a
zero-vulnerability production dependency audit. This is implementation and
local rollout evidence only. Production deployment remains future work.

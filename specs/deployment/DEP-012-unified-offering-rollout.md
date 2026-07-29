---
id: DEP-012
title: Unified offering migration and rollout
status: done
related: [DEP-001, DEP-008, DEP-011, FE-016, BE-014]
owners: [operations, backend, qa]
last_updated: 2026-07-29
change_level: L3
---

# DEP-012 — Unified offering migration and rollout

## Problem and outcome

Products and capabilities need compatible canonical storage and truthful
optional inquiry quantities before expanded authoring or public UI is enabled.

The outcome is a checkpointed migration, deterministic mixed-offering fixtures,
and release evidence proving old rows, current showrooms, authoring workflows,
and inquiry history remain valid.

## Scope

### In scope

- Migration 18 with additive offering columns and a controlled inquiry-items
  rebuild for nullable quantity plus offering snapshots.
- Defaults for existing rows and compatibility for retained snapshots.
- Reset fixtures spanning all offering kinds and quantity modes.
- Local migration, integrity, release, acceptance, and visual gates.
- Application rollback boundary and operator verification.

### Non-goals

- Production rollout in this task.
- Migrating third-party inventory, quoting, ERP, or capacity systems.
- Destructive removal of compatible product names or historical snapshots.

## Domain language and invariants

- The database migration is restart-safe and recorded once.
- Existing products become required standard products without content loss.
- Existing inquiry quantities remain unchanged.
- New optional-quantity lines may store null; existing lines never become null.
- Migration 18 requires a stopped single-instance checkpoint because it rebuilds
  `inquiry_items`.

## Contracts

- Before migration, create and validate the existing backup/checkpoint artifact.
- Rebuild preserves IDs, inquiry/product relationships, names, quantities,
  options, and timestamps, then restores same-business triggers and foreign keys.
- Reset data includes at least one offering of every kind and at least one
  optional-quantity capability in the visual benchmark pool.
- `PRAGMA integrity_check` and `foreign_key_check` pass after migration and
  after reset.
- Rollback restores the migration-18 checkpoint and the matching application
  version. It does not attempt a lossy reverse migration.

## Scenarios

```gherkin
Scenario: Existing catalog migrates with defaults
  GIVEN a valid migration-17 database with products and inquiries
  WHEN an approved migration-18 checkpoint is supplied and migration runs
  THEN product and inquiry identities and existing quantities are preserved
  AND every product has valid offering defaults

Scenario: Migration is attempted without a checkpoint
  GIVEN a migration-17 database
  WHEN application startup attempts migration 18 without approval evidence
  THEN startup fails before rebuilding inquiry items
  AND the source database remains unchanged
```

## Quality impact

- Security and tenant isolation: same-business inquiry trigger is recreated and
  tested.
- Privacy and data retention: no customer or merchant payload is printed into
  migration logs.
- Accessibility and responsive behavior: FE-016 browser gates.
- Localization and merchant-entered values: byte-preserving row copy.
- Performance and limits: migration is bounded by local SQLite data and runs
  offline.
- Failure recovery and idempotency: transaction plus validated checkpoint;
  rerun is a no-op after schema version 18.

## Observability

Record migration start/result, schema version, row counts, integrity result,
checkpoint identity, and duration. Do not log row payloads.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Checkpoint refusal and migrated row preservation | migration | `scripts/test-offering-migration.ts` |
| Reset fixture coverage | integration | `scripts/test-offering-migration.ts` |
| Full repository and release gates | release | `npm run check`, `npm run release` |
| Public/admin workflows and mobile UI | production browser | `npm run test:acceptance` |
| Mixed showroom visual quality | visual browser | `npm run test:visual-benchmarks` |

## Rollout and rollback

This task stops at verified local readiness. A future production change must ask
whether its data is important, create a fresh validated checkpoint, stop all
writers, run migration 18 once, verify integrity and sample inquiries, and then
enable the matching application. Rollback restores the checkpoint and matching
application version.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: verified for local readiness on 2026-07-29; production rollout remains
excluded.

- Schema migration 18 adds constrained product offering fields and checkpointed
  nullable inquiry quantity plus offering snapshots.
- `scripts/test-offering-migration.ts` proves no-checkpoint refusal, preservation
  of IDs/relationships/existing quantities, compatible defaults, null optional
  quantity, constraints, integrity, foreign keys, and idempotency. It runs in
  both `npm run check` and `npm run release`.
- `npm run reset` creates 28 fictional businesses and 105 offerings spanning all
  four offering kinds with optional desired quantity. Manufacturing capabilities have
  capacity and lead-time facts and do not inherit ordinary product options.
- `npm run test:visual-benchmarks` passed 56 captures with zero failures;
  `npm run test:acceptance` passed 10/10; `npm run check` and `npm run release`
  passed with a zero-vulnerability production dependency audit.
- A future production/data-preserving rollout still requires a fresh data-
  importance decision, stopped-writer checkpoint, monitored migration, and
  matching application rollback artifact.

## Optional-quantity follow-up

The current optional-quantity correction is application-level and requires no
schema migration or destructive data rewrite. Migration 18 already permits null
inquiry quantities and the retained `required` storage value. Current code
normalizes that retained value to optional behavior, while historical inquiry
snapshots remain unchanged. Rollback therefore uses the normal application
artifact boundary; the migration-18 checkpoint rules above are unaffected.

The follow-up passed `scripts/test-offering-migration.ts`,
`scripts/test-security.ts`, 56 visual captures, 10/10 browser acceptance,
`npm run check`, and `npm run release` on 2026-07-29.

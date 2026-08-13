---
id: DEP-024
title: Daily Featured schedule migration and rollout
status: in_progress
related: [FE-021, FE-033, BE-023, BE-027, BE-029, DEP-020, DEP-023]
owners: [operations, engineering]
last_updated: 2026-08-10
change_level: L3
---

# DEP-024 - Daily Featured schedule migration and rollout

## Problem and outcome

Introduce the configurable all-day schedule without deleting retained business,
showroom, sponsorship, or publication data and without diverging between local
SQLite and production PostgreSQL.

## Scope

### In scope

- Additive schema migration 32 in both database adapters.
- Seed one default policy without materializing daily automatic schedules.
- Verify automatic and manual projection before enabling the admin route.
- Focused public/admin desktop and phone evidence before release gates.

### Non-goals

- Production deployment, provider credentials, DNS, or livestream automation.
- Backfilling historical program dates.

## Domain language and invariants

- Migration 32 is additive and idempotent.
- Automatic remains the default when no day row exists.
- Rollback never requires deleting migration-32 tables.

## Contracts

1. Apply migration 32 and verify its policy row and indexes.
2. Verify the 08:00–13:00 and 17:00–22:00 capacity windows, participant-based
   contraction toward 13:00 and 22:00, and at least four inactive midday hours.
3. Verify an authorized manual future-date lineup and Automatic restoration.
4. Capture public and admin desktop/phone states and obtain visual approval.
5. After approval run `npm run check`, acceptance, release, PostgreSQL rehearsal,
   and remote CI as separately authorized.

## Scenarios

```gherkin
Scenario: Existing database receives migration 32
  GIVEN migration 31 and retained showrooms exist
  WHEN migration 32 runs
  THEN the default policy and empty override tables are available
  AND no retained business-facing row is changed

Scenario: Application rollback follows migration
  GIVEN migration 32 has committed
  WHEN the prior application is restored
  THEN it ignores the additive tables
  AND its prior public schedule remains operable
```

## Quality impact

- Security and tenant isolation: migration grants no new role capability.
- Privacy and data retention: no personal data is introduced.
- Accessibility and responsive behavior: focused visual gate precedes release.
- Localization and merchant-entered values: EAT behavior is explicit.
- Performance and limits: indexed date lookups and singleton policy read.
- Failure recovery and idempotency: additive DDL and dormant-table rollback.

## Observability

Record migration version and focused verification results without secrets or
retained customer content.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| SQLite migration 32 | migration | `scripts/test-featured-schedule.ts`, migration suite |
| PostgreSQL migration 32 | migration | `scripts/test-postgres-runtime.ts` |
| Public/admin workflow | browser | focused Playwright, acceptance suite after approval |

## Rollout and rollback

Apply SQLite/PostgreSQL migration 32 before application activation. To roll
back, deploy the prior application and leave additive tables intact. Restore
the previous application artifact; no destructive SQL is permitted.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation and focused evidence are in progress.

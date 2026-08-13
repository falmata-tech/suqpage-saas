---
id: DEP-015
title: Free-first service and managed database readiness
status: in_progress
related: [FE-010, FE-018, FE-019, FE-025, BE-016, BE-017, BE-018, BE-019, BE-024, DEP-010, DEP-016, DEP-017, DEP-021, DEP-022, DEP_BASE, ADR-0002, ADR-0009, ADR-0010, ADR-0012]
owners: [deployment, operations, security]
last_updated: 2026-07-30
change_level: L3
---

# DEP-015 - Free-first service and managed database readiness

## Problem and outcome

The pilot needs support, billing state, analytics, and a dense Daily Featured without
creating unavoidable USD agent fees or pretending the single-instance SQLite
runtime is already horizontally scalable.

## Scope

### In scope

- Native support operation in the existing application and database.
- Optional metadata-only Telegram alerts with bounded failure.
- Manual renewal records with no required price or payment integration.
- Indexed, paginated tables and a documented Supabase/PostgreSQL migration
  checklist.
- Docker health, persistence, backup, and single-instance constraints updated
  for the new data.

### Non-goals

- Production Supabase migration, payment integration, multi-instance deployment,
  or self-hosted Chatwoot.

## Scenarios

```gherkin
Scenario: External services are absent
  GIVEN no Telegram credentials
  WHEN the application starts
  THEN support, manual subscription renewal, analytics, and Daily Featured remain usable
  AND health checks do not claim Telegram is configured

Scenario: Operator considers horizontal scaling
  GIVEN the SQLite pilot build
  WHEN deployment is reviewed
  THEN documentation blocks multiple application replicas
  AND identifies PostgreSQL, object storage, jobs, and realtime as prerequisites
```

## Quality impact

- Secrets remain environment-only and are never seeded or logged.
- SQLite remains WAL, persistent, backed up, and single-instance.
- Telegram failure cannot undo authoritative local records.
- Supabase Realtime is a future adapter, not a requirement for polling-based
  pilot support.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Optional adapters absent | integration | `scripts/test-support.ts`, `scripts/test-account-health.ts` |
| Migration/backup/restore | operations | `scripts/test-operations.mjs` |
| Container health and persistence | container | `scripts/test-container.mjs` |
| Full release gate | release | `npm run release` |

## Rollout and rollback

Run backup, migration 21/22, account backfill verification, and support negative
tests before deployment. Roll back application code while retaining additive
tables. Do not activate Telegram without credentials and a monitored operator
test. Payment integration requires a separate future decision and feature.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Native support, amount-free manual renewal, privacy-conscious analytics,
optional notification configuration, Docker environment wiring, and
`docs/MANAGED-POSTGRES-READINESS.md` are implemented. `npm run check`, ordered
10/10 browser acceptance, `npm run test:operations`, and `npm run release`
passed on 2026-07-30 with zero production dependency vulnerabilities. The
isolated container gate remains pending: Docker became available, but its first
image build lost the registry connection during `npm ci`, and subsequent
escalation reviews timed out before the retry could start. Production managed
PostgreSQL/Supabase migration and multi-instance operation remain explicit
future rollout work.

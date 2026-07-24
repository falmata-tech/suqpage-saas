---
id: DEP-006
title: Four-client composition cutover and recovery
status: done
related: [FE-006, BE-007, DEP-001, DEP-003, DEP-004, DEP-005, DEP-007, ADR-0005]
owners: [operations, security, product]
last_updated: 2026-07-24
change_level: L3
---

# DEP-006 — Four-client composition cutover and recovery

## Problem and outcome

All four current tenants are example clients and should be refreshed onto the
new composition system together. The cutover must be repeatable, data
preserving, observable, reversible, and blocked unless public, private,
role-based, inquiry, publication, rollback, and mobile evidence pass.

## Scope

### In scope

- Schema migration 8 and clean-seed behavior for four composed clients.
- Pre-migration backup, integrity and row-count checks, migration verification,
  backup/restore drill, and exact rollback instructions.
- Release and production-browser gates covering all four client identities and
  relevant visitor/client/team/manager/admin paths.
- A temporary v1 recovery reader with explicit retirement criteria.

### Non-goals

- Production deployment or destructive production execution without separate
  approval, multi-region rollout, provider integration, or automated visual
  screenshot baselines.

## Contracts

- Cutover starts only from an integrity-clean database and a verified backup
  containing database plus managed media.
- Migration must be one transaction and must not change tenant/catalog/client/
  request/revision/version/inquiry/delivery counts except the new schema marker.
- All four active business rows must end with `design_key='composition'`, a
  valid schema-v2 manifest, a distinct token/section signature, and their
  existing handle/content.
- All stored revision and publication snapshots must parse after migration and
  be schema version 2.
- `npm run check`, production build, operations backup/restore, and production
  acceptance are mandatory admission gates.
- Rollback is database-and-media restore before new post-cutover writes, or a
  normal retained-version republication after writes begin. Direct SQL reversal
  of live content is prohibited.
- V1 reader removal is a later scoped change after zero-row verification,
  recovery-window expiry, and a successful rollback drill.

## Scenarios

```gherkin
Scenario: Four-client cutover succeeds
  GIVEN a verified backup and an integrity-clean pre-migration database
  WHEN migration 8 runs
  THEN all four example clients use distinct validated compositions
  AND business data, client access, requests, revisions, inquiries, deliveries,
  content versions, and retained publications remain intact

Scenario: Migration input is unsafe
  GIVEN an unrecognized legacy design key or invalid stored snapshot
  WHEN migration 8 runs
  THEN the transaction rolls back
  AND no row is partially converted or marked migrated

Scenario: Release regression blocks cutover
  GIVEN any failing role, preview, approval, publication, inquiry, rollback,
  phone, build, backup, or restore check
  WHEN the release gate runs
  THEN delivery exits non-zero
  AND operators do not claim the composition cutover complete
```

## Quality impact

- Security and privacy: no external export; logs contain counts/categories only.
- Data integrity: transactional migration, SQLite integrity check, complete
  backup, restore drill, and count/version assertions.
- Accessibility/mobile: 320/390 containment, touch, keyboard, and reduced-motion
  browser coverage.
- Availability: bounded four-client migration; code retains recovery parsing.
- Observability: migration version, row counts, schema-version counts, bank
  release, and safe error category only.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Clean seed has four distinct v2 compositions | operations | `scripts/test-showroom-migration.ts` |
| Existing rows migrate atomically and idempotently | operations | `scripts/test-operations.mjs` |
| Backup/restore retains v2 manifests and snapshots | operations | `scripts/test-operations.mjs` |
| All roles and four client workflows | production browser | `tests/acceptance/app.spec.ts` |
| Full repository/release admission | release | `npm run check`, `npm run release`, `npm run test:acceptance` |

## Rollout and rollback

1. Stop writes and record integrity/count/schema-version evidence.
2. Run the existing complete backup and verify its manifest.
3. Deploy dual-reader/v2-writer code and run migration 8.
4. Verify all rows, four private/public compositions, and release gates.
5. Resume writes and monitor safe validation/publication error categories.
6. Before resumed writes, rollback by restoring the verified database and media
   backup. After resumed writes, use retained-version republication or an
   approved reconciled restore; never overwrite new writes silently.

This task prepares and tests the cutover locally. It does not authorize a
production migration, push, or deployment.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-24. No remote or production deployment was
performed.

- Clean reset creates exactly four composition businesses with distinct valid
  token/section signatures. The migration fixture begins from four legacy keys,
  a submitted v1 revision, and a retained v1 publication, then proves an atomic,
  idempotent schema-8 cutover with unchanged business/catalog/revision/
  publication counts and preserved IDs/status/version/summary.
- `scripts/test-operations.mjs` passed the combined permission/schema cutover,
  integrity check, complete database/media backup, destructive test mutation,
  and restore drill with v2 revision and manifest data.
- The Codespaces test database reports SQLite integrity `ok`, migration version
  8, and four composition businesses. A verified post-cutover backup was
  created at `backups/2026-07-24T07-55-20-186Z`; backup contents are runtime
  data and remain excluded from Git.
- `npm run check` passed every repository gate. `npm run release` passed the
  production build, output-trace privacy validation, HTTP smoke, request/
  revision/security/adapter tests, and dependency audit with zero
  vulnerabilities.
- `npm run test:acceptance` passed 7/7 production-browser scenarios, covering
  all four client identities plus visitor, administrator,
  operations manager, assigned team member, and client authority boundaries.
- The existing request-media Turbopack output-trace warning remains unchanged;
  the trace privacy gate passed. Schema-v1/former-renderer reading remains only
  as the documented temporary recovery bridge.

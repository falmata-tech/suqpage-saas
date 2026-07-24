---
id: DEP-008
title: Stockless product-upkeep migration and rollout
status: done
related: [DEP-001, DEP-003, DEP-007, FE-008, BE-008, BE-009, ADR-0006]
owners: [operations, security, product]
last_updated: 2026-07-24
change_level: L4
---

# DEP-008 — Stockless product-upkeep migration and rollout

## Problem and outcome

Removing numeric inventory from active product, option, inquiry, seed, and
revision contracts requires a SQLite table rebuild and coordinated application
cutover. Enabling client/staff product upkeep at the same time introduces a new
live publication path that must not bypass backups, version conflicts, tenant
scope, retained history, or the planned recipe-v3 contract.

The outcome is a monitored stockless cutover in which all current example
clients preserve products and availability, new writes contain no inventory
count, and the narrow product-upkeep capability can be disabled independently.

## Scope

### In scope

- One coordinated current snapshot/revision-v3 contract shared with DEP-007,
  containing availability but no numeric stock fields.
- Transactional/idempotent SQLite migration that rebuilds product and
  option-value storage without stock columns.
- Conversion of active catalog, seeds, setup/reset fixtures, portable schemas,
  and tests to availability-only behavior.
- Legacy v1/v2 snapshot read/upgrade compatibility that discards historical
  numeric stock while preserving availability and all other content.
- Database/media backup, integrity check, dry-run evidence, restore rehearsal,
  rollback checkpoint, and explicit destructive-migration approval.
- Cohort rollout and complete role/browser evidence for basic product upkeep.
- Monitoring for authorization denial, stale conflict, media failure, catalog
  version, inquiry regression, migration result, and rollback readiness.

### Non-goals

- Preserving numeric stock as a hidden active column or writing a placeholder
  count into new snapshots.
- Inventory management, reservation, warehouse integration, or variant stock.
- Automatic production migration, multi-instance rollout, or destructive
  history purge.
- Purging immutable pre-cutover revision JSON solely to erase a no-longer-used
  field; retention policy controls historical record deletion.
- Enabling recipe import before DEP-007 gates pass.

## Domain language and invariants

- **Stockless cutover** removes numeric inventory from every active contract and
  persistence table while preserving descriptive availability.
- **Legacy compatibility** exists only at a bounded recovery reader. It never
  makes historical stock authoritative or writable.
- **Destructive checkpoint** is the verified database/media backup paired with
  the exact pre-cutover application commit and restore instructions.
- DEP-007 and DEP-008 must admit one identical revision-v3 content contract;
  neither rollout may ship a conflicting schema under the same version.

## Contracts

- Preflight refuses migration without one application instance, writable
  persistent paths, a fresh verified database/media backup, `foreign_key_check`
  and `integrity_check` success, sufficient disk, and recorded operator approval.
- The migration copies all product identities, tenant/collection/category
  relationships, names, slugs, descriptions, media, availability, publication,
  ordering, option groups/values, timestamps, and references while omitting
  product/option stock columns.
- Migration preserves inquiry item snapshots and requested quantities. It does
  not reinterpret requested quantity as inventory.
- Migration is transactional/idempotent. An interrupted or failed table rebuild
  leaves the pre-migration schema authoritative or restores the checkpoint; no
  half-migrated table set is accepted.
- Post-migration assertions prove zero active `stock`, `stockCount`, or
  `stock_count` fields/columns across database schema, current portable schemas,
  setup fixtures, UI labels, server inputs, active snapshot writes, and inquiry
  decisions. Explicit legacy-reader fixtures and historical documentation are
  allowlisted separately.
- Current availability values survive exactly. Inquiry smoke tests accept
  bounded quantities for published available/limited items and deny unavailable/
  coming-soon items without querying a stock count.
- Revision-v3 writer emits stockless content. V1/v2 readers discard legacy
  counts; rollback/republication of historical content produces a new stockless
  version rather than recreating removed columns.
- Product-upkeep capability is initially disabled, then enabled for
  administrator/manager test actors, assigned team members, and the four example
  clients only after migration and regression gates pass.
- Release runs spec/trace checks, stockless contract tests, migration/restore,
  security, HTTP, revision, media, full browser acceptance, build, container,
  and release gates.
- Rollback before any post-cutover write restores the exact checkpoint. After
  post-cutover writes, operators first disable upkeep and either reconcile those
  retained versions into a compatible recovery plan or obtain explicit approval
  to restore and lose them.

## Scenarios

```gherkin
Scenario: Stockless migration preserves the catalog
  GIVEN an integrity-clean backup of the four example clients with product and option stock columns
  WHEN the approved migration runs
  THEN all non-stock catalog, relationship, media, availability, inquiry, and history values remain valid
  AND active product and option tables contain no stock column

Scenario: Release still depends on inventory
  GIVEN application code, a current schema, UI, seed, or test still reads or writes an active stock count
  WHEN the stockless admission gate runs
  THEN release exits non-zero with the offending contract path
  AND product upkeep remains disabled

Scenario: Historical revision is republished after cutover
  GIVEN an authorized rollback targets a retained v2 snapshot containing stock fields
  WHEN the recovery boundary upgrades and validates it
  THEN a new stockless content version is published with preserved availability
  AND the removed database columns are not recreated

Scenario: Client upkeep fails rollout isolation
  GIVEN a cross-tenant, unassigned-team, stale-version, media, or structural-mutation test fails
  WHEN capability admission runs
  THEN client/team product upkeep remains disabled
  AND current public showrooms and request/revision workflows remain available

Scenario: Operator must roll back after new product writes
  GIVEN stockless product versions were published after migration
  WHEN an operator requests restoration of the destructive checkpoint
  THEN upkeep is disabled and the post-cutover versions are reported for reconciliation
  AND restore never silently discards them
```

## Quality impact

- Security and tenant isolation: cohort enablement follows complete cross-role
  and tenant-negative evidence.
- Privacy and data retention: backups/media remain protected; migration and
  test logs contain only safe counts/schema versions.
- Accessibility and responsive behavior: FE-008 browser admission is a release
  gate.
- Localization and merchant-entered values: migration compares exact names,
  descriptions, options, and non-English fixture values.
- Performance and limits: migration time/disk and one-product transaction
  latency are measured for maximum-safe pilot fixtures.
- Failure recovery and idempotency: checkpoint, transactional migration,
  repeated migration, legacy reads, capability disable, and reconciled restore
  are mandatory.

## Observability

Record migration/schema versions, safe row counts, duration, integrity result,
capability cohort, content-version movement, command/conflict/error category,
and backup age. Never emit snapshots, product descriptions, media paths/bytes,
contacts, credentials, or backup contents.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Schema rebuild, exact preservation, idempotency | migration/operations | `scripts/test-stockless-catalog.ts`, `scripts/test-operations.mjs` |
| Backup and restore checkpoint | operations | `scripts/test-operations.mjs` |
| No active stock contract remains | contract/security | `scripts/test-stockless-catalog.ts`, `scripts/test-security.ts` |
| Legacy snapshot upgrade and stockless republish | revision/integration | `scripts/test-stockless-catalog.ts`, `scripts/test-revisions.ts` |
| Availability-only inquiry behavior | HTTP/security | `scripts/http-smoke.mjs`, `scripts/test-security.ts` |
| All product-upkeep roles and negative paths | production browser | `tests/acceptance/app.spec.ts` |
| Complete release admission | release/container | `npm run check`, `npm run release`, `npm run test:operations`, `npm run test:acceptance`, `npm run test:container` |

## Rollout and rollback

1. Land pure stockless snapshot/domain parsers, legacy fixtures, and admission
   checks without enabling writes.
2. Create and verify the destructive checkpoint; dry-run the migration on a
   copy and compare exact non-stock catalog/history counts and values.
3. Stop writes, migrate the controlled test installation, run integrity,
   migration, inquiry, revision, media, security, and browser gates.
4. Coordinate the identical revision-v3 contract with DEP-007 before either
   feature writes v3.
5. Enable basic upkeep for administrator/manager test actors, then assigned team
   members, then the four example clients while monitoring conflicts/failures.
6. Keep full request/revision publication and the upkeep-disable control
   available throughout rollout.

Rollback disables upkeep first. Before post-cutover writes, restore the paired
application/database/media checkpoint. After writes, reconcile retained
versions or obtain explicit destructive-loss approval before restore; code-only
rollback cannot make a stockless database compatible with old stock-dependent
code.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: verified locally on 2026-07-24.

- Revision schema v3, schema migrations 9–10, setup baselines, portable
  fixtures, inquiry logic, and active UI/contracts are stockless. The admission
  scan allows legacy inventory names only in the bounded v1/v2 recovery reader
  and migration fixture.
- Existing-table rebuild tests refuse an unapproved migration, then pass only
  with a matching recent hashed checkpoint. `npm run backup` no longer opens
  the migrating application adapter; it verifies source/copy integrity and
  foreign keys before recording the checkpoint.
- `scripts/test-stockless-catalog.ts`, `scripts/test-product-upkeep.ts`,
  `scripts/test-operations.mjs`, `npm run check`, `npm run release`,
  `npm run test:acceptance` (7 passed), and `npm run test:container` passed on
  2026-07-24. Production dependency audit reported zero vulnerabilities and 41
  output traces contained no private runtime paths.
- The four local example clients are initialized with retained schema-v3
  baselines and the controlled test database is at migration 10. No external
  production rollout is claimed; an older deployed database must follow the
  stopped-instance backup/approval command in `README.md`.

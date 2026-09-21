---
id: DEP-031
title: Native PostgreSQL setup tests and operations
status: in_progress
related: [DEP-032, BE-035, DEP-030, DEP-027, ADR-0020]
owners: [operations, security]
last_updated: 2026-09-17
change_level: L3
---

# DEP-031 — Native PostgreSQL tooling

## Problem and scope

Remove the copy-through-file-database dependency from local setup, acceptance,
CI and operations. Use reviewed native PostgreSQL schema plus isolated fixtures.
Never reset or delete existing application data to accomplish code retirement.

## Scenarios

GIVEN a fresh isolated local database WHEN bootstrap runs THEN schema and explicit
demo fixtures install directly in PostgreSQL. GIVEN a populated target WHEN setup
runs THEN it refuses destructive reseeding. GIVEN backup WHEN invoked THEN it
produces a protected PostgreSQL archive without printing credentials or row data.
GIVEN restore WHEN target or explicit replacement approval is missing THEN fail
closed. GIVEN CI WHEN persistence tests run THEN an isolated PostgreSQL service is
required and every fixture is cleaned independently of developer/hosted data.

## Rollout, test plan and rollback

Native schema installation and reapplication; structural constraints, tenancy,
transactions and current workflow tests; backup archive validation and guarded
restore to an isolated target. Full release and browser evidence are required
before launch claims. Retain existing protected PostgreSQL backups. Code rollback
must stay PostgreSQL-only; historical source databases are not an executable
rollback path. Hosted mutations still follow DEP-029 and owner approval.

## Evidence

Evidence: verified on 2026-09-14.

`npm run check`, `npm run release`, `npm run test:postgres-readiness`,
`npm run test:operations`, `npm run test:container`, seven acceptance scenarios
and 72 accessibility states passed. Configuration regressions accept email-only
entry and reject missing email OTP. Commit `41e2fed` is published as Netlify
`6aa7fe5a106ca381ba08bba3`. Hosted schema 43 and runtime access controls are
verified; restoring the approved pre-migration backup preserved all 50 original
table fingerprints through 39–43. See the deployment record and traceability.

## Full archive validation correction (2026-09-17)

GIVEN a native PostgreSQL custom archive WHEN validation runs THEN pg_restore
consumes the complete archive while writing SQL to the platform null device,
without a database connection or sensitive output. Header-only --list is
insufficient: it may exit before Node finishes feeding stdin and cause EPIPE,
and does not detect truncated data sections. GIVEN truncated/invalid payload
WHEN validation runs THEN it fails closed and no migration follows.

Regression evidence: scripts/test-archive-validation.ts uses real pg_dump/pg_restore
against a disposable local database with enough data to exceed pipe buffering;
valid archives pass while truncated and invalid-magic archives fail. Existing
backup/restore guards, target verification and protected file modes remain intact.

The same large-payload/truncated-data cases are covered by the existing container
archive/restore gate in scripts/test-operations.mjs. The correction is locally
verified; release/commit evidence is pending separately from the prior deployment.

Restore rehearsal additionally exposed contradictory cleanup flags: the guard
requires an empty database, but --clean --if-exists tries to drop triggers on
tables that do not yet exist. GIVEN the verified empty restore target WHEN
pg_restore runs THEN it restores in one transaction without cleanup/drop flags;
the existing populated-target refusal remains mandatory. Regression fixture
includes a table trigger so empty-target restore exercises this case.

Some archives include CREATE SCHEMA public. After approval and the empty-target
check, remove only the empty public namespace WITHOUT CASCADE so the archive can
recreate it. Any residual/concurrent object makes DROP SCHEMA fail rather than
being deleted. A target without public is also empty and may be retried. If restore
fails, its single transaction rolls back; an originally empty namespace can remain
absent. No restore ever performs broad object cleanup or overwrites populated data.

Local correction evidence (2026-09-17): native full-payload archive regression and
isolated container operations pass, including trigger restoration and protected
populated-target denial. A backup of retained Suqpage restored with all 56 table
fingerprints identical; migrations 46/47 preserved all 3,401 application rows.
See docs/SUQPAGE-LOCAL-SCHEMA-47.md. No hosted rollout or full release is claimed.

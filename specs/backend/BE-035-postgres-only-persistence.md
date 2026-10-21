---
id: BE-035
title: PostgreSQL-only persistence in every executable environment
status: done
related: [BE-036, BE-027, BE-034, DEP-031, ADR-0020]
owners: [backend, security, operations]
last_updated: 2026-09-14
change_level: L3
---

# BE-035 — PostgreSQL-only persistence

## Problem and scope

The owner requires removal of the embedded database from application code, local
setup, fixtures, scripts and deployed environments. Existing PostgreSQL data and
prior launch wiring must remain intact. This supersedes the retained compatibility
adapter exception in ADR-0015. Historical decision records may name the retired
technology; no executable dependency or database fallback remains.

## Scenarios and acceptance criteria

- GIVEN any runtime WHEN a non-PostgreSQL driver or missing connection is supplied
  THEN startup fails closed; it never opens or creates a database file.
- GIVEN a fresh isolated PostgreSQL database WHEN setup runs THEN reviewed native
  schema, constraints, indexes and triggers install without another database engine.
- GIVEN an existing database WHEN migrations run THEN records and identities are
  preserved and already-applied changes are not repeated.
- GIVEN owner/admin/public workflows WHEN persistence runs THEN real PostgreSQL
  enforces authorization, tenant scope, atomicity, idempotency and canonical input.
- GIVEN tests, browser bootstrap or operations WHEN executed THEN PostgreSQL is the
  sole database engine, fixtures use isolated targets and cleanup cannot erase an
  existing developer or hosted database.
- GIVEN source/configuration WHEN the boundary check runs THEN retired drivers,
  adapters, dialect execution and file-database bootstrap are rejected.

## Test plan

Configuration and source-boundary checks; native fresh-install/idempotent migration
checks; PostgreSQL catalog/inquiry/signup/session/rate-limit/security/location/media
regressions; retained domain tests; current owner/admin/public browser workflows.
Convert required coverage before removing obsolete adapter-specific tests. Preserve
real data and protected backups; no hosted write or destructive source cleanup.

## Rollout

DEP-031 owns setup, isolated testing, backup and release evidence. This is ready
for implementation: PostgreSQL is already authoritative locally and deployed;
there is no new provider, identity policy or user-facing redesign decision.
Affected master sections: 2, 15–17, 22 and 24 (current stack, privacy/operations,
test and launch requirements). Launch wiring FE-043/BE-034 remains active.

## Evidence

Evidence: verified on 2026-09-14.

`npm run check`, `npm run release`, `npm run test:postgres-readiness`,
`npm run test:operations`, `npm run test:container`, seven acceptance scenarios
and 72 accessibility states passed. Configuration regressions accept email-only
entry and reject missing email OTP. Commit `41e2fed` is published as Netlify
`6aa7fe5a106ca381ba08bba3`. Hosted schema 43 and runtime access controls are
verified; restoring the approved pre-migration backup preserved all 50 original
table fingerprints through 39–43. See the deployment record and traceability.

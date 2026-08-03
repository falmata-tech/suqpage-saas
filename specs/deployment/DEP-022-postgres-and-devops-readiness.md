---
id: DEP-022
title: PostgreSQL and guarded delivery readiness
status: done
related: [FE-026, BE-024, BE-026, DEP-001, DEP-002, DEP-015, DEP-021, ADR-0012, ADR-0013]
owners: [deployment, operations, security, backend]
last_updated: 2026-08-03
change_level: L3
---

# DEP-022 - PostgreSQL and guarded delivery readiness

## Problem and outcome

MirtPage needs a credible path from one persistent SQLite instance to managed
PostgreSQL and Supabase-hosted services without risking its retained demo data.
Its delivery workflow also needs current LTS tooling, explicit repository
protection, repeatable CI, and an operator runbook that distinguishes local
evidence, migration rehearsal, and production cutover evidence.

## Scope

### In scope

- A pinned current Node LTS baseline shared by local nvm, package engines,
  Docker, and GitHub Actions, plus reviewed compatible dependency patches.
- An executable PostgreSQL schema/bootstrap and SQLite-to-PostgreSQL copy and
  reconciliation rehearsal against a disposable local PostgreSQL service.
- Translation or explicit inventory of SQLite-specific constraints, indexes,
  triggers, JSON operations, collations, and transaction semantics.
- A phase gate that prevents `MIRTPAGE_DATABASE_DRIVER=postgres` from being
  presented as available until every authoritative repository port, workflow,
  authorization test, and reconciliation gate passes.
- Pinned least-privilege GitHub Actions, dependency/security checks, manual
  dispatch for operator rehearsal, bounded jobs, and protected evidence.
- A DevOps runbook for GitHub authentication, required checks, secrets,
  backup/restore, object-storage verification, database rehearsal, deployment,
  rollback, and monitored cutover.
- Container hardening compatible with writable SQLite/filesystem volumes and
  the future network database/object-store modes.

### Non-goals

- Production deployment, DNS changes, destructive migration, live Supabase
  credentials, multi-instance operation while SQLite remains authoritative, or
  a simultaneous move to Supabase Auth.

## Domain language and invariants

- **Migration rehearsal** uses a disposable target and copy-only source access;
  it is evidence about portability, not authority to cut over production.
- **Database cutover** is the separately approved moment PostgreSQL becomes the
  sole write authority after backup, quiescence, copy, reconciliation, smoke,
  rollback readiness, and monitoring evidence.
- Runtime, Docker, and CI use the same Node major and minimum security release.
- CI success is necessary but not sufficient for production approval. Required
  repository rules prevent bypassing terminal quality checks.

## Contracts

- The database rehearsal creates tables, constraints, indexes, and triggers in
  dependency order; copies authoritative rows transactionally; resets sequences;
  and compares per-table counts plus stable aggregate fingerprints where safe.
- The source SQLite database is opened read-only for copy/reconciliation and is
  never reset, vacuumed, migrated, or deleted by the rehearsal.
- Target connection strings and service credentials are accepted only through
  environment secrets and are masked from logs and command output.
- PostgreSQL runtime cutover remains blocked while the database-boundary report
  contains unported application modules or any tenant/security/browser test has
  not passed against the target adapter.
- CI checks out immutable action revisions, uses `npm ci`, applies timeouts and
  least permissions, uploads only reviewed failure artifacts, and runs core,
  browser, container, dependency, and migration-rehearsal gates.
- Main-branch rules require the named terminal checks, reject force pushes and
  deletion, and require reviewed pull requests once a second reviewer exists.

## Scenarios

```gherkin
Scenario: Operator rehearses the database migration
  GIVEN a retained SQLite database and disposable empty PostgreSQL target
  WHEN the migration rehearsal runs
  THEN schema creation, row copy, constraints, sequences, counts, and fingerprints reconcile
  AND the SQLite source remains byte-for-byte untouched

Scenario: A runtime dependency is stale or inconsistent
  GIVEN package, nvm, Docker, and CI runtime declarations
  WHEN the delivery gate runs
  THEN unsupported or inconsistent Node declarations fail before build evidence is accepted

Scenario: A quality job fails remotely
  GIVEN a commit proposed for main
  WHEN any required GitHub Actions job fails or is cancelled
  THEN merge or release approval remains blocked
  AND the underlying failure is corrected rather than bypassed

Scenario: PostgreSQL is not yet the complete runtime
  GIVEN one or more authoritative workflows still use an unported SQLite adapter
  WHEN an operator requests PostgreSQL runtime mode
  THEN preflight rejects the mode with a safe actionable explanation
  AND SQLite remains the single declared write authority
```

## Quality and operations impact

- Security and tenant isolation: migration verification includes every existing
  cross-tenant and role test against the future adapter before cutover.
- Privacy and retention: logs contain counts/fingerprints, never row content,
  secrets, media keys, credentials, or customer messages.
- Performance and limits: target indexes and query plans are measured against
  bounded scale fixtures; connection pooling mode matches the deployment shape.
- Failure recovery: production cutover requires retained source backup, object
  parity, exact rollback ownership, and a written point-of-no-return.

## Test plan

| Gate | Evidence |
|---|---|
| Runtime and lockfile consistency | `scripts/check-runtime-baseline.mjs`, `npm ci`, `npm audit --omit=dev` |
| PostgreSQL schema/copy rehearsal | `npm run test:postgres-readiness` |
| Portability and provider boundaries | `npm run check:database-boundaries`, `npm run test:media-reconciliation` |
| Current application quality | `npm run check`, `npm run release`, `npm run test:container` |
| Role and mobile workflows | `npm run test:acceptance`, reviewed 1440/390/320 captures |
| Remote delivery | terminal required GitHub Actions jobs for the exact commit |

## Rollout and rollback

This readiness work does not cut over production. Toolchain and UI rollback are
normal code rollback. Rehearsal targets are disposable; source SQLite and local
media remain untouched. A later L4 cutover spec must name the managed project,
backup identifiers, maintenance window, connection mode, monitoring, rollback
deadline, and approver.

## Readiness checklist

- [x] No-reset and single-authority boundaries explicit
- [x] Related specs and ADR linked reciprocally
- [x] Runtime, database, media, auth, and CI contracts explicit
- [x] Positive and negative scenarios present
- [x] Test plan and rollback boundary explicit
- [x] Production cutover remains separately approved

## Evidence:

Local readiness implementation passed on 2026-08-03. Node 24.18.1 is pinned in
nvm, package engines, Docker by immutable image digest, and all five GitHub
Actions jobs. `npm run release`, `npm run test:operations`, and
`npm run test:container` passed, including a clean locked install, production
build, non-root runtime, health check, trace privacy, backup/restore, and zero
production dependency vulnerabilities.

`npm run test:postgres-readiness` created a disposable PostgreSQL 17 target and
rehearsed 44 tables and 2,849 rows with 83 checks, 79 foreign keys, 78 indexes,
14 triggers, 307 non-null columns, 44 reconciled fingerprints, four invariant
probes, and byte preservation of the read-only SQLite source. PostgreSQL runtime
cutover remains disabled while 42 declared direct SQLite modules await bounded
repository-port work.

The pinned five-job GitHub workflow and `docs/DEVOPS-RUNBOOK.md` are complete.
GitHub Actions run `30810736356` passed `core`, `browser`, `container`,
`dependency`, and `postgres` on commit `b5619be` on 2026-08-03. This spec
was followed by exact-main run `30811139517`, which passed the same five jobs on
commit `a134a12`. Main protection now requires all five checks on an up-to-date
pull request, enforces administrators, resolves conversations, and requires
linear history. Force pushes and branch deletion are disabled. The approval
count is zero while MirtPage has one maintainer; it must increase when an
independent reviewer joins.

---
id: DEP-021
title: Data-preserving launch hardening
status: in_progress
related: [FE-009, FE-024, FE-025, BE-008, BE-010, BE-024, BE-025, DEP-015, DEP-020, ADR-0012]
owners: [deployment, operations, security, product]
last_updated: 2026-08-02
change_level: L3
---

# DEP-021 - Data-preserving launch hardening

## Problem and outcome

MirtPage is moving from reset-friendly local development to a soft-launch demo
that must retain its fictional client portfolio. The rollout needs production
configuration checks, provider-neutral media, non-destructive rehearsal, full
browser and container evidence, concise operator guidance, and remote CI.

## Scope

### In scope

- No-reset migration and verification of the existing SQLite database and demo
  media.
- Optional private Supabase Storage mode with copy-only migration tooling and a
  retained filesystem rollback source.
- Production preflight for application URL, privacy salt, database persistence,
  media provider configuration, and writable local paths when applicable.
- Backup/restore, release, acceptance, operations, and container gates.
- Launch UI/copy review and two demo video artifacts generated from fictional
  data without exposing credentials.
- Retirement of the demonstration Delivery routes, controls, seed behavior,
  and active tests without dropping legacy delivery tables or resetting data.
- Task-scoped commit, push, and terminal GitHub Actions evidence.

### Non-goals

- Claiming PostgreSQL, multiple application replicas, realtime, provider
  credentials, DNS, or a monitored production rollout before they exist.
- Deleting local media after object-store copy, wiping the demo database, or
  treating generated demo recordings as customer evidence.

## Rollout sequence

1. Create a timestamped database and media backup using the existing operations
   commands; record counts and integrity without printing tenant content.
2. Apply additive code/configuration changes with `npm run migrate`; never run
   the reset command for this rollout.
3. In filesystem mode, run the complete release and browser gates against the
   retained demo database.
4. Verify retired Delivery pages and APIs return the normal not-found response,
   navigation exposes no Delivery destination, and existing inquiry data remains
   intact. Leave legacy delivery tables dormant for this rollout.
5. When Supabase credentials are supplied, create a private media bucket outside
   the application, run the copy command in dry-run mode, execute the copy, and
   verify every local public/request key remotely.
6. Switch `MIRTPAGE_MEDIA_DRIVER=supabase`, run preflight and representative
   public/private upload/read/publication workflows, then retain local media for
   the rollback window.
7. Build and test the production container with persistent SQLite storage and one
   application replica only.
8. Commit the reviewed task scope, push, and require all GitHub quality jobs to
   reach a terminal passing state before release approval.

## Rollback

Set `MIRTPAGE_MEDIA_DRIVER=filesystem`, redeploy the prior image if needed, and
restore the verified SQLite/media backup only when data integrity requires it.
Do not delete copied object-store data during the rollback window. Additive
storage configuration and admitted image rows may remain because prior code
ignores them safely.

## Scenarios

```gherkin
Scenario: Launch hardening preserves demo data
  GIVEN the populated pre-launch SQLite database and local media tree
  WHEN migration, release, and container gates run
  THEN business, user, request, showroom, offering, Expo, support, and media counts remain reconciled
  AND no reset command or destructive migration is used

Scenario: Supabase credentials are not configured
  GIVEN filesystem mode and persistent application volumes
  WHEN the production preflight runs
  THEN one-instance deployment remains supported
  AND no Supabase request is attempted

Scenario: Operator selects incomplete Supabase mode
  GIVEN MIRTPAGE_MEDIA_DRIVER is supabase
  AND one required server-only value is absent
  WHEN production preflight runs
  THEN startup fails before serving traffic
  AND no secret value is printed

Scenario: Remote checks fail
  GIVEN the launch commit was pushed
  WHEN a GitHub quality job fails
  THEN its terminal logs are inspected and the underlying defect is corrected
  AND launch readiness is not claimed from local evidence alone

Scenario: Launch preserves data while retiring Delivery
  GIVEN the demo database contains historical delivery rows
  WHEN the launch migration and application rollout complete
  THEN no active UI or API can create or read Delivery activity
  AND the historical tables remain untouched for a later separately approved cleanup
```

## Quality and operations impact

- The soft launch remains a single-replica SQLite deployment. Managed PostgreSQL
  is still required before horizontal application scaling.
- Supabase Storage may remove mutable-media volume coupling, but it does not make
  database sessions, jobs, or transactions multi-instance safe.
- Provider credentials remain deployment secrets and are excluded from videos,
  screenshots, traces, backups, Git, and user-visible errors.
- Video files are optimized for practical download size and contain only public
  fictional showroom data.

## Test plan

| Gate | Evidence |
|---|---|
| Spec and contract validation | `npm run validate:specs`, `npm run check` |
| Data-preserving operations | `npm run migrate`, `npm run backup`, `npm run test:operations` |
| Media adapters and copy plan | `npm run test:media-storage`; after private bucket configuration, `npm run migrate:media -- --dry-run` |
| Public/workspace browser workflows | `npm run test:acceptance`, capture scripts |
| Delivery retirement without destructive migration | `scripts/test-security.ts`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` |
| Production dependency/build/security | `npm run release` |
| Container persistence/privacy | `npm run test:container` |
| Remote quality | GitHub Actions `quality.yml` terminal run |

## Readiness checklist

- [x] No-reset data boundary explicit
- [x] External credentials and cutover boundary explicit
- [x] Single-instance limitation explicit
- [x] Backup, rollback, privacy, and test gates explicit
- [x] Remote evidence required before launch claim

## Completion evidence

Local filesystem-mode rehearsal passed on 2026-08-02 without reset: `npm run
migrate`, a timestamped `npm run backup`, `npm run test:operations`, `npm run
check`, ordered 10/10 `npm run test:acceptance`, `npm run release`, and `npm run
test:container`. The container used a clean bounded `npm ci`, ran as a non-root
user, passed persistent-path/origin/health checks, and the release audit found
zero production vulnerabilities. Two reviewed fictional-data demo videos were
generated and inspected.

This rollout remains in progress because MirtPage is not launching yet. A real
HTTPS deployment configuration, credential rotation, optional Supabase private
bucket copy/hash verification, scoped commit and push, and terminal GitHub
Actions evidence remain required before a launch claim.

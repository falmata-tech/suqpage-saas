---
id: DEP-027
title: Local Supabase development runtime
status: in_progress
related: [BE-024, BE-027, BE-030, DEP-023, DEP-026, ADR-0013, ADR-0014, ADR-0015]
owners: [development, backend, operations]
last_updated: 2026-08-24
change_level: L3
---

# DEP-027 - Local Supabase development runtime

## Problem and outcome

MirtPage needs one PostgreSQL application model in development and production
without allowing local reset, seed, Auth, Storage, or Realtime work to touch the
hosted Supabase project.

## Contracts

- The documented local workflow uses the repository Supabase CLI configuration
  and PostgreSQL 17.
- Local development and browser acceptance use different Supabase CLI project
  IDs, Docker resources, database volumes, and non-overlapping loopback port
  families. Browser acceptance starts and destroys only its own disposable
  stack; it never resets the developer stack or another repository's stack.
- Local application URLs and database hosts are loopback-only. Guarded setup
  rejects any remote destination before a destructive operation.
- Local Auth, private Storage, and captured email use local provider endpoints;
  production credentials are absent from local setup scripts. Realtime remains
  disabled until the optional visibility-scoped support adapter is implemented.
- Analytics, Vector buckets, Edge Runtime, Studio, and the local transaction
  pooler remain disabled because MirtPage does not depend on them in local
  development; the direct loopback PostgreSQL port is authoritative.
- SQLite is identified as compatibility and migration infrastructure, not the
  normal development application database.
- A production-mode browser server selects PostgreSQL, Supabase Auth, and
  private Supabase Storage. SQLite, local sessions, and filesystem media may
  create a one-way source fixture, but they are never the browser runtime.
- Authoritative HTTP and release smoke tests run through that isolated
  provider-backed browser runtime. The retained SQLite HTTP harness is not a
  release gate.
- GitHub's required browser job owns the provider-backed smoke. The core release
  job explicitly delegates that one stage instead of starting a duplicate
  Supabase/browser stack; local release runs it when the Supabase CLI is present.
- The standalone container gate proves image integrity and fail-closed startup
  without provider credentials. Provider-backed runtime health belongs to the
  browser job, not a SQLite container substitute.
- Application schema migration remains owned by MirtPage's reviewed PostgreSQL
  migrations; local Supabase startup never substitutes an unreviewed schema.

## Scenarios

```gherkin
Scenario: Developer starts the application
  GIVEN Docker and the local Supabase stack are healthy
  WHEN the MirtPage development server starts
  THEN it uses loopback PostgreSQL and local provider endpoints
  AND no hosted Supabase credential is required

Scenario: Local setup receives a hosted database URL
  GIVEN a reset or seed command intended for local development
  WHEN its destination is not an approved loopback Supabase endpoint
  THEN the command stops before changing any data
```

```gherkin
Scenario: Browser acceptance runs beside another Supabase project
  GIVEN another local Supabase project is already running
  WHEN MirtPage browser acceptance starts
  THEN it uses the MirtPage browser project ID and dedicated loopback ports
  AND cleanup stops only the disposable MirtPage browser project
```

## Test plan

| Gate | Evidence |
|---|---|
| Local configuration isolation | static local-runtime contract test |
| PostgreSQL schema and adapters | migrations plus PostgreSQL runtime suite |
| Local Auth and Storage | focused signup/login/upload browser smoke |
| Browser runtime parity and stack isolation | production browser acceptance against disposable Supabase plus Docker project/port assertions |
| No hosted reset | negative destination-guard test |

## Rollout and rollback

Start local Supabase, migrate and seed its disposable database, then switch the
developer environment to PostgreSQL. Keep existing SQLite files untouched for
read-only migration comparison until the explicit retirement cleanup.

## Current evidence

- The repository contains a loopback-only Supabase CLI configuration, guarded
  environment capture, PostgreSQL copy/migration commands, Auth and Storage
  migration commands, and a single `dev:local` entry point.
- Static local-runtime isolation, Auth runtime, Netlify readiness, database
  boundary, signup, and adapter gates pass. SQLite is retained only as
  compatibility and one-way migration input.
- On 2026-08-17 the healthy lean stack copied 50 tables and 3,020 rows with
  reconciled fingerprints, 120 checks, 85 foreign keys, 89 indexes, and 17
  triggers while preserving the SQLite source byte-for-byte. All 47 retained
  users were created and linked in local Auth with zero conflicts. Three
  referenced media objects were copied and read back from the private bucket.
- `/api/health`, the public route, managed password login, client workspace,
  administrator business context, showroom project history, and a private
  revision preview pass against the local provider runtime.
- `test:http` and the release HTTP stage use the disposable browser Supabase
  project rather than starting a production server on SQLite/local Auth.
- No hosted project was reset and no production credential was emitted or
  copied into the local runtime.
- On 2026-08-24 the disposable browser project again copied 50 tables and 2,738
  rows, linked all 47 retained identities, and passed production API/security
  smoke on its isolated 563xx port family. Release no longer starts an
  authoritative production smoke server on the SQLite compatibility profile.
- GitHub Actions browser job `97312645834` in run `32686559246` passed all 10
  ordered workflows against the disposable Supabase runtime. PostgreSQL and
  dependency jobs also passed; corrected core/container gate assumptions await
  the follow-up run.

## Readiness checklist

- [x] Runtime and isolation outcome are explicit
- [x] Data-destruction and hosted-project risks are addressed
- [x] Provider and schema ownership are explicit
- [x] Positive and negative scenarios are written
- [x] Evidence and rollback are planned

---
id: DEP-027
title: Local Supabase development runtime
status: in_progress
related: [FE-038, BE-024, BE-027, BE-030, BE-031, DEP-023, DEP-026, DEP-028, ADR-0013, ADR-0014, ADR-0015]
owners: [development, backend, operations]
last_updated: 2026-08-27
change_level: L3
---

# DEP-027 - Local Supabase development runtime

## Problem and outcome

AfricMade needs one PostgreSQL application model in development and production
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
- Local Google sign-in preserves the approved loopback hostname that began the
  flow. The callback returns to that same hostname and port so the PKCE verifier
  and resulting Supabase session use one cookie scope. Production ignores the
  request host and always uses the configured AfricMade origin.
- Local Auth, private Storage, and captured email use local provider endpoints;
  production credentials are absent from local setup scripts. Realtime remains
  disabled until the optional visibility-scoped support adapter is implemented.
- Local Google OAuth uses a separate Google Web client with the exact local
  application origin and local Supabase callback. Its client ID and secret live
  only in the ignored root `.env`; the local runtime exposes the Google entry
  control only when both values are present. Hosted Google credentials are not
  copied into local configuration.
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

Scenario: Developer enables local Google entry
  GIVEN a separate local Google Web client is configured in the ignored `.env`
  WHEN the local Supabase stack and AfricMade development server restart
  THEN the local provider uses `http://127.0.0.1:54321/auth/v1/callback`
  AND the login page offers Google without exposing either provider secret

Scenario: Browser starts Google sign-in on an approved alternate loopback host
  GIVEN the configured application origin is `http://127.0.0.1:3000`
  WHEN the browser starts Google sign-in through `http://localhost:3000`
  THEN the application callback uses `http://localhost:3000/auth/callback`
  AND the PKCE verifier and resulting session remain on the initiating host

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
| Loopback Auth callback scope | focused callback-origin unit and browser OAuth smoke |
| PostgreSQL schema and adapters | migrations plus PostgreSQL runtime suite |
| Local Auth and Storage | focused email/Google signup, login, callback, and upload browser smoke |
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
- On 2026-08-27 a separate local Google Web client was admitted through the
  ignored mode-`0600` `.env`. The isolated Supabase stack restarted on the
  existing 54321/54322 port family, generated a Google-enabled application
  runtime, and focused 390px Chromium proved the visible Google control routes
  to `accounts.google.com` with
  `http://127.0.0.1:54321/auth/v1/callback`. Real consent and code exchange with
  an allowlisted test user remain pending.
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

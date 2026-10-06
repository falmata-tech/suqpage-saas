---
id: DEP-027
title: Local Supabase development runtime
status: done
related: [DEP-042, DEP-031, FE-038, BE-024, BE-027, BE-030, BE-031, DEP-023, DEP-026, DEP-028, ADR-0013, ADR-0014, ADR-0015]
owners: [development, backend, operations]
last_updated: 2026-09-21
change_level: L3
---

# DEP-027 - Local Supabase development runtime


Current persistence contract: BE-035/DEP-031 and ADR-0020 supersede every retained
SQLite fixture, fallback and copy-tool exception in this specification. Only native
PostgreSQL setup/tests/archives are executable. Earlier migration-parity evidence
below is historical; current acceptance uses PostgreSQL-only fixtures.

## Problem and outcome

S17 email-only update: local Google is disabled, including runtime generation when
credentials remain present. All Auth templates use the repository Suqpage catalog.
Local SMTP targets only the existing Docker mail catcher with Suqpage sender name
and a fictional .test sender address; no external email is sent. Browser acceptance
rewrites this SMTP host to its own isolated project so messages never cross stacks.

Suqpage needs one PostgreSQL application model in development and production
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
  request host and always uses the configured Suqpage origin.
- Local Auth, private Storage, and captured email use local provider endpoints;
  production credentials are absent from local setup scripts. Realtime remains
  disabled until the optional visibility-scoped support adapter is implemented.
- Local Google OAuth uses a separate Google Web client with the exact local
  application origin and local Supabase callback. Its client ID and secret live
  only in the ignored root `.env`; the local runtime exposes the Google entry
  control only when both values are present. Hosted Google credentials are not
  copied into local configuration.
- Analytics, Vector buckets, Edge Runtime, Studio, and the local transaction
  pooler remain disabled because Suqpage does not depend on them in local
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
- Application schema migration remains owned by Suqpage's reviewed PostgreSQL
  migrations; local Supabase startup never substitutes an unreviewed schema.

## Scenarios

```gherkin
Scenario: Developer starts the application
  GIVEN Docker and the local Supabase stack are healthy
  WHEN the Suqpage development server starts
  THEN it uses loopback PostgreSQL and local provider endpoints
  AND no hosted Supabase credential is required

Scenario: Developer enables local Google entry
  GIVEN a separate local Google Web client is configured in the ignored `.env`
  WHEN the local Supabase stack and Suqpage development server restart
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
  WHEN Suqpage browser acceptance starts
  THEN it uses the Suqpage browser project ID and dedicated loopback ports
  AND cleanup stops only the disposable Suqpage browser project
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

## Standard development command correction — 2026-09-17

`npm run dev` and `npm run dev:local` must use the same guarded launcher. Both
load the existing ignored `.local/supabase-runtime.env`, require PostgreSQL and
local Supabase Auth/Storage, and reject remote provider/database destinations.
The explicit `--hostname 127.0.0.1 --port 3102` command is supported; CLI port
overrides PORT, with 3000 retained as the default. The launched application's
canonical/public origin must use that host/port. Missing configuration reports
the configure command without logging credentials. No migrations, provider
configuration, schema resets or implicit seeding occur during server startup.

GIVEN local settings WHEN either npm command starts THEN the child receives the
PostgreSQL driver and local provider settings. GIVEN explicit CLI port and PORT
WHEN launched THEN CLI port wins. GIVEN a non-loopback host/provider, invalid port
or missing settings WHEN startup is attempted THEN fail before spawning Next.

Focused evidence: scripts/test-local-dev-launcher.mjs tests the actual launcher
with a disposable fixture Next executable; test:local-supabase-readiness retains
configuration guards. Live local HTTP checks verify the real route. This nonvisual
startup fix does not approve the pending service/starter visual release.

## Automatic readiness — 2026-09-18

GIVEN existing guarded local runtime settings WHEN npm run dev runs with Docker
Desktop stopped on macOS THEN open Docker Desktop, wait at most 120 seconds for
its daemon, and start this repository's local Supabase stack if needed. Wait at
most 180 seconds for local PostgreSQL/auth readiness before spawning Next. Healthy
services are reused. Missing CLI, unsupported stopped daemon, failed startup or
readiness timeout returns actionable sanitized error without spawning Next.
GIVEN unsafe runtime settings WHEN starting THEN reject before any service command.
Never reset/seed/migrate, stop other stacks, or write hosted configuration. Initial
installation/configure is still explicit. Supabase output is captured privately
because CLI status/start output may contain credentials. Test via injected command/
readiness ports plus the real healthy local stack; no production bypass flag.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

## Explicit mobile-device development exception (DEP-042)

The default web launcher remains loopback-only. The owner authorized phone testing:
`npm run dev:mobile` supplies both `--allow-lan` and `--hostname 0.0.0.0` to bind
only the local development application to the LAN. Without that flag, the same
hostname remains rejected. PostgreSQL and server-side Supabase destinations must
still be the approved loopback ports; canonical browser URLs stay loopback. This
exception never authorizes hosted data, provider configuration or production binds.
GIVEN no explicit opt-in WHEN a non-loopback bind is supplied THEN reject it.
GIVEN the mobile command WHEN launched THEN the app is reachable from the same
network while existing database/provider target assertions stay enforced.
